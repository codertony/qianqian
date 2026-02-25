/**
 * CLI - 命令注册器
 *
 * 命令注册和管理系统
 *
 * @module command-registry
 */

import { Command } from 'commander';
import { Config } from '../config/schema';
import { Logger, logger } from '../shared/logger';
import { CLIOptions } from '../shared/types';

/**
 * 命令上下文
 */
export interface CommandContext {
  /** 配置 */
  config?: Config;
  /** 日志记录器 */
  logger: Logger;
  /** CLI 选项 */
  options: CLIOptions;
  /** 工作目录 */
  cwd: string;
}

/**
 * 命令处理函数
 */
export type CommandHandler = (
  args: string[],
  options: Record<string, any>,
  context: CommandContext
) => Promise<void> | void;

/**
 * 命令定义
 */
export interface CommandDefinition {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description: string;
  /** 命令别名 */
  aliases?: string[];
  /** 参数定义 */
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
    defaultValue?: string;
  }>;
  /** 选项定义 */
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: any;
  }>;
  /** 命令处理函数 */
  handler: CommandHandler;
  /** 是否需要配置 */
  requireConfig?: boolean;
}

/**
 * 命令注册器
 */
export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();
  private context: CommandContext;

  constructor(context: Partial<CommandContext> = {}) {
    this.context = {
      logger: context.logger || logger,
      options: context.options || { verbose: false, dryRun: false, yes: false },
      cwd: context.cwd || process.cwd(),
      config: context.config,
    };
  }

  /**
   * 注册命令
   */
  register(def: CommandDefinition): void {
    if (this.commands.has(def.name)) {
      throw new Error(`Command "${def.name}" already registered`);
    }
    this.commands.set(def.name, def);
  }

  /**
   * 获取命令定义
   */
  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  /**
   * 获取所有命令
   */
  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * 检查命令是否存在
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * 构建 Commander 命令
   */
  buildCommand(def: CommandDefinition): Command {
    let cmd = new Command(def.name);

    cmd.description(def.description);

    // 添加别名
    if (def.aliases) {
      def.aliases.forEach((alias) => cmd.alias(alias));
    }

    // 添加参数
    if (def.arguments) {
      def.arguments.forEach((arg) => {
        const syntax = arg.required
          ? `<${arg.name}>`
          : `[${arg.name}]`;
        cmd.argument(syntax, arg.description, arg.defaultValue);
      });
    }

    // 添加选项
    if (def.options) {
      def.options.forEach((opt) => {
        cmd.option(opt.flags, opt.description, opt.defaultValue);
      });
    }

    // 添加全局选项
    cmd.option('--verbose', '启用详细输出');
    cmd.option('--dry-run', '模拟运行，不实际执行');
    cmd.option('-y, --yes', '自动确认所有提示');

    // 设置处理函数
    cmd.action(async (...args) => {
      const options = args[args.length - 1];
      const commandArgs = args.slice(0, -1);

      // 更新上下文
      const context: CommandContext = {
        ...this.context,
        options: {
          verbose: options.verbose || false,
          dryRun: options.dryRun || false,
          yes: options.yes || false,
        },
      };

      // 如果命令需要配置，加载配置
      if (def.requireConfig && !context.config) {
        const { loadConfig } = await import('../config/loader');
        try {
          context.config = await loadConfig();
        } catch (error) {
          context.logger.error(
            'Failed to load configuration. Run "acl init" first.'
          );
          process.exit(1);
        }
      }

      try {
        await def.handler(commandArgs, options, context);
      } catch (error) {
        context.logger.error(
          error instanceof Error ? error.message : String(error)
        );
        if (context.options.verbose && error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

    return cmd;
  }

  /**
   * 将所有命令添加到 Commander 程序
   */
  setupProgram(program: Command): void {
    for (const def of this.commands.values()) {
      const cmd = this.buildCommand(def);
      program.addCommand(cmd);
    }
  }
}

/**
 * 全局命令注册器实例
 */
export const commandRegistry = new CommandRegistry();

/**
 * 注册命令的便捷函数
 */
export function registerCommand(def: CommandDefinition): void {
  commandRegistry.register(def);
}
