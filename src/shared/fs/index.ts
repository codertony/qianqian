/**
 * Shared - 文件系统工具
 *
 * 增强的文件系统操作工具
 *
 * @module fs
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { fileExists, ensureDir } from '../utils';
import type { Stats } from 'fs';

export { fileExists, ensureDir };

/**
 * 解析 home 目录 (~)
 */
export function resolveHome(filepath: string): string {
  if (filepath.startsWith('~/')) {
    return path.join(os.homedir(), filepath.slice(2));
  }
  return filepath;
}

/**
 * 标准化路径
 */
export function normalizePath(filepath: string): string {
  return path.normalize(resolveHome(filepath));
}

/**
 * 获取相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(normalizePath(from), normalizePath(to));
}

/**
 * 清空目录内容（保留目录本身）
 */
export async function emptyDir(dirPath: string): Promise<void> {
  const normalizedPath = normalizePath(dirPath);

  if (!(await fileExists(normalizedPath))) {
    return;
  }

  const entries = await fs.readdir(normalizedPath, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(normalizedPath, entry.name);
      if (entry.isDirectory()) {
        await removeDir(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    })
  );
}

/**
 * 复制整个目录
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  const normalizedSrc = normalizePath(src);
  const normalizedDest = normalizePath(dest);

  await ensureDir(normalizedDest);

  const entries = await fs.readdir(normalizedSrc, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(normalizedSrc, entry.name);
      const destPath = path.join(normalizedDest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    })
  );
}

/**
 * 删除目录及其内容
 */
export async function removeDir(dirPath: string): Promise<void> {
  const normalizedPath = normalizePath(dirPath);

  if (await fileExists(normalizedPath)) {
    await fs.rm(normalizedPath, { recursive: true, force: true });
  }
}

/**
 * 遍历目录
 */
export async function* walkDir(dir: string): AsyncGenerator<{
  path: string;
  relativePath: string;
  isDirectory: boolean;
  stats: Stats;
}> {
  const normalizedDir = normalizePath(dir);

  if (!(await fileExists(normalizedDir))) {
    return;
  }

  const entries = await fs.readdir(normalizedDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(normalizedDir, entry.name);
    const relativePath = path.relative(normalizedDir, fullPath);

    if (entry.isDirectory()) {
      yield {
        path: fullPath,
        relativePath,
        isDirectory: true,
        stats: await fs.stat(fullPath),
      };
      // 递归遍历子目录
      yield* walkDir(fullPath);
    } else {
      yield {
        path: fullPath,
        relativePath,
        isDirectory: false,
        stats: await fs.stat(fullPath),
      };
    }
  }
}

/**
 * 只获取文件（不包含目录）
 */
export async function* walkFiles(dir: string): AsyncGenerator<{
  path: string;
  relativePath: string;
  stats: Stats;
}> {
  for await (const entry of walkDir(dir)) {
    if (!entry.isDirectory) {
      yield entry;
    }
  }
}

/**
 * 读取文件内容
 */
export async function readFile(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  const normalizedPath = normalizePath(filePath);
  return fs.readFile(normalizedPath, encoding);
}

/**
 * 写入文件内容
 */
export async function writeFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<void> {
  const normalizedPath = normalizePath(filePath);
  await ensureDir(path.dirname(normalizedPath));
  await fs.writeFile(normalizedPath, content, encoding);
}

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  const normalizedSrc = normalizePath(src);
  const normalizedDest = normalizePath(dest);

  await ensureDir(path.dirname(normalizedDest));
  await fs.copyFile(normalizedSrc, normalizedDest);
}

/**
 * 移动文件
 */
export async function moveFile(src: string, dest: string): Promise<void> {
  const normalizedSrc = normalizePath(src);
  const normalizedDest = normalizePath(dest);

  await ensureDir(path.dirname(normalizedDest));
  await fs.rename(normalizedSrc, normalizedDest);
}

/**
 * 计算文件 SHA256 hash
 */
export async function getFileHash(filePath: string): Promise<string> {
  const normalizedPath = normalizePath(filePath);
  const content = await fs.readFile(normalizedPath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 计算内容 SHA256 hash
 */
export function getContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 获取文件统计信息
 */
export async function getFileStats(filePath: string): Promise<Stats | null> {
  const normalizedPath = normalizePath(filePath);

  try {
    return await fs.stat(normalizedPath);
  } catch {
    return null;
  }
}

/**
 * 读取 JSON 文件
 */
export async function readJson<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath);
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * 写入 JSON 文件
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  pretty = true
): Promise<void> {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await writeFile(filePath, content);
}

