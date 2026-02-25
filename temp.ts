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
  PluginMarketInfo,
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
      const existing = this.getInstalled(pluginName) as InstalledPlugin | null;
      if (existing && !options.force) {
        return {
          success: false,
          message: `Plugin ${pluginName} is already installed (v${existing.version}). Use --force to override.`,
        };
      }

      // 获取 Plugin manifest
      const manifest = await this.fetchManifest(pluginName, options.version);
      if (!manifest) {
        return {
          success: false,
          message: `Plugin ${pluginName} not found in registry.`,
        };
      }

      // 检查依赖
      if (!options.noDeps) {
        const deps = await this.checkDependencies(manifest);
        const missing = deps.filter((d) => !d.installed || !d.satisfied);
        if (missing.length > 0) {
          // 尝试安装缺失的依赖
          for (const dep of missing) {
            await this.install(dep.name, { ...options, noDeps: true });
          }
        }
      }

      // 安装 Plugin
      const installPath = path.join(this.pluginsDir, manifest.name);
      await ensureDir(installPath);

      // 下载 Plugin 文件
      await this.downloadPlugin(pluginName, manifest, installPath);

      // 更新注册表
      const now = new Date();
      this.installedPlugins.set(manifest.name, {
        id: manifest.name,
        name: manifest.name,
        version: manifest.version,
        path: installPath,
        installedAt: existing?.installedAt || now,
        updatedAt: now,
        enabled: true,
      });

      await this.saveRegistry();

      logger.info(`Plugin ${pluginName} v${manifest.version} installed successfully`);

      return {
        success: true,
        message: `Installed ${pluginName} v${manifest.version}`,
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
    try {
      const plugin = this.getInstalled(pluginName) as InstalledPlugin | null;
      if (!plugin) {
        return {
          success: false,
          message: `Plugin ${pluginName} is not installed.`,
        };
      }

      // 检查是否有其他 Plugin 依赖此 Plugin
      const dependents = await this.findDependents(pluginName);
      if (dependents.length > 0) {
        return {
          success: false,
          message: `Cannot uninstall: ${pluginName} is required by ${dependents.join(', ')}`,
        };
      }

      // 删除文件
      await fs.rm(plugin.path, { recursive: true, force: true });

      // 更新注册表
      this.installedPlugins.delete(pluginName);
      await this.saveRegistry();

      logger.info(`Plugin ${pluginName} uninstalled`);

      return {
        success: true,
        message: `Uninstalled ${pluginName}`,
      };
    } catch (error) {
      logger.error(`Failed to uninstall plugin: ${pluginName}`, { error });
      return {
        success: false,
        message: `Uninstall failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * 获取已安装的 Plugin
   */
  getInstalled(pluginName?: string): InstalledPlugin | InstalledPlugin[] | null {
    if (pluginName) {
      return this.installedPlugins.get(pluginName) || null;
    }
    return Array.from(this.installedPlugins.values());
  }

  /**
   * 列出所有已安装的 Plugin
   */
  list(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * 检查依赖
   */
  async checkDependencies(manifest: PluginManifest): Promise<PluginDependency[]> {
    const deps: PluginDependency[] = [];

    if (!manifest.dependencies) {
      return deps;
    }

    for (const [name, versionRange] of Object.entries(manifest.dependencies)) {
      const installed = this.getInstalled(name) as InstalledPlugin | null;

      deps.push({
        name,
        versionRange,
        installed: !!installed,
        installedVersion: installed?.version,
        satisfied: installed ? this.checkVersion(installed.version, versionRange) : false,
      });
    }

    return deps;
  }

  /**
   * 检查版本是否满足范围
   */
  private checkVersion(version: string, range: string): boolean {
    // 简化版本：仅支持精确匹配和通配符
    if (range === '*' || range === 'latest') return true;
    if (range.startsWith('^')) {
      // 简单 semver 检查
      const minVersion = range.slice(1);
      return version >= minVersion;
    }
    return version === range;
  }

  /**
   * 查找依赖某个 Plugin 的其他 Plugin
   */
  async findDependents(pluginName: string): Promise<string[]> {
    const dependents: string[] = [];

    for (const [name, plugin] of this.installedPlugins) {
      const manifest = await this.loadManifest(plugin.path);
      if (manifest?.dependencies?.[pluginName]) {
        dependents.push(name);
      }
    }

    return dependents;
  }

  /**
   * 获取 Plugin manifest
   */
  async fetchManifest(pluginName: string, version?: string): Promise<PluginManifest | null> {
    // 从本地已安装的 Plugin 获取
    const installed = this.getInstalled(pluginName) as InstalledPlugin | null;
    if (installed) {
      return this.loadManifest(installed.path);
    }

    // TODO: 从远程 registry 获取
    return null;
  }

  /**
   * 加载本地 Plugin manifest
   */
  async loadManifest(pluginPath: string): Promise<PluginManifest | null> {
    try {
      const manifestPath = path.join(pluginPath, 'manifest.yaml');
      if (await fileExists(manifestPath)) {
        return (await readYaml(manifestPath)) as PluginManifest;
      }

      const jsonPath = path.join(pluginPath, 'manifest.json');
      if (await fileExists(jsonPath)) {
        const content = await fs.readFile(jsonPath, 'utf-8');
        return JSON.parse(content) as PluginManifest;
      }

      return null;
    } catch (error) {
      logger.error('Failed to load plugin manifest', { error, pluginPath });
      return null;
    }
  }

  /**
   * 下载 Plugin
   */
  private async downloadPlugin(
    pluginName: string,
    manifest: PluginManifest,
    targetPath: string
  ): Promise<void> {
    // TODO: 实现从远程下载
    // 目前仅创建 manifest 文件
    await writeYaml(path.join(targetPath, 'manifest.yaml'), manifest);
  }

  /**
   * 创建 Plugin 资产
   */
  createAsset(manifest: PluginManifest): PluginAsset {
    return createAsset(AssetType.PLUGIN, manifest.name, {
      manifest,
      assets: {
        agents: manifest.assets?.agents || [],
        skills: manifest.assets?.skills || [],
        prompts: manifest.assets?.prompts || [],
        flows: manifest.assets?.flows || [],
      },
    } as any) as PluginAsset;
  }


/**
 * 创建 Plugin 管理器
 */
export function createPluginManager(aclDir: string): PluginManager {
  return new PluginManager(aclDir);
}
