// ============================================================
// renderer.js — Canvas drawing for maze, entities, and effects
// ============================================================

import { TILE_SIZE, COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT, SCALE, COLORS, GHOST_COLORS, TILE } from './constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = CANVAS_WIDTH * SCALE;
        this.canvas.height = CANVAS_HEIGHT * SCALE;
        this.ctx = canvas.getContext('2d');
        this.ctx.scale(SCALE, SCALE);

        // Pre-calculate scaled tile
        this.ts = TILE_SIZE;

        // Power pellet blink
        this.powerPelletVisible = true;
        this._ppTimer = 0;
    }

    /** Clear the canvas */
    clear() {
        this.ctx.fillStyle = COLORS.BG;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    /** Update power pellet blink timer */
    updatePowerPelletBlink(dt) {
        this._ppTimer += dt;
        if (this._ppTimer >= 0.15) {
            this._ppTimer = 0;
            this.powerPelletVisible = !this.powerPelletVisible;
        }
    }

    // ---- MAZE DRAWING ----

    drawMaze(maze) {
        const ctx = this.ctx;
        const ts = this.ts;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = maze.grid[r][c];
                const x = c * ts;
                const y = r * ts;

                if (tile === TILE.WALL) {
                    this._drawWallTile(ctx, maze, c, r, x, y, ts);
                } else if (tile === TILE.GHOST_DOOR) {
                    ctx.fillStyle = '#FFB8FF';
                    ctx.fillRect(x, y + ts / 2 - 1, ts, 3);
                }
            }
        }
    }

    _drawWallTile(ctx, maze, col, row, x, y, ts) {
        ctx.fillStyle = COLORS.WALL;
        ctx.shadowColor = COLORS.WALL_GLOW;
        ctx.shadowBlur = 6;

        const margin = 2;
        const top = row > 0 && maze.grid[row - 1][col] === TILE.WALL;
        const bottom = row < ROWS - 1 && maze.grid[row + 1][col] === TILE.WALL;
        const left = col > 0 && maze.grid[row][col - 1] === TILE.WALL;
        const right = col < COLS - 1 && maze.grid[row][col + 1] === TILE.WALL;

        // Draw rounded-ish wall segments based on neighbours
        const bx = x + margin;
        const by = y + margin;
        const bw = ts - margin * 2;
        const bh = ts - margin * 2;

        // Core block
        ctx.fillRect(bx, by, bw, bh);

        // Extend to neighbours
        if (top) ctx.fillRect(bx, y, bw, margin);
        if (bottom) ctx.fillRect(bx, y + ts - margin, bw, margin);
        if (left) ctx.fillRect(x, by, margin, bh);
        if (right) ctx.fillRect(x + ts - margin, by, margin, bh);

        // Fill corners where both adjacent walls exist
        if (top && left && row > 0 && col > 0 && maze.grid[row - 1][col - 1] === TILE.WALL) {
            ctx.fillRect(x, y, margin, margin);
        }
        if (top && right && row > 0 && col < COLS - 1 && maze.grid[row - 1][col + 1] === TILE.WALL) {
            ctx.fillRect(x + ts - margin, y, margin, margin);
        }
        if (bottom && left && row < ROWS - 1 && col > 0 && maze.grid[row + 1][col - 1] === TILE.WALL) {
            ctx.fillRect(x, y + ts - margin, margin, margin);
        }
        if (bottom && right && row < ROWS - 1 && col < COLS - 1 && maze.grid[row + 1][col + 1] === TILE.WALL) {
            ctx.fillRect(x + ts - margin, y + ts - margin, margin, margin);
        }

        ctx.shadowBlur = 0;
    }

    // ---- PELLETS ----

    drawPellets(maze) {
        const ctx = this.ctx;
        const ts = this.ts;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = maze.grid[r][c];
                const cx = c * ts + ts / 2;
                const cy = r * ts + ts / 2;

                if (tile === TILE.PELLET) {
                    ctx.fillStyle = COLORS.PELLET;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === TILE.POWER_PELLET && this.powerPelletVisible) {
                    ctx.fillStyle = COLORS.POWER_PELLET;
                    ctx.shadowColor = COLORS.POWER_PELLET;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }

    // ---- PAC-MAN ----

    drawPacman(pacman) {
        const ctx = this.ctx;
        const cx = pacman.x;
        const cy = pacman.y;
        const radius = this.ts / 2 - 1;

        // Direction angle
        let baseAngle = 0;
        if (pacman.dir.x === 1) baseAngle = 0;
        if (pacman.dir.x === -1) baseAngle = Math.PI;
        if (pacman.dir.y === -1) baseAngle = -Math.PI / 2;
        if (pacman.dir.y === 1) baseAngle = Math.PI / 2;

        const mouth = pacman.mouthAngle;

        ctx.fillStyle = COLORS.PACMAN;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, baseAngle + mouth, baseAngle + Math.PI * 2 - mouth);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /** Death animation: Pac-Man shrinks upward */
    drawPacmanDying(pacman, progress) {
        const ctx = this.ctx;
        const cx = pacman.x;
        const cy = pacman.y;
        const radius = this.ts / 2 - 1;

        // Progress 0→1: mouth opens all the way then shrinks
        const startAngle = Math.PI / 2 + progress * Math.PI;
        const endAngle = Math.PI / 2 - progress * Math.PI;

        ctx.fillStyle = COLORS.PACMAN;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 6;

        if (progress < 0.8) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // ---- GHOSTS ----

    drawGhost(ghost) {
        const ctx = this.ctx;
        const cx = ghost.x;
        const cy = ghost.y;
        const ts = this.ts;
        const radius = ts / 2 - 1;

        let bodyColor;
        if (ghost.mode === 'eaten') {
            // Only draw eyes
            this._drawGhostEyes(ctx, cx, cy, radius, ghost.dir);
            return;
        } else if (ghost.mode === 'frightened') {
            bodyColor = ghost.flashing ? COLORS.GHOST_FLASH : COLORS.GHOST_FRIGHTENED;
        } else {
            bodyColor = GHOST_COLORS[ghost.name] || '#FF0000';
        }

        ctx.fillStyle = bodyColor;

        // Ghost body shape
        ctx.beginPath();
        // Top dome
        ctx.arc(cx, cy - 2, radius, Math.PI, 0);
        // Sides down
        ctx.lineTo(cx + radius, cy + radius - 2);

        // Wavy bottom
        const waveCount = 3;
        const waveWidth = (radius * 2) / waveCount;
        for (let i = 0; i < waveCount; i++) {
            const wx = cx + radius - (i + 1) * waveWidth;
            const wcx = wx + waveWidth / 2;
            ctx.quadraticCurveTo(wcx, cy + radius + 2, wx, cy + radius - 2);
        }

        ctx.closePath();
        ctx.fill();

        // Eyes
        if (ghost.mode === 'frightened') {
            this._drawFrightenedFace(ctx, cx, cy, radius, ghost.flashing);
        } else {
            this._drawGhostEyes(ctx, cx, cy, radius, ghost.dir);
        }
    }

    _drawGhostEyes(ctx, cx, cy, radius, dir) {
        const eyeOffX = radius * 0.3;
        const eyeR = radius * 0.25;
        const pupilR = eyeR * 0.5;

        // Eye direction offset
        let px = 0, py = 0;
        if (dir.x === 1) px = pupilR * 0.7;
        if (dir.x === -1) px = -pupilR * 0.7;
        if (dir.y === 1) py = pupilR * 0.7;
        if (dir.y === -1) py = -pupilR * 0.7;

        // Left eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - eyeOffX, cy - 3, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(cx - eyeOffX + px, cy - 3 + py, pupilR, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + eyeOffX, cy - 3, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(cx + eyeOffX + px, cy - 3 + py, pupilR, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawFrightenedFace(ctx, cx, cy, radius, flashing) {
        const eyeR = 1.5;
        ctx.fillStyle = flashing ? '#f00' : '#fff';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.25, cy - 3, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + radius * 0.25, cy - 3, eyeR, 0, Math.PI * 2);
        ctx.fill();

        // Wavy mouth
        ctx.strokeStyle = flashing ? '#f00' : '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const mouthY = cy + 1;
        const mouthW = radius * 0.6;
        ctx.moveTo(cx - mouthW, mouthY);
        for (let i = 0; i < 4; i++) {
            const sx = cx - mouthW + (i + 0.5) * (mouthW * 2 / 4);
            const sy = mouthY + (i % 2 === 0 ? -2 : 2);
            ctx.lineTo(sx, sy);
        }
        ctx.lineTo(cx + mouthW, mouthY);
        ctx.stroke();
    }

    // ---- FRUIT ----

    drawFruit(fruit) {
        if (!fruit || !fruit.active) return;
        const ctx = this.ctx;
        const cx = fruit.x;
        const cy = fruit.y;
        ctx.fillStyle = fruit.color;
        ctx.shadowColor = fruit.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.strokeStyle = '#00AA00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx + 2, cy - 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // ---- SCORE POPUP ----

    drawScorePopup(popup) {
        if (!popup) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#00FFFF';
        ctx.font = '6px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(popup.text, popup.x, popup.y);
    }

    // ---- TEXT OVERLAYS ----

    drawReadyText() {
        const ctx = this.ctx;
        ctx.fillStyle = COLORS.READY;
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('READY!', CANVAS_WIDTH / 2, 17.5 * this.ts + 4);
    }

    drawFlashMaze(maze, flash) {
        const ctx = this.ctx;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (maze.grid[r][c] === TILE.WALL || MAZE_LAYOUT_ORIGINAL[r][c] === TILE.WALL) {
                    const x = c * this.ts;
                    const y = r * this.ts;
                    ctx.fillStyle = flash ? '#FFFFFF' : COLORS.WALL;
                    ctx.shadowColor = flash ? '#FFFFFF' : COLORS.WALL_GLOW;
                    ctx.shadowBlur = 6;
                    this._drawWallTile(ctx, maze, c, r, x, y, this.ts);
                    ctx.shadowBlur = 0;
                }
            }
        }
    }
}

// Keep a reference to original layout for flash effect
import { MAZE_LAYOUT } from './constants.js';
const MAZE_LAYOUT_ORIGINAL = MAZE_LAYOUT;
