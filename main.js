// Main demo script
document.addEventListener('DOMContentLoaded', () => {
  // Initialize NESticle Cursor
  const cursor = new NesticleCursor({
    mode: 'animated',
    scale: 1,
    clickEffect: true,
    basePath: './nesticle-cursor/'
  });

  // Wire up controls
  const modeSelect = document.getElementById('mode-select');
  const scaleSelect = document.getElementById('scale-select');
  const splatterToggle = document.getElementById('splatter-toggle');

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      cursor.setMode(e.target.value);
    });
  }

  if (scaleSelect) {
    scaleSelect.addEventListener('change', (e) => {
      cursor.setScale(parseFloat(e.target.value));
    });
  }

  if (splatterToggle) {
    splatterToggle.addEventListener('change', (e) => {
      cursor.setClickEffect(e.target.checked);
    });
  }

  // Interactive buttons
  const btnCount = document.getElementById('btn-count');
  const clickCountSpan = document.getElementById('click-count');
  let count = 0;

  if (btnCount && clickCountSpan) {
    btnCount.addEventListener('click', () => {
      count += 1;
      clickCountSpan.textContent = count;
    });
  }

  const btnSplatter = document.getElementById('btn-splatter');
  if (btnSplatter) {
    btnSplatter.addEventListener('click', () => {
      // Direct visual feedback on the button
      btnSplatter.style.transform = 'scale(0.96)';
      setTimeout(() => {
        btnSplatter.style.transform = '';
      }, 100);
    });
  }

  // Prevent default jump for the test link
  const testLink = document.getElementById('test-link');
  if (testLink) {
    testLink.addEventListener('click', (e) => {
      e.preventDefault();
    });
  }
});
