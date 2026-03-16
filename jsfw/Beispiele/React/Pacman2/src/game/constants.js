// ============================================================
// constants.js — Game configuration, maze layout, and tuning
// ============================================================

export const TILE_SIZE = 16;
export const COLS = 28;
export const ROWS = 31;
export const CANVAS_WIDTH = COLS * TILE_SIZE;   // 448
export const CANVAS_HEIGHT = ROWS * TILE_SIZE;  // 496

// Scale factor for rendering (2× for sharp visuals)
export const SCALE = 2;

// ---- Colors ----
export const COLORS = {
    WALL: '#2121DE',
    WALL_GLOW: '#4444FF',
    PELLET: '#FFB8AE',
    POWER_PELLET: '#FFB8AE',
    PACMAN: '#FFFF00',
    TEXT: '#FFFFFF',
    SCORE: '#FFFF00',
    READY: '#FFFF00',
    GAME_OVER: '#FF0000',
    BG: '#000000',
    GHOST_FRIGHTENED: '#2121DE',
    GHOST_FLASH: '#FFFFFF',
    GHOST_EATEN: '#FFFFFF',
};

export const GHOST_COLORS = {
    blinky: '#FF0000',
    pinky: '#FFB8FF',
    inky: '#00FFFF',
    clyde: '#FFB852',
};

// ---- Directions ----
export const DIR = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 },
};

// ---- Tile types in the maze layout ----
export const TILE = {
    EMPTY: 0,
    WALL: 1,
    PELLET: 2,
    POWER_PELLET: 3,
    GHOST_HOUSE: 4,
    GHOST_DOOR: 5,
    TUNNEL: 6,
    PACMAN_START: 7,
};

// ---- Classic 28×31 Maze Layout ----
// 0=empty, 1=wall, 2=pellet, 3=power pellet, 4=ghost house, 5=ghost door, 6=tunnel, 7=pacman start
export const MAZE_LAYOUT = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 5, 5, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 4, 4, 4, 4, 4, 4, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [6, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 6],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 4, 4, 4, 4, 4, 4, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
    [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// ---- Pac-Man start position (tile coords) ----
export const PACMAN_START = { col: 14, row: 23 };

// ---- Ghost start positions & scatter corners ----
export const GHOST_CONFIG = {
    blinky: {
        startCol: 14, startRow: 11,
        scatterTarget: { col: 25, row: 0 },
        exitOrder: 0,
    },
    pinky: {
        startCol: 14, startRow: 14,
        scatterTarget: { col: 2, row: 0 },
        exitOrder: 1,
    },
    inky: {
        startCol: 12, startRow: 14,
        scatterTarget: { col: 27, row: 30 },
        exitOrder: 2,
    },
    clyde: {
        startCol: 16, startRow: 14,
        scatterTarget: { col: 0, row: 30 },
        exitOrder: 3,
    },
};

// ---- Ghost house door position ----
export const GHOST_DOOR = { col: 13, row: 12 };

// ---- Speed (pixels per second at SCALE=1) ----
export const BASE_SPEED = 75.75; // ~80% of max at level 1

// Level-based speed multipliers [level] = { pacman, ghost, frightPacman, frightGhost, tunnel }
export const LEVEL_SPEEDS = [
    null, // index 0 unused
    { pacman: 0.80, ghost: 0.75, frightPac: 0.90, frightGhost: 0.50, tunnel: 0.40 },
    { pacman: 0.90, ghost: 0.85, frightPac: 0.95, frightGhost: 0.55, tunnel: 0.45 },
    { pacman: 0.90, ghost: 0.85, frightPac: 0.95, frightGhost: 0.55, tunnel: 0.45 },
    { pacman: 0.90, ghost: 0.85, frightPac: 0.95, frightGhost: 0.55, tunnel: 0.45 },
    { pacman: 1.00, ghost: 0.95, frightPac: 1.00, frightGhost: 0.60, tunnel: 0.50 },
];

// ---- Scatter/Chase mode timings (seconds) per level ----
export const MODE_TIMINGS = [
    null,
    // Level 1: scatter 7s, chase 20s, scatter 7s, chase 20s, scatter 5s, chase 20s, scatter 5s, chase ∞
    [7, 20, 7, 20, 5, 20, 5, Infinity],
    [7, 20, 7, 20, 5, 1033, 1 / 60, Infinity],
    [7, 20, 7, 20, 5, 1033, 1 / 60, Infinity],
    [7, 20, 7, 20, 5, 1033, 1 / 60, Infinity],
    [5, 20, 5, 20, 5, 1037, 1 / 60, Infinity],
];

// ---- Fright duration per level (seconds). 0 = no fright ----
export const FRIGHT_DURATION = [
    null, 6, 5, 4, 3, 2, 5, 2, 2, 1, 5, 2, 1, 1, 3, 1, 1, 0, 1, 0, 0, 0
];

// Number of flashes before fright ends
export const FRIGHT_FLASHES = [
    null, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 3, 3, 5, 3, 3, 0, 3, 0, 0, 0
];

// ---- Fruit types per level ----
export const FRUITS = [
    null,
    { name: 'cherry', points: 100, color: '#FF0000' },
    { name: 'strawberry', points: 300, color: '#FF6384' },
    { name: 'orange', points: 500, color: '#FFA500' },
    { name: 'apple', points: 700, color: '#FF0000' },
    { name: 'melon', points: 1000, color: '#00FF00' },
];

// ---- Pellet counts for ghost release ----
export const PELLET_RELEASE = {
    pinky: 0,    // exits immediately
    inky: 30,    // after 30 pellets eaten
    clyde: 60,   // after 60 pellets eaten
};

// ---- Scoring ----
export const SCORE = {
    PELLET: 10,
    POWER_PELLET: 50,
    GHOST_BASE: 200,  // doubles for each ghost eaten during single fright
    EXTRA_LIFE_AT: 10000,
};

// Total pellets in the classic maze
export const TOTAL_PELLETS = 244;
