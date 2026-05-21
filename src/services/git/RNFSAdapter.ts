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

const logDebug = async (msg: string) => {
  try {
    // Locate project root to write log file
    const match = msg.match(/\/projects\/[^/]+/);
    if (match) {
      const idx = msg.indexOf(match[0]);
      const projectPath = msg.substring(0, idx + match[0].length);
      const logPath = `${projectPath}/git_debug_log.txt`;
      await RNFS.appendFile(logPath, `${new Date().toISOString()} - ${msg}\n`, 'utf8');
    }
  } catch {}
};

const readFile = async (path: string, options?: any) => {
  try {
    const encoding = typeof options === 'string' ? options : options?.encoding;
    await logDebug(`readFile: ${path} (encoding: ${encoding})`);
    if (encoding === 'utf8') return await RNFS.readFile(path, 'utf8');
    const base64 = await RNFS.readFile(path, 'base64');
    return Buffer.from(base64, 'base64');
  } catch (e: any) {
    await logDebug(`readFile ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
};

const writeFile = async (path: string, data: string | Buffer) => {
  try {
    await logDebug(`writeFile: ${path}`);
    if (typeof data === 'string') {
      await RNFS.writeFile(path, data, 'utf8');
    } else {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      await RNFS.writeFile(path, buffer.toString('base64'), 'base64');
    }
  } catch (e: any) {
    await logDebug(`writeFile ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
};

const mkdir = async (path: string) => {
  try {
    await logDebug(`mkdir: ${path}`);
    await RNFS.mkdir(path);
  } catch (e: any) {
    await logDebug(`mkdir ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
};

const rmdir = async (path: string) => {
  try {
    await logDebug(`rmdir: ${path}`);
    await RNFS.unlink(path);
  } catch (e: any) {
    await logDebug(`rmdir ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
};

const unlink = async (path: string) => {
  try {
    await logDebug(`unlink: ${path}`);
    await RNFS.unlink(path);
  } catch (e: any) {
    await logDebug(`unlink ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
};

const parseTime = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    return new Date(val < 10000000000 ? val * 1000 : val);
  }
  if (typeof val === 'string') {
    const num = Number(val);
    if (!isNaN(num)) {
      return new Date(num < 10000000000 ? num * 1000 : num);
    }
    return new Date(val);
  }
  return new Date();
};

const stat = async (path: string) => {
  try {
    const s = await RNFS.stat(path);
    const isFileFunc = typeof s.isFile === 'function';
    const isDirFunc = typeof s.isDirectory === 'function';
    const isFile = isFileFunc ? s.isFile() : !!s.isFile;
    const isDir = isDirFunc ? s.isDirectory() : !!s.isDirectory;
    await logDebug(`stat SUCCESS: ${path} (isFile: ${isFile}, isDir: ${isDir})`);
    
    const mtimeDate = parseTime(s.mtime);
    const ctimeDate = parseTime(s.ctime || s.mtime);
    return {
      isFile: () => isFile,
      isDirectory: () => isDir,
      isSymbolicLink: () => false,
      size: s.size,
      mtime: mtimeDate,
      mtimeMs: mtimeDate.getTime(),
      ctime: ctimeDate,
      ctimeMs: ctimeDate.getTime(),
      atime: mtimeDate,
      atimeMs: mtimeDate.getTime(),
      birthtime: ctimeDate,
      birthtimeMs: ctimeDate.getTime(),
      mode: s.mode || 0o666,
      ino: 0,
      uid: 0,
      gid: 0,
    };
  } catch (e: any) {
    await logDebug(`stat ERROR: ${path} - ${e.message || e}`);
    throw wrapError(e);
  }
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
  try {
    await logDebug(`rename: ${oldPath} to ${newPath}`);
    await RNFS.moveFile(oldPath, newPath);
  } catch (e: any) {
    await logDebug(`rename ERROR: ${oldPath} - ${e.message || e}`);
    throw wrapError(e);
  }
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
