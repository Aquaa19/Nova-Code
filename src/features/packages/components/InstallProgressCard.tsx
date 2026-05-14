import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../../components/cards/GlassCard';
import { AppText } from '../../../components/typography/AppText';
import { CodeText } from '../../../components/typography/CodeText';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { theme } from '../../../theme';

interface InstallProgressCardProps {
  command: string;
  status: string;
  progress: number; // 0 to 1
}

export const InstallProgressCard: React.FC<InstallProgressCardProps> = ({
  command,
  status,
  progress,
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <ActivityIndicator color={theme.colors.primaryFixed} size="small" style={styles.spinner} />
        <AppText variant="labelXs" color={theme.colors.onSurface}>
          INSTALLING
        </AppText>
      </View>
      <CodeText color={theme.colors.primaryFixed} style={styles.command}>
        {command}
      </CodeText>
      <ProgressBar value={progress} style={styles.progress} />
      <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.status}>
        {status}
      </AppText>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.s4,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
  },
  spinner: {
    marginRight: theme.spacing.s2,
  },
  command: {
    marginBottom: theme.spacing.s3,
  },
  progress: {
    marginBottom: theme.spacing.s2,
  },
  status: {
    opacity: 0.8,
  },
});
