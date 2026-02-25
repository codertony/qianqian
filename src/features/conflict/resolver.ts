/**
 * Conflict Resolver - 冲突解决器
 *
 * 处理资产同步中的冲突
 *
 * @module conflict-resolver
 */

import { AIProviderFactory, AIMessageRole } from '../ai';
import { logger } from '../../shared/logger';

/**
 * 冲突类型
 */
export enum ConflictType {
  /** 本地修改 vs 远程修改 */
  LOCAL_REMOTE = 'local_remote',
  /** 文件已存在 */
  FILE_EXISTS = 'file_exists',
  /** 内容冲突 */
  CONTENT = 'content',
}

/**
 * 冲突解决策略
 */
export enum ConflictStrategy {
  /** 使用本地版本 */
  LOCAL = 'local',
  /** 使用远程版本 */
  REMOTE = 'remote',
  /** 合并 */
  MERGE = 'merge',
  /** AI 辅助合并 */
  AI_MERGE = 'ai_merge',
}

/**
 * 冲突信息
 */
export interface Conflict {
  /** 冲突 ID */
  id: string;
  /** 资产 ID */
  assetId: string;
  /** 资产名称 */
  assetName: string;
  /** 资产类型 */
  assetType: string;
  /** 冲突类型 */
  type: ConflictType;
  /** 本地内容 */
  localContent?: string;
  /** 远程内容 */
  remoteContent?: string;
  /** 基础内容 */
  baseContent?: string;
  /** 文件路径 */
  filePath: string;
}

/**
 * 冲突解决结果
 */
export interface ConflictResolution {
  /** 冲突 ID */
  conflictId: string;
  /** 使用的策略 */
  strategy: ConflictStrategy;
  /** 解决后的内容 */
  resolvedContent?: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 冲突解决器
 */
export class ConflictResolver {
  private aiFactory?: AIProviderFactory;

  constructor(aiFactory?: AIProviderFactory) {
    this.aiFactory = aiFactory;
  }

  /**
   * 检测冲突
   */
  detectConflicts(localAssets: Map<string, string>, remoteAssets: Map<string, string>): Conflict[] {
    const conflicts: Conflict[] = [];
    const allKeys = new Set([...localAssets.keys(), ...remoteAssets.keys()]);

    for (const key of allKeys) {
      const local = localAssets.get(key);
      const remote = remoteAssets.get(key);

      if (local && remote && local !== remote) {
        conflicts.push({
          id: `conflict-${key}`,
          assetId: key,
          assetName: key.split('/').pop() || key,
          assetType: 'unknown',
          type: ConflictType.CONTENT,
          localContent: local,
          remoteContent: remote,
          filePath: key,
        });
      }
    }

    return conflicts;
  }

  /**
   * 解决单个冲突
   */
  async resolveConflict(
    conflict: Conflict,
    strategy: ConflictStrategy
  ): Promise<ConflictResolution> {
    try {
      switch (strategy) {
        case ConflictStrategy.LOCAL:
          return this.resolveWithLocal(conflict);
        case ConflictStrategy.REMOTE:
          return this.resolveWithRemote(conflict);
        case ConflictStrategy.MERGE:
          return this.resolveWithMerge(conflict);
        case ConflictStrategy.AI_MERGE:
          return await this.resolveWithAI(conflict);
        default:
          return {
            conflictId: conflict.id,
            strategy,
            success: false,
            error: 'Unknown strategy',
          };
      }
    } catch (error) {
      logger.error('Failed to resolve conflict', { error, conflict });
      return {
        conflictId: conflict.id,
        strategy,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 使用本地版本解决
   */
  private resolveWithLocal(conflict: Conflict): ConflictResolution {
    return {
      conflictId: conflict.id,
      strategy: ConflictStrategy.LOCAL,
      resolvedContent: conflict.localContent,
      success: true,
    };
  }

  /**
   * 使用远程版本解决
   */
  private resolveWithRemote(conflict: Conflict): ConflictResolution {
    return {
      conflictId: conflict.id,
      strategy: ConflictStrategy.REMOTE,
      resolvedContent: conflict.remoteContent,
      success: true,
    };
  }

  /**
   * 使用三路合并解决
   */
  private resolveWithMerge(conflict: Conflict): ConflictResolution {
    // 简单的行级合并算法
    const localLines = (conflict.localContent || '').split('\n');
    const remoteLines = (conflict.remoteContent || '').split('\n');

    // 简单的并集策略 (实际应使用 diff3 算法)
    const merged = new Set([...localLines, ...remoteLines]);
    const resolvedContent = Array.from(merged).join('\n');

    return {
      conflictId: conflict.id,
      strategy: ConflictStrategy.MERGE,
      resolvedContent,
      success: true,
    };
  }

  /**
   * 使用 AI 辅助合并
   */
  private async resolveWithAI(conflict: Conflict): Promise<ConflictResolution> {
    if (!this.aiFactory) {
      return {
        conflictId: conflict.id,
        strategy: ConflictStrategy.AI_MERGE,
        success: false,
        error: 'AI Factory not available',
      };
    }

    try {
      const prompt = `Merge the following two versions of a file. 
Keep the best parts from both versions and resolve any conflicts.

--- Local Version ---
${conflict.localContent}

--- Remote Version ---
${conflict.remoteContent}

Provide only the merged content without explanation.`;

      const result = await this.aiFactory.executeTask(
        'semantic_merge' as any,
        [{ role: AIMessageRole.USER, content: prompt }],
        { maxTokens: 2000 }
      );

      return {
        conflictId: conflict.id,
        strategy: ConflictStrategy.AI_MERGE,
        resolvedContent: result.content,
        success: true,
      };
    } catch (error) {
      return {
        conflictId: conflict.id,
        strategy: ConflictStrategy.AI_MERGE,
        success: false,
        error: error instanceof Error ? error.message : 'AI merge failed',
      };
    }
  }

  /**
   * 批量解决冲突
   */
  async resolveConflicts(
    conflicts: Conflict[],
    strategy: ConflictStrategy
  ): Promise<ConflictResolution[]> {
    const results: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const result = await this.resolveConflict(conflict, strategy);
      results.push(result);
    }

    return results;
  }

  /**
   * 获取冲突统计
   */
  getConflictStats(conflicts: Conflict[]): Record<ConflictType, number> {
    const stats: Record<ConflictType, number> = {
      [ConflictType.LOCAL_REMOTE]: 0,
      [ConflictType.FILE_EXISTS]: 0,
      [ConflictType.CONTENT]: 0,
    };

    for (const conflict of conflicts) {
      stats[conflict.type] = (stats[conflict.type] || 0) + 1;
    }

    return stats;
  }
}

/**
 * 创建冲突解决器
 */
export function createConflictResolver(aiFactory?: AIProviderFactory): ConflictResolver {
  return new ConflictResolver(aiFactory);
}
