export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './radius';
export * from './glass';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { radius } from './radius';
import { glass } from './glass';

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  radius,
  glass,
};

export type Theme = typeof theme;
