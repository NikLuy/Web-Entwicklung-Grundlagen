// ============================================================
// renderer.js — Canvas drawing for maze, entities, and effects
// ============================================================

import { TILE_SIZE, COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT, SCALE, COLORS, GHOST_COLORS, EGG_COLORS, TILE } from './constants.js';

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

    // ---- EASTER EGGS (pellets) ----

    drawPellets(maze) {
        const ctx = this.ctx;
        const ts = this.ts;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = maze.grid[r][c];
                const cx = c * ts + ts / 2;
                const cy = r * ts + ts / 2;

                if (tile === TILE.PELLET) {
                    // Small Easter egg — colored oval
                    const colorIdx = (r * 3 + c * 5) % EGG_COLORS.length;
                    ctx.fillStyle = EGG_COLORS[colorIdx];
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, 1.8, 2.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === TILE.POWER_PELLET && this.powerPelletVisible) {
                    // Large golden Easter egg with stripe
                    ctx.fillStyle = COLORS.POWER_PELLET;
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, 3.5, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    // Decorative stripe
                    ctx.strokeStyle = '#FF8C00';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cx - 3.5, cy);
                    ctx.lineTo(cx + 3.5, cy);
                    ctx.stroke();
                }
            }
        }
    }

    // ---- EASTER BUNNY (Pac-Man) ----

    drawPacman(pacman) {
        const ctx = this.ctx;
        const cx = pacman.x;
        const cy = pacman.y;
        const r = this.ts / 2 - 1;

        // --- Directional vectors ---
        const dx = pacman.dir.x || 0;
        const dy = pacman.dir.y || 0;
        // Perpendicular axis (left/right relative to facing)
        const px = -dy;
        const py = dx;

        // Rotation angle based on direction
        const dirAngle = Math.atan2(dy, dx);

        // Ear wiggle tied to mouth/hop animation
        const earWiggleAngle = Math.sin(pacman.mouthAngle * 20) * 0.25;

        // --- Ears (point away from the face direction) ---
        // Ears extend behind the head: opposite of movement direction
        const earBackDist = 1.55;  // how far back from center
        const earSideDist = 0.38;  // how far left/right from center

        // Left ear position (behind + left)
        const earLX = cx - dx * r * earBackDist + px * r * earSideDist;
        const earLY = cy - dy * r * earBackDist + py * r * earSideDist;
        // Right ear position (behind + right)
        const earRX = cx - dx * r * earBackDist - px * r * earSideDist;
        const earRY = cy - dy * r * earBackDist - py * r * earSideDist;

        // Ear tilt: base angle points away from face, plus wiggle
        const earBaseAngle = dirAngle + Math.PI / 2; // perpendicular to direction

        // Left ear
        ctx.fillStyle = '#F0E8D0';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.ellipse(earLX, earLY, r * 0.22, r * 0.65, earBaseAngle + earWiggleAngle - 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(earLX, earLY, r * 0.12, r * 0.42, earBaseAngle + earWiggleAngle - 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Right ear
        ctx.fillStyle = '#F0E8D0';
        ctx.beginPath();
        ctx.ellipse(earRX, earRY, r * 0.22, r * 0.65, earBaseAngle - earWiggleAngle + 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(earRX, earRY, r * 0.12, r * 0.42, earBaseAngle - earWiggleAngle + 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- Body ---
        ctx.fillStyle = COLORS.PACMAN;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- Directional face (eyes + nose move to the front) ---
        const eyeForward = 0.22;
        const eyeSide = 0.32;
        const eyeLX = cx + dx * r * eyeForward + px * r * eyeSide;
        const eyeLY = cy + dy * r * eyeForward + py * r * eyeSide;
        const eyeRX = cx + dx * r * eyeForward - px * r * eyeSide;
        const eyeRY = cy + dy * r * eyeForward - py * r * eyeSide;

        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(eyeLX, eyeLY, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeRX, eyeRY, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(cx + dx * r * 0.65, cy + dy * r * 0.65, 1.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Death animation: bunny spins and shrinks */
    drawPacmanDying(pacman, progress) {
        const ctx = this.ctx;
        const cx = pacman.x;
        const cy = pacman.y;
        const r = this.ts / 2 - 1;

        if (progress >= 0.9) return;

        const scale = Math.max(0.05, 1 - progress * 1.1);
        const alpha = Math.max(0, 1 - progress * 1.5);
        const earDroopAngle = progress * Math.PI * 0.9; // ears droop outward

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(progress * Math.PI * 2.5);
        ctx.scale(scale, scale);

        // Left ear drooping
        ctx.fillStyle = '#F0E8D0';
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 1.55, r * 0.22, r * 0.65, earDroopAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 1.55, r * 0.12, r * 0.42, earDroopAngle, 0, Math.PI * 2);
        ctx.fill();

        // Right ear drooping
        ctx.fillStyle = '#F0E8D0';
        ctx.beginPath();
        ctx.ellipse(r * 0.38, -r * 1.55, r * 0.22, r * 0.65, -earDroopAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(r * 0.38, -r * 1.55, r * 0.12, r * 0.42, -earDroopAngle, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = COLORS.PACMAN;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // ---- LAWNMOWERS (ghosts) ----

    drawGhost(ghost) {
        const ctx = this.ctx;
        const cx = ghost.x;
        const cy = ghost.y;
        const ts = this.ts;
        const r = ts / 2 - 1;

        if (ghost.mode === 'eaten') {
            // Just the wheels rolling back to the ghost house
            ctx.fillStyle = '#555555';
            ctx.beginPath();
            ctx.arc(cx - r * 0.5, cy + r * 0.35, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + r * 0.5, cy + r * 0.35, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        let bodyColor;
        if (ghost.mode === 'frightened') {
            bodyColor = ghost.flashing ? COLORS.GHOST_FLASH : COLORS.GHOST_FRIGHTENED;
        } else {
            bodyColor = GHOST_COLORS[ghost.name] || '#CC0000';
        }

        // Flip horizontally when facing left
        const facingLeft = ghost.dir.x < 0;

        ctx.save();
        ctx.translate(cx, cy);
        if (facingLeft) ctx.scale(-1, 1);

        const bw = r * 1.75;  // body width
        const bh = r * 0.85;  // body height
        const bx = -bw / 2;
        const by = -bh / 2;

        // --- Mower body ---
        ctx.fillStyle = bodyColor;
        ctx.shadowColor = bodyColor;
        ctx.shadowBlur = 5;
        ctx.fillRect(bx, by, bw, bh);
        // Rounded dome top
        ctx.beginPath();
        ctx.arc(0, by, bw / 2, Math.PI, 0, false);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- Top deck highlight ---
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(0, by, bw * 0.4, Math.PI, 0, false);
        ctx.fill();

        // --- Handle bar (right side = back when facing right) ---
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.72, by);
        ctx.lineTo(bx + bw * 0.82, by - r * 0.85);
        ctx.stroke();
        // Grip crossbar
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.70, by - r * 0.85);
        ctx.lineTo(bx + bw * 1.05, by - r * 0.85);
        ctx.stroke();

        // --- Blade bar below body ---
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(bx - 1, by + bh, bw + 2, 2);

        // --- Wheels ---
        const wr = r * 0.3;
        const wy = by + bh + wr * 0.8;
        ctx.fillStyle = '#2E2E2E';
        ctx.beginPath();
        ctx.arc(bx + wr + 1, wy, wr, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx + bw - wr - 1, wy, wr, 0, Math.PI * 2);
        ctx.fill();
        // Wheel rims
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(bx + wr + 1, wy, wr * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + bw - wr - 1, wy, wr * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // --- Front indicator (headlight / warning) ---
        if (ghost.mode === 'frightened') {
            // Blinking warning light
            ctx.fillStyle = ghost.flashing ? '#FF4444' : '#888888';
            ctx.beginPath();
            ctx.arc(bx + 3, by + bh * 0.4, 1.8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Yellow headlight
            ctx.fillStyle = '#FFEE58';
            ctx.shadowColor = '#FFEE58';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(bx + 3, by + bh * 0.4, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    // ---- EASTER EGG BONUS ----

    drawFruit(fruit) {
        if (!fruit || !fruit.active) return;
        const ctx = this.ctx;
        const cx = fruit.x;
        const cy = fruit.y;

        // Egg shape
        ctx.fillStyle = fruit.color;
        ctx.shadowColor = fruit.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Decorative stripe
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.stroke();

        // Dots on egg
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(cx, cy - 2.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + 2.5, 1, 0, Math.PI * 2);
        ctx.fill();
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
