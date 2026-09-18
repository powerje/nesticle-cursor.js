/// <reference lib="dom" />

export interface NesticleCursorOptions {
  /**
   * Whether to animate the dripping blood frames.
   * If false, renders as a static pointing hand cursor.
   * @default true
   */
  animated?: boolean;

  /**
   * Cursor rendering mode: 'animated' (cycles the 4 frames) or 'static'.
   * 'native-swap' is accepted as an alias for 'animated'.
   * @default 'animated'
   */
  mode?: 'animated' | 'static' | 'native-swap';

  /**
   * Scale factor for the cursor (1 = 42x62px, 1.5 = 63x93px, 2 = 84x124px).
   * Supports values from 0.25 to 4.
   * @default 1
   */
  scale?: number;

  /**
   * Whether to spawn pixelated retro blood splatter particles on click.
   * @default true
   */
  clickEffect?: boolean;

  /**
   * Base directory path where the assets/ folder is located.
   * @default './nesticle-cursor/'
   */
  basePath?: string;

  /**
   * Target container element or CSS selector.
   * @default document.documentElement
   */
  target?: HTMLElement | string | null;

  /**
   * Optional custom array of frame image URLs (4 frames expected).
   */
  frames?: string[];

  /**
   * Optional custom static PNG image URL.
   */
  staticPng?: string;
}

export declare class NesticleCursor {
  options: NesticleCursorOptions;
  mode: 'animated' | 'static';
  scale: number;
  clickEffect: boolean;
  basePath: string;

  constructor(options?: NesticleCursorOptions);

  /**
   * Switch between 'animated' and 'static' modes.
   */
  applyMode(mode: 'animated' | 'static' | 'native-swap'): void;

  /**
   * Switch between 'animated' and 'static' modes.
   */
  setMode(mode: 'animated' | 'static' | 'native-swap'): void;

  /**
   * Enable or disable the dripping blood animation at runtime.
   */
  setAnimated(animated: boolean): void;

  /**
   * Dynamically adjust cursor scale (e.g. 1, 1.5, 2).
   */
  setScale(scale: number): void;

  /**
   * Enable or disable click blood splatter particles.
   */
  setClickEffect(enabled: boolean): void;

  /**
   * Clean up all event listeners, timer intervals, and injected styles.
   */
  destroy(): void;
}

export default NesticleCursor;
