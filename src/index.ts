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

// Features 功能
export * from './features/asset-manager';
export * from './features/github-sync';
export * from './features/platform-adapters';

// Shared 共享
export * from './shared/types';
export * from './shared/utils';
export * from './shared/constants';

// Config 配置
export * from './config/schema';

// 版本信息
export const VERSION = '1.0.0';
export const NAME = 'qianqian';
