/**
 * Config - Loader
 *
 * 配置加载和管理系统
 *
 * @module config-loader
 */

import * as path from 'path';
import * as yaml from 'js-yaml';
import { Config, ConfigSchema, validateConfigSafe } from '../schema';
import { fileExists, readFile, resolveHome } from '../../shared/utils';
import { readYaml, readJson } from '../../shared/fs';
import { ConfigError, ValidationError } from '../../shared/errors';
import { logger } from '../../shared/logger';
import { ACL_DIR, CONFIG_FILE_JSONC } from '../../shared/constants';

/**
 * 配置加载选项
 */
export interface ConfigLoadOptions {
  /** 指定配置文件路径 */
  configPath?: string;
  /** 是否加载全局配置 */
  loadGlobal?: boolean;
  /** 是否加载项目配置 */
  loadProject?: boolean;
}

/**
 * 配置来源
 */
export interface ConfigSource {
  path: string;
  type: 'global' | 'project' | 'custom';
  config: Partial<Config>;
}

/**
 * 配置管理器
 */
export class ConfigLoader {
  private globalConfigPath: string;
  private projectConfigPath?: string;

  constructor() {
    this.globalConfigPath = this.getGlobalConfigPath();
  }

  /**
   * 获取全局配置路径
   */
  private getGlobalConfigPath(): string {
    const configDir = this.getConfigDir();
    return path.join(configDir, CONFIG_FILE_JSONC);
  }

  /**
   * 获取配置目录（遵循 XDG 规范）
   */
  private getConfigDir(): string {
    const home = process.env.HOME || process.env.USERPROFILE || '';

    if (process.env.XDG_CONFIG_HOME) {
      return path.join(process.env.XDG_CONFIG_HOME, 'acl');
    }

    if (process.platform === 'win32') {
      return path.join(process.env.APPDATA || home, 'acl');
    }

    if (process.platform === 'darwin') {
      return path.join(home, 'Library', 'Application Support', 'acl');
    }

    return path.join(home, '.config', 'acl');
  }

