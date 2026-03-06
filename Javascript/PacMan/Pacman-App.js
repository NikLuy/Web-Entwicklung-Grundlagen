// Globale Variablen für das Spiel
let width;           // Breite des Spielfelds
let scoreDisplay;    // Element zur Anzeige des Punktestands
/* ID4:Highscore*/
let highscoreDisplay; // Element zur Anzeige des Highscores
let highscore;       // Bester Punktestand (persistent)
let score;           // Aktueller Punktestand
let layout;         // Layout/Aufbau des Spielfelds
let grid;           // Das Spielfeld-Container-Element
let squares = [];    // Array für alle Felder des Spiels
let pacmanCurrentIndex; // Aktuelle Position von Pacman
let ghosts;         // Array für alle Geister
let pacman;         // Pacman-Element
/* ID5: Soundeffekte fuer Spielevents */
let eatSound;
let powerPelletSound;
let eatGhostSound;
let gameOverSound;

/* ID6: Aktuelle Position des Bonus-Punkts (null = keiner aktiv) */
let bonusPointIndex = null;
let bonusSpawnTimerId = NaN;
let bonusRemoveTimerId = NaN;
let bonusSpawnerActive = false;

// Aktuelle Blickrichtung von Pac-Man
let pacmanDirection = "right";

// Event Listener für das Laden des DOM
document.addEventListener("DOMContentLoaded", initializeGame);

/**
 * Initialisiert das komplette Spiel
 * Setzt Grundwerte und erstellt das Spielfeld
 */
function initializeGame() {
    scoreDisplay = document.getElementById("score");
    /* ID4: Highscore-Anzeigeelement initialisieren */
    highscoreDisplay = document.getElementById("highscore");
    width = 28;    // Setzt die Breite auf 28 Felder
    score = 0;     // Initialisiert den Score mit 0

    /* ID4: Highscore wird persistent aus dem Browser-Speicher gelesen */
    highscore = localStorage.getItem("highscore");
    highscore = highscore ? Number(highscore) : 0;
    scoreDisplay.textContent = score;

    highscoreDisplay.textContent = highscore;

    /* ID5: Sounddateien aus dem sounds-Ordner laden */
    eatSound = new Audio("sounds/pacman_chomp.wav");
    powerPelletSound = new Audio("sounds/pacman_eatfruit.wav");
    eatGhostSound = new Audio("sounds/pacman_eatghost.wav");
    gameOverSound = new Audio("sounds/pacman_death.wav");

    grid = document.querySelector(".grid");
    console.log("initialize gridstyle: "+grid);
    
    // Layout-Array definiert das Spielfeld:
    // 0 - pac-dots (Punkte)
    // 1 - wall (Wände)
    // 2 - ghost-lair (Geister-Zuhause)
    // 3 - power-pellet (Power-Pillen)
    // 4 - empty (Leere Felder)
    layout = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ];

    createBoard();                  // Erstellt das Spielfeld
    createPacman(490);             // Erstellt Pacman an Startposition
    /* ID6: Bonus-Punkt-Spawner starten */
    startBonusPointSpawner();
    pacman = document.querySelector('.pac-man');
    document.addEventListener("keyup", movePacman)  // Event Listener für Tastatureingaben
   
    ghosts = initializeGhosts();   // Initialisiert die Geister
    ghosts.forEach((ghost) => moveGhost(ghost));  // Startet die Bewegung der Geister
}

/* ID6: Startet den Bonus-Zyklus per setTimeout (5s Spawn, 10s sichtbar, 5s Pause) */
function startBonusPointSpawner() {
    bonusSpawnerActive = true;
    scheduleNextBonusSpawn();
}

/* ID6: Stoppt Bonus-Timer und entfernt einen evtl. sichtbaren Bonus-Punkt */
function stopBonusPointSpawner() {
    bonusSpawnerActive = false;
    clearInterval(bonusSpawnTimerId);
    clearTimeout(bonusSpawnTimerId);
    clearTimeout(bonusRemoveTimerId);
    removeBonusPoint();
}

/* ID6: Plant den naechsten Spawn in 5 Sekunden */
function scheduleNextBonusSpawn() {
    clearTimeout(bonusSpawnTimerId);

    if (!bonusSpawnerActive) {
        return;
    }

    bonusSpawnTimerId = setTimeout(() => {
        if (!bonusSpawnerActive) {
            return;
        }

        const hasSpawned = spawnBonusPoint();
        if (!hasSpawned) {
            scheduleNextBonusSpawn();
            return;
        }

        bonusRemoveTimerId = setTimeout(() => {
            removeBonusPoint();
            scheduleNextBonusSpawn();
        }, 10000);
    }, 5000);
}

