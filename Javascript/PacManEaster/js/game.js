// ============================================================
// game.js — Game state machine, loop, and collision detection
// ============================================================

import {
    TILE_SIZE, COLS, ROWS, TILE, BASE_SPEED, LEVEL_SPEEDS, MODE_TIMINGS,
    FRIGHT_DURATION, FRIGHT_FLASHES, SCORE, FRUITS, PELLET_RELEASE, TOTAL_PELLETS,
    PACMAN_START, COLORS
} from './constants.js';
import { Maze } from './maze.js';
import { PacMan } from './pacman.js';
import { Ghost, GHOST_NAMES } from './ghost.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Sound } from './sound.js';
import { UI } from './ui.js';

/**
 * Game states:
 *  INTRO      — start screen shown
 *  READY      — "READY!" text, brief pause before play
 *  PLAYING    — main gameplay
 *  FRIGHT     — power pellet active (sub-state of PLAYING)
 *  DYING      — Pac-Man death animation
 *  LEVEL_DONE — level complete, maze flashing
 *  GAME_OVER  — game over screen
 */
const STATE = {
    INTRO: 'INTRO',
    READY: 'READY',
    PLAYING: 'PLAYING',
    DYING: 'DYING',
    LEVEL_DONE: 'LEVEL_DONE',
    GAME_OVER: 'GAME_OVER',
};

export class Game {
    constructor(canvas) {
        this.renderer = new Renderer(canvas);
        this.input = new Input();
        this.sound = new Sound();
        this.ui = new UI();
        this.maze = new Maze();
        this.pacman = new PacMan();
        this.ghosts = GHOST_NAMES.map(name => new Ghost(name));

        this.state = STATE.INTRO;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.pelletsEaten = 0;

        // Timers
        this._readyTimer = 0;
        this._dyingTimer = 0;
        this._levelDoneTimer = 0;
        this._frightTimer = 0;
        this._ghostsEatenInFright = 0;

        // Scatter/chase mode alternation
        this._modeTimer = 0;
        this._modeIndex = 0;
        this._currentModeType = 'scatter';

        // Fruit
        this.fruit = null;
        this._fruitTimer = 0;

        // Score popup
        this.scorePopup = null;
        this._popupTimer = 0;

        // Level done flash
        this._flashTimer = 0;
        this._flashState = false;

        // Bind inputs
        this.input.onEnter = () => this._handleStart();
        this.input.onMuteToggle = () => this.sound.toggleMute();
        this.ui.playAgainBtn.addEventListener('click', () => this._handleStart());

        // Show start screen
        this.ui.showStartScreen();
        this.ui.updateLives(this.lives);
        this.ui.updateLevel(this.level);
        this.ui.updateScore(0);

        // Start game loop
        this._lastTime = 0;
        this._animFrame = null;
        this._loop = this._loop.bind(this);
        this._animFrame = requestAnimationFrame(this._loop);
    }

    // ---- GAME LOOP ----

    _loop(timestamp) {
        const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05); // cap at 50ms
        this._lastTime = timestamp;

        this.renderer.clear();

        switch (this.state) {
            case STATE.INTRO:
                this._drawIntro();
                break;
            case STATE.READY:
                this._updateReady(dt);
                break;
            case STATE.PLAYING:
                this._updatePlaying(dt);
                break;
            case STATE.DYING:
                this._updateDying(dt);
                break;
            case STATE.LEVEL_DONE:
                this._updateLevelDone(dt);
                break;
            case STATE.GAME_OVER:
                this._drawIntro(); // just render maze behind overlay
                break;
        }

