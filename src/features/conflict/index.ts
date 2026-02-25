/**
 * Conflict Resolution - 入口
 *
 * 冲突解决模块导出
 *
 * @module conflict-resolution
 */

export {
  ConflictType,
  ConflictStrategy,
  ConflictResolver,
  createConflictResolver,
} from './resolver';

export type {
  Conflict,
  ConflictResolution,
} from './resolver';
