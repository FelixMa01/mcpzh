import { describe, expect, it } from 'vitest';
import { getVerification } from './verification';

describe('真实 MCP 验证记录', () => {
  it('返回官方 everything server 的端到端证据', () => {
    const result = getVerification('modelcontextprotocol/server-everything');
    expect(result?.status).toBe('passed');
    expect(result?.protocol_version).toBe('2025-06-18');
    expect(result?.tools_count).toBe(13);
    expect(result?.steps).toEqual(['initialize', 'notifications/initialized', 'tools/list']);
  });

  it('未知项目保持待实测', () => {
    expect(getVerification('unknown/server')).toBeUndefined();
  });
});