/* ID6: Platziert den Bonus-Punkt auf einem gueltigen Feld */
function spawnBonusPoint() {
    removeBonusPoint();

    const validIndices = squares
        .map((square, index) => ({ square, index }))
        .filter(({ square }) =>
            !square.classList.contains("wall") &&
            !square.classList.contains("ghost-lair") &&
            !square.classList.contains("ghost") &&
            !square.classList.contains("pac-man") &&
            !square.classList.contains("bonus-point")
        )
        .map(({ index }) => index);

    if (validIndices.length === 0) {
        return false;
    }

    bonusPointIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    squares[bonusPointIndex].classList.add("bonus-point");
    return true;
}

/* ID6: Entfernt den Bonus-Punkt, falls aktiv */
function removeBonusPoint() {
    if (bonusPointIndex === null) {
        return;
    }

    squares[bonusPointIndex].classList.remove("bonus-point");
    bonusPointIndex = null;
}

/* ID6: Gibt 50 Bonuspunkte, wenn Pac-Man den Bonus-Punkt isst */
function handleBonusPointEaten(currentIndex) {
    if (squares[currentIndex].classList.contains("bonus-point")) {
        score += 50;
        scoreDisplay.textContent = score;
        updateHighscore();
        clearTimeout(bonusRemoveTimerId);
        removeBonusPoint();
        scheduleNextBonusSpawn();
    }
}

/* ID4: Aktualisiert den Highscore, speichert ihn persistent und zeigt ihn an */
function updateHighscore() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", String(highscore));
    }
    highscoreDisplay.textContent = highscore;
}

/**
 * Erstellt das Spielfeld basierend auf dem Layout
 */
function createBoard() {
    layout.forEach((cell, index) => {
        const square = document.createElement("div");  // Erstellt ein neues Div-Element
        square.id = index;                            // Setzt die ID
        grid.appendChild(square);                     // Fügt es zum Grid hinzu
        squares.push(square);                         // Speichert es im squares Array
        addClassToSquare(cell, square);              // Fügt die entsprechende Klasse hinzu
    });
}

/**
 * Fügt dem übergebenen Feld die entsprechende CSS-Klasse hinzu
 * @param {number} cell - Zellentyp aus dem Layout
 * @param {HTMLElement} square - Das DOM-Element der Zelle
 */
function addClassToSquare(cell, square) {
    switch (cell) {
        case 0:
            square.classList.add("pac-dot");
            break;
        case 1:
            square.classList.add("wall");
            break;
        case 2:
            square.classList.add("ghost-lair");
            break;
        case 3:
            square.classList.add("power-pellet");
            break;
    }
}

/**
 * Erstellt Pacman an der übergebenen Startposition
 * @param {number} startIndex - Startposition von Pacman
 * @returns {number} - Die Startposition
 */
function createPacman(startIndex) {
    pacmanCurrentIndex = startIndex;
    placePacmanAtCurrentIndex();
    return startIndex;
}

// Entfernt Pac-Man inkl. Richtungs-Klassen von einem Feld
function removePacmanFromSquare(index) {
    squares[index].classList.remove(
        "pac-man",
        "pac-man-right",
        "pac-man-left",
        "pac-man-up",
        "pac-man-down"
    );
}

// Setzt Pac-Man inkl. aktueller Blickrichtung auf das aktuelle Feld
function placePacmanAtCurrentIndex() {
    squares[pacmanCurrentIndex].classList.add("pac-man", `pac-man-${pacmanDirection}`);
}

/**
 * Steuert die Bewegung von Pacman basierend auf Tastatureingaben
 * @param {Event} e - Tastatur-Event
 */
function movePacman(e) {
    removePacmanFromSquare(pacmanCurrentIndex); // Entfernt Pac-Man von aktueller Position
    
    // Bewegt Pacman je nach Tastatureingabe
    switch (e.key) {
        case "ArrowLeft":
            pacmanCurrentIndex = moveLeft(pacmanCurrentIndex);
            pacmanDirection = "left";
            break;
        case "ArrowUp":
            pacmanCurrentIndex = moveUp(pacmanCurrentIndex);
            pacmanDirection = "up";
            break;
        case "ArrowRight":
            pacmanCurrentIndex = moveRight(pacmanCurrentIndex);
            pacmanDirection = "right";
            break;
        case "ArrowDown":
            pacmanCurrentIndex = moveDown(pacmanCurrentIndex);
            pacmanDirection = "down";
            break;
        default:
            // Ignoriere andere Tasten
            break;
    }

    placePacmanAtCurrentIndex(); // Setzt Pac-Man an neue Position
    handlePacDotEaten(pacmanCurrentIndex);                // Prüft auf gefressene Punkte
    handlePowerPelletEaten(pacmanCurrentIndex);           // Prüft auf gefressene Power-Pillen
    /* ID6: Prueft auf gefressenen Bonus-Punkt */
    handleBonusPointEaten(pacmanCurrentIndex);
    checkForGameOver(pacmanCurrentIndex);                 // Prüft auf Game Over
    checkForWin();                                        // Prüft auf Sieg
}

