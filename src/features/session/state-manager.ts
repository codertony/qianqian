/**
 * Session State Manager - 会话状态管理器
 *
 * 管理 MCP Session 状态和同步
 *
 * @module session-state-manager
 * @phase 3.5
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../shared/logger';
import { fileExists, ensureDir } from '../../shared/utils';

/**
 * 会话状态
 */
export interface SessionState {
  /** 会话ID */
  id: string;
  /** 平台 */
  platform: string;
  /** 当前上下文 */
  context?: Record<string, unknown>;
  /** 历史记录 */
  history?: Array<{
    timestamp: Date;
    action: string;
    data?: unknown;
  }>;
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 状态同步结果
 */
export interface StateSyncResult {
  /** 是否成功 */
  success: boolean;
  /** 同步的会话 */
  syncedSessions: string[];
  /** 失败的会话 */
  failedSessions: string[];
  /** 错误信息 */
  errors?: string[];
}

/**
 * 会话状态管理器
 */
export class SessionStateManager {
  private stateDir: string;

  constructor(aclDir: string) {
    this.stateDir = path.join(aclDir, 'session-states');
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    await ensureDir(this.stateDir);
    logger.debug('Session state manager initialized');
  }

  /**
   * 保存会话状态
   */
  async saveState(state: SessionState): Promise<void> {
    const filePath = path.join(this.stateDir, `${state.platform}-${state.id}.json`);
    
    state.lastUpdated = new Date();
    
    await fs.writeFile(
      filePath,
      JSON.stringify(state, null, 2),
      'utf-8'
    );
    
    logger.debug(`Session state saved: ${state.id}`);
  }

  /**
   * 加载会话状态
   */
  async loadState(platform: string, sessionId: string): Promise<SessionState | null> {
    const filePath = path.join(this.stateDir, `${platform}-${sessionId}.json`);
    
    if (!(await fileExists(filePath))) {
      return null;
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const state = JSON.parse(content);
      
      // 转换日期字符串
      state.lastUpdated = new Date(state.lastUpdated);
      if (state.history) {
        state.history = state.history.map((h: { timestamp: string }) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }));
      }
      
      return state;
    } catch (error) {
      logger.error(`Failed to load session state: ${sessionId}`, { error });
      return null;
    }
  }

  /**
   * 获取平台所有会话
   */
  async getPlatformSessions(platform: string): Promise<SessionState[]> {
    try {
      const files = await fs.readdir(this.stateDir);
      const sessions: SessionState[] = [];

      for (const file of files) {
        if (file.startsWith(`${platform}-`) && file.endsWith('.json')) {
          const sessionId = file.replace(`${platform}-`, '').replace('.json', '');
          const state = await this.loadState(platform, sessionId);
          if (state) {
            sessions.push(state);
          }
        }
      }

      return sessions;
    } catch {
      return [];
    }
  }

  /**
   * 删除会话状态
   */
  async deleteState(platform: string, sessionId: string): Promise<void> {
    const filePath = path.join(this.stateDir, `${platform}-${sessionId}.json`);
    
    if (await fileExists(filePath)) {
      await fs.unlink(filePath);
      logger.debug(`Session state deleted: ${sessionId}`);
    }
  }

  /**
   * 同步会话状态
   */
  async syncStates(
    sourcePlatform: string,
    targetPlatform: string
  ): Promise<StateSyncResult> {
    const result: StateSyncResult = {
      success: true,
      syncedSessions: [],
      failedSessions: [],
      errors: [],
    };

    try {
      logger.info(`Syncing states from ${sourcePlatform} to ${targetPlatform}`);

      const sourceSessions = await this.getPlatformSessions(sourcePlatform);

      for (const session of sourceSessions) {
        try {
          // 创建目标平台的会话副本
          const targetSession: SessionState = {
            ...session,
            platform: targetPlatform,
            id: `${session.id}-synced`,
            lastUpdated: new Date(),
          };

          await this.saveState(targetSession);
          result.syncedSessions.push(session.id);
        } catch (error) {
          result.failedSessions.push(session.id);
          result.errors?.push(
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      result.success = result.failedSessions.length === 0;
      
      logger.info(`State sync completed: ${result.syncedSessions.length} synced`, {
        failed: result.failedSessions.length,
      });
    } catch (error) {
      result.success = false;
      result.errors?.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return result;
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(maxAge: number): Promise<number> {
    const files = await fs.readdir(this.stateDir);
    let cleaned = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(this.stateDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      try {
        const state = JSON.parse(content);
        const lastUpdated = new Date(state.lastUpdated).getTime();
        const now = Date.now();

        if (now - lastUpdated > maxAge) {
          await fs.unlink(filePath);
          cleaned++;
        }
      } catch {
        // 忽略解析错误
      }
    }

    logger.info(`Cleaned up ${cleaned} expired sessions`);
    return cleaned;
  }
}

/**
 * 创建会话状态管理器
 */
export function createSessionStateManager(aclDir: string): SessionStateManager {
  return new SessionStateManager(aclDir);
}
