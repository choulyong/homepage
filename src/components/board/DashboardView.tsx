/**
 * 빅데이터 학습 대시보드 컴포넌트
 * 진행률, D-DAY, 주간 목표, 통계를 시각화
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProgressData {
  label: string;
  value: number; // 0-100
  color: string;
}

interface DDay {
  label: string;
  date: string; // YYYY-MM-DD
}

interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
}

interface DashboardData {
  progress?: ProgressData[];
  ddays?: DDay[];
  weeklyGoals?: WeeklyGoal[];
}

interface DashboardViewProps {
  data: DashboardData;
  onUpdate?: (data: DashboardData) => Promise<void>;
  isEditable?: boolean;
}

export function DashboardView({ data, onUpdate, isEditable = false }: DashboardViewProps) {
  const [localData, setLocalData] = useState<DashboardData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // D-DAY 계산
  const calculateDDay = (targetDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 주간 목표 토글
  const toggleGoal = async (goalId: string) => {
    const updatedGoals = localData.weeklyGoals?.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );

    const updatedData = { ...localData, weeklyGoals: updatedGoals };
    setLocalData(updatedData);

    if (onUpdate) {
      await onUpdate(updatedData);
    }
  };

  // 진행률 업데이트
  const updateProgress = async (index: number, value: number) => {
    const updatedProgress = localData.progress?.map((p, i) =>
      i === index ? { ...p, value: Math.min(100, Math.max(0, value)) } : p
    );

    const updatedData = { ...localData, progress: updatedProgress };
    setLocalData(updatedData);
  };

  // 저장
  const handleSave = async () => {
    if (!onUpdate) return;

    setSaving(true);
    try {
      await onUpdate(localData);
      setIsEditing(false);
      alert('대시보드가 업데이트되었습니다!');
    } catch (error) {
      console.error('Failed to update dashboard:', error);
      alert('업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">📊 학습 대시보드</h2>
        {isEditable && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                ✏️ 수정
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 진행률 섹션 */}
      {localData.progress && localData.progress.length > 0 && (
        <Card padding="lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 현재 진행 상황
          </h3>
          <div className="space-y-4">
            {localData.progress.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.value}
                        onChange={(e) => updateProgress(index, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    ) : null}
                    <span className="text-sm font-bold" style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>
                </div>
                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 주간 목표 섹션 */}
      {localData.weeklyGoals && localData.weeklyGoals.length > 0 && (
        <Card padding="lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ 이번 주 목표
          </h3>
          <div className="space-y-3">
            {localData.weeklyGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  disabled={!isEditable}
                  className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span
                  className={`flex-1 text-sm ${
                    goal.completed
                      ? 'line-through text-gray-500 dark:text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {goal.text}
                </span>
              </div>
            ))}
          </div>
          {/* 완료율 표시 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">완료율</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {localData.weeklyGoals.filter(g => g.completed).length} / {localData.weeklyGoals.length} 완료
                ({Math.round((localData.weeklyGoals.filter(g => g.completed).length / localData.weeklyGoals.length) * 100)}%)
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* D-DAY 섹션 */}
      {localData.ddays && localData.ddays.length > 0 && (
        <Card padding="lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🗓️ 주요 일정 (D-DAY)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localData.ddays.map((dday, index) => {
              const daysLeft = calculateDDay(dday.date);
              const isPast = daysLeft < 0;
              const isToday = daysLeft === 0;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isToday
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isPast
                      ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                      : 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {dday.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {dday.date}
                  </div>
                  <div className={`text-3xl font-bold ${
                    isToday
                      ? 'text-red-600 dark:text-red-400'
                      : isPast
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-teal-600 dark:text-teal-400'
                  }`}>
                    {isToday ? 'D-Day!' : isPast ? `D+${Math.abs(daysLeft)}` : `D-${daysLeft}`}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 통계 요약 */}
      <Card padding="lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📈 학습 통계
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 전체 진행률 */}
          {localData.progress && localData.progress.length > 0 && (
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-lg">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {Math.round(
                  localData.progress.reduce((sum, p) => sum + p.value, 0) / localData.progress.length
                )}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">평균 진행률</div>
            </div>
          )}

          {/* 목표 완료율 */}
          {localData.weeklyGoals && localData.weeklyGoals.length > 0 && (
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((localData.weeklyGoals.filter(g => g.completed).length / localData.weeklyGoals.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">주간 목표</div>
            </div>
          )}

          {/* 남은 일정 */}
          {localData.ddays && localData.ddays.length > 0 && (
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {localData.ddays.filter(d => calculateDDay(d.date) >= 0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">남은 일정</div>
            </div>
          )}

          {/* 총 학습 시간 (예시) */}
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {localData.weeklyGoals ? localData.weeklyGoals.filter(g => g.completed).length * 2 : 0}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">이번 주 학습</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
