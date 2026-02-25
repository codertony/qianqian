/**
 * CLI - 命令入口
 *
 * 参考 oh-my-opencode 的 CLI 设计
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { captureCommand } from './commands/capture.js';
import { syncCommand } from './commands/sync.js';
import { pullCommand } from './commands/pull.js';
import { pushCommand } from './commands/push.js';
import { statusCommand } from './commands/status.js';
import { listCommand } from './commands/list.js';
import { showCommand } from './commands/show.js';
import { diffCommand } from './commands/diff.js';
import { commitCommand } from './commands/commit.js';
import { configCommand } from './config-manager/index.js';
import { doctorCommand } from './doctor/index.js';
import { APP_NAME, APP_DISPLAY_NAME, APP_VERSION, APP_DESCRIPTION } from '../shared/constants/index.js';

// 创建 CLI 程序
export function createCLI(): Command {
  const program = new Command();

  program
    .name(APP_NAME)
    .description(APP_DESCRIPTION)
    .version(APP_VERSION, '-v, --version', '显示版本号')
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
  program.addCommand(commitCommand());
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
export * from './commands/init.js';
export * from './commands/capture.js';
export * from './commands/sync.js';
export * from './commands/pull.js';
export * from './commands/push.js';
export * from './commands/status.js';
export * from './commands/list.js';
export * from './commands/show.js';
export * from './commands/diff.js';
export * from './commands/commit.js';
