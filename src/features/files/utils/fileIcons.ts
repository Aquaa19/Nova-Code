// src/features/files/utils/fileIcons.ts

export const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  js:   { icon: 'hexagon-outline', color: '#F7DF1E' },
  ts:   { icon: 'hexagon-outline', color: '#3178C6' },
  tsx:  { icon: 'hexagon-outline', color: '#61DAFB' },
  jsx:  { icon: 'hexagon-outline', color: '#61DAFB' },
  py:   { icon: 'hexagon-outline', color: '#3572A5' },
  java: { icon: 'hexagon-outline', color: '#B07219' },
  cpp:  { icon: 'hexagon-outline', color: '#F34B7D' },
  c:    { icon: 'hexagon-outline', color: '#555555' },
  html: { icon: 'hexagon-outline', color: '#E34C26' },
  css:  { icon: 'hexagon-outline', color: '#563D7C' },
  json: { icon: 'hexagon-outline', color: '#CBCB41' },
  md:   { icon: 'hexagon-outline', color: '#083FA1' },
  sh:   { icon: 'hexagon-outline', color: '#89E051' },
  rs:   { icon: 'hexagon-outline', color: '#DEA584' },
  go:   { icon: 'hexagon-outline', color: '#00ADD8' },
  dir:  { icon: 'folder', color: '#E8C84A' },
  dir_open: { icon: 'folder-open', color: '#E8C84A' }
};

export function getFileIcon(extension: string, isDirectory: boolean, isExpanded: boolean = false) {
  if (isDirectory) return isExpanded ? FILE_ICONS.dir_open : FILE_ICONS.dir;
  return FILE_ICONS[extension] ?? { icon: 'file-outline', color: '#888888' };
}