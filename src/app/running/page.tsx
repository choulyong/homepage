/**
 * 러닝 트래커 페이지
 * Gemini Vision API를 활용한 AI 기반 러닝 기록 추적
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  analyzeRunningImage,
  saveRunningRecord,
  getRunningRecords,
  getRunningStats,
  getAICoaching,
  deleteRunningRecord,
  addAICoachingToRecord,
} from '@/app/actions/running';
import { createClient } from '@/lib/supabase/client';
import type {
  RunningRecord,
  RunningStats,
  AICoachingAdvice,
  GeminiAnalysisResult,
} from '@/types/running';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@metaldragon.co.kr';

export default function RunningPage() {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [stats, setStats] = useState<RunningStats | null>(null);
  const [coaching, setCoaching] = useState<AICoachingAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<GeminiAnalysisResult | null>(
    null
  );
  const [editingData, setEditingData] = useState<Partial<GeminiAnalysisResult> | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [addingCoaching, setAddingCoaching] = useState<string | null>(null); // 기록 ID

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      setIsAdmin(user?.email === ADMIN_EMAIL);
    };
    checkAdmin();
    loadData();
  }, []);

  const loadData = async (skipCoaching = true) => {
    setLoading(true);
    setError(null);

    console.log(`🔄 loadData called with skipCoaching=${skipCoaching}`);

    try {
      // AI 코칭은 기본적으로 건너뛰기 (토큰 절약)
      const promises = [
        getRunningRecords(),
        getRunningStats(),
      ];

      // 명시적으로 요청할 때만 AI 코칭 호출
      if (!skipCoaching) {
        console.log('🤖 AI 코칭 호출 시작...');
        promises.push(getAICoaching());
      } else {
        console.log('⏭️ AI 코칭 건너뛰기 (토큰 절약)');
      }

      const results = await Promise.all(promises);
      const [recordsResult, statsResult, coachingResult] = results;

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records);
        console.log(`✅ 기록 ${recordsResult.records.length}개 로드됨`);
      } else {
        setError(recordsResult.error || '기록을 불러오는데 실패했습니다');
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      if (coachingResult && coachingResult.success && coachingResult.advice) {
        setCoaching(coachingResult.advice);
        console.log('✅ AI 코칭 조언 로드됨');
      }
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setEditingData(null);
    setError(null);
    setSuccess(null);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError('먼저 이미지를 선택해주세요');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeRunningImage(selectedImage);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setEditingData(result.data);
        setSuccess('이미지 분석이 완료되었습니다! 아래 데이터를 확인하고 저장하세요.');
      } else {
        setError(result.error || '이미지 분석에 실패했습니다');
      }
    } catch (err: any) {
      setError(err.message || '이미지 분석에 실패했습니다');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!editingData) {
      setError('저장할 데이터가 없습니다');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await saveRunningRecord({
        ...editingData,
        image_url: (extractedData as any)?.image_url,
      } as any);

      if (result.success) {
        setSuccess('러닝 기록이 성공적으로 저장되었습니다!');
        setSelectedImage(null);
        setPreviewUrl(null);
        setExtractedData(null);
        setEditingData(null);
        loadData();
      } else {
        setError(result.error || '기록 저장에 실패했습니다');
      }
    } catch (err: any) {
      setError(err.message || '기록 저장에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;

    try {
      const result = await deleteRunningRecord(id);
      if (result.success) {
        setSuccess('기록이 성공적으로 삭제되었습니다');
        loadData();
      } else {
        setError(result.error || '기록 삭제에 실패했습니다');
      }
    } catch (err: any) {
      setError(err.message || '기록 삭제에 실패했습니다');
    }
  };

  const handleAddCoaching = async (recordId: string) => {
    setAddingCoaching(recordId);
    setError(null);
    setSuccess(null);

    try {
      const result = await addAICoachingToRecord(recordId);
      if (result.success) {
        setSuccess('AI 코칭이 성공적으로 추가되었습니다!');
        loadData();
      } else {
        setError(result.error || 'AI 코칭 추가에 실패했습니다');
      }
    } catch (err: any) {
      setError(err.message || 'AI 코칭 추가에 실패했습니다');
    } finally {
      setAddingCoaching(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            러닝 트래커
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            AI 기반 러닝 기록 및 개인 맞춤 코칭
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Upload Section - 관리자만 */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>러닝 스크린샷 업로드 (관리자 전용)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label
                  htmlFor="running-image"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  이미지 선택
                </label>
                <input
                  id="running-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100
                           border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer
                           bg-white dark:bg-gray-800 focus:outline-none p-2"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300 dark:border-gray-700"
                  />
                </div>
              )}

              {/* Analyze Button */}
              {selectedImage && !extractedData && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                    className="flex-1"
                  >
                    {analyzing ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⚙️</span>
                        AI로 분석 중...
                      </>
                    ) : (
                      <>AI로 이미지 분석하기</>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      // 수동 입력 모드
                      setEditingData({
                        date: new Date().toISOString().split('T')[0],
                        distance: null,
                        duration_seconds: null,
                        pace_minutes: null,
                        calories: null,
                        course: '',
                        notes: '',
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    수동 입력
                  </Button>
                </div>
              )}

              {/* 이미지 없이도 수동 입력 가능 */}
              {!selectedImage && !editingData && (
                <Button
                  onClick={() => {
                    setEditingData({
                      date: new Date().toISOString().split('T')[0],
                      distance: null,
                      duration_seconds: null,
                      pace_minutes: null,
                      calories: null,
                      course: '',
                      notes: '',
                    });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ✍️ 직접 입력하기
                </Button>
              )}

              {/* Extracted Data Form */}
              {editingData && (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                    <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-2 flex items-center gap-2">
                      <span>🤖</span>
                      <span>AI 분석 완료!</span>
                    </h4>
                    <p className="text-sm text-teal-800 dark:text-teal-200">
                      이미지에서 다음 정보를 자동으로 추출했습니다.
                      {extractedData?.notes && (
                        <span className="block mt-2 italic">💡 {extractedData.notes}</span>
                      )}
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    추출된 데이터 확인 및 수정
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        날짜
                      </label>
                      <input
                        type="date"
                        value={editingData.date || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, date: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        거리 (km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.distance || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            distance: parseFloat(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        시간 (초)
                      </label>
                      <input
                        type="number"
                        value={editingData.duration_seconds || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            duration_seconds: parseInt(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        평균 페이스 (분/km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.pace_minutes || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            pace_minutes: parseFloat(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        칼로리
                      </label>
                      <input
                        type="number"
                        value={editingData.calories || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            calories: parseInt(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        코스
                      </label>
                      <input
                        type="text"
                        value={editingData.course || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, course: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="코스명을 입력하세요"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      메모
                    </label>
                    <textarea
                      value={editingData.notes || ''}
                      onChange={(e) =>
                        setEditingData({ ...editingData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="러닝 중 느낀 점이나 특이사항을 입력하세요..."
                    />
                  </div>

                  <Button
                    onClick={handleSaveRecord}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? '저장 중...' : '기록 저장'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {stats.total_distance.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  총 거리
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stats.total_runs}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  총 달리기 횟수
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {formatPace(stats.average_pace)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  평균 페이스
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                  {stats.longest_run.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  최장거리
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Coaching Panel */}
        {coaching && (
          <Card className="mb-8 border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>AI 코칭 조언</span>
                </CardTitle>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(false)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {loading ? '로딩 중...' : '🔄 AI 코칭 새로고침'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📊</span>
                    <span>종합 평가</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {coaching.overall_assessment}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <span>💪</span>
                      <span>강점</span>
                    </h4>
                    <ul className="space-y-2 text-green-800 dark:text-green-200">
                      {coaching.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                      <span>🎯</span>
                      <span>개선 포인트</span>
                    </h4>
                    <ul className="space-y-2 text-orange-800 dark:text-orange-200">
                      {coaching.areas_for_improvement.map((area, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-600 dark:text-orange-400 mt-1">→</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg border-2 border-teal-300 dark:border-teal-700">
                  <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2 text-lg">
                    <span>🎪</span>
                    <span>이번 주 목표</span>
                  </h4>
                  <p className="text-teal-800 dark:text-teal-200 leading-relaxed text-lg">
                    {coaching.weekly_goal_suggestion}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>훈련 팁</span>
                  </h4>
                  <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                    {coaching.training_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400 font-bold mt-1">{i + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <span>😴</span>
                    <span>휴식 권장사항</span>
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {coaching.rest_recommendation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>러닝 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                아직 러닝 기록이 없습니다. 첫 스크린샷을 업로드하여 시작하세요!
              </p>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">
                          {record.distance.toFixed(2)} km
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDuration(record.duration_seconds)}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {formatPace(record.pace_minutes)}/km
                        </span>
                      </div>
                      {record.course && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          코스: {record.course}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {record.notes}
                        </p>
                      )}
                      {record.ai_analysis && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            🤖 AI 분석
                          </p>
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            {record.ai_analysis}
                          </p>
                        </div>
                      )}
                      {record.ai_advice && (() => {
                        try {
                          // Parse JSONB ai_advice
                          const advice = typeof record.ai_advice === 'string'
                            ? JSON.parse(record.ai_advice)
                            : record.ai_advice;

                          return (
                            <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🎯</span>
                                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                  이 날짜의 AI 코칭 조언
                                </p>
                              </div>

                              <div className="text-xs text-purple-900 dark:text-purple-100 leading-relaxed">
                                <p className="font-semibold mb-2">📊 종합 평가:</p>
                                <p className="mb-3 pl-3 border-l-2 border-purple-300 dark:border-purple-600">
                                  {advice.overall_assessment}
                                </p>

                                {advice.strengths && advice.strengths.length > 0 && (
                                  <div className="mb-2">
                                    <p className="font-semibold mb-1">💪 강점:</p>
                                    <ul className="pl-3 space-y-1">
                                      {advice.strengths.map((s: string, i: number) => (
                                        <li key={i} className="text-green-700 dark:text-green-300">• {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {advice.weekly_goal_suggestion && (
                                  <div className="mt-2 p-2 bg-teal-100 dark:bg-teal-900/30 rounded">
                                    <p className="font-semibold">🎪 목표: {advice.weekly_goal_suggestion}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch (e) {
                          // Fallback for old string format
                          return (
                            <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                              <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                💡 AI 조언
                              </p>
                              <p className="text-xs text-purple-800 dark:text-purple-200">
                                {record.ai_advice as any}
                              </p>
                            </div>
                          );
                        }
                      })()}
                      {/* AI 코칭이 없는 경우 추가 버튼 표시 */}
                      {!record.ai_advice && isAdmin && (
                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">🤖</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                이 기록에 AI 코칭을 추가하시겠습니까?
                              </span>
                            </div>
                            <Button
                              onClick={() => handleAddCoaching(record.id)}
                              disabled={addingCoaching === record.id}
                              size="sm"
                              variant="outline"
                            >
                              {addingCoaching === record.id ? (
                                <>
                                  <span className="inline-block animate-spin mr-2">⚙️</span>
                                  생성 중...
                                </>
                              ) : (
                                '✨ AI 코칭 추가'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      {record.image_url && (
                        <a
                          href={record.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block"
                        >
                          📷 스크린샷 보기
                        </a>
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
