/**
 * Privacy Policy Page
 * 개인정보 처리방침
 */

import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[8]};
`;

const ContentCard = styled(Card)`
  padding: ${tokens.spacing[8]};
  color: ${tokens.colors.gray[300]};
  line-height: 1.8;

  h2 {
    font-size: ${tokens.typography.fontSize['2xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
    color: ${tokens.colors.white};
    margin-top: ${tokens.spacing[8]};
    margin-bottom: ${tokens.spacing[4]};
  }

  h3 {
    font-size: ${tokens.typography.fontSize.xl};
    font-weight: ${tokens.typography.fontWeight.semibold};
    color: ${tokens.colors.gray[200]};
    margin-top: ${tokens.spacing[6]};
    margin-bottom: ${tokens.spacing[3]};
  }

  p {
    margin-bottom: ${tokens.spacing[4]};
  }

  ul {
    margin-left: ${tokens.spacing[6]};
    margin-bottom: ${tokens.spacing[4]};
  }

  li {
    margin-bottom: ${tokens.spacing[2]};
  }
`;

export default function PrivacyPage() {
  return (
    <Container>
      <Title>개인정보 처리방침</Title>

      <ContentCard variant="glass">
        <p>
          <strong>metaldragon</strong>(이하 "본 사이트")은 이용자의 개인정보를 중요시하며,
          "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <p>본 사이트는 회원가입, 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
        <ul>
          <li>필수 항목: 이메일 주소, 사용자 이름</li>
          <li>소셜 로그인 시: Google/GitHub 계정 정보 (이메일, 프로필 사진)</li>
          <li>자동 수집 항목: 접속 IP, 쿠키, 서비스 이용 기록</li>
        </ul>

        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <ul>
          <li>회원 관리: 회원제 서비스 이용, 본인 확인</li>
          <li>서비스 제공: 게시판, 댓글, 일정 관리, 문의 답변</li>
          <li>마케팅 및 광고: 이벤트 정보 제공 (동의 시)</li>
        </ul>

        <h2>3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이
          파기합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
        </p>
        <ul>
          <li>회원 탈퇴 시: 즉시 삭제</li>
          <li>부정 이용 기록: 3년 보관 (전자상거래법)</li>
        </ul>

        <h2>4. 개인정보의 제3자 제공</h2>
        <p>
          본 사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의
          경우는 예외로 합니다.
        </p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>

        <h2>5. 개인정보의 파기</h2>
        <p>
          개인정보는 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
          파기 방법은 다음과 같습니다.
        </p>
        <ul>
          <li>전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제</li>
          <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
        </ul>

        <h2>6. 이용자의 권리</h2>
        <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람 요구</li>
          <li>개인정보 정정 요구</li>
          <li>개인정보 삭제 요구</li>
          <li>개인정보 처리 정지 요구</li>
        </ul>

        <h2>7. 쿠키의 운용</h2>
        <p>
          본 사이트는 이용자에게 개인화된 서비스를 제공하기 위해 쿠키를 사용합니다.
          이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹브라우저 설정을 통해 쿠키를 거부할 수 있습니다.
        </p>

        <h2>8. 개인정보 보호책임자</h2>
        <p>본 사이트는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
        <ul>
          <li>책임자: metaldragon 관리자</li>
          <li>이메일: admin@metaldragon.co.kr</li>
        </ul>

        <h2>9. 개인정보 처리방침 변경</h2>
        <p>
          본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </p>

        <p style={{ marginTop: tokens.spacing[8], textAlign: 'center' }}>
          <strong>시행일자: 2025년 10월 4일</strong>
        </p>
      </ContentCard>
    </Container>
  );
}
