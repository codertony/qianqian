/**
 * CLI Command - init
 * 
 * 初始化配置命令
 * acl init [--repo <github-url>]
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import * as path from 'path';
import { ensureDir, fileExists } from '../../shared/utils';
import { writeConfig } from '../config-manager';
import { APP_NAME } from '../../shared/constants';

interface InitOptions {
  repo?: string;
  force?: boolean;
  verbose?: boolean;
}

export function initCommand(): Command {
  const command = new Command('init');
  
  command
    .description('初始化项目配置')
    .option('-r, --repo <url>', 'GitHub 仓库 URL')
    .option('-f, --force', '强制重新初始化')
    .option('-v, --verbose', '详细输出')
    .action(async (options: InitOptions) => {
      console.log(`🚀 初始化 ${APP_NAME}...\n`);
      
      const configPath = path.join(process.cwd(), '.acl', 'config.yaml');
      
      // 检查是否已初始化
      if (await fileExists(configPath)) {
        if (!options.force) {
          console.log('⚠️  配置已存在，使用 --force 重新初始化');
          return;
        }
      }
      
      // 交互式配置
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoUrl',
          message: 'GitHub 仓库 URL:',
          default: options.repo,
          when: !options.repo,
          validate: (input: string) => {
            if (!input) return '请输入仓库 URL';
            if (!input.includes('github.com')) return '请输入有效的 GitHub URL';
            return true;
          },
        },
        {
          type: 'list',
          name: 'syncPolicy',
          message: '默认同步策略:',
          choices: [
            { name: '智能合并 (merge)', value: 'merge' },
            { name: '云端优先 (full)', value: 'full' },
            { name: '本地优先 (local)', value: 'local' },
            { name: '手动解决 (manual)', value: 'manual' },
          ],
          default: 'merge',
        },
        {
          type: 'confirm',
          name: 'autoSync',
          message: '启用自动同步?',
          default: false,
        },
        {
          type: 'checkbox',
          name: 'platforms',
          message: '选择要同步的平台:',
          choices: [
            { name: 'Cursor', value: 'cursor', checked: true },
            { name: 'OpenCode', value: 'opencode', checked: true },
            { name: 'Claude Code', value: 'claude-code' },
          ],
        },
      ]);
      
      // 创建配置
      const config = {
        version: '1.0.0',
        repository: {
          url: options.repo || answers.repoUrl,
          branch: 'main',
          localPath: path.join(process.cwd(), '.acl', 'assets'),
        },
        sync: {
          autoSync: answers.autoSync,
          syncPolicy: answers.syncPolicy,
          defaultPlatforms: answers.platforms,
          excludePatterns: [],
          conflictResolution: answers.syncPolicy,
        },
        platforms: {},
        features: {
          aiExtraction: true,
          autoSync: answers.autoSync,
          conflictNotification: true,
          telemetry: false,
        },
      };
      
      // 写入配置
      await ensureDir(path.dirname(configPath));
      await writeConfig(configPath, config);
      
      console.log('\n✅ 初始化完成!');
      console.log(`\n配置文件: ${configPath}`);
      console.log('\n下一步:');
      console.log('  1. 编辑 .acl/config.yaml 自定义配置');
      console.log('  2. 运行 `acl capture` 捕获能力');
      console.log('  3. 运行 `acl sync` 同步到本地平台');
    });
  
  return command;
}
