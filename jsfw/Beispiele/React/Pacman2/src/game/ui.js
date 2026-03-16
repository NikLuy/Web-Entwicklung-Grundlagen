// ============================================================
// ui.js — React Adapter UI: dispatch state updates to React
// ============================================================

export class UI {
    constructor(callbacks = {}) {
        this.onScoreUpdate = callbacks.onScoreUpdate || (() => {});
        this.onLivesUpdate = callbacks.onLivesUpdate || (() => {});
        this.onLevelUpdate = callbacks.onLevelUpdate || (() => {});
        this.onStateChange = callbacks.onStateChange || (() => {});
        
        // Load high score
        this.highScore = parseInt(localStorage.getItem('pacman-highscore') || '0', 10);
        this.onScoreUpdate(0, this.highScore);
    }

    /** Update score display */
    updateScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('pacman-highscore', String(this.highScore));
        }
        this.onScoreUpdate(score, this.highScore);
    }

    /** Update lives display */
    updateLives(lives) {
        this.onLivesUpdate(lives);
    }

    /** Update level indicator */
    updateLevel(level) {
        this.onLevelUpdate(level);
    }

    /** Show start screen */
    showStartScreen() {
        this.onStateChange('START_SCREEN');
    }

    /** Hide start screen */
    hideStartScreen() {
        this.onStateChange('PLAYING');
    }

    /** Show game over screen */
    showGameOver(score) {
        this.onStateChange('GAME_OVER');
    }

    /** Hide game over screen */
    hideGameOver() {
        this.onStateChange('PLAYING');
    }
}
