// ============================================================
// main.js — Entry point: wire everything together
// ============================================================

import { Game } from './game.js';

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Create game instance (handles everything internally)
    const game = new Game(canvas);

    // Expose for debugging
    window.__pacman = game;
});
