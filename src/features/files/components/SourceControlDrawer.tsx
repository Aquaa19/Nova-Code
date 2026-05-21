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
  Dimensions,
  FlatList,
  ScrollView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { GlassCard } from '../../../components/cards/GlassCard';
import { theme } from '../../../theme';
import { GitService } from '../../../services/git/GitService';
import { FileService } from '../../../services/FileService';
import { useProjectStore } from '../../../store/useProjectStore';
import { storage } from '../../../storage/mmkv';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { DiffModal } from './DiffModal';

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
  const currentProject = useProjectStore((s) => s.currentProject);
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes');
  const [isRepo, setIsRepo] = useState(false);
  const [hasRemote, setHasRemote] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Changes state
  const [commitMessage, setCommitMessage] = useState('');
  const [changedFiles, setChangedFiles] = useState<Array<{
    filepath: string;
    staged: boolean;
    statusText: string;
    color: string;
    head: number;
    workdir: number;
    stage: number;
  }>>([]);

  // States for remote/author
  const [remoteUrl, setRemoteUrl] = useState('');
  const [authorName, setAuthorName] = useState(useSettingsStore.getState().gitAuthorName || 'Nova Code User');
  const [authorEmail, setAuthorEmail] = useState(useSettingsStore.getState().gitAuthorEmail || 'user@novacode.app');

  // History state
  const [commitLogs, setCommitLogs] = useState<any[]>([]);

  // Diff view modal state
  const [diffModalVisible, setDiffModalVisible] = useState(false);
  const [diffFilePath, setDiffFilePath] = useState('');

  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      checkRepoStatus();
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (isRepo && currentProject) {
      if (activeTab === 'changes') {
        loadChanges();
      } else {
        loadHistory();
      }
    }
  }, [activeTab, isRepo, currentProject]);

  const checkRepoStatus = async () => {
    if (!currentProject) return;
    try {
      const repoStatus = await GitService.isRepo(currentProject.path);
      setIsRepo(repoStatus);
      
      if (repoStatus) {
        const remotes = await GitService.listRemotes(currentProject.path);
        setHasRemote(remotes.length > 0);
        if (activeTab === 'changes') {
          loadChanges();
        } else {
          loadHistory();
        }
      }
    } catch (e) {
      setIsRepo(false);
    }
  };

  const loadChanges = async () => {
    if (!currentProject) return;
    try {
      const matrix = await GitService.status(currentProject.path);
      const files: any[] = [];
      
      for (const row of matrix) {
        const [filepath, head, workdir, stage] = row as [string, number, number, number];
        
        // Skip clean files
        if (head === 1 && workdir === 1 && stage === 1) {
          continue;
        }

        let statusText = 'M';
        let color = '#FF9800'; // modified (orange)
        let staged = false;

        // 1. Untracked file (absent in HEAD, absent in index, present in workdir)
        if (head === 0 && stage === 0 && workdir > 0) {
          statusText = 'U';
          color = '#888888'; // untracked (gray)
          staged = false;
        }
        // 2. Added file (staged new file)
        else if (head === 0 && stage > 0 && workdir > 0) {
          statusText = 'A';
          color = '#4CAF50'; // added (green)
          staged = true;
        }
        // 3. Deleted file (unstaged deletion)
        else if (head === 1 && stage === 1 && workdir === 0) {
          statusText = 'D';
          color = '#F44336'; // deleted (red)
          staged = false;
        }
        // 4. Deleted file (staged deletion)
        else if (head === 1 && stage === 0 && workdir === 0) {
          statusText = 'D';
          color = '#F44336'; // deleted (red)
          staged = true;
        }
        // 5. Modified file (staged change)
        else if (head === 1 && stage === 2 && workdir === 1) {
          statusText = 'M';
          color = '#4CAF50'; // green for staged modification
          staged = true;
        }
        // 6. Modified file (unstaged change)
        else if (head === 1 && stage === 1 && workdir === 2) {
          statusText = 'M';
          color = '#FF9800'; // orange for unstaged modification
          staged = false;
        }
        // 7. Modified file (staged + additional unstaged changes)
        else if (head === 1 && stage === 2 && workdir === 2) {
          statusText = 'M';
          color = '#FF9800';
          staged = true;
        }

        files.push({
          filepath,
          staged,
          statusText,
          color,
          head,
          workdir,
          stage,
        });
      }
      setChangedFiles(files);
    } catch (e) {
      setChangedFiles([]);
    }
  };

  const loadHistory = async () => {
    if (!currentProject) return;
    try {
      const logs = await GitService.log(currentProject.path, 20);
      setCommitLogs(logs);
    } catch (e) {
      setCommitLogs([]);
    }
  };

  const handleToggleStage = async (file: typeof changedFiles[0]) => {
    if (!currentProject) return;
    try {
      if (file.staged) {
        await GitService.unstageFile(currentProject.path, file.filepath);
      } else {
        await GitService.stageFile(currentProject.path, file.filepath);
      }
      loadChanges();
    } catch (e: any) {
      Alert.alert('Error', `Failed to stage/unstage file: ${e.message}`);
    }
  };

  const handleInit = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      await GitService.init(currentProject.path);
      setIsRepo(true);
      checkRepoStatus();
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
    
    // Save author config in settings store to persist
    useSettingsStore.getState().update({
      gitAuthorName: authorName.trim() || 'Nova Code User',
      gitAuthorEmail: authorEmail.trim() || 'user@novacode.app',
    });

    const stagedCount = changedFiles.filter(f => f.staged).length;
    if (stagedCount === 0) {
      Alert.alert(
        'No Staged Files',
        'You do not have any staged changes. Would you like to stage all files and commit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Stage All & Commit', 
            onPress: async () => {
              setIsProcessing(true);
              try {
                await GitService.addAll(currentProject.path);
                await GitService.commit(currentProject.path, commitMessage.trim());
                setCommitMessage('');
                Alert.alert('Success', 'Commit successful.');
                onGitActionComplete?.();
                loadChanges();
                loadHistory();
              } catch (e: any) { 
                Alert.alert('Error', e.message); 
              } finally { 
                setIsProcessing(false); 
              }
            } 
          }
        ]
      );
      return;
    }

    setIsProcessing(true);
    try {
      await GitService.commit(currentProject.path, commitMessage.trim());
      setCommitMessage('');
      Alert.alert('Success', 'Commit successful.');
      onGitActionComplete?.();
      loadChanges();
      loadHistory();
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
      checkRepoStatus();
    } catch (e: any) {
      Alert.alert('Error', `Failed to link remote: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRemote = async () => {
    if (!currentProject) return;
    Alert.alert(
      'Unlink Remote',
      'Are you sure you want to unlink the remote repository?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlink', 
          style: 'destructive', 
          onPress: async () => {
            setIsProcessing(true);
            try {
              await GitService.deleteRemote(currentProject.path, 'origin');
              setHasRemote(false);
              Alert.alert('Success', 'Remote unlinked successfully.');
              checkRepoStatus();
            } catch (e: any) {
              Alert.alert('Error', `Failed to unlink remote: ${e.message}`);
            } finally {
              setIsProcessing(false);
            }
          } 
        }
      ]
    );
  };

  const handleResetGit = async () => {
    if (!currentProject) return;
    Alert.alert(
      'Reset Git History',
      'This will permanently delete the local Git history (.git folder) for this project. Your code files will NOT be deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: async () => {
            setIsProcessing(true);
            try {
              const gitPath = `${currentProject.path}/.git`;
              const gitExists = await FileService.exists(gitPath);
              if (gitExists) {
                await FileService.deleteFile(gitPath);
              }
              setHasRemote(false);
              setRemoteUrl('');
              Alert.alert('Success', 'Git history has been deleted. You can now initialize a fresh repository.');
              checkRepoStatus();
            } catch (e: any) {
              Alert.alert('Error', `Failed to reset Git history: ${e.message}`);
            } finally {
              setIsProcessing(false);
            }
          } 
        }
      ]
    );
  };

  const handlePush = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      await GitService.push(currentProject.path);
      Alert.alert('Success', 'Pushed to remote.');
    } catch (e: any) {
      if (e.message.includes('not a simple fast-forward')) {
        Alert.alert(
          'Push Rejected',
          'The remote repository contains commits that do not exist locally. Would you like to force push to overwrite them?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Force Push', 
              style: 'destructive',
              onPress: async () => {
                setIsProcessing(true);
                try {
                  await GitService.push(currentProject.path, true);
                  Alert.alert('Success', 'Force push completed successfully.');
                } catch (err: any) {
                  Alert.alert('Error', `Force push failed: ${err.message}`);
                } finally {
                  setIsProcessing(false);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', e.message);
      }
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
      loadChanges();
      loadHistory();
    } catch (e: any) { 
      const isConflict = e.code === 'MergeConflictError' || 
                        (e.message && (
                          e.message.toLowerCase().includes('conflict') || 
                          e.message.toLowerCase().includes('merge')
                        ));
      if (isConflict) {
        Alert.alert(
          'Merge Conflict', 
          'A merge conflict was detected. Please resolve conflicts manually in your files or abort the operation.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Pull Failed', e.message || 'An error occurred during pull.'); 
      }
    } finally { 
      setIsProcessing(false); 
    }
  };

  const openDiff = (filepath: string) => {
    setDiffFilePath(filepath);
    setDiffModalVisible(true);
  };

  const renderChangesTab = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Git Author Config */}
      <GlassCard padding="s3" style={styles.authorCard}>
        <View style={styles.authorHeader}>
          <MaterialCommunityIcons name="account-cog-outline" size={18} color={theme.colors.primaryFixed} />
          <AppText variant="labelXs" style={{ marginLeft: 6, fontWeight: 'bold' }}>Git Author Config</AppText>
        </View>
        <View style={styles.authorInputsRow}>
          <TextInput
            style={styles.authorInput}
            value={authorName}
            onChangeText={setAuthorName}
            placeholder="Name"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCorrect={false}
          />
          <TextInput
            style={styles.authorInput}
            value={authorEmail}
            onChangeText={setAuthorEmail}
            placeholder="Email"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </GlassCard>

      {/* Changed Files Checklist */}
      <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>
        CHANGES ({changedFiles.length})
      </AppText>
      
      {changedFiles.length === 0 ? (
        <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={styles.noChangesText}>
          No modified files.
        </AppText>
      ) : (
        <View style={styles.filesList}>
          {changedFiles.map((item) => (
            <GlassCard key={item.filepath} padding="s2" style={styles.fileItemRow}>
              <Pressable style={styles.checkbox} onPress={() => handleToggleStage(item)}>
                <MaterialCommunityIcons 
                  name={item.staged ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={20} 
                  color={item.staged ? theme.colors.primaryFixed : theme.colors.outline} 
                />
              </Pressable>
              
              <Pressable style={styles.fileDetails} onPress={() => openDiff(item.filepath)}>
                <View style={{flexDirection: 'column', flex: 1}}>
                  <AppText variant="bodySm" style={styles.filePathText} numberOfLines={1}>
                    {item.filepath}
                  </AppText>
                  <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
                    Matrix: [{item.head}, {item.workdir}, {item.stage}]
                  </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
                  <AppText variant="labelXs" style={styles.statusBadgeText}>
                    {item.statusText}
                  </AppText>
                </View>
              </Pressable>
            </GlassCard>
          ))}
        </View>
      )}

      {/* Commit Input Area */}
      <View style={styles.commitSection}>
        <TextInput
          style={styles.input}
          value={commitMessage}
          onChangeText={setCommitMessage}
          placeholder="Commit message..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
        />
        <Pressable 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleCommit}
        >
          <AppText variant="bodyMd" color={theme.colors.background}>Commit Changes</AppText>
        </Pressable>
      </View>

      {/* Remote Setup */}
      {!hasRemote ? (
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>LINK REMOTE</AppText>
          <TextInput
            style={[styles.input, { minHeight: 40, marginBottom: 8 }]}
            value={remoteUrl}
            onChangeText={setRemoteUrl}
            placeholder="https://github.com/user/repo.git"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.06)' }]} onPress={handleAddRemote}>
            <MaterialCommunityIcons name="link-variant" size={18} color={theme.colors.onSurface} style={{marginRight: 8}}/>
            <AppText variant="bodyMd" color={theme.colors.onSurface}>Add Remote (Origin)</AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant} style={styles.sectionTitle}>ACTIONS</AppText>
          <View style={styles.rowActions}>
            <Pressable style={{ flex: 1 }} onPress={handlePull}>
              <GlassCard padding="s3" style={styles.actionCard}>
                <MaterialCommunityIcons name="arrow-down-circle-outline" size={20} color={theme.colors.onSurface} />
                <AppText variant="bodyMd" style={styles.actionText}>Pull</AppText>
              </GlassCard>
            </Pressable>
            <View style={{ width: theme.spacing.s3 }} />
            <Pressable style={{ flex: 1 }} onPress={handlePush}>
              <GlassCard padding="s3" style={styles.actionCard}>
                <MaterialCommunityIcons name="arrow-up-circle-outline" size={20} color={theme.colors.onSurface} />
                <AppText variant="bodyMd" style={styles.actionText}>Push</AppText>
              </GlassCard>
            </Pressable>
          </View>
          <Pressable 
            style={[
              styles.button, 
              { 
                backgroundColor: 'rgba(255, 107, 107, 0.08)', 
                borderWidth: 1, 
                borderColor: 'rgba(255, 107, 107, 0.2)', 
                marginTop: theme.spacing.s3 
              }
            ]} 
            onPress={handleRemoveRemote}
          >
            <MaterialCommunityIcons name="link-off" size={18} color={theme.colors.error} style={{marginRight: 8}}/>
            <AppText variant="bodyMd" color={theme.colors.error}>Unlink Remote Repository</AppText>
          </Pressable>
        </View>
      )}

      {isRepo && (
        <View style={[styles.section, { marginTop: theme.spacing.s6 }]}>
          <AppText variant="labelXs" color={theme.colors.error} style={[styles.sectionTitle, { opacity: 0.8 }]}>DANGER ZONE</AppText>
          <Pressable 
            style={[
              styles.button, 
              { 
                backgroundColor: 'rgba(255, 107, 107, 0.05)', 
                borderWidth: 1, 
                borderColor: 'rgba(255, 107, 107, 0.15)' 
              }
            ]} 
            onPress={handleResetGit}
          >
            <MaterialCommunityIcons name="delete-forever-outline" size={18} color={theme.colors.error} style={{marginRight: 8}}/>
            <AppText variant="bodyMd" color={theme.colors.error}>Delete Local Git History (.git)</AppText>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <FlatList
      data={commitLogs}
      keyExtractor={(item) => item.oid}
      renderItem={({ item }) => (
        <GlassCard padding="s3" style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.commitBadge}>
              <MaterialCommunityIcons name="source-commit" size={16} color={theme.colors.primaryFixed} />
              <AppText variant="codeSm" color={theme.colors.primaryFixed} style={styles.oidText}>
                {item.oid.substring(0, 7)}
              </AppText>
            </View>
            <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
              {new Date(item.commit.author.timestamp * 1000).toLocaleDateString()}
            </AppText>
          </View>
          <AppText variant="bodySm" style={styles.historyMessage} numberOfLines={2}>
            {item.commit.message}
          </AppText>
          <AppText variant="labelXs" color={theme.colors.onSurfaceVariant}>
            By: {item.commit.author.name}
          </AppText>
        </GlassCard>
      )}
      ListEmptyComponent={
        <AppText variant="bodySm" color={theme.colors.onSurfaceVariant} style={styles.noChangesText}>
          No commits in history.
        </AppText>
      }
      contentContainerStyle={{ gap: theme.spacing.s2 }}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <>
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
                  {/* Segmented Tabs */}
                  <View style={styles.tabContainer}>
                    <Pressable 
                      style={[styles.tab, activeTab === 'changes' && styles.activeTab]}
                      onPress={() => setActiveTab('changes')}
                    >
                      <AppText variant="bodyMd" color={activeTab === 'changes' ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}>
                        Changes
                      </AppText>
                    </Pressable>
                    <Pressable 
                      style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                      onPress={() => setActiveTab('history')}
                    >
                      <AppText variant="bodyMd" color={activeTab === 'history' ? theme.colors.primaryFixed : theme.colors.onSurfaceVariant}>
                        History
                      </AppText>
                    </Pressable>
                  </View>

                  {activeTab === 'changes' ? renderChangesTab() : renderHistoryTab()}
                </View>
              )}
            </GlassPanel>
          </Animated.View>
        </View>
      </Modal>

      {currentProject && (
        <DiffModal
          visible={diffModalVisible}
          onClose={() => setDiffModalVisible(false)}
          filePath={diffFilePath}
          projectPath={currentProject.path}
        />
      )}
    </>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: theme.spacing.s3,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.s2,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primaryFixed,
  },
  scrollContent: {
    flex: 1,
  },
  authorCard: {
    marginBottom: theme.spacing.s4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
  },
  authorInputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
  },
  authorInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s2,
    paddingVertical: 6,
    fontSize: 12,
  },
  section: {
    marginBottom: theme.spacing.s4,
  },
  sectionTitle: {
    marginBottom: theme.spacing.s2,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  noChangesText: {
    textAlign: 'center',
    paddingVertical: theme.spacing.s4,
  },
  filesList: {
    gap: theme.spacing.s2,
    marginBottom: theme.spacing.s4,
  },
  fileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  checkbox: {
    padding: theme.spacing.s3,
    marginLeft: -theme.spacing.s2,
  },
  fileDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: theme.spacing.s2,
  },
  filePathText: {
    flex: 1,
    marginRight: theme.spacing.s2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusBadgeText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  commitSection: {
    marginBottom: theme.spacing.s4,
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  actionText: {
    marginLeft: theme.spacing.s2,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
  },
  commitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  oidText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  historyMessage: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.s1,
  },
});