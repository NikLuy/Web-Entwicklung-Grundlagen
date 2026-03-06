// ============================================================
// ghost.js — Ghost entity — SIMPLIFIED tile-to-tile movement
// ============================================================

import { TILE_SIZE, COLS, ROWS, GHOST_CONFIG, GHOST_DOOR, DIR } from './constants.js';

export const GHOST_NAMES = ['blinky', 'pinky', 'inky', 'clyde'];

export class Ghost {
    constructor(name) {
        this.name = name;
        const cfg = GHOST_CONFIG[name];
        this.startCol = cfg.startCol;
        this.startRow = cfg.startRow;
        this.scatterTarget = cfg.scatterTarget;
        this.exitOrder = cfg.exitOrder;
        this.reset();
    }

    reset() {
        this.col = this.startCol;
        this.row = this.startRow;
        this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
        this.dir = { x: -1, y: 0 };
        this.speed = 0;
        this.mode = 'house';
        this.prevMode = 'scatter';
        this.flashing = false;
        this._houseTimer = 0;
        this._needsDecision = true; // flag: pick a new direction at current tile
        this._forceReverse = false;
    }

    frighten() {
        if (this.mode === 'eaten' || this.mode === 'house') return;
        this.prevMode = this.mode;
        this.mode = 'frightened';
        this.flashing = false;
        this._forceReverse = true;
    }

    unFrighten() {
        if (this.mode === 'frightened') {
            this.mode = this.prevMode;
            this.flashing = false;
        }
    }

    setEaten() {
        this.mode = 'eaten';
        this.flashing = false;
    }

    // ---- Main update ----
    update(dt, maze, pacman, blinkyGhost, modeType) {
        // --- House mode: wait then teleport out ---
        if (this.mode === 'house') {
            this._houseTimer += dt;
            // Bob in place
            const centerY = this.startRow * TILE_SIZE + TILE_SIZE / 2;
            this.y = centerY + Math.sin(this._houseTimer * 4) * 3;
            this.x = this.startCol * TILE_SIZE + TILE_SIZE / 2;

            // Staggered release
            if (this._houseTimer > this.exitOrder * 2 + 1) {
                // Teleport to just above the ghost house door
                this.col = 13;
                this.row = 11;
                this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
                this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
                this.dir = { x: -1, y: 0 };
                this.mode = 'scatter';
                this._needsDecision = true;
            }
            return;
        }

        // --- Eaten mode: teleport home ---
        if (this.mode === 'eaten') {
            this._moveToTarget(dt, maze, GHOST_DOOR.col, GHOST_DOOR.row - 1, true);
            // If arrived near door, respawn in house
            const doorX = GHOST_DOOR.col * TILE_SIZE + TILE_SIZE / 2;
            const doorY = (GHOST_DOOR.row - 1) * TILE_SIZE + TILE_SIZE / 2;
            if (Math.abs(this.x - doorX) < TILE_SIZE && Math.abs(this.y - doorY) < TILE_SIZE) {
                this.mode = 'house';
                this._houseTimer = 2; // quick re-exit
                this.col = this.startCol;
                this.row = this.startRow;
                this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
                this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
                this._needsDecision = true;
            }
            return;
        }

        // --- Normal movement (scatter / chase / frightened) ---
        // Determine target
        let targetCol, targetRow;
        if (this.mode === 'scatter') {
            targetCol = this.scatterTarget.col;
            targetRow = this.scatterTarget.row;
        } else if (this.mode === 'frightened') {
            targetCol = Math.floor(Math.random() * COLS);
            targetRow = Math.floor(Math.random() * ROWS);
        } else {
            const t = this._getChaseTarget(pacman, blinkyGhost);
            targetCol = t.col;
            targetRow = t.row;
        }

        this._moveToTarget(dt, maze, targetCol, targetRow, false);

        // Sync mode with game mode type
        if (modeType && this.mode !== 'frightened') {
            this.mode = modeType;
        }
    }

