/**
 * NESticle Custom Cursor
 * Standalone, zero-dependency cursor implementation based on the classic NESticle severed hand cursor.
 * Supports Native Frame-Swapper mode (OS hardware cursor everywhere), Follower mode (animated GIF),
 * and Static CSS.
 */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.NesticleCursor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Base path resolution for assets relative to script location
  function getScriptBasePath() {
    if (typeof document !== 'undefined') {
      const script = document.currentScript || document.querySelector('script[src*="nesticle-cursor.js"]');
      if (script && script.src) {
        return script.src.substring(0, script.src.lastIndexOf('/')) + '/';
      }
    }
    return './nesticle-cursor/';
  }

  const DEFAULT_BASE_PATH = getScriptBasePath();

  class NesticleCursor {
    /**
     * @param {Object} options
     * @param {'native-swap'|'follower'|'static'} [options.mode='native-swap'] Cursor rendering mode
     * @param {number} [options.scale=1] Scale factor (1 = 42x62px)
     * @param {boolean} [options.clickEffect=true] Spawn pixelated blood drops on click
     * @param {string} [options.basePath] Base path for assets directory
     * @param {HTMLElement|string} [options.target=document.documentElement] Target container
     */
    constructor(options = {}) {
      this.options = Object.assign({
        mode: 'native-swap',
        scale: 1,
        clickEffect: true,
        basePath: DEFAULT_BASE_PATH,
        target: null
      }, options);

      this.basePath = this.options.basePath;
      if (!this.basePath.endsWith('/')) {
        this.basePath += '/';
      }

      this.assets = {
        gif: this.basePath + 'assets/nesticle.gif',
        staticPng: this.basePath + 'assets/nesticle.png',
        frames: [
          this.basePath + 'assets/frames/frame_0.png',
          this.basePath + 'assets/frames/frame_1.png',
          this.basePath + 'assets/frames/frame_2.png',
          this.basePath + 'assets/frames/frame_3.png'
        ]
      };

      this.target = typeof this.options.target === 'string'
        ? document.querySelector(this.options.target)
        : (this.options.target || document.documentElement);

      this.mode = this.options.mode;
      this.scale = this.options.scale;
      this.clickEffect = this.options.clickEffect;

      // Internal state
      this.followerEl = null;
      this.followerImg = null;
      this.swapStyleEl = null;
      this.swapIntervalId = null;
      this.currentFrameIdx = 0;
      this.mouseX = -100;
      this.mouseY = -100;
      this.isInside = false;
      this.isMouseDown = false;
      this.isTouchDevice = typeof globalThis !== 'undefined' &&
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia('(hover: none) and (pointer: coarse)').matches;

      // Bound event handlers
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);
      this._onPointerEnter = this._onPointerEnter.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onWindowBlur = this._onWindowBlur.bind(this);

      this.init();
    }

    init() {
      this._preloadAssets();
      if (!this.isTouchDevice) {
        this.applyMode(this.mode);
      }
      this._bindGlobalEvents();
    }

    _preloadAssets() {
      const toPreload = [this.assets.gif, this.assets.staticPng, ...this.assets.frames];
      toPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }

    _createFollowerDom() {
      if (!this.followerEl && typeof document !== 'undefined') {
        this.followerEl = document.createElement('div');
        this.followerEl.className = 'nesticle-cursor-follower';
        this.followerEl.setAttribute('aria-hidden', 'true');

        this.followerImg = document.createElement('img');
        this.followerImg.src = this.assets.gif;
        this.followerImg.alt = '';
        this.followerImg.style.width = `${Math.round(42 * this.scale)}px`;
        this.followerImg.style.height = `${Math.round(62 * this.scale)}px`;

        this.followerEl.appendChild(this.followerImg);
        document.body.appendChild(this.followerEl);
      }
    }

    _bindGlobalEvents() {
      globalThis.addEventListener('pointermove', this._onPointerMove, { passive: true });
      globalThis.addEventListener('pointerdown', this._onPointerDown, { passive: true });
      globalThis.addEventListener('pointerup', this._onPointerUp, { passive: true });
      document.addEventListener('pointerenter', this._onPointerEnter);
      document.addEventListener('pointerleave', this._onPointerLeave);
      globalThis.addEventListener('blur', this._onWindowBlur);
    }

    _unbindGlobalEvents() {
      globalThis.removeEventListener('pointermove', this._onPointerMove);
      globalThis.removeEventListener('pointerdown', this._onPointerDown);
      globalThis.removeEventListener('pointerup', this._onPointerUp);
      document.removeEventListener('pointerenter', this._onPointerEnter);
      document.removeEventListener('pointerleave', this._onPointerLeave);
      globalThis.removeEventListener('blur', this._onWindowBlur);
    }

    /**
     * Apply active mode
     */
    applyMode(mode) {
      this.mode = mode;
      this._cleanupCurrentMode();

      if (mode === 'follower') {
        this._setupFollower();
      } else if (mode === 'native-swap') {
        this._setupNativeSwap();
      } else if (mode === 'static') {
        this._setupStatic();
      }
    }

    setMode(newMode) {
      if (['native-swap', 'follower', 'static'].includes(newMode)) {
        this.applyMode(newMode);
      }
    }

    setScale(scale) {
      this.scale = Math.max(0.25, Math.min(scale, 4));
      if (this.followerImg) {
        this.followerImg.style.width = `${Math.round(42 * this.scale)}px`;
        this.followerImg.style.height = `${Math.round(62 * this.scale)}px`;
      }
    }

    setClickEffect(enabled) {
      this.clickEffect = Boolean(enabled);
    }

    _getSwapStyleElement() {
      if (!this.swapStyleEl && typeof document !== 'undefined') {
        this.swapStyleEl = document.createElement('style');
        this.swapStyleEl.id = 'nesticle-swap-style';
        document.head.appendChild(this.swapStyleEl);
      }
      return this.swapStyleEl;
    }

    _setupFollower() {
      this._createFollowerDom();
      this.target.classList.add('nesticle-cursor-none');
      if (this.followerEl) {
        this.followerEl.style.display = 'block';
        if (this.isInside) {
          this.followerEl.classList.add('visible');
        }
      }
    }

    _setupNativeSwap() {
      const styleEl = this._getSwapStyleElement();
      let frameIdx = 0;

      const updateCursor = () => {
        const frameUrl = this.assets.frames[frameIdx];
        if (styleEl) {
          styleEl.textContent = `*, *::before, *::after { cursor: url("${frameUrl}") 0 0, auto !important; }`;
        }
        frameIdx = (frameIdx + 1) % this.assets.frames.length;
      };

      updateCursor();
      this.swapIntervalId = setInterval(updateCursor, 200);
    }

    _setupStatic() {
      const styleEl = this._getSwapStyleElement();
      if (styleEl) {
        styleEl.textContent = `*, *::before, *::after { cursor: url("${this.assets.staticPng}") 0 0, auto !important; }`;
      }
    }

    _cleanupCurrentMode() {
      this.target.classList.remove('nesticle-cursor-none');
      this.target.classList.remove('nesticle-cursor-static');

      if (this.swapStyleEl) {
        this.swapStyleEl.textContent = '';
      }

      if (this.swapIntervalId) {
        clearInterval(this.swapIntervalId);
        this.swapIntervalId = null;
      }

      if (this.followerEl) {
        this.followerEl.style.display = 'none';
        this.followerEl.classList.remove('visible', 'clicking');
      }
    }

    _onPointerMove(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (!this.isInside) {
        this.isInside = true;
      }

      if (this.mode === 'follower' && this.followerEl) {
        this.followerEl.classList.add('visible');
        this.followerEl.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
      }
    }

    _onPointerDown(e) {
      this.isMouseDown = true;
      if (this.followerEl && this.mode === 'follower') {
        this.followerEl.classList.add('clicking');
      }

      if (this.clickEffect) {
        this._spawnBloodSplatter(e.clientX, e.clientY);
      }
    }

    _onPointerUp() {
      this.isMouseDown = false;
      if (this.followerEl) {
        this.followerEl.classList.remove('clicking');
      }
    }

    _onPointerEnter() {
      this.isInside = true;
      if (this.followerEl && this.mode === 'follower') {
        this.followerEl.classList.add('visible');
      }
    }

    _onPointerLeave() {
      this.isInside = false;
      if (this.followerEl) {
        this.followerEl.classList.remove('visible');
      }
    }

    _onWindowBlur() {
      this.isInside = false;
      if (this.followerEl) {
        this.followerEl.classList.remove('visible');
      }
    }

    _spawnBloodSplatter(x, y) {
      const colors = ['#e60000', '#c80000', '#990000', '#550000', '#ffffff'];
      const count = 7;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'nesticle-splatter-particle';

        const size = Math.floor(Math.random() * 3) + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        const angle = (Math.PI * 0.2) + Math.random() * (Math.PI * 0.6);
        const distance = 15 + Math.random() * 35;
        const vx = Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : -1);
        const vy = Math.sin(angle) * distance + 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--vx', `${vx}px`);
        particle.style.setProperty('--vy', `${vy}px`);

        document.body.appendChild(particle);

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 650);
      }
    }

    destroy() {
      this._unbindGlobalEvents();
      this._cleanupCurrentMode();
      if (this.swapStyleEl && this.swapStyleEl.parentNode) {
        this.swapStyleEl.parentNode.removeChild(this.swapStyleEl);
        this.swapStyleEl = null;
      }
      if (this.followerEl && this.followerEl.parentNode) {
        this.followerEl.parentNode.removeChild(this.followerEl);
        this.followerEl = null;
      }
    }
  }

  return NesticleCursor;
});
