// src/screens/PreviewScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Text,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppText } from '../components/typography/AppText';
import { theme } from '../theme';
import { useTerminalStore } from '../store/useTerminalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { FileService, PROJECTS_ROOT } from '../services/FileService';
import { useEditorStore } from '../store/useEditorStore';
import { useProjectStore } from '../store/useProjectStore';

interface ConsoleLog {
  id: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

const CONSOLE_DRAWER_HEIGHT = 280;

const INJECTED_JAVASCRIPT = `
  (function() {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    function forwardLog(level, args) {
      const message = Array.from(args).map(a => {
        if (a instanceof Error) return a.message + '\\n' + a.stack;
        if (typeof a === 'object') {
          try {
            return JSON.stringify(a);
          } catch(e) {
            return String(a);
          }
        }
        return String(a);
      }).join(' ');
      
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'console',
          level: level,
          message: message,
          timestamp: Date.now()
        }));
      }
    }
    console.log = function() {
      originalConsole.log.apply(console, arguments);
      forwardLog('log', arguments);
    };
    console.warn = function() {
      originalConsole.warn.apply(console, arguments);
      forwardLog('warn', arguments);
    };
    console.error = function() {
      originalConsole.error.apply(console, arguments);
      forwardLog('error', arguments);
    };
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      const stack = error && error.stack ? '\\n' + error.stack : '';
      forwardLog('error', [msg + ' (' + url + ':' + lineNo + ':' + columnNo + ')' + stack]);
      return false;
    };
  })();
  true;
`;

export const PreviewScreen: React.FC = () => {
  const webviewRef = useRef<WebView>(null);
  const { sessionId } = useTerminalStore();
  const { engineUrl, engineAuthToken, localUserId } = useSettingsStore();
  const { openFiles, activeIndex } = useEditorStore();
  const { currentProject } = useProjectStore();
  const activeFile = openFiles[activeIndex];

  const [customPort, setCustomPort] = useState<string | null>(null);

  const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
  const previewUri = sessionId
    ? (customPort
        ? `${httpUrl}/sessions/${sessionId}/proxy/${customPort}/`
        : (currentProject
            ? `${httpUrl}/sessions/${sessionId}/preview/${currentProject.name}/index.html`
            : `${httpUrl}/sessions/${sessionId}/preview/index.html`))
    : '';
  const displayAddress = sessionId
    ? (customPort
        ? `http://localhost:${customPort}/`
        : (currentProject
            ? `preview/${sessionId.substring(0, 8)}/${currentProject.name}/index.html`
            : `preview/${sessionId.substring(0, 8)}/index.html`))
    : 'No active session';

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const consoleHeight = useRef(new Animated.Value(0)).current;
  const consoleScrollRef = useRef<ScrollView>(null);

  // ── Auto-Spawn Session & Auto-Upload Active File ──
  useEffect(() => {
    let active = true;

    const initPreview = async () => {
      let currentSessionId = sessionId;

      // 1. Spawn session if none exists
      if (!currentSessionId) {
        try {
          setIsLoading(true);
          const res = await fetch(`${httpUrl}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': engineAuthToken,
              'x-user-id': localUserId,
            },
          });
          if (res.ok && active) {
            const data = await res.json();
            currentSessionId = data.sessionId;
            useTerminalStore.getState().setSessionId(currentSessionId);
            useTerminalStore.getState().setConnectionStatus('connected');
          } else if (active) {
            setHasError(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          if (active) {
            setHasError(true);
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Upload the active file
      if (activeFile && currentSessionId) {
        try {
          setIsLoading(true);
          const content = await FileService.readFile(activeFile.path);
          
          const relativePath = activeFile.path.startsWith(PROJECTS_ROOT)
            ? activeFile.path.substring(PROJECTS_ROOT.length + 1)
            : activeFile.path.split('/').pop() || 'index.html';

          const uploadRes = await fetch(`${httpUrl}/sessions/${currentSessionId}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': engineAuthToken,
              'x-user-id': localUserId,
            },
            body: JSON.stringify({ filename: relativePath, content }),
          });

          if (uploadRes.ok && active) {
            setHasError(false);
          } else if (active) {
            if (uploadRes.status === 404) {
              useTerminalStore.getState().setSessionId(null);
            }
            setHasError(true);
          }
        } catch (e) {
          if (active) {
            setHasError(true);
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      } else if (active) {
        setIsLoading(false);
      }
    };

    initPreview();

    return () => {
      active = false;
    };
  }, [activeFile?.path, sessionId, httpUrl, engineAuthToken]);

  // Note: Console log polling is replaced by Native WebView bridge events in handleWebViewMessage

  const toggleConsole = useCallback(() => {
    const toValue = consoleOpen ? 0 : CONSOLE_DRAWER_HEIGHT;
    Animated.spring(consoleHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
      speed: 20,
    }).start();
    setConsoleOpen(prev => !prev);
  }, [consoleOpen, consoleHeight]);

