// src/services/git/RNFSAdapter.ts

import RNFS from 'react-native-fs';
import { Buffer } from 'buffer'; // isomorphic-git relies on Buffer for binary files

export const RNFSAdapter = {
  promises: {
    async readFile(path: string, options?: { encoding?: string }) {
      const encoding = options?.encoding ?? 'utf8';
      if (encoding === 'utf8') {
        return RNFS.readFile(path, 'utf8');
      }
      // Binary read (isomorphic-git needs a Buffer for blobs/trees)
      const base64 = await RNFS.readFile(path, 'base64');
      return Buffer.from(base64, 'base64');
    },

    async writeFile(path: string, data: string | Buffer, options?: any) {
      if (typeof data === 'string') {
        await RNFS.writeFile(path, data, 'utf8');
      } else {
        await RNFS.writeFile(path, data.toString('base64'), 'base64');
      }
    },

    async unlink(path: string) {
      await RNFS.unlink(path);
    },

    async readdir(path: string) {
      const items = await RNFS.readDir(path);
      return items.map(i => i.name);
    },

    async mkdir(path: string) {
      await RNFS.mkdir(path);
    },

    async rmdir(path: string) {
      await RNFS.unlink(path);
    },

    async stat(path: string) {
      const s = await RNFS.stat(path);
      return {
        isFile: () => !s.isDirectory(),
        isDirectory: () => s.isDirectory(),
        isSymbolicLink: () => false,
        size: s.size,
        mtimeMs: s.mtime ? new Date(s.mtime).getTime() : Date.now(),
        mode: 0o666,
        ino: 0,
        uid: 0,
        gid: 0,
      };
    },

    async lstat(path: string) {
      return this.stat(path); // React Native FS doesn't natively distinguish symlinks well, stat is safe enough here
    },

    async symlink() {
      throw new Error('symlink not supported on this platform');
    },

    async readlink() {
      throw new Error('readlink not supported on this platform');
    },

    async chmod() {
      // No-op — RNFS doesn't support chmod on Android in this way, but isomorphic-git will try to call it.
      // Must not throw an error, just silently succeed.
    },
  },
};