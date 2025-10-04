/**
 * Schedule Page
 * 일정 관리 캘린더
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
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

const ScheduleContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CalendarCard = styled(Card)`
  padding: ${tokens.spacing[6]};

  .rbc-calendar {
    color: ${tokens.colors.white};
  }

  .rbc-header {
    padding: ${tokens.spacing[3]};
    font-weight: ${tokens.typography.fontWeight.semibold};
    color: ${tokens.colors.gray[300]};
    border-bottom: 1px solid ${tokens.colors.glass.light};
  }

  .rbc-today {
    background-color: ${tokens.colors.primary[900]}40;
  }

  .rbc-event {
    background-color: ${tokens.colors.primary[500]};
    border-radius: ${tokens.borderRadius.sm};
    border: none;
    padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
  }

  .rbc-off-range-bg {
    background-color: ${tokens.colors.gray[900]};
  }

  .rbc-month-view {
    background: ${tokens.colors.gray[800]};
    border: 1px solid ${tokens.colors.glass.light};
    border-radius: ${tokens.borderRadius.md};
  }

  .rbc-day-bg {
    border-color: ${tokens.colors.glass.light};
  }

  .rbc-time-slot {
    border-top: 1px solid ${tokens.colors.glass.light};
  }

  .rbc-toolbar {
    margin-bottom: ${tokens.spacing[6]};

    button {
      color: ${tokens.colors.white};
      background: ${tokens.colors.glass.light};
      border: none;
      padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
      border-radius: ${tokens.borderRadius.md};

      &:hover {
        background: ${tokens.colors.glass.medium};
      }

      &.rbc-active {
        background: ${tokens.colors.gradients.kinetic};
      }
    }

    .rbc-toolbar-label {
      font-size: ${tokens.typography.fontSize.xl};
      font-weight: ${tokens.typography.fontWeight.bold};
    }
  }
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  position: fixed;
  z-index: ${tokens.zIndex.modal};
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(Card)`
  position: relative;
  margin: 10% auto;
  padding: ${tokens.spacing[8]};
  width: 90%;
  max-width: 600px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${tokens.spacing[4]};
  right: ${tokens.spacing[4]};
  background: none;
  border: none;
  font-size: ${tokens.typography.fontSize['2xl']};
  color: ${tokens.colors.gray[400]};
  cursor: pointer;

  &:hover {
    color: ${tokens.colors.white};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${tokens.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[300]};
  margin-bottom: ${tokens.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const Checkbox = styled.input`
  margin-right: ${tokens.spacing[2]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  justify-content: flex-end;
  margin-top: ${tokens.spacing[6]};
`;

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
    color: '#667eea',
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
      color: '#667eea',
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
      color: event.color || '#667eea',
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
      // 수정
      await supabase.from('schedules').update(scheduleData).eq('id', selectedEvent.id);
    } else {
      // 생성
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
    <ScheduleContainer>
      <Header>
        <Title>일정 관리</Title>
        <Button variant="primary" onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>
          새 일정 추가
        </Button>
      </Header>

      <CalendarCard variant="glass">
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
      </CalendarCard>

      <Modal $show={showModal} onClick={() => setShowModal(false)}>
        <ModalContent variant="glass" onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>

          <h2 style={{ fontSize: tokens.typography.fontSize['2xl'], marginBottom: tokens.spacing[6], color: tokens.colors.white }}>
            {selectedEvent ? '일정 수정' : '새 일정 추가'}
          </h2>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>제목 *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>설명</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>시작 시간 *</Label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>종료 시간 *</Label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>색상</Label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>반복</Label>
              <Select
                value={formData.repeatType}
                onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
              >
                <option value="none">없음</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label style={{ color: tokens.colors.gray[300], display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                />
                종일 일정
              </label>
            </FormGroup>

            <FormGroup>
              <label style={{ color: tokens.colors.gray[300], display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                공개 일정
              </label>
            </FormGroup>

            <ButtonGroup>
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
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>
    </ScheduleContainer>
  );
}
