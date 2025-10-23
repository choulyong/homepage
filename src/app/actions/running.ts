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
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type {
  RunningRecord,
  RunningStats,
  GeminiAnalysisResult,
  AICoachingAdvice,
  RunningRecordInput,
  RunningRecordUpdate,
} from '@/types/running';

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// 관리자 이메일 (환경변수에서 가져오기)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@metaldragon.co.kr';

// 현재 사용자 가져오기 (에러 핸들링 개선)
async function getCurrentUser(supabase: any) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// 관리자 체크
async function isAdmin(supabase: any): Promise<boolean> {
  try {
    const user = await getCurrentUser(supabase);
    return user?.email === ADMIN_EMAIL;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Analyze running app screenshot using Gemini Vision API
 */
export async function analyzeRunningImage(
  imageFile: File
): Promise<{ success: boolean; data?: GeminiAnalysisResult; error?: string }> {
  try {
    // 인증 체크 (에러 발생 시 계속 진행)
    let user = null;
    let adminCheck = false;

    try {
      const supabase = await createClient();
      adminCheck = await isAdmin(supabase);
      user = await getCurrentUser(supabase);
    } catch (authError) {
      console.warn('Auth check failed, continuing without authentication:', authError);
      // 인증 실패 시에도 계속 진행 (개인 서버이므로)
    }

    // 관리자 체크는 경고만 (개인 서버에서는 유연하게)
    if (!adminCheck) {
      console.warn('Not authenticated as admin, but continuing on personal server');
    }

    // Upload image to personal server (개인 서버에 직접 저장)
    // Server Action에서는 파일을 직접 저장해야 함
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일명 생성 (랜덤 + 타임스탬프)
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // 저장 경로 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'running-images');

    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // 파일 저장
    await writeFile(filePath, buffer);

    // 공개 URL 생성
    const publicUrl = `/uploads/running-images/${fileName}`;
    console.log('✅ Image saved to:', publicUrl);

    // Convert image to base64 for Gemini API (buffer 재사용)
    const base64Image = buffer.toString('base64');

    // Analyze with Gemini Vision API (models/ 접두사 추가)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const prompt = `Analyze this running app screenshot and extract the following information in JSON format:
{
  "date": "YYYY-MM-DD format (if visible, otherwise use today's date)",
  "distance": number (in km, extract from the screenshot),
  "duration_seconds": number (convert time to total seconds),
  "pace_minutes": number (average pace in minutes per km),
  "calories": number (calories burned),
  "course": string (course/location name if visible),
  "notes": string (any other visible information like weather, time of day, etc.),
  "ai_analysis": "한국어로 이 러닝 기록에 대한 짧은 분석 (1-2문장, 예: '좋은 페이스로 일정하게 달렸습니다', '이전보다 속도가 개선되었습니다' 등)"
}

IMPORTANT:
- Extract exact numbers from the screenshot
- Convert duration to total seconds (e.g., "30:45" = 1845 seconds)
- Convert pace to minutes per km (e.g., "5'30\"" = 5.5)
- If any field is not visible or unclear, use null
- Be precise with numbers
- ai_analysis는 반드시 한국어로 작성
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
 * Generate individual coaching for a single running record
 */
async function generateIndividualCoaching(
  recordData: {
    date: string;
    distance: number;
    duration_seconds: number;
    pace_minutes: number;
    calories: number;
    course?: string | null;
    notes?: string | null;
  }
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const durationMinutes = Math.round(recordData.duration_seconds / 60);

    const prompt = `당신은 전문 러닝 코치입니다. 다음 러닝 기록에 대해 즉각적인 피드백과 조언을 제공하세요.

# 오늘의 러닝 기록
- 날짜: ${recordData.date}
- 거리: ${recordData.distance}km
- 시간: ${durationMinutes}분 (${recordData.duration_seconds}초)
- 평균 페이스: ${recordData.pace_minutes.toFixed(2)}분/km
- 칼로리: ${recordData.calories}kcal
${recordData.course ? `- 코스: ${recordData.course}` : ''}
${recordData.notes ? `- 특이사항: ${recordData.notes}` : ''}

# 분석 요청사항
1. **이번 러닝 평가**: 거리, 페이스, 칼로리 기준 종합 평가
2. **강점**: 이번 러닝에서 잘한 점 (2-3개)
3. **개선점**: 다음 러닝을 위한 구체적 조언 (1-2개)
4. **다음 목표**: 이번 기록을 기반으로 한 다음 러닝 목표

반드시 유효한 JSON 형식으로만 응답하세요:
{
  "overall_assessment": "이번 러닝에 대한 종합 평가 (2-3문장, 구체적 수치 포함)",
  "strengths": [
    "잘한 점 1 (구체적으로)",
    "잘한 점 2"
  ],
  "areas_for_improvement": [
    "개선점 1 (구체적 방법 포함)",
    "개선점 2"
  ],
  "weekly_goal_suggestion": "다음 러닝 또는 이번 주 목표 제안"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Individual Coaching Response:', text);

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in individual coaching response');
      return null;
    }

    const advice = JSON.parse(jsonMatch[0]);
    console.log('✅ Individual coaching parsed successfully');
    return advice;
  } catch (error) {
    console.error('Failed to generate individual coaching:', error);
    return null;
  }
}

/**
 * Save running record to database
 */
export async function saveRunningRecord(
  data: Partial<RunningRecordInput> & { image_url?: string },
  generateCoaching = false // AI 코칭 생성 여부 (기본값: false)
): Promise<{ success: boolean; record?: RunningRecord; error?: string }> {
  try {
    // 개인 서버이므로 인증 체크를 유연하게 처리
    let user = null;
    let supabase;

    try {
      supabase = await createClient();
      user = await getCurrentUser(supabase);
    } catch (authError) {
      console.warn('Auth failed, using service client:', authError);
      // 인증 실패 시 Service Role Client 사용
      supabase = createServiceClient();
      // 개인 서버이므로 관리자 ID 하드코딩 (환경변수에서 가져오기)
      user = { id: 'personal-admin', email: ADMIN_EMAIL };
    }

    if (!user || !user.id) {
      return { success: false, error: 'Failed to authenticate' };
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

    // 🤖 개별 기록에 대한 AI 코칭 생성 (선택적)
    if (generateCoaching) {
      console.log('🤖 개별 기록에 대한 AI 코칭 생성 중...');

      try {
        const recordData = {
          date: data.date,
          distance: data.distance,
          duration_seconds: data.duration_seconds,
          pace_minutes: pace,
          calories: data.calories ?? 0,
          course: data.course,
          notes: data.notes,
        };

        const aiAdvice = await generateIndividualCoaching(recordData);

        if (aiAdvice) {
          // AI 코칭을 기록에 업데이트
          const { error: updateError } = await supabase
            .from('running_records')
            .update({ ai_advice: aiAdvice })
            .eq('id', record.id);

          if (updateError) {
            console.error('Failed to update AI advice:', updateError);
          } else {
            console.log('✅ AI 코칭이 저장되었습니다.');
            // 업데이트된 레코드를 다시 가져오기
            const { data: updatedRecord } = await supabase
              .from('running_records')
              .select('*')
              .eq('id', record.id)
              .single();

            if (updatedRecord) {
              revalidatePath('/running');
              return { success: true, record: updatedRecord as RunningRecord };
            }
          }
        }
      } catch (aiError) {
        console.error('AI coaching generation failed:', aiError);
        // AI 코칭 실패해도 기록은 저장됨
      }
    } else {
      console.log('⏭️ AI 코칭 건너뛰기 (빠른 저장)');
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
    let supabase;

    try {
      supabase = await createClient();
    } catch (authError) {
      console.warn('Auth failed, using service client for read:', authError);
      // 조회는 Service Role Client로도 가능
      supabase = createServiceClient();
    }

    // 누구나 러닝 기록 조회 가능 (로그인 불필요)
    // 모든 기록을 조회 (user_id 필터 없음)
    const { data: records, error, count } = await supabase
      .from('running_records')
      .select('*', { count: 'exact' })
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
    let supabase;

    try {
      supabase = await createClient();
    } catch (authError) {
      console.warn('Auth failed, using service client for stats:', authError);
      supabase = createServiceClient();
    }

    // 누구나 러닝 통계 조회 가능 (로그인 불필요)
    // 모든 기록의 통계 조회 (user_id 필터 없음)
    const { data: records, error } = await supabase
      .from('running_records')
      .select('*');

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
    let supabase;
    let adminCheck = false;

    try {
      supabase = await createClient();
      adminCheck = await isAdmin(supabase);
    } catch (authError) {
      console.warn('Auth failed, using service client for AI coaching:', authError);
      supabase = createServiceClient();
      // 개인 서버이므로 AI 코칭 허용
      adminCheck = true;
    }

    // 관리자만 AI 코칭 사용 가능 (개인 서버에서는 유연하게)
    if (!adminCheck) {
      console.warn('Not admin, but allowing AI coaching on personal server');
    }

    // Get all records (no user_id filter - analyze all data)
    const { data: records, error } = await supabase
      .from('running_records')
      .select('*')
      .order('date', { ascending: false})
      .limit(50); // Last 50 records for performance

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: `Failed to fetch records: ${error.message}` };
    }

    if (!records || records.length === 0) {
      return {
        success: true,
        advice: {
          overall_assessment:
            '러닝 여정을 시작하세요! 첫 러닝을 기록하면 개인 맞춤 코칭 조언을 받을 수 있습니다.',
          strengths: [],
          areas_for_improvement: [
            '가벼운 러닝으로 시작하여 기초 체력을 쌓으세요',
          ],
          weekly_goal_suggestion: '이번 주에 2-3회 가벼운 러닝을 목표로 하세요',
          training_tips: [
            '대화할 수 있을 정도의 편안한 페이스로 시작하세요',
            '매주 러닝 시간을 10%씩 점진적으로 늘려가세요',
            '러닝 사이에 반드시 휴식일을 포함하세요',
          ],
          rest_recommendation: '러닝 사이에 최소 하루는 완전히 쉬세요',
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

    // Generate AI coaching advice (models/ 접두사 추가)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const prompt = `당신은 올림픽 선수들을 지도한 경력의 전문 러닝 코치입니다. 러너의 상세한 생체 데이터를 분석하여 과학적이고 실용적인 조언을 제공하세요.

# 러닝 데이터 (지난 30일)
${JSON.stringify(recordsSummary, null, 2)}

# 코칭 포인트 (반드시 아래 항목들을 분석하여 언급)

1. **심박수 분석**: 평균/최대 심박수가 notes에 있다면 반드시 분석
   - 170 bpm 이상 = 고강도, 위험 신호
   - 훈련 효과 "Excessive" = 과도한 훈련 경고
   - 93% Max Intensity Zone = 심각한 과훈련

2. **케이던스 & 스트라이드 분석**: notes에 SPM, stride length 있다면 반드시 언급
   - 169-180 SPM = 케이던스 평가
   - 101 cm 평균 스트라이드 = 보폭 효율성 평가
   - 개선 방향 제시

3. **페이스 & 거리 트렌드**:
   - 거리 증가율 분석
   - 페이스 향상도 분석
   - 개인 기록 달성 시 축하 및 다음 목표 제시

4. **훈련 강도 경고**:
   - Aerobic 5.0 (Excessive) = 즉각적인 휴식 필요 경고
   - 과훈련 증후군 위험 알림
   - 회복 기간 구체적 제시

# 출력 형식 (반드시 유효한 JSON으로만 응답)
{
  "overall_assessment": "실제 수치를 언급한 종합 평가 3-4문장. 반드시 심박수, 훈련 효과, 개인 기록 등 구체적 데이터 언급. 예: '10.01km 최장거리 달성을 축하합니다! 하지만 평균 심박수 170bpm, 최대 183bpm으로 93%를 최대강도 구간에서 달려 Aerobic 5.0(과도함) 판정을 받았습니다. 즉시 회복이 필요합니다.'",
  "strengths": [
    "심박수/케이던스 데이터 기반 강점 (예: '169 SPM 케이던스로 효율적인 보폭 유지')",
    "거리/페이스 개선 사항 (예: '10.01km 개인 기록 달성')",
    "훈련 일관성 (예: '꾸준한 아침 러닝 습관 확립')"
  ],
  "areas_for_improvement": [
    "⚠️ 심박수 과다 경고 (예: '평균 170bpm은 최대 심박수의 90% 이상으로 매우 위험. 심박수 140-160bpm 유지 필요')",
    "훈련 강도 조절 (예: 'Aerobic 5.0(과도함)은 과훈련 위험. 저강도 러닝 비율 증가 필요')",
    "보폭/케이던스 최적화 (구체적 수치 제시)"
  ],
  "weekly_goal_suggestion": "⚠️ 과훈련 상태이므로 회복 중심 목표 제시. 예: '이번 주는 완전 휴식 2일, 저강도(심박수 130-140) 러닝 2회, 5km 이하로 회복에 집중하세요. 고강도 러닝은 2주 후부터 재개하세요.'",
  "training_tips": [
    "심박수 구간별 훈련법 (예: '회복 러닝: 최대심박수의 60-70%, 대화 가능한 속도')",
    "과훈련 예방법 (예: '주간 거리는 전주 대비 10% 이상 증가 금지')",
    "케이던스 개선법 (예: '180 SPM 목표로 메트로놈 활용 훈련')",
    "아침 러닝 최적화 (예: '워밍업 10분 필수, 기상 후 30분 이후 시작')"
  ],
  "rest_recommendation": "⚠️ 현재 Aerobic 5.0 과도 상태이므로 최소 48시간 완전 휴식 필수. 활동성 회복(가벼운 걷기, 스트레칭) 권장. 심박수가 안정될 때까지 고강도 훈련 중단."
}

**중요**: 반드시 유효한 JSON 형식으로만 응답하세요. 마크다운이나 다른 텍스트는 포함하지 마세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Gemini AI Response:');
    console.log('='.repeat(80));
    console.log(text);
    console.log('='.repeat(80));

    // Parse JSON response
    let advice: AICoachingAdvice;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in AI response');
        throw new Error('No JSON found in response');
      }
      console.log('✅ Extracted JSON:', jsonMatch[0]);
      advice = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed AI coaching advice');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response was:', text);
      // Fallback advice
      advice = {
        overall_assessment: '활동적으로 지내고 계시네요! 계속 좋은 습관을 유지하세요.',
        strengths: ['꾸준한 훈련'],
        areas_for_improvement: ['기초 체력을 계속 쌓아가세요'],
        weekly_goal_suggestion: '현재 훈련량을 유지하세요',
        training_tips: [
          '몸의 신호에 귀 기울이세요',
          '쉬운 러닝과 강도 높은 러닝을 섞어서 하세요',
          '충분한 수분을 섭취하세요',
        ],
        rest_recommendation: '주당 최소 하루는 쉬는 날을 가지세요',
      };
    }

    return { success: true, advice };
  } catch (error: any) {
    console.error('Error getting AI coaching:', error);
    return { success: false, error: error.message || 'Failed to get AI coaching' };
  }
}

