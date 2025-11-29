import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('🔄 Starting news crawler...');
    console.log('Working directory:', process.cwd());

    const scriptPath = path.join(process.cwd(), 'scripts', 'crawl-rock-news.js');
    console.log('Script path:', scriptPath);

    // Execute the crawler script with explicit working directory
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      cwd: process.cwd(),
      timeout: 60000, // Increase timeout to 60 seconds
      env: process.env, // Pass environment variables
    });

    console.log('✅ News crawler completed');

    // Log stderr but don't treat it as error (some RSS feeds may fail)
    if (stderr) {
      console.warn('Crawler warnings:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'News crawler completed successfully',
      articlesFound: (stdout.match(/✅ \d+개 저장 완료/g) || []).length,
      output: stdout.slice(-500), // Return last 500 chars to avoid large response
    });
  } catch (error) {
    console.error('❌ News crawler error:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to crawl news',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