/**
 * Bewegt Pacman nach links, wenn möglich
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 * @returns {number} - Neue Position von Pacman
 */
function moveLeft(pacmanCurrentIndex) {
    // Prüft ob Bewegung nach links möglich ist (nicht am linken Rand und kein Hindernis)
    if (pacmanCurrentIndex % width !== 0 && !isBlocked(pacmanCurrentIndex - 1)) {
        return pacmanCurrentIndex - 1;
    }
    return pacmanCurrentIndex;
}

/**
 * Bewegt Pacman nach oben, wenn möglich
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 * @returns {number} - Neue Position von Pacman
 */
function moveUp(pacmanCurrentIndex) {
    // Prüft ob Bewegung nach oben möglich ist (nicht am oberen Rand und kein Hindernis)
    if (pacmanCurrentIndex - width >= 0 && !isBlocked(pacmanCurrentIndex - width)) {
        return pacmanCurrentIndex - width;
    }
    return pacmanCurrentIndex;
}

/**
 * Bewegt Pacman nach rechts, wenn möglich
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 * @returns {number} - Neue Position von Pacman
 */
function moveRight(pacmanCurrentIndex) {
    // Prüft ob Bewegung nach rechts möglich ist (nicht am rechten Rand und kein Hindernis)
    if (pacmanCurrentIndex % width < width - 1 && !isBlocked(pacmanCurrentIndex + 1)) {
        return pacmanCurrentIndex + 1;
    }
    return pacmanCurrentIndex;
}

/**
 * Bewegt Pacman nach unten, wenn möglich
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 * @returns {number} - Neue Position von Pacman
 */
function moveDown(pacmanCurrentIndex) {
    // Prüft ob Bewegung nach unten möglich ist (nicht am unteren Rand und kein Hindernis)
    if (pacmanCurrentIndex + width < width * width && !isBlocked(pacmanCurrentIndex + width)) {
        return pacmanCurrentIndex + width;
    }
    return pacmanCurrentIndex;
}

/**
 * Prüft ob ein Feld blockiert ist (Wand oder Geister-Zuhause)
 * @param {number} index - Zu prüfende Position
 * @returns {boolean} - true wenn blockiert, false wenn frei
 */
function isBlocked(index) {
    return (
        squares[index].classList.contains("wall") ||
        squares[index].classList.contains("ghost-lair")
    );
}

/**
 * Verarbeitet das Fressen eines Pac-Dots
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 */
function handlePacDotEaten(pacmanCurrentIndex) {
    if (squares[pacmanCurrentIndex].classList.contains("pac-dot")) {
        /* ID5: Chomp-Sound beim Fressen eines Pac-Dots */
        eatSound.currentTime = 0;
        eatSound.play();
        score++;
        /* ID4: Bei jeder Score-Aenderung Anzeige + Highscore aktualisieren */
        scoreDisplay.textContent = score;
        updateHighscore();
        squares[pacmanCurrentIndex].classList.remove("pac-dot");
    }
}

/**
 * Verarbeitet das Fressen einer Power-Pille
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 */
function handlePowerPelletEaten(pacmanCurrentIndex) {
    if (squares[pacmanCurrentIndex].classList.contains("power-pellet")) {
        /* ID5: Sound beim Fressen eines Power-Pellets */
        powerPelletSound.currentTime = 0;
        powerPelletSound.play();
        score += 10;
        /* ID4: Bei jeder Score-Aenderung Anzeige + Highscore aktualisieren */
        scoreDisplay.textContent = score;
        updateHighscore();
        scareGhosts();
        setTimeout(unScareGhosts, 10000);
        squares[pacmanCurrentIndex].classList.remove("power-pellet");
    }
}

/**
 * Macht alle Geister verwundbar
 */
function scareGhosts() {
    ghosts.forEach((ghost) => (ghost.isScared = true));
}

/**
 * Macht alle Geister wieder unverwundbar
 */
function unScareGhosts() {
    ghosts.forEach((ghost) => (ghost.isScared = false));
}

/**
 * Prüft ob das Spiel verloren ist (Kollision mit nicht-verwundbarem Geist)
 * @param {number} pacmanCurrentIndex - Aktuelle Position von Pacman
 */
