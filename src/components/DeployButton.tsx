'use client';

import { useState } from 'react';

export default function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDeploy = async () => {
    if (isDeploying) return;

    // 확인 다이얼로그
    if (!confirm('🚀 www.metaldragon.co.kr 프로덕션 배포를 시작하시겠습니까?\n\n약 1분 후 실제 도메인에 반영됩니다.')) {
      return;
    }

    setIsDeploying(true);
    setStatus('idle');
    setMessage('www.metaldragon.co.kr 배포 중...');

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(`✅ www.metaldragon.co.kr 배포가 시작되었습니다!\n\n약 1분 후 실제 도메인에 반영됩니다.`);

        // 1분 후 페이지 새로고침 (프로덕션 배포 완료 대기)
        setTimeout(() => {
          window.location.reload();
        }, 60000);
      } else {
        setStatus('error');
        setMessage(`❌ 배포 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ 네트워크 오류: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleDeploy}
        disabled={isDeploying}
        className={`
          px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 shadow-lg
          ${isDeploying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-95'
          }
        `}
      >
        {isDeploying ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            배포 중...
          </span>
        ) : (
          '🚀 프로덕션 배포'
        )}
      </button>

      {message && (
        <div className={`
          p-4 rounded-lg border-2
          ${status === 'success' ? 'bg-green-50 border-green-500 text-green-800' : ''}
          ${status === 'error' ? 'bg-red-50 border-red-500 text-red-800' : ''}
          ${status === 'idle' ? 'bg-blue-50 border-blue-500 text-blue-800' : ''}
        `}>
          <p className="font-medium">{message}</p>
          {status === 'success' && (
            <p className="text-sm mt-2">약 1분 후 자동으로 새로고침됩니다...</p>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p><strong>🚀 프로덕션 배포 과정:</strong></p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>프로덕션 빌드 실행 (약 30초)</li>
          <li>기존 서버 종료 (3000 포트)</li>
          <li>새 프로덕션 서버 시작</li>
          <li>www.metaldragon.co.kr 업데이트 완료</li>
          <li>자동 새로고침 (1분 후)</li>
        </ol>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
          💡 Nginx → localhost:3000 → Cloudflare → www.metaldragon.co.kr
        </p>
      </div>
    </div>
  );
}
