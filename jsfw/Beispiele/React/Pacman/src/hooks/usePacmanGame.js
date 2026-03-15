import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_GHOSTS, INITIAL_PACMAN_INDEX, LAYOUT, MOVE_KEYS, TILE } from "../game/constants";
import {
    consumeCollectible,
    getAvailableGhostMoves,
    getNextPacmanIndex,
    hasRemainingCollectibles
} from "../game/engine";

/* ─────────────── Hilfsfunktionen ─────────────── */
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

/** Ermittelt die Blickrichtung anhand der Pfeiltaste */
const keyToDirection = (key) => {
    switch (key) {
        case "ArrowLeft":  return "left";
        case "ArrowRight": return "right";
        case "ArrowUp":    return "up";
        case "ArrowDown":  return "down";
        default:           return null;
    }
};

/** Gibt alle gültigen Indizes zurück, wo ein Bonus-Punkt platziert werden darf */
const getValidBonusIndices = (layout) =>
    layout
        .map((tile, index) => ({ tile, index }))
        .filter(({ tile }) => tile === TILE.EMPTY || tile === TILE.DOT)
        .map(({ index }) => index);

/* ─────────────── Hook ─────────────── */
export function usePacmanGame() {
    const [pacmanCurrentIndex, setPacmanCurrentIndex] = useState(INITIAL_PACMAN_INDEX);
    const [pacmanDirection, setPacmanDirection] = useState("right");
    const [grid, setGrid] = useState([...LAYOUT]);
    const [score, setScore] = useState(0);
    const [ghosts, setGhosts] = useState(
        INITIAL_GHOSTS.map((g) => ({ ...g, isScared: false }))
    );
    const [isGameOver, setIsGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);

    /* ID4: Highscore aus localStorage */
    const [highscore, setHighscore] = useState(() => {
        const stored = localStorage.getItem("highscore");
        return stored ? Number(stored) : 0;
    });

    /* ID5: Sound-Referenzen */
    const eatSound         = useRef(null);
    const powerPelletSound = useRef(null);
    const eatGhostSound    = useRef(null);
    const gameOverSound    = useRef(null);

    /* ID5: Sounds einmalig initialisieren */
    useEffect(() => {
        eatSound.current         = new Audio("sounds/pacman_chomp.wav");
        powerPelletSound.current = new Audio("sounds/pacman_eatfruit.wav");
        eatGhostSound.current    = new Audio("sounds/pacman_eatghost.wav");
        gameOverSound.current    = new Audio("sounds/pacman_death.wav");
    }, []);

    /* ─── Hilfsfunktion: Highscore aktualisieren ─── */
    const updateHighscore = useCallback((newScore) => {
        setHighscore((prev) => {
            if (newScore > prev) {
                localStorage.setItem("highscore", String(newScore));
                return newScore;
            }
            return prev;
        });
    }, []);

    /* ─── Punkt fressen ─── */
    const consumeTileAtIndex = useCallback(
        (index) => {
            setGrid((prevGrid) => {
                const { nextGrid, scoreDelta } = consumeCollectible(prevGrid, index);
                if (scoreDelta > 0) {
                    setScore((prevScore) => {
                        const newScore = prevScore + scoreDelta;
                        updateHighscore(newScore);

                        /* ID5: Sound je nach Typ */
                        if (scoreDelta === 1 && eatSound.current) {
                            eatSound.current.currentTime = 0;
                            eatSound.current.play().catch(() => {});
                        } else if (scoreDelta === 10 && powerPelletSound.current) {
                            powerPelletSound.current.currentTime = 0;
                            powerPelletSound.current.play().catch(() => {});
                        }
                        // Bonus (+50) hat keinen eigenen Sound; eatGhostSound wird separat ausgelöst
                        return newScore;
                    });
                }
                return nextGrid;
            });
        },
        [updateHighscore]
    );

    /* ─── Pac-Man bewegen ─── */
    const movePacman = useCallback(
        (key) => {
            if (isGameOver || isWin) return;

            const dir = keyToDirection(key);
            if (dir) setPacmanDirection(dir);

            setPacmanCurrentIndex((currentIndex) => {
                const nextIndex = getNextPacmanIndex(LAYOUT, currentIndex, key);
                if (nextIndex !== currentIndex) {
                    consumeTileAtIndex(nextIndex);
                }
                return nextIndex;
            });
        },
        [consumeTileAtIndex, isGameOver, isWin]
    );

    /* ─── Tastatur-Listener ─── */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!MOVE_KEYS.includes(event.key)) return;
            event.preventDefault();
            movePacman(event.key);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [movePacman]);

    /* ─── Startfeld fressen (Pac-Man-Startposition) ─── */
    useEffect(() => {
        consumeTileAtIndex(INITIAL_PACMAN_INDEX);
    }, [consumeTileAtIndex]);

    /* ─── Ghost-Bewegung ─── */
    useEffect(() => {
        if (isGameOver || isWin) return;

        const timers = INITIAL_GHOSTS.map((ghost, ghostIndex) =>
            setInterval(() => {
                setGhosts((prevGhosts) => {
                    const currentGhost = prevGhosts[ghostIndex];
                    const occupiedByOthers = new Set(
                        prevGhosts.filter((_, i) => i !== ghostIndex).map((g) => g.currentIndex)
                    );
                    const availableMoves = getAvailableGhostMoves(
                        LAYOUT,
                        currentGhost.currentIndex,
                        occupiedByOthers
                    );

                    if (availableMoves.length === 0) return prevGhosts;

                    const nextIndex = randomItem(availableMoves);
                    const nextGhosts = [...prevGhosts];
                    nextGhosts[ghostIndex] = { ...currentGhost, currentIndex: nextIndex };
                    return nextGhosts;
                });
            }, ghost.speed)
        );

        return () => timers.forEach((timer) => clearInterval(timer));
    }, [isGameOver, isWin]);

    /* ID7: Game Over – prüft ob ein NICHT-verängstigter Geist auf Pac-Man steht
       Reagiert sowohl auf Ghost-Bewegung (Ghost läuft auf Pac-Man) als auch
       auf Pac-Man-Bewegung (Pac-Man läuft auf Ghost).                          */
    useEffect(() => {
        if (isWin || isGameOver) return;

        const touchingNonScaredGhost = ghosts.some(
            (ghost) => ghost.currentIndex === pacmanCurrentIndex && !ghost.isScared
        );

        if (touchingNonScaredGhost) {
            setIsGameOver(true);
            if (gameOverSound.current) {
                gameOverSound.current.currentTime = 0;
                gameOverSound.current.play().catch(() => {});
            }
        }
    }, [ghosts, pacmanCurrentIndex, isWin, isGameOver]);

    /* ─── Scared Ghost gefressen ─── */
    useEffect(() => {
        if (isGameOver || isWin) return;

        const scaredGhostOnPacman = ghosts.find(
            (ghost) => ghost.currentIndex === pacmanCurrentIndex && ghost.isScared
        );

        if (scaredGhostOnPacman) {
            if (eatGhostSound.current) {
                eatGhostSound.current.currentTime = 0;
                eatGhostSound.current.play().catch(() => {});
            }
            setScore((prevScore) => {
                const newScore = prevScore + 100;
                updateHighscore(newScore);
                return newScore;
            });
            // Geist zurücksetzen
            setGhosts((prevGhosts) =>
                prevGhosts.map((g) =>
                    g.className === scaredGhostOnPacman.className
                        ? { ...g, currentIndex: g.startIndex, isScared: false }
                        : g
                )
            );
        }
    }, [ghosts, pacmanCurrentIndex, isGameOver, isWin, updateHighscore]);

    /* ─── Power-Pellet: Geister verängstigen ─── */
    useEffect(() => {
        const wasPowerPellet = false; // handled via scoreDelta in consumeCollectible
        // We detect power pellet consumption by score jumps of 10
        // Better: track via a dedicated state
        // eslint-disable-next-line no-unused-vars
    }, []);

    /* ID5: Power-Pellet Sound & scared ghosts via separate state */
    const [scaredUntil, setScaredUntil] = useState(0);

    const activateScaredGhosts = useCallback(() => {
        const until = Date.now() + 10000;
        setScaredUntil(until);
        setGhosts((prev) => prev.map((g) => ({ ...g, isScared: true })));
        setTimeout(() => {
            setGhosts((prev) => prev.map((g) => ({ ...g, isScared: false })));
        }, 10000);
    }, []);

    // Detect power pellet eaten: grid changes AND score jumped by 10
    const prevGridRef = useRef([...LAYOUT]);
    useEffect(() => {
        const prevGrid = prevGridRef.current;
        const powerPelletEaten = prevGrid.some(
            (tile, idx) => tile === TILE.POWER_PELLET && grid[idx] !== TILE.POWER_PELLET
        );
        if (powerPelletEaten) {
            activateScaredGhosts();
            if (powerPelletSound.current) {
                powerPelletSound.current.currentTime = 0;
                powerPelletSound.current.play().catch(() => {});
            }
        }
        prevGridRef.current = grid;
    }, [grid, activateScaredGhosts]);

    /* ─── Win-Prüfung ─── */
    useEffect(() => {
        if (!hasRemainingCollectibles(grid)) {
            setIsWin(true);
        }
    }, [grid]);

    /* ──────────────────────────────────────────────
       ID6: Bonus-Punkt System
       - Spawn alle 5 Sekunden auf einem zufälligen freien Feld
       - Bleibt 10 Sekunden sichtbar, dann weg
       - +50 Punkte wenn Pac-Man drüberläuft
    ─────────────────────────────────────────────── */
    const [bonusIndex, setBonusIndex] = useState(null);
    const bonusTimerRef = useRef(null);
    const removeTimerRef = useRef(null);

    const spawnBonus = useCallback(() => {
        const validIndices = getValidBonusIndices(LAYOUT);
        if (validIndices.length === 0) return;

        const idx = validIndices[Math.floor(Math.random() * validIndices.length)];
        setBonusIndex(idx);
        setGrid((prev) => {
            const next = [...prev];
            next[idx] = TILE.BONUS;
            return next;
        });

        removeTimerRef.current = setTimeout(() => {
            setBonusIndex(null);
            setGrid((prev) => {
                const next = [...prev];
                if (next[idx] === TILE.BONUS) next[idx] = TILE.EMPTY;
                return next;
            });
        }, 10000);
    }, []);

    useEffect(() => {
        if (isGameOver || isWin) {
            clearTimeout(bonusTimerRef.current);
            clearTimeout(removeTimerRef.current);
            return;
        }

        const scheduleSpawn = () => {
            bonusTimerRef.current = setTimeout(() => {
                spawnBonus();
                bonusTimerRef.current = setTimeout(scheduleSpawn, 15000); // 5s already used + 10s visible
            }, 5000);
        };

        scheduleSpawn();

        return () => {
            clearTimeout(bonusTimerRef.current);
            clearTimeout(removeTimerRef.current);
        };
    }, [isGameOver, isWin, spawnBonus]);

    return {
        grid,
        ghosts,
        isGameOver,
        isWin,
        pacmanCurrentIndex,
        pacmanDirection,
        score,
        highscore,
        bonusIndex,
        scaredUntil
    };
}
