// src/features/editor/services/EditorBridge.ts

// All messages React Native sends TO the WebView
export type RNToEditorMessage =
  | { type: 'INIT'; payload: { content: string; language: string; fontSize: number } }
  | { type: 'SET_CONTENT'; payload: { content: string } }
  | { type: 'GET_CONTENT' }
  | { type: 'SET_FONT_SIZE'; payload: { fontSize: number } }
  | { type: 'FIND'; payload: { query: string } }
  | { type: 'SET_LANGUAGE'; payload: { language: string } };

// All messages the WebView sends BACK TO React Native
export type EditorToRNMessage =
  | { type: 'CONTENT_CHANGED'; payload: { content: string } }
  | { type: 'CONTENT'; payload: string }
  | { type: 'CURSOR_CHANGED'; payload: { line: number; col: number } }
  | { type: 'READY' };

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