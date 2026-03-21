"use client";

import { motion } from "framer-motion";

const services = [
  {
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 40 40"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <circle cx="20" cy="20" r="16" />
        <path d="M20 12v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 26h12M16 30h8" strokeLinecap="round" />
        <path d="M20 8v2M28 20h2M12 20h-2" strokeLinecap="round" />
      </svg>
    ),
    title: "중소기업 운전자금",
    desc: "단기 운영에 필요한 자금을 정책자금으로 저금리에 조달합니다. 원자재 구매, 인건비, 운영비 등 다양한 용도에 활용 가능합니다.",
    features: ["저금리 자금 조달", "빠른 심사 프로세스", "맞춤형 자금 설계"],
  },
  {
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 40 40"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          d="M8 32h24M12 32V18l8-8 8 8v14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17 32v-8h6v8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 22h2M22 22h2" strokeLinecap="round" />
      </svg>
    ),
    title: "중소기업 시설자금",
    desc: "공장 신축, 설비 도입, 사업장 확장 등 고정자산 투자에 필요한 장기 저금리 정책자금을 지원합니다.",
    features: ["장기 저금리 대출", "설비투자 지원", "사업장 확장 자금"],
  },
  {
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 40 40"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="8" y="8" width="24" height="24" rx="4" />
        <path
          d="M14 20l4 4 8-8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    ),
    title: "기업인증 컨설팅",
    desc: "벤처인증, 이노비즈, 메인비즈, ISO 등 정부 지원 자격 취득을 위한 전문 컨설팅을 제공합니다.",
    features: ["벤처기업 인증", "이노비즈/메인비즈", "각종 ISO 인증"],
  },
];

export default function Services() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-accent/10 text-accent-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            서비스 안내
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            맞춤형 정책자금 솔루션
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            기업의 상황과 필요에 맞는 최적의 정책자금을 분석하고 지원합니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group bg-gray-light rounded-2xl p-8 hover:bg-dark hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-dark"
            >
              <div className="text-accent mb-6 group-hover:text-accent-light transition-colors">
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold text-dark group-hover:text-white mb-3 transition-colors">
                {svc.title}
              </h3>
              <p className="text-gray-500 group-hover:text-gray-300 leading-relaxed mb-6 transition-colors">
                {svc.desc}
              </p>
              <ul className="space-y-2">
                {svc.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-300 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