/**
 * 读取 YAML 文件
 */
export async function readYaml<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath);
    return yaml.load(content) as T;
  } catch {
    return null;
  }
}

/**
 * 写入 YAML 文件
 */
export async function writeYaml(
  filePath: string,
  data: unknown,
  options?: yaml.DumpOptions
): Promise<void> {
  const content = yaml.dump(data, options);
  await writeFile(filePath, content);
}

/**
 * 临时文件/目录管理
 */
export class TempManager {
  private tempPaths: string[] = [];

  /**
   * 创建临时目录
   */
  async createTempDir(prefix = 'acl-'): Promise<string> {
    const tempPath = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
    this.tempPaths.push(tempPath);
    return tempPath;
  }

  /**
   * 创建临时文件
   */
  async createTempFile(prefix = 'acl-', suffix = ''): Promise<{ path: string; fd: number }> {
    const tempPath = path.join(os.tmpdir(), `${prefix}${Date.now()}${suffix}`);
    const fileHandle = await fs.open(tempPath, 'w');
    this.tempPaths.push(tempPath);
    return { path: tempPath, fd: fileHandle.fd };
  }

  /**
   * 清理所有临时文件和目录
   */
  async cleanup(): Promise<void> {
    await Promise.all(
      this.tempPaths.map(async (tempPath) => {
        try {
          const stats = await fs.stat(tempPath);
          if (stats.isDirectory()) {
            await fs.rm(tempPath, { recursive: true, force: true });
          } else {
            await fs.unlink(tempPath);
          }
        } catch {
          // 忽略清理错误
        }
      })
    );
    this.tempPaths = [];
  }

  /**
   * 清理指定临时路径
   */
  async cleanupPath(tempPath: string): Promise<void> {
    try {
      const stats = await fs.stat(tempPath);
      if (stats.isDirectory()) {
        await fs.rm(tempPath, { recursive: true, force: true });
      } else {
        await fs.unlink(tempPath);
      }
    } catch {
      // 忽略清理错误
    }

    const index = this.tempPaths.indexOf(tempPath);
    if (index > -1) {
      this.tempPaths.splice(index, 1);
    }
  }
}

/**
 * 全局临时管理器实例
 */
export const tempManager = new TempManager();

/**
 * 文件监视选项
 */
export interface FileWatchOptions {
  /** 是否递归监视子目录 */
  recursive?: boolean;
  /** 忽略的文件模式 */
  ignore?: string[];
}

/**
 * 文件监视器
 */
export class FileWatcher {
  private watchers: ReturnType<typeof fs.watch>[] = [];

  /**
   * 开始监视文件/目录
   */
  watch(
    filePath: string,
    callback: (event: 'change' | 'rename', filename: string) => void,
    options: FileWatchOptions = {}
  ): void {
    const normalizedPath = normalizePath(filePath);

    const watcher = fs.watch(
      normalizedPath,
      { recursive: options.recursive },
      (eventType: string, filename: Buffer | string | null) => {
        if (options.ignore && filename) {
          const filenameStr = filename.toString();
          const shouldIgnore = options.ignore.some((pattern) =>
            filenameStr.includes(pattern)
          );
          if (shouldIgnore) return;
        }

        callback(eventType as 'change' | 'rename', filename?.toString() || '');
      }
    );

    this.watchers.push(watcher);
  }

  /**
   * 停止所有监视
   */
  close(): void {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
  }
}

/**
 * 查找文件（向上递归查找）
 */
export async function findFileUpward(
  filename: string,
  startDir: string = process.cwd()
): Promise<string | null> {
  let currentDir = normalizePath(startDir);

  while (true) {
    const filePath = path.join(currentDir, filename);
    if (await fileExists(filePath)) {
      return filePath;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // 已到达根目录
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

/**
 * 查找包含指定文件的目录（向上递归）
 */
export async function findDirWithFile(
  filename: string,
  startDir: string = process.cwd()
): Promise<string | null> {
  const filePath = await findFileUpward(filename, startDir);
  return filePath ? path.dirname(filePath) : null;
}

/**
 * 安全写入（先写入临时文件，再重命名）
 */
export async function safeWriteFile(
  filePath: string,
  content: string
): Promise<void> {
  const normalizedPath = normalizePath(filePath);
  const tempPath = `${normalizedPath}.tmp`;

  try {
    await writeFile(tempPath, content);
    await fs.rename(tempPath, normalizedPath);
  } catch (error) {
    // 清理临时文件
    try {
      await fs.unlink(tempPath);
    } catch {
      // 忽略清理错误
    }
    throw error;
  }
}