function checkForGameOver(pacmanCurrentIndex) {
    if (
        squares[pacmanCurrentIndex].classList.contains("ghost") &&
        !squares[pacmanCurrentIndex].classList.contains("scared-ghost")
    ) {
        /* ID6: Bonus-Mechanik bei Spielende stoppen */
        stopBonusPointSpawner();
        ghosts.forEach((ghost) => clearInterval(ghost.timerId));
        document.removeEventListener("keyup", movePacman);
        setTimeout(() => alert("Game Over"), 500);
        /* ID5: Game-Over-Sound abspielen */
        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }
}

/**
 * Prüft ob das Spiel gewonnen wurde (274 Punkte erreicht)
 */
function checkForWin() {
    if (score >= 274) {
        /* ID6: Bonus-Mechanik bei Spielende stoppen */
        stopBonusPointSpawner();
        ghosts.forEach((ghost) => clearInterval(ghost.timerId));
        document.removeEventListener("keyup", movePacman);
        setTimeout(() => alert("You have WON!"), 500);
    }
}

/**
 * Initialisiert die vier Geister mit ihren Startpositionen und Geschwindigkeiten
 * @returns {Array} Array mit den vier Geister-Objekten
 */
function initializeGhosts() {
    return [
        new Ghost("blinky", 348, 250),
        new Ghost("pinky", 376, 400),
        new Ghost("inky", 351, 300),
        new Ghost("clyde", 379, 500),
    ];
}

/**
 * Geister-Konstruktor-Funktion
 * @param {string} className - CSS-Klassenname des Geistes
 * @param {number} startIndex - Startposition des Geistes
 * @param {number} speed - Bewegungsgeschwindigkeit des Geistes
 */
function Ghost(className, startIndex, speed) {
    this.className = className;
    this.startIndex = startIndex;
    this.speed = speed;
    this.currentIndex = startIndex;
    this.isScared = false;
    this.timerId = NaN;

    squares[this.currentIndex].classList.add(this.className, "ghost");
}

/**
 * Steuert die Bewegung eines Geistes
 * @param {Object} ghost - Das Geist-Objekt das bewegt werden soll
 */
function moveGhost(ghost) {
    const directions = [-1, 1, width, -width];  // Links, Rechts, Unten, Oben
    let direction = directions[Math.floor(Math.random() * directions.length)];

    ghost.timerId = setInterval(() => {
        if (canMoveToSquare(ghost.currentIndex + direction)) {
            moveGhostToNewSquare(ghost, direction);
        } else {
            direction = directions[Math.floor(Math.random() * directions.length)];
        }
        /* ID7: Game Over auch pruefen, wenn ein Geist auf Pac-Man laeuft */
        checkForGameOver(pacmanCurrentIndex);
        checkGhostCollision(ghost);
    }, ghost.speed);
}

/**
 * Prüft ob ein Geist sich auf ein bestimmtes Feld bewegen kann
 * @param {number} index - Zielposition
 * @returns {boolean} - true wenn Bewegung möglich, false wenn nicht
 */
function canMoveToSquare(index) {
    return (
        !squares[index].classList.contains("ghost") &&
        !squares[index].classList.contains("wall")
    );
}

/**
 * Bewegt einen Geist auf eine neue Position
 * @param {Object} ghost - Das zu bewegende Geist-Objekt
 * @param {number} direction - Bewegungsrichtung
 */
function moveGhostToNewSquare(ghost, direction) {
    squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost");
    ghost.currentIndex += direction;
    squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
}

/**
 * Prüft auf Kollision zwischen Pacman und einem verwundbaren Geist
 * @param {Object} ghost - Das zu prüfende Geist-Objekt
 */
function checkGhostCollision(ghost) {
    /* ID7: Kollision gegen korrekte Pac-Man-Klasse pruefen */
    if (ghost.isScared && squares[ghost.currentIndex].classList.contains("pac-man")) {
        /* ID5: Sound wenn ein verwundbarer Geist gefressen wird */
        eatGhostSound.currentTime = 0;
        eatGhostSound.play();
        resetGhostPosition(ghost);
        score += 100;
        /* ID4: Bei jeder Score-Aenderung Anzeige + Highscore aktualisieren */
        scoreDisplay.textContent = score;
        updateHighscore();
    }
}

/**
 * Setzt einen Geist auf seine Startposition zurück
 * @param {Object} ghost - Das zurückzusetzende Geist-Objekt
 */
function resetGhostPosition(ghost) {
    squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost");
    ghost.currentIndex = ghost.startIndex;
    squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
}