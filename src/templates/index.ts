// src/templates/index.ts
export type ProjectTemplateType = 
  | 'python' | 'node-blank' | 'node-express' 
  | 'html-blank' | 'html-bootstrap' | 'html-canvas' 
  | 'java' | 'c' | 'cpp';

export const TEMPLATES: Record<ProjectTemplateType, { name: string; icon: string; language: string; color: string }> = {
  'python': { name: 'Python App', icon: 'language-python', language: 'python', color: '#3572A5' },
  'node-blank': { name: 'Node.js Blank', icon: 'nodejs', language: 'javascript', color: '#68A063' },
  'node-express': { name: 'Express Server', icon: 'server', language: 'javascript', color: '#E8C84A' },
  'html-blank': { name: 'HTML/CSS/JS', icon: 'language-html5', language: 'html', color: '#E34F26' },
  'html-bootstrap': { name: 'Bootstrap Web', icon: 'bootstrap', language: 'html', color: '#563D7C' },
  'html-canvas': { name: 'Canvas Game', icon: 'gamepad-variant', language: 'html', color: '#00F0FF' },
  'java': { name: 'Java App', icon: 'language-java', language: 'java', color: '#B07219' },
  'c': { name: 'C Program', icon: 'language-c', language: 'c', color: '#555555' },
  'cpp': { name: 'C++ Program', icon: 'language-cpp', language: 'cpp', color: '#F34B7D' }
};