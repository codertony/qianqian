/**
 * Config - Schema
 * 
 * Zod Schema 定义，用于运行时配置校验
 * 参考 oh-my-opencode 的配置系统设计
 */

import { z } from 'zod';

// 资产类型 Schema
export const AssetTypeSchema = z.enum([
  'prompt',
  'skill',
  'agent',
  'flow',
  'mcp-config',
  'plugin',
]);

// 同步策略 Schema
export const SyncPolicySchema = z.enum(['full', 'merge', 'local', 'manual']);

// 同步方向 Schema
export const SyncDirectionSchema = z.enum(['up', 'down', 'bidirectional']);

// 仓库认证 Schema
export const RepositoryAuthSchema = z.object({
  type: z.enum(['token', 'ssh', 'oauth']),
  credentials: z.record(z.string()),
});

// 仓库配置 Schema
export const RepositoryConfigSchema = z.object({
  url: z.string().url(),
  branch: z.string().default('main'),
  localPath: z.string(),
  auth: RepositoryAuthSchema.optional(),
});

// 平台配置 Schema
export const PlatformConfigSchema = z.object({
  type: z.enum(['cursor', 'opencode', 'claude-code', 'cloud-code', 'windsurf', 'vscode']),
  enabled: z.boolean().default(true),
  configPath: z.string().optional(),
  overrides: z.record(z.unknown()).optional(),
});

// 功能开关 Schema
export const FeatureFlagsSchema = z.object({
  aiExtraction: z.boolean().default(true),
  autoSync: z.boolean().default(false),
  conflictNotification: z.boolean().default(true),
  telemetry: z.boolean().default(false),
});

// 主配置 Schema
export const ConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  repository: RepositoryConfigSchema.optional(),
  sync: z.object({
    autoSync: z.boolean().default(false),
    syncPolicy: SyncPolicySchema.default('merge'),
    defaultPlatforms: z.array(z.string()).default([]),
    excludePatterns: z.array(z.string()).default([]),
    conflictResolution: SyncPolicySchema.default('manual'),
  }),
  platforms: z.record(PlatformConfigSchema).default({}),
  features: FeatureFlagsSchema.default({}),
});

// 类型导出
export type Config = z.infer<typeof ConfigSchema>;
export type RepositoryConfig = z.infer<typeof RepositoryConfigSchema>;
export type RepositoryAuth = z.infer<typeof RepositoryAuthSchema>;
export type PlatformConfig = z.infer<typeof PlatformConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type SyncPolicy = z.infer<typeof SyncPolicySchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;

// 配置验证函数
export function validateConfig(config: unknown): Config {
  return ConfigSchema.parse(config);
}

export function validateConfigSafe(config: unknown): { success: true; data: Config } | { success: false; error: z.ZodError } {
  const result = ConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
