# NESticle Custom Cursor Package

A drop-in web custom cursor based on the iconic severed hand cursor with dripping blood from the NESticle emulator ([FragmentedCurve/nesticle-theme](https://github.com/FragmentedCurve/nesticle-theme)).

<p align="left">
  <img src="assets/nesticle.gif" width="105" alt="NESticle Cursor" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/spritesheet.png" width="280" alt="Spritesheet" />
</p>

## Files Included

```
nesticle-cursor/
├── nesticle-cursor.js     # Zero-dependency controller (UMD / ES Module)
├── nesticle-cursor.css    # Cursor styling and click splatter particles
└── assets/
    ├── nesticle.gif       # 4-frame transparent animated GIF (42x62 px, 200ms)
    ├── nesticle.png       # Frame 0 static pointing finger PNG
    ├── spritesheet.png    # 168x62 px horizontal 4-frame sprite sheet
    └── frames/            # Extracted individual PNG frames (200ms delay each)
        ├── frame_0.png
        ├── frame_1.png
        ├── frame_2.png
        └── frame_3.png
```

---

## Quick Start Options

### Option 1: 1-Line Drop-in (Animated Hardware Cursor)

```html
<!-- Include stylesheet and script -->
<link rel="stylesheet" href="nesticle-cursor/nesticle-cursor.css">
<script src="nesticle-cursor/nesticle-cursor.js"></script>

<script>
  const cursor = new NesticleCursor({
    scale: 1,            // Scale factor (1 = 42x62px, 1.5 = 63x93px, 2 = 84x124px)
    clickEffect: true    // Spawns retro pixel blood droplets on click
  });
</script>
```

### Option 2: Pure Static CSS (Zero JavaScript)

If you only want the retro pointing hand as a static native cursor without animations or JS:

```css
html, body {
  cursor: url('nesticle-cursor/assets/nesticle.png') 0 0, auto;
}

/* Ensure links and buttons also use it */
a, button, input {
  cursor: url('nesticle-cursor/assets/nesticle.png') 0 0, pointer;
}
```

---

## Configuration API

```javascript
const cursor = new NesticleCursor({
  animated: true,                 // true = animated dripping blood, false = static hand
  scale: 1.0,                     // 1 = 42x62px, 1.5 = 63x93px, 2 = 84x124px
  clickEffect: true,              // Blood splatter particles on click
  basePath: './nesticle-cursor/', // Path to folder containing assets/
  target: document.documentElement// Target element
});

// Runtime methods:
cursor.setAnimated(false);        // Toggle animation on/off
cursor.setScale(1.5);             // Adjust scale
cursor.setClickEffect(false);     // Enable/disable click splatter
cursor.destroy();                 // Remove and restore default cursor
```

## React / Next.js Usage

```jsx
import { useEffect } from 'react';
import './nesticle-cursor/nesticle-cursor.css';
import NesticleCursor from './nesticle-cursor/nesticle-cursor.js';

export default function App() {
  useEffect(() => {
    const cursor = new NesticleCursor({
      basePath: '/nesticle-cursor/'
    });
    return () => cursor.destroy();
  }, []);

  return <div>Your content here</div>;
}
```
