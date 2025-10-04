/**
 * Admin Contacts Page
 * 문의 내역 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const ContactsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[8]};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${tokens.spacing[3]};
  margin-bottom: ${tokens.spacing[6]};
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${tokens.spacing[2]} ${tokens.spacing[5]};
  background: ${(props) =>
    props.$active ? tokens.colors.gradients.kinetic : tokens.colors.glass.light};
  color: ${tokens.colors.white};
  border: none;
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${(props) =>
      props.$active ? tokens.colors.gradients.kinetic : tokens.colors.glass.medium};
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const ContactCard = styled(Card)<{ $status: string }>`
  padding: ${tokens.spacing[6]};
  border-left: 4px solid
    ${(props) =>
      props.$status === 'unread'
        ? tokens.colors.danger
        : props.$status === 'read'
          ? tokens.colors.warning
          : tokens.colors.success};
`;

const ContactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${tokens.spacing[4]};
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[1]};
`;

const ContactEmail = styled.a`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.primary[400]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ContactMeta = styled.div`
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.gray[500]};
  margin-top: ${tokens.spacing[2]};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  background: ${(props) =>
    props.$status === 'unread'
      ? tokens.colors.danger
      : props.$status === 'read'
        ? tokens.colors.warning
        : tokens.colors.success};
  color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.semibold};
  text-transform: uppercase;
`;

const ContactSubject = styled.h4`
  font-size: ${tokens.typography.fontSize.base};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[200]};
  margin-bottom: ${tokens.spacing[3]};
`;

const ContactMessage = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: ${tokens.spacing[4]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${tokens.spacing[3]};
`;

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

  return (
    <ContactsContainer>
      <Title>문의 내역</Title>

      <FilterTabs>
        <TabButton $active={filter === 'all'} onClick={() => setFilter('all')}>
          전체 ({contacts.length})
        </TabButton>
        <TabButton $active={filter === 'unread'} onClick={() => setFilter('unread')}>
          읽지 않음
        </TabButton>
        <TabButton $active={filter === 'read'} onClick={() => setFilter('read')}>
          읽음
        </TabButton>
        <TabButton $active={filter === 'replied'} onClick={() => setFilter('replied')}>
          답변 완료
        </TabButton>
      </FilterTabs>

      <ContactList>
        {contacts.map((contact) => (
          <ContactCard key={contact.id} variant="glass" $status={contact.status}>
            <ContactHeader>
              <ContactInfo>
                <ContactName>{contact.name}</ContactName>
                <ContactEmail href={`mailto:${contact.email}`}>{contact.email}</ContactEmail>
                <ContactMeta>
                  {new Date(contact.created_at).toLocaleString('ko-KR')}
                </ContactMeta>
              </ContactInfo>
              <StatusBadge $status={contact.status}>
                {getStatusLabel(contact.status)}
              </StatusBadge>
            </ContactHeader>

            <ContactSubject>{contact.subject}</ContactSubject>
            <ContactMessage>{contact.message}</ContactMessage>

            <ButtonGroup>
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
            </ButtonGroup>
          </ContactCard>
        ))}

        {contacts.length === 0 && (
          <div style={{ textAlign: 'center', padding: tokens.spacing[12], color: tokens.colors.gray[400] }}>
            <h2>문의 내역이 없습니다</h2>
            <p>새로운 문의가 들어오면 여기에 표시됩니다.</p>
          </div>
        )}
      </ContactList>
    </ContactsContainer>
  );
}
