// ============================================================
// input.js — Keyboard and touch/swipe input handling
// ============================================================

import { DIR } from './constants.js';

export class Input {
    constructor() {
        this.direction = null;
        this._setupKeyboard();
        this._setupTouch();
        this.onEnter = null;

        /** Callback for mute toggle */
        this.onMuteToggle = null;
    }

    _setupKeyboard() {
        this.keyDownHandler = (e) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': this.direction = DIR.UP; e.preventDefault(); break;
                case 'ArrowDown': case 's': case 'S': this.direction = DIR.DOWN; e.preventDefault(); break;
                case 'ArrowLeft': case 'a': case 'A': this.direction = DIR.LEFT; e.preventDefault(); break;
                case 'ArrowRight': case 'd': case 'D': this.direction = DIR.RIGHT; e.preventDefault(); break;
                case 'Enter':
                    if (this.onEnter) this.onEnter();
                    e.preventDefault();
                    break;
                case 'm': case 'M':
                    if (this.onMuteToggle) this.onMuteToggle();
                    break;
            }
        };
        window.addEventListener('keydown', this.keyDownHandler);
    }

    _setupTouch() {
        this.touchStartHandler = (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        };

        this.touchEndHandler = (e) => {
            const dx = e.changedTouches[0].clientX - this.startX;
            const dy = e.changedTouches[0].clientY - this.startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDx < 30 && absDy < 30) {
                // Tap = enter
                if (this.onEnter) this.onEnter();
                return;
            }

            if (absDx > absDy) {
                this.direction = dx > 0 ? DIR.RIGHT : DIR.LEFT;
            } else {
                this.direction = dy > 0 ? DIR.DOWN : DIR.UP;
            }
        };

        window.addEventListener('touchstart', this.touchStartHandler, { passive: true });
        window.addEventListener('touchend', this.touchEndHandler, { passive: true });
    }

    destroy() {
        if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
        if (this.touchStartHandler) window.removeEventListener('touchstart', this.touchStartHandler);
        if (this.touchEndHandler) window.removeEventListener('touchend', this.touchEndHandler);
    }

    /** Consume the buffered direction (returns it and clears) */
    consume() {
        const dir = this.direction;
        this.direction = null;
        return dir;
    }

    /** Peek at the buffered direction without consuming */
    peek() {
        return this.direction;
    }
}