  /**
   * 查找项目配置文件
   */
  async findProjectConfig(startDir: string = process.cwd()): Promise<string | null> {
    let currentDir = startDir;

    while (true) {
      const configPath = path.join(currentDir, ACL_DIR, CONFIG_FILE_JSONC);
      if (await fileExists(configPath)) {
        return configPath;
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * 加载配置文件
   */
  private async loadConfigFile(filePath: string): Promise<Partial<Config> | null> {
    if (!(await fileExists(filePath))) {
      return null;
    }

    try {
      const ext = path.extname(filePath);

      if (ext === '.json' || ext === '.jsonc') {
        return (await readJson(filePath)) || null;
      } else if (ext === '.yaml' || ext === '.yml') {
        return (await readYaml(filePath)) || null;
      } else {
        // 尝试作为 JSON 解析
        const content = await readFile(filePath);
        try {
          return JSON.parse(content);
        } catch {
          // 尝试作为 YAML 解析
          return yaml.load(content) as Partial<Config>;
        }
      }
    } catch (error) {
      logger.warn(`Failed to load config from ${filePath}`, { error });
      return null;
    }
  }

  /**
   * 加载配置
   */
  async load(options: ConfigLoadOptions = {}): Promise<{
    config: Config;
    sources: ConfigSource[];
  }> {
    const sources: ConfigSource[] = [];

    // 1. 加载全局配置
    if (options.loadGlobal !== false) {
      const globalConfig = await this.loadConfigFile(this.globalConfigPath);
      if (globalConfig) {
        sources.push({
          path: this.globalConfigPath,
          type: 'global',
          config: globalConfig,
        });
        logger.debug('Loaded global config', { path: this.globalConfigPath });
      }
    }

    // 2. 加载项目配置
    let projectConfigPath = options.configPath;
    if (options.loadProject !== false && !projectConfigPath) {
      projectConfigPath = await this.findProjectConfig();
    }

    if (projectConfigPath) {
      this.projectConfigPath = projectConfigPath;
      const projectConfig = await this.loadConfigFile(projectConfigPath);
      if (projectConfig) {
        sources.push({
          path: projectConfigPath,
          type: 'project',
          config: projectConfig,
        });
        logger.debug('Loaded project config', { path: projectConfigPath });
      }
    }

    // 3. 合并配置（项目配置覆盖全局配置）
    const mergedConfig = this.mergeConfigs(
      sources.map((s) => s.config)
    );

    // 4. 应用环境变量覆盖
    this.applyEnvOverrides(mergedConfig);

    // 5. 验证配置
    const validationResult = validateConfigSafe(mergedConfig);
    if (!validationResult.success) {
      throw new ValidationError(
        'Configuration validation failed',
        'CONFIG_INVALID',
        { errors: validationResult.error.errors },
        validationResult.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      );
    }

    return {
      config: validationResult.data,
      sources,
    };
  }

  /**
   * 合并多个配置
   */
  private mergeConfigs(configs: Partial<Config>[]): Partial<Config> {
    return configs.reduce(
      (merged, config) => this.deepMerge(merged, config),
      {}
    );
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) {
      return target;
    }

    if (target === null || target === undefined) {
      return source;
    }

    if (typeof source !== 'object' || typeof target !== 'object') {
      return source;
    }

    if (Array.isArray(source)) {
      return source;
    }

    const result = { ...target };

    for (const key of Object.keys(source)) {
      if (key in target) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * 应用环境变量覆盖
   */
  private applyEnvOverrides(config: Partial<Config>): void {
    // ACL_REPO_URL
    if (process.env.ACL_REPO_URL) {
      if (!config.repository) config.repository = { url: '', localPath: '', branch: 'main' };
      config.repository.url = process.env.ACL_REPO_URL;
    }

    // ACL_REPO_BRANCH
    if (process.env.ACL_REPO_BRANCH) {
      if (!config.repository) config.repository = { url: '', localPath: '', branch: 'main' };
      config.repository.branch = process.env.ACL_REPO_BRANCH;
    }

    // ACL_SYNC_POLICY
    if (process.env.ACL_SYNC_POLICY) {
      if (!config.sync) config.sync = { autoSync: false, syncPolicy: 'merge', defaultPlatforms: [], excludePatterns: [], conflictResolution: 'manual' };
      config.sync.syncPolicy = process.env.ACL_SYNC_POLICY as any;
    }

    // ACL_LOG_LEVEL
    if (process.env.ACL_LOG_LEVEL) {
      // 日志级别由 logger 处理
    }
  }

  /**
   * 获取全局配置路径
   */
  getGlobalPath(): string {
    return this.globalConfigPath;
  }

  /**
   * 获取项目配置路径
   */
  getProjectPath(): string | undefined {
    return this.projectConfigPath;
  }
}

/**
 * 写入配置到文件
 */
export async function writeConfig(
  filePath: string,
  config: Partial<Config>
): Promise<void> {
  const normalizedPath = resolveHome(filePath);
  const dir = path.dirname(normalizedPath);

  // 确保目录存在
  if (!(await fileExists(dir))) {
    await fs.mkdir(dir, { recursive: true });
  }

  const ext = path.extname(normalizedPath);

  if (ext === '.yaml' || ext === '.yml') {
    await fs.writeFile(
      normalizedPath,
      yaml.dump(config, { indent: 2 }),
      'utf-8'
    );
  } else {
    // 默认使用 JSON
    await fs.writeFile(
      normalizedPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  logger.debug('Wrote config to file', { path: normalizedPath });
}

/**
 * 更新配置（合并现有配置）
 */
export async function updateConfig(
  filePath: string,
  updates: Partial<Config>
): Promise<Config> {
  const existing = (await readJson(filePath)) || {};
  const merged = { ...existing, ...updates };
  await writeConfig(filePath, merged);
  return merged as Config;
}

// 导入 fs 用于 writeConfig
import { promises as fs } from 'fs';
import { readJson } from '../../shared/fs';

/**
 * 全局配置加载器实例
 */
export const configLoader = new ConfigLoader();

/**
 * 加载配置的便捷函数
 */
export async function loadConfig(
  options?: ConfigLoadOptions
): Promise<Config> {
  const result = await configLoader.load(options);
  return result.config;
}

/**
 * 加载配置及来源的便捷函数
 */
export async function loadConfigWithSources(
  options?: ConfigLoadOptions
): Promise<{ config: Config; sources: ConfigSource[] }> {
  return configLoader.load(options);
}
