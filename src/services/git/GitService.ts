// src/services/git/GitService.ts

import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { RNFSAdapter } from './RNFSAdapter';
import { storage } from '../../storage/mmkv';

const fs = RNFSAdapter;

export interface GitAuthor {
  name: string;
  email: string;
}

class GitServiceClass {
  private getAuthor(): GitAuthor {
    return {
      name: storage.getString('gitAuthorName') ?? 'Nova Code User',
      email: storage.getString('gitAuthorEmail') ?? 'user@novacode.app',
    };
  }

  private getToken(): string | undefined {
    return storage.getString('gitPAT') ?? undefined;
  }

  private getHttpHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    return { 'Authorization': `token ${token}` };
  }
  

  async init(dir: string): Promise<void> {
    await git.init({ fs, dir });
  }

  async clone(url: string, dir: string, onProgress?: (p: any) => void): Promise<void> {
    await git.clone({
      fs,
      http,
      dir,
      url,
      headers: this.getHttpHeaders(),
      onProgress,
      depth: 1, // Shallow clone is much safer for mobile memory
    });
  }

  async add(dir: string, filepath: string): Promise<void> {
    await git.add({ fs, dir, filepath });
  }

  async addAll(dir: string): Promise<void> {
    const status = await this.status(dir);
    for (const [file, , worktree] of status) {
      // If worktree is different from 1 (unmodified), stage it
      if (worktree !== 1) {
        await git.add({ fs, dir, filepath: file });
      }
    }
  }

  async commit(dir: string, message: string): Promise<string> {
    const author = this.getAuthor();
    return git.commit({ fs, dir, message, author });
  }

  async push(dir: string): Promise<void> {
    await git.push({ fs, http, dir, headers: this.getHttpHeaders() });
  }

  async pull(dir: string): Promise<void> {
    const author = this.getAuthor();
    await git.pull({ fs, http, dir, author, headers: this.getHttpHeaders() });
  }

  // Returns matrix of file statuses [filepath, HEAD, workdir, stage]
  async status(dir: string) {
    return git.statusMatrix({ fs, dir });
  }

  async log(dir: string, depth = 20) {
    return git.log({ fs, dir, depth });
  }

  async currentBranch(dir: string): Promise<string | void> {
    return git.currentBranch({ fs, dir });
  }

  async isRepo(dir: string): Promise<boolean> {
    try {
      await git.resolveRef({ fs, dir, ref: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }
}

export const GitService = new GitServiceClass();