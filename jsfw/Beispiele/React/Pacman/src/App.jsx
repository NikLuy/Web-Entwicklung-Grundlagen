import "./App.css";
import { WIDTH } from "./game/constants";
import { getTileClassName } from "./game/engine";
import { usePacmanGame } from "./hooks/usePacmanGame";

function App() {
    const {
        grid,
        ghosts,
        isGameOver,
        isWin,
        pacmanCurrentIndex,
        pacmanDirection,
        score,
        highscore
    } = usePacmanGame();

    return (
        <div className="App">
            <h1>Pacman Game</h1>
            <div className="score-board">
                <h3>Score: {score}</h3>
                <h3>Highscore: {highscore}</h3>
            </div>
            {isWin && <h2 className="status-message win">You Win!</h2>}
            {isGameOver && <h2 className="status-message gameover">Game Over</h2>}
            <div
                className="grid"
                style={{ display: "grid", gridTemplateColumns: `repeat(${WIDTH}, 20px)` }}
            >
                {grid.map((tile, index) => {
                    const tileClass = getTileClassName(tile);
                    const ghostClasses = ghosts
                        .filter((ghost) => ghost.currentIndex === index)
                        .map((ghost) => ghost.className)
                        .join(" ");
                    const isPacman = index === pacmanCurrentIndex;
                    const pacmanClass = isPacman ? `pac-man pac-man-${pacmanDirection}` : "";

                    return (
                        <div
                            key={index}
                            className={`${tileClass} ${ghostClasses} ${pacmanClass}`.trim()}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default App;
