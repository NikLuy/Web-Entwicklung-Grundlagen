// ============================================================
// maze.js — Maze parsing, tile queries, and pellet tracking
// ============================================================

import { MAZE_LAYOUT, COLS, ROWS, TILE } from './constants.js';

export class Maze {
    constructor() {
        this.reset();
    }

    /** Deep-copy the original layout and count pellets */
    reset() {
        this.grid = MAZE_LAYOUT.map(row => [...row]);
        this.pelletsRemaining = 0;
        this.totalPellets = 0;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this.grid[r][c] === TILE.PELLET || this.grid[r][c] === TILE.POWER_PELLET) {
                    this.totalPellets++;
                    this.pelletsRemaining++;
                }
            }
        }
    }

    /** Get tile type at (col, row). Out-of-bounds returns WALL except for tunnel rows */
    getTile(col, row) {
        if (row < 0 || row >= ROWS) return TILE.WALL;
        // Tunnel wrapping
        if (col < 0 || col >= COLS) {
            if (this.grid[row] && (this.grid[row][0] === TILE.TUNNEL || this.grid[row][COLS - 1] === TILE.TUNNEL)) {
                return TILE.TUNNEL;
            }
            return TILE.WALL;
        }
        return this.grid[row][col];
    }

    /** Check if a tile is walkable (for Pac-Man — excludes ghost house & door) */
    isWalkable(col, row) {
        const tile = this.getTile(col, row);
        return tile !== TILE.WALL && tile !== TILE.GHOST_DOOR && tile !== TILE.GHOST_HOUSE;
    }

    /** Check if a tile is walkable for ghosts */
    isGhostWalkable(col, row, canUseDoor = false) {
        const tile = this.getTile(col, row);
        if (tile === TILE.WALL) return false;
        if (tile === TILE.GHOST_DOOR && !canUseDoor) return false;
        if (tile === TILE.GHOST_HOUSE && !canUseDoor) return false; //here the bug happens where the ghost cross the compete row with tunnel
        return true;
    }

    /** Check if tile is a wall */
    isWall(col, row) {
        return this.getTile(col, row) === TILE.WALL;
    }

    /** Eat a pellet at (col, row). Returns score earned or 0 */
    eatPellet(col, row) {
        const tile = this.getTile(col, row);
        if (tile === TILE.PELLET) {
            this.grid[row][col] = TILE.EMPTY;
            this.pelletsRemaining--;
            return 10;
        }
        if (tile === TILE.POWER_PELLET) {
            this.grid[row][col] = TILE.EMPTY;
            this.pelletsRemaining--;
            return 50;
        }
        return 0;
    }

    /** Check if tile is a power pellet */
    isPowerPellet(col, row) {
        return this.getTile(col, row) === TILE.POWER_PELLET;
    }

    /** Check if position is in the tunnel area */
    isTunnel(col, row) {
        return this.getTile(col, row) === TILE.TUNNEL || col < 0 || col >= COLS;
    }

    /** Wrap column for tunnel traversal */
    wrapCol(col) {
        if (col < -1) return COLS;
        if (col >= COLS + 1) return -1;
        return col;
    }

    /** Check if a tile is an intersection (3+ walkable neighbours) */
    isIntersection(col, row) {
        if (this.isWall(col, row)) return false;
        let exits = 0;
        if (this.isWalkable(col, row - 1)) exits++;
        if (this.isWalkable(col, row + 1)) exits++;
        if (this.isWalkable(col - 1, row)) exits++;
        if (this.isWalkable(col + 1, row)) exits++;
        return exits >= 3;
    }

    /** Get all walkable directions from a tile */
    getWalkableDirections(col, row, canUseDoor = false) {
        const dirs = [];
        if (this.isGhostWalkable(col, row - 1, canUseDoor)) dirs.push({ x: 0, y: -1 });
        if (this.isGhostWalkable(col, row + 1, canUseDoor)) dirs.push({ x: 0, y: 1 });
        if (this.isGhostWalkable(col - 1, row, canUseDoor)) dirs.push({ x: -1, y: 0 });
        if (this.isGhostWalkable(col + 1, row, canUseDoor)) dirs.push({ x: 1, y: 0 });
        return dirs;
    }
}
