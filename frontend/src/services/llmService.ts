import { PromptType } from '@/src/lib/interfaces';

// PII masking patterns for Japanese educational data
const PII_PATTERNS = {
  // Japanese names - mask all but first character
  name: (name: string) => {
    if (!name || name.length <= 1) return name;
    return `${name.charAt(0)}${'*'.repeat(name.length - 1)}`;
  },
  
  // Email addresses
  email: (email: string) => {
    if (!email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
    return `${maskedLocal}@${domain}`;
  },
  
  // Student numbers - mask middle digits
  student_no: (num: string | number) => {
    const str = String(num);
    if (str.length <= 2) return str;
    const first = str.charAt(0);
    const last = str.charAt(str.length - 1);
    return `${first}${'*'.repeat(str.length - 2)}${last}`;
  },
  
  // Addresses - mask specific parts
  address: (addr: string) => {
    // Replace numbers with asterisks
    return addr.replace(/\d+/g, '***').replace(/[一二三四五六七八九十]/g, '*');
  },
  
  // Phone numbers
  phone: (phone: string) => {
    return phone.replace(/\d/g, '*');
  }
};

// Encryption utilities
class SecureDataHandler {
  private static encryptionKey = process.env.LLM_ENCRYPTION_KEY || 'default-key-change-in-production';
  
  static async encryptPayload(data: any): Promise<string> {
    // In production, use proper encryption library like crypto
    // This is a simplified implementation for demonstration
    const jsonString = JSON.stringify(data);
    const base64 = Buffer.from(jsonString).toString('base64');
    return base64;
  }
  
  static async decryptPayload(encryptedData: string): Promise<any> {
    // Corresponding decryption
    const jsonString = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  }
  
  static maskPII(data: any, piiFields: string[] = []): { maskedData: any; maskingMap: Record<string, string> } {
    const maskedData = JSON.parse(JSON.stringify(data)); // Deep clone
    const maskingMap: Record<string, string> = {};
    
    function maskObject(obj: any, path: string = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object') {
                maskObject(item, `${fieldPath}[${index}]`);
              }
            });
          } else {
            maskObject(value, fieldPath);
          }
        } else if (typeof value === 'string' || typeof value === 'number') {
          const shouldMask = piiFields.includes(key);
          
          if (shouldMask) {
            const originalValue = String(value);
            let maskedValue = originalValue;
            
            // Apply appropriate masking pattern
            if (key.includes('name') || key.includes('氏名')) {
              maskedValue = PII_PATTERNS.name(originalValue);
            } else if (key.includes('email') || key.includes('メール')) {
              maskedValue = PII_PATTERNS.email(originalValue);
            } else if (key.includes('student_no') || key.includes('学籍') || key.includes('番号')) {
              maskedValue = PII_PATTERNS.student_no(originalValue);
            } else if (key.includes('address') || key.includes('住所')) {
              maskedValue = PII_PATTERNS.address(originalValue);
            } else if (key.includes('phone') || key.includes('電話')) {
              maskedValue = PII_PATTERNS.phone(originalValue);
            } else {
              // Generic masking for unknown PII
              maskedValue = originalValue.length > 2 
                ? `${originalValue.slice(0, 1)}***${originalValue.slice(-1)}`
                : '***';
            }
            
            obj[key] = maskedValue;
            maskingMap[fieldPath] = originalValue;
          }
        }
      }
    }
    
    maskObject(maskedData);
    return { maskedData, maskingMap };
  }
  
  static isPotentialPII(key: string, value: any): boolean {
    const piiKeywords = [
      'name', 'nama', '名前', '氏名', '姓名',
      'email', 'mail', 'メール',
      'phone', 'tel', '電話', 'でんわ',
      'address', '住所', 'じゅうしょ',
      'student_no', '学籍', '番号'
    ];
    
    const lowerKey = key.toLowerCase();
    return piiKeywords.some(keyword => lowerKey.includes(keyword));
  }
}

// LLM Service Class
export class LLMService {
  private static baseUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
  private static apiKey = process.env.OPENAI_API_KEY;
  private static model = process.env.OPENAI_MODEL || 'gpt-4';
  
