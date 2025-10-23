/**
 * 빅데이터 게시판 템플릿 상수
 * 학습노트, 기출_오답노트, 미니프로젝트 등의 게시물 템플릿 정의
 */

export const BIGDATA_SUB_CATEGORIES = {
  DASHBOARD: 'dashboard',
  STUDY_NOTE: 'study_note',
  PAST_EXAM: 'past_exam',
  MINI_PROJECT: 'mini_project',
  USEFUL_RESOURCES: 'useful_resources',
} as const;

export type BigdataSubCategory = typeof BIGDATA_SUB_CATEGORIES[keyof typeof BIGDATA_SUB_CATEGORIES];

export const SUB_CATEGORY_LABELS: Record<BigdataSubCategory, string> = {
  [BIGDATA_SUB_CATEGORIES.DASHBOARD]: '📊 대시보드',
  [BIGDATA_SUB_CATEGORIES.STUDY_NOTE]: '📒 학습노트',
  [BIGDATA_SUB_CATEGORIES.PAST_EXAM]: '📝 기출 & 오답노트',
  [BIGDATA_SUB_CATEGORIES.MINI_PROJECT]: '💻 미니 프로젝트',
  [BIGDATA_SUB_CATEGORIES.USEFUL_RESOURCES]: '🔗 유용한 자료',
};

// 대시보드 템플릿
export const DASHBOARD_TEMPLATE = `# 🚀 데이터 사이언스 Lv.2 & 빅분기 학습 대시보드 📊

안녕하세요! 이 공간은 **회사 데이터 사이언스 Lv.2 과정**과 **빅데이터 분석기사 자격증** 취득을 위한 학습 내용을 체계적으로 기록하고 관리하는 개인 위키입니다.

## 📊 대시보드 (Dashboard)

### 🎯 현재 진행 상황
- **데이터 사이언스 Lv.2:** \`[▓▓▓▓▓░░░░░] 50%\`
- **빅데이터 분석기사 (필기):** \`[▓▓▓▓▓▓▓▓░░] 80%\`
- **빅데이터 분석기사 (실기):** \`[▓▓░░░░░░░░] 20%\`
*(이 부분은 주기적으로 수정하여 업데이트하세요.)*

### ✅ 이번 주 목표 (Weekly Goals)
- [x] DS Lv.2: 3주차 머신러닝 기초 강의 수강 및 정리
- [ ] 빅분기: 4과목(빅데이터 결과 해석) 핵심 개념 정리
*(이 부분도 매주 목표를 설정하고 수정하여 관리하세요.)*

### 🗓️ 주요 일정 (D-DAY)
- **빅데이터 분석기사 필기시험:** 202X-XX-XX (D-XX)
- **DS Lv.2 과정 종료:** 202X-XX-XX (D-XX)

## 📚 바로가기 (게시판 카테고리 링크)
*게시판의 각 카테고리 링크를 여기에 연결해두면 편리합니다.*

| 구분 | 설명 |
| :--- | :--- |
| **📒 학습 노트** | 과정별 학습 내용을 정리합니다. |
| **📝 기출 & 오답노트** | 빅분기 기출문제를 풀고 분석합니다. |
| **💻 미니 프로젝트** | 학습한 내용을 적용하는 실습 프로젝트입니다. |
| **🔗 유용한 자료** | 참고하면 좋은 아티클, 강의, 라이브러리 모음입니다. |
`;

// 학습노트 템플릿
export const STUDY_NOTE_TEMPLATE = `# [과목명] Chapter X. 학습 주제

- **학습일**: 202X-XX-XX
- **관련 과정**: 데이터 사이언스 Lv.2, 빅데이터 분석기사
- **핵심 키워드**: \`#머신러닝\`, \`#선형회귀\`, \`#정규화\`

---

## 1. 핵심 개념 정리
(여기에 배운 내용의 핵심을 자신의 언어로 정리합니다.)

## 2. 코드 실습
(학습 중 작성한 중요한 코드나 실습 결과를 기록합니다.)
\`\`\`python
import pandas as pd
# 코드 예시
df = pd.DataFrame({'a': [1, 2], 'b': [3, 4]})
print(df.head())
\`\`\`

## 3. 중요 포인트 및 회고 🤔
- **헷갈렸던 점**: (개념 이해에 어려웠던 부분을 기록하고, 어떻게 해결했는지 적어보세요.)
- **실무 적용 아이디어**: (오늘 배운 내용을 회사 업무에 어떻게 적용할 수 있을지 아이디어를 기록합니다.)
`;

