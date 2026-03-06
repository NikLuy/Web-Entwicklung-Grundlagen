# 🟡 PAC-MAN

A classic PAC-MAN arcade game built from scratch with **HTML5 Canvas**, **CSS**, and **vanilla JavaScript** — no frameworks, no build tools.

## 🎮 Play

1. Open `index.html` in a browser (via Live Server or `npx serve .`)
2. Press **Enter** to start
3. Eat all pellets to clear the level!

## 🕹️ Controls

| Action | Input |
|--------|-------|
| Move   | Arrow Keys / WASD |
| Start  | Enter |
| Mute   | M |
| Mobile | Swipe / Tap |

## ✨ Features

- Classic 28×31 maze with neon-glow walls
- 4 ghost personalities with authentic AI (Blinky, Pinky, Inky, Clyde)
- Scatter/Chase mode alternation
- Power pellets & ghost-eating chain bonus (200→400→800→1600)
- Synthesised audio via Web Audio API (no audio files)
- Fruit bonus items
- Level progression with increasing difficulty
- High score persistence (localStorage)
- Responsive layout with mobile touch/swipe support
- Premium dark theme with glassmorphism overlays

## 🏗️ Architecture

```
index.html          — Page shell & overlays
style.css           — Dark theme, neon glow, responsive layout
js/
  main.js           — Entry point
  constants.js      — Maze layout, speeds, colors, scoring
  maze.js           — Tile queries, pellet tracking, tunnel logic
  renderer.js       — Canvas drawing engine
  pacman.js         — Player movement & animation
  ghost.js          — Ghost AI with 4 personalities
  game.js           — State machine & game loop
  input.js          — Keyboard & touch controls
  sound.js          — Web Audio synthesized effects
  ui.js             — HUD, overlays, high score
```

## 📜 License

MIT