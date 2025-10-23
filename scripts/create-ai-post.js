/**
 * AI 스터디 게시판에 글 작성 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhzqhvjkkfpeavdphoit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoenFodmpra2ZwZWF2ZHBob2l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ3Mzk2OSwiZXhwIjoyMDc1MDQ5OTY5fQ.Hlh-TPsTnK4Sc5T3QVbrjK7TfE26FnZNZs3aY0D4d4E';

const supabase = createClient(supabaseUrl, supabaseKey);

const postTitle = '2025년 최신 AI 사이트 총정리 - ChatGPT, Claude, Gemini 등 주요 AI 서비스 비교';

const postContent = `# 2025년 최신 AI 사이트 총정리

인공지능 기술이 급속도로 발전하면서 다양한 AI 서비스들이 등장하고 있습니다. 각 서비스마다 특징과 강점이 다르기 때문에, 목적에 맞는 AI를 선택하는 것이 중요합니다. 2025년 최신 정보를 바탕으로 주요 AI 사이트들을 정리해드립니다.

---

## 1. 🤖 ChatGPT (OpenAI)

**사이트**: https://chat.openai.com/
**개발사**: OpenAI

### 특징
- 가장 대중적인 대화형 AI
- 자연스러운 대화, 코딩, 번역, 창작 등 다양한 작업 수행
- GPT-4 모델은 이미지 인식 및 분석 가능
- 플러그인과 GPTs를 통한 확장 기능

### 요금제 (2025년 기준)
| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| **Free** | 무료 | GPT-3.5, GPT-4o 미니 사용 가능 (하루 8~10회 제한) |
| **Plus** | $20/월 (₩28,000) | GPT-4 무제한, 빠른 응답, 우선 접근권 |
| **Pro** | $200/월 (₩280,000) | GPT-4.0 무제한, 고급 음성, 1:1 전용 지원 |
| **Team** | $25~30/월 | Plus 기능 + 비즈니스 보안 (SAML SSO, MFA) |
| **Enterprise** | 문의 | 대규모 조직용 맞춤 솔루션 |

### 추천 대상
- 일반적인 AI 활용: 무료/Plus
- 고급 생산성 작업: Pro
- 팀/기업: Team/Enterprise

---

## 2. 🧠 Claude (Anthropic)

**사이트**: https://claude.ai/
**개발사**: Anthropic

### 특징
- 긴 문맥 이해에 강점 (최대 200K 토큰)
- 안전하고 윤리적인 AI 응답
- 코딩 능력이 뛰어남 (특히 Sonnet 4.5)
- 2025년 9월 출시된 Sonnet 4.5는 에이전틱 능력 크게 향상
- 웹 검색 기능 전 요금제에서 사용 가능 (2025년 5월 업데이트)

### 요금제
| 플랜 | 가격 | API 가격 (1M 토큰) |
|------|------|---------------------|
| **Free** | 무료 | 제한적 사용 |
| **Pro** | $20/월 | - |
| **API - Sonnet** | - | 입력 $3, 출력 $15 |
| **API - Opus** | - | 입력 $15, 출력 $75 |

### 추천 대상
- 긴 문서 분석 및 요약
- 코딩 작업 (특히 복잡한 프로젝트)
- 안전하고 윤리적인 AI 응답이 필요한 경우

---

## 3. ✨ Google Gemini

**사이트**: https://gemini.google.com/
**개발사**: Google

### 특징
- Google 생태계와 완벽한 통합 (Gmail, Docs, Drive 등)
- 멀티모달 AI (텍스트, 이미지, 동영상 이해)
- 제미나이 라이브: 카메라/화면 공유 실시간 대화 (무료)
- 이마젠 4 (Imagen 4): 향상된 이미지 생성
- 비오 3 (Veo 3): 음향 효과까지 구현 가능한 동영상 생성

### 요금제
| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| **Free** | 무료 | 제미나이 라이브, 기본 기능 |
| **AI Pro** | $19.99/월 | Gemini 2.5 Pro, 플로우, 노트북LM |
| **AI Ultra** | $249.99/월 | 최강 모델, 최고 사용 한도, 실험 기능 우선 체험 |

### API 가격
- **Gemini 2.5 Pro**: 입력 $1.25/1M, 출력 $10/1M (20만 토큰 이하)
- **Gemini 2.0 Flash**: 입력 $0.10/1M, 출력 $0.40/1M

### 추천 대상
- Google 워크스페이스 사용자
- 멀티모달 작업 (이미지/동영상 분석)
- 동영상 생성 (Veo 3)

---

## 4. 🎨 Midjourney (이미지 생성)

**사이트**: https://www.midjourney.com/
**개발사**: Midjourney, Inc.

### 특징
- 가장 높은 품질의 AI 이미지 생성
- 판타지, SF 풍 이미지에 특히 강점
- 2025년 추가: 이미지를 동영상으로 변환 기능
- Discord 기반 인터페이스

### 요금제
| 플랜 | 가격 (월간) | 가격 (연간, 20% 할인) | 이미지 생성 제한 | 비공개 모드 |
|------|-------------|----------------------|------------------|-------------|
| **Basic** | $10/월 | $8/월 | 200개 | ❌ |
| **Standard** | $30/월 | $24/월 | Fast Hour 제한 | ❌ |
| **Pro** | $60/월 | $48/월 | Fast Hour 무제한 | ✅ |
| **Mega** | $120/월 | $96/월 | 최대 용량 | ✅ |

### 상업적 이용
- 개인: 모든 플랜에서 상업적 이용 가능
- 기업 (연 매출 100만 달러 이상): Pro/Mega 필수

### 추천 대상
- 고품질 아트워크 생성
- 상업적 용도의 이미지
- 판타지/SF 컨셉 아트

---

## 5. 🔍 Perplexity AI (AI 검색 엔진)

**사이트**: https://www.perplexity.ai/
**개발사**: Perplexity

### 특징
- **실시간 최신 정보 제공** (기존 AI의 지식 컷오프 문제 해결)
- 모든 답변에 **출처 및 인용** 제공
- GPT-4o, Claude 3.5, Sonar, Llama 3.1 등 다양한 AI 모델 선택 가능
- 이미지 생성 기능 (Painting, Photograph, Illustration, Diagram 4가지 스타일)

### 요금제
| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| **Free** | 무료 | Pro 검색 하루 3회 제한 |
| **Pro** | $20/월 | 무제한 Pro 검색, 이미지 생성, 모델 선택 |
| **Max** | $200/월 | 고급 사용자용 (2025년 신규) |
| **Enterprise Pro** | 맞춤 견적 | 기업/연구기관용 |

### 한국 프로모션
- **SKT 고객**: Perplexity Pro 1년 무료 (약 ₩290,000 상당)
- **NH투자증권**: 2025년 12월 31일까지 모든 고객에게 1년 무료

### 추천 대상
- 최신 정보가 필요한 연구/조사
- 출처가 명확한 답변이 필요한 경우
- 다양한 AI 모델을 비교하고 싶은 경우

---

## 6. 기타 주요 AI 서비스

### 🎭 Character.AI
- **사이트**: https://character.ai/
- **특징**: 다양한 캐릭터와 롤플레이 대화
- **요금**: 무료 / Plus $9.99/월

### 🖼️ DALL-E 3 (OpenAI)
- **사이트**: ChatGPT Plus에 통합
- **특징**: 자연어 기반 이미지 생성
- **요금**: ChatGPT Plus 구독 필요 ($20/월)

### 🎬 Runway ML
- **사이트**: https://runwayml.com/
- **특징**: AI 동영상 편집 및 생성
- **요금**: Free / Standard $12/월 / Pro $28/월

---

## 📊 AI 서비스 선택 가이드

### 용도별 추천

| 용도 | 추천 AI | 이유 |
|------|---------|------|
| **일반 대화/질문** | ChatGPT, Claude | 범용성, 사용 편의성 |
| **코딩/프로그래밍** | Claude (Sonnet 4.5), ChatGPT | 코드 품질, 디버깅 능력 |
| **최신 정보 검색** | Perplexity AI | 실시간 정보, 출처 제공 |
| **이미지 생성** | Midjourney, DALL-E 3 | 품질, 스타일 다양성 |
| **동영상 생성** | Gemini (Veo 3), Runway ML | 음향 효과, 편집 기능 |
| **긴 문서 분석** | Claude | 200K 토큰 문맥 이해 |
| **Google 생태계 활용** | Gemini | Gmail, Docs 통합 |

### 가격대별 추천

| 예산 | 추천 조합 |
|------|-----------|
| **무료** | ChatGPT Free + Gemini Free + Perplexity Free |
| **월 $20 이하** | ChatGPT Plus 또는 Claude Pro 또는 Perplexity Pro |
| **월 $50 이하** | ChatGPT Plus + Perplexity Pro + Midjourney Basic |
| **월 $100 이상** | ChatGPT Pro + Midjourney Pro + Gemini AI Pro |

---

## 🎯 결론

2025년 현재, AI 시장은 빠르게 진화하고 있으며 각 서비스마다 독특한 강점을 가지고 있습니다:

- **범용성**: ChatGPT, Claude
- **검색/최신 정보**: Perplexity AI
- **이미지 생성**: Midjourney
- **Google 생태계**: Gemini
- **동영상 생성**: Veo 3 (Gemini), Runway ML

자신의 용도와 예산에 맞는 AI를 선택하여 생산성을 극대화하세요!

---

*마지막 업데이트: 2025년 10월 15일*
*출처: 각 AI 서비스 공식 웹사이트 및 가격 정책 페이지*`;

async function createPost() {
  console.log('🤖 AI 스터디 게시판에 글 작성 중...\n');

  // 관리자 사용자 ID (choulyong@gmail.com)
  const adminUserId = 'e869b24f-3389-4799-9de5-5652d9073163';

  const { data, error } = await supabase.from('posts').insert({
    user_id: adminUserId,
    category: 'ai_study',
    title: postTitle,
    content: postContent,
    is_pinned: true, // 공지로 고정
  }).select();

  if (error) {
    console.error('❌ 게시글 작성 실패:', error);
    return;
  }

  console.log('✅ 게시글 작성 완료!');
  console.log(`📌 제목: ${postTitle}`);
  console.log(`🔗 게시글 ID: ${data[0].id}`);
  console.log(`\n📍 확인: http://localhost:3000/board/ai_study/${data[0].id}`);
}

createPost();
