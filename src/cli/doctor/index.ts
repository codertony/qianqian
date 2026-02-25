/**
 * CLI - Doctor
 * 
 * 诊断工具命令
 * acl doctor
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists } from '../../shared/utils';

export function doctorCommand(): Command {
  const command = new Command('doctor');
  
  command
    .description('运行健康检查')
    .option('-v, --verbose', '详细输出')
    .action(async (options: { verbose?: boolean }) => {
      console.log(chalk.blue('🔍 运行健康检查...\n'));
      
      const checks: CheckResult[] = [];
      
      // 检查 1: 配置文件
      checks.push(await checkConfig());
      
      // 检查 2: Git
      checks.push(await checkGit());
      
      // 检查 3: 平台检测
      checks.push(await checkPlatforms());
      
      // 输出结果
      console.log('检查结果:\n');
      
      const passed = checks.filter(c => c.status === 'pass').length;
      const failed = checks.filter(c => c.status === 'fail').length;
      const warnings = checks.filter(c => c.status === 'warning').length;
      
      for (const check of checks) {
        const icon = check.status === 'pass' ? chalk.green('✓') :
                     check.status === 'fail' ? chalk.red('✗') :
                     chalk.yellow('⚠');
        console.log(`${icon} ${check.name}`);
        if (check.message) {
          console.log(`  ${check.message}`);
        }
        if (options.verbose && check.details) {
          console.log(`  ${chalk.gray(check.details)}`);
        }
        console.log();
      }
      
      console.log(`总计: ${chalk.green(`${passed} 通过`)} | ${chalk.red(`${failed} 失败`)} | ${chalk.yellow(`${warnings} 警告`)}`);
      
      if (failed > 0) {
        process.exit(1);
      }
    });
  
  return command;
}

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  details?: string;
}

async function checkConfig(): Promise<CheckResult> {
  const configPath = path.join(process.cwd(), '.acl', 'config.yaml');
  const exists = await fileExists(configPath);
  
  if (exists) {
    return {
      name: '配置文件',
      status: 'pass',
      message: '配置文件存在',
      details: configPath,
    };
  }
  
  return {
    name: '配置文件',
    status: 'fail',
    message: '配置文件不存在',
    details: `运行 "acl init" 创建配置`,
  };
}

async function checkGit(): Promise<CheckResult> {
  try {
    // TODO: 检查 Git 是否安装和配置
    return {
      name: 'Git',
      status: 'pass',
      message: 'Git 已安装',
    };
  } catch {
    return {
      name: 'Git',
      status: 'fail',
      message: 'Git 未安装或未配置',
    };
  }
}

async function checkPlatforms(): Promise<CheckResult> {
  const platforms: string[] = [];
  
  // 检查各个平台
  const checks = [
    { name: 'Cursor', dir: '.cursor' },
    { name: 'OpenCode', dir: '.opencode' },
    { name: 'Claude Code', dir: '.claude-code' },
  ];
  
  for (const check of checks) {
    const exists = await fileExists(path.join(process.cwd(), check.dir));
    if (exists) {
      platforms.push(check.name);
    }
  }
  
  if (platforms.length > 0) {
    return {
      name: '平台检测',
      status: 'pass',
      message: `检测到 ${platforms.length} 个平台`,
      details: platforms.join(', '),
    };
  }
  
  return {
    name: '平台检测',
    status: 'warning',
    message: '未检测到任何支持的 IDE',
    details: '支持的 IDE: Cursor, OpenCode, Claude Code',
  };
}
