import { colors } from './colors';

export const shadows = {
  headerGlow: {
    shadowColor: colors.primaryFixedDim,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  card: {
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  fabGlow: {
    shadowColor: colors.primaryFixed,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  bottomNav: {
    shadowColor: colors.black,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
} as const;
