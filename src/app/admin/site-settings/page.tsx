'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (data) {
      setSettings(data);
      const values: Record<string, string> = {};
      data.forEach((setting) => {
        values[setting.key] = setting.value;
      });
      setEditValues(values);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const supabase = createClient();

    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: editValues[setting.key] })
          .eq('key', setting.key);

        if (error) throw error;
      }

      setMessage('✅ 설정이 성공적으로 저장되었습니다!');
      await loadSettings();
    } catch (error: any) {
      setMessage(`❌ 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold gradient-text mb-2">
          사이트 설정
        </h1>
        <p className="text-lg text-gray-600 dark:text-white">
          홈페이지 메인 텍스트를 수정할 수 있습니다
        </p>
      </div>

      <Card padding="lg" className="mb-6">
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                {setting.description}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-100 mb-2">
                키: {setting.key}
              </p>
              {setting.key.includes('subtitle') ? (
                <textarea
                  value={editValues[setting.key] || ''}
                  onChange={(e) =>
                    setEditValues({ ...editValues, [setting.key]: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={setting.description}
                />
              ) : (
                <input
                  type="text"
                  value={editValues[setting.key] || ''}
                  onChange={(e) =>
                    setEditValues({ ...editValues, [setting.key]: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={setting.description}
                />
              )}
              <p className="text-xs text-gray-400">
                마지막 수정: {new Date(setting.updated_at).toLocaleString('ko-KR')}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {saving ? '저장 중...' : '💾 변경사항 저장'}
          </Button>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes('성공')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📝 사용 팁
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-white">
          <li>• 히어로 부제목에서 줄바꿈을 원하면 <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">&lt;br /&gt;</code>를 사용하세요</li>
          <li>• 변경사항은 저장 후 홈페이지를 새로고침하면 즉시 반영됩니다</li>
          <li>• 텍스트는 마크다운이 아닌 일반 텍스트로 저장됩니다</li>
        </ul>
      </Card>
    </div>
  );
}
