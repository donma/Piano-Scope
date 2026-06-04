# 🎵 Piano Scope

> A browser-based MIDI score player with professional music engraving — no server, no build tools, just open and play.

Piano Scope reads standard `.mid` / `.midi` files and renders publication-quality piano sheet music directly in the browser. It supports multi-track MIDI with per-track color coding, real-time playback with a scrolling playhead, and professional notation engraving powered by a custom Canvas rendering engine.

---

## ✨ Features

### Professional Music Engraving
- **Grand Staff** — Treble and bass staves connected by a piano brace
- **SVG Vector Clefs** — Treble and bass clefs rendered with `Path2D` (no font dependency)
- **Key Signature Auto-Detection** — Automatically identifies the key from MIDI note data
- **Time Signature** — Displayed with serif typography
- **Measure Lines** — Regular barlines + final double barline (thin + thick)
- **Ledger Lines** — Properly positioned above and below staves
- **Dots, Ties, Accidentals** — Sharp, flat, natural symbols; dotted rhythms; tie arcs

### Notation Engine
- **Beat Quantization** — Notes snapped to a 16th-note grid (configurable)
- **Chord Grouping** — Same track + same staff + same voice + same beat → merged chord
- **Voice Assignment** — Different tracks get different voice indices on the same staff
- **Stem Direction** — Voice 0 stems up, voice 1 stems down; single-voice follows staff midpoint
- **Beam Grouping** — Eighth and sixteenth notes connected by beams with slope limiting; tracks and voices never cross-beam
- **Rest Rendering** — Whole, half, quarter, eighth, and sixteenth rest symbols (canvas-drawn, not font-dependent)
- **Collision Resolution** — Adjacent noteheads automatically offset to avoid overlap

### Multi-Track Support
- **Per-Track Colors** — 16-color palette, each track gets a distinct color
- **Track Visibility** — Toggle tracks on/off via sidebar checkboxes
- **Engraving Mode** — Noteheads black, track color as subtle background accent (opacity 0.08)
- **Track Mode** — Noteheads colored by track (optional)
- **Playing Highlights** — Active notes glow with track color (opacity 0.18)

### Playback
- **Tone.js PolySynth** — Polyphonic audio synthesis
- **Playhead Cursor** — Red vertical line with inverted triangle indicator
- **Click-to-Seek** — Click anywhere on the score to jump to that position
- **Speed Control** — 0.25x to 2x playback speed
- **Volume Control** — Adjustable slider

### UX
- **Drag & Drop Upload** — Drop a `.mid` file or click to browse
- **Dark / Light Theme** — Toggle with localStorage persistence
- **Responsive Layout** — Sidebar collapses on mobile, player bar wraps, score scrolls horizontally
- **Keyboard Shortcuts** — Spacebar to play/pause

---

## 🚀 Getting Started

No build step. No dependencies to install. Just open `index.html` in a modern browser.

```bash
# Clone the repo
git clone https://github.com/donma/Piano-Scope.git
cd Piano-Scope

# Open directly in browser
open index.html
# or
start index.html
```

### CDN Dependencies (loaded automatically)

| Library | Version | Purpose |
|---------|---------|---------|
| [@tonejs/midi](https://github.com/Tonejs/Midi) | 2.0.28 | MIDI file parsing |
| [Tone.js](https://github.com/Tonejs/Tone.js) | 14.7.77 | Audio synthesis & playback |

These are loaded from jsDelivr CDN in `index.html` — no `npm install` needed.

---

## 📂 Project Structure

```
piano-score-app/
├── index.html              # Single-page application entry
├── css/
│   └── style.css           # Theme system, responsive layout, player UI
├── js/
│   ├── midi-parser.js      # MIDI file parsing (uses @tonejs/midi)
│   ├── score-renderer.js   # Music engraving engine (1900+ lines)
│   ├── audio-player.js     # Tone.js playback controller
│   └── app.js              # Application orchestrator
└── lib/                    # (reserved for local libraries)
```

### Rendering Pipeline

```
MIDI file
  → MidiParser.loadFromFile()
  → normalizeTracks()        // Assign trackId, trackColor, channel
  → detectKeySignature()     // Auto-detect key from note data
  → quantizeNotes()          // Snap to beat grid, preserve metadata
  → assignStaff()            // pitch ≥ 60 → treble, else bass
  → assignVoices()           // Different tracks → different voices
  → groupChords()            // Same track + staff + voice + beat → chord
  → layoutSystems()          // Calculate x/y positions, dynamic measure width
  → resolveCollisions()      // Offset overlapping noteheads
  → drawFrame()              // Render to offscreen canvas, then display
```

---

## 🎹 Usage

1. **Upload** — Drag a `.mid` file onto the upload area, or click "Choose File"
2. **Select Tracks** — Check/uncheck tracks in the left sidebar
3. **Play** — Press the play button or hit Spacebar
4. **Seek** — Click anywhere on the score to jump to that position
5. **Adjust** — Use speed and volume controls in the player bar

---

## 🎨 Color Modes

| Mode | Noteheads | Stems | Track Indicator |
|------|-----------|-------|-----------------|
| **Engraving** (default) | Black | Black | Subtle 0.08 opacity background circle |
| **Track** | Track color | Black | Direct track color on notehead |

Toggle via `scoreRenderer.colorMode = 'engraving'` or `'track'` in the browser console.

---

## 🛠 Technical Notes

- **Canvas Double-Buffering** — All rendering goes to an offscreen canvas, then blitted to the display canvas to prevent flicker
- **HiDPI Support** — Canvas scaled by `devicePixelRatio` for crisp rendering on Retina displays
- **Responsive Re-render** — Window resize triggers a 120ms debounced re-render with recalculated measure widths
- **Diatonic Pitch Mapping** — MIDI pitches mapped to staff positions via `octave * 7 + step` formula
- **Beam Slope Limiting** — Maximum beam slope capped at 0.12 to prevent extreme angles

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- [Tone.js](https://tonejs.github.io/) — Web Audio framework
- [@tonejs/midi](https://github.com/Tonejs/Midi) — MIDI parsing
- Music engraving standards from [Behind Bars](https://www.amazon.com/Behind-Bars-Definitive-Guide-Notation/dp/0571514561) by Elaine Gould
