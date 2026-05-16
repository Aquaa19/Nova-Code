// src/features/packages/components/InstallOverlay.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, ScrollView, Easing, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { AppText } from '../../../components/typography/AppText';
import { theme } from '../../../theme';

interface InstallOverlayProps {
  visible: boolean;
  packageName: string;
  registry: string;
  onComplete: () => void;
}

const MOCK_LOGS = [
  "Resolving dependencies...",
  "Fetching package metadata...",
  "Downloading package archive...",
  "Extracting files to project...",
  "Linking dependencies...",
  "Running post-install scripts...",
  "Cleaning up cache..."
];

export const InstallOverlay: React.FC<InstallOverlayProps> = ({
  visible,
  packageName,
  registry,
  onComplete,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setLogs([`> Initializing installation for ${packageName}...`]);
      setIsDone(false);
      progressAnim.setValue(0);

      let step = 0;
      const totalSteps = MOCK_LOGS.length;
      
      const interval = setInterval(() => {
        if (step < totalSteps) {
          setLogs(prev => [...prev, `> ${MOCK_LOGS[step]}`]);
          
          Animated.timing(progressAnim, {
            toValue: (step + 1) / totalSteps,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
          
          step++;
        } else {
          clearInterval(interval);
          setLogs(prev => [...prev, `> Successfully installed ${packageName}!`]);
          setIsDone(true);
          
          // Auto-close after a short delay
          setTimeout(() => {
            onComplete();
          }, 1500);
        }
      }, 600);

      return () => clearInterval(interval);
    }
  }, [visible, packageName]);

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
