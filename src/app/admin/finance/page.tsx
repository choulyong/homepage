/**
 * Admin Finance Management - Tailwind CSS
 * 가계부 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
          가계부
        </h1>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">
            +{summary.income.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-400">총 수입</div>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-500 mb-2">
            -{summary.expense.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-400">총 지출</div>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {summary.balance.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-400">잔액</div>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            'p-4 rounded-md mb-4 border',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-6 md:grid-cols-1">
        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">내역 추가</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">유형</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
              >
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="점심 식사"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">금액 *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="10000"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="식비, 교통비, 쇼핑..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">날짜 *</label>
              <input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">메모</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="선택사항"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white min-h-[80px] resize-y font-[inherit] focus:outline-none focus:border-teal-500"
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading} fullWidth>
              {loading ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>

        <div>
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
            <h2 className="text-xl text-white mb-4">최근 내역</h2>

            <div className="flex flex-col gap-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border border-white/18 rounded-lg p-4 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center"
                >
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold text-white',
                      expense.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    )}
                  >
                    {expense.type === 'income' ? '수입' : '지출'}
                  </span>
                  <div>
                    <div className="font-medium text-white mb-1">{expense.title}</div>
                    <div className="text-sm text-gray-400">
                      {expense.category && `${expense.category} • `}
                      {new Date(expense.transaction_date).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'text-lg font-bold',
                      expense.type === 'income' ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {expense.type === 'income' ? '+' : '-'}
                    {Number(expense.amount).toLocaleString()}원
                  </div>
                  <Button variant="outline" onClick={() => handleDelete(expense.id)}>
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
