// src/features/files/components/NewProjectModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { GlassCard } from '../../../components/cards/GlassCard';
import { theme } from '../../../theme';
import { ProjectTemplateType } from '../../../templates';

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, template: ProjectTemplateType) => void;
}

const TEMPLATE_OPTIONS: Array<{ id: ProjectTemplateType; label: string; icon: string; color: string }> = [
  { id: 'blank', label: 'Blank Project', icon: 'folder-outline', color: '#E8C84A' },
  { id: 'python', label: 'Python Script', icon: 'language-python', color: '#3572A5' },
  { id: 'node', label: 'Node.js App', icon: 'nodejs', color: '#68A063' },
  { id: 'react-native', label: 'React Native', icon: 'react', color: '#61DAFB' },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateType>('blank');

  // Reset state whenever the modal opens
  useEffect(() => {
    if (visible) {
      setProjectName('');
      setSelectedTemplate('blank');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (projectName.trim()) {
      onSubmit(projectName.trim(), selectedTemplate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.panel}>
          <AppText variant="headlineMd" style={styles.title}>Create New Project</AppText>

          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.label}>
            Project Name
          </AppText>
          <TextInput
            style={styles.input}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="e.g., MyAwesomeApp"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
          />

          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.label}>
            Select Template
          </AppText>
          <View style={styles.grid}>
            {TEMPLATE_OPTIONS.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <Pressable 
                  key={tmpl.id} 
                  style={styles.gridItem} 
                  onPress={() => setSelectedTemplate(tmpl.id)}
                >
                  <GlassCard 
                    padding="s3" 
                    style={[
                      styles.card, 
                      isSelected && styles.cardSelected
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={tmpl.icon} 
                      size={32} 
                      color={isSelected ? tmpl.color : theme.colors.onSurfaceVariant} 
                      style={styles.cardIcon}
                    />
                    <AppText 
                      variant="labelXs" 
                      color={isSelected ? theme.colors.onSurface : theme.colors.onSurfaceVariant}
                      style={styles.cardText}
                    >
                      {tmpl.label}
                    </AppText>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>Cancel</AppText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.submitButton, !projectName.trim() && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!projectName.trim()}
            >
              <AppText variant="bodyMd" color={theme.colors.black}>Create</AppText>
            </Pressable>
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
  },
  title: {
    marginBottom: theme.spacing.s4,
  },
  label: {
    marginBottom: theme.spacing.s2,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    fontSize: 16,
    marginBottom: theme.spacing.s4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.s2,
    marginBottom: theme.spacing.s4,
  },
  gridItem: {
    width: '50%',
    padding: theme.spacing.s2,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  cardIcon: {
    marginBottom: theme.spacing.s2,
  },
  cardText: {
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s2,
  },
  button: {
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    borderRadius: theme.radius.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitDisabled: {
    opacity: 0.5,
  },
});