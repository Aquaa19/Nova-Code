// src/features/terminal/hooks/__tests__/useRunWorkflow.test.ts

import React from 'react';
import TestRenderer from 'react-test-renderer';
import { 
  useRunWorkflow, 
  cleanRawOutput, 
  detectInteractiveNeeded, 
  generateHint 
} from '../useRunWorkflow';
import { FileService } from '../../../../services/FileService';
import { useTerminalEngine } from '../useTerminalEngine';

const { act } = TestRenderer;

function renderHook<T>(hookFn: () => T) {
  const result = { current: null as any };
  function TestComponent() {
    result.current = hookFn();
    return null;
  }
  act(() => {
    TestRenderer.create(React.createElement(TestComponent));
  });
  return { result };
}

jest.mock('../../../../services/FileService', () => ({
  FileService: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

// Mock useTerminalEngine hook
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSendInput = jest.fn();
const mockSendFile = jest.fn();

jest.mock('../useTerminalEngine', () => ({
  useTerminalEngine: jest.fn((options: any) => {
    // Keep reference to callbacks so we can trigger them in tests
    (globalThis as any).terminalCallbacks = options;
    return {
      connect: mockConnect,
      disconnect: mockDisconnect,
      sendInput: mockSendInput,
      sendFile: mockSendFile,
      isConnected: false,
    };
  }),
}));

describe('useRunWorkflow Helpers', () => {
  describe('cleanRawOutput', () => {
    it('should strip carriage returns and ANSI color escape sequences', () => {
      const rawOutput = '\x1b[31mError:\x1b[0m Failed loading.\r\n';
      expect(cleanRawOutput(rawOutput)).toBe('Error: Failed loading.\n');
    });

    it('should strip complex screen control characters', () => {
      const complexOutput = '\x1b]0;title\x07Hello World';
      expect(cleanRawOutput(complexOutput)).toBe('Hello World');
    });
  });

  describe('detectInteractiveNeeded', () => {
    it('should return true for python input() function calls', () => {
      const code = 'name = input("Enter name: ")';
      expect(detectInteractiveNeeded(code, 'python')).toBe(true);
    });

    it('should return false for commented out python input() calls', () => {
      const code = '# val = input("enter:")';
      expect(detectInteractiveNeeded(code, 'python')).toBe(false);
    });

    it('should return true for Java Scanner usage', () => {
      const code = 'Scanner scanner = new Scanner(System.in);';
      expect(detectInteractiveNeeded(code, 'java')).toBe(true);
    });

    it('should return true for C++ cin statements', () => {
      const code = 'std::cin >> val;';
      expect(detectInteractiveNeeded(code, 'cpp')).toBe(true);
    });

    it('should return false for non-interactive files', () => {
      const code = 'console.log("no interaction needed");';
      expect(detectInteractiveNeeded(code, 'javascript')).toBe(false);
    });
  });

  describe('generateHint', () => {
    it('should generate hints for Python TypeError', () => {
      const err = 'TypeError: unsupported operand type(s)';
      expect(generateHint(err)).toContain('💡 Hint: A TypeError occurs');
    });

    it('should generate hints for Java NullPointerException', () => {
      const err = 'java.lang.NullPointerException at Main.java:5';
      expect(generateHint(err)).toContain('💡 Hint: A NullPointerException means');
    });

    it('should return null for normal output messages without errors', () => {
      expect(generateHint('Hello from Python 🚀')).toBeNull();
    });
  });
});

describe('useRunWorkflow Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with ready state and connect correctly', async () => {
    const editorRef = {
      current: {
        getContent: jest.fn().mockResolvedValue('print("hello")'),
        setErrorLine: jest.fn(),
        clearErrorLine: jest.fn(),
      },
    };
    const activeFile = { path: '/workspace/main.py', name: 'main.py' };
    const markSaved = jest.fn();

    (FileService.readFile as jest.Mock).mockResolvedValue('print("hello")');
    (FileService.writeFile as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => 
      useRunWorkflow(editorRef as any, activeFile as any, markSaved)
    );

    expect(result.current.terminalStatus).toBe('Ready');
    expect(result.current.isConnected).toBe(false);

    // Run project file
    jest.useFakeTimers();
    await act(async () => {
      await result.current.runProjectOrFile('/workspace/main.py', 'python');
      jest.runAllTimers();
    });

    expect(editorRef.current.clearErrorLine).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
