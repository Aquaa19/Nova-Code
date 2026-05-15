// src/services/git/RNFSAdapter.ts

import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

const wrapError = (err: any) => {
  const msg = (err.message || '').toLowerCase();
  if (
    msg.includes('no such file') ||
    msg.includes('does not exist') ||
    msg.includes('enoent') ||
    msg.includes('not found')
  ) {
    err.code = 'ENOENT';
  }
  return err;
};

const readFile = async (path: string, options?: any) => {
  try {
    const encoding = typeof options === 'string' ? options : options?.encoding ?? 'utf8';
    if (encoding === 'utf8') return await RNFS.readFile(path, 'utf8');
    const base64 = await RNFS.readFile(path, 'base64');
    return Buffer.from(base64, 'base64');
  } catch (e) { throw wrapError(e); }
};

const writeFile = async (path: string, data: string | Buffer) => {
  try {
    if (typeof data === 'string') {
      await RNFS.writeFile(path, data, 'utf8');
    } else {
      await RNFS.writeFile(path, data.toString('base64'), 'base64');
    }
  } catch (e) { throw wrapError(e); }
};

const mkdir = async (path: string) => {
  try { await RNFS.mkdir(path); } catch (e) { throw wrapError(e); }
};

const rmdir = async (path: string) => {
  try { await RNFS.unlink(path); } catch (e) { throw wrapError(e); }
};

const unlink = async (path: string) => {
  try { await RNFS.unlink(path); } catch (e) { throw wrapError(e); }
};

const stat = async (path: string) => {
  try {
    const s = await RNFS.stat(path);
    return {
      isFile: () => s.isFile(),
      isDirectory: () => s.isDirectory(),
      isSymbolicLink: () => false,
      size: s.size,
      mtimeMs: s.mtime ? new Date(s.mtime).getTime() : Date.now(),
      mode: 0o666,
      ino: 0,
      uid: 0,
      gid: 0,
    };
  } catch (e) { throw wrapError(e); }
};

const lstat = async (path: string) => {
  return stat(path);
};

const readdir = async (path: string) => {
  try {
    const items = await RNFS.readDir(path);
    return items.map(i => i.name);
  } catch (e) { throw wrapError(e); }
};

// isomorphic-git REQUIRES these two — it calls .bind() on every command
// in its hardcoded list: readFile, writeFile, mkdir, rmdir, unlink,
// stat, lstat, readdir, readlink, symlink
// If any are undefined, it crashes with "cannot read property 'bind' of undefined"
const readlink = async (path: string): Promise<string> => {
  throw Object.assign(new Error('readlink not supported'), { code: 'ENOSYS' });
};

const symlink = async (target: string, path: string): Promise<void> => {
  throw Object.assign(new Error('symlink not supported'), { code: 'ENOSYS' });
};

const rename = async (oldPath: string, newPath: string) => {
  try { await RNFS.moveFile(oldPath, newPath); } catch (e) { throw wrapError(e); }
};

const chmod = async () => {
  // No-op: Android app storage doesn't support chmod
};

// Build the adapter object with ALL 10 required commands
const adapter: any = {
  readFile,
  writeFile,
  mkdir,
  rmdir,
  unlink,
  stat,
  lstat,
  readdir,
  readlink,
  symlink,
  rename,
  chmod,
};

// isomorphic-git checks Object.getOwnPropertyDescriptor(fs, 'promises').
// If 'promises' is enumerable, it uses fs.promises for the bind loop.
// We point it back to the same object.
adapter.promises = adapter;

export const RNFSAdapter = adapter;
