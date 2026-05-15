// src/features/files/components/SourceControlDrawer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Animated, 
  Dimensions 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { GlassCard } from '../../../components/cards/GlassCard';
import { theme } from '../../../theme';
import { GitService } from '../../../services/git/GitService';
import { useProjectStore } from '../../../store/useProjectStore';

const { width } = Dimensions.get('window');

interface SourceControlDrawerProps {
  visible: boolean;
  onClose: () => void;
  onGitActionComplete?: () => void;
}

export const SourceControlDrawer: React.FC<SourceControlDrawerProps> = ({
  visible,
  onClose,
  onGitActionComplete,
}) => {
  const { currentProject } = useProjectStore();
  const [isRepo, setIsRepo] = useState(false);
  const [hasRemote, setHasRemote] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      checkRepoStatus();
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  const checkRepoStatus = async () => {
    if (!currentProject) return;
    try {
      const repoStatus = await GitService.isRepo(currentProject.path);
      setIsRepo(repoStatus);
      
      if (repoStatus) {
        const remotes = await GitService.listRemotes(currentProject.path);
        setHasRemote(remotes.length > 0);
      }
    } catch (e) {
      setIsRepo(false);
    }
  };

  const handleInit = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      await GitService.init(currentProject.path);
      setIsRepo(true);
      onGitActionComplete?.();
    } catch (e: any) { 
      Alert.alert('Error', e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleCommit = async () => {
    if (!currentProject) return;
    if (!commitMessage.trim()) return Alert.alert('Notice', 'Enter a commit message.');
    setIsProcessing(true);
    try {
      await GitService.addAll(currentProject.path);
      await GitService.commit(currentProject.path, commitMessage.trim());
      setCommitMessage('');
      Alert.alert('Success', 'Commit successful.');
      onGitActionComplete?.();
    } catch (e: any) { 
      Alert.alert('Error', e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleAddRemote = async () => {
    if (!currentProject) return;
    if (!remoteUrl.trim() || !remoteUrl.includes('http')) {
      return Alert.alert('Invalid URL', 'Please enter a valid HTTP/HTTPS Git URL.');
    }
    setIsProcessing(true);
    try {
      await GitService.addRemote(currentProject.path, 'origin', remoteUrl.trim());
      setHasRemote(true);
      setRemoteUrl('');
      Alert.alert('Success', 'Remote repository linked successfully!');
    } catch (e: any) {
      Alert.alert('Error', `Failed to link remote: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePush = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      await GitService.push(currentProject.path);
      Alert.alert('Success', 'Pushed to remote.');
    } catch (e: any) { 
      Alert.alert('Error', e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handlePull = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      await GitService.pull(currentProject.path);
      Alert.alert('Success', 'Pulled latest changes.');
      onGitActionComplete?.();
    } catch (e: any) { 
      Alert.alert('Error', e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
          <GlassPanel style={styles.panel}>
            
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="source-branch" size={20} color={theme.colors.primaryFixed} />
                <AppText variant="headlineMd" style={styles.title}>Source Control</AppText>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            </View>

            {!currentProject ? (
               <AppText color={theme.colors.onSurfaceVariant} style={styles.emptyText}>Open a project first.</AppText>
            ) : isProcessing ? (
               <View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primaryFixed} size="large" /></View>
            ) : !isRepo ? (
               <View style={styles.centerContainer}>
                 <MaterialCommunityIcons name="git" size={48} color={theme.colors.onSurfaceVariant} />
                 <AppText color={theme.colors.onSurfaceVariant} style={styles.emptyText}>Not a Git repository.</AppText>
                 <Pressable style={[styles.button, styles.primaryButton, { marginTop: 16 }]} onPress={handleInit}>
                   <AppText variant="bodyMd" color={theme.colors.background}>Initialize Repository</AppText>
                 </Pressable>
               </View>
            ) : (
              <View style={styles.content}>
                
                <View style={styles.section}>
                  <TextInput
                    style={styles.input}
                    value={commitMessage}
                    onChangeText={setCommitMessage}
                    placeholder="Commit message..."
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    multiline
                  />
                  <Pressable 
                    style={[styles.button, styles.primaryButton, !commitMessage.trim() && styles.disabledButton]} 
                    onPress={handleCommit}
                    disabled={!commitMessage.trim()}
                  >
                    <AppText variant="bodyMd" color={theme.colors.background}>Commit All</AppText>
                  </Pressable>
                </View>

                {!hasRemote && (
                  <View style={styles.section}>
                    <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>LINK REMOTE</AppText>
                    <TextInput
                      style={[styles.input, { minHeight: 40, marginBottom: 8 }]}
                      value={remoteUrl}
                      onChangeText={setRemoteUrl}
                      placeholder="https://github.com/user/repo.git"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      autoCapitalize="none"
                    />
                    <Pressable style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={handleAddRemote}>
                      <MaterialCommunityIcons name="link-variant" size={18} color={theme.colors.onSurface} style={{marginRight: 8}}/>
                      <AppText variant="bodyMd" color={theme.colors.onSurface}>Add Remote (Origin)</AppText>
                    </Pressable>
                  </View>
                )}

                <View style={styles.section}>
                  <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>ACTIONS</AppText>
                  <View style={styles.rowActions}>
                    <Pressable style={{ flex: 1 }} onPress={handlePull} disabled={!hasRemote}>
                      <GlassCard padding="s3" style={[styles.actionCard, !hasRemote && {opacity: 0.5}]}>
                        <MaterialCommunityIcons name="arrow-down-circle-outline" size={20} color={theme.colors.onSurface} />
                        <AppText variant="bodyMd" style={styles.actionText}>Pull</AppText>
                      </GlassCard>
                    </Pressable>
                    <View style={{ width: theme.spacing.s3 }} />
                    <Pressable style={{ flex: 1 }} onPress={handlePush} disabled={!hasRemote}>
                      <GlassCard padding="s3" style={[styles.actionCard, !hasRemote && {opacity: 0.5}]}>
                        <MaterialCommunityIcons name="arrow-up-circle-outline" size={20} color={theme.colors.onSurface} />
                        <AppText variant="bodyMd" style={styles.actionText}>Push</AppText>
                      </GlassCard>
                    </Pressable>
                  </View>
                </View>

              </View>
            )}
          </GlassPanel>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerContainer: {
    width: '85%',
    maxWidth: 400,
    height: '100%',
    position: 'absolute',
    right: 0,
  },
  panel: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: theme.spacing.gutter,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s4,
    marginTop: theme.spacing.safeTopFallback,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: theme.spacing.s2,
  },
  closeBtn: {
    padding: theme.spacing.s1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.s4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.s4,
  },
  sectionTitle: {
    marginBottom: theme.spacing.s2,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    minHeight: 80,
    fontSize: 14,
    marginBottom: theme.spacing.s3,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryFixed,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s3,
  },
  actionText: {
    marginLeft: theme.spacing.s3,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});