/**
 * Add AI coaching to existing record
 */
export async function addAICoachingToRecord(
  recordId: string
): Promise<{ success: boolean; record?: RunningRecord; error?: string }> {
  try {
    let supabase;

    try {
      supabase = await createClient();
    } catch (authError) {
      console.warn('Auth failed, using service client:', authError);
      supabase = createServiceClient();
    }

    // 기존 기록 가져오기
    const { data: record, error: fetchError } = await supabase
      .from('running_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchError || !record) {
      return { success: false, error: 'Record not found' };
    }

    // AI 코칭 생성
    console.log('🤖 개별 기록에 대한 AI 코칭 생성 중...');

    const recordData = {
      date: record.date,
      distance: record.distance,
      duration_seconds: record.duration_seconds,
      pace_minutes: record.pace_minutes,
      calories: record.calories ?? 0,
      course: record.course,
      notes: record.notes,
    };

    const aiAdvice = await generateIndividualCoaching(recordData);

    if (!aiAdvice) {
      return { success: false, error: 'Failed to generate AI coaching' };
    }

    // AI 코칭 업데이트
    const { data: updatedRecord, error: updateError } = await supabase
      .from('running_records')
      .update({ ai_advice: aiAdvice })
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: `Failed to update AI advice: ${updateError.message}` };
    }

    console.log('✅ AI 코칭이 추가되었습니다.');
    revalidatePath('/running');
    return { success: true, record: updatedRecord as RunningRecord };
  } catch (error: any) {
    console.error('Error adding AI coaching:', error);
    return { success: false, error: error.message || 'Failed to add AI coaching' };
  }
}

