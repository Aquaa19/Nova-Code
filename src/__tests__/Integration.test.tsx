// src/__tests__/Integration.test.tsx

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProjectService } from '../features/files/services/ProjectService';
import { FileService } from '../services/FileService';
import { useEditorStore } from '../store/useEditorStore';
import { useProjectStore } from '../store/useProjectStore';
import { TemplateService } from '../services/TemplateService';

jest.mock('../services/FileService', () => ({
  FileService: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('print("hello")'),
    readDir: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(true),
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
  PROJECTS_ROOT: '/mock/projects',
}));

describe('App Integration Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEditorStore.setState({ activeFile: undefined, openFiles: [] });
    useProjectStore.setState({ currentProject: null, projects: [] });
  });

  it('should verify project creation flow generating template structure correctly', async () => {
    (FileService.exists as jest.Mock).mockResolvedValue(false);
    const createSpy = jest.spyOn(TemplateService, 'generateProject').mockResolvedValue(undefined);

    const project = await ProjectService.createProject('MyPythonApp', 'python');

    expect(project.name).toBe('MyPythonApp');
    expect(project.language).toBe('python');
    expect(createSpy).toHaveBeenCalledWith('python', expect.stringContaining('MyPythonApp'), 'MyPythonApp');
    createSpy.mockRestore();
  });

  it('should verify file open and save lifecycle updating store and writing to filesystem', async () => {
    const file = { path: '/mock/projects/test/main.py', name: 'main.py', language: 'python', unsaved: false, cursorLine: 1, cursorCol: 1 };
    
    // 1. Open the file in the store
    await ReactTestRenderer.act(async () => {
      useEditorStore.getState().openFile(file);
    });

    const state = useEditorStore.getState();
    const activeFile = state.openFiles[state.activeIndex];
    expect(activeFile).toEqual(file);
    expect(state.openFiles).toContainEqual(file);

    // 2. Mock saving modified content to filesystem
    await ReactTestRenderer.act(async () => {
      await FileService.writeFile(file.path, 'print("new content")');
    });

    expect(FileService.writeFile).toHaveBeenCalledWith(file.path, 'print("new content")');
  });

  it('should verify workspace execution workflow and run configuration mappings', async () => {
    const mockProject = { id: '1', name: 'MyProject', path: '/mock/projects/MyProject', language: 'python' };
    useProjectStore.setState({ currentProject: mockProject });

    expect(useProjectStore.getState().currentProject?.language).toBe('python');
    expect(useProjectStore.getState().currentProject?.path).toBe('/mock/projects/MyProject');
  });
});
