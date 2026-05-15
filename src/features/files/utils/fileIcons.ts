// src/features/files/utils/fileIcons.ts

export const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  js:   { icon: 'language-javascript', color: '#F7DF1E' },
  ts:   { icon: 'language-typescript', color: '#3178C6' },
  tsx:  { icon: 'react', color: '#61DAFB' },
  jsx:  { icon: 'react', color: '#61DAFB' },
  py:   { icon: 'language-python', color: '#3572A5' },
  java: { icon: 'language-java', color: '#ffdfb3ff' },
  cpp:  { icon: 'language-cpp', color: '#F34B7D' },
  c:    { icon: 'language-c', color: '#555555' },
  html: { icon: 'language-html5', color: '#E34C26' },
  css:  { icon: 'language-css3', color: '#563D7C' },
  json: { icon: 'code-json', color: '#CBCB41' },
  md:   { icon: 'language-markdown', color: '#083FA1' },
  sh:   { icon: 'bash', color: '#89E051' },
  rs:   { icon: 'language-rust', color: '#DEA584' },
  go:   { icon: 'language-go', color: '#00ADD8' },
  dir:  { icon: 'folder', color: '#E8C84A' },
  dir_open: { icon: 'folder-open', color: '#E8C84A' }
};


export function getFileIcon(extension: string, isDirectory: boolean, isExpanded: boolean = false) {
  if (isDirectory) return isExpanded ? FILE_ICONS.dir_open : FILE_ICONS.dir;
  return FILE_ICONS[extension] ?? { icon: 'file-outline', color: '#888888' };
}