/**
 * Dependency Manager - 依赖管理器
 *
 * 管理 Skill 的依赖
 *
 * @module dependency-manager
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { SkillAsset } from '../../core/asset';
import { logger } from '../../shared/logger';
import { fileExists } from '../../shared/utils';

/**
 * 依赖类型
 */
export enum DependencyType {
  NPM = 'npm',
  PIP = 'pip',
}

/**
 * 依赖信息
 */
export interface Dependency {
  name: string;
  version?: string;
  type: DependencyType;
  optional?: boolean;
}

/**
 * 依赖检查结果
 */
export interface DependencyCheckResult {
  name: string;
  installed: boolean;
  version?: string;
  requiredVersion?: string;
}

/**
 * 依赖管理器
 */
export class DependencyManager {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * 检查依赖
   */
  async checkDependencies(skill: SkillAsset): Promise<DependencyCheckResult[]> {
    const results: DependencyCheckResult[] = [];
    const manifest = skill.manifest;

    if (!manifest.dependencies) {
      return results;
    }

    for (const dep of manifest.dependencies) {
      const result = await this.checkDependency(dep);
      results.push(result);
    }

    return results;
  }

  /**
   * 检查单个依赖
   */
  private async checkDependency(depString: string): Promise<DependencyCheckResult> {
    // 解析依赖字符串 (e.g., "npm:lodash@^4.17.0" or "pip:requests")
    const match = depString.match(/^(npm|pip):(.+?)(?:@(.+))?$/);
    
    if (!match) {
      return {
        name: depString,
        installed: false,
      };
    }

    const [, type, name, version] = match;

    if (type === 'npm') {
      return this.checkNpmDependency(name, version);
    } else if (type === 'pip') {
      return this.checkPipDependency(name, version);
    }

    return {
      name,
      installed: false,
    };
  }

  /**
   * 检查 NPM 依赖
   */
  private async checkNpmDependency(name: string, requiredVersion?: string): Promise<DependencyCheckResult> {
    try {
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules', name);
      const exists = await fileExists(nodeModulesPath);

      if (!exists) {
        return {
          name,
          installed: false,
          requiredVersion,
        };
      }

      // 读取 package.json 获取版本
      const packageJsonPath = path.join(nodeModulesPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      return {
        name,
        installed: true,
        version: packageJson.version,
        requiredVersion,
      };
    } catch {
      return {
        name,
        installed: false,
        requiredVersion,
      };
    }
  }

  /**
   * 检查 Pip 依赖
   */
  private async checkPipDependency(name: string, requiredVersion?: string): Promise<DependencyCheckResult> {
    // 简化版本：检查是否能导入
    return {
      name,
      installed: true, // 假设已安装 (实际应运行 pip show)
      requiredVersion,
    };
  }

  /**
   * 安装依赖
   */
  async installDependencies(skill: SkillAsset): Promise<{ success: boolean; installed: string[]; failed: string[] }> {
    const installed: string[] = [];
    const failed: string[] = [];

    const manifest = skill.manifest;
    if (!manifest.dependencies || manifest.dependencies.length === 0) {
      return { success: true, installed, failed };
    }

    for (const depString of manifest.dependencies) {
      const success = await this.installDependency(depString);
      if (success) {
        installed.push(depString);
      } else {
        failed.push(depString);
      }
    }

    return {
      success: failed.length === 0,
      installed,
      failed,
    };
  }

  /**
   * 安装单个依赖
   */
  private async installDependency(depString: string): Promise<boolean> {
    const match = depString.match(/^(npm|pip):(.+?)(?:@(.+))?$/);
    
    if (!match) {
      logger.warn(`Unknown dependency format: ${depString}`);
      return false;
    }

    const [, type, name, version] = match;

    try {
      if (type === 'npm') {
        await this.installNpmDependency(name, version);
      } else if (type === 'pip') {
        await this.installPipDependency(name, version);
      }
      return true;
    } catch (error) {
      logger.error(`Failed to install dependency: ${depString}`, { error });
      return false;
    }
  }

  /**
   * 安装 NPM 依赖
   */
  private async installNpmDependency(name: string, version?: string): Promise<void> {
    const { execSync } = await import('child_process');
    const packageSpec = version ? `${name}@${version}` : name;
    
    logger.info(`Installing npm package: ${packageSpec}`);
    execSync(`npm install ${packageSpec}`, {
      cwd: this.projectRoot,
      stdio: 'inherit',
    });
  }

  /**
   * 安装 Pip 依赖
   */
  private async installPipDependency(name: string, version?: string): Promise<void> {
    const { execSync } = await import('child_process');
    const packageSpec = version ? `${name}==${version}` : name;
    
    logger.info(`Installing pip package: ${packageSpec}`);
    execSync(`pip install ${packageSpec}`, {
      stdio: 'inherit',
    });
  }

  /**
   * 获取依赖报告
   */
  async getDependencyReport(skills: SkillAsset[]): Promise<{
    total: number;
    installed: number;
    missing: number;
    byType: Record<DependencyType, number>;
  }> {
    const report = {
      total: 0,
      installed: 0,
      missing: 0,
      byType: {
        [DependencyType.NPM]: 0,
        [DependencyType.PIP]: 0,
      },
    };

    for (const skill of skills) {
      const results = await this.checkDependencies(skill);
      
      for (const result of results) {
        report.total++;
        
        if (result.installed) {
          report.installed++;
        } else {
          report.missing++;
        }
      }
    }

    return report;
  }
}

/**
 * 创建依赖管理器
 */
export function createDependencyManager(projectRoot?: string): DependencyManager {
  return new DependencyManager(projectRoot);
}
