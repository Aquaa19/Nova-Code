import { colors } from './colors';

export const glass = {
  panel: {
    backgroundColor: 'rgba(29, 31, 41, 0.4)', // surfaceContainer at ~40%
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  card: {
    backgroundColor: 'rgba(40, 41, 51, 0.6)', // surfaceContainerHigh at ~60%
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  active: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)', // primaryContainer tint
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderWidth: 1,
  },
} as const;
