/**
 * Schedule Page with Tailwind CSS
 * 일정 관리 캘린더
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
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
}

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

    if (data) {
      setEvents(
        data.map((event) => ({
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
      );
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">일정 관리</h1>
        <Button
          variant="primary"
          onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}
        >
          새 일정 추가
        </Button>
      </div>

      {/* Calendar */}
      <Card padding="lg" className="calendar-container">
        <style jsx global>{`
          .calendar-container .rbc-calendar {
            color: rgb(var(--color-gray-900));
          }

          .dark .calendar-container .rbc-calendar {
            color: rgb(var(--color-white));
          }

          .calendar-container .rbc-header {
            padding: 0.75rem;
            font-weight: 600;
            color: rgb(var(--color-gray-600));
            border-bottom: 1px solid rgb(var(--color-gray-200));
          }

          .dark .calendar-container .rbc-header {
            color: rgb(var(--color-gray-400));
            border-bottom-color: rgb(var(--color-gray-700));
          }

          .calendar-container .rbc-today {
            background-color: rgba(20, 184, 166, 0.1);
          }

          .calendar-container .rbc-event {
            background-color: #14b8a6;
            border-radius: 0.25rem;
            border: none;
            padding: 0.25rem 0.5rem;
          }

          .calendar-container .rbc-off-range-bg {
            background-color: rgb(var(--color-gray-50));
          }

          .dark .calendar-container .rbc-off-range-bg {
            background-color: rgb(var(--color-gray-900));
          }

          .calendar-container .rbc-month-view {
            background: transparent;
            border: 1px solid rgb(var(--color-gray-200));
            border-radius: 0.5rem;
          }

          .dark .calendar-container .rbc-month-view {
            border-color: rgb(var(--color-gray-700));
          }

          .calendar-container .rbc-day-bg {
            border-color: rgb(var(--color-gray-200));
          }

          .dark .calendar-container .rbc-day-bg {
            border-color: rgb(var(--color-gray-700));
          }

          .calendar-container .rbc-time-slot {
            border-top: 1px solid rgb(var(--color-gray-200));
          }

          .dark .calendar-container .rbc-time-slot {
            border-top-color: rgb(var(--color-gray-700));
          }

          .calendar-container .rbc-toolbar {
            margin-bottom: 1.5rem;
          }

          .calendar-container .rbc-toolbar button {
            color: rgb(var(--color-gray-900));
            background: rgb(var(--color-gray-100));
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
          }

          .dark .calendar-container .rbc-toolbar button {
            color: rgb(var(--color-white));
            background: rgb(var(--color-gray-800));
          }

          .calendar-container .rbc-toolbar button:hover {
            background: rgb(var(--color-gray-200));
          }

          .dark .calendar-container .rbc-toolbar button:hover {
            background: rgb(var(--color-gray-700));
          }

          .calendar-container .rbc-toolbar button.rbc-active {
            background: linear-gradient(135deg, #14b8a6 0%, #6366f1 100%);
            color: white;
          }

          .calendar-container .rbc-toolbar .rbc-toolbar-label {
            font-size: 1.25rem;
            font-weight: 700;
          }
        `}</style>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          view={view}
          onView={(newView) => setView(newView)}
          culture="ko"
        />
      </Card>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20"
          onClick={() => setShowModal(false)}
        >
          <Card
            padding="lg"
            className="relative w-[90%] max-w-2xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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

              <div className="flex gap-4 justify-end pt-6">
                {selectedEvent && (
                  <Button type="button" variant="outline" onClick={handleDelete}>
                    삭제
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  {selectedEvent ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
