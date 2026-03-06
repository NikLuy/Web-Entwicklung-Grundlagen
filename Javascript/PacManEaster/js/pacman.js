// ============================================================
// pacman.js — Pac-Man player entity (fixed movement)
// ============================================================

import { TILE_SIZE, PACMAN_START, DIR, COLS } from './constants.js';

export class PacMan {
    constructor() {
        this.reset();
    }

    reset() {
        this.col = PACMAN_START.col;
        this.row = PACMAN_START.row;
        this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
        this.dir = { ...DIR.LEFT };
        this.nextDir = null;
        this.speed = 0; // set by game based on level
        this.moving = false;

        // Mouth animation
        this.mouthAngle = 0.25;
        this._mouthOpening = true;
        this._mouthMin = 0.01;
        this._mouthMax = 0.35;
        this._mouthSpeed = 5;
    }

    /** Set desired next direction (buffered input) */
    setNextDirection(dir) {
        if (dir) this.nextDir = { ...dir };
    }

    /** Main update — called each frame with dt in seconds */
    update(dt, maze) {
        this._animateMouth(dt);

        const speed = this.speed * TILE_SIZE;
        const centerX = this.col * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.row * TILE_SIZE + TILE_SIZE / 2;
        const distToCenterX = Math.abs(this.x - centerX);
        const distToCenterY = Math.abs(this.y - centerY);
        const tolerance = Math.max(speed * dt + 0.5, 2);
        const atCenter = distToCenterX < tolerance && distToCenterY < tolerance;

        // At (or near) tile center: try to change direction or check wall ahead
        if (atCenter) {
            // Try buffered direction first
            if (this.nextDir && this._canMoveInDir(this.nextDir, maze)) {
                this._snapToTileCenter();
                this.dir = { ...this.nextDir };
                this.nextDir = null;
                this.moving = true;
            }
            // If current direction is blocked, stop
            else if (!this._canMoveInDir(this.dir, maze)) {
                this._snapToTileCenter();
                this.moving = false;
                return;
            }
            // Otherwise keep moving in current direction
            else {
                this.moving = true;
            }
        }

        if (!this.moving) return;

        // Calculate new position
        let newX = this.x + this.dir.x * speed * dt;
        let newY = this.y + this.dir.y * speed * dt;

        // Tunnel wrapping
        if (newX < -TILE_SIZE / 2) {
            newX = COLS * TILE_SIZE + TILE_SIZE / 2;
        } else if (newX > COLS * TILE_SIZE + TILE_SIZE / 2) {
            newX = -TILE_SIZE / 2;
        }

        // Prevent Pac-Man from entering a wall tile:
        // Check the tile we'd be moving into
        const nextCol = this.col + this.dir.x;
        const nextRow = this.row + this.dir.y;
        //TODO: More Description
        if (nextCol >= 0 && nextCol < COLS && !maze.isWalkable(nextCol, nextRow)) {
            // Don't let Pac-Man cross past the center of current tile into the wall tile
            const wallEdgeX = (this.dir.x > 0)
                ? this.col * TILE_SIZE + TILE_SIZE / 2
                : (this.dir.x < 0) ? this.col * TILE_SIZE + TILE_SIZE / 2 : newX;
            const wallEdgeY = (this.dir.y > 0)
                ? this.row * TILE_SIZE + TILE_SIZE / 2
                : (this.dir.y < 0) ? this.row * TILE_SIZE + TILE_SIZE / 2 : newY;

            if (this.dir.x > 0 && newX > wallEdgeX) newX = wallEdgeX;
            if (this.dir.x < 0 && newX < wallEdgeX) newX = wallEdgeX;
            if (this.dir.y > 0 && newY > wallEdgeY) newY = wallEdgeY;
            if (this.dir.y < 0 && newY < wallEdgeY) newY = wallEdgeY;
        }

        this.x = newX;
        this.y = newY;

        // Update current tile based on which tile center we are closest to
        this.col = Math.floor(this.x / TILE_SIZE);
        this.row = Math.floor(this.y / TILE_SIZE);

        // Clamp for tunnel
        if (this.col < 0) this.col = 0;
        if (this.col >= COLS) this.col = COLS - 1;
    }

    _snapToTileCenter() {
        this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
    }

    _canMoveInDir(dir, maze) {
        const nextCol = this.col + dir.x;
        const nextRow = this.row + dir.y;
        // Handle tunnel
        if (nextCol < 0 || nextCol >= COLS) {
            return maze.isTunnel(nextCol, this.row) || maze.isTunnel(this.col, this.row);
        }
        return maze.isWalkable(nextCol, nextRow);
    }

    _animateMouth(dt) {
        if (!this.moving) return;
        if (this._mouthOpening) {
            this.mouthAngle += this._mouthSpeed * dt;
            if (this.mouthAngle >= this._mouthMax) {
                this.mouthAngle = this._mouthMax;
                this._mouthOpening = false;
            }
        } else {
            this.mouthAngle -= this._mouthSpeed * dt;
            if (this.mouthAngle <= this._mouthMin) {
                this.mouthAngle = this._mouthMin;
                this._mouthOpening = true;
            }
        }
    }

    /** Get the tile Pac-Man is on */
    getTile() {
        return { col: this.col, row: this.row };
    }
}
