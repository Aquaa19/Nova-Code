// src/features/search/services/SearchService.ts

import Fuse from 'fuse.js';
import { FileService } from '../../../services/FileService';

export interface SearchMatch {
  id: string;
  filePath: string;
  fileName: string;
  lineNumber?: number;
  lineContent?: string;
  matchStart?: number;
  matchEnd?: number;
  type: 'filename' | 'content';
}

class SearchServiceClass {
  private fileIndex: string[] = [];
  private fuse: Fuse<string> | null = null;

  async indexProject(projectPath: string): Promise<void> {
    const paths: string[] = [];
    await this.collectPaths(projectPath, paths);
    this.fileIndex = paths;
    
    this.fuse = new Fuse(paths, {
      threshold: 0.4,
      includeScore: true,
    });
  }

  private async collectPaths(dir: string, out: string[]): Promise<void> {
    const items = await FileService.readDir(dir);
    for (const item of items) {
      if (item.isDirectory) {
        if (!item.name.startsWith('.') && item.name !== 'node_modules') {
          await this.collectPaths(item.path, out);
        }
      } else {
        out.push(item.path);
      }
    }
  }

  searchFilenames(query: string): SearchMatch[] {
    if (!this.fuse || !query.trim()) return [];
    
    return this.fuse.search(query).slice(0, 20).map(result => ({
      id: `file_${result.item}`,
      filePath: result.item,
      fileName: result.item.split('/').pop() ?? '',
      type: 'filename',
    }));
  }

  async searchContent(
    query: string,
    onMatch: (match: SearchMatch) => void,
    onComplete: () => void,
  ): Promise<void> {
    if (!query.trim() || this.fileIndex.length === 0) {
      onComplete();
      return;
    }

    const paths = [...this.fileIndex];
    // Escape regex characters and make case-insensitive
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    const BATCH_SIZE = 10;
    let i = 0;

    const processBatch = async () => {
      const batch = paths.slice(i, i + BATCH_SIZE);
      i += BATCH_SIZE;

      for (const filePath of batch) {
        try {
          const content = await FileService.readFile(filePath);
          const lines = content.split('\n');
          
          lines.forEach((line, lineIndex) => {
            const match = regex.exec(line);
            if (match) {
              onMatch({
                id: `content_${filePath}_${lineIndex}`,
                filePath,
                fileName: filePath.split('/').pop() ?? '',
                lineNumber: lineIndex + 1,
                lineContent: line.trim(),
                matchStart: match.index,
                matchEnd: match.index + match[0].length,
                type: 'content',
              });
            }
            regex.lastIndex = 0; 
          });
        } catch {
          // Skip binary files or unreadable items
        }
      }

      if (i < paths.length) {
        setTimeout(processBatch, 5); // Yield to JS event loop
      } else {
        onComplete();
      }
    };

    await processBatch();
  }
}

export const SearchService = new SearchServiceClass();