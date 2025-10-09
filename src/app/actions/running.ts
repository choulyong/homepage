/**
 * Running Tracker Server Actions
 * AI-powered image analysis with Google Gemini Vision API
 * Supabase Storage for image uploads
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  RunningRecord,
  RunningStats,
  GeminiAnalysisResult,
  AICoachingAdvice,
  RunningRecordInput,
  RunningRecordUpdate,
} from '@/types/running';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Analyze running app screenshot using Gemini Vision API
 */
export async function analyzeRunningImage(
  imageFile: File
): Promise<{ success: boolean; data?: GeminiAnalysisResult; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Upload image to Supabase Storage
    const timestamp = Date.now();
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}-${imageFile.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('running-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: `Image upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('running-images').getPublicUrl(fileName);

    // Convert image to base64 for Gemini API
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Analyze with Gemini Vision API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this running app screenshot and extract the following information in JSON format:
{
  "date": "YYYY-MM-DD format (if visible, otherwise use today's date)",
  "distance": number (in km, extract from the screenshot),
  "duration_seconds": number (convert time to total seconds),
  "pace_minutes": number (average pace in minutes per km),
  "calories": number (calories burned),
  "course": string (course/location name if visible),
  "notes": string (any other visible information like weather, time of day, etc.)
}

IMPORTANT:
- Extract exact numbers from the screenshot
- Convert duration to total seconds (e.g., "30:45" = 1845 seconds)
- Convert pace to minutes per km (e.g., "5'30\"" = 5.5)
- If any field is not visible or unclear, use null
- Be precise with numbers
- Return ONLY valid JSON, no additional text`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let analysisData: GeminiAnalysisResult;
    try {
      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', text);
      return {
        success: false,
        error: 'Failed to parse AI response. Please try again or enter data manually.',
      };
    }

    // Return analyzed data with image URL
    return {
      success: true,
      data: {
        ...analysisData,
        image_url: publicUrl,
      } as any,
    };
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze image',
    };
  }
}

/**
 * Save running record to database
 */
export async function saveRunningRecord(
  data: Partial<RunningRecordInput> & { image_url?: string }
): Promise<{ success: boolean; record?: RunningRecord; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate required fields
    if (
      !data.date ||
      data.distance === null ||
      data.distance === undefined ||
      data.duration_seconds === null ||
      data.duration_seconds === undefined
    ) {
      return {
        success: false,
        error: 'Missing required fields: date, distance, duration',
      };
    }

    // Calculate pace if not provided
    const pace =
      data.pace_minutes ??
      (data.duration_seconds! / 60 / data.distance! || 0);

    // Insert record
    const { data: record, error } = await supabase
      .from('running_records')
      .insert({
        user_id: user.id,
        date: data.date,
        distance: data.distance,
        duration_seconds: data.duration_seconds,
        pace_minutes: pace,
        calories: data.calories ?? 0,
        course: data.course ?? null,
        weather: data.weather ?? null,
        temperature: data.temperature ?? null,
        run_type: data.run_type ?? null,
        notes: data.notes ?? null,
        ai_analysis: data.ai_analysis ?? null,
        image_url: data.image_url ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to save record: ${error.message}` };
    }

    // Generate AI coaching advice for this record
    const coachingResult = await getAICoaching(user.id);
    if (coachingResult.success && coachingResult.advice) {
      // Update record with AI advice
      await supabase
        .from('running_records')
        .update({ ai_advice: coachingResult.advice.overall_assessment })
        .eq('id', record.id);
    }

    revalidatePath('/running');
    return { success: true, record: record as RunningRecord };
  } catch (error: any) {
    console.error('Error saving record:', error);
    return { success: false, error: error.message || 'Failed to save record' };
  }
}

/**
 * Get running records for current user
 */
