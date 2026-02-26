/**
 * Version Manager - 版本管理器
 *
 * 管理资产版本，支持版本检测、降级和锁定
 *
 * @module version-manager
 * @phase 3.5
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { SimpleGit } from 'simple-git';
import { logger } from '../../shared/logger';
import { fileExists } from '../../shared/utils';

/**
 * 版本信息
 */
export interface VersionInfo {
  /** 版本号 */
  version: string;
  /** 提交哈希 */
  hash: string;
  /** 提交日期 */
  date: Date;
  /** 提交消息 */
  message: string;
  /** 标签 */
  tags?: string[];
}

/**
 * 版本锁定配置
 */
export interface VersionLock {
  /** 资产ID */
  assetId: string;
  /** 锁定版本 */
  lockedVersion: string;
  /** 锁定日期 */
  lockedAt: Date;
  /** 锁定原因 */
  reason?: string;
}

/**
 * 降级策略
 */
export enum DowngradeStrategy {
  /** 严格模式 - 只降级明确兼容的版本 */
  STRICT = 'strict',
  /** 宽松模式 - 尝试降级并警告 */
  LENIENT = 'lenient',
  /** 强制模式 - 强制降级忽略兼容性 */
  FORCE = 'force',
}

/**
 * 降级结果
 */
export interface DowngradeResult {
  /** 是否成功 */
  success: boolean;
  /** 降级后的版本 */
  targetVersion: string;
  /** 警告信息 */
  warnings: string[];
  /** 错误信息 */
  error?: string;
  /** 受影响的资产 */
  affectedAssets: string[];
}

/**
 * 版本管理器
 */
export class VersionManager {
  private git: SimpleGit;
  private aclDir: string;
  private locksFile: string;

  constructor(git: SimpleGit, aclDir: string) {
    this.git = git;
    this.aclDir = aclDir;
    this.locksFile = path.join(aclDir, 'version-locks.json');
  }

  /**
   * 检测当前版本
   */
  async detectCurrentVersion(): Promise<VersionInfo | null> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      if (!log.latest) {
        return null;
      }

      // 获取标签
      const tags = await this.git.tag(['--points-at', 'HEAD']);
      const tagList = tags ? tags.split('\n').filter(Boolean) : [];

      // 提取版本号（从标签或提交消息）
      let version = '0.0.0';
      if (tagList.length > 0) {
        // 使用第一个标签作为版本
        version = tagList[0].replace(/^v/, '');
      } else {
        // 从提交消息中提取版本信息
        const versionMatch = log.latest.message.match(/\b(\d+\.\d+\.\d+)\b/);
        if (versionMatch) {
          version = versionMatch[1];
        }
      }

