import axios from 'axios';
import { GenerateOptions, GenerateResponse, HistoryItem } from '@rapper-toon-sheet/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function generateSheet(
  images: File[],
  options: GenerateOptions
): Promise<GenerateResponse> {
  const formData = new FormData();
  
  images.forEach(image => {
    formData.append('images', image);
  });
  
  formData.append('options', JSON.stringify(options));

  const response = await api.post<GenerateResponse>('/generate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

export async function getGeneration(id: string): Promise<GenerateResponse> {
  const response = await api.get<GenerateResponse>(`/generate/${id}`);
  return response.data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await api.get<HistoryItem[]>('/history');
  return response.data;
}

export { api };
