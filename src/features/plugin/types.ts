/**
 * Plugin System - 插件类型定义
 *
 * @module plugin-types
 */

import { Asset, AssetType } from '../../core/asset';

/**
 * Plugin 资产类型
 */
export interface PluginAsset extends Asset {
  type: AssetType.PLUGIN;
  manifest: PluginManifest;
  assets: {
    agents: string[];
    skills: string[];
    prompts: string[];
    flows: string[];
  };
}

/**
 * Plugin Manifest
 */
export interface PluginManifest {
  /** Plugin 名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 描述 */
  description: string;
  /** 作者 */
  author?: string;
  /** 标签 */
  tags?: string[];
  /** 入口文件 */
  entry?: string;
  /** 包含的资产 */
  assets: {
    agents?: string[];
    skills?: string[];
    prompts?: string[];
    flows?: string[];
  };
  /** 依赖的其他 Plugin */
  dependencies?: Record<string, string>;
  /** 兼容性矩阵 */
  compatibility?: CompatibilityMatrix;
}

/**
 * 兼容性矩阵
 */
export interface CompatibilityMatrix {
  /** 全局兼容性状态 */
  global?: PlatformCompatibility;
  /** 各平台兼容性 */
  platforms?: Record<string, PlatformCompatibility>;
  /** Agent 级别兼容性 */
  agents?: Record<string, Record<string, PlatformCompatibility>>;
}

/**
 * 平台兼容性
 */
export interface PlatformCompatibility {
  /** 兼容状态 */
  status: 'full' | 'partial' | 'none';
  /** 需要的平台版本 */
  version?: string;
  /** 缺失的功能 */
  missingFeatures?: string[];
  /** 说明 */
  notes?: string;
}

/**
 * 已安装的 Plugin
 */
export interface InstalledPlugin {
  /** Plugin ID */
  id: string;
  /** Plugin 名称 */
  name: string;
  /** 当前版本 */
  version: string;
  /** 安装路径 */
  path: string;
  /** 安装时间 */
  installedAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * Plugin 安装选项
 */
export interface PluginInstallOptions {
  /** 版本 */
  version?: string;
  /** 强制安装（覆盖现有） */
  force?: boolean;
  /** 不安装依赖 */
  noDeps?: boolean;
}

/**
 * Plugin 依赖信息
 */
export interface PluginDependency {
  /** Plugin 名称 */
  name: string;
  /** 版本范围 */
  versionRange: string;
  /** 是否已安装 */
  installed: boolean;
  /** 已安装的版本 */
  installedVersion?: string;
  /** 是否满足版本要求 */
  satisfied: boolean;
}

/**
 * Plugin 市场信息
 */
export interface PluginMarketInfo {
  /** Plugin 名称 */
  name: string;
  /** 最新版本 */
  latestVersion: string;
  /** 描述 */
  description: string;
  /** 作者 */
  author: string;
  /** 下载次数 */
  downloads: number;
  /** 来源 */
  source: string;
  /** 仓库 URL */
  repositoryUrl?: string;
}
