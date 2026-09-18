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
      const script = document.currentScript || (typeof document.querySelector === 'function' ? document.querySelector('script[src*="nesticle-cursor.js"]') : null);
      if (script && script.src) {
        return script.src.substring(0, script.src.lastIndexOf('/')) + '/';
      }
    }
    return './nesticle-cursor/';
  }

  const DEFAULT_BASE_PATH = getScriptBasePath();

  // Embedded base64 fallback frames (ensures zero-latency, CORS-safe scaling everywhere)
  const EMBEDDED_FRAMES = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAA+CAYAAABdhInWAAAB1ElEQVR4nO3YIVbEMBSF4SwHg0AgkAgEAoFEIJBIBAKBQSJZAAtAIpBshgV0CcOQwy9yT1/T0GGSl5mcc0VnOs3X6UubNIQQVpk003xBX29OYp4uD2PuLw5iQkNgX9Dnq6OYt9vTmI+7sxjgoQGwLygggIAVXhPsC/pyfZxEgYTva4DdQBMwJaCloNDq/6wH6CRY4UB5UNQAu4EmYEBWKQCt/s96gCZgJikKnQHeGtwNNAHnbl8KrlESbqAJeMEg29qSp3loPKBCgFqTGAYhE3NOkO3/WPI0D02AOrHWaaEVQIQT1RJaAm4eOrqMZltLQKd/nw/nMVap6GBbAm4eGnfQwUHxW4NHOwZKtFTYz/q8fyjbgK0XFkQvvR5HS0hPuD8okFxHeolzLzCszzX9QfVSaAcWzALlYKRkUPmElnZk7Tf39yWDyhdUJxvWDTwHLgUSBnMX0FFwaUebSlfQBGxNfEtvQzqte1wfeypdQhMw0RcROnG2oHz/vj7GT76MrH7DdpfQBKyLNl0O66NQL7lCh2FIslPQBKzRJYsu5gBaUKsUdgJadAJAue3MHUR76NwTyMH20L+2li75ZHMDpSkMeE3TaHMD3bdNNx6ptR3ZloN+Aw7o1MswgxIpAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAA+CAYAAABdhInWAAAB1klEQVR4nO3YIVLEMBTG8RwHg0AgkAgEAoFEIJBIBAKBQSI5AAdAIpBchgP0CMtuhr/IN32bZrrb5GXJzCe6221/3by0SUMIYZVJM80X9P3uLObl+jjm8eooJjQE9gV9vTmJ+bg/j/l6uIgBHhoA+4ICAghY4TXBvqBvt6dJFEj4vgbYDTQBUwJaCgqt/s96gG4FKxwoD4oaYDfQBAzIKgWg1f9ZD9AEzCRFoRPAi8HdQBNw7val4Bol4QaagGcMssWWPM1D4wEVAtSaxDAImZhzgWzvY8nTPDQB6sRap4VWABEuVEtoDrh56Ogymm0tAZ3+fT9dxlilooNtDrh5aNxBBwfFbw0ePTFQoqXCftbn/UPZBmy9sCDa9XocLSG94P6gQHIn0i7OvcCwPtf0B9Wu0BNYMAuUg5GSQeUTWnoia7+pvy8ZVL6gOtmwbuA5cCmQMJi7gI6CS0+0q3QFTcDWxLf0NqTTuuf1sbelS2gCJvoiQifOFpTvP9fH2OTHyOovbHcJTcC6aNPlsD4KtcsVOgxDkoOCJmCNLll0MQfQglqlcBDQogsAym3HAu1yMHUDnXQBOdgSXe8eOtr+oftqCmoOSHMD5QFQ25FtbqDNdrW2HPQXaw3ja81bZeoAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAA+CAYAAABdhInWAAAB00lEQVR4nO3YIVLDQBTG8RwHg0AgkAgEAoFEIJBIBAKBQSI5AAdAIpBchgP0CKXd4S/eN3nd7KTt7tuyM59Imia/NG+3uxmGYVhm0kyLBX2/O0t5uT5Oebw6ShkaAseCvt6cpHzcn6d8PVykAB8aAMeCAgIIWOE1wbGgb7enJgokfF4DHAZqwJSAloJCq/+yEaAbwQoHyh9FDXAYqAED8koBaPVfNgLUgJmkKHQCeG/wMFADzg1fCq5REmGgBjyjk+1tydM8NJ1QIUC9SQydkIk5N8j2LpY8zUMNUCfWOi30Aohwo1pCc8DNQ0eX0WxrCej07/vpMsUrFe1sc8DNQ9MB2jkofq/z6IWBEi0VjvP29w9lG7D3woLoo9fzaAnpDfcHBZK7kD7i3AsMb7+mP6g+Cr2AB/NAORgp6VQxoaUX8o6b+v2SThULqpMNbwDPgUuBhM7cBXQUXHqhbaUrqAF7E9/SYUindc+rc29Kl1ADJvoiQifOHpTPP1fnWOfHyfIvbHcJNWBdtOlyWP8K9ZErdLFYmBwU1IA1umTRxRxAD+qVwkFAi24AKMPO1E70D516AzlYDWA46Gjb5gC/0xYGSmv2kWsLB526v1oLA/VaOOgvWO3VH5uzFPMAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAA+CAYAAABdhInWAAABzElEQVR4nO3YIVYDMRQF0CwHgUEgkIgKBAKJQCCRCEQFAotkASwAiUCyGRYwSyjlH57478xrGqZt8sPknCemM53cdJI0mZRSWmXSTIkFfb09szxdHVseLo8sqSFwLOjz9Ynl7e7c8nG/sACeGgDHggIEIMAMrwmOBX25OXVhIILzNcBhoA6MLsBdgaHVf9kI0I1ghgOKP4oa4DBQBwZIdQVAq/+yEaAOjEUKQ7cAHwweBurAuemLwTW6RBioA08YZAfb8jQPtRsyBFC1iMEgxMIcDcTxPrY8zUMdkBfWvCxUAQhBQ7kLTQE3Dx3dRuOYuwAv/z6XFxbVVXiwTQE3D7ULeHCg86vBwxUDinBXwXXq8/6hOAZYvbBA+NHzfbgLcYP7gwKSq4gfce4Fhvqc0x+UHwVXoGAKlIMhJYMqJrS0InXdtt8vGVSxoLzYUBN4DlwKRDCYu4COgksr2lW6gjqwWviWTkO8rHtc33tTuoQ6MMIvInjhrKA4/76+x0++RFa/wXGXUAfmTRtvh/mvkB85Q4dhcPlXUAfm8JaFN3MAKuguH304aFEDAMW0o0Az9K8NUKCawHDQ0aImfD5f0+ggzUO5zNC5zGXP5Rv0/cY/7dFdVgAAAABJRU5ErkJggg=='
  ];

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
        gif: this.options.gif || (this.basePath + 'assets/nesticle.gif'),
        staticPng: this.options.staticPng || (this.basePath + 'assets/nesticle.png'),
        frames: this.options.frames || [
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
      this.scale = Math.max(0.25, Math.min(Number(this.options.scale) || 1, 4));
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

      // Image caches for dynamic nearest-neighbor cursor scaling
      this._scaledFramesCache = new Map();
      this._scaledStaticCache = new Map();
      this._frameImages = [];
      this._staticImage = null;
      this._embeddedImages = [];

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
      // Preload embedded base64 images for instantaneous fallback scaling
      this._embeddedImages = EMBEDDED_FRAMES.map((b64) => {
        const img = new Image();
        img.src = b64;
        return img;
      });

      // Preload asset frame images
      this._frameImages = this.assets.frames.map((src) => {
        const img = new Image();
        if (typeof location !== 'undefined' && src.startsWith('http') && !src.startsWith(location.origin)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => this._onAssetLoaded();
        img.src = src;
        return img;
      });

      // Preload static PNG image
      this._staticImage = new Image();
      if (typeof location !== 'undefined' && this.assets.staticPng.startsWith('http') && !this.assets.staticPng.startsWith(location.origin)) {
        this._staticImage.crossOrigin = 'anonymous';
      }
      this._staticImage.onload = () => this._onAssetLoaded();
      this._staticImage.src = this.assets.staticPng;

      // Preload animated GIF
      const gifImg = new Image();
      gifImg.src = this.assets.gif;
    }

    _createScaledDataUrl(img, scale, fallbackIdx) {
      if (typeof document === 'undefined') return null;
      try {
        const srcW = img.naturalWidth || 42;
        const srcH = img.naturalHeight || 62;
        const targetW = Math.round(srcW * scale);
        const targetH = Math.round(srcH * scale);
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Pixel-perfect nearest-neighbor interpolation
        ctx.imageSmoothingEnabled = false;
        if ('webkitImageSmoothingEnabled' in ctx) ctx.webkitImageSmoothingEnabled = false;
        if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = false;
        if ('msImageSmoothingEnabled' in ctx) ctx.msImageSmoothingEnabled = false;

        ctx.drawImage(img, 0, 0, targetW, targetH);
        return canvas.toDataURL('image/png');
      } catch (_err) {
        // Fallback to embedded frame if canvas is tainted (e.g. file:// protocol)
        if (typeof fallbackIdx === 'number' && this._embeddedImages[fallbackIdx]) {
          try {
            const fallbackImg = this._embeddedImages[fallbackIdx];
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(42 * scale);
            canvas.height = Math.round(62 * scale);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
              return canvas.toDataURL('image/png');
            }
          } catch (_) {
            // Ignore
          }
        }
        return null;
      }
    }

    _getScaledFrames(scale) {
      if (scale === 1) {
        return this.assets.frames;
      }
      if (this._scaledFramesCache.has(scale)) {
        return this._scaledFramesCache.get(scale);
      }
      const scaled = [];
      let allReady = true;
      for (let i = 0; i < this._frameImages.length; i++) {
        const img = this._frameImages[i];
        let dataUrl = null;
        if (img && img.complete && img.naturalWidth > 0) {
          dataUrl = this._createScaledDataUrl(img, scale, i);
        } else if (this._embeddedImages[i] && this._embeddedImages[i].complete) {
          dataUrl = this._createScaledDataUrl(this._embeddedImages[i], scale, i);
        }

        if (dataUrl) {
          scaled.push(dataUrl);
        } else {
          allReady = false;
          scaled.push(this.assets.frames[i]);
        }
      }
      if (allReady) {
        this._scaledFramesCache.set(scale, scaled);
      }
      return scaled;
    }

    _getScaledStatic(scale) {
      if (scale === 1) {
        return this.assets.staticPng;
      }
      if (this._scaledStaticCache.has(scale)) {
        return this._scaledStaticCache.get(scale);
      }
      let dataUrl = null;
      const img = this._staticImage;
      if (img && img.complete && img.naturalWidth > 0) {
        dataUrl = this._createScaledDataUrl(img, scale, 0);
      } else if (this._embeddedImages[0] && this._embeddedImages[0].complete) {
        dataUrl = this._createScaledDataUrl(this._embeddedImages[0], scale, 0);
      }

      if (dataUrl) {
        this._scaledStaticCache.set(scale, dataUrl);
        return dataUrl;
      }
      return this.assets.staticPng;
    }

    _onAssetLoaded() {
      if (this.scale !== 1) {
        if (this.mode === 'native-swap') {
          this._updateNativeSwapCursor();
        } else if (this.mode === 'static') {
          this._setupStatic();
        }
      }
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
      } else if (this.followerImg) {
        this.followerImg.style.width = `${Math.round(42 * this.scale)}px`;
        this.followerImg.style.height = `${Math.round(62 * this.scale)}px`;
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
      this.scale = Math.max(0.25, Math.min(Number(scale) || 1, 4));
      if (this.followerImg) {
        this.followerImg.style.width = `${Math.round(42 * this.scale)}px`;
        this.followerImg.style.height = `${Math.round(62 * this.scale)}px`;
      }
      if (this.mode === 'native-swap') {
        this._updateNativeSwapCursor();
      } else if (this.mode === 'static') {
        this._setupStatic();
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

    _updateNativeSwapCursor() {
      const styleEl = this._getSwapStyleElement();
      if (styleEl) {
        const frames = this._getScaledFrames(this.scale);
        const frameUrl = frames[this.currentFrameIdx % frames.length];
        styleEl.textContent = `*, *::before, *::after { cursor: url("${frameUrl}") 0 0, auto !important; }`;
      }
    }

    _setupNativeSwap() {
      this._getSwapStyleElement();
      this.currentFrameIdx = 0;

      const tick = () => {
        this._updateNativeSwapCursor();
        this.currentFrameIdx = (this.currentFrameIdx + 1) % this.assets.frames.length;
      };

      tick();
      this.swapIntervalId = setInterval(tick, 200);
    }

    _setupStatic() {
      const styleEl = this._getSwapStyleElement();
      if (styleEl) {
        const staticUrl = this._getScaledStatic(this.scale);
        styleEl.textContent = `*, *::before, *::after { cursor: url("${staticUrl}") 0 0, auto !important; }`;
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
      const splatterScale = Math.max(0.75, Math.min(this.scale, 2.5));

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'nesticle-splatter-particle';

        const baseSize = Math.floor(Math.random() * 3) + 2;
        const size = Math.round(baseSize * splatterScale);
        const color = colors[Math.floor(Math.random() * colors.length)];

        const angle = (Math.PI * 0.2) + Math.random() * (Math.PI * 0.6);
        const distance = (15 + Math.random() * 35) * splatterScale;
        const vx = Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : -1);
        const vy = Math.sin(angle) * distance + (10 * splatterScale);

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
        this.followerImg = null;
      }
      this._scaledFramesCache.clear();
      this._scaledStaticCache.clear();
    }
  }

  return NesticleCursor;
});