export async function getRunningRecords(
  limit = 50,
  offset = 0
): Promise<{ success: boolean; records?: RunningRecord[]; total?: number; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get records with pagination
    const { data: records, error, count } = await supabase
      .from('running_records')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to fetch records: ${error.message}` };
    }

    return {
      success: true,
      records: records as RunningRecord[],
      total: count ?? 0,
    };
  } catch (error: any) {
    console.error('Error fetching records:', error);
    return { success: false, error: error.message || 'Failed to fetch records' };
  }
}

/**
 * Get running statistics for current user
 */
export async function getRunningStats(): Promise<{
  success: boolean;
  stats?: RunningStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get all records
    const { data: records, error } = await supabase
      .from('running_records')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to fetch stats: ${error.message}` };
    }

    const typedRecords = records as RunningRecord[];

    // Calculate statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekRecords = typedRecords.filter(
      (r) => new Date(r.date) >= weekAgo
    );
    const thisMonthRecords = typedRecords.filter(
      (r) => new Date(r.date) >= monthAgo
    );

    const total_distance = typedRecords.reduce((sum, r) => sum + r.distance, 0);
    const total_duration_seconds = typedRecords.reduce(
      (sum, r) => sum + r.duration_seconds,
      0
    );
    const total_calories = typedRecords.reduce((sum, r) => sum + r.calories, 0);
    const average_pace =
      typedRecords.length > 0
        ? typedRecords.reduce((sum, r) => sum + r.pace_minutes, 0) /
          typedRecords.length
        : 0;
    const best_pace =
      typedRecords.length > 0
        ? Math.min(...typedRecords.map((r) => r.pace_minutes))
        : 0;
    const longest_run =
      typedRecords.length > 0
        ? Math.max(...typedRecords.map((r) => r.distance))
        : 0;

    const stats: RunningStats = {
      total_distance,
      total_duration_seconds,
      total_runs: typedRecords.length,
      average_pace,
      total_calories,
      this_week: {
        distance: thisWeekRecords.reduce((sum, r) => sum + r.distance, 0),
        runs: thisWeekRecords.length,
      },
      this_month: {
        distance: thisMonthRecords.reduce((sum, r) => sum + r.distance, 0),
        runs: thisMonthRecords.length,
      },
      best_pace,
      longest_run,
    };

    return { success: true, stats };
  } catch (error: any) {
    console.error('Error calculating stats:', error);
    return { success: false, error: error.message || 'Failed to calculate stats' };
  }
}

/**
 * Get AI coaching advice based on recent performance
 */
export async function getAICoaching(
  userId?: string
): Promise<{ success: boolean; advice?: AICoachingAdvice; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const targetUserId = userId || user.id;

    // Get recent records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: records, error } = await supabase
      .from('running_records')
      .select('*')
      .eq('user_id', targetUserId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to fetch records: ${error.message}` };
    }

    if (!records || records.length === 0) {
      return {
        success: true,
        advice: {
          overall_assessment:
            'Start your running journey! Record your first run to get personalized coaching advice.',
          strengths: [],
          areas_for_improvement: [
            'Begin with easy runs to build your base fitness',
          ],
          weekly_goal_suggestion: 'Aim for 2-3 easy runs this week',
          training_tips: [
            'Start with a comfortable pace where you can hold a conversation',
            'Gradually increase your running time by 10% each week',
            'Always include rest days between runs',
          ],
          rest_recommendation: 'Take at least one full rest day between runs',
        },
      };
    }

    // Prepare data summary for AI
    const recordsSummary = records.map((r) => ({
      date: r.date,
      distance: r.distance,
      duration_minutes: Math.round(r.duration_seconds / 60),
      pace: r.pace_minutes.toFixed(2),
      calories: r.calories,
    }));

    // Generate AI coaching advice
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert running coach. Analyze the following running data from the past 30 days and provide personalized coaching advice.

Running Records:
${JSON.stringify(recordsSummary, null, 2)}

Provide advice in JSON format:
{
  "overall_assessment": "2-3 sentence overview of their recent performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2"],
  "weekly_goal_suggestion": "specific, achievable goal for next week",
  "training_tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "rest_recommendation": "advice about rest and recovery"
}

Consider:
- Consistency of training
- Pace progression
- Distance progression
- Recovery patterns
- Balance between easy and hard efforts

Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let advice: AICoachingAdvice;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      advice = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback advice
      advice = {
        overall_assessment: 'Great job staying active! Keep up the good work.',
        strengths: ['Consistent training'],
        areas_for_improvement: ['Continue building your base'],
        weekly_goal_suggestion: 'Maintain your current training volume',
        training_tips: [
          'Listen to your body',
          'Mix easy and harder efforts',
          'Stay hydrated',
        ],
        rest_recommendation: 'Take at least one rest day per week',
      };
    }

    return { success: true, advice };
  } catch (error: any) {
    console.error('Error getting AI coaching:', error);
    return { success: false, error: error.message || 'Failed to get AI coaching' };
  }
}

/**
 * Delete running record
 */
export async function deleteRunningRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Delete record (RLS will ensure user owns it)
    const { error } = await supabase
      .from('running_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to delete record: ${error.message}` };
    }

    revalidatePath('/running');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting record:', error);
    return { success: false, error: error.message || 'Failed to delete record' };
  }
}

/**
 * Update running record
 */
export async function updateRunningRecord(
  recordId: string,
  updates: RunningRecordUpdate
): Promise<{ success: boolean; record?: RunningRecord; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Update record (RLS will ensure user owns it)
    const { data: record, error } = await supabase
      .from('running_records')
      .update(updates)
      .eq('id', recordId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to update record: ${error.message}` };
    }

    revalidatePath('/running');
    return { success: true, record: record as RunningRecord };
  } catch (error: any) {
    console.error('Error updating record:', error);
    return { success: false, error: error.message || 'Failed to update record' };
  }
}
