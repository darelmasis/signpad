import React from 'react';

export interface StrokeOptions {
  size?: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  start?: {
    taper?: number;
    easing?: (t: number) => number;
    cap?: boolean;
  };
  end?: {
    taper?: number;
    easing?: (t: number) => number;
    cap?: boolean;
  };
  easing?: (t: number) => number;
}

export interface SignPadProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: number;
  penColor?: string;
  penSize?: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  backgroundColor?: string;
  onSave?: (dataUrl: string, format: string) => void;
  onClear?: () => void;
  onChange?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface SignPadMethods {
  clear: () => void;
  undo: () => void;
  save: (format?: 'png' | 'jpg' | 'jpeg' | 'svg', quality?: number) => Promise<string | null>;
  download: (filename?: string, format?: 'png' | 'jpg' | 'jpeg' | 'svg') => Promise<void>;
  toBlob: (format?: 'png' | 'jpg' | 'jpeg' | 'svg', quality?: number) => Promise<Blob | null>;
  isEmpty: () => boolean;
  getSvg: () => SVGSVGElement | null;
}

export const SignPad: React.ForwardRefExoticComponent<SignPadProps & React.RefAttributes<SignPadMethods>>;

export interface UseSignPadOptions extends Omit<SignPadProps, 'width' | 'height' | 'className'> {}

export function useSignPad(options?: UseSignPadOptions): {
  signPadProps: SignPadProps;
  clear: () => void;
  undo: () => void;
  save: (format?: 'png' | 'jpg' | 'jpeg' | 'svg', quality?: number) => Promise<string | null>;
  download: (filename?: string, format?: 'png' | 'jpg' | 'jpeg' | 'svg') => Promise<void>;
  toBlob: (format?: 'png' | 'jpg' | 'jpeg' | 'svg', quality?: number) => Promise<Blob | null>;
  isEmpty: boolean;
  getSvg: () => SVGSVGElement | null;
};