  static async processWithLLM(
    promptType: PromptType,
    data: any,
    options: {
      teacherId: string;
      conversationId: string;
      enablePIIMasking?: boolean;
      customPrompt?: string;
    }
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    usage?: any;
  }> {
    try {
      // Get prompt template
      const promptTemplate = await this.getPromptTemplate(promptType);
      
      // Apply PII masking if enabled
      let processedData = data;
      let maskingMap: Record<string, string> = {};
      
      if (options.enablePIIMasking !== false) {
        const masked = SecureDataHandler.maskPII(data);
        processedData = masked.maskedData;
        maskingMap = masked.maskingMap;
      }
      
      // Build prompt
      const prompt = this.buildPrompt(promptTemplate, processedData, options.customPrompt);
      
      // Encrypt payload for secure transmission
      const encryptedPayload = await SecureDataHandler.encryptPayload({
        prompt,
        data: processedData,
        metadata: {
          teacherId: options.teacherId,
          conversationId: options.conversationId,
          promptType,
          timestamp: new Date().toISOString()
        }
      });
      
      // Call LLM API with retry logic
      const result = await this.callLLMWithRetry(encryptedPayload);
      
      if (!result.success) {
        return result;
      }
      
      // Process and unmask response
      const processedResult = await this.processLLMResponse(
        result.data,
        promptType,
        maskingMap
      );
      
      // Log usage for monitoring
      await this.logLLMUsage({
        teacherId: options.teacherId,
        conversationId: options.conversationId,
        promptType,
        inputTokens: result.usage?.prompt_tokens || 0,
        outputTokens: result.usage?.completion_tokens || 0,
        totalTokens: result.usage?.total_tokens || 0,
        success: true
      });
      
      return {
        success: true,
        data: processedResult,
        usage: result.usage
      };
      
    } catch (error) {
      console.error('LLM processing error:', error);
      
      // Log failed usage
      await this.logLLMUsage({
        teacherId: options.teacherId,
        conversationId: options.conversationId,
        promptType,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'LLM processing failed'
      };
    }
  }
  
  private static async getPromptTemplate(promptType: PromptType): Promise<string> {
    // In production, fetch from database with version control
    const prompts = {
      csv_conversion: `
あなたは日本の学校教員向けの班分け最適化システムのアシスタントです。
アップロードされたCSVファイルを、システムで使用可能な形式に変換してください。

変換ルール：
1. 列名を英語に変換（氏名→name, 性別→sex, 学籍番号→student_no など）
2. 性別の値を数値に変換（男/M/1→0, 女/F/0→1）
3. 数値項目は整数に変換
4. 空の値は適切なデフォルト値を設定

入力データ：
{data}

JSON形式で変換結果を返してください。各変更について説明も含めてください。
`,
      
      constraint_generation: `
班分け制約の設定をお手伝いします。以下の情報から適切な制約条件を提案してください。

クラス情報：
- 学生数: {student_count}人
- 希望チーム数: {team_count}チーム

考慮事項：
1. チームサイズのバランス
2. 男女比の配慮
3. リーダーの配置
4. 前回のチーム編成との重複回避

制約条件をJSON形式で提案してください。理由も含めて説明してください。
`,
      
      optimization_explanation: `
班分け最適化の結果を分かりやすく説明してください。

最適化結果：
{optimization_result}

以下の観点で説明してください：
1. 各チームの特徴とバランス
2. 制約条件の満足度
3. 改善提案があれば
4. 教員への実用的なアドバイス

日本の学校現場に適した言葉遣いで説明してください。
`
    };
    
    return prompts[promptType] || prompts.csv_conversion;
  }
  
  private static buildPrompt(template: string, data: any, customPrompt?: string): string {
    let prompt = template;
    
    // Replace placeholders
    prompt = prompt.replace('{data}', JSON.stringify(data, null, 2));
    
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
      });
    }
    
    if (customPrompt) {
      prompt += `\n\n追加指示：${customPrompt}`;
    }
    
    return prompt;
  }
  
  private static async callLLMWithRetry(encryptedPayload: string, maxRetries: number = 3): Promise<any> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Decrypt payload for API call
        const payload = await SecureDataHandler.decryptPayload(encryptedPayload);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'user',
                content: payload.prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        return {
          success: true,
          data: JSON.parse(result.choices[0].message.content),
          usage: result.usage
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`LLM call attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    return {
      success: false,
      error: `All ${maxRetries} attempts failed. Last error: ${lastError.message}`
    };
  }
  
  private static async processLLMResponse(
    response: any,
    promptType: PromptType,
    maskingMap: Record<string, string>
  ): Promise<any> {
    // Unmask any PII in the response if needed
    let processedResponse = response;
    
    // Apply type-specific processing
    switch (promptType) {
      case 'csv_conversion':
        processedResponse = this.processCsvConversionResponse(response);
        break;
      case 'constraint_generation':
        processedResponse = this.processConstraintGenerationResponse(response);
        break;
      case 'optimization_explanation':
        processedResponse = this.processOptimizationExplanationResponse(response);
        break;
    }
    
    return processedResponse;
  }
  
  private static processCsvConversionResponse(response: any): any {
    // Validate and structure CSV conversion response
    return {
      converted_data: response.converted_data || [],
      changes: response.changes || [],
      summary: response.summary || '',
      validation_errors: response.validation_errors || []
    };
  }
  
  private static processConstraintGenerationResponse(response: any): any {
    // Validate constraint generation response
    return {
      constraints: response.constraints || {},
      reasoning: response.reasoning || '',
      recommendations: response.recommendations || []
    };
  }
  
  private static processOptimizationExplanationResponse(response: any): any {
    // Validate optimization explanation response
    return {
      explanation: response.explanation || '',
      team_analysis: response.team_analysis || [],
      recommendations: response.recommendations || [],
      summary: response.summary || ''
    };
  }
  
  private static async logLLMUsage(usage: {
    teacherId: string;
    conversationId: string;
    promptType: PromptType;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      // In production, log to database or monitoring service
      console.log('LLM Usage:', {
        timestamp: new Date().toISOString(),
        ...usage
      });
      
      // Could also send to analytics service
      // await analyticsService.track('llm_usage', usage);
      
    } catch (error) {
      console.error('Failed to log LLM usage:', error);
    }
  }
}

export default LLMService;