      return {
        version,
        hash: log.latest.hash.substring(0, 7),
        date: new Date(log.latest.date),
        message: log.latest.message,
        tags: tagList,
      };
    } catch (error) {
      logger.error('Failed to detect current version', { error });
      return null;
    }
  }

  /**
   * 获取所有可用版本
   */
  async getAvailableVersions(): Promise<VersionInfo[]> {
    try {
      // 获取所有标签
      const tags = await this.git.tag(['--sort=-creatordate']);
      const tagList = tags.split('\n').filter(Boolean);

      const versions: VersionInfo[] = [];

      for (const tag of tagList.slice(0, 50)) {
        try {
          const tagLog = await this.git.log({ from: tag, to: tag, maxCount: 1 });
          if (tagLog.latest) {
            versions.push({
              version: tag.replace(/^v/, ''),
              hash: tagLog.latest.hash.substring(0, 7),
              date: new Date(tagLog.latest.date),
              message: tagLog.latest.message,
              tags: [tag],
            });
          }
        } catch {
          // 忽略无法获取的标签
        }
      }

      // 如果没有标签，返回最近的提交
      if (versions.length === 0) {
        const current = await this.detectCurrentVersion();
        if (current) {
          versions.push(current);
        }
      }

      return versions;
    } catch (error) {
      logger.error('Failed to get available versions', { error });
      return [];
    }
  }

  /**
   * 降级到指定版本
   */
  async downgrade(
    targetVersion: string,
    strategy: DowngradeStrategy = DowngradeStrategy.STRICT
  ): Promise<DowngradeResult> {
    const warnings: string[] = [];
    const affectedAssets: string[] = [];

    try {
      logger.info(`Starting downgrade to version ${targetVersion}`, { strategy });

      // 1. 检查目标版本是否存在
      const versions = await this.getAvailableVersions();
      const targetVersionInfo = versions.find((v) => v.version === targetVersion);

      if (!targetVersionInfo) {
        // 尝试通过标签查找
        try {
          await this.git.show([`v${targetVersion}`]);
        } catch {
          return {
            success: false,
            targetVersion,
            warnings: [],
            error: `Version ${targetVersion} not found`,
            affectedAssets: [],
          };
        }
      }

      // 2. 检查当前状态
      const status = await this.git.status();
      if (status.modified.length > 0 || status.staged.length > 0) {
        if (strategy === DowngradeStrategy.STRICT) {
          return {
            success: false,
            targetVersion,
            warnings: [],
            error: 'Uncommitted changes exist. Commit or stash them first.',
            affectedAssets: [],
          };
        } else {
          warnings.push('Uncommitted changes will be preserved');
        }
      }

      // 3. 执行降级
      const targetRef = targetVersionInfo?.hash || `v${targetVersion}`;
      
      if (strategy === DowngradeStrategy.FORCE) {
        // 强制重置
        await this.git.reset(['--hard', targetRef]);
      } else {
        // 尝试检出
        try {
          await this.git.checkout(targetRef);
        } catch (error) {
          // 如果检出失败，创建临时分支
          const tempBranch = `downgrade-${targetVersion}-${Date.now()}`;
          await this.git.checkoutBranch(tempBranch, targetRef);
          warnings.push(`Created temporary branch: ${tempBranch}`);
        }
      }

      // 4. 分析受影响的资产
      const currentVersion = await this.detectCurrentVersion();
      if (currentVersion) {
        const diff = await this.git.diff([
          `${targetRef}..HEAD`,
          '--name-only',
        ]);
        affectedAssets.push(...diff.split('\n').filter(Boolean));
      }

      logger.info(`Downgrade to ${targetVersion} completed`, {
        affectedAssets: affectedAssets.length,
      });

      return {
        success: true,
        targetVersion,
        warnings,
        affectedAssets,
      };
    } catch (error) {
      logger.error('Downgrade failed', { error, targetVersion });
      return {
        success: false,
        targetVersion,
        warnings,
        error: error instanceof Error ? error.message : 'Unknown error',
        affectedAssets,
      };
    }
  }

  /**
   * 锁定资产版本
   */
  async lockVersion(assetId: string, version: string, reason?: string): Promise<void> {
    const locks = await this.loadLocks();
    
    locks[assetId] = {
      assetId,
      lockedVersion: version,
      lockedAt: new Date(),
      reason,
    };

    await this.saveLocks(locks);
    logger.info(`Version locked for ${assetId}: ${version}`, { reason });
  }

  /**
   * 解锁资产版本
   */
  async unlockVersion(assetId: string): Promise<void> {
    const locks = await this.loadLocks();
    delete locks[assetId];
    await this.saveLocks(locks);
    logger.info(`Version unlocked for ${assetId}`);
  }

  /**
   * 获取资产版本锁定
   */
  async getLock(assetId: string): Promise<VersionLock | null> {
    const locks = await this.loadLocks();
    return locks[assetId] || null;
  }

  /**
   * 获取所有版本锁定
   */
  async getAllLocks(): Promise<VersionLock[]> {
    const locks = await this.loadLocks();
    return Object.values(locks);
  }

  /**
   * 检查资产是否已锁定
   */
  async isLocked(assetId: string): Promise<boolean> {
    const lock = await this.getLock(assetId);
    return lock !== null;
  }

  /**
   * 比较版本
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * 加载版本锁定
   */
  private async loadLocks(): Promise<Record<string, VersionLock>> {
    try {
      if (!(await fileExists(this.locksFile))) {
        return {};
      }

      const content = await fs.readFile(this.locksFile, 'utf-8');
      const locks = JSON.parse(content);
      
      // 转换日期字符串为 Date 对象
      for (const key of Object.keys(locks)) {
        if (locks[key].lockedAt) {
          locks[key].lockedAt = new Date(locks[key].lockedAt);
        }
      }
      
      return locks;
    } catch (error) {
      logger.error('Failed to load version locks', { error });
      return {};
    }
  }

  /**
   * 保存版本锁定
   */
  private async saveLocks(locks: Record<string, VersionLock>): Promise<void> {
    try {
      await fs.writeFile(this.locksFile, JSON.stringify(locks, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save version locks', { error });
      throw error;
    }
  }
}

/**
 * 创建版本管理器
 */
export function createVersionManager(git: SimpleGit, aclDir: string): VersionManager {
  return new VersionManager(git, aclDir);
}
