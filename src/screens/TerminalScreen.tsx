// nova-code/src/screens/TerminalScreen.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppHeader } from '../components/navigation/AppHeader';
import { KeyboardAccessoryBar, AccessoryKey } from '../features/terminal/components/KeyboardAccessoryBar';
import { GlassCard } from '../components/cards/GlassCard';
import { useTerminalStore } from '../store/useTerminalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { theme } from '../theme';

const ACCESSORY_KEYS = [
  { id: 'tab', label: 'TAB', icon: 'keyboard-tab' },
  { id: 'up', label: 'UP', icon: 'arrow-up' },
  { id: 'down', label: 'DOWN', icon: 'arrow-down' },
  { id: 'ctrl-c', label: 'CTRL+C' },
  { id: 'ctrl-d', label: 'CTRL+D' },
];

export const TerminalScreen: React.FC = () => {
  const webviewRef = useRef<WebView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  
  const { engineUrl, engineAuthToken } = useSettingsStore();
  const { setConnectionStatus, setSessionId, connectionStatus } = useTerminalStore();

  const postMessage = useCallback((msg: object) => {
    webviewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(msg))} })); true;`
    );
  }, []);

  const connectSession = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      // 1. Fetch Session ID
      const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const res = await fetch(`${httpUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': engineAuthToken
        }
      });
      
      if (!res.ok) throw new Error('Failed to spawn session');
      
      const { sessionId: newSessionId } = await res.json();
      setSessionId(newSessionId);
      
      // 2. Open WebSocket to Terminal Endpoint
      const wsUrl = `${engineUrl}/sessions/${newSessionId}/terminal?token=${engineAuthToken}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        retryCountRef.current = 0;
      };
      
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'output') {
            postMessage({ type: 'write', payload: { data: payload.data } });
          }
        } catch (e) {}
      };
      
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        wsRef.current = null;
        if (retryCountRef.current < 3) {
           setTimeout(() => {
             retryCountRef.current += 1;
             connectSession();
           }, 2000);
        } else {
           setConnectionStatus('error');
        }
      };
      
      ws.onerror = () => {
         setConnectionStatus('error');
      };

    } catch (e) {
      console.error(e);
      setConnectionStatus('error');
    }
  }, [engineUrl, engineAuthToken, postMessage, setConnectionStatus, setSessionId]);

  useEffect(() => {
    connectSession();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectSession]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'data') {
         if (wsRef.current?.readyState === WebSocket.OPEN) {
           wsRef.current.send(JSON.stringify({ type: 'input', data: msg.data }));
         }
      } else if (msg.type === 'resize') {
         if (wsRef.current?.readyState === WebSocket.OPEN) {
           wsRef.current.send(JSON.stringify({ type: 'resize', cols: msg.cols, rows: msg.rows }));
         }
      } else if (msg.type === 'ready') {
         postMessage({ type: 'focus' });
      }
    } catch(e) {}
  };

  const handleAccessoryPress = (key: AccessoryKey) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    let data = '';
    switch (key.id) {
      case 'tab': data = '\t'; break;
      case 'up': data = '\x1b[A'; break;
      case 'down': data = '\x1b[B'; break;
      case 'ctrl-c': data = '\x03'; break;
      case 'ctrl-d': data = '\x04'; break;
    }
    if (data) wsRef.current.send(JSON.stringify({ type: 'input', data }));
    postMessage({ type: 'focus' });
  };

  return (
    <ScreenContainer withHeader withBottomTabs backgroundVariant="terminal">
      <AppHeader title="Terminal" variant="transparent" />
      <View style={styles.terminalContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: 'file:///android_asset/terminal/terminal.html' }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          keyboardDisplayRequiresUserAction={false}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
        />
        
        {connectionStatus !== 'connected' && (
          <View style={styles.overlay}>
            <GlassCard padding="s4" style={styles.errorCard}>
              {connectionStatus === 'connecting' ? (
                 <>
                   <ActivityIndicator size="large" color={theme.colors.primaryFixed} />
                   <Text style={styles.overlayText}>Connecting to Sandbox...</Text>
                 </>
              ) : (
                 <>
                   <MaterialCommunityIcons name="lan-disconnect" size={32} color={theme.colors.error} />
                   <Text style={styles.overlayText}>Disconnected</Text>
                   <Pressable onPress={() => { retryCountRef.current = 0; connectSession(); }} style={styles.retryBtn}>
                     <Text style={styles.retryText}>Tap to Reconnect</Text>
                   </Pressable>
                 </>
              )}
            </GlassCard>
          </View>
        )}
      </View>
      <KeyboardAccessoryBar
        keys={ACCESSORY_KEYS}
        onKeyPress={handleAccessoryPress}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  terminalContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#0d0f1a' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 15, 26, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: { alignItems: 'center', minWidth: 200 },
  overlayText: { color: theme.colors.onSurface, marginTop: 12, fontWeight: '500' },
  retryBtn: { 
    marginTop: 16, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 6 
  },
  retryText: { color: theme.colors.primaryFixed, fontWeight: 'bold' }
});
