// src/store/__tests__/useEditorStore.test.ts

import { useEditorStore } from '../useEditorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useEditorStore.getState().clearFiles();
  });

  it('should initialize with empty openFiles and activeIndex 0', () => {
    const state = useEditorStore.getState();
    expect(state.openFiles).toEqual([]);
    expect(state.activeIndex).toBe(0);
  });

  describe('openFile', () => {
    it('should add a file to openFiles and set it as active', () => {
      const file1 = { path: '/workspace/app.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      
      useEditorStore.getState().openFile(file1);

      const state = useEditorStore.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.openFiles[0]).toEqual(file1);
      expect(state.activeIndex).toBe(0);
    });

    it('should set activeIndex but not duplicate file if it is already open', () => {
      const file1 = { path: '/workspace/app.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      const file2 = { path: '/workspace/index.html', language: 'html', unsaved: false, cursorLine: 1, cursorCol: 1 };

      useEditorStore.getState().openFile(file1);
      useEditorStore.getState().openFile(file2);
      useEditorStore.getState().openFile(file1); // Open file1 again

      const state = useEditorStore.getState();
      expect(state.openFiles).toHaveLength(2);
      expect(state.activeIndex).toBe(0); // Index of file1
    });
  });

  describe('closeFile', () => {
    it('should close files and adjust activeIndex correctly when preceding tab is closed', () => {
      const file1 = { path: '/workspace/a.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      const file2 = { path: '/workspace/b.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      const file3 = { path: '/workspace/c.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };

      useEditorStore.getState().openFile(file1); // Index 0
      useEditorStore.getState().openFile(file2); // Index 1
      useEditorStore.getState().openFile(file3); // Index 2
      useEditorStore.getState().setActiveIndex(2); // Focus on c.js

      // Close a.js (Index 0) which is less than activeIndex (2)
      useEditorStore.getState().closeFile('/workspace/a.js');

      const state = useEditorStore.getState();
      expect(state.openFiles).toHaveLength(2);
      expect(state.openFiles[0].path).toBe('/workspace/b.js');
      expect(state.openFiles[1].path).toBe('/workspace/c.js');
      // activeIndex should shift left by 1 to remain on c.js (now index 1)
      expect(state.activeIndex).toBe(1);
    });

    it('should shift activeIndex if active tab itself is closed and it is the last tab', () => {
      const file1 = { path: '/workspace/a.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      const file2 = { path: '/workspace/b.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };

      useEditorStore.getState().openFile(file1);
      useEditorStore.getState().openFile(file2);
      useEditorStore.getState().setActiveIndex(1); // Focus on b.js (last tab)

      useEditorStore.getState().closeFile('/workspace/b.js');

      const state = useEditorStore.getState();
      expect(state.openFiles).toHaveLength(1);
      expect(state.activeIndex).toBe(0); // Focus fallback to a.js
    });
  });

  describe('dirty / unsaved state transitions', () => {
    it('should transition unsaved states correctly between true and false', () => {
      const file = { path: '/workspace/app.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      useEditorStore.getState().openFile(file);

      // Mark unsaved/dirty
      useEditorStore.getState().markUnsaved('/workspace/app.js');
      expect(useEditorStore.getState().openFiles[0].unsaved).toBe(true);

      // Mark saved/clean
      useEditorStore.getState().markSaved('/workspace/app.js');
      expect(useEditorStore.getState().openFiles[0].unsaved).toBe(false);
    });
  });

  describe('content and cursor updates', () => {
    it('should update cached text content and cursor positions', () => {
      const file = { path: '/workspace/app.js', language: 'javascript', unsaved: false, cursorLine: 1, cursorCol: 1 };
      useEditorStore.getState().openFile(file);

      useEditorStore.getState().updateContent('/workspace/app.js', 'console.log("new content");');
      useEditorStore.getState().updateCursor('/workspace/app.js', 10, 5);

      const updatedFile = useEditorStore.getState().openFiles[0];
      expect(updatedFile.content).toBe('console.log("new content");');
      expect(updatedFile.cursorLine).toBe(10);
      expect(updatedFile.cursorCol).toBe(5);
    });
  });
});
