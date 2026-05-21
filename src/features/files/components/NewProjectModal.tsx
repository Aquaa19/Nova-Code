// src/features/files/components/NewProjectModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../../components/typography/AppText';
import { GlassPanel } from '../../../components/panels/GlassPanel';
import { GlassCard } from '../../../components/cards/GlassCard';
import { theme } from '../../../theme';
import { TEMPLATES, ProjectTemplateType } from '../../../templates';

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, template: ProjectTemplateType) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateType>('html-blank');

  // Reset state whenever the modal opens
  useEffect(() => {
    if (visible) {
      setProjectName('');
      setSelectedTemplate('html-blank');
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
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.grid}>
            {(Object.keys(TEMPLATES) as ProjectTemplateType[]).map((key) => {
              const tmpl = TEMPLATES[key];
              const isSelected = selectedTemplate === key;
              return (
                <Pressable 
                  key={key} 
                  style={styles.gridItem} 
                  onPress={() => setSelectedTemplate(key)}
                >
                  <GlassCard 
                    padding="s3" 
                    style={[
                      styles.card, 
                      isSelected && styles.cardSelected
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <MaterialCommunityIcons name="check-circle" size={16} color={tmpl.color} />
                      </View>
                    )}
                    <MaterialCommunityIcons 
                      name={tmpl.icon} 
                      size={32} 
                      color={isSelected ? tmpl.color : theme.colors.onSurfaceVariant} 
                      style={styles.cardIcon}
                    />
                    <AppText 
                      variant="labelXs" 
                      color={isSelected ? theme.colors.white : theme.colors.onSurfaceVariant}
                      style={[styles.cardText, isSelected && { fontWeight: 'bold' }]}
                    >
                      {tmpl.name}
                    </AppText>
                  </GlassCard>
                </Pressable>
              );
            })}
          </ScrollView>

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
  scrollContainer: {
    maxHeight: 220,
    marginBottom: theme.spacing.s4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.s2,
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
    borderColor: theme.colors.primaryFixed,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    shadowColor: theme.colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
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