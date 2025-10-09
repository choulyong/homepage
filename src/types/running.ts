/**
 * Running Records Type Definitions
 * AI-powered running tracker with Gemini Vision API
 */

export interface RunningRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  distance: number; // in kilometers
  duration_seconds: number;
  pace_minutes: number; // minutes per km
  calories: number;
  course?: string | null;
  weather?: string | null;
  temperature?: number | null;
  run_type?: 'easy' | 'tempo' | 'interval' | 'long' | 'race' | null;
  notes?: string | null;
  ai_analysis?: {
    extracted_data?: Record<string, any>;
    confidence_score?: number;
    processing_notes?: string[];
  } | null;
  ai_advice?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunningStats {
  total_distance: number;
  total_duration_seconds: number;
  total_runs: number;
  average_pace: number;
  total_calories: number;
  this_week: {
    distance: number;
    runs: number;
  };
  this_month: {
    distance: number;
    runs: number;
  };
  best_pace: number;
  longest_run: number;
}

export interface GeminiAnalysisResult {
  date: string | null;
  distance: number | null;
  duration_seconds: number | null;
  pace_minutes: number | null;
  calories: number | null;
  course: string | null;
  notes: string | null;
}

export interface AICoachingAdvice {
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  weekly_goal_suggestion: string;
  training_tips: string[];
  rest_recommendation: string;
}

export type RunningRecordInput = Omit<
  RunningRecord,
  'id' | 'created_at' | 'updated_at'
>;

export type RunningRecordUpdate = Partial<
  Omit<RunningRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;
