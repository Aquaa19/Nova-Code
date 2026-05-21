// src/features/files/components/DiffModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { theme } from '../../../theme';
import { GitService } from '../../../services/git/GitService';
import { FileService } from '../../../services/FileService';
import { diffLines, DiffLine } from '../../../services/git/DiffService';

interface DiffModalProps {
  visible: boolean;
  onClose: () => void;
  filePath: string; // Relative path in git repo
  projectPath: string; // Absolute root path
}

export const DiffModal: React.FC<DiffModalProps> = ({
  visible,
  onClose,
  filePath,
  projectPath,
}) => {
  const [loading, setLoading] = useState(true);
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && filePath) {
      loadDiff();
    }
  }, [visible, filePath]);

  const loadDiff = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullPath = `${projectPath}/${filePath}`;
      const [headContent, localContent] = await Promise.all([
        GitService.getFileAtHead(projectPath, filePath),
        FileService.readFile(fullPath).catch(() => ''),
      ]);

      const calculatedDiff = diffLines(headContent || '', localContent);
      setDiffs(calculatedDiff);
    } catch (e: any) {
      setError(e.message || 'Failed to load diff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <GlassPanel style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <MaterialCommunityIcons name="file-diff" size={22} color={theme.colors.primaryFixed} />
              <AppText variant="headlineSm" style={styles.title} numberOfLines={1}>
                {filePath.split('/').pop()}
              </AppText>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.subtitle}>
            {filePath}
          </AppText>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={theme.colors.primaryFixed} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
              <AppText color={theme.colors.error} style={{ marginTop: 8 }}>{error}</AppText>
            </View>
          ) : diffs.length === 0 ? (
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={theme.colors.tertiaryFixed} />
              <AppText color={theme.colors.onSurfaceVariant} style={{ marginTop: 8 }}>
                No changes detected.
              </AppText>
            </View>
          ) : (
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.diffContent}>
              {diffs.map((line, index) => {
                let bgColor = 'transparent';
                let textColor: string = theme.colors.onSurface;
                let prefix = ' ';

                if (line.type === 'added') {
                  bgColor = 'rgba(76, 175, 80, 0.15)';
                  textColor = '#81c784';
                  prefix = '+';
                } else if (line.type === 'removed') {
                  bgColor = 'rgba(244, 67, 54, 0.15)';
                  textColor = '#e57373';
                  prefix = '-';
                } else {
                  textColor = 'rgba(255, 255, 255, 0.7)';
                }

                return (
                  <View key={index} style={[styles.lineRow, { backgroundColor: bgColor }]}>
                    <View style={styles.lineNumberCol}>
                      <AppText variant="labelXs" style={styles.lineNumberText}>
                        {line.oldLineNumber || ''}
                      </AppText>
                    </View>
                    <View style={styles.lineNumberCol}>
                      <AppText variant="labelXs" style={styles.lineNumberText}>
                        {line.newLineNumber || ''}
                      </AppText>
                    </View>
                    <AppText variant="bodySm" style={[styles.linePrefix, { color: textColor }]}>
                      {prefix}
                    </AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lineScroll}>
                      <AppText 
                        variant="bodySm" 
                        style={[styles.lineText, { color: textColor }]}
                      >
                        {line.content}
                      </AppText>
                    </ScrollView>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </GlassPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    maxWidth: 600,
    borderRadius: theme.radius.md,
    padding: theme.spacing.s4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.s3,
  },
  title: {
    marginLeft: theme.spacing.s2,
    flex: 1,
  },
  closeBtn: {
    padding: theme.spacing.s1,
  },
  subtitle: {
    marginBottom: theme.spacing.s4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: theme.radius.sm,
  },
  diffContent: {
    paddingVertical: theme.spacing.s2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: theme.spacing.s2,
  },
  lineNumberCol: {
    width: 28,
    alignItems: 'flex-end',
    marginRight: theme.spacing.s2,
  },
  lineNumberText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontFamily: 'monospace',
  },
  linePrefix: {
    width: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  lineScroll: {
    flex: 1,
  },
  lineText: {
    fontFamily: 'monospace',
    paddingLeft: theme.spacing.s1,
  },
});
