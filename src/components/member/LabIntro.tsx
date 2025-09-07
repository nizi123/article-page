'use client';

import { SubLab, labInfo } from './member-data';

export default function LabIntro({ lab }: { lab: SubLab }) {
  if (lab === 'all') {
    return (
      <>
        <p className="text-xs font-semibold tracking-[.12em] text-neutral-500">
          MEMBER
        </p>
        <h1 className="mt-2 text-[44px] md:text-[64px] font-extrabold leading-[1.05]">
          함께하고 있는 사람들
        </h1>

        <div className="mt-5 text-[15px] md:text-[18px] leading-8 text-neutral-700 space-y-2">
          <p>
            자생가능한 인디음악 생태계를 실현하기 위해 4개의 Sub Lab을 두고 있습니다.
            멤버 개개인이 한 팀에 영구히 속해있지 않고, 프로젝트 별/업무 별로 유연하게 속해있을 수 있습니다.
          </p>
          <p>
            개성 넘치고, 재치 있고, 같이 있으면 편안함을 줄 수 있는 사람들<br />
            음악 이야기를 밤낮 없이 떠들 수 있는 사람들<br />
            서로 생각과 취향이 달라도 그 다움을 공유하며 사랑할 수 있는 사람들
          </p>
          <p>랩 캐즘에서 함께 음악의 지평을 공유하는 우리들을 소개합니다.</p>
        </div>
      </>
    );
  }

  const info = labInfo[lab];
  return (
    <>
      <p className="text-xs font-semibold tracking-[.12em] text-neutral-500">
        {info.heading.toUpperCase()}
      </p>
      <h1 className="mt-2 text-[44px] md:text-[64px] font-extrabold leading-[1.05]">
        {info.title}
      </h1>

      <div className="mt-5 text-[15px] md:text-[18px] leading-8 text-neutral-700 space-y-3">
        {info.paragraphs.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>

      <div className="mt-10 md:mt-12">
        <h3 className="text-xs font-semibold tracking-[.12em] text-neutral-600">
          {info.missionTitle ?? 'MISSION'}
        </h3>
        <p className="mt-2 text-[15px] md:text-[16px] leading-7 text-neutral-700">
          {info.mission}
        </p>
        <hr className="mt-4 border-neutral-300" />
      </div>

      {info.projects?.length ? (
        <div className="mt-6 md:mt-8">
          <h3 className="text-xs font-semibold tracking-[.12em] text-neutral-600">
            {info.projectsTitle ?? 'PROJECT'}
          </h3>
          <ul className="mt-2 space-y-1 text-[15px] md:text-[16px] text-neutral-700">
            {info.projects.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <hr className="mt-4 border-neutral-300" />
        </div>
      ) : null}
    </>
  );
}
