import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // 🔐 보안: 관리자 인증 체크 (Supabase Auth 사용)
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('[Deploy] Starting deployment to www.metaldragon.co.kr...');

    // 먼저 응답을 보낸 후 비동기로 배포 진행
    setTimeout(async () => {
      try {
        // redeploy.bat 실행 (실제 프로덕션 배포)
        console.log('[Deploy] Executing redeploy.bat...');

        exec('redeploy.bat', {
          cwd: 'C:/Vibe Coding/Homepage/metaldragon',
          shell: 'cmd.exe'
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('[Deploy] Deployment error:', error);
            console.error('[Deploy] stderr:', stderr);

            // 에러 시 개발 서버 재시작
            exec('start /B npm run dev', {
              cwd: 'C:/Vibe Coding/Homepage/metaldragon',
              detached: true,
              stdio: 'ignore'
            });
          } else {
            console.log('[Deploy] Deployment complete!');
            console.log('[Deploy] stdout:', stdout);
          }
        });

      } catch (error: any) {
        console.error('[Deploy] Error:', error);

        // 에러 발생 시 개발 서버 재시작
        try {
          exec('start /B npm run dev', {
            cwd: 'C:/Vibe Coding/Homepage/metaldragon',
            detached: true,
            stdio: 'ignore'
          });
        } catch (e) {
          console.error('[Deploy] Failed to restart dev server:', e);
        }
      }
    }, 100); // 100ms 후 실행 (응답 전송 후)

    return NextResponse.json({
      success: true,
      message: 'Production deployment started! www.metaldragon.co.kr will be updated in ~1 minute.',
      url: 'https://www.metaldragon.co.kr',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Deploy] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Deployment failed'
    }, { status: 500 });
  }
}
