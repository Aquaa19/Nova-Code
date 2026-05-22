// src/features/terminal/hooks/useRunWorkflow.ts

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { FileService } from '../../../services/FileService';
import { useTerminalEngine } from './useTerminalEngine';
import { RUN_CONFIGS } from '../../../constants/runCommands';
import { OpenFile } from '../../../store/useEditorStore';
import { WebViewEditorHandle } from '../../editor/components/WebViewEditor';

export function cleanRawOutput(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, '')
    .replace(/\x1b[@-_]/g, '')
    .replace(/\x1b[^\[\]]/g, '')
    .replace(/\x1b/g, '');
}

export function detectInteractiveNeeded(content: string, language: string): boolean {
  const normalized = content
    .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '') // strip C-style comments
    .replace(/#.*/g, ''); // strip python/shell comments
  if (language === 'python') {
    return /\binput\s*\(/.test(normalized);
  }
  if (language === 'java') {
    return /\b(Scanner|BufferedReader|System\.in)\b/.test(normalized);
  }
  if (language === 'cpp' || language === 'c') {
    return /\b(cin|scanf|gets|fgets|getchar)\b/.test(normalized);
  }
  return false;
}

export function generateHint(output: string): string | null {
  if (output.includes('NameError:')) {
    return '💡 Hint: You are using a variable or function that hasn\'t been defined yet. Check for spelling mistakes or missing declarations!';
  }
  if (output.includes('TypeError:')) {
    return '💡 Hint: A TypeError occurs when an operation is performed on an incompatible type (e.g. mixing strings and numbers). Double check your operations!';
  }
  if (output.includes("AttributeError: 'NoneType'")) {
    return '💡 Hint: You are trying to access an attribute or call a method on a variable that is currently "None". Check why the variable was not initialized!';
  }
  if (output.includes('IndexError: list index out of range')) {
    return '💡 Hint: You are accessing a list index that doesn\'t exist. Remember list indices range from 0 to length - 1!';
  }
  if (output.includes('NullPointerException')) {
    return '💡 Hint: A NullPointerException means you are trying to use an object reference that points to nothing (null). Make sure you instantiated the object with "new"!';
  }
  if (output.includes('ArrayIndexOutOfBoundsException')) {
    return '💡 Hint: You accessed an invalid array index. Ensure the index is within the bounds of 0 to array.length - 1!';
  }
  if (output.includes('Segmentation fault') || output.includes('SIGSEGV')) {
    return '💡 Hint: A Segmentation Fault occurred! This usually means you accessed memory illegally (e.g., dereferencing a null/uninitialized pointer, or buffer overflow).';
  }
  if (output.includes('std::out_of_range')) {
    return '💡 Hint: You accessed an element outside the valid range of a container (e.g. std::vector or std::string index). Verify your bounds!';
  }
  return null;
}

export function useRunWorkflow(
  editorRef: React.RefObject<WebViewEditorHandle | null>,
  activeFile: OpenFile | undefined,
  markSaved: (path: string) => void
) {
  const [terminalStatus, setTerminalStatus] = useState('Ready');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [runningCommand, setRunningCommand] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [requiresInteractiveTab, setRequiresInteractiveTab] = useState(false);

  // Store target for the upload acknowledgment step
  const runTargetRef = useRef<{ path: string; config: any; customCommand?: string } | null>(null);

  const scanForErrors = useCallback((rawOutput: string, currentFilePath: string) => {
    const clean = cleanRawOutput(rawOutput);
    const lines = clean.split('\n');
    const filename = currentFilePath.split('/').pop() || '';
    
    const regexes = [
      /([^/\\]+\.\w+):(\d+):(?:\d+:)?\s*(?:fatal\s+)?error/i, // GCC/G++
      /File\s+"([^"]+)",\s+line\s+(\d+)/i,                   // Python
      /([^/\\]+\.java):(\d+):\s*error/i,                     // Java
      /at\s+(?:.*\s+\()?([^:]+):(\d+):\d+\)?/i               // Node.js
    ];

    for (const line of lines) {
      for (const rx of regexes) {
        const match = line.match(rx);
        if (match) {
          const errFile = match[1];
          const errLine = parseInt(match[2], 10);
          
          if (errFile.includes(filename) || filename.includes(errFile)) {
            editorRef.current?.setErrorLine(errLine);
            return;
          }
        }
      }
    }
  }, [editorRef]);

  const appendLine = useCallback((raw: string) => {
    const clean = cleanRawOutput(raw);
    if (!clean.trim()) return;

    if (activeFile?.path) {
      scanForErrors(raw, activeFile.path);
    }

    const hint = generateHint(clean);

    setTerminalLines(prev => {
      const lines = clean.split('\n');
      const next = [...prev];
      if (next.length === 0) return lines;
      
      const lastLine = next[next.length - 1];
      const isManualLog = lastLine.startsWith('Uploading ') || lastLine.startsWith('Running: ');
      
      if (isManualLog) {
        for (const line of lines) {
          next.push(line);
        }
      } else {
        next[next.length - 1] += lines[0];
        for (let i = 1; i < lines.length; i++) next.push(lines[i]);
      }

      if (hint) {
        next.push('');
        next.push(hint);
      }
      return next;
    });
  }, [activeFile?.path, scanForErrors]);

  const { connect, disconnect, sendInput, sendFile, isConnected } = useTerminalEngine({
    onOutput: appendLine,
    onUploadAck: (filename) => {
      const target = runTargetRef.current;
      if (!target) return;

      let command = '';
      if (target.customCommand) {
        command = target.customCommand;
      } else {
        const baseName = filename;
        const className = baseName.replace(/\.[^/.]+$/, ''); // Remove extension for Java
        
        const configArgs = target.config.args.join(' ')
          .replace(/{filename}/g, baseName)
          .replace(/{classname}/g, className);
          
        command = `${target.config.command} ${configArgs}`;
      }
      
      setRunningCommand(command);
      setTerminalLines(prev => [...prev, `Running: ${command.trim()}`]);
      sendInput(`${command}\n`);
    },
    onConnected: () => {
      setTerminalStatus('Running...');
      setIsNetworkError(false);
      
      const target = runTargetRef.current;
      if (!target) {
        setTerminalLines(prev => [...prev, 'No run target specified.']);
        return;
      }
      
      const fileName = target.path.split('/').pop() ?? 'main';
      setTerminalLines(prev => [...prev, `Uploading ${fileName}...`]);
      
      FileService.readFile(target.path)
        .then(content => sendFile(fileName, content))
        .catch(() => setTerminalLines(prev => [...prev, 'Failed to read file for upload.']));
    },
    onDisconnected: () => {
      setTerminalStatus('Disconnected');
      setTerminalLines(prev => [...prev, '', '[Nova Engine] Session closed.']);
    },
    onError: (err) => {
      setTerminalStatus('Error');
      setIsNetworkError(true);
      setTerminalLines(prev => [...prev, '', `[Nova Engine] Error: ${err}`]);
    },
  });

  const runProjectOrFile = useCallback(async (path: string, language: string, customCommand?: string) => {
    editorRef.current?.clearErrorLine();
    const config = RUN_CONFIGS[language];
    
    if (!config && !customCommand) {
      Alert.alert('Unsupported', `No run configuration found for ${language}.`);
      return;
    }

    // Check if interactive input is used to route tab
    let isInteractive = false;
    try {
      const fileContent = await FileService.readFile(path);
      isInteractive = detectInteractiveNeeded(fileContent, language);
    } catch (e) {
      console.warn('Failed to scan file for interactive inputs', e);
    }
    setRequiresInteractiveTab(isInteractive);

    const actualConfig = config || { requiresSave: true };
    if (actualConfig.requiresSave) {
      try {
        const content = await editorRef.current?.getContent();
        if (content !== undefined) {
          await FileService.writeFile(path, content);
          markSaved(path);
        }
      } catch (e) {
        console.warn('Auto-save before run failed', e);
      }
    }

    runTargetRef.current = { path, config: actualConfig, customCommand };
    setTerminalLines([]);
    setRunningCommand(null);
    setIsNetworkError(false);
    setTerminalStatus('Connecting...');
    setConsoleVisible(true);
    setTimeout(() => connect(), 0);
  }, [connect, markSaved, editorRef]);

  const outputLines = terminalLines
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.includes('student@') && trimmed.includes('/workspace$')) {
        const parts = line.split(/student@[0-9a-f]+:\s*\/workspace\s*\$/i);
        return parts[0];
      }
      return line;
    })
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      
      if (trimmed.includes('student@') || trimmed.includes('/workspace$') || trimmed.includes('/workspace#') || trimmed.endsWith('/workspace:')) {
        return false;
      }
      
      if (runningCommand) {
        const cleanCmd = runningCommand.trim();
        if (trimmed === cleanCmd || trimmed === `${cleanCmd}${cleanCmd}` || trimmed === `python3 main.pypython3 main.py`) {
          return false;
        }
      }
      return true;
    });

  return {
    runProjectOrFile,
    stopRun: disconnect,
    sendInput,
    consoleVisible,
    setConsoleVisible,
    terminalLines,
    outputLines,
    setTerminalLines,
    terminalStatus,
    isConnected,
    isNetworkError,
    requiresInteractiveTab,
  };
}