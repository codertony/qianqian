/**
 * Shared - 工具函数
 * 
 * 通用工具函数集合
 */

import * as path from 'path';
import * as fs from 'fs/promises';

// 路径工具
export function resolveHome(filepath: string): string {
  if (filepath.startsWith('~/')) {
    return path.join(process.env.HOME || process.env.USERPROFILE || '', filepath.slice(2));
  }
  return filepath;
}

export function getConfigDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  
  // 遵循 XDG 规范
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'acl');
  }
  
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || home, 'acl');
  }
  
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'acl');
  }
  
  return path.join(home, '.config', 'acl');
}

export function getGlobalConfigPath(): string {
  return path.join(getConfigDir(), 'config.yaml');
}

// 文件工具
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 字符串工具
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// 验证工具
export function isValidAssetName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && name.length >= 1 && name.length <= 100;
}

export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(version);
}

// 时间工具
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString();
}

// 错误处理
export function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}
