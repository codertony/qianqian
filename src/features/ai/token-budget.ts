/**
 * AI Provider - Token 预算管理器
 *
 * 管理每日 Token 使用预算
 *
 * @module token-budget
 */

import { TokenBudgetConfig } from './types';
import { logger } from '../../shared/logger';

/**
 * Token 使用记录
 */
interface TokenUsageRecord {
  date: string;
  tokens: number;
}

/**
 * Token 预算管理器
 */
export class TokenBudgetManager {
  private config: TokenBudgetConfig;
  private dailyUsage: Map<string, number> = new Map();
  private currentDate: string;

  constructor(config: TokenBudgetConfig) {
    this.config = config;
    this.currentDate = this.getToday();
  }

  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   */
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 检查日期是否已变更
   */
  private checkDate(): void {
    const today = this.getToday();
    if (today !== this.currentDate) {
      // 日期变更，保存旧数据并清理
      this.currentDate = today;
      // 清理超过 30 天的记录
      this.cleanupOldRecords();
    }
  }

  /**
   * 清理超过 30 天的记录
   */
  private cleanupOldRecords(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    for (const date of this.dailyUsage.keys()) {
      if (date < cutoffDate) {
        this.dailyUsage.delete(date);
      }
    }
  }

  /**
   * 获取今日已使用的 Token 数
   */
  getTodayUsage(): number {
    this.checkDate();
    return this.dailyUsage.get(this.currentDate) || 0;
  }

  /**
   * 检查是否超出预算
   */
  async checkBudget(requestedTokens: number): Promise<boolean> {
    this.checkDate();
    
    const todayUsage = this.getTodayUsage();
    const wouldBeUsage = todayUsage + requestedTokens;

    // 检查单次调用限制
    if (requestedTokens > this.config.perCallMaxTokens) {
      logger.warn('Per-call token limit exceeded', {
        requested: requestedTokens,
        maxAllowed: this.config.perCallMaxTokens,
      });
      return false;
    }

    // 检查每日限制
    if (wouldBeUsage > this.config.dailyMaxTokens) {
      logger.warn('Daily token budget exceeded', {
        todayUsage,
        requested: requestedTokens,
        wouldBe: wouldBeUsage,
        dailyMax: this.config.dailyMaxTokens,
      });
      return false;
    }

    // 检查警告阈值
    const warningThreshold = this.config.dailyMaxTokens * (this.config.warningThreshold / 100);
    if (wouldBeUsage > warningThreshold && todayUsage <= warningThreshold) {
      logger.warn('Token budget warning threshold reached', {
        todayUsage: wouldBeUsage,
        dailyMax: this.config.dailyMaxTokens,
        threshold: this.config.warningThreshold,
      });
    }

    return true;
  }

  /**
   * 记录 Token 使用
   */
  recordUsage(tokens: number): void {
    this.checkDate();
    
    const currentUsage = this.dailyUsage.get(this.currentDate) || 0;
    this.dailyUsage.set(this.currentDate, currentUsage + tokens);

    logger.debug('Token usage recorded', {
      tokens,
      todayTotal: currentUsage + tokens,
      date: this.currentDate,
    });
  }

  /**
   * 获取统计信息
   */
  getStats(): { used: number; remaining: number; dailyMax: number } {
    this.checkDate();
    const used = this.getTodayUsage();
    
    return {
      used,
      remaining: Math.max(0, this.config.dailyMaxTokens - used),
      dailyMax: this.config.dailyMaxTokens,
    };
  }

  /**
   * 重置每日预算 (通常在新的一天自动处理)
   */
  resetDaily(): void {
    this.currentDate = this.getToday();
    this.dailyUsage.delete(this.currentDate);
    logger.info('Daily token budget reset');
  }

  /**
   * 获取历史使用数据
   */
  getHistory(days = 7): Array<{ date: string; tokens: number }> {
    const history: Array<{ date: string; tokens: number }> = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      history.push({
        date: dateStr,
        tokens: this.dailyUsage.get(dateStr) || 0,
      });
    }

    return history;
  }
}
