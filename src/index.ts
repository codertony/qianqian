/**
 * 乾乾 (QianQian) - 入口文件
 *
 * 参考 oh-my-opencode 的插件架构设计
 *
 * @module qianqian
 */

// Core 领域 - 从 core/asset 导出
export {
  AssetType,
  Asset,
  PromptAsset,
  PromptVariable,
  SkillAsset,
  SkillManifest,
  SkillPermissions,
  SkillLogic,
  AgentAsset,
  FlowAsset,
  FlowStep,
  createAsset,
} from './core/asset';

// Core 领域 - 从 core/platform 导出
export {
  PlatformType,
  Platform,
  PlatformCapability,
  PlatformConfig,
  PlatformAdapter,
} from './core/platform';

// Core 领域 - 从 core/sync 导出
export {
  SyncDirection,
  SyncPolicy,
  SyncStatus,
  SyncOperation,
  SyncResult,
  SyncChange,
  SyncConflict,
  SyncError,
} from './core/sync';

// Shared 共享 - 类型
export type {
  Config,
  RepositoryConfig,
  RepositoryAuth,
  SyncConfig,
  PlatformConfig as TypesPlatformConfig,
  FeatureFlags,
  CLIOptions,
  Result,
} from './shared/types';
export { ok, err } from './shared/types';

// Shared 共享 - 工具函数
export {
  kebabCase,
  camelCase,
  truncate,
  formatDate,
  formatDateTime,
  getConfigDir,
  getGlobalConfigPath,
  isValidAssetName,
  isValidVersion,
  isErrorWithCode,
  getErrorMessage,
  resolveHome,
  fileExists,
  ensureDir,
} from './shared/utils';

// Shared 共享 - 错误处理
export {
  ACLError,
  ConfigError,
  GitError,
  SyncError as SyncErrorClass,
  AdapterError,
  ValidationError,
  AssetError,
  PlatformError,
  AuthError,
  ConflictError,
  isACLError,
  getErrorCode,
  formatError,
  handleError,
  createError,
  tryCatch,
  tryCatchSync,
} from './shared/errors';

// Shared 共享 - 日志
export {
  Logger,
  LoggerConfig,
  LogLevel,
  LogEntry,
  LoggerContext,
  createLogger,
  logger,
  SilentLogger,
  MemoryLogger,
} from './shared/logger';

// Shared 共享 - 常量
export {
  APP_NAME,
  APP_DISPLAY_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  CONFIG_FILE,
  CONFIG_FILE_JSONC,
  LOCK_FILE,
  IGNORE_FILE,
  ACL_DIR,
  ASSETS_DIR,
  PROMPTS_DIR,
  SKILLS_DIR,
  AGENTS_DIR,
  FLOWS_DIR,
  OVERRIDE_DIR,
  PLATFORM_CONFIG_DIRS,
  SUPPORTED_ASSET_TYPES,
  SYNC_POLICIES,
  ASSET_EXTENSIONS,
  DEFAULT_BRANCH,
  DEFAULT_REMOTE,
  ERROR_CODES,
} from './shared/constants';

// 文件系统工具
export {
  resolveHome as fsResolveHome,
  normalizePath,
  getRelativePath,
  emptyDir,
  copyDir,
  removeDir,
  walkDir,
  walkFiles,
  readFile,
  writeFile,
  copyFile,
  moveFile,
  getFileHash,
  getContentHash,
  getFileStats,
  readJson,
  writeJson,
  readYaml,
  writeYaml,
  TempManager,
  tempManager,
  FileWatcher,
  findFileUpward,
  findDirWithFile,
  safeWriteFile,
} from './shared/fs';

// Config 配置
export type {
  AssetType as SchemaAssetType,
  RepositoryConfig as SchemaRepositoryConfig,
  RepositoryAuth as SchemaRepositoryAuth,
  PlatformConfig as SchemaPlatformConfig,
  FeatureFlags as SchemaFeatureFlags,
  Config as SchemaConfig,
} from './config/schema';
export { validateConfig, validateConfigSafe } from './config/schema';

export {
  ConfigLoadOptions,
  ConfigSource,
  ConfigLoader,
  writeConfig,
  updateConfig,
  configLoader,
  loadConfig,
  loadConfigWithSources,
} from './config/loader';

// CLI
export {
  CommandContext,
  CommandHandler,
  CommandDefinition,
  CommandRegistry,
  commandRegistry,
  registerCommand,
} from './cli/command-registry';

export { createCLI, runCLI } from './cli';

// Adapters 适配器
export {
  CursorAdapter,
  createCursorAdapter,
} from './adapters/cursor';

export {
  OpenCodeAdapter,
  createOpenCodeAdapter,
} from './adapters/opencode';

// Core - Sync 同步引擎
export {
  GitSyncEngine,
  createGitSyncEngine,
} from './core/sync/git-sync-engine';

// 版本信息
export const VERSION = '1.0.0';
export const NAME = 'qianqian';
export const DISPLAY_NAME = '乾乾';
export const DESCRIPTION = 'AI 能力资产管理中枢';
