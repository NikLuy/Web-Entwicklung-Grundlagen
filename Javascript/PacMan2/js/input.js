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
        window.addEventListener('keydown', (e) => {
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
        });
    }

    _setupTouch() {
        let startX = 0, startY = 0;
        const MIN_SWIPE = 30;

        window.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDx < MIN_SWIPE && absDy < MIN_SWIPE) {
                // Tap = enter
                if (this.onEnter) this.onEnter();
                return;
            }

            if (absDx > absDy) {
                this.direction = dx > 0 ? DIR.RIGHT : DIR.LEFT;
            } else {
                this.direction = dy > 0 ? DIR.DOWN : DIR.UP;
            }
        }, { passive: true });
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
