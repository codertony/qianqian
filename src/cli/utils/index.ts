/**
 * CLI - 工具函数
 *
 * 格式化输出、提示、进度指示等工具
 *
 * @module cli-utils
 */

import { createLogger, LogLevel } from '../../shared/logger';

// 创建 CLI 专用的日志记录器
export const cliLogger = createLogger({
  level: (process.env.ACL_LOG_LEVEL as LogLevel) || 'info',
  console: true,
});

// 颜色代码
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * 格式化成功消息
 */
export function success(message: string): string {
  return `${COLORS.green}✓${COLORS.reset} ${message}`;
}

/**
 * 格式化错误消息
 */
export function error(message: string): string {
  return `${COLORS.red}✗${COLORS.reset} ${message}`;
}

/**
 * 格式化警告消息
 */
export function warning(message: string): string {
  return `${COLORS.yellow}⚠${COLORS.reset} ${message}`;
}

/**
 * 格式化信息消息
 */
export function info(message: string): string {
  return `${COLORS.blue}ℹ${COLORS.reset} ${message}`;
}

/**
 * 格式化标题
 */
export function title(text: string): string {
  return `\n${COLORS.bright}${COLORS.cyan}${text}${COLORS.reset}\n${'='.repeat(text.length)}\n`;
}

/**
 * 格式化键值对
 */
export function keyValue(key: string, value: string): string {
  return `  ${COLORS.dim}${key}:${COLORS.reset} ${value}`;
}

/**
 * 进度指示器
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private interval?: NodeJS.Timeout;
  private text: string = '';
  private isSpinning: boolean = false;

  /**
   * 开始旋转
   */
  start(text: string): void {
    if (this.isSpinning) return;
    this.text = text;
    this.isSpinning = true;
    let i = 0;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${COLORS.cyan}${this.frames[i]}${COLORS.reset} ${this.text}`);
      i = (i + 1) % this.frames.length;
    }, 80);
  }

  /**
   * 停止并显示成功
   */
  succeed(text?: string): void {
    this.stop();
    console.log(`${COLORS.green}✓${COLORS.reset} ${text || this.text}`);
  }

  /**
   * 停止并显示失败
   */
  fail(text?: string): void {
    this.stop();
    console.log(`${COLORS.red}✗${COLORS.reset} ${text || this.text}`);
  }

  /**
   * 停止并显示警告
   */
  warn(text?: string): void {
    this.stop();
    console.log(`${COLORS.yellow}⚠${COLORS.reset} ${text || this.text}`);
  }

  /**
   * 停止
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.isSpinning = false;
    process.stdout.write('\r\x1b[K'); // 清除行
  }
}

/**
 * 确认提示
 */
export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const defaultStr = defaultValue ? 'Y/n' : 'y/N';

  return new Promise((resolve) => {
    rl.question(`${message} [${defaultStr}] `, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === '') {
        resolve(defaultValue);
      } else if (trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * 文本输入提示
 */
export async function input(message: string, defaultValue?: string): Promise<string> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = defaultValue ? `${message} [${defaultValue}]: ` : `${message}: `;

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

/**
 * 选择提示
 */
export async function select<T extends string>(
  message: string,
  choices: { value: T; label: string; hint?: string }[],
  defaultValue?: T
): Promise<T> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${message}`);
  choices.forEach((choice, index) => {
    const marker = choice.value === defaultValue ? '→' : ' ';
    const hint = choice.hint ? ` ${COLORS.dim}(${choice.hint})${COLORS.reset}` : '';
    console.log(`  ${marker} ${index + 1}. ${choice.label}${hint}`);
  });

  const defaultIndex = defaultValue ? choices.findIndex((c) => c.value === defaultValue) : 0;
  const prompt = `\n选择 [1-${choices.length}${defaultIndex >= 0 ? `, 默认 ${defaultIndex + 1}` : ''}]: `;

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (trimmed === '' && defaultIndex >= 0) {
        resolve(choices[defaultIndex].value);
      } else {
        const index = parseInt(trimmed, 10) - 1;
        if (index >= 0 && index < choices.length) {
          resolve(choices[index].value);
        } else {
          console.log(warning('无效选择，使用默认值'));
          resolve(choices[defaultIndex >= 0 ? defaultIndex : 0].value);
        }
      }
    });
  });
}

/**
 * 多选提示
 */
export async function multiselect<T extends string>(
  message: string,
  choices: { value: T; label: string; checked?: boolean }[]
): Promise<T[]> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${message}`);
  console.log(`${COLORS.dim}(输入编号，用逗号分隔，如: 1,3,4)${COLORS.reset}`);
  choices.forEach((choice, index) => {
    const marker = choice.checked ? '[x]' : '[ ]';
    console.log(`  ${index + 1}. ${marker} ${choice.label}`);
  });

  return new Promise((resolve) => {
    rl.question('\n选择: ', (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (trimmed === '') {
        resolve(choices.filter((c) => c.checked).map((c) => c.value));
      } else {
        const indices = trimmed.split(',').map((s) => parseInt(s.trim(), 10) - 1);
        const selected = indices
          .filter((i) => i >= 0 && i < choices.length)
          .map((i) => choices[i].value);
        resolve(selected);
      }
    });
  });
}

/**
 * 表格格式化
 */
export function table(
  headers: string[],
  rows: string[][],
  options: { padding?: number } = {}
): string {
  const padding = options.padding || 2;
  const colWidths = headers.map((h, i) => {
    const maxDataWidth = Math.max(...rows.map((r) => (r[i] || '').length));
    return Math.max(h.length, maxDataWidth) + padding;
  });

  const formatRow = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(colWidths[i])).join('');

  const lines: string[] = [];
  lines.push(COLORS.bright + formatRow(headers) + COLORS.reset);
  lines.push(headers.map((_, i) => '-'.repeat(colWidths[i])).join(''));
  rows.forEach((row) => lines.push(formatRow(row)));

  return lines.join('\n');
}

/**
 * 分隔线
 */
export function separator(): string {
  return COLORS.dim + '─'.repeat(process.stdout.columns || 80) + COLORS.reset;
}

/**
 * 空行
 */
export function newline(count = 1): void {
  console.log('\n'.repeat(count - 1));
}
