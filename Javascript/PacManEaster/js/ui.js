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

    /** Update lives display with mini Easter bunny icons */
    updateLives(lives) {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 20;
            canvas.height = 26;
            canvas.className = 'life-icon';
            const ctx = canvas.getContext('2d');
            const r  = 7;
            const cx = 10;
            const cy = 18;

            // Left ear
            ctx.fillStyle = '#F0E8D0';
            ctx.beginPath();
            ctx.ellipse(cx - 3, cy - r - 6, 2.5, 5.5, -0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.ellipse(cx - 3, cy - r - 6, 1.3, 3.5, -0.12, 0, Math.PI * 2);
            ctx.fill();

            // Right ear
            ctx.fillStyle = '#F0E8D0';
            ctx.beginPath();
            ctx.ellipse(cx + 3, cy - r - 6, 2.5, 5.5, 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.ellipse(cx + 3, cy - r - 6, 1.3, 3.5, 0.12, 0, Math.PI * 2);
            ctx.fill();

            // Body
            ctx.fillStyle = '#F0E8D0';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(cx - 2, cy - 2, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + 2, cy - 2, 1, 0, Math.PI * 2);
            ctx.fill();

            // Nose
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.arc(cx, cy + 1, 1, 0, Math.PI * 2);
            ctx.fill();

            this.livesContainer.appendChild(canvas);
        }
    }

    /** Update level indicator with Easter egg icons */
    updateLevel(level) {
        this.levelContainer.innerHTML = '';
        const eggColors = ['#FF6B6B', '#FFD700', '#8B4513', '#FF6600', '#4CAF50'];
        const displayLevel = Math.min(level, 5);
        for (let i = 0; i < displayLevel; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 22;
            canvas.className = 'fruit-icon';
            const ctx = canvas.getContext('2d');
            const color = eggColors[i] || '#FFFFFF';

            // Egg body
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.ellipse(8, 12, 5, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Decorative stripe
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(3, 12);
            ctx.lineTo(13, 12);
            ctx.stroke();

            this.levelContainer.appendChild(canvas);
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
