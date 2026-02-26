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


// Features - AI 功能
export {
  AIProviderType,
  AIMessageRole,
  AITaskType,
  AnthropicProvider,
  OpenAIProvider,
  AIProviderFactory,
  createAIProviderFactory,
  RateLimiter,
  TokenBudgetManager,
} from './features/ai';

export type {
  AIProvider,
  AIMessage,
  AICallOptions,
  AICallResult,
  AIProviderConfig,
  AIConfig,
  TokenBudgetConfig,
  RateLimitConfig,
  AITaskOptions,
  AITaskResult,
} from './features/ai';

// Features - Conflict Resolution 冲突解决
export {
  ConflictType,
  ConflictStrategy,
  ConflictResolver,
  createConflictResolver,
} from './features/conflict';

export type {
  Conflict,
  ConflictResolution,
} from './features/conflict';

// Features - Dependency Management 依赖管理
export {
  DependencyType,
  DependencyManager,
  createDependencyManager,
} from './features/dependency';

export type {
  Dependency,
  DependencyCheckResult,
} from './features/dependency';

// Features - Plugin System Plugin系统
export {
  PluginManager,
  createPluginManager,
} from './features/plugin';

export type {
  PluginAsset,
  PluginManifest,
  PluginCompatibility,
  CompatibilityMatrix,
  InstalledPlugin,
  PluginInstallOptions,
  PluginDependency,
  PluginMarketInfo,
} from './features/plugin';

// Features - Flow System Flow系统
export {
  FlowEngine,
  createFlowEngine,
} from './features/flow';

export type {
  FlowDefinition,
  FlowNode,
  FlowEdge,
  FlowTrigger,
  FlowVariable,
  FlowExecution,
  FlowValidation,
} from './features/flow';


// Features - Market Connector 市场连接器
export {
  MarketConnector,
  createMarketConnector,
} from './features/market';

export type {
  MarketSource,
} from './features/market';

// Features - MCP Config MCP配置
export {
  MCPConfigManager,
  createMCPConfigManager,
} from './features/mcp';

export type {
  MCPConfig,
} from './features/mcp';

// Features - Compatibility System 兼容性系统
export {
  CompatibilityChecker,
  createCompatibilityChecker,
} from './features/compatibility';
// 版本信息
export const VERSION = '1.0.0';
export const NAME = 'qianqian';
export const DISPLAY_NAME = '乾乾';
export const DESCRIPTION = 'AI 能力资产管理中枢';


// Features - Version Manager 版本管理器
export {
  VersionManager,
  createVersionManager,
  DowngradeStrategy,
} from './features/version/manager';

export type {
  VersionInfo,
  VersionLock,
  DowngradeResult,
} from './features/version/manager';

// Features - Session State 会话状态
export {
  SessionStateManager,
  createSessionStateManager,
} from './features/session/state-manager';

export type {
  SessionState,
  StateSyncResult,
} from './features/session/state-manager';

// Features - Security Scanner 安全扫描器
export {
  SecurityScanner,
  createSecurityScanner,
} from './features/security/scanner';

export type {
  ScanResult,
} from './features/security/scanner';

// Features - Performance Optimizer 性能优化器
export {
  PerformanceOptimizer,
  createPerformanceOptimizer,
} from './features/performance/optimizer';

export type {
  PerformanceMetrics,
} from './features/performance/optimizer';

// Adapters - Claude Code
export {
  ClaudeCodeAdapter,
  createClaudeCodeAdapter,
} from './adapters/claude-code';

// Adapters - Cloud Code
export {
  CloudCodeAdapter,
  createCloudCodeAdapter,
} from './adapters/cloud-code';