/**
 * Delete running record
 */
export async function deleteRunningRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let supabase;
    let user = null;

    try {
      supabase = await createClient();
      user = await getCurrentUser(supabase);
    } catch (authError) {
      console.warn('Auth failed, using service client for delete:', authError);
      // 개인 서버이므로 Service Role로 삭제 허용
      supabase = createServiceClient();
      user = { id: 'personal-admin', email: ADMIN_EMAIL };
    }

    if (!user || !user.id) {
      return { success: false, error: 'Authentication required' };
    }

    // Delete record
    // 개인 서버이므로 user_id 체크 없이 삭제 (Service Role 사용 시)
    const { error } = await supabase
      .from('running_records')
      .delete()
      .eq('id', recordId);

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
    let supabase;
    let user = null;

    try {
      supabase = await createClient();
      user = await getCurrentUser(supabase);
    } catch (authError) {
      console.warn('Auth failed, using service client for update:', authError);
      supabase = createServiceClient();
      user = { id: 'personal-admin', email: ADMIN_EMAIL };
    }

    if (!user || !user.id) {
      return { success: false, error: 'Authentication required' };
    }

    // Update record
    // 개인 서버이므로 user_id 체크 없이 업데이트 (Service Role 사용 시)
    const { data: record, error } = await supabase
      .from('running_records')
      .update(updates)
      .eq('id', recordId)
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
