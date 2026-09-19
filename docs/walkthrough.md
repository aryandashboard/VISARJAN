# VISARJAN — Walkthrough

## Game Concept
VISARJAN is a 2D side-scrolling survival and exploration game. The player takes control of Mushak (Lord Ganesha's devoted mouse companion), carrying a sacred diya (oil lamp). The core objective is to move through a dynamically challenging environment, survive changing weather conditions, and reach the final Visarjan destination without the flame dying out.

## Controls
- **A / Left Arrow**: Move Left
- **D / Right Arrow**: Move Right
- **Space / W / Up Arrow**: Jump
- **Shift**: Dash (in the direction currently faced)

*Note: The player controls the pace of the game. Movement requires active input, and the camera follows Mushak.*

## Core Gameplay Loop
1. **Move & Explore**: Navigate the environment to find safe paths.
2. **Collect**: Gather Oil and Diyas to restore your fading flame.
3. **Survive**: Jump over obstacles (rocks, barricades, carts) and adapt to worsening weather.
4. **Devotion**: Collect flowers to build your Devotion meter. Once full, the **Bappa Blessing** is activated—providing temporary invulnerability to flame drain and a score multiplier.
5. **Reach the End**: Navigate to a distance of 3000 to trigger the final peaceful Visarjan ending sequence.

## Mechanics
- **Flame Drain**: The flame slowly diminishes over time. Rain and storm conditions significantly increase the drain rate.
- **Weather System**: The game transitions through four sections:
  1. *The Procession (Calm)*
  2. *The Wind* (Pushes particles and subtly affects movement)
  3. *The Storm* (Rain + Wind + Increased Flame Drain)
  4. *The Final Journey (Visarjan)*
- **Bappa Blessing**: Activated automatically upon reaching 100% Devotion. Grants temporary invincibility, allowing you to smash through obstacles and collect double points.

## Technical Architecture
- **Engine**: Custom HTML5 Canvas engine (`js/main.js`). No frameworks used.
- **Physics**: True 2D physics system with gravity, velocity, and AABB collision detection (`js/player.js`, `js/entities.js`).
- **Rendering**: Procedural particles, dynamic radial lighting gradients for the flame mask, and camera-bound parallax backgrounds.
- **Audio**: Procedurally synthesized sound effects via the Web Audio API (`js/audio.js`), meaning no external MP3/WAV dependencies are required to experience the audio design.
