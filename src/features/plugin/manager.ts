/**
 * Plugin System - Plugin Manager
 *
 * @module plugin-manager
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import {
  PluginAsset,
  PluginManifest,
  InstalledPlugin,
  PluginInstallOptions,
  PluginDependency,
} from './types';
import { AssetType, createAsset } from '../../core/asset';
import { logger } from '../../shared/logger';
import { fileExists, ensureDir } from '../../shared/utils';
import { readYaml, writeYaml } from '../../shared/fs';

/**
 * Plugin 管理器
 */
export class PluginManager {
  private pluginsDir: string;
  private registryPath: string;
  private installedPlugins: Map<string, InstalledPlugin> = new Map();

  constructor(aclDir: string) {
    this.pluginsDir = path.join(aclDir, 'plugins');
    this.registryPath = path.join(aclDir, 'plugin-registry.yaml');
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    await ensureDir(this.pluginsDir);
    await this.loadRegistry();
  }

  /**
   * 加载注册表
   */
  private async loadRegistry(): Promise<void> {
    if (!(await fileExists(this.registryPath))) {
      return;
    }

    try {
      const registry = (await readYaml(this.registryPath)) as Record<string, InstalledPlugin>;
      for (const [id, plugin] of Object.entries(registry)) {
        this.installedPlugins.set(id, {
          ...plugin,
          installedAt: new Date(plugin.installedAt),
          updatedAt: new Date(plugin.updatedAt),
        });
      }
    } catch (error) {
      logger.error('Failed to load plugin registry', { error });
    }
  }

  /**
   * 保存注册表
   */
  private async saveRegistry(): Promise<void> {
    const registry: Record<string, InstalledPlugin> = {};
    for (const [id, plugin] of this.installedPlugins) {
      registry[id] = plugin;
    }
    await writeYaml(this.registryPath, registry);
  }

  /**
   * 安装 Plugin
   */
  async install(
    pluginName: string,
    options: PluginInstallOptions = {}
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(`Installing plugin: ${pluginName}`);

      // 检查是否已安装
      const existing = this.installedPlugins.get(pluginName);
      if (existing && !options.force) {
        return {
          success: false,
          message: `Plugin ${pluginName} is already installed (v${existing.version}). Use --force to override.`,
        };
      }

      // TODO: 获取 Plugin manifest 并安装
      // 目前返回模拟成功
      return {
        success: true,
        message: `Plugin ${pluginName} installed (mock)`,
      };
    } catch (error) {
      logger.error(`Failed to install plugin: ${pluginName}`, { error });
      return {
        success: false,
        message: `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * 卸载 Plugin
   */
  async uninstall(pluginName: string): Promise<{ success: boolean; message: string }> {
    const plugin = this.installedPlugins.get(pluginName);
    if (!plugin) {
      return {
        success: false,
        message: `Plugin ${pluginName} is not installed.`,
      };
    }

    this.installedPlugins.delete(pluginName);
    await this.saveRegistry();

    return {
      success: true,
      message: `Uninstalled ${pluginName}`,
    };
  }

  /**
   * 列出所有已安装的 Plugin
   */
  list(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }
}

/**
 * 创建 Plugin 管理器
 */
export function createPluginManager(aclDir: string): PluginManager {
  return new PluginManager(aclDir);
}
