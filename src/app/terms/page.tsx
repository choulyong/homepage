/**
 * Terms of Service Page
 * 이용약관
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

export default function TermsPage() {
  return (
    <Container>
      <Title>이용약관</Title>

      <ContentCard variant="glass">
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 metaldragon(이하 "본 사이트")이 제공하는 모든 서비스의 이용 조건 및 절차,
          이용자와 본 사이트의 권리, 의무, 책임사항 등을 규정함을 목적으로 합니다.
        </p>

        <h2>제2조 (정의)</h2>
        <ul>
          <li>"서비스"란 본 사이트가 제공하는 모든 콘텐츠 및 기능을 의미합니다.</li>
          <li>"회원"이란 본 사이트에 회원등록을 한 자로서, 본 사이트의 정보를 지속적으로 제공받으며, 본 사이트가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
          <li>"이용자"란 본 사이트에 접속하여 본 약관에 따라 본 사이트가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
        </ul>

        <h2>제3조 (약관의 효력 및 변경)</h2>
        <p>
          본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
          본 사이트는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 약관이 변경된 경우에는
          지체 없이 이를 공지합니다.
        </p>

        <h2>제4조 (회원가입)</h2>
        <ul>
          <li>회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후, 본 사이트가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
          <li>본 사이트는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
            <ul>
              <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
              <li>허위의 정보를 기재하거나, 본 사이트가 제시하는 내용을 기재하지 않은 경우</li>
            </ul>
          </li>
        </ul>

        <h2>제5조 (서비스의 제공)</h2>
        <p>본 사이트는 다음과 같은 서비스를 제공합니다.</p>
        <ul>
          <li>게시판 서비스 (AI 스터디, 빅데이터 스터디, 자유게시판, AI 작품 갤러리)</li>
          <li>일정 관리 서비스</li>
          <li>IT 뉴스 제공</li>
          <li>YouTube 커버 영상 갤러리</li>
          <li>문의하기 서비스</li>
          <li>기타 본 사이트가 정하는 서비스</li>
        </ul>

        <h2>제6조 (서비스의 중단)</h2>
        <p>본 사이트는 다음 각 호에 해당하는 경우 서비스 제공을 중단할 수 있습니다.</p>
        <ul>
          <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
          <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우</li>
          <li>기타 불가항력적 사유가 있는 경우</li>
        </ul>

        <h2>제7조 (회원의 의무)</h2>
        <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
        <ul>
          <li>신청 또는 변경 시 허위내용의 등록</li>
          <li>타인의 정보 도용</li>
          <li>본 사이트에 게시된 정보의 변경</li>
          <li>본 사이트가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
          <li>본 사이트 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
          <li>본 사이트 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
          <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 본 사이트에 공개 또는 게시하는 행위</li>
        </ul>

        <h2>제8조 (저작권의 귀속 및 이용제한)</h2>
        <p>
          본 사이트가 작성한 저작물에 대한 저작권 기타 지적재산권은 본 사이트에 귀속합니다.
          이용자는 본 사이트를 이용함으로써 얻은 정보를 본 사이트의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
        </p>

        <h2>제9조 (분쟁해결)</h2>
        <p>
          본 사이트는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
        </p>

        <h2>제10조 (재판권 및 준거법)</h2>
        <p>
          본 사이트와 이용자 간에 발생한 서비스 이용에 관한 분쟁에 대하여는 대한민국 법을 적용하며,
          본 분쟁으로 인한 소는 민사소송법상의 관할법원에 제기합니다.
        </p>

        <p style={{ marginTop: tokens.spacing[8], textAlign: 'center' }}>
          <strong>시행일자: 2025년 10월 4일</strong>
        </p>
      </ContentCard>
    </Container>
  );
}
