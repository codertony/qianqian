/**
 * AI Provider - 接口定义
 *
 * 定义 AI Provider 的标准接口
 *
 * @module ai-provider-types
 */

/**
 * AI Provider 类型
 */
export enum AIProviderType {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
}

/**
 * AI 模型类型
 */
export type AIModel = string;

/**
 * AI 消息角色
 */
export enum AIMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * AI 消息
 */
export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

/**
 * AI 调用选项
 */
export interface AICallOptions {
  /** 使用的模型 */
  model?: AIModel;
  /** 温度参数 (0-1) */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

/**
 * AI 调用结果
 */
export interface AICallResult {
  /** 生成的内容 */
  content: string;
  /** 使用的模型 */
  model: AIModel;
  /** 输入 token 数 */
  inputTokens: number;
  /** 输出 token 数 */
  outputTokens: number;
  /** 总 token 数 */
  totalTokens: number;
  /** 调用耗时 (毫秒) */
  duration: number;
}

/**
 * AI Provider 接口
 */
export interface AIProvider {
  /** Provider 名称 */
  readonly name: string;
  /** Provider 类型 */
  readonly type: AIProviderType;
  /** 默认模型 */
  readonly defaultModel: AIModel;
  /** 是否可用 */
  readonly isAvailable: boolean;

  /**
   * 发送消息并获取回复
   */
  chat(messages: AIMessage[], options?: AICallOptions): Promise<AICallResult>;

  /**
   * 生成完成内容
   */
  complete(prompt: string, options?: AICallOptions): Promise<AICallResult>;

  /**
   * 测试连接
   */
  testConnection(): Promise<boolean>;
}

/**
 * AI Provider 配置
 */
export interface AIProviderConfig {
  /** Provider 类型 */
  type: AIProviderType;
  /** API Key */
  apiKey: string;
  /** 基础 URL (可选，用于自定义端点) */
  baseUrl?: string;
  /** 默认模型 */
  defaultModel?: AIModel;
  /** 默认温度 */
  defaultTemperature?: number;
  /** 默认最大 token 数 */
  defaultMaxTokens?: number;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

/**
 * AI 配置 (应用级别)
 */
export interface AIConfig {
  /** 默认 Provider */
  defaultProvider: AIProviderType;
  /** Provider 配置列表 */
  providers: AIProviderConfig[];
  /** Token 预算 */
  tokenBudget?: TokenBudgetConfig;
  /** 限流配置 */
  rateLimit?: RateLimitConfig;
}

/**
 * Token 预算配置
 */
export interface TokenBudgetConfig {
  /** 每日最大 token 数 */
  dailyMaxTokens: number;
  /** 每次调用最大 token 数 */
  perCallMaxTokens: number;
  /** 警告阈值 (百分比) */
  warningThreshold: number;
}

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 每分钟最大请求数 */
  maxRequestsPerMinute: number;
  /** 最大并发数 */
  maxConcurrent: number;
}

/**
 * AI 任务类型
 */
export enum AITaskType {
  /** Skill 提取 */
  SKILL_EXTRACTION = 'skill_extraction',
  /** Commit Message 生成 */
  COMMIT_MESSAGE = 'commit_message',
  /** 语义合并 */
  SEMANTIC_MERGE = 'semantic_merge',
  /** 命名建议 */
  NAMING_SUGGESTION = 'naming_suggestion',
  /** README 生成 */
  README_GENERATION = 'readme_generation',
  /** 通用对话 */
  GENERAL = 'general',
}

/**
 * AI 任务选项
 */
export interface AITaskOptions extends AICallOptions {
  /** 任务类型 */
  taskType?: AITaskType;
  /** 是否使用缓存 */
  useCache?: boolean;
}

/**
 * AI 任务结果
 */
export interface AITaskResult<T = string> extends AICallResult {
  /** 解析后的数据 */
  data?: T;
}
