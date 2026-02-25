/**
 * CLI Command - commit
 * 
 * 智能提交命令，支持 AI 生成 Commit Message
 * acl commit [--ai] [--message <message>]
 * 
 * @module commit-command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { createAIProviderFactory, AIProviderType } from '../../features/ai';
import { GitSyncEngine, createGitSyncEngine } from '../../core/sync/git-sync-engine';
import { logger } from '../../shared/logger';
import { getSpinner, promptConfirm, promptInput } from '../utils';
import { loadConfig } from '../../config/loader';

interface CommitOptions {
  message?: string;
  ai?: boolean;
  amend?: boolean;
  verbose?: boolean;
}

/**
 * 获取 Git diff
 */
async function getGitDiff(git: GitSyncEngine, stagedOnly = true): Promise<string> {
  try {
    // 使用 simple-git 获取状态
    const status = await (git as any).git.status();
    
    let diff = '';
    
    if (stagedOnly) {
      diff = `Staged files:\n${status.staged.join('\n')}`;
    } else {
      diff = `Modified files:\n${status.modified.join('\n')}`;
      diff += `\n\nStaged files:\n${status.staged.join('\n')}`;
    }
    
    return diff;
  } catch (error) {
    logger.error('Failed to get git diff', { error });
    return '';
  }
}

/**
 * 初始化 AI 工厂
 */
function initAIFactory() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  const providerType = process.env.ANTHROPIC_API_KEY 
    ? AIProviderType.ANTHROPIC 
    : AIProviderType.OPENAI;
  
  return createAIProviderFactory({
    defaultProvider: providerType,
    providers: [{
      type: providerType,
      apiKey,
    }],
  });
}

/**
 * 使用 AI 生成 Commit Message
 */
async function generateCommitMessageWithAI(
  diff: string,
  factory: ReturnType<typeof initAIFactory>
): Promise<string | null> {
  if (!factory) {
    return null;
  }
  
  try {
    const message = await factory.generateCommitMessage(diff);
    return message;
  } catch (error) {
    logger.error('Failed to generate commit message with AI', { error });
    return null;
  }
}

export function commitCommand(): Command {
  const command = new Command('commit');
  
  command
    .description('提交更改到仓库 (支持 AI 生成 Commit Message)')
    .alias('ci')
    .option('-m, --message <message>', '提交信息')
    .option('--ai', '使用 AI 生成 Commit Message')
    .option('--amend', '修改上一次提交')
    .option('-v, --verbose', '详细输出')
    .action(async (options: CommitOptions) => {
      const spinner = getSpinner();
            spinner.start('检查仓库状态...');
      
      try {
        // 1. 加载配置
        const config = await loadConfig();
        
        // 2. 初始化 Git 引擎
        const git = createGitSyncEngine(config);
        
        // 3. 检查仓库状态
        const status = await git.getStatus();
        
        if (status.staged.length === 0 && status.modified.length === 0) {
          spinner.warn('没有需要提交的更改');
          return;
        }
        
        spinner.succeed(`发现 ${status.staged.length} 个已暂存文件, ${status.modified.length} 个修改文件`);
        
        // 4. 确定 Commit Message
        let commitMessage: string | undefined = options.message;
        
        if (options.ai || !commitMessage) {
          const aiFactory = initAIFactory();
          
          if (options.ai && !aiFactory) {
            console.log(chalk.yellow('\n⚠️  未配置 AI API Key'));
            console.log(chalk.gray('请设置 ANTHROPIC_API_KEY 或 OPENAI_API_KEY 环境变量'));
            console.log(chalk.gray('将使用默认提交信息'));
          }
          
          if (aiFactory) {
            const diffSpinner = getSpinner();
                  diffSpinner.start('AI 正在分析变更...');
            
            const diff = await getGitDiff(git);
            const generatedMessage = await generateCommitMessageWithAI(diff, aiFactory);
            
            diffSpinner.succeed('AI 分析完成');
            
            if (generatedMessage) {
              console.log(chalk.blue('\n🤖 AI 建议的提交信息:'));
              console.log(chalk.cyan(`  ${generatedMessage}`));
              
              const useAiMessage = await promptConfirm('\n是否使用此提交信息?', true);
              
              if (useAiMessage) {
                commitMessage = generatedMessage;
              }
            }
          }
        }
        
        // 5. 如果没有提交信息，提示用户输入
        if (!commitMessage) {
          commitMessage = await promptInput('\n请输入提交信息:');
          
          if (!commitMessage.trim()) {
            console.log(chalk.yellow('未提供提交信息，取消操作'));
            return;
          }
        }
        
        // 6. 执行提交
        const commitSpinner = getSpinner();
              commitSpinner.start('正在提交...');
        
        try {
          if (!commitMessage) {
            commitSpinner.fail('没有提交信息');
            return;
          }
          await git.createCommit(commitMessage);
          commitSpinner.succeed('提交成功');
          
          console.log(chalk.green(`\n✓ 已提交: ${commitMessage}`));
          
          // 7. 询问是否推送
          const shouldPush = await promptConfirm('是否推送到远程仓库?', false);
          
          if (shouldPush) {
            const pushSpinner = getSpinner();
                  pushSpinner.start('正在推送...');
            await git.push();
            pushSpinner.succeed('推送成功');
            console.log(chalk.green('\n✓ 已推送到远程仓库'));
          }
          
        } catch (error) {
          commitSpinner.fail('提交失败');
          throw error;
        }
        
      } catch (error) {
        spinner.fail('操作失败');
        logger.error('Commit command failed', { error });
        console.error(chalk.red(`\n错误: ${error instanceof Error ? error.message : '未知错误'}`));
        process.exit(1);
      }
    });
  
  return command;
}
