import { WorkRecord } from '../types/work-record';

interface GitHubConfig {
  owner: string; // GitHub 사용자명 또는 Organization
  repo: string; // Repository 이름
  path: string; // JSON 파일 경로 (예: data/work-records.json)
  token: string; // Personal Access Token
  branch: string; // 브랜치 (보통 main 또는 master)
}

interface GitHubFileResponse {
  content: string;
  sha: string;
}

export class GitHubStorage {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  /**
   * GitHub에서 JSON 파일 읽기
   */
  async getRecords(): Promise<WorkRecord[]> {
    try {
      const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 404) {
        // 파일이 없으면 빈 배열 반환
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubFileResponse = await response.json();
      
      // Base64 디코딩
      const content = atob(data.content);
      const records = JSON.parse(content);
      
      // 오래된 데이터 필터링 (당월 기준 전전달까지만 유지)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      const cutoffDate = new Date(currentYear, currentMonth - 2, 1);
      const cutoffString = cutoffDate.toISOString().split('T')[0];
      
      return records.filter((record: WorkRecord) => record.date >= cutoffString);
    } catch (error) {
      console.error('Failed to fetch records from GitHub:', error);
      throw error;
    }
  }

  /**
   * GitHub에 JSON 파일 쓰기
   */
  async saveRecords(records: WorkRecord[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}`;
      
      // 현재 파일의 SHA 가져오기 (업데이트 시 필요)
      let sha: string | undefined;
      
      try {
        const getResponse = await fetch(url, {
          headers: {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (getResponse.ok) {
          const data: GitHubFileResponse = await getResponse.json();
          sha = data.sha;
        }
      } catch (error) {
        // 파일이 없으면 새로 생성
        console.log('File does not exist, will create new file');
      }

      // JSON을 Base64로 인코딩
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(records, null, 2))));

      const body: any = {
        message: `Update work records - ${new Date().toISOString()}`,
        content,
        branch: this.config.branch,
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log('Records saved to GitHub successfully');
    } catch (error) {
      console.error('Failed to save records to GitHub:', error);
      throw error;
    }
  }
}

/**
 * GitHub Storage 인스턴스 생성
 */
export function createGitHubStorage(): GitHubStorage | null {
  try {
    // Next.js 환경변수 사용
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
    const path = process.env.NEXT_PUBLIC_GITHUB_PATH || 'data/work-records.json';
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';

    // 환경변수가 설정되지 않았으면 null 반환 (로컬 스토리지 사용)
    if (!owner || !repo || !token) {
      console.warn('GitHub configuration not found. Using local storage instead.');
      return null;
    }

    return new GitHubStorage({
      owner,
      repo,
      path,
      token,
      branch,
    });
  } catch (error) {
    console.error('Error creating GitHub storage:', error);
    return null;
  }
}