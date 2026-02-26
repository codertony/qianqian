/**
 * Performance Optimizer - 性能优化器
 *
 * 缓存管理和性能优化
 *
 * @module performance-optimizer
 * @phase 3.6
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../shared/logger';
import { fileExists, ensureDir } from '../../shared/utils';

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  operation: string;
  /** 执行时间（毫秒） */
  duration: number;
  /** 内存使用（字节） */
  memoryUsage: number;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 性能优化器
 */
export class PerformanceOptimizer {
  private cacheDir: string;
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private maxMemoryCacheSize = 100;
  private metrics: PerformanceMetrics[] = [];

  constructor(aclDir: string) {
    this.cacheDir = path.join(aclDir, '.cache');
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    await ensureDir(this.cacheDir);
    logger.debug('Performance optimizer initialized');
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. 检查内存缓存
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
      logger.debug(`Memory cache hit: ${key}`);
      return memEntry.data;
    }

    // 2. 检查文件缓存
    const cacheFile = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
    if (await fileExists(cacheFile)) {
      try {
        const content = await fs.readFile(cacheFile, 'utf-8');
        const entry: CacheEntry<T> = JSON.parse(content);

        if (Date.now() - entry.timestamp < entry.ttl) {
          logger.debug(`File cache hit: ${key}`);
          // 恢复到内存缓存
          this.setMemoryCache(key, entry.data, entry.ttl);
          return entry.data;
        } else {
          // 过期，删除
          await fs.unlink(cacheFile);
        }
      } catch {
        // 忽略读取错误
      }
    }

    return null;
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, data: T, ttl = 3600000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // 1. 保存到内存缓存
    this.setMemoryCache(key, data, ttl);

    // 2. 保存到文件缓存
    const cacheFile = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
    try {
      await fs.writeFile(cacheFile, JSON.stringify(entry), 'utf-8');
    } catch (error) {
      logger.warn(`Failed to write cache file: ${key}`, { error });
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    const cacheFile = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
    if (await fileExists(cacheFile)) {
      await fs.unlink(cacheFile);
    }
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }
    } catch {
      // 忽略错误
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 只保留最近100条
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    operations: Record<string, { avg: number; min: number; max: number; count: number }>;
    memoryTrend: Array<{ timestamp: Date; usage: number }>;
  } {
    const operations: Record<string, { times: number[]; min: number; max: number }> = {};

    for (const metric of this.metrics) {
      if (!operations[metric.operation]) {
        operations[metric.operation] = { times: [], min: Infinity, max: 0 };
      }
      
      const op = operations[metric.operation];
      op.times.push(metric.duration);
      op.min = Math.min(op.min, metric.duration);
      op.max = Math.max(op.max, metric.duration);
    }

    const report: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [opName, data] of Object.entries(operations)) {
      const avg = data.times.reduce((a, b) => a + b, 0) / data.times.length;
      report[opName] = {
        avg: Math.round(avg),
        min: Math.round(data.min),
        max: Math.round(data.max),
        count: data.times.length,
      };
    }

    const memoryTrend = this.metrics.map((m) => ({
      timestamp: m.timestamp,
      usage: m.memoryUsage,
    }));

    return { operations: report, memoryTrend };
  }

  /**
   * 并行执行任务
   */
  async parallel<T>(
    tasks: Array<() => Promise<T>>,
    concurrency = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((task) => task()));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 延迟执行
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

  /**
   * 设置内存缓存
   */
  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    // LRU 淘汰
    if (this.memoryCache.size >= this.maxMemoryCacheSize && !this.memoryCache.has(key)) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 清理缓存键
   */
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}

/**
 * 创建性能优化器
 */
export function createPerformanceOptimizer(aclDir: string): PerformanceOptimizer {
  return new PerformanceOptimizer(aclDir);
}
