/**
 * 乾乾 (QianQian) - 错误处理体系
 * 定义所有自定义错误类型，支持错误代码和上下文信息
 */

export interface ErrorDetails {
  [key: string]: unknown;
}

/**
 * 基础 ACL 错误类
 * 所有自定义错误的基类
 */
export class ACLError extends Error {
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    code: string,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = 'ACLError';
    this.code = code;
    this.details = details;
    
    // 修复原型链（TypeScript 继承 Error 的问题）
    Object.setPrototypeOf(this, ACLError.prototype);
  }

  /**
   * 转换为可序列化的对象
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  toUserMessage(): string {
    return `${this.message} (${this.code})`;
  }
}

/**
 * 配置错误
 * 配置文件相关错误
 */
export class ConfigError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

/**
 * 配置验证错误
 * Schema 验证失败
 */
export class ConfigValidationError extends ConfigError {
  public readonly validationErrors: unknown[];

  constructor(message: string, validationErrors: unknown[], details?: ErrorDetails) {
    super(message, { ...details, validationErrors });
    this.name = 'ConfigValidationError';
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ConfigValidationError.prototype);
  }

  toUserMessage(): string {
    const issues = this.validationErrors
      .map((err: any) => `  - ${err.path?.join('.')}: ${err.message}`)
      .join('\n');
    return `${this.message}\n${issues}`;
  }
}

/**
 * Git 操作错误
 * Git 相关操作失败
 */
export class GitError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'GIT_ERROR', details);
    this.name = 'GitError';
    Object.setPrototypeOf(this, GitError.prototype);
  }
}

/**
 * 同步错误
 * 资产同步过程中的错误
 */
export class SyncError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'SYNC_ERROR', details);
    this.name = 'SyncError';
    Object.setPrototypeOf(this, SyncError.prototype);
  }
}

/**
 * 适配器错误
 * 平台适配器相关错误
 */
export class AdapterError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'ADAPTER_ERROR', details);
    this.name = 'AdapterError';
    Object.setPrototypeOf(this, AdapterError.prototype);
  }
}

/**
 * 不支持的资产类型错误
 */
export class UnsupportedAssetError extends AdapterError {
  public readonly assetType: string;
  public readonly platform: string;

  constructor(assetType: string, platform: string) {
    super(
      `Asset type '${assetType}' is not supported on platform '${platform}'`,
      { assetType, platform }
    );
    this.name = 'UnsupportedAssetError';
    this.assetType = assetType;
    this.platform = platform;
    Object.setPrototypeOf(this, UnsupportedAssetError.prototype);
  }
}

/**
 * 验证错误
 * 数据验证失败
 */
export class ValidationError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 认证错误
 * GitHub 认证或凭证相关错误
 */
export class AuthError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * AI 服务错误
 * AI Provider 调用错误
 */
export class AIError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'AI_ERROR', details);
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

/**
 * 文件系统错误
 */
export class FileSystemError extends ACLError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 'FS_ERROR', details);
    this.name = 'FileSystemError';
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}

/**
 * 错误处理工具函数
 */
export function isACLError(error: unknown): error is ACLError {
  return error instanceof ACLError;
}

/**
 * 将未知错误转换为 ACLError
 */
export function toACLError(error: unknown): ACLError {
  if (isACLError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ACLError(error.message, 'UNKNOWN_ERROR', {
      originalError: error,
      stack: error.stack,
    });
  }
  
  return new ACLError(String(error), 'UNKNOWN_ERROR', {
    originalError: error,
  });
}

/**
 * 错误代码分类
 */
export const ErrorCodes = {
  // 配置错误 (1xxx)
  CONFIG_NOT_FOUND: 'CONFIG_1001',
  CONFIG_INVALID: 'CONFIG_1002',
  CONFIG_VALIDATION_FAILED: 'CONFIG_1003',
  
  // Git 错误 (2xxx)
  GIT_NOT_INITIALIZED: 'GIT_2001',
  GIT_AUTH_FAILED: 'GIT_2002',
  GIT_PUSH_FAILED: 'GIT_2003',
  GIT_PULL_FAILED: 'GIT_2004',
  GIT_MERGE_CONFLICT: 'GIT_2005',
  
  // 同步错误 (3xxx)
  SYNC_CONFLICT: 'SYNC_3001',
  SYNC_PLATFORM_NOT_DETECTED: 'SYNC_3002',
  SYNC_ASSET_NOT_FOUND: 'SYNC_3003',
  
  // 适配器错误 (4xxx)
  ADAPTER_NOT_FOUND: 'ADAPTER_4001',
  ADAPTER_UNSUPPORTED_ASSET: 'ADAPTER_4002',
  
  // 认证错误 (5xxx)
  AUTH_TOKEN_MISSING: 'AUTH_5001',
  AUTH_TOKEN_INVALID: 'AUTH_5002',
  
  // AI 错误 (6xxx)
  AI_API_ERROR: 'AI_6001',
  AI_RATE_LIMIT: 'AI_6002',
  AI_INVALID_RESPONSE: 'AI_6003',
  
  // 文件系统错误 (7xxx)
  FS_PERMISSION_DENIED: 'FS_7001',
  FS_NOT_FOUND: 'FS_7002',
  FS_ALREADY_EXISTS: 'FS_7003',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
