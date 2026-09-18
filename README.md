# NESticle Custom Cursor & Barebones Demo

A lightweight, barebones web project and drop-in custom cursor featuring the iconic severed hand with dripping blood from the 1997 DOS NES emulator **NESticle**.

The cursor is packaged as an isolated, zero-dependency module inside [`nesticle-cursor/`](nesticle-cursor/) so you can drop it directly into any other website or project.

![NESticle Cursor Animation](nesticle-cursor/assets/nesticle.gif)

---

## Live Demo

Experience the cursor live here:
👉 **[https://ncmud.net/mekilla/](https://ncmud.net/mekilla/)**

---

## Upstream Project & Credits

- **Cursor Assets Source**: Extracted from [**FragmentedCurve/nesticle-theme**](https://github.com/FragmentedCurve/nesticle-theme), which extracted and rendered the original 4 cursor animation frames directly from NESticle's binary code into an X11 cursor theme.
- **Original NESticle Emulator**: Created in 1997 by **Icer Addis** (Sardu) of **Bloodlust Software**. NESticle was famed for its humor and edgy 90s aesthetic, including this custom pointer.

---

## Cursor Modes & Browser Compatibility

Because modern web browsers (Chrome, Safari, Firefox) intentionally do not animate GIF images when set via standard CSS `cursor: url('...'), auto;`, this project provides three modes to handle every use case:

| Mode | Description | Latency | Animation | Best Used For |
|---|---|---|---|---|
| **Hybrid** *(Default)* | Hardware OS cursor across open space + DOM Follower seamlessly taking over with interactive hover effects when hovering controls. | Zero latency on open canvas; smooth interactive effects over controls | 200ms frame loop | Best overall balance: maximum speed with rich control feedback. |
| **Native OS Swapper** | Uses the operating system's native hardware cursor everywhere, forcing frame updates across all elements (including buttons/inputs). | Zero latency everywhere | 200ms frame swapping | Pure hardware-level performance across the entire screen. |
| **Follower** | Lightweight DOM element tracking mouse coordinates everywhere with hardware-accelerated CSS `translate3d`. | 60+ fps fluid tracking | Full 200ms dripping blood loop | Consistent custom DOM rendering everywhere. |
| **Static CSS** | Pure CSS fallback using Frame 0 (pointing severed hand) with zero JavaScript required. | Zero latency | Static (no drip) | Minimalist setups or non-JS environments. |

---

## Running Locally

This project uses **[Deno](https://deno.com/)** as its primary runtime:

```bash
# Start the local development server (port 3000)
deno task dev
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

### Other Useful Tasks

```bash
# Run Deno linter
deno task lint

# Run Deno type/syntax checks
deno task check

# Deploy via SCP to remote server (ncmud.net)
deno task deploy
```

*(Alternative using Python: `uv run python -m http.server 3000`)*

---

## How to Use the Cursor in Another Project

The cursor is self-contained in the [`nesticle-cursor/`](nesticle-cursor/) folder.

### 1. Copy the Directory
Copy the [`nesticle-cursor/`](nesticle-cursor/) directory into your destination web project.

### 2. Add to Your HTML
```html
<!-- Include stylesheet and script -->
<link rel="stylesheet" href="nesticle-cursor/nesticle-cursor.css">
<script src="nesticle-cursor/nesticle-cursor.js"></script>

<script>
  const cursor = new NesticleCursor({
    mode: 'follower',    // 'follower' | 'native-swap' | 'static'
    scale: 1,            // 1 = 42x62px, 1.5 = 63x93px, 2 = 84x124px
    clickEffect: true    // Optional retro blood drop splatter on click
  });
</script>
```

### 3. React / Next.js / Vue Usage
```jsx
import { useEffect } from 'react';
import './nesticle-cursor/nesticle-cursor.css';
import NesticleCursor from './nesticle-cursor/nesticle-cursor.js';

export default function App() {
  useEffect(() => {
    const cursor = new NesticleCursor({
      mode: 'follower',
      basePath: '/nesticle-cursor/'
    });

    return () => cursor.destroy();
  }, []);

  return <div>Your application content</div>;
}
```

### 4. Zero-JS Pure CSS Option
```css
html, body, a, button, input {
  cursor: url('nesticle-cursor/assets/nesticle.png') 0 0, auto !important;
}
```

---

## Configuration API

```javascript
const cursor = new NesticleCursor({
  mode: 'follower',                // 'follower' | 'native-swap' | 'static'
  scale: 1,                        // Scaling factor (default: 1)
  clickEffect: true,               // Enable/disable pixelated blood splatter on click
  basePath: './nesticle-cursor/',  // Relative or absolute path to assets directory
  target: document.documentElement // Target element or CSS selector (default: root)
});

// Dynamic methods:
cursor.setMode('native-swap');     // Switch modes at runtime
cursor.setScale(1.5);              // Resize cursor
cursor.setClickEffect(false);      // Toggle click splatter
cursor.destroy();                  // Unbind events, remove DOM elements, restore OS cursor
```

---

## Project Structure

```
mekilla/
├── index.html                     # Minimal barebones demo website
├── style.css                      # Demo page styling
├── main.js                        # Demo interactivity and mode controls
├── deno.json                      # Deno tasks (dev, serve, lint, check, deploy)
├── package.json                   # Convenience scripts
├── README.md                      # This file
└── nesticle-cursor/               # PORTABLE CURSOR PACKAGE (Drop this anywhere!)
    ├── nesticle-cursor.js         # Zero-dependency controller (UMD / ES Module)
    ├── nesticle-cursor.css        # Follower styles, cursor suppression, splatter
    ├── README.md                  # Drop-in integration reference
    └── assets/
        ├── nesticle.gif           # 4-frame transparent animated GIF (42x62 px, 200ms)
        ├── nesticle.png           # Frame 0 static pointing finger PNG
        ├── spritesheet.png        # 168x62 px horizontal 4-frame sprite sheet
        └── frames/                # Extracted individual PNG frames (200ms delay each)
            ├── frame_0.png
            ├── frame_1.png
            ├── frame_2.png
            └── frame_3.png
```

---

## License & Attribution

- Cursor art originally by **Icer Addis / Bloodlust Software** (NESticle, 1997).
- Cursor extraction by **FragmentedCurve** via [nesticle-theme](https://github.com/FragmentedCurve/nesticle-theme).
- Web port, JavaScript controller, and demo website provided under the MIT License.
