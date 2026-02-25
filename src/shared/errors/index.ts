/**
 * Shared - 错误处理体系
 *
 * 乾乾 CLI 的统一错误处理系统
 *
 * @module errors
 */

import { ERROR_CODES } from '../constants';

/**
 * 基础 ACL 错误类
 */
export class ACLError extends Error {
  /** 错误码 */
  readonly code: string;
  /** 错误详情 */
  readonly details?: Record<string, unknown>;
  /** 错误发生时间 */
  readonly timestamp: Date;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ACLError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ACLError);
    }
  }

  /**
   * 将错误转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * 格式化错误为字符串
   */
  toString(): string {
    let str = `[${this.code}] ${this.message}`;
    if (this.details && Object.keys(this.details).length > 0) {
      str += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
    }
    return str;
  }
}

/**
 * 配置错误
 */
export class ConfigError extends ACLError {
  constructor(
    message: string,
    code: string = ERROR_CODES.CONFIG_INVALID,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.name = 'ConfigError';
  }
}

/**
 * Git 操作错误
 */
export class GitError extends ACLError {
  constructor(
    message: string,
    code: string = ERROR_CODES.REPO_SYNC_FAILED,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.name = 'GitError';
  }
}

/**
 * 同步错误
 */
export class SyncError extends ACLError {
  constructor(
    message: string,
    code: string = ERROR_CODES.SYNC_FAILED,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.name = 'SyncError';
  }
}

/**
 * 平台适配器错误
 */
export class AdapterError extends ACLError {
  constructor(
    message: string,
    code: string = ERROR_CODES.PLATFORM_CONFIG_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.name = 'AdapterError';
  }
}

/**
 * 数据验证错误
 */
export class ValidationError extends ACLError {
  /** 验证错误列表 */
  readonly validationErrors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    code: string = ERROR_CODES.CONFIG_INVALID,
    details?: Record<string, unknown>,
    validationErrors?: Array<{ path: string; message: string }>
  ) {
    super(message, code, details);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }

  override toString(): string {
    let str = super.toString();
    if (this.validationErrors && this.validationErrors.length > 0) {
      str += '\nValidation Errors:';
      for (const err of this.validationErrors) {
        str += `\n  - ${err.path}: ${err.message}`;
      }
    }
    return str;
  }
}

/**
 * 资产管理错误
 */
export class AssetError extends ACLError {
  /** 资产名称 */
  readonly assetName?: string;
  /** 资产类型 */
  readonly assetType?: string;

  constructor(
    message: string,
    code: string = ERROR_CODES.ASSET_INVALID,
    details?: Record<string, unknown>,
    assetName?: string,
    assetType?: string
  ) {
    super(message, code, details);
    this.name = 'AssetError';
    this.assetName = assetName;
    this.assetType = assetType;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      assetName: this.assetName,
      assetType: this.assetType,
    };
  }
}

/**
 * 平台错误
 */
export class PlatformError extends ACLError {
  /** 平台名称 */
  readonly platform?: string;

  constructor(
    message: string,
    code: string = ERROR_CODES.PLATFORM_NOT_SUPPORTED,
    details?: Record<string, unknown>,
    platform?: string
  ) {
    super(message, code, details);
    this.name = 'PlatformError';
    this.platform = platform;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      platform: this.platform,
    };
  }
}

/**
 * 认证错误
 */
export class AuthError extends ACLError {
  constructor(
    message: string,
    code: string = ERROR_CODES.REPO_AUTH_FAILED,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.name = 'AuthError';
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends ACLError {
  /** 冲突资产名称 */
  readonly assetName?: string;

  constructor(
    message: string,
    code: string = ERROR_CODES.SYNC_CONFLICT,
    details?: Record<string, unknown>,
    assetName?: string
  ) {
    super(message, code, details);
    this.name = 'ConflictError';
    this.assetName = assetName;
  }
}

/**
 * 检查是否为 ACLError
 */
export function isACLError(error: unknown): error is ACLError {
  return error instanceof ACLError;
}

/**
 * 获取错误码
 */
export function getErrorCode(error: unknown): string {
  if (isACLError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * 格式化错误输出
 */
export function formatError(error: unknown): string {
  if (isACLError(error)) {
    return error.toString();
  }

  if (error instanceof Error) {
    return `[${error.name}] ${error.message}`;
  }

  return String(error);
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  /** 是否退出进程 */
  exit?: boolean;
  /** 退出码 */
  exitCode?: number;
  /** 是否显示堆栈 */
  showStack?: boolean;
  /** 是否显示详情 */
  showDetails?: boolean;
  /** 自定义前缀 */
  prefix?: string;
}

/**
 * 统一错误处理入口
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    exit = false,
    exitCode = 1,
    showStack = false,
    showDetails = true,
    prefix = '❌ Error:',
  } = options;

  let output = prefix + '\n';

  if (isACLError(error)) {
    output += `[${error.code}] ${error.message}`;

    if (showDetails && error.details && Object.keys(error.details).length > 0) {
      output += `\n\nDetails:\n${JSON.stringify(error.details, null, 2)}`;
    }

    if (error instanceof ValidationError && error.validationErrors) {
      output += '\n\nValidation Errors:';
      for (const err of error.validationErrors) {
        output += `\n  - ${err.path}: ${err.message}`;
      }
    }
  } else if (error instanceof Error) {
    output += `[${error.name}] ${error.message}`;
  } else {
    output += String(error);
  }

  if (showStack && error instanceof Error && error.stack) {
    output += `\n\nStack:\n${error.stack}`;
  }

  console.error(output);

  if (exit) {
    process.exit(exitCode);
  }
}

/**
 * 创建错误（工厂函数）
 */
export function createError(
  type: 'config' | 'git' | 'sync' | 'adapter' | 'validation' | 'asset' | 'platform' | 'auth' | 'conflict',
  message: string,
  details?: Record<string, unknown>
): ACLError {
  switch (type) {
    case 'config':
      return new ConfigError(message, undefined, details);
    case 'git':
      return new GitError(message, undefined, details);
    case 'sync':
      return new SyncError(message, undefined, details);
    case 'adapter':
      return new AdapterError(message, undefined, details);
    case 'validation':
      return new ValidationError(message, undefined, details);
    case 'asset':
      return new AssetError(message, undefined, details);
    case 'platform':
      return new PlatformError(message, undefined, details);
    case 'auth':
      return new AuthError(message, undefined, details);
    case 'conflict':
      return new ConflictError(message, undefined, details);
    default:
      return new ACLError(message, 'UNKNOWN_ERROR', details);
  }
}

/**
 * 尝试执行函数并捕获错误
 */
export async function tryCatch<T, E = ACLError>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => E
): Promise<{ success: true; data: T } | { success: false; error: E }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const handledError = errorHandler ? errorHandler(error) : (error as E);
    return { success: false, error: handledError };
  }
}

/**
 * 同步版本的 tryCatch
 */
export function tryCatchSync<T, E = ACLError>(
  fn: () => T,
  errorHandler?: (error: unknown) => E
): { success: true; data: T } | { success: false; error: E } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const handledError = errorHandler ? errorHandler(error) : (error as E);
    return { success: false, error: handledError };
  }
}
