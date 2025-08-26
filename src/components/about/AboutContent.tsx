// src/components/about/AboutContent.tsx
import Image from 'next/image';

export default function AboutContent() {
  return (
    // 👇 본문 전체 폭/여백을 여기서 강제
<div className="min-w-0 w-full max-w-[980px] box-border">
      <h1 className="mb-6 text-[44px] md:text-[64px] leading-[1.05] font-extrabold tracking-tight text-neutral-900">
        About Lab CHASM
      </h1>

      <h2 className="text-[20px] md:text-[28px] text-neutral-900">
        한국 인디음악 기반의 음악 생태계 연구소
      </h2>

      <p className="mt-5 border-l-4 border-neutral-300 pl-5 text-[16px] md:text-[20px] text-neutral-600 leading-7">
        왜 우리가 듣는 음악은 항상 마이너할까? 왜 더 퍼져나갈 수 없을까?<br />
        무엇인가 가로막고 있는 것 같아.
      </p>

      <figure className="mt-10 md:mt-12 overflow-hidden">
        <Image
          src="/about/mission.png"
          alt="Team Mission & Vision"
          width={1600}
          height={1000}
          className="block w-full max-w-full h-auto"  // 👈 컬럼 폭 넘지 않게
          priority
        />
      </figure>

      <div className="mt-10 md:mt-12 space-y-6 text-[15px] md:text-[18px] leading-8 text-neutral-700">
        <p>
          확실한 수요층과 구매층이 있으나 캐즘을 극복하지 못해 대중이 향유하는 문화로
          발전하지 못하는 것은 아닐까요? 그래서 저희는 이 틈을 뛰어넘을 수 있는 방법들을
          연구하고자 합니다.
        </p>
        <p>
          이 틈을 뛰어넘기 위해선 건강한 인디음악 생태계가 구축되어야 한다고 믿습니다.<br />
          스스로의 수요와, 스스로의 공급만으로도 유지가 가능한 생태계.
          외부의 지원이나, 우연에 의한 바이럴을 기다리거나, 매스미디어(방송 등)에 출연하지 않고서도 자생이 가능한 생태계.<br />
          이것이 매우 해결하기 어려운 문제임을 알지만, 그 목표에 1cm라도 더 가까이 만들어보고자 모였습니다.
        </p>
      </div>

      <hr className="my-10 md:my-12 border-neutral-200" />

      {/* 하단 3개 블록: 왼쪽 고정폭 / 오른쪽 유동폭 */}
      <section className="mt-16 md:mt-20">
        {/* Row 1 */}
        <div className="border-t border-neutral-200 first:border-t-0">
          <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-[380px_minmax(0,1fr)] md:gap-16">
            <h3 className="text-[22px] md:text-[28px] font-semibold leading-tight text-neutral-800">
              인디음악과 산업에 대한 깊은 탐구
            </h3>
            <p className="mt-4 md:mt-0 text-[16px] md:text-[18px] leading-[1.9] text-neutral-600">
              국내외 인디음악과 음악 산업에 대한 현실/상황 전반 수치를 리포트로 제작하여
              음악에 대한 심도 깊은 커뮤니티의 장을 만들어주고, 다양한 장르와 음악에 대한
              분석을 통하여 인디음악의 발전을 위하여 기여한다.
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="border-t border-neutral-200">
          <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-[380px_minmax(0,1fr)] md:gap-16">
            <h3 className="text-[22px] md:text-[28px] font-semibold leading-tight text-neutral-800">
              경험을 통한 음악 산업의 확장
            </h3>
            <p className="mt-4 md:mt-0 text-[16px] md:text-[18px] leading-[1.9] text-neutral-600">
              인디음악 산업의 여러 주체들과 콜라보레이션을 기획하여 보다 더 많은 사람들이
              인디음악을 접하고 경험할 수 있도록 하며 기존 인디음악 향유자들에게는 더 큰
              즐거움을 접하게 하고 사람들의 일상 속에서 음악 분야의 관심도를 상승시킨다.
            </p>
          </div>
        </div>

        {/* Row 3 */}
        <div className="border-t border-neutral-200">
          <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-[380px_minmax(0,1fr)] md:gap-16">
            <h3 className="text-[22px] md:text-[28px] font-semibold leading-tight text-neutral-800">
              일상에 스며드는 인디음악의 접근
            </h3>
            <p className="mt-4 md:mt-0 text-[16px] md:text-[18px] leading-[1.9] text-neutral-600">
              사람들이 즐기고 가볍게 소비할 수 있는 콘텐츠와 인디음악의 접목으로,
              일상 속에서 음악이라는 분야를 지속적으로 접할 수 있도록 즐거움을 제공한다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
