import { apiClient, type ApiResponse } from '@/api/client';

export interface PersonalRecordStats {
  total: number;
  byMuscleGroup: Record<string, number>;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
  recentRecords: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    maxReps?: number;
    maxDurationSeconds?: number;
    maxWeight?: number;
    achievedAt: string;
  }>;
}

export const personalRecordsApi = {
  getStats: async (): Promise<PersonalRecordStats> => {
    const response = await apiClient.get<ApiResponse<PersonalRecordStats>>('/personal-records/stats');
    return response.data.data!;
  },
};
