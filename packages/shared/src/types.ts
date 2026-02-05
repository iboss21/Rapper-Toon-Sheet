export type StylePreset = 'cartoon_realism' | 'anime_ish' | 'comic_ink' | 'clean_cell_shade';

export type LayoutOption = 'single_poster' | 'two_posters';

export type BackgroundOption = 'neon_city_blur' | 'plain_studio_grey' | 'transparent';

export interface GenerateOptions {
  stylePreset: StylePreset;
  layout: LayoutOption;
  background: BackgroundOption;
  includeTurnaround: boolean;
  includeActionPoses: boolean;
  seed?: number;
  nickname?: string;
  faceConsistencyLock?: boolean;
}

export interface GenerateRequest {
  options: GenerateOptions;
}

export interface GenerateResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  createdAt: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  options: GenerateOptions;
  createdAt: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
