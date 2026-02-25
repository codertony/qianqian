/**
 * Dependency Management - 入口
 *
 * 依赖管理模块导出
 *
 * @module dependency-management
 */

export {
  DependencyType,
  DependencyManager,
  createDependencyManager,
} from './manager';

export type {
  Dependency,
  DependencyCheckResult,
} from './manager';
