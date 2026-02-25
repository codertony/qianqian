/**
 * Shared - 日志系统
 *
 * 结构化日志记录系统
 *
 * @module logger
 */

import * as fs from 'fs';
import * as path from 'path';
import { resolveHome } from '../utils';

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志级别数值映射 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 日志级别颜色 */
const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

/** 重置颜色 */
const RESET_COLOR = '\x1b[0m';

/** 日志配置 */
export interface LoggerConfig {
  /** 日志级别 */
  level: LogLevel;
  /** 日志文件路径 */
  file?: string;
  /** 是否输出到控制台 */
  console: boolean;
  /** 是否使用颜色 */
  useColors?: boolean;
  /** 最大文件大小（MB） */
  maxFileSize?: number;
  /** 最大备份文件数 */
  maxFiles?: number;
}

/** 日志条目 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

/**
 * 格式化日志级别（带颜色）
 */
function formatLevel(level: LogLevel, useColors: boolean): string {
  const levelStr = level.toUpperCase().padStart(5);
  if (useColors) {
    return `${LOG_COLORS[level]}${levelStr}${RESET_COLOR}`;
  }
  return levelStr;
}

/**
 * 格式化时间戳
 */
function formatTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * 日志记录器类
 */
export class Logger {
  private config: LoggerConfig;
  private fileStream?: fs.WriteStream;
  private currentFileSize: number = 0;

  constructor(config: LoggerConfig) {
    this.config = {
      useColors: true,
      maxFileSize: 10,
      maxFiles: 5,
      ...config,
    };

    if (this.config.file) {
      this.initFileStream();
    }
  }

  /**
   * 初始化文件流
   */
  private initFileStream(): void {
    if (!this.config.file) return;

    const filePath = resolveHome(this.config.file);
    const dir = path.dirname(filePath);

    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 检查文件大小并轮转
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      this.currentFileSize = stats.size / (1024 * 1024); // MB

      if (this.currentFileSize >= (this.config.maxFileSize || 10)) {
        this.rotateLogFile(filePath);
      }
    }

    this.fileStream = fs.createWriteStream(filePath, { flags: 'a' });
  }

  /**
   * 轮转日志文件
   */
  private rotateLogFile(filePath: string): void {
    const maxFiles = this.config.maxFiles || 5;
    const basePath = filePath;

    // 删除最旧的日志文件
    const oldestLog = `${basePath}.${maxFiles}`;
    if (fs.existsSync(oldestLog)) {
      fs.unlinkSync(oldestLog);
    }

    // 重命名现有日志文件
    for (let i = maxFiles - 1; i >= 1; i--) {
      const oldPath = `${basePath}.${i}`;
      const newPath = `${basePath}.${i + 1}`;
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }

    // 重命名当前日志文件
    if (fs.existsSync(basePath)) {
      fs.renameSync(basePath, `${basePath}.1`);
    }

    this.currentFileSize = 0;
  }

  /**
   * 检查是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * 格式化日志消息（人类可读）
   */
  private formatHuman(entry: LogEntry): string {
    const timestamp = formatTimestamp(entry.timestamp);
    const level = formatLevel(entry.level, this.config.useColors ?? true);
    let message = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.meta && Object.keys(entry.meta).length > 0) {
      message += `\n  meta: ${JSON.stringify(entry.meta)}`;
    }

    return message;
  }

  /**
   * 格式化日志消息（JSON）
   */
  private formatJson(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...entry.meta,
    });
  }

  /**
   * 写入日志
   */
  /**
   * 写入日志（protected 允许子类覆盖）
   */
  protected write(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // 写入文件（JSON 格式）
    if (this.fileStream) {
      const jsonLine = this.formatJson(entry) + '\n';
      this.fileStream.write(jsonLine);
      this.currentFileSize += Buffer.byteLength(jsonLine) / (1024 * 1024);
    }

    // 写入控制台（人类可读格式）
    if (this.config.console) {
      const humanLine = this.formatHuman(entry);
      const consoleMethod =
        entry.level === 'error'
          ? console.error
          : entry.level === 'warn'
            ? console.warn
            : entry.level === 'debug'
              ? console.debug
              : console.log;
      consoleMethod(humanLine);
    }
  }

  /**
   * 记录调试日志
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.write({
      level: 'debug',
      message,
      timestamp: new Date(),
      meta,
    });
  }

  /**
   * 记录信息日志
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.write({
      level: 'info',
      message,
      timestamp: new Date(),
      meta,
    });
  }

  /**
   * 记录警告日志
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.write({
      level: 'warn',
      message,
      timestamp: new Date(),
      meta,
    });
  }

  /**
   * 记录错误日志
   */
  error(message: string, meta?: Record<string, unknown>): void {
    this.write({
      level: 'error',
      message,
      timestamp: new Date(),
      meta,
    });
  }

  /**
   * 记录异常对象
   */
  exception(error: Error, meta?: Record<string, unknown>): void {
    this.error(error.message, {
      ...meta,
      errorName: error.name,
      stack: error.stack,
    });
  }

  /**
   * 关闭日志记录器
   */
  close(): void {
    if (this.fileStream) {
      this.fileStream.end();
    }
  }

  /**
   * 创建带上下文的子日志记录器
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);

    // 包装写入方法以添加上下文
    const originalWrite = this.write.bind(this);
    childLogger.write = (entry: LogEntry) => {
      originalWrite({
        ...entry,
        meta: { ...context, ...entry.meta },
      });
    };

    return childLogger;
  }
}

/**
 * 创建默认日志记录器
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    level: (process.env.ACL_LOG_LEVEL as LogLevel) || 'info',
    file: process.env.ACL_LOG_FILE,
    console: true,
    ...config,
  });
}

/**
 * 默认全局日志实例
 */
export const logger = createLogger();

/**
 * 带上下文的日志记录器
 */
export class LoggerContext {
  private logger: Logger;
  private context: Record<string, unknown>;

  constructor(logger: Logger, context: Record<string, unknown> = {}) {
    this.logger = logger;
    this.context = context;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, { ...this.context, ...meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, { ...this.context, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, { ...this.context, ...meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, { ...this.context, ...meta });
  }

  exception(error: Error, meta?: Record<string, unknown>): void {
    this.logger.exception(error, { ...this.context, ...meta });
  }

  /**
   * 创建带更多上下文的子上下文
   */
  child(additionalContext: Record<string, unknown>): LoggerContext {
    return new LoggerContext(this.logger, {
      ...this.context,
      ...additionalContext,
    });
  }
}

/**
 * 静默日志记录器（用于测试）
 */
export class SilentLogger extends Logger {
  constructor() {
    super({ level: 'error', console: false });
  }

  override write(): void {
    // 不写入任何内容
  }
}

/**
 * 内存日志记录器（用于测试）
 */
export class MemoryLogger extends Logger {
  entries: LogEntry[] = [];

  constructor(config?: Partial<LoggerConfig>) {
    super({ level: 'debug', console: false, ...config });
  }

  override write(entry: LogEntry): void {
    this.entries.push(entry);
  }

  /**
   * 获取所有日志条目
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * 获取特定级别的日志
   */
  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }
}