        this._animFrame = requestAnimationFrame(this._loop);
    }

    // ---- STATE: INTRO ----

    _drawIntro() {
        this.renderer.drawMaze(this.maze);
        this.renderer.drawPellets(this.maze);
    }

    // ---- HANDLE START / RESTART ----

    _handleStart() {
        if (this.state === STATE.INTRO || this.state === STATE.GAME_OVER) {
            this.sound.init();
            this.ui.hideStartScreen();
            this.ui.hideGameOver();
            this._resetGame();
            this._startReady();
        }
    }

    _resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.pelletsEaten = 0;
        this.maze.reset();
        this.ui.updateScore(0);
        this.ui.updateLives(this.lives);
        this.ui.updateLevel(this.level);
    }

    _startReady() {
        this.state = STATE.READY;
        this._readyTimer = 0;
        this.pacman.reset();
        this.ghosts.forEach(g => g.reset());
        this._setEntitySpeeds();
        this._modeTimer = 0;
        this._modeIndex = 0;
        this._currentModeType = 'scatter';
        this.fruit = null;
        this.sound.stopSiren();

        // Play intro jingle
        const introDuration = this.sound.playIntro();
        this._readyDuration = Math.max(2, (introDuration || 2000) / 1000);
    }

    // ---- STATE: READY ----

    _updateReady(dt) {
        this._readyTimer += dt;

        this.renderer.drawMaze(this.maze);
        this.renderer.drawPellets(this.maze);
        this.renderer.drawPacman(this.pacman);
        this.ghosts.forEach(g => this.renderer.drawGhost(g));
        this.renderer.drawReadyText();

        if (this._readyTimer >= this._readyDuration) {
            this.state = STATE.PLAYING;
            this.sound.startSiren(0);
        }
    }

    // ---- STATE: PLAYING ----

    _updatePlaying(dt) {
        // Update scatter/chase mode alternation
        this._updateModeTimers(dt);

        // Update fright timer
        if (this._frightTimer > 0) {
            this._frightTimer -= dt;
            const frightDur = this._getFrightDuration();
            const flashTime = frightDur * 0.3;

            // Flash ghosts near end of fright
            if (this._frightTimer <= flashTime) {
                const flashRate = 0.15;
                const flash = Math.floor(this._frightTimer / flashRate) % 2 === 0;
                this.ghosts.forEach(g => {
                    if (g.mode === 'frightened') g.flashing = flash;
                });
            }

            if (this._frightTimer <= 0) {
                this._frightTimer = 0;
                this._ghostsEatenInFright = 0;
                this.ghosts.forEach(g => g.unFrighten());
                this.sound.stopSiren();
                this.sound.startSiren(this.pelletsEaten / this.maze.totalPellets);
            }
        }

        // Handle buffered input — consume so it only applies once
        const inputDir = this.input.consume();
        if (inputDir) {
            this.pacman.setNextDirection(inputDir);
        }

        // Update Pac-Man
        this.pacman.update(dt, this.maze);

        // Update ghosts
        const blinky = this.ghosts.find(g => g.name === 'blinky');
        this.ghosts.forEach(g => {
            g.update(dt, this.maze, this.pacman, blinky, this._currentModeType);
        });

        // ---- Collisions ----

        // Pellet collision
        const pacTile = this.pacman.getTile();
        const tile = this.maze.getTile(pacTile.col, pacTile.row);

        if (tile === TILE.PELLET || tile === TILE.POWER_PELLET) {
            const isPower = tile === TILE.POWER_PELLET;
            const points = this.maze.eatPellet(pacTile.col, pacTile.row);
            this.score += points;
            this.pelletsEaten++;
            this.ui.updateScore(this.score);
            this.sound.playWaka();

            // Power pellet — frighten ghosts
            if (isPower) {
                this._frightTimer = this._getFrightDuration();
                this._ghostsEatenInFright = 0;
                this.ghosts.forEach(g => g.frighten());
                this.sound.stopSiren();
                this.sound.playFrightened();
            }

            // Check extra life
            if (this.score >= SCORE.EXTRA_LIFE_AT && this.score - points < SCORE.EXTRA_LIFE_AT) {
                this.lives++;
                this.ui.updateLives(this.lives);
                this.sound.playExtraLife();
            }

            // Check level complete
            if (this.maze.pelletsRemaining === 0) {
                this._startLevelDone();
                return;
            }

            // Fruit spawning
            if (this.pelletsEaten === 70 || this.pelletsEaten === 170) {
                this._spawnFruit();
            }

            // Update siren intensity
            this.sound.updateSiren(this.pelletsEaten / this.maze.totalPellets);
        }

        // Fruit collision
        if (this.fruit && this.fruit.active) {
            this._fruitTimer -= dt;
            if (this._fruitTimer <= 0) {
                this.fruit.active = false;
            } else if (pacTile.col === this.fruit.col && pacTile.row === this.fruit.row) {
                this.score += this.fruit.points;
                this.ui.updateScore(this.score);
                this._showScorePopup(this.fruit.points, this.fruit.x, this.fruit.y);
                this.fruit.active = false;
            }
        }

        // Ghost collision
        for (const ghost of this.ghosts) {
            if (ghost.mode === 'house' || ghost.mode === 'eaten') continue;
            const dx = Math.abs(this.pacman.x - ghost.x);
            const dy = Math.abs(this.pacman.y - ghost.y);
            if (dx < TILE_SIZE * 0.7 && dy < TILE_SIZE * 0.7) {
                if (ghost.mode === 'frightened') {
                    // Eat the ghost!
                    ghost.setEaten();
                    this._ghostsEatenInFright++;
                    const ghostPoints = SCORE.GHOST_BASE * Math.pow(2, this._ghostsEatenInFright - 1);
                    this.score += ghostPoints;
                    this.ui.updateScore(this.score);
                    this.sound.playEatGhost();
                    this._showScorePopup(ghostPoints, ghost.x, ghost.y);
                } else {
                    // Pac-Man dies
                    this._startDying();
                    return;
                }
            }
        }

        // Score popup timer
        if (this.scorePopup) {
            this._popupTimer -= dt;
            if (this._popupTimer <= 0) this.scorePopup = null;
        }

        // ---- Draw everything ----
        this.renderer.updatePowerPelletBlink(dt);
        this.renderer.drawMaze(this.maze);
        this.renderer.drawPellets(this.maze);
        this.renderer.drawFruit(this.fruit);
        this.renderer.drawPacman(this.pacman);
        this.ghosts.forEach(g => this.renderer.drawGhost(g));
        if (this.scorePopup) this.renderer.drawScorePopup(this.scorePopup);
    }

    // ---- MODE TIMERS (scatter ↔ chase) ----

    _updateModeTimers(dt) {
        if (this._frightTimer > 0) return; // paused during fright

        this._modeTimer += dt;
        const timings = this._getTimings();
        if (this._modeIndex < timings.length - 1) {
            if (this._modeTimer >= timings[this._modeIndex]) {
                this._modeTimer = 0;
                this._modeIndex++;
                this._currentModeType = this._modeIndex % 2 === 0 ? 'scatter' : 'chase';
                // Force ghosts to reverse
                this.ghosts.forEach(g => {
                    if (g.mode !== 'frightened' && g.mode !== 'house' && g.mode !== 'eaten') {
                        g._forceReverse = true;
                    }
                });
            }
        } else {
            this._currentModeType = 'chase'; // permanent chase
        }
    }

    // ---- STATE: DYING ----

    _startDying() {
        this.state = STATE.DYING;
        this._dyingTimer = 0;
        this.sound.stopSiren();
        this.sound.playDeath();
    }

    _updateDying(dt) {
        this._dyingTimer += dt;
        const progress = Math.min(this._dyingTimer / 1.5, 1);

        this.renderer.drawMaze(this.maze);
        this.renderer.drawPellets(this.maze);
        this.renderer.drawPacmanDying(this.pacman, progress);

        if (progress >= 1) {
            this.lives--;
            this.ui.updateLives(this.lives);
            if (this.lives <= 0) {
                this.state = STATE.GAME_OVER;
                this.ui.showGameOver(this.score);
            } else {
                this._startReady();
            }
        }
    }

    // ---- STATE: LEVEL DONE ----

    _startLevelDone() {
        this.state = STATE.LEVEL_DONE;
        this._levelDoneTimer = 0;
        this._flashTimer = 0;
        this._flashState = false;
        this.sound.stopSiren();
    }

    _updateLevelDone(dt) {
        this._levelDoneTimer += dt;
        this._flashTimer += dt;

        if (this._flashTimer > 0.2) {
            this._flashTimer = 0;
            this._flashState = !this._flashState;
        }

        this.renderer.clear();

        // Flash the maze walls
        const ctx = this.renderer.ctx;
        const ts = this.renderer.ts;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this.maze.grid[r][c] === TILE.WALL) {
                    ctx.fillStyle = this._flashState ? '#FFFFFF' : COLORS.WALL;
                    ctx.shadowColor = this._flashState ? '#FFFFFF' : COLORS.WALL_GLOW;
                    ctx.shadowBlur = 6;
                    const x = c * ts;
                    const y = r * ts;
                    ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
                    ctx.shadowBlur = 0;
                }
            }
        }

        this.renderer.drawPacman(this.pacman);

        if (this._levelDoneTimer >= 3) {
            this.level++;
            this.pelletsEaten = 0;
            this.maze.reset();
            this.ui.updateLevel(this.level);
            this._startReady();
        }
    }

    // ---- HELPERS ----

    _setEntitySpeeds() {
        const lvl = Math.min(this.level, LEVEL_SPEEDS.length - 1);
        const speeds = LEVEL_SPEEDS[lvl] || LEVEL_SPEEDS[1];

        this.pacman.speed = BASE_SPEED / TILE_SIZE * speeds.pacman;
        this.ghosts.forEach(g => {
            g.speed = BASE_SPEED / TILE_SIZE * speeds.ghost;
        });
    }

    _getFrightDuration() {
        const lvl = Math.min(this.level, FRIGHT_DURATION.length - 1);
        return FRIGHT_DURATION[lvl] || 0;
    }

    _getTimings() {
        const lvl = Math.min(this.level, MODE_TIMINGS.length - 1);
        return MODE_TIMINGS[lvl] || MODE_TIMINGS[1];
    }

    _spawnFruit() {
        const lvl = Math.min(this.level, FRUITS.length - 1);
        const fruitDef = FRUITS[lvl] || FRUITS[1];
        this.fruit = {
            active: true,
            col: 14,
            row: 17,
            x: 14 * TILE_SIZE + TILE_SIZE / 2,
            y: 17 * TILE_SIZE + TILE_SIZE / 2,
            color: fruitDef.color,
            points: fruitDef.points,
            name: fruitDef.name,
        };
        this._fruitTimer = 10; // 10 seconds
    }

    _showScorePopup(points, x, y) {
        this.scorePopup = { text: String(points), x, y };
        this._popupTimer = 1.5;
    }
}
