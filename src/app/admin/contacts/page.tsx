/**
 * Admin Contacts Page - Tailwind CSS
 * 문의 내역 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadContacts();
  }, [filter]);

  const loadContacts = async () => {
    const supabase = createClient();

    let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setContacts(data);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      loadContacts();
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);

    if (!error) {
      loadContacts();
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread':
        return '읽지 않음';
      case 'read':
        return '읽음';
      case 'replied':
        return '답변 완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'border-red-500';
      case 'read':
        return 'border-yellow-500';
      case 'replied':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-500';
      case 'read':
        return 'bg-yellow-500';
      case 'replied':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent mb-8">
        문의 내역
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium text-white transition-all duration-200',
            filter === 'all'
              ? 'bg-gradient-to-r from-teal-500 to-indigo-400'
              : 'bg-white/10 hover:bg-white/15'
          )}
          onClick={() => setFilter('all')}
        >
          전체 ({contacts.length})
        </button>
        <button
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium text-white transition-all duration-200',
            filter === 'unread'
              ? 'bg-gradient-to-r from-teal-500 to-indigo-400'
              : 'bg-white/10 hover:bg-white/15'
          )}
          onClick={() => setFilter('unread')}
        >
          읽지 않음
        </button>
        <button
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium text-white transition-all duration-200',
            filter === 'read'
              ? 'bg-gradient-to-r from-teal-500 to-indigo-400'
              : 'bg-white/10 hover:bg-white/15'
          )}
          onClick={() => setFilter('read')}
        >
          읽음
        </button>
        <button
          className={cn(
            'px-5 py-2 rounded-full text-sm font-medium text-white transition-all duration-200',
            filter === 'replied'
              ? 'bg-gradient-to-r from-teal-500 to-indigo-400'
              : 'bg-white/10 hover:bg-white/15'
          )}
          onClick={() => setFilter('replied')}
        >
          답변 완료
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={cn(
              'bg-white/10 dark:bg-white/5 backdrop-blur-md border-l-4 rounded-lg p-6',
              getStatusColor(contact.status)
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {contact.name}
                </h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-teal-400 hover:underline"
                >
                  {contact.email}
                </a>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(contact.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold text-white uppercase',
                  getStatusBadgeColor(contact.status)
                )}
              >
                {getStatusLabel(contact.status)}
              </span>
            </div>

            <h4 className="text-base font-medium text-gray-200 mb-3">
              {contact.subject}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap mb-4">
              {contact.message}
            </p>

            <div className="flex gap-3">
              {contact.status === 'unread' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(contact.id, 'read')}
                >
                  읽음으로 표시
                </Button>
              )}
              {contact.status === 'read' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(contact.id, 'replied')}
                >
                  답변 완료로 표시
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${contact.email}?subject=Re: ${contact.subject}`;
                  if (contact.status === 'unread') {
                    updateStatus(contact.id, 'read');
                  }
                }}
              >
                이메일 답장
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteContact(contact.id)}>
                삭제
              </Button>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center p-12 text-gray-400">
            <h2 className="text-xl font-semibold mb-2">문의 내역이 없습니다</h2>
            <p>새로운 문의가 들어오면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
