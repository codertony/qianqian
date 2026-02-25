/**
 * 乾乾 (QianQian) - 入口文件
 *
 * 参考 oh-my-opencode 的插件架构设计
 *
 * @module qianqian
 */

// Core 领域
export * from './core/asset';
export * from './core/platform';
export * from './core/sync';

// Shared 共享
export * from './shared/types';
export * from './shared/utils';
export * from './shared/fs';
export * from './shared/errors';
export * from './shared/logger';
export * from './shared/constants';

// Config 配置
export * from './config/schema';
export * from './config/loader';

// CLI
export * from './cli/command-registry';

// 版本信息
export const VERSION = '1.0.0';
export const NAME = 'qianqian';
