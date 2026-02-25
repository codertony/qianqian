/**
 * Core - Git 同步引擎
 *
 * 基于 Git 的资产同步实现
 *
 * @module git-sync-engine
 */

import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import {
  SyncOperation,
  SyncResult,
  SyncStatus,
  SyncChange,
  SyncConflict,
  SyncError as SyncErrorType,
  SyncDirection,
  SyncPolicy,
} from './index';
import { Config } from '../../shared/types';
import { logger } from '../../shared/logger';
import { GitError, SyncError } from '../../shared/errors';
import { ensureDir, fileExists } from '../../shared/utils';

/**
 * Git 同步引擎
 */
export class GitSyncEngine {
  private git: SimpleGit;
  private config: Config;
  private localPath: string;

  constructor(config: Config) {
    this.config = config;
    this.localPath = config.repository?.localPath || path.join(process.cwd(), '.acl', 'assets');
    this.git = simpleGit(this.localPath);
  }

  /**
   * 初始化仓库
   */
  async init(): Promise<void> {
    try {
      await ensureDir(this.localPath);

      // 检查是否已是 Git 仓库
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        await this.git.init();
        logger.info('Git repository initialized', { path: this.localPath });
      }
    } catch (error) {
      throw new GitError('Failed to initialize Git repository', 'REPO_INIT_FAILED', { error });
    }
  }

  /**
   * 克隆仓库
   */
  async clone(repoUrl: string): Promise<void> {
    try {
      await ensureDir(path.dirname(this.localPath));

      if (await fileExists(this.localPath)) {
        throw new GitError('Local path already exists', 'REPO_PATH_EXISTS');
      }

      await simpleGit().clone(repoUrl, this.localPath);
      logger.info('Repository cloned', { repoUrl, localPath: this.localPath });
    } catch (error) {
      throw new GitError('Failed to clone repository', 'REPO_CLONE_FAILED', { error });
    }
  }

  /**
   * 拉取更新
   */
  async pull(): Promise<void> {
    try {
      await this.git.pull();
      logger.info('Repository pulled');
    } catch (error) {
      throw new GitError('Failed to pull repository', 'REPO_PULL_FAILED', { error });
    }
  }

  /**
   * 推送更改
   */
  async push(): Promise<void> {
    try {
      await this.git.push();
      logger.info('Repository pushed');
    } catch (error) {
      throw new GitError('Failed to push repository', 'REPO_PUSH_FAILED', { error });
    }
  }

  /**
   * 获取远程分支列表
   */
  async getRemoteBranches(): Promise<string[]> {
    try {
      const branches = await this.git.branch(['-r']);
      return branches.all;
    } catch (error) {
      logger.error('Failed to get remote branches', { error });
      return [];
    }
  }

  /**
   * 获取当前状态
   */
  async getStatus(): Promise<{
    ahead: number;
    behind: number;
    modified: string[];
    staged: string[];
    untracked: string[];
  }> {
    try {
      const status = await this.git.status();
      return {
        ahead: status.ahead,
        behind: status.behind,
        modified: status.modified,
        staged: status.staged,
        untracked: status.not_added,
      };
    } catch (error) {
      throw new GitError('Failed to get status', 'REPO_STATUS_FAILED', { error });
    }
  }

  /**
   * 添加文件到暂存区
   */
  async add(files: string | string[]): Promise<void> {
    try {
      await this.git.add(files);
      logger.debug('Files added to staging', { files });
    } catch (error) {
      throw new GitError('Failed to add files', 'REPO_ADD_FAILED', { error });
    }
  }

  /**
   * 提交更改
   */
  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
      logger.info('Changes committed', { message });
    } catch (error) {
      throw new GitError('Failed to commit changes', 'REPO_COMMIT_FAILED', { error });
    }
  }

  /**
   * 创建提交（添加并提交）
   */
  async createCommit(message: string, files?: string[]): Promise<void> {
    if (files && files.length > 0) {
      await this.add(files);
    } else {
      await this.add('.');
    }

    const status = await this.getStatus();
    if (status.staged.length === 0 && status.modified.length === 0) {
      logger.info('No changes to commit');
      return;
    }

    await this.commit(message);
  }

  /**
   * 获取提交历史
   */
  async getLog(maxCount = 10): Promise<Array<{ hash: string; message: string; date: string }>> {
    try {
      const log = await this.git.log({ maxCount });
      return log.all.map((commit) => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        date: commit.date,
      }));
    } catch (error) {
      logger.error('Failed to get log', { error });
      return [];
    }
  }

  /**
   * 获取上次提交时间
   */
  async getLastCommitTime(): Promise<Date | null> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      if (log.latest) {
        return new Date(log.latest.date);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 检查是否有未提交的更改
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return status.modified.length > 0 || status.staged.length > 0 || status.untracked.length > 0;
  }

  /**
   * 同步操作（完整流程）
   */
  async sync(operation: SyncOperation): Promise<SyncResult> {
    const startTime = Date.now();
    const changes: SyncChange[] = [];
    const conflicts: SyncConflict[] = [];
    const errors: SyncErrorType[] = [];

    try {
      logger.info('Starting sync operation', { operation });

      // 1. 检查仓库状态
      await this.init();

      // 2. 拉取远程更新（如果是双向或下载同步）
      if (operation.direction === SyncDirection.DOWN || operation.direction === SyncDirection.BIDIRECTIONAL) {
        try {
          await this.pull();
          changes.push({
            assetId: 'repo',
            assetName: 'repository',
            assetType: 'repo',
            action: 'update',
            details: 'Pulled remote changes',
          });
        } catch (error) {
          errors.push({
            code: 'PULL_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // 3. 如果是 dry-run，不执行实际更改
      if (operation.dryRun) {
        return {
          operation,
          status: SyncStatus.SUCCESS,
          timestamp: new Date(),
          changes,
          conflicts,
          errors,
        };
      }

      // 4. 推送本地更改（如果是双向或上传同步）
      if (operation.direction === SyncDirection.UP || operation.direction === SyncDirection.BIDIRECTIONAL) {
        const hasChanges = await this.hasUncommittedChanges();
        if (hasChanges) {
          await this.createCommit(`Sync: ${operation.id}`);
          changes.push({
            assetId: 'repo',
            assetName: 'repository',
            assetType: 'repo',
            action: 'create',
            details: 'Committed local changes',
          });
        }

        try {
          await this.push();
          changes.push({
            assetId: 'repo',
            assetName: 'repository',
            assetType: 'repo',
            action: 'update',
            details: 'Pushed local changes',
          });
        } catch (error) {
          errors.push({
            code: 'PUSH_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.info('Sync operation completed', { duration, changes: changes.length });

      return {
        operation,
        status: errors.length > 0 ? SyncStatus.ERROR : SyncStatus.SUCCESS,
        timestamp: new Date(),
        changes,
        conflicts,
        errors,
      };
    } catch (error) {
      logger.error('Sync operation failed', { error });

      return {
        operation,
        status: SyncStatus.ERROR,
        timestamp: new Date(),
        changes,
        conflicts,
        errors: [
          ...errors,
          {
            code: 'SYNC_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        ],
      };
    }
  }

  /**
   * 预览同步（dry-run）
   */
  async preview(operation: SyncOperation): Promise<SyncResult> {
    return this.sync({ ...operation, dryRun: true });
  }
}

/**
 * 创建 Git 同步引擎实例
 */
export function createGitSyncEngine(config: Config): GitSyncEngine {
  return new GitSyncEngine(config);
}
