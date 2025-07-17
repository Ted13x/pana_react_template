/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': {
      src: string;
      alt?: string;
      'camera-controls'?: boolean;
      'auto-rotate'?: boolean;
      'shadow-intensity'?: string;
      'environment-image'?: string;
      style?: React.CSSProperties;
    };
  }
}
