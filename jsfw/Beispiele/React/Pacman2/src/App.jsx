import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Game } from './game/game';

function App() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    // React state for HUD
    const [score, setScore] = useState(0);
    const [highscore, setHighscore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState('START_SCREEN'); // START_SCREEN, PLAYING, GAME_OVER

    useEffect(() => {
        if (!canvasRef.current || gameRef.current) return;

        // Initialize game with React callbacks for UI updates
        const game = new Game(canvasRef.current, {
            onScoreUpdate: (newScore, newHighscore) => {
                setScore(newScore);
                setHighscore(newHighscore);
            },
            onLivesUpdate: (newLives) => setLives(newLives),
            onLevelUpdate: (newLevel) => setLevel(newLevel),
            onStateChange: (newState) => {
                console.log('GameState Changed to:', newState);
                setGameState(newState);
            }
        });

        gameRef.current = game;

        // Cleanup on unmount
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        };
    }, []);

    const handlePlayAgain = () => {
        if (gameRef.current) {
            gameRef.current.triggerStart();
        }
    };

    return (
        <div id="game-wrapper">
            {/* HUD Top */}
            <div id="hud">
                <div id="hud-score">
                    <span className="hud-label">SCORE</span>
                    <span id="score-value">{score}</span>
                </div>
                <div id="hud-highscore">
                    <span className="hud-label">HIGH SCORE</span>
                    <span id="highscore-value">{highscore}</span>
                </div>
            </div>

            {/* Canvas Container */}
            <div id="canvas-container">
                <canvas ref={canvasRef} id="game-canvas" width="896" height="992"></canvas>
            </div>

            {/* HUD Bottom */}
            <div id="hud-bottom">
                <div id="lives-container">
                    {Array.from({ length: lives }).map((_, i) => (
                        <canvas key={i} className="life-icon" width="20" height="20" ref={canvas => {
                            if (canvas) {
                                const ctx = canvas.getContext('2d');
                                ctx.clearRect(0,0,20,20);
                                ctx.fillStyle = '#FFFF00';
                                ctx.beginPath();
                                ctx.arc(10, 10, 8, 0.25, Math.PI * 2 - 0.25);
                                ctx.lineTo(10, 10);
                                ctx.closePath();
                                ctx.fill();
                            }
                        }}/>
                    ))}
                </div>
                <div id="level-container">
                    {Array.from({ length: Math.min(level, 5) }).map((_, i) => {
                        const colors = ['#FF0000', '#FF6384', '#FFA500', '#FF0000', '#00FF00'];
                        const color = colors[i] || '#FFFFFF';
                        return (
                            <div key={i} className="fruit-icon" style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: color, boxShadow: `0 0 6px ${color}`
                            }} />
                        );
                    })}
                </div>
            </div>

            {/* Overlays */}
            {gameState === 'START_SCREEN' && (
                <div id="start-screen" className="overlay">
                    <div className="overlay-content">
                        <h1 className="title-glow">PAC-MAN</h1>
                        <p className="blink">PRESS ENTER TO START</p>
                        <div className="controls-info">
                            <p>🕹️ Arrow Keys / WASD to move</p>
                            <p>📱 Swipe on mobile</p>
                            <p>🔇 M to toggle sound</p>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div id="game-over-screen" className="overlay">
                    <div className="overlay-content glass-card">
                        <h2 className="game-over-text">GAME OVER</h2>
                        <p className="final-score">SCORE: <span id="final-score-value">{score}</span></p>
                        <button id="play-again-btn" onClick={handlePlayAgain}>PLAY AGAIN</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
