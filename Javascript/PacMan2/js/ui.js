// ============================================================
// ui.js — DOM-based UI: overlays, HUD updates, and lives display
// ============================================================

import { TILE_SIZE, SCALE } from './constants.js';

export class UI {
    constructor() {
        this.scoreEl = document.getElementById('score-value');
        this.highScoreEl = document.getElementById('highscore-value');
        this.livesContainer = document.getElementById('lives-container');
        this.levelContainer = document.getElementById('level-container');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score-value');
        this.playAgainBtn = document.getElementById('play-again-btn');

        // Load high score
        this.highScore = parseInt(localStorage.getItem('pacman-highscore') || '0', 10);
        this.highScoreEl.textContent = this.highScore;
    }

    /** Update score display */
    updateScore(score) {
        this.scoreEl.textContent = score;
        if (score > this.highScore) {
            this.highScore = score;
            this.highScoreEl.textContent = this.highScore;
            localStorage.setItem('pacman-highscore', String(this.highScore));
        }
    }

    /** Update lives display with mini Pac-Man icons */
    updateLives(lives) {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 20;
            canvas.height = 20;
            canvas.className = 'life-icon';
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(10, 10, 8, 0.25, Math.PI * 2 - 0.25);
            ctx.lineTo(10, 10);
            ctx.closePath();
            ctx.fill();
            this.livesContainer.appendChild(canvas);
        }
    }

    /** Update level indicator with fruit icons */
    updateLevel(level) {
        this.levelContainer.innerHTML = '';
        const fruitColors = ['#FF0000', '#FF6384', '#FFA500', '#FF0000', '#00FF00'];
        const displayLevel = Math.min(level, 5);
        for (let i = 0; i < displayLevel; i++) {
            const dot = document.createElement('div');
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.borderRadius = '50%';
            dot.style.background = fruitColors[i] || '#FFFFFF';
            dot.style.boxShadow = `0 0 6px ${fruitColors[i] || '#FFFFFF'}`;
            dot.className = 'fruit-icon';
            this.levelContainer.appendChild(dot);
        }
    }

    /** Show start screen */
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    /** Hide start screen */
    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    /** Show game over screen */
    showGameOver(score) {
        this.finalScoreEl.textContent = score;
        this.gameOverScreen.classList.remove('hidden');
    }

    /** Hide game over screen */
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
}
