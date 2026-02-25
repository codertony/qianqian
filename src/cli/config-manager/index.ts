/**
 * CLI - Config Manager
 * 
 * 配置管理命令
 * acl config [get|set|list]
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { getGlobalConfigPath, getConfigDir, ensureDir } from '../../shared/utils';

export function configCommand(): Command {
  const command = new Command('config');
  
  command
    .description('管理配置');
  
  // config get
  command
    .command('get <key>')
    .description('获取配置项')
    .option('-g, --global', '使用全局配置')
    .action(async (key: string, options: { global?: boolean }) => {
      const configPath = options.global 
        ? getGlobalConfigPath()
        : path.join(process.cwd(), '.acl', 'config.yaml');
      
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const config = yaml.load(content) as Record<string, unknown>;
        
        const value = key.split('.').reduce((obj, k) => {
          return obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined;
        }, config as unknown);
        
        if (value !== undefined) {
          console.log(value);
        } else {
          console.log(chalk.yellow(`配置项 "${key}" 不存在`));
        }
      } catch {
        console.log(chalk.red('配置文件不存在'));
      }
    });
  
  // config set
  command
    .command('set <key> <value>')
    .description('设置配置项')
    .option('-g, --global', '使用全局配置')
    .action(async (key: string, value: string, options: { global?: boolean }) => {
      const configPath = options.global 
        ? getGlobalConfigPath()
        : path.join(process.cwd(), '.acl', 'config.yaml');
      
      try {
        let config: Record<string, unknown> = {};
        
        try {
          const content = await fs.readFile(configPath, 'utf-8');
          config = yaml.load(content) as Record<string, unknown>;
        } catch {
          // 文件不存在，创建新配置
        }
        
        // 解析 JSON 值
        let parsedValue: unknown;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }
        
        // 设置嵌套值
        const keys = key.split('.');
        let current: Record<string, unknown> = config;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          if (!current[k] || typeof current[k] !== 'object') {
            current[k] = {};
          }
          current = current[k] as Record<string, unknown>;
        }
        
        current[keys[keys.length - 1]] = parsedValue;
        
        // 写入配置
        await ensureDir(path.dirname(configPath));
        await fs.writeFile(configPath, yaml.dump(config), 'utf-8');
        
        console.log(chalk.green(`✅ 已设置 ${key} = ${value}`));
      } catch (error) {
        console.log(chalk.red(`设置失败: ${error}`));
      }
    });
  
  // config list
  command
    .command('list')
    .description('列出所有配置')
    .option('-g, --global', '使用全局配置')
    .action(async (options: { global?: boolean }) => {
      const configPath = options.global 
        ? getGlobalConfigPath()
        : path.join(process.cwd(), '.acl', 'config.yaml');
      
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        console.log(content);
      } catch {
        console.log(chalk.yellow('配置文件不存在'));
      }
    });
  
  return command;
}

// 写入配置
export async function writeConfig(configPath: string, config: unknown): Promise<void> {
  await ensureDir(path.dirname(configPath));
  await fs.writeFile(configPath, yaml.dump(config), 'utf-8');
}
