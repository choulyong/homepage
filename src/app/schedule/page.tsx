/**
 * Schedule Page with Tailwind CSS
 * 일정 관리 캘린더
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  isPublic: boolean;
  isAllDay: boolean;
  repeatType?: string;
  isHoliday?: boolean;
}

type TabType = 'public' | 'personal';

// 대한민국 공휴일 데이터 (2025년)
const KOREAN_HOLIDAYS_2025: Event[] = [
  { id: 'h-1', title: '🎉 신정', start: new Date(2025, 0, 1), end: new Date(2025, 0, 1), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-2', title: '🧧 설날 연휴', start: new Date(2025, 0, 28), end: new Date(2025, 0, 28), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-3', title: '🧧 설날', start: new Date(2025, 0, 29), end: new Date(2025, 0, 29), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-4', title: '🧧 설날 연휴', start: new Date(2025, 0, 30), end: new Date(2025, 0, 30), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-5', title: '🇰🇷 삼일절', start: new Date(2025, 2, 1), end: new Date(2025, 2, 1), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-5-1', title: '🇰🇷 삼일절 대체공휴일', start: new Date(2025, 2, 3), end: new Date(2025, 2, 3), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-6', title: '👶 어린이날', start: new Date(2025, 4, 5), end: new Date(2025, 4, 5), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-7', title: '🪷 부처님오신날', start: new Date(2025, 4, 5), end: new Date(2025, 4, 5), isPublic: true, isAllDay: true, isHoliday: true, color: '#f59e0b' },
  { id: 'h-8', title: '🕯️ 현충일', start: new Date(2025, 5, 6), end: new Date(2025, 5, 6), isPublic: true, isAllDay: true, isHoliday: true, color: '#6b7280' },
  { id: 'h-9', title: '🇰🇷 광복절', start: new Date(2025, 7, 15), end: new Date(2025, 7, 15), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-10', title: '🌕 추석 연휴', start: new Date(2025, 9, 5), end: new Date(2025, 9, 5), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-11', title: '🌕 추석', start: new Date(2025, 9, 6), end: new Date(2025, 9, 6), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-12', title: '🌕 추석 연휴', start: new Date(2025, 9, 7), end: new Date(2025, 9, 7), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-12-1', title: '🌕 추석 대체공휴일', start: new Date(2025, 9, 8), end: new Date(2025, 9, 8), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-13', title: '🇰🇷 개천절', start: new Date(2025, 9, 3), end: new Date(2025, 9, 3), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-14', title: '🇰🇷 한글날', start: new Date(2025, 9, 9), end: new Date(2025, 9, 9), isPublic: true, isAllDay: true, isHoliday: true, color: '#ef4444' },
  { id: 'h-15', title: '🎄 크리스마스', start: new Date(2025, 11, 25), end: new Date(2025, 11, 25), isPublic: true, isAllDay: true, isHoliday: true, color: '#22c55e' },
];

// 주차 표시를 위한 커스텀 DateCell 컴포넌트
const DateCellWrapper: React.FC<{
  value: Date;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const weekNumber = getWeek(value, { locale: ko, weekStartsOn: 0 });
  const dayOfWeek = getDay(value);
  const isFirstDayOfWeek = dayOfWeek === 0; // 일요일

  return (
    <div className="relative w-full h-full">
      {isFirstDayOfWeek && (
        <div className="absolute top-0 left-0 md:top-1 md:left-1 text-[7px] md:text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-0.5 py-0 md:px-1.5 md:py-0.5 rounded z-10">
          W{weekNumber}
        </div>
      )}
      {children}
    </div>
  );
};

// Google Calendar 기능 제거 - 공휴일만 표시

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [events, setEvents] = useState<Event[]>([]); // 내 일정 (Supabase)
  const [publicEvents, setPublicEvents] = useState<Event[]>([]); // 공개 일정 (Google Calendar)
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [calendarHeight, setCalendarHeight] = useState(700); // 기본값 데스크톱
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#14b8a6',
    isPublic: false,
    isAllDay: false,
    repeatType: 'none',
  });

  const loadEvents = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .order('start_time', { ascending: true });

    const userEvents = data
      ? data.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          color: event.color,
          isPublic: event.is_public,
          isAllDay: event.is_all_day,
          repeatType: event.repeat_type,
        }))
      : [];

    // 사용자 일정 + 공휴일 데이터 병합
    setEvents([...userEvents, ...KOREAN_HOLIDAYS_2025]);
  }, []);

  const loadPublicEvents = useCallback(async () => {
    // Google Calendar 기능 제거 - 공휴일만 표시
    setPublicEvents([...KOREAN_HOLIDAYS_2025]);
  }, []);

  useEffect(() => {
    if (activeTab === 'personal') {
      loadEvents();
    } else {
      loadPublicEvents();
    }
  }, [activeTab, loadEvents, loadPublicEvents]);

  // 캘린더 높이 설정 (클라이언트 사이드에서만)
  useEffect(() => {
    const updateHeight = () => {
      setCalendarHeight(window.innerWidth < 768 ? 450 : 700);
    };

    // 초기 설정
    updateHeight();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      color: '#14b8a6',
      isPublic: false,
      isAllDay: false,
      repeatType: 'none',
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: Event) => {
    // 공휴일은 편집 불가
    if (event.isHoliday) return;

    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: format(event.start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(event.end, "yyyy-MM-dd'T'HH:mm"),
      color: event.color || '#14b8a6',
      isPublic: event.isPublic,
      isAllDay: event.isAllDay,
      repeatType: event.repeatType || 'none',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 시간 검증: 종료 시간이 시작 시간보다 빠른지 확인
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate < startDate) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    const scheduleData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      start_time: formData.startTime,
      end_time: formData.endTime,
      color: formData.color,
      is_public: formData.isPublic,
      is_all_day: formData.isAllDay,
      repeat_type: formData.repeatType,
    };

    if (selectedEvent) {
      await supabase.from('schedules').update(scheduleData).eq('id', selectedEvent.id);
    } else {
      await supabase.from('schedules').insert(scheduleData);
    }

    setShowModal(false);
    setActiveTab('personal'); // 일정 추가 후 내 일정 탭으로 전환
    loadEvents();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;

    const supabase = createClient();
    await supabase.from('schedules').delete().eq('id', selectedEvent.id);

    setShowModal(false);
    loadEvents();
  };

  const addToGoogleCalendar = (event: Event) => {
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const startDate = formatGoogleDate(event.start);
    const endDate = formatGoogleDate(event.end);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header - 모바일 최적화 */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text">일정 관리</h1>
          {activeTab === 'personal' && (
            <Button
              variant="primary"
              onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}
              className="w-full sm:w-auto text-sm md:text-base"
            >
              ➕ 새 일정
            </Button>
          )}
        </div>

        {/* Tabs - 모바일 최적화 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('public')}
            className={cn(
              'px-3 py-2.5 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200',
              activeTab === 'public'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-400 text-white shadow-lg'
                : 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
            )}
          >
            📅 공개 일정
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              'px-3 py-2.5 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200',
              activeTab === 'personal'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-400 text-white shadow-lg'
                : 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10'
            )}
          >
            🔒 내 일정
          </button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="calendar-container overflow-x-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'public' && (
          <div className="mb-3 md:mb-4 text-gray-600 dark:text-white">
            <p className="text-xs sm:text-sm">
              공연, 라이브 방송, 영상 업로드 등 공개 일정을 확인하실 수 있습니다.
            </p>
          </div>
        )}

        <style jsx global>{`
          /* 기본 캘린더 스타일 */
          .calendar-container .rbc-calendar {
            color: #1f2937;
            font-family: inherit;
            min-width: 100%;
          }

          @media (max-width: 767px) {
            .calendar-container .rbc-calendar {
              min-width: 320px;
            }
          }

          .dark .calendar-container .rbc-calendar {
            color: #f9fafb;
          }

          /* 헤더 (요일) - 모바일 최적화 */
          .calendar-container .rbc-header {
            padding: 0.375rem 0.125rem;
            font-weight: 700;
            font-size: 0.625rem;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
            background: #f9fafb;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-header {
              padding: 1rem 0.5rem;
              font-size: 0.875rem;
            }
          }

          .dark .calendar-container .rbc-header {
            color: #e5e7eb;
            border-bottom-color: #374151;
            background: #1f2937;
          }

          /* 오늘 날짜 배경 */
          .calendar-container .rbc-today {
            background-color: rgba(20, 184, 166, 0.1);
          }

          .dark .calendar-container .rbc-today {
            background-color: rgba(20, 184, 166, 0.15);
          }

          /* 이벤트 기본 스타일 - 모바일 최적화 */
          .calendar-container .rbc-event {
            background-color: #14b8a6;
            border-radius: 0.25rem;
            border: none;
            padding: 0.125rem 0.25rem;
            font-size: 0.625rem;
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s;
            line-height: 1.2;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-event {
              border-radius: 0.375rem;
              padding: 0.375rem 0.625rem;
              font-size: 0.875rem;
              line-height: 1.5;
            }
          }

          .calendar-container .rbc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
          }

          /* 공휴일 스타일 */
          .calendar-container .rbc-event.holiday-event {
            color: white !important;
            border: none !important;
            font-weight: 800 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            cursor: default !important;
          }

          .calendar-container .rbc-event.holiday-event:hover {
            transform: none !important;
          }

          /* 다른 달 날짜 */
          .calendar-container .rbc-off-range-bg {
            background-color: #f9fafb;
          }

          .dark .calendar-container .rbc-off-range-bg {
            background-color: #111827;
          }

          .calendar-container .rbc-off-range {
            color: #d1d5db;
          }

          .dark .calendar-container .rbc-off-range {
            color: #4b5563;
          }

          /* 월간 뷰 컨테이너 */
          .calendar-container .rbc-month-view {
            background: transparent;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            overflow: hidden;
            min-width: 280px;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-month-view {
              min-width: 100%;
            }
          }

          .dark .calendar-container .rbc-month-view {
            border-color: #374151;
          }

          /* 날짜 셀 구분선 */
          .calendar-container .rbc-day-bg {
            border-color: #e5e7eb;
          }

          .dark .calendar-container .rbc-day-bg {
            border-color: #374151;
          }

          .calendar-container .rbc-month-row {
            border-color: #e5e7eb;
          }

          .dark .calendar-container .rbc-month-row {
            border-color: #374151;
          }

          /* 시간 슬롯 */
          .calendar-container .rbc-time-slot {
            border-top: 1px solid #e5e7eb;
          }

          .dark .calendar-container .rbc-time-slot {
            border-top-color: #374151;
          }

          /* 시간 라벨 (주간/일간 뷰의 왼쪽 시간 표시) */
          .calendar-container .rbc-time-header-content,
          .calendar-container .rbc-time-content,
          .calendar-container .rbc-label,
          .calendar-container .rbc-time-gutter {
            color: #374151;
          }

          .dark .calendar-container .rbc-time-header-content,
          .dark .calendar-container .rbc-time-content,
          .dark .calendar-container .rbc-label,
          .dark .calendar-container .rbc-time-gutter {
            color: #ffffff;
            font-weight: 600;
          }

          /* Agenda 뷰 텍스트 */
          .calendar-container .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            color: #374151;
          }

          .dark .calendar-container .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            color: #ffffff;
            font-weight: 500;
          }

          .calendar-container .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
            color: #6b7280;
          }

          .dark .calendar-container .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
            color: #ffffff;
            font-weight: 600;
          }

          /* 날짜 번호 - 모바일 최적화 */
          .calendar-container .rbc-date-cell {
            padding: 0.125rem;
            text-align: right;
            position: relative;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-date-cell {
              padding: 0.5rem;
            }
          }

          .calendar-container .rbc-button-link {
            color: #374151;
            font-weight: 600;
            font-size: 0.625rem;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-button-link {
              font-size: 1rem;
            }
          }

          .dark .calendar-container .rbc-button-link {
            color: #f3f4f6;
          }

          /* 일요일 (빨간색) */
          .calendar-container .rbc-row .rbc-date-cell:first-child .rbc-button-link,
          .calendar-container .rbc-header:first-child {
            color: #ef4444 !important;
          }

          /* 토요일 (파란색) */
          .calendar-container .rbc-row .rbc-date-cell:nth-child(7) .rbc-button-link,
          .calendar-container .rbc-header:nth-child(7) {
            color: #3b82f6 !important;
          }

          .dark .calendar-container .rbc-row .rbc-date-cell:first-child .rbc-button-link,
          .dark .calendar-container .rbc-header:first-child {
            color: #f87171 !important;
          }

          .dark .calendar-container .rbc-row .rbc-date-cell:nth-child(7) .rbc-button-link,
          .dark .calendar-container .rbc-header:nth-child(7) {
            color: #60a5fa !important;
          }

          /* 툴바 - 모바일 최적화 */
          .calendar-container .rbc-toolbar {
            margin-bottom: 1rem;
            padding: 0.5rem;
            background: #f9fafb;
            border-radius: 0.75rem;
            border: 2px solid #e5e7eb;
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            justify-content: space-between;
            align-items: center;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-toolbar {
              margin-bottom: 1.5rem;
              padding: 1rem;
              gap: 0.5rem;
            }
          }

          .dark .calendar-container .rbc-toolbar {
            background: #1f2937;
            border-color: #374151;
          }

          .calendar-container .rbc-toolbar button {
            color: #374151;
            background: white;
            border: 2px solid #e5e7eb;
            padding: 0.375rem 0.5rem;
            border-radius: 0.375rem;
            font-weight: 600;
            font-size: 0.75rem;
            transition: all 0.2s;
            white-space: nowrap;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-toolbar button {
              padding: 0.625rem 1.25rem;
              font-size: 1rem;
              border-radius: 0.5rem;
            }
          }

          .dark .calendar-container .rbc-toolbar button {
            color: #f9fafb;
            background: #374151;
            border-color: #4b5563;
          }

          .calendar-container .rbc-toolbar button:hover {
            background: #f3f4f6;
            border-color: #14b8a6;
            transform: translateY(-1px);
          }

          .dark .calendar-container .rbc-toolbar button:hover {
            background: #4b5563;
            border-color: #14b8a6;
          }

          .calendar-container .rbc-toolbar button.rbc-active {
            background: linear-gradient(135deg, #14b8a6 0%, #6366f1 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);
          }

          .calendar-container .rbc-toolbar .rbc-toolbar-label {
            font-size: 1rem;
            font-weight: 700;
            color: #111827;
            flex: 1 1 auto;
            text-align: center;
            margin: 0;
            order: -1;
            width: 100%;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-toolbar .rbc-toolbar-label {
              font-size: 1.5rem;
              font-weight: 800;
              flex: 0 0 auto;
              order: 0;
              width: auto;
            }
          }

          .dark .calendar-container .rbc-toolbar .rbc-toolbar-label {
            color: #f9fafb;
          }

          /* 툴바 버튼 그룹 */
          .calendar-container .rbc-btn-group {
            display: flex;
            gap: 0.25rem;
          }

          @media (min-width: 768px) {
            .calendar-container .rbc-btn-group {
              gap: 0.5rem;
            }
          }

          /* 주말 배경 색상 */
          /* 일요일 배경 (빨간색) */
          .calendar-container .rbc-day-bg:first-child {
            background-color: rgba(239, 68, 68, 0.05);
          }

          .dark .calendar-container .rbc-day-bg:first-child {
            background-color: rgba(239, 68, 68, 0.1);
          }

          /* 토요일 배경 (파란색) */
          .calendar-container .rbc-day-bg:nth-child(7) {
            background-color: rgba(59, 130, 246, 0.05);
          }

          .dark .calendar-container .rbc-day-bg:nth-child(7) {
            background-color: rgba(59, 130, 246, 0.1);
          }
        `}</style>

        <Calendar
          localizer={localizer}
          events={activeTab === 'public' ? publicEvents : events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: calendarHeight }}
          onSelectSlot={activeTab === 'personal' ? handleSelectSlot : undefined}
          onSelectEvent={handleSelectEvent}
          selectable={activeTab === 'personal'}
          view={view}
          onView={(newView) => setView(newView)}
          views={['month', 'week', 'day', 'agenda']}
          culture="ko"
          messages={{
            month: '월간',
            week: '주간',
            day: '일간',
            agenda: '목록',
            today: 'Today',
            previous: 'Back',
            next: 'Next',
          }}
          eventPropGetter={(event) => ({
            className: event.isHoliday ? 'holiday-event' : '',
            style: event.color
              ? {
                  backgroundColor: event.color,
                  color: 'white',
                  fontWeight: event.isHoliday ? '700' : '600',
                }
              : {},
          })}
          components={{
            dateCellWrapper: DateCellWrapper,
          } as Partial<Components<Event, object>>}
        />
      </Card>

      {/* Modal - 모바일 최적화 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-4 md:pt-20 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <Card
            padding="lg"
            className="relative w-full max-w-2xl my-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-4xl md:text-3xl w-10 h-10 md:w-auto md:h-auto flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="닫기"
            >
              ×
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 pr-8">
              {selectedEvent ? '일정 수정' : '새 일정 추가'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="title"
                label="제목"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                fullWidth
              />

              <Textarea
                id="description"
                label="설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                fullWidth
              />

              <Input
                id="startTime"
                label="시작 시간"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                fullWidth
              />

              <Input
                id="endTime"
                label="종료 시간"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                fullWidth
              />

              <Input
                id="color"
                label="색상"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                fullWidth
              />

              <Select
                id="repeatType"
                label="반복"
                value={formData.repeatType}
                onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
                fullWidth
              >
                <option value="none">없음</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </Select>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                  className="w-4 h-4 text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="isAllDay">종일 일정</label>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="isPublic">공개 일정</label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between pt-6">
                <div className="w-full sm:w-auto">
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addToGoogleCalendar(selectedEvent)}
                      className="w-full sm:w-auto bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm sm:text-base"
                    >
                      📅 Google Calendar에 추가
                    </Button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  {selectedEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      className="w-full sm:w-auto text-sm sm:text-base"
                    >
                      삭제
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    {selectedEvent ? '수정' : '추가'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
