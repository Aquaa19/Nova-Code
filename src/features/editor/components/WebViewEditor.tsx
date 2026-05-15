// src/features/editor/components/WebViewEditor.tsx

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { parseMessage } from '../services/EditorBridge';

export interface WebViewEditorHandle {
  getContent: () => Promise<string>;
  setContent: (content: string) => void;
  setFontSize: (size: number) => void;
}

interface Props {
  initialContent: string;
  language: string;
  fontSize: number;
  onContentChange?: (content: string) => void;
  onReady?: () => void;
}

// Load the local HTML file from the Android assets folder we set up
const EDITOR_URI = Platform.select({
  android: 'file:///android_asset/editor/index.html',
  default: 'file:///android_asset/editor/index.html',
});

export const WebViewEditor = forwardRef<WebViewEditorHandle, Props>(({
  initialContent, language, fontSize, onContentChange, onReady
}, ref) => {
  const webviewRef = useRef<WebView>(null);
  const pendingGetContent = useRef<((content: string) => void) | null>(null);

  // Helper to send messages TO the WebView
  const postMessage = useCallback((msg: object) => {
    webviewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(msg))} })); true;`
    );
  }, []);

  // Expose these methods to the parent screen (CodeEditorScreen)
  useImperativeHandle(ref, () => ({
    getContent: () => new Promise(resolve => {
      pendingGetContent.current = resolve;
      postMessage({ type: 'GET_CONTENT' });
    }),
    setContent: content => postMessage({ type: 'SET_CONTENT', payload: { content } }),
    setFontSize: size => postMessage({ type: 'SET_FONT_SIZE', payload: { fontSize: size } }),
  }));

  // Handle messages coming FROM the WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const msg = parseMessage(event.nativeEvent.data);
    if (!msg) return;

    switch (msg.type) {
      case 'READY':
        // WebView HTML has loaded, safe to send initial data
        postMessage({ type: 'INIT', payload: { content: initialContent, language, fontSize } });
        onReady?.();
        break;
      case 'CONTENT_CHANGED':
        onContentChange?.(msg.payload.content);
        break;
      case 'CONTENT':
        // Resolve the Promise from getContent()
        pendingGetContent.current?.(msg.payload);
        pendingGetContent.current = null;
        break;
    }
  }, [initialContent, language, fontSize, onContentChange, onReady, postMessage]);

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: EDITOR_URI }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      allowFileAccess // Critical for reading the local asset
      allowFileAccessFromFileURLs // Critical for reading the local asset
      allowUniversalAccessFromFileURLs // Critical for reading the local asset
      style={{ flex: 1, backgroundColor: '#1a1a2e' }}
      scrollEnabled={false}
      overScrollMode="never"
      bounces={false}
    />
  );
});