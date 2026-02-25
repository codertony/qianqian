/**
 * CLI - 命令入口
 * 
 * 参考 oh-my-opencode 的 CLI 设计
 */

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { captureCommand } from './commands/capture';
import { syncCommand } from './commands/sync';
import { pullCommand } from './commands/pull';
import { pushCommand } from './commands/push';
import { statusCommand } from './commands/status';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { diffCommand } from './commands/diff';
import { configCommand } from './config-manager';
import { doctorCommand } from './doctor';
import { VERSION, NAME, DESCRIPTION } from '../shared/constants';

// 创建 CLI 程序
export function createCLI(): Command {
  const program = new Command();
  
  program
    .name(NAME)
    .description(DESCRIPTION)
    .version(VERSION, '-v, --version', '显示版本号')
    .helpOption('-h, --help', '显示帮助信息')
    .option('--verbose', '启用详细输出')
    .option('--config <path>', '指定配置文件路径');
  
  // 注册命令
  program.addCommand(initCommand());
  program.addCommand(captureCommand());
  program.addCommand(syncCommand());
  program.addCommand(pullCommand());
  program.addCommand(pushCommand());
  program.addCommand(statusCommand());
  program.addCommand(listCommand());
  program.addCommand(showCommand());
  program.addCommand(diffCommand());
  program.addCommand(configCommand());
  program.addCommand(doctorCommand());
  
  return program;
}

// 运行 CLI
export async function runCLI(argv: string[] = process.argv): Promise<void> {
  const program = createCLI();
  
  try {
    await program.parseAsync(argv);
  } catch (error) {
    console.error('错误:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 导出命令
export * from './commands/init';
export * from './commands/capture';
export * from './commands/sync';
export * from './commands/pull';
export * from './commands/push';
export * from './commands/status';
export * from './commands/list';
export * from './commands/show';
export * from './commands/diff';
