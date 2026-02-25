/**
 * Compatibility System - 兼容性检查器
 *
 * @module compatibility-system
 */

import { PluginManifest, PlatformCompatibility, CompatibilityMatrix } from '../plugin/types';
import { logger } from '../../shared/logger';

/**
 * 兼容性检查器
 */
export class CompatibilityChecker {
  private platformVersions: Map<string, string> = new Map();

  /**
   * 注册平台版本
   */
  registerPlatform(platform: string, version: string): void {
    this.platformVersions.set(platform, version);
    logger.debug(`Registered platform: ${platform} v${version}`);
  }

  /**
   * 检查 Plugin 兼容性
   */
  checkPlugin(
    manifest: PluginManifest,
    targetPlatform: string
  ): {
    compatible: boolean;
    level: 'full' | 'partial' | 'none';
    missingFeatures: string[];
    notes: string;
  } {
    const platformVersion = this.platformVersions.get(targetPlatform);
    if (!platformVersion) {
      return {
        compatible: false,
        level: 'none',
        missingFeatures: [],
        notes: `Unknown platform: ${targetPlatform}`,
      };
    }

    // 获取兼容性矩阵
    const matrix = manifest.compatibility;
    if (!matrix) {
      // 没有兼容性信息，假设完全兼容
      return {
        compatible: true,
        level: 'full',
        missingFeatures: [],
        notes: 'No compatibility matrix provided, assuming full compatibility',
      };
    }

    // 检查全局兼容性
    if (matrix.global) {
      const globalCheck = this.checkCompatibilityLevel(matrix.global, platformVersion);
      if (globalCheck.status !== 'full') {
        return {
          compatible: globalCheck.status !== 'none',
          level: globalCheck.status,
          missingFeatures: matrix.global.missingFeatures || [],
          notes: matrix.global.notes || `Global compatibility: ${globalCheck.status}`,
        };
      }
    }

    // 检查平台特定兼容性
    const platformCompat = matrix.platforms?.[targetPlatform];
    if (platformCompat) {
      const platformCheck = this.checkCompatibilityLevel(platformCompat, platformVersion);
      return {
        compatible: platformCheck.status !== 'none',
        level: platformCheck.status,
        missingFeatures: platformCompat.missingFeatures || [],
        notes: platformCompat.notes || `Platform compatibility: ${platformCheck.status}`,
      };
    }

    // 没有特定平台信息，假设兼容
    return {
      compatible: true,
      level: 'full',
      missingFeatures: [],
      notes: 'No platform-specific compatibility info, assuming compatible',
    };
  }

  /**
   * 检查 Agent 级别兼容性
   */
  checkAgent(
    manifest: PluginManifest,
    agentName: string,
    targetPlatform: string
  ): {
    compatible: boolean;
    level: 'full' | 'partial' | 'none';
    reason?: string;
  } {
    const agentCompat = manifest.compatibility?.agents?.[agentName]?.[targetPlatform];

    if (!agentCompat) {
      // 回退到 Plugin 级别检查
      const pluginCheck = this.checkPlugin(manifest, targetPlatform);
      return {
        compatible: pluginCheck.compatible,
        level: pluginCheck.level,
      };
    }

    return {
      compatible: agentCompat.status !== 'none',
      level: agentCompat.status,
      reason: agentCompat.notes,
    };
  }

  /**
   * 生成兼容性报告
   */
  generateReport(manifest: PluginManifest): {
    global: string;
    platforms: Record<string, { status: string; notes?: string }>;
    summary: {
      totalPlatforms: number;
      fullSupport: number;
      partialSupport: number;
      noSupport: number;
    };
  } {
    const platforms: Record<string, { status: string; notes?: string }> = {};

    if (manifest.compatibility?.platforms) {
      for (const [platform, compat] of Object.entries(manifest.compatibility.platforms)) {
        platforms[platform] = {
          status: compat.status,
          notes: compat.notes,
        };
      }
    }

    const summary = {
      totalPlatforms: Object.keys(platforms).length,
      fullSupport: Object.values(platforms).filter((p) => p.status === 'full').length,
      partialSupport: Object.values(platforms).filter((p) => p.status === 'partial').length,
      noSupport: Object.values(platforms).filter((p) => p.status === 'none').length,
    };

    return {
      global: manifest.compatibility?.global?.status || 'unknown',
      platforms,
      summary,
    };
  }

  /**
   * 检查兼容性级别
   */
  private checkCompatibilityLevel(
    compat: PlatformCompatibility,
    platformVersion: string
  ): { status: 'full' | 'partial' | 'none' } {
    // 检查版本要求
    if (compat.version && !this.checkVersion(platformVersion, compat.version)) {
      return { status: 'none' };
    }

    return { status: compat.status };
  }

  /**
   * 检查版本是否满足要求
   */
  private checkVersion(currentVersion: string, requiredVersion: string): boolean {
    // 简化版本比较
    if (requiredVersion.startsWith('>=')) {
      const minVersion = requiredVersion.slice(2);
      return this.compareVersions(currentVersion, minVersion) >= 0;
    }
    if (requiredVersion.startsWith('>')) {
      const minVersion = requiredVersion.slice(1);
      return this.compareVersions(currentVersion, minVersion) > 0;
    }
    return this.compareVersions(currentVersion, requiredVersion) === 0;
  }

  /**
   * 比较版本号
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}

/**
 * 创建兼容性检查器
 */
export function createCompatibilityChecker(): CompatibilityChecker {
  return new CompatibilityChecker();
}