// 기출 & 오답노트 템플릿
export const PAST_EXAM_TEMPLATE = `# [빅데이터 분석기사] OOOO년 N회차 필기 오답노트

- **시험일**: 202X-XX-XX
- **과목**: 제2과목 데이터 탐색
- **결과**: 푼 문제 20개 / 맞은 개수 15개 (정답률 75%)

---

## 문제 1. (문제 번호 및 제목)

> (여기에 문제 내용을 그대로 붙여넣거나 요약합니다.)
> 1. 보기 1
> 2. 보기 2

- **나의 선택**: 1번
- **정답**: 2번

### 🤔 오답 분석 및 정리
1. **오답 원인**: (개념 부족, 문제 오독, 계산 실수 등 원인을 명확히 적습니다.)
2. **관련 핵심 개념 다시보기**: (책이나 강의 내용을 참고하여 핵심 개념을 다시 정리합니다.)
3. **결론 및 암기 포인트**: (다음에는 틀리지 않기 위해 꼭 기억해야 할 점을 한두 문장으로 요약합니다.)

---

## 문제 2. (다음 문제)
...
`;

// 미니프로젝트 템플릿
export const MINI_PROJECT_TEMPLATE = `# 프로젝트: 타이타닉 생존자 예측 모델링

- **기간**: 202X-XX-XX ~ 202X-XX-XX
- **목표**: 타이타닉 데이터를 분석하고, 생존자를 예측하는 머신러닝 모델을 만든다.
- **주요 사용 기술**: \`#Pandas\`, \`#Scikit-learn\`, \`#Matplotlib\`

---

## 1. 개요 및 목표
(프로젝트의 목적과 달성하고자 하는 목표를 서술합니다.)

## 2. 데이터 탐색 및 전처리 (EDA)
(데이터를 불러오고, 분석하고, 모델링에 맞게 가공하는 과정을 코드를 포함하여 설명합니다.)

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

# 데이터 로드
df = pd.read_csv('titanic.csv')

# 기본 탐색
print(df.head())
print(df.info())
\`\`\`

## 3. 모델링 및 성능 평가
(사용한 모델과 그 성능을 기록합니다. 혼동 행렬, 정확도 등을 포함하면 좋습니다.)

## 4. 결론 및 회고
(프로젝트를 통해 배운 점, 아쉬웠던 점, 개선할 점 등을 자유롭게 작성합니다.)
`;

// 유용한 자료 템플릿
export const USEFUL_RESOURCES_TEMPLATE = `# 유용한 자료 - [주제명]

- **자료 종류**: 아티클 / 강의 / 라이브러리 / 문서
- **출처**: [링크]
- **추가일**: 202X-XX-XX

---

## 📌 핵심 요약
(이 자료의 핵심 내용을 간단히 요약합니다.)

## 💡 활용 방법
(이 자료를 어떻게 활용할 수 있는지, 어떤 상황에 유용한지 기록합니다.)

## 🔖 참고 사항
(추가로 참고하면 좋을 관련 자료나 메모를 남깁니다.)
`;

// 템플릿 매핑
export const TEMPLATES: Record<BigdataSubCategory, string> = {
  [BIGDATA_SUB_CATEGORIES.DASHBOARD]: DASHBOARD_TEMPLATE,
  [BIGDATA_SUB_CATEGORIES.STUDY_NOTE]: STUDY_NOTE_TEMPLATE,
  [BIGDATA_SUB_CATEGORIES.PAST_EXAM]: PAST_EXAM_TEMPLATE,
  [BIGDATA_SUB_CATEGORIES.MINI_PROJECT]: MINI_PROJECT_TEMPLATE,
  [BIGDATA_SUB_CATEGORIES.USEFUL_RESOURCES]: USEFUL_RESOURCES_TEMPLATE,
};
