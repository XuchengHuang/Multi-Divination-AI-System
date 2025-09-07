// src/services/backendService.ts

// ⛳ 如果你已经用 Vite 代理了 /api -> http://localhost:8000，
//    这里可以把 BACKEND_API 改成 '/api'。
//    目前为了直连后端，我先保留完整地址：
const BACKEND_API = process.env.BACKEND_URL;

export interface BatchReadingData {
  user_name: string;
  primary_question: string;
  selected_methods: string[];                 // 建议用后端期望的枚举ID（如 life_path_number / mbti 等）
  individual_reports: Record<string, string>; // 键同上：方法ID -> markdown内容
  integrated_report?: string;                 // 有就发，没有就别带
  input_data: Record<string, any>;
  character_archetypes?: string[];
  ai_model_used?: string;
  total_processing_time?: number;
}

export interface BackendResponse {
  persona: any;
  individual_readings: any[];
  integrated_reading?: any;
  success: boolean;
  message: string;
}

class BackendService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BACKEND_API}${endpoint}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    // 🔎 打印本次请求（含 JSON body，方便对照 /docs 的 schema）
    if (config.body !== undefined) {
      try {
        const bodyStr = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
        console.log(
          `[request] ${config.method || 'GET'} ${url}\n` +
          JSON.stringify(JSON.parse(bodyStr), null, 2)
        );
      } catch {
        console.log(`[request] ${config.method || 'GET'} ${url} (non-JSON body)`, config.body);
      }
    } else {
      console.log(`[request] ${config.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 尽量把后端的错误体完整输出（兼容 FastAPI 的 detail 数组/对象/字符串）
        const raw = await response.text();
        let msg = `${response.status} ${response.statusText}`;

        try {
          const j = JSON.parse(raw);
          if (j.detail !== undefined) {
            const detailStr = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail, null, 2);
            msg += ` - detail: ${detailStr}`;
          } else {
            msg += ` - body: ${JSON.stringify(j, null, 2)}`;
          }
        } catch {
          // 不是 JSON，就原样带上
          msg += ` - raw: ${raw}`;
        }

        const err: any = new Error(msg);
        err.status = response.status;
        err.url = url;
        err.raw = raw;
        throw err;
      }

      // 处理 204 或无内容响应
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204 || !contentType.includes('application/json')) {
        return {} as BackendResponse;
      }

      return await response.json();
    } catch (error) {
      console.error(`Backend API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  public async saveBatchReadings(data: BatchReadingData): Promise<BackendResponse> {
    return this.request('/batch/readings', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        ai_model_used: data.ai_model_used || 'gemini-2.5-flash',
      }),
    });
  }

  // 可选：获取聚合摘要
  public async getUserSummary(): Promise<BackendResponse> {
    return this.request('/batch/summary');
  }

  // 可选：查询已保存的 readings
  public async getReadings(): Promise<BackendResponse> {
    return this.request('/readings/');
  }
}

export const backendService = new BackendService();
