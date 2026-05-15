// src/templates/index.ts
import { blankTemplate } from './blank';
import { pythonTemplate } from './python';
import { nodeTemplate } from './node';
import { reactNativeTemplate } from './reactNative';

export type ProjectTemplateType = 'blank' | 'react-native' | 'python' | 'node';

export const TEMPLATES: Record<ProjectTemplateType, Array<{ path: string; content: string }>> = {
  'blank': blankTemplate,
  'python': pythonTemplate,
  'node': nodeTemplate,
  'react-native': reactNativeTemplate,
};