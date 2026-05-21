// src/services/git/GitService.ts

import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { RNFSAdapter } from './RNFSAdapter';
import { storage } from '../../storage/mmkv';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Buffer } from 'buffer';

const fs = RNFSAdapter;

export interface GitAuthor {
  name: string;
  email: string;
}

class GitServiceClass {
  private getAuthor(): GitAuthor {
    const settings = useSettingsStore.getState();
    return {
      name: settings.gitAuthorName || 'Nova Code User',
      email: settings.gitAuthorEmail || 'user@novacode.app',
    };
  }

  private getToken(): string | undefined {
    return useSettingsStore.getState().gitPAT || undefined;
  }

  private getHttpHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    const base64Auth = Buffer.from(`oauth2:${token}`).toString('base64');
    return { 'Authorization': `Basic ${base64Auth}` };
  }

  private getAuthCallback() {
    return () => {
      const token = this.getToken();
      if (!token) return undefined;
      return { username: 'oauth2', password: token };
    };
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
      onAuth: this.getAuthCallback(),
      onProgress,
      depth: 1, // Shallow clone is much safer for mobile memory
    });
  }

  async add(dir: string, filepath: string): Promise<void> {
    await git.add({ fs, dir, filepath });
  }

  async stageFile(dir: string, filepath: string): Promise<void> {
    try {
      const fileExists = await fs.stat(filepath.startsWith('/') ? filepath : `${dir}/${filepath}`)
        .then(() => true)
        .catch(() => false);
      if (fileExists) {
        await git.add({ fs, dir, filepath });
      } else {
        await git.remove({ fs, dir, filepath });
      }
    } catch {
      await git.add({ fs, dir, filepath });
    }
  }

  async unstageFile(dir: string, filepath: string): Promise<void> {
    await git.resetIndex({ fs, dir, filepath });
  }

  async getFileAtHead(dir: string, filepath: string): Promise<string | null> {
    try {
      const commitOid = await git.resolveRef({ fs, dir, ref: 'HEAD' });
      const { blob } = await git.readBlob({
        fs,
        dir,
        oid: commitOid,
        filepath,
      });
      return Buffer.from(blob).toString('utf8');
    } catch {
      return null;
    }
  }

  async addAll(dir: string): Promise<void> {
    const status = await this.status(dir);
    for (const row of status) {
      const [file, , workdir, stage] = row as [string, number, number, number];
      if (workdir === 2) {
        await git.add({ fs, dir, filepath: file });
      } else if (workdir === 0 && stage !== 0) {
        await git.remove({ fs, dir, filepath: file });
      }
    }
  }

  async commit(dir: string, message: string): Promise<string> {
    const author = this.getAuthor();
    return git.commit({ fs, dir, message, author });
  }

  async push(dir: string, force?: boolean): Promise<void> {
    const branch = (await this.currentBranch(dir)) || 'main';
    await git.push({ 
      fs, 
      http, 
      dir, 
      ref: branch,
      force,
      headers: this.getHttpHeaders(),
      onAuth: this.getAuthCallback()
    });
  }

  async pull(dir: string): Promise<void> {
    const author = this.getAuthor();
    const branch = (await this.currentBranch(dir)) || 'main';
    await git.pull({ 
      fs, 
      http, 
      dir, 
      ref: branch,
      author, 
      headers: this.getHttpHeaders(),
      onAuth: this.getAuthCallback()
    });
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
      await fs.stat(`${dir}/.git`);
      return true;
    } catch {
      return false;
    }
  }

  async addRemote(dir: string, remote: string, url: string): Promise<void> {
    await git.addRemote({ fs, dir, remote, url });
  }

  async listRemotes(dir: string): Promise<Array<{ remote: string; url: string }>> {
    return git.listRemotes({ fs, dir });
  }

  async deleteRemote(dir: string, remote: string): Promise<void> {
    await git.deleteRemote({ fs, dir, remote });
  }
}

export const GitService = new GitServiceClass();