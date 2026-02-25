/**
 * Shared - 常量定义
 * 
 * 全局共享的常量
 */

// 应用信息
export const APP_NAME = 'qianqian';
export const APP_DISPLAY_NAME = '乾乾';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI 能力资产管理中枢';

// 配置文件
export const CONFIG_FILE = 'config.yaml';
export const CONFIG_FILE_JSONC = 'config.jsonc';
export const LOCK_FILE = '.acl-lock';
export const IGNORE_FILE = '.aclignore';

// 目录名称
export const ACL_DIR = '.acl';
export const ASSETS_DIR = 'assets';
export const PROMPTS_DIR = 'prompts';
export const SKILLS_DIR = 'skills';
export const AGENTS_DIR = 'agents';
export const FLOWS_DIR = 'flows';
export const OVERRIDE_DIR = 'overrides';

// 平台配置目录映射
export const PLATFORM_CONFIG_DIRS: Record<string, string> = {
  cursor: '.cursor',
  opencode: '.opencode',
  'claude-code': '.claude-code',
  cloudcode: '.cloudcode',
  windsurf: '.windsurf',
  vscode: '.vscode',
};

// 支持的资产类型
export const SUPPORTED_ASSET_TYPES = [
  'prompt',
  'skill',
  'agent',
  'flow',
  'mcp-config',
  'plugin',
] as const;

// 同步策略
export const SYNC_POLICIES = ['full', 'merge', 'local', 'manual'] as const;

// 文件扩展名
export const ASSET_EXTENSIONS: Record<string, string> = {
  prompt: '.md',
  skill: '.yaml',
  agent: '.yaml',
  flow: '.yaml',
  'mcp-config': '.json',
  plugin: '.yaml',
};

// Git 相关
export const DEFAULT_BRANCH = 'main';
export const DEFAULT_REMOTE = 'origin';

// 错误码
export const ERROR_CODES = {
  // 配置错误
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',
  
  // 仓库错误
  REPO_NOT_INITIALIZED: 'REPO_NOT_INITIALIZED',
  REPO_AUTH_FAILED: 'REPO_AUTH_FAILED',
  REPO_SYNC_FAILED: 'REPO_SYNC_FAILED',
  
  // 资产错误
  ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',
  ASSET_INVALID: 'ASSET_INVALID',
  ASSET_CONFLICT: 'ASSET_CONFLICT',
  
  // 平台错误
  PLATFORM_NOT_SUPPORTED: 'PLATFORM_NOT_SUPPORTED',
  PLATFORM_NOT_DETECTED: 'PLATFORM_NOT_DETECTED',
  PLATFORM_CONFIG_ERROR: 'PLATFORM_CONFIG_ERROR',
  
  // 同步错误
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  SYNC_FAILED: 'SYNC_FAILED',
  SYNC_LOCKED: 'SYNC_LOCKED',
} as const;
