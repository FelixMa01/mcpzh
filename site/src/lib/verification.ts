export interface VerificationRecord {
  status: 'passed' | 'failed';
  tested_at: string;
  package: string;
  package_version: string;
  protocol_version: string;
  transport: 'stdio' | 'http';
  steps: string[];
  tools_count: number;
  tools_sample: string[];
  environment: string;
}

const records: Record<string, VerificationRecord> = {
  'modelcontextprotocol/server-everything': {
    status: 'passed',
    tested_at: '2026-08-14',
    package: '@modelcontextprotocol/server-everything',
    package_version: '2026.7.4',
    protocol_version: '2025-06-18',
    transport: 'stdio',
    steps: ['initialize', 'notifications/initialized', 'tools/list'],
    tools_count: 13,
    tools_sample: ['echo', 'get-annotated-message', 'get-env', 'get-resource-links', 'get-sum'],
    environment: 'macOS 26.5.2 / Node.js 22.22.3',
  },
};

export function getVerification(serverName: string): VerificationRecord | undefined {
  return records[serverName];
}

export function getVerifiedServerNames(): string[] {
  return Object.keys(records);
}
