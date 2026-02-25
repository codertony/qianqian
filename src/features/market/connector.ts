/**
 * Market Connector - 市场连接器
 *
 * 从外部市场抓取 Plugin
 *
 * @module market-connector
 */

import { PluginManifest, PluginMarketInfo } from '../plugin/types';
import { logger } from '../../shared/logger';

/**
 * 市场连接器
 */
export class MarketConnector {
  private sources: Map<string, MarketSource> = new Map();

  constructor() {
    // 注册内置市场源
    this.registerSource(new GitHubMarketSource());
    this.registerSource(new ClawHubMarketSource());
  }

  /**
   * 注册市场源
   */
  registerSource(source: MarketSource): void {
    this.sources.set(source.name, source);
    logger.debug(`Registered market source: ${source.name}`);
  }

  /**
   * 从 URL 获取 Plugin
   */
  async fetchFromUrl(url: string): Promise<{
    manifest: PluginManifest | null;
    source: string;
    compatible: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // 识别 URL 类型
    const source = this.identifySource(url);
    if (!source) {
      return {
        manifest: null,
        source: 'unknown',
        compatible: false,
        warnings: ['Unrecognized source URL'],
      };
    }

    try {
      // 获取 manifest
      const manifest = await source.fetchManifest(url);
      if (!manifest) {
        return {
          manifest: null,
          source: source.name,
          compatible: false,
          warnings: ['Failed to fetch plugin manifest'],
        };
      }

      // 兼容性检查
      const compatibility = this.checkCompatibility(manifest);

      return {
        manifest,
        source: source.name,
        compatible: compatibility.compatible,
        warnings: compatibility.warnings,
      };
    } catch (error) {
      logger.error(`Failed to fetch from ${url}`, { error });
      return {
        manifest: null,
        source: source.name,
        compatible: false,
        warnings: [`Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * 搜索 Plugin
   */
  async search(
    keyword: string,
    options: { source?: string; limit?: number } = {}
  ): Promise<PluginMarketInfo[]> {
    const results: PluginMarketInfo[] = [];
    const limit = options.limit || 10;

    const sourcesToSearch = options.source
      ? [this.sources.get(options.source)].filter(Boolean) as MarketSource[]
      : Array.from(this.sources.values());

    for (const source of sourcesToSearch) {
      try {
        const sourceResults = await source.search(keyword, limit);
        results.push(...sourceResults);
      } catch (error) {
        logger.warn(`Failed to search ${source.name}`, { error });
      }
    }

    return results.slice(0, limit);
  }

  /**
   * 识别 URL 来源
   */
  private identifySource(url: string): MarketSource | null {
    for (const source of this.sources.values()) {
      if (source.canHandle(url)) {
        return source;
      }
    }
    return null;
  }

  /**
   * 检查兼容性
   */
  private checkCompatibility(manifest: PluginManifest): {
    compatible: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // 检查必需字段
    if (!manifest.name) {
      warnings.push('Missing required field: name');
    }
    if (!manifest.version) {
      warnings.push('Missing required field: version');
    }

    // 检查版本格式
    if (manifest.version && !this.isValidVersion(manifest.version)) {
      warnings.push(`Invalid version format: ${manifest.version}`);
    }

    // 检查兼容性矩阵
    if (manifest.compatibility) {
      const globalStatus = manifest.compatibility.global?.status;
      if (globalStatus === 'none') {
        warnings.push('Plugin is marked as incompatible with all platforms');
      }
    }

    return {
      compatible: warnings.length === 0,
      warnings,
    };
  }

  /**
   * 验证版本格式
   */
  private isValidVersion(version: string): boolean {
    // 简单 semver 验证
    return /^\d+\.\d+\.\d+/.test(version);
  }
}

/**
 * 市场源接口
 */
export interface MarketSource {
  /** 源名称 */
  name: string;
  /** 能否处理该 URL */
  canHandle(url: string): boolean;
  /** 获取 manifest */
  fetchManifest(url: string): Promise<PluginManifest | null>;
  /** 搜索 Plugin */
  search(keyword: string, limit: number): Promise<PluginMarketInfo[]>;
}

/**
 * GitHub 市场源
 */
class GitHubMarketSource implements MarketSource {
  name = 'github';

  canHandle(url: string): boolean {
    return url.includes('github.com');
  }

  async fetchManifest(url: string): Promise<PluginManifest | null> {
    // TODO: 实现 GitHub API 调用
    // 目前返回模拟数据
    logger.debug(`Fetching from GitHub: ${url}`);
    return null;
  }

  async search(keyword: string, limit: number): Promise<PluginMarketInfo[]> {
    // TODO: 实现 GitHub 搜索
    return [];
  }
}

/**
 * ClawHub 市场源
 */
class ClawHubMarketSource implements MarketSource {
  name = 'clawhub';

  canHandle(url: string): boolean {
    return url.includes('clawhub.dev') || url.includes('clawhub.com');
  }

  async fetchManifest(url: string): Promise<PluginManifest | null> {
    // TODO: 实现 ClawHub API 调用
    logger.debug(`Fetching from ClawHub: ${url}`);
    return null;
  }

  async search(keyword: string, limit: number): Promise<PluginMarketInfo[]> {
    // TODO: 实现 ClawHub 搜索
    return [];
  }
}

/**
 * 创建市场连接器
 */
export function createMarketConnector(): MarketConnector {
  return new MarketConnector();
}
