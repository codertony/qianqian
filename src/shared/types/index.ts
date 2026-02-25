/**
 * Shared - 类型定义
 *
 * 全局共享的类型定义
 *
 * @module types
 */

// 同步配置
export interface SyncConfig {
  autoSync: boolean;
  syncPolicy: 'full' | 'merge' | 'local' | 'manual';
  defaultPlatforms: string[];
  excludePatterns: string[];
  conflictResolution: 'full' | 'merge' | 'local' | 'manual';
}

// 平台配置
export interface PlatformConfig {
  type: string;
  enabled: boolean;
  configPath?: string;
  overrides?: Record<string, unknown>;
}

// 配置类型
export interface Config {
  version: string;
  repository?: RepositoryConfig;
  sync: SyncConfig;
  platforms: Record<string, PlatformConfig>;
  features: FeatureFlags;
}

// 仓库配置
export interface RepositoryConfig {
  url: string;
  branch: string;
  localPath: string;
  auth?: RepositoryAuth;
}

// 仓库认证
export interface RepositoryAuth {
  type: 'token' | 'ssh' | 'oauth';
  credentials: Record<string, string>;
}

// 功能开关
export interface FeatureFlags {
  aiExtraction: boolean;
  autoSync: boolean;
  conflictNotification: boolean;
  telemetry: boolean;
}

// CLI 选项
export interface CLIOptions {
  verbose: boolean;
  dryRun: boolean;
  yes: boolean;
  config?: string;
}

// 结果类型（类似 Rust 的 Result）
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// 创建成功的 Result
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

// 创建失败的 Result
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