  const handleSoftReload = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setLogs([]);
    webviewRef.current?.reload();
  }, []);

  const handleHardReload = useCallback(async () => {
    if (!activeFile || !sessionId) return;
    try {
      setIsLoading(true);
      setHasError(false);
      setLogs([]);
      const content = await FileService.readFile(activeFile.path);
      
      const relativePath = activeFile.path.startsWith(PROJECTS_ROOT)
        ? activeFile.path.substring(PROJECTS_ROOT.length + 1)
        : activeFile.path.split('/').pop() || 'index.html';

      await fetch(`${httpUrl}/sessions/${sessionId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': engineAuthToken,
          'x-user-id': localUserId,
        },
        body: JSON.stringify({ filename: relativePath, content }),
      });
      webviewRef.current?.reload();
    } catch (e) {
      setIsLoading(false);
    }
  }, [activeFile, sessionId, httpUrl, engineAuthToken, localUserId]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.type === 'console') {
        const newLog = {
          id: Math.random().toString(36).substring(7),
          level: payload.level,
          message: payload.message,
          timestamp: payload.timestamp || Date.now(),
        };
        setLogs(prev => {
          const updated = [...prev, newLog];
          setTimeout(() => consoleScrollRef.current?.scrollToEnd({ animated: true }), 50);
          return updated;
        });
      }
    } catch (e) {}
  }, []);

  const handleClearConsole = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch(`${httpUrl}/sessions/${sessionId}/console`, { method: 'DELETE' });
      setLogs([]);
    } catch (_) {}
  }, [sessionId, httpUrl]);

  const renderConsoleRow = (log: ConsoleLog) => {
    const levelColor =
      log.level === 'error' ? theme.colors.error :
      log.level === 'warn' ? '#ffbd2e' :
      theme.colors.onSurface;

    return (
      <View key={log.id} style={styles.logRow}>
        <Text style={[styles.logLevel, { color: levelColor }]}>{log.level.toUpperCase()}</Text>
        <Text style={[styles.logMessage, { color: levelColor }]} selectable>{log.message}</Text>
        <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer withHeader={false} withBottomTabs backgroundVariant="terminal">
      {/* ── Browser Chrome Header ── */}
      <View style={styles.chromeHeader}>
        <View style={styles.windowControls}>
          <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
          <View style={[styles.dot, { backgroundColor: '#febc2e' }]} />
          <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
        </View>
        <View style={styles.addressBar}>
          <MaterialCommunityIcons name="lock-outline" size={10} color="rgba(255,255,255,0.35)" style={{ marginRight: 4 }} />
          <Text style={styles.addressText} numberOfLines={1}>{displayAddress}</Text>
        </View>
        <View style={styles.portInputContainer}>
          <Text style={styles.portLabel}>Port:</Text>
          <TextInput
            style={styles.portTextInput}
            value={customPort || ''}
            placeholder="Static"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="numeric"
            onChangeText={(text) => {
              const sanitized = text.replace(/[^0-9]/g, '');
              setCustomPort(sanitized === '' ? null : sanitized);
            }}
          />
        </View>
        <Pressable onPress={handleSoftReload} style={styles.chromeRefreshBtn}>
          <MaterialCommunityIcons name="reload" size={16} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </View>

      {/* ── WebView Frame ── */}
      <View style={styles.webViewContainer}>
        {!sessionId ? (
          <View style={styles.errorScreen}>
            <MaterialCommunityIcons name="server-network-off" size={52} color={theme.colors.onSurfaceVariant} />
            <AppText variant="headlineSm" style={styles.errorTitle}>Sandbox Offline</AppText>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.errorSubtitle}>
              Open an HTML file and tap the Play button in the editor to start a session.
            </AppText>
          </View>
        ) : hasError ? (
          <View style={styles.errorScreen}>
            <MaterialCommunityIcons name="web-remove" size={52} color={theme.colors.onSurfaceVariant} />
            <AppText variant="headlineSm" style={styles.errorTitle}>Cannot Load Preview</AppText>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.errorSubtitle}>
              Make sure your project has an index.html file and the server is running.
            </AppText>
            <Pressable style={styles.retryBtn} onPress={handleSoftReload}>
              <AppText variant="labelSm" color={theme.colors.primaryFixed}>Retry</AppText>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webviewRef}
            source={{ uri: previewUri }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess={false}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
            onMessage={handleWebViewMessage}
            onLoadStart={() => { setIsLoading(true); setHasError(false); }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
            onHttpError={() => { setIsLoading(false); setHasError(true); }}
          />
        )}

        {/* Loading Indicator overlay */}
        {isLoading && !hasError && sessionId && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primaryFixed} />
          </View>
        )}

        {/* ── Floating Action Controls ── */}
        <View style={styles.floatingControls}>
          <Pressable
            style={({ pressed }) => [styles.fabBtn, pressed && styles.fabBtnPressed]}
            onPress={handleSoftReload}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.onSurface} />
          </Pressable>
          <View style={styles.fabDivider} />
          <Pressable
            style={({ pressed }) => [styles.fabBtn, pressed && styles.fabBtnPressed]}
            onPress={handleHardReload}
          >
            <MaterialCommunityIcons name="upload-outline" size={20} color={theme.colors.onSurface} />
          </Pressable>
          <View style={styles.fabDivider} />
          <Pressable
            style={({ pressed }) => [styles.fabBtn, pressed && styles.fabBtnPressed]}
            onPress={toggleConsole}
          >
            <MaterialCommunityIcons
              name="console-line"
              size={20}
              color={consoleOpen ? theme.colors.primaryFixed : theme.colors.onSurface}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Collapsible Console Drawer ── */}
      <Animated.View style={[styles.consoleDrawer, { height: consoleHeight }]}>
        <View style={styles.consoleHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="console-line" size={14} color={theme.colors.primaryFixed} />
            <AppText variant="labelSm" color={theme.colors.primaryFixed}>Console</AppText>
            {logs.length > 0 && (
              <View style={styles.logBadge}>
                <Text style={styles.logBadgeText}>{logs.length}</Text>
              </View>
            )}
          </View>
          <Pressable onPress={handleClearConsole} style={styles.clearBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
        <ScrollView
          ref={consoleScrollRef}
          style={styles.consoleScroll}
          contentContainerStyle={styles.consoleContent}
        >
          {logs.length === 0 ? (
            <Text style={styles.consolePlaceholder}>No console output yet...</Text>
          ) : (
            logs.map(renderConsoleRow)
          )}
        </ScrollView>
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  chromeHeader: {
    height: 48,
    backgroundColor: 'rgba(25, 27, 36, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.gutter,
  },
  windowControls: {
    flexDirection: 'row',
    gap: 6,
    marginRight: theme.spacing.s3,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  addressBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  addressText: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  chromeRefreshBtn: {
    padding: 8,
    marginLeft: 6,
  },
  portInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
    width: 85,
  },
  portLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginRight: 4,
    fontFamily: 'monospace',
  },
  portTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: 0,
    height: 20,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorScreen: {
    flex: 1,
    backgroundColor: '#11131c',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.s8,
  },
  errorTitle: {
    color: theme.colors.onSurface,
    marginTop: theme.spacing.s4,
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: theme.spacing.s2,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: theme.spacing.s5,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(125,244,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(125,244,255,0.25)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,19,28,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 19, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 4,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  fabBtn: {
    padding: 10,
    borderRadius: 20,
  },
  fabBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fabDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 2,
  },
  consoleDrawer: {
    backgroundColor: '#0d0f1a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logBadge: {
    backgroundColor: theme.colors.primaryFixed,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  logBadgeText: {
    color: '#002022',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearBtn: {
    padding: theme.spacing.s1,
  },
  consoleScroll: { flex: 1 },
  consoleContent: { padding: theme.spacing.s3, paddingBottom: theme.spacing.s5 },
  consolePlaceholder: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    fontStyle: 'italic',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  logLevel: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    width: 38,
  },
  logMessage: {
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  logTime: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 2,
  },
});
