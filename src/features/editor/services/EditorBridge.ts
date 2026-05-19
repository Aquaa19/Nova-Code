// src/features/editor/services/EditorBridge.ts

// All messages React Native sends TO the WebView
export type RNToEditorMessage =
  | { type: 'INIT'; payload: { content: string; language: string; fontSize: number; theme: 'dark' | 'light'; wordWrap: boolean; lineNumbers: boolean; tabSize: number } }
  | { type: 'SET_CONTENT'; payload: { content: string } }
  | { type: 'GET_CONTENT' }
  | { type: 'SET_FONT_SIZE'; payload: { fontSize: number } }
  | { type: 'FIND'; payload: { query: string } }
  | { type: 'SET_LANGUAGE'; payload: { language: string } }
  | { type: 'SET_CURSOR'; payload: { line: number; col: number } }
  // Settings
  | { type: 'SET_WORD_WRAP'; payload: { wordWrap: boolean } }
  | { type: 'SET_LINE_NUMBERS'; payload: { lineNumbers: boolean } }
  | { type: 'SET_TAB_SIZE'; payload: { tabSize: number } }
  | { type: 'SET_THEME'; payload: { theme: 'dark' | 'light' } }
  // Search & Replace
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string; replace: string; caseSensitive: boolean } }
  | { type: 'SEARCH_NEXT' }
  | { type: 'SEARCH_PREV' }
  | { type: 'SEARCH_REPLACE' }
  | { type: 'SEARCH_REPLACE_ALL' }
  // Editor Actions
  | { type: 'INSERT_TEXT'; payload: { text: string } }
  | { type: 'MOVE_CURSOR'; payload: { direction: 'left' | 'right' | 'up' | 'down' } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_COMMENT' }
  // Error Highlights
  | { type: 'SET_ERROR_LINE'; payload: { line: number } }
  | { type: 'CLEAR_ERROR_LINE' };

// All messages the WebView sends BACK TO React Native
export type EditorToRNMessage =
  | { type: 'CONTENT_CHANGED'; payload: { content: string } }
  | { type: 'CONTENT'; payload: string }
  | { type: 'CURSOR_CHANGED'; payload: { line: number; col: number } }
  | { type: 'READY' }
  | { type: 'ERROR'; payload: string }
  | { type: 'SEARCH_RESULTS'; payload: { count: number; index: number } };

export function serializeMessage(msg: RNToEditorMessage): string {
  return JSON.stringify(msg);
}

export function parseMessage(raw: string): EditorToRNMessage | null {
  try {
    return JSON.parse(raw) as EditorToRNMessage;
  } catch {
    return null;
  }
}