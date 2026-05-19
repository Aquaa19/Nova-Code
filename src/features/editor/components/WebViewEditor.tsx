// src/features/editor/components/WebViewEditor.tsx

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Platform, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { parseMessage } from '../services/EditorBridge';

export interface WebViewEditorHandle {
  getContent: () => Promise<string>;
  setContent: (content: string) => void;
  setFontSize: (size: number) => void;
  setCursor: (line: number, col: number) => void;
  setWordWrap: (wordWrap: boolean) => void;
  setLineNumbers: (lineNumbers: boolean) => void;
  setTabSize: (tabSize: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSearchQuery: (query: string, replace: string, caseSensitive: boolean) => void;
  searchNext: () => void;
  searchPrev: () => void;
  searchReplace: () => void;
  searchReplaceAll: () => void;
  insertText: (text: string) => void;
  moveCursor: (direction: 'left' | 'right' | 'up' | 'down') => void;
  undo: () => void;
  redo: () => void;
  toggleComment: () => void;
  setErrorLine: (line: number) => void;
  clearErrorLine: () => void;
}

interface Props {
  initialContent: string;
  language: string;
  fontSize: number;
  theme: 'dark' | 'light';
  wordWrap: boolean;
  lineNumbers: boolean;
  tabSize: number;
  onContentChange?: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onSearchResults?: (count: number, index: number) => void;
  onReady?: () => void;
}

const EDITOR_URI = Platform.select({
  android: 'file:///android_asset/editor/index.html',
  default: 'file:///android_asset/editor/index.html',
});

export const WebViewEditor = forwardRef<WebViewEditorHandle, Props>(({
  initialContent, language, fontSize, theme, wordWrap, lineNumbers, tabSize,
  onContentChange, onCursorChange, onSearchResults, onReady
}, ref) => {
  const webviewRef = useRef<WebView>(null);
  const pendingGetContent = useRef<((content: string) => void) | null>(null);

  const postMessage = useCallback((msg: object) => {
    webviewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(msg))} })); true;`
    );
  }, []);

  useImperativeHandle(ref, () => ({
    getContent: () => new Promise(resolve => {
      pendingGetContent.current = resolve;
      postMessage({ type: 'GET_CONTENT' });
    }),
    setContent: content => postMessage({ type: 'SET_CONTENT', payload: { content } }),
    setFontSize: size => postMessage({ type: 'SET_FONT_SIZE', payload: { fontSize: size } }),
    setCursor: (line, col) => postMessage({ type: 'SET_CURSOR', payload: { line, col } }),
    
    // Settings Modifiers
    setWordWrap: val => postMessage({ type: 'SET_WORD_WRAP', payload: { wordWrap: val } }),
    setLineNumbers: val => postMessage({ type: 'SET_LINE_NUMBERS', payload: { lineNumbers: val } }),
    setTabSize: val => postMessage({ type: 'SET_TAB_SIZE', payload: { tabSize: val } }),
    setTheme: val => postMessage({ type: 'SET_THEME', payload: { theme: val } }),
    
    // Search Actions
    setSearchQuery: (query, replace, caseSensitive) => postMessage({ type: 'SET_SEARCH_QUERY', payload: { query, replace, caseSensitive } }),
    searchNext: () => postMessage({ type: 'SEARCH_NEXT' }),
    searchPrev: () => postMessage({ type: 'SEARCH_PREV' }),
    searchReplace: () => postMessage({ type: 'SEARCH_REPLACE' }),
    searchReplaceAll: () => postMessage({ type: 'SEARCH_REPLACE_ALL' }),
    
    // Editor Actions
    insertText: text => postMessage({ type: 'INSERT_TEXT', payload: { text } }),
    moveCursor: direction => postMessage({ type: 'MOVE_CURSOR', payload: { direction } }),
    undo: () => postMessage({ type: 'UNDO' }),
    redo: () => postMessage({ type: 'REDO' }),
    toggleComment: () => postMessage({ type: 'TOGGLE_COMMENT' }),

    // Error Line Highlights
    setErrorLine: (line) => postMessage({ type: 'SET_ERROR_LINE', payload: { line } }),
    clearErrorLine: () => postMessage({ type: 'CLEAR_ERROR_LINE' }),
  }));

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const msg = parseMessage(event.nativeEvent.data);
    if (!msg) return;

    switch (msg.type) {
      case 'READY':
        postMessage({ type: 'INIT', payload: { content: initialContent, language, fontSize, theme, wordWrap, lineNumbers, tabSize } });
        onReady?.();
        break;
      case 'CONTENT_CHANGED':
        onContentChange?.(msg.payload.content);
        break;
      case 'CONTENT':
        pendingGetContent.current?.(msg.payload);
        pendingGetContent.current = null;
        break;
      case 'CURSOR_CHANGED':
        onCursorChange?.(msg.payload.line, msg.payload.col);
        break;
      case 'SEARCH_RESULTS':
        onSearchResults?.(msg.payload.count, msg.payload.index);
        break;
      case 'ERROR':
        Alert.alert('WebView Error', msg.payload);
        break;
    }
  }, [initialContent, language, fontSize, theme, wordWrap, lineNumbers, tabSize, onContentChange, onCursorChange, onSearchResults, onReady, postMessage]);

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: EDITOR_URI }}
      onMessage={handleMessage}
      javaScriptEnabled
      nestedScrollEnabled={true}
      keyboardDisplayRequiresUserAction={false}
      domStorageEnabled
      originWhitelist={['*']}
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      style={{ flex: 1, backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a2e' }}
      scrollEnabled={Platform.OS === 'ios' ? false : true}
      overScrollMode="never"
      bounces={false}
    />
  );
});