    // ---- Simple tile-to-tile movement ----
    _moveToTarget(dt, maze, targetCol, targetRow, canUseDoor) {
        const speed = this.speed * TILE_SIZE;
        if (speed <= 0) return;

        // If we need a decision (at tile center), pick direction
        if (this._needsDecision) {
            this._needsDecision = false;
            // Snap exactly to tile center
            this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
            this.y = this.row * TILE_SIZE + TILE_SIZE / 2;

            // Handle force reverse
            if (this._forceReverse) {
                this.dir = { x: -this.dir.x, y: -this.dir.y };
                this._forceReverse = false;
            } else {
                // Pick best direction (excluding reverse)
                this._pickDirection(maze, targetCol, targetRow, canUseDoor);
            }
        }

        // Move in current direction
        const moveAmount = speed * dt;
        this.x += this.dir.x * moveAmount;
        this.y += this.dir.y * moveAmount;

        // Tunnel wrapping
        if (this.x < -TILE_SIZE / 2) this.x = COLS * TILE_SIZE + TILE_SIZE / 2;
        else if (this.x > COLS * TILE_SIZE + TILE_SIZE / 2) this.x = -TILE_SIZE / 2;

        // Check if we've reached (or passed) the next tile center
        const nextCol = this.col + this.dir.x;
        const nextRow = this.row + this.dir.y;
        const nextCenterX = nextCol * TILE_SIZE + TILE_SIZE / 2;
        const nextCenterY = nextRow * TILE_SIZE + TILE_SIZE / 2;

        let arrived = false;
        if (this.dir.x === 1 && this.x >= nextCenterX) arrived = true;
        if (this.dir.x === -1 && this.x <= nextCenterX) arrived = true;
        if (this.dir.y === 1 && this.y >= nextCenterY) arrived = true;
        if (this.dir.y === -1 && this.y <= nextCenterY) arrived = true;

        if (arrived) {
            // Handle tunnel column wrap
            let arriveCol = nextCol;
            let arriveRow = nextRow;
            if (arriveCol < 0) arriveCol = COLS - 1;
            if (arriveCol >= COLS) arriveCol = 0;

            this.col = arriveCol;
            this.row = arriveRow;
            this.x = this.col * TILE_SIZE + TILE_SIZE / 2;
            this.y = this.row * TILE_SIZE + TILE_SIZE / 2;
            this._needsDecision = true; // decide again at new tile
        }
    }

    // ---- Direction picking at intersections ----
    _pickDirection(maze, targetCol, targetRow, canUseDoor) {
        const reverse = { x: -this.dir.x, y: -this.dir.y };

        // All four possible directions in priority order (Up, Left, Down, Right — classic Pac-Man)
        const allDirs = [
            { x: 0, y: -1 }, // up
            { x: -1, y: 0 }, // left
            { x: 0, y: 1 },  // down
            { x: 1, y: 0 },  // right
        ];

        // Filter to walkable non-reverse directions
        let candidates = allDirs.filter(d => {
            // Don't reverse
            if (d.x === reverse.x && d.y === reverse.y) return false;
            const nc = this.col + d.x;
            const nr = this.row + d.y;
            // Tunnel check
            if (nc < 0 || nc >= COLS) return true; // tunnel is always ok
            if (nr < 0 || nr >= ROWS) return false;
            return canUseDoor ? maze.isGhostWalkable(nc, nr, true) : maze.isGhostWalkable(nc, nr, false);
        });

        // If no candidates (dead end), allow reverse
        if (candidates.length === 0) {
            candidates = allDirs.filter(d => {
                const nc = this.col + d.x;
                const nr = this.row + d.y;
                if (nc < 0 || nc >= COLS) return true;
                if (nr < 0 || nr >= ROWS) return false;
                return canUseDoor ? maze.isGhostWalkable(nc, nr, true) : maze.isGhostWalkable(nc, nr, false);
            });
        }

        if (candidates.length === 0) return; // truly stuck (shouldn't happen)

        if (candidates.length === 1) {
            this.dir = { ...candidates[0] };
            return;
        }

        // Pick the direction closest to target (by Euclidean distance squared)
        let bestDist = Infinity;
        let bestDir = candidates[0];
        for (const d of candidates) {
            const nc = this.col + d.x;
            const nr = this.row + d.y;
            const dist = (nc - targetCol) ** 2 + (nr - targetRow) ** 2;
            if (dist < bestDist) {
                bestDist = dist;
                bestDir = d;
            }
        }
        this.dir = { ...bestDir };
    }

    // ---- Chase targeting ----
    _getChaseTarget(pacman, blinkyGhost) {
        const pac = pacman.getTile();
        switch (this.name) {
            case 'blinky':
                return { col: pac.col, row: pac.row };
            case 'pinky': {
                let col = pac.col + pacman.dir.x * 4;
                let row = pac.row + pacman.dir.y * 4;
                if (pacman.dir.y === -1) col -= 4;
                return { col, row };
            }
            case 'inky': {
                const a2c = pac.col + pacman.dir.x * 2;
                const a2r = pac.row + pacman.dir.y * 2;
                if (blinkyGhost) {
                    return { col: a2c + (a2c - blinkyGhost.col), row: a2r + (a2r - blinkyGhost.row) };
                }
                return { col: a2c, row: a2r };
            }
            case 'clyde': {
                const dx = pac.col - this.col;
                const dy = pac.row - this.row;
                if (Math.sqrt(dx * dx + dy * dy) > 8) {
                    return { col: pac.col, row: pac.row };
                }
                return { ...this.scatterTarget };
            }
            default:
                return { col: pac.col, row: pac.row };
        }
    }

    getTile() {
        return { col: this.col, row: this.row };
    }
}
