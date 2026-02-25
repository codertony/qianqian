/**
 * AI Provider - OpenAI 实现
 *
 * OpenAI API 集成
 *
 * @module openai-provider
 */

import OpenAI from 'openai';
import {
  AIProvider,
  AIProviderType,
  AIMessage,
  AIMessageRole,
  AICallOptions,
  AICallResult,
  AIProviderConfig,
} from '../types';
import { logger } from '../../../shared/logger';

/**
 * OpenAI 模型映射
 */
const OPENAI_MODELS: Record<string, string> = {
  'gpt-4': 'gpt-4',
  'gpt-4-turbo': 'gpt-4-turbo-preview',
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
};

/**
 * 默认 OpenAI 模型
 */
const DEFAULT_MODEL = 'gpt-4o';

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  readonly type = AIProviderType.OPENAI;
  readonly defaultModel: string;
  private client: OpenAI;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.defaultModel = config.defaultModel || DEFAULT_MODEL;
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  /**
   * 是否可用 (API Key 是否配置)
   */
  get isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * 发送消息并获取回复
   */
  async chat(messages: AIMessage[], options: AICallOptions = {}): Promise<AICallResult> {
    const startTime = Date.now();
    const model = this.resolveModel(options.model);
    
    try {
      // 转换消息格式
      const openaiMessages = messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      }));

      // 如果有独立的 systemPrompt，添加到开头
      if (options.systemPrompt) {
        openaiMessages.unshift({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      const response = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: options.maxTokens || this.config.defaultMaxTokens,
        temperature: options.temperature ?? this.config.defaultTemperature,
      });

      const duration = Date.now() - startTime;
      const usage = response.usage;

      return {
        content: response.choices[0]?.message?.content || '',
        model,
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        duration,
      };
    } catch (error) {
      logger.error('OpenAI API call failed', { error, model });
      throw error;
    }
  }

  /**
   * 生成完成内容
   */
  async complete(prompt: string, options: AICallOptions = {}): Promise<AICallResult> {
    const messages: AIMessage[] = [
      { role: AIMessageRole.USER, content: prompt },
    ];
    return this.chat(messages, options);
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.complete('Hello', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 解析模型名称
   */
  private resolveModel(model?: string): string {
    if (!model) return this.defaultModel;
    return OPENAI_MODELS[model] || model;
  }
}
