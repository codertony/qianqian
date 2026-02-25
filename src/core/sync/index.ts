/**
 * Core - 同步领域
 * 
 * 定义同步操作和状态管理
 */

// 同步方向
export enum SyncDirection {
  UP = 'up',      // 本地 → 云端
  DOWN = 'down',  // 云端 → 本地
  BIDIRECTIONAL = 'bidirectional',
}

// 同步策略
export enum SyncPolicy {
  FULL = 'full',        // 全量同步，云端优先
  MERGE = 'merge',      // 智能合并
  LOCAL = 'local',      // 本地优先
  MANUAL = 'manual',    // 手动解决冲突
}

// 同步状态
export enum SyncStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  ERROR = 'error',
  SUCCESS = 'success',
}

// 同步操作
export interface SyncOperation {
  id: string;
  direction: SyncDirection;
  policy: SyncPolicy;
  assets: string[];
  targetPlatforms?: string[];
  dryRun?: boolean;
}

// 同步结果
export interface SyncResult {
  operation: SyncOperation;
  status: SyncStatus;
  timestamp: Date;
  changes: SyncChange[];
  conflicts?: SyncConflict[];
  errors?: SyncError[];
}

// 同步变更
export interface SyncChange {
  assetId: string;
  assetName: string;
  assetType: string;
  action: 'create' | 'update' | 'delete' | 'skip';
  platform?: string;
  details?: string;
}

// 同步冲突
export interface SyncConflict {
  assetId: string;
  assetName: string;
  localVersion: string;
  remoteVersion: string;
  localModifiedAt: Date;
  remoteModifiedAt: Date;
  resolution?: SyncPolicy;
}

// 同步错误
export interface SyncError {
  assetId?: string;
  code: string;
  message: string;
  stack?: string;
}

// 同步配置
export interface SyncConfig {
  autoSync: boolean;
  syncPolicy: SyncPolicy;
  defaultPlatforms: string[];
  excludePatterns: string[];
  conflictResolution: SyncPolicy;
}

// 同步器接口
export interface Syncer {
  readonly config: SyncConfig;
  
  // 执行同步
  sync(operation: SyncOperation): Promise<SyncResult>;
  
  // 获取同步状态
  getStatus(): SyncStatus;
  
  // 解决冲突
  resolveConflict(conflict: SyncConflict, resolution: SyncPolicy): Promise<void>;
  
  // 预览同步（dry-run）
  preview(operation: SyncOperation): Promise<SyncResult>;
}

// 创建同步操作
export function createSyncOperation(
  direction: SyncDirection,
  overrides: Partial<SyncOperation> = {}
): SyncOperation {
  return {
    id: `sync-${Date.now()}`,
    direction,
    policy: SyncPolicy.MERGE,
    assets: [],
    dryRun: false,
    ...overrides,
  };
}
