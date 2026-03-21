export const metadata = {
  title: "이용약관 | KPEC 기업정책자금센터",
};

const sections = [
  {
    title: "제1조 (목적)",
    content:
      "이 약관은 KPEC 기업정책자금센터(이하 '회사')가 운영하는 인터넷 서비스(이하 '서비스')를 이용함에 있어 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 (용어의 정의)",
    content:
      "① '서비스'라 함은 회사가 제공하는 정책자금 컨설팅 안내, 무료상담 신청, 자금 진단 등 모든 인터넷 기반 서비스를 말합니다.\n② '이용자'라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 개인 또는 법인을 말합니다.\n③ '상담 신청자'라 함은 회사에 무료상담을 신청한 이용자를 말합니다.",
  },
  {
    title: "제3조 (약관의 게시 및 개정)",
    content:
      "① 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.\n② 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.\n③ 약관이 개정될 경우 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 내에 공지합니다.",
  },
  {
    title: "제4조 (서비스의 제공)",
    content:
      "회사는 다음 서비스를 제공합니다.\n① 정책자금 안내 및 정보 제공\n② 무료상담 신청 서비스\n③ 자금 적격 진단 서비스\n④ 기업인증 컨설팅 정보 제공\n⑤ 기타 회사가 정하는 서비스",
  },
  {
    title: "제5조 (서비스 이용의 제한)",
    content:
      "① 회사는 이용자가 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다.\n- 타인의 정보를 도용하여 상담을 신청한 경우\n- 서비스 운영을 방해하는 행위를 한 경우\n- 허위 정보를 제공한 경우\n- 기타 관계 법령에 위반되는 행위를 한 경우",
  },
  {
    title: "제6조 (개인정보 보호)",
    content:
      "회사는 이용자의 개인정보를 보호하기 위하여 개인정보처리방침을 수립하고 이를 준수합니다. 개인정보의 수집, 이용, 제공 등에 관한 사항은 별도의 개인정보처리방침에 따릅니다.",
  },
  {
    title: "제7조 (면책조항)",
    content:
      "① 회사가 제공하는 정책자금 관련 정보는 참고용이며, 실제 승인 여부는 해당 정책자금 운영 기관의 심사에 따릅니다.\n② 회사는 이용자가 서비스를 통해 얻은 정보를 이용하여 발생한 손해에 대해 책임을 지지 않습니다.\n③ 회사는 천재지변, 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.",
  },
  {
    title: "제8조 (지식재산권)",
    content:
      "회사가 작성한 저작물에 대한 저작권 및 기타 지식재산권은 회사에 귀속됩니다. 이용자는 회사의 명시적인 동의 없이 이를 복제, 배포, 출판, 방송 등의 방법으로 영리 목적으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.",
  },
  {
    title: "제9조 (분쟁해결)",
    content:
      "① 회사와 이용자 간에 발생한 분쟁에 관하여 소송이 제기될 경우에는 회사의 본사 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.\n② 회사와 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.",
  },
  {
    title: "제10조 (약관의 효력)",
    content:
      "이 약관은 서비스를 이용하는 순간부터 적용됩니다. 이 약관에 동의하지 않는 경우 서비스 이용을 중단하여야 합니다.\n\n부칙\n이 약관은 2024년 1월 1일부터 시행됩니다.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-5">
      <div className="pt-16" />
      <section className="py-12">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-90 mb-2">이용약관</h1>
            <p className="text-gray-50">
              시행일: 2024.01.01 | 최종 수정: 2026.01.01
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-10 divide-y divide-gray-10">
            {sections.map((section) => (
              <div key={section.title} className="p-6 sm:p-8">
                <h2 className="text-base font-bold text-gray-90 mb-3">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-60 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
