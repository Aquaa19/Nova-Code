// src/features/packages/components/InstallOverlay.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, ScrollView, Easing, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

interface InstallOverlayProps {
  visible: boolean;
  packageName: string;
  projectName?: string;
  registry: string;
  onComplete: () => void;
}

export const InstallOverlay: React.FC<InstallOverlayProps> = ({
  visible,
  packageName,
  projectName,
  registry,
  onComplete,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const { sessionId } = useTerminalStore();
  const { engineUrl, engineAuthToken, localUserId } = useSettingsStore();

  const rawBuffer = useRef<string>('');

  useEffect(() => {
    if (visible && packageName) {
      if (!sessionId) {
        setLogs(['> Error: Sandbox session not active.', '> Please run the project first to connect the environment.']);
        setIsDone(true);
        setTimeout(onComplete, 2500);
        return;
      }

      setLogs([`> Initializing installation for ${packageName}...`]);
      setIsDone(false);
      progressAnim.setValue(0.1);
      rawBuffer.current = '';

      const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${httpUrl}/sessions/${sessionId}/exec`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-auth-token', engineAuthToken);
      xhr.setRequestHeader('x-user-id', localUserId);

      let seenBytes = 0;

      const processEvent = (eventStr: string) => {
        const lines = eventStr.split('\n');
        let isDoneEvent = false;
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event: done')) {
            isDoneEvent = true;
          } else if (line.startsWith('data: ')) {
            dataStr = line.substring(6);
          }
        }

        if (isDoneEvent) {
          setIsDone(true);
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
          setTimeout(onComplete, 1500);
        } else if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              setLogs(prev => [...prev, `> ${parsed.text}`]);
            }
          } catch (e) {}
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const newData = xhr.responseText.substring(seenBytes);
          seenBytes = xhr.responseText.length;

          let buffer = rawBuffer.current + newData;
          let boundary = buffer.indexOf('\n\n');
          while (boundary !== -1) {
            const eventStr = buffer.substring(0, boundary);
            buffer = buffer.substring(boundary + 2);

            processEvent(eventStr);
            boundary = buffer.indexOf('\n\n');
          }
          rawBuffer.current = buffer;
        }
      };

      const command = registry === 'npm'
        ? (projectName ? `cd ${projectName} && npm install ${packageName}` : `npm install ${packageName}`)
        : `pip3 install --target=/workspace/.python_packages ${packageName}`;

      xhr.send(JSON.stringify({ command }));

      return () => {
        xhr.abort();
      };
    }
  }, [visible, packageName, sessionId, engineUrl, engineAuthToken, localUserId, onComplete]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel} variant="active">
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name={registry === 'npm' ? 'nodejs' : registry === 'pip' ? 'language-python' : 'language-java'} 
              size={24} 
              color={theme.colors.primaryFixed} 
            />
            <AppText variant="headlineSm" style={styles.title}>
              Installing {packageName}
            </AppText>
          </View>

          <View style={styles.consoleContainer}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.consoleScroll} 
              contentContainerStyle={styles.consoleContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {logs.map((log, index) => (
                <AppText 
                  key={index} 
                  variant="labelSm" 
                  color={index === logs.length - 1 && isDone ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant} 
                  style={styles.logText}
                >
                  {log}
                </AppText>
              ))}
            </ScrollView>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) 
                }
              ]} 
            />
          </View>
        </GlassPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.gutter,
  },
  panel: {
    padding: theme.spacing.gutter,
    borderRadius: theme.radius.md,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
  },
  title: {
    marginLeft: theme.spacing.s2,
  },
  consoleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    height: 200,
    marginBottom: theme.spacing.s4,
  },
  consoleScroll: {
    flex: 1,
  },
  consoleContent: {
    padding: theme.spacing.s3,
  },
  logText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    marginBottom: 4,
    lineHeight: 20,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primaryFixed,
    borderRadius: 3,
  },
});
