// src/features/terminal/services/PistonService.ts

import { FileService } from '../../../services/FileService';

export interface PistonExecuteResponse {
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
  };
  message?: string; // For API errors
}

interface PistonPayload {
  language: string;
  version: string;
  files: Array<{ name: string; content: string }>;
  stdin?: string;
}

const IGNORED_DIRECTORIES = ['.git', 'node_modules', '.expo', 'android', 'ios'];

class PistonServiceClass {
  // Maps your app's language identifiers to Piston's runtime names and versions
  private getPistonRuntime(language: string): { name: string; version: string } {
    const map: Record<string, { name: string; version: string }> = {
      'python': { name: 'python', version: '*' },
      'javascript': { name: 'javascript', version: '*' },
      'node': { name: 'javascript', version: '*' },
      'typescript': { name: 'typescript', version: '*' },
      'react-native': { name: 'javascript', version: '*' }, // Executed as JS in Piston
      'plaintext': { name: 'bash', version: '*' }, // Fallback
    };
    return map[language.toLowerCase()] || { name: 'bash', version: '*' };
  }

  // Recursively read the project directory and build the files array
  private async bundleProjectFiles(projectPath: string): Promise<Array<{ name: string; content: string }>> {
    const files: Array<{ name: string; content: string }> = [];

    const traverse = async (currentPath: string) => {
      const items = await FileService.readDir(currentPath);
      
      for (const item of items) {
        if (item.isDirectory) {
          if (!IGNORED_DIRECTORIES.includes(item.name)) {
            await traverse(item.path);
          }
        } else {
          const content = await FileService.readFile(item.path);
          // Piston expects relative paths like "src/index.js", so we strip the project root path
          const relativePath = item.path.replace(`${projectPath}/`, '');
          files.push({ name: relativePath, content });
        }
      }
    };

    await traverse(projectPath);

    // Sort to ensure main files (index.js, main.py) are at the front of the array for Piston
    return files.sort((a, b) => {
      const isAMain = a.name.includes('main') || a.name.includes('index');
      const isBMain = b.name.includes('main') || b.name.includes('index');
      if (isAMain && !isBMain) return -1;
      if (!isAMain && isBMain) return 1;
      return 0;
    });
  }

  async executeProject(projectPath: string, language: string, stdin: string = ''): Promise<PistonExecuteResponse> {
    try {
      const files = await this.bundleProjectFiles(projectPath);
      const runtime = this.getPistonRuntime(language);

      const payload: PistonPayload = {
        language: runtime.name,
        version: runtime.version,
        files,
        stdin,
      };

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Execution Engine Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      return {
        run: { output: '', stdout: '', stderr: '', code: 1, signal: null },
        message: error.message || 'Failed to connect to execution engine.',
      };
    }
  }
}

export const PistonService = new PistonServiceClass();
