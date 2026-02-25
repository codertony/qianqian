/**
 * AI Provider - 限流器
 *
 * 控制 AI API 调用频率
 *
 * @module rate-limiter
 */

import { RateLimitConfig } from './types';
import { logger } from '../../shared/logger';

/**
 * 限流器
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private requestTimestamps: number[] = [];
  private activeRequests = 0;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * 检查是否可以继续发送请求
   */
  canProceed(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 清理过期的请求记录
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);

    // 检查每分钟请求数限制
    if (this.requestTimestamps.length >= this.config.maxRequestsPerMinute) {
      logger.warn('Rate limit reached', {
        requestsInLastMinute: this.requestTimestamps.length,
        maxAllowed: this.config.maxRequestsPerMinute,
      });
      return false;
    }

    // 检查并发数限制
    if (this.activeRequests >= this.config.maxConcurrent) {
      logger.warn('Concurrent request limit reached', {
        active: this.activeRequests,
        maxAllowed: this.config.maxConcurrent,
      });
      return false;
    }

    return true;
  }

  /**
   * 记录一次请求
   */
  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * 开始一个请求 (增加并发计数)
   */
  startRequest(): void {
    this.activeRequests++;
  }

  /**
   * 结束一个请求 (减少并发计数)
   */
  endRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    requestsInLastMinute: number;
    activeRequests: number;
    canProceed: boolean;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter(t => t > oneMinuteAgo).length;

    return {
      requestsInLastMinute: recentRequests,
      activeRequests: this.activeRequests,
      canProceed: this.canProceed(),
    };
  }

  /**
   * 等待直到可以发送请求
   */
  async waitForSlot(timeoutMs = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (this.canProceed()) {
        return true;
      }
      
      // 等待 100ms 后重试
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
  }
}
