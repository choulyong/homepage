/**
 * Admin Finance Management
 * 가계부 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const FinanceContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[8]};
`;

const SummaryCard = styled(Card)`
  padding: ${tokens.spacing[6]};
  text-align: center;
`;

const SummaryValue = styled.div<{ $type?: 'income' | 'expense' | 'balance' }>`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${(props) =>
    props.$type === 'income'
      ? tokens.colors.success
      : props.$type === 'expense'
        ? tokens.colors.danger
        : tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const SummaryLabel = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${tokens.spacing[6]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form``;

const FormCard = styled(Card)`
  padding: ${tokens.spacing[6]};
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

const TextArea = styled.textarea`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
  }
`;

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
`;

const ExpenseItem = styled(Card)`
  padding: ${tokens.spacing[4]};
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: ${tokens.spacing[4]};
  align-items: center;
`;

const TypeBadge = styled.span<{ $type: 'income' | 'expense' }>`
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  background: ${(props) =>
    props.$type === 'income' ? tokens.colors.success : tokens.colors.danger};
  color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.semibold};
`;

const ExpenseInfo = styled.div``;

const ExpenseTitle = styled.div`
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[1]};
`;

const ExpenseDetails = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const Amount = styled.div<{ $type: 'income' | 'expense' }>`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${(props) => (props.$type === 'income' ? tokens.colors.success : tokens.colors.danger)};
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  margin-bottom: ${tokens.spacing[4]};
  background: ${(props) =>
    props.$type === 'success' ? `${tokens.colors.success}15` : `${tokens.colors.danger}15`};
  border: 1px solid
    ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
  color: ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
`;

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('transaction_date', { ascending: false })
      .limit(50);

    if (data) {
      setExpenses(data);

      // 합계 계산
      const income = data
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const expense = data
        .filter((e) => e.type === 'expense')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      setSummary({
        income,
        expense,
        balance: income - expense,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('로그인이 필요합니다');

      const { error } = await supabase.from('expenses').insert({
        user_id: user.id,
        title: formData.title,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        transaction_date: formData.transactionDate,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '내역이 추가되었습니다!' });
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });

      loadExpenses();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 내역을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '내역이 삭제되었습니다.' });
      loadExpenses();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  return (
    <FinanceContainer>
      <Header>
        <Title>가계부</Title>
      </Header>

      <SummaryGrid>
        <SummaryCard variant="glass">
          <SummaryValue $type="income">
            +{summary.income.toLocaleString()}원
          </SummaryValue>
          <SummaryLabel>총 수입</SummaryLabel>
        </SummaryCard>

        <SummaryCard variant="glass">
          <SummaryValue $type="expense">
            -{summary.expense.toLocaleString()}원
          </SummaryValue>
          <SummaryLabel>총 지출</SummaryLabel>
        </SummaryCard>

        <SummaryCard variant="glass">
          <SummaryValue $type="balance">
            {summary.balance.toLocaleString()}원
          </SummaryValue>
          <SummaryLabel>잔액</SummaryLabel>
        </SummaryCard>
      </SummaryGrid>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <ContentGrid>
        <Form onSubmit={handleSubmit}>
          <FormCard variant="glass">
            <h2
              style={{
                fontSize: tokens.typography.fontSize.xl,
                marginBottom: tokens.spacing[4],
                color: tokens.colors.white,
              }}
            >
              내역 추가
            </h2>

            <FormGroup>
              <Label>유형</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>제목 *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="점심 식사"
              />
            </FormGroup>

            <FormGroup>
              <Label>금액 *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="10000"
              />
            </FormGroup>

            <FormGroup>
              <Label>카테고리</Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="식비, 교통비, 쇼핑..."
              />
            </FormGroup>

            <FormGroup>
              <Label>날짜 *</Label>
              <Input
                type="date"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({ ...formData, transactionDate: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>메모</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="선택사항"
              />
            </FormGroup>

            <Button type="submit" variant="primary" disabled={loading} fullWidth>
              {loading ? '추가 중...' : '추가'}
            </Button>
          </FormCard>
        </Form>

        <div>
          <FormCard variant="glass">
            <h2
              style={{
                fontSize: tokens.typography.fontSize.xl,
                marginBottom: tokens.spacing[4],
                color: tokens.colors.white,
              }}
            >
              최근 내역
            </h2>

            <ExpenseList>
              {expenses.map((expense) => (
                <ExpenseItem key={expense.id} variant="bordered">
                  <TypeBadge $type={expense.type}>
                    {expense.type === 'income' ? '수입' : '지출'}
                  </TypeBadge>
                  <ExpenseInfo>
                    <ExpenseTitle>{expense.title}</ExpenseTitle>
                    <ExpenseDetails>
                      {expense.category && `${expense.category} • `}
                      {new Date(expense.transaction_date).toLocaleDateString('ko-KR')}
                    </ExpenseDetails>
                  </ExpenseInfo>
                  <Amount $type={expense.type}>
                    {expense.type === 'income' ? '+' : '-'}
                    {Number(expense.amount).toLocaleString()}원
                  </Amount>
                  <Button variant="outline" onClick={() => handleDelete(expense.id)}>
                    삭제
                  </Button>
                </ExpenseItem>
              ))}
            </ExpenseList>
          </FormCard>
        </div>
      </ContentGrid>
    </FinanceContainer>
  );
}
