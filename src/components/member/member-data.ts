export type SubLab = 'all' | 'research' | 'campaign' | 'contents' | 'branding';

export const labs: { key: SubLab; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'research', label: 'Research LAB' },
  { key: 'campaign', label: 'Campaign LAB' },
  { key: 'contents', label: 'Contents LAB' },
  { key: 'branding', label: 'Branding LAB' },
];

// ── 상단 소개용 랩 정보 ─────────────────────────────────────────────
export type LabKey = Exclude<SubLab, 'all'>;
export interface LabInfo {
  heading: string;             // 상단 소제목(영문)
  title: string;               // 큰 타이틀(국문)
  paragraphs: string[];        // 소개 문단
  mission: string;             // 미션 설명
  missionTitle?: string;
  projects?: string[];         // 프로젝트 목록
  projectsTitle?: string;
}

export const labInfo: Record<LabKey, LabInfo> = {
  branding: {
    heading: 'Branding Lab',
    title: '브랜딩랩',
    paragraphs: [
      '랩 캐즘의 브랜딩 조직으로 브랜딩 기획자와 디자이너, 개발자가 함께 일하고 있어요.',
      '디자인을 넘어서 브랜딩 전략을 통해 디자인을 도출해내고, 로고와 폰트, 디자인 에셋 등 라이브러리를 형성하고 관리해요. 이 외에도 콘텐츠 제작, 행사 관련 그래픽을 제작하여 인디음악 향유자들에게 시각적으로 프로젝트를 전달할 수 있어요.',
    ],
    mission:
      '랩 캐즘 내부의 브랜딩을 위해 디자인 가이드 제안 및 웹사이트를 구축하여 사용자에게 가치를 시각적으로 전달합니다. 다양한 캠페인 및 콘텐츠에 사용되는 시각적 요소들(포스터, 콘텐츠, 이미지 등)을 제작합니다.',
    projects: [
      '2022 Ask your Kindier',
      '2024 SRF 서울레코드페어 : 위잉위잉',
      '2025 CoLLage : Steam con',
    ],
  },
  research: {
    heading: 'Research Lab',
    title: '리서치랩',
    paragraphs: [
      '리랩이지롱이',
    ],
    mission:
      '메롱.',
    projects: ['푸로젝트', '프로젝트'],
  },
  campaign: {
    heading: 'Campaign Lab',
    title: '캠페인랩',
    paragraphs: [
      '캠랩이지롱이.',
    ],
    mission:
      '메롱.',
    projects: ['콜라쥬콘', '2025 소버콘'],
  },
  contents: {
    heading: 'Contents Lab',
    title: '콘텐츠랩',
    paragraphs: [
      '콘랩이지롱이',
    ],
    mission:
      '어지러워',
    projects: ['2024 ', '2025 '],
  },
};

export interface Member {
    id: string;
    name: string;
    aka?: string;          // 영문명/별칭
    role: string;
    lab: Exclude<SubLab, 'all'>;
    labLabel: string;
    photo: string;
    tagline?: string;      // ⬅️ 추가: 모달 상단 굵은 문장
    bio: string;           // 소개 (개행은 \n 사용)
    top3?: {
      title: string;
      cover: string;
      artist?: string;     // (선택) 아래 캡션
      year?: number;       // (선택) 2019 등
      subtitle?: string;   // (선택) 괄호 뒤에 붙일 텍스트
    }[];
  }

export const members: Member[] = [
  {
    id: 'kitsh',
    name: '김시환',
    aka: 'Kitsh Kim',
    role: 'Team Leader',
    lab: 'all',
    labLabel: 'MGMT',
    photo: '/about/member/research/kitsh.png',
    tagline: "그럼에도 저 역시, 음악을 믿습니다 :)"
,    bio:
      `저는 두려움이 많은 사람입니다. \n` +
      `음악을 만드는 사람이 되고 싶었지만, 재능이 없다고 둘러댔고 <del>(진짜이긴 합니다)</del>\n` +
      '인디씬에서 일하는 사람이 되고 싶었지만, 결국 세속을 포기하지 못했습니다.\n\n' +
      'Lab CHASM을 왜 만들었냐구요? 용기가 부족해서요.\n'+
      '싸워볼 기세는 없지만, 무엇이라도 해보고 싶어서요.\n'+
      '그럼에도 불구하고, 음악을 사랑하니깐요.',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },


  {
    id: 'suzie',
    name: '이수지',
    aka: 'SUZIE LEE',
    role: 'Lab Lead',
    lab: 'research',
    labLabel: 'Research Lab',
    photo: '/about/member/research/leesuzie.png',
    tagline: '좋아하는 일, 잘하는 일을 동시에 할 순 없을까요?',
    bio:
      '음악 Snob & 숫자와 논리에 집착하는 Nerd Mind를 지닌 이들이 모여있는 리서치랩의 리드 역할을 맡고 있어요. 열혈 리스너로서, 무대와 축제를 사랑하는 사람으로서, 사용자이면서 동시에 문제를 해결하는 Product Owner의 마음으로 씬을 대하고 있습니다. '
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'leechanmin',
    name: '이찬민',
    aka: 'Chanmin Lee',
    role: 'Data Analyst',
    lab: 'research',
    labLabel: 'Research Lab',
    photo: '/about/member/research/leechanmin.png',
    tagline: '재밌는 인생을 살고 싶어요',
    bio:
      '모험을 하고 싶어요'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'jungyounghee',
    name: '정영희',
    aka: 'Younghee Jeong',
    role: 'Data Analyst',
    lab: 'research',
    labLabel: 'Research Lab',
    photo: '/about/member/research/jungyounghee.png',
    tagline: '재밌는 일을 찾아서~ 떠나자!',
    bio:
      '행복하게 일하는 방법?! 좋아하는 일과 함께하기!\n' +
      '음악과 함께 하루를 살아가보아요  music is my life!'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'kimjoonha',
    name: '김준하',
    aka: 'Joonha Kim',
    role: 'Data Analyst',
    lab: 'research',
    labLabel: 'Research Lab',
    photo: '/about/member/research/kimjoonha.png',
    tagline: '투명하고 맑게 살고 싶어요',
    bio:
      '재밌겠다 ! '
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'leeyeonji',
    name: '이연지',
    aka: 'Yeonji Lee',
    role: 'Data Analyst',
    lab: 'research',
    labLabel: 'Research Lab',
    photo: '/about/member/research/leeyeonji.png',
    tagline: '',
    bio:
      ' '
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'leejiyoung',
    name: '이지영',
    aka: 'Jiyoung Lee',
    role: 'Business Development Manager',
    lab: 'campaign',
    labLabel: 'Campaign Lab',
    photo: '/about/member/campaign/leejiyoung.png',
    tagline: '사랑하는 방향으로, 함께 살아가기',
    bio:
      '음악으로부터 배운 마음들을 떠올리며\n' +
      '오늘도 부지런히 가꾸기',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'aya',
    name: '아야',
    aka: 'Aya',
    role: 'Creative Director',
    lab: 'campaign',
    labLabel: 'Campaign Lab',
    photo: '/about/member/campaign/aya.png',
    tagline: '뭐가 될까요? 마음에 품어두는 작품은 늘 있습니다.',
    bio:
      '안녕하세요. 만나게 되어 반갑습니다.\n' +
      '좋아하는 걸 더 잘 좋아해 보고 싶습니다..........',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },


  {
    id: 'choiyoujin',
    name: '최유진',
    aka: 'Yoojin Choi',
    role: 'Campaign Manager',
    lab: 'campaign',
    labLabel: 'Campaign Lab',
    photo: '/about/member/campaign/choiyoujin.png',
    tagline: '좋아하는 것의 힘!',
    bio:
      '좋아하는 것의 힘을 아시나요...\n' +
      '무언가를 열심히 좋아하는 것은 반드시 또 다른 방식으로 돌아온다고 생각합니다.\n' +
      '열정적으로 좋아하며 살아갑시다~ 음악도 영화도 사람도~',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'hyunjoonha',
    name: '현준하',
    aka: 'Joonha Hyun',
    role: 'Business Development & Strategy Manager',
    lab: 'campaign',
    labLabel: 'Campaign Lab',
    photo: '/about/member/campaign/hyunjunha.png',
    tagline: '행복하고 건강하게',
    bio:
      '오늘도 하루를 만들어 나아가는 사람들.\n' +
      '재밌는 세상입니다!',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'limhayeon',
    name: '임하연',
    aka: 'Hayeon Lim',
    role: 'Campaign Manager',
    lab: 'campaign',
    labLabel: 'Campaign Lab',
    photo: '/about/member/campaign/limhayeon.png',
    tagline: '그냥 대충 열심히 즐겁게 사는 사람',
    bio:
      '이 되려고 노력중입니다 으랏차차 아자자 화이팅',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'jungjaeyoon',
    name: '정재윤',
    aka: 'Jaeyoon Jung',
    role: 'Contents Creator',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/jungjaeyoon.png',
    tagline: '쉽게만 살아가면 개재밌어 빙고 ',
    bio:
      '어른이 되면 오타쿠에서 벗어날 줄 알았는데 여전히 밴드 애니 소설 기타 오타쿠랍니다\n' +
      '앞으로는 어떤 오타쿠 인생을 터벅터벅 걸어갈까?'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'baesuhyeon',
    name: '배수현',
    aka: 'Suhyeon Bae',
    role: 'Contents Strategist',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/baesuhyun.png',
    tagline: '안녕하세요',
    bio:
      '배수현입니다 반갑습니다.\n' +
      '좋아하는 일을 하며 살고 싶습니다.' +
      '감사합니다.'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'leesuhyun',
    name: '이수현',
    aka: 'Soohyun Lee',
    role: 'Contents Creator',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/leesuhyun.png',
    tagline: '씩씩하게 살자',
    bio:
      '저는 수영을 할 줄 모르지만 바다 앞에서 사는게 꿈입니다'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'nohgaeun',
    name: '노가은',
    aka: 'Gaeun Lee',
    role: 'Contents Marketer',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/nohgaeun.png',
    tagline: '요이땅!',
    bio:
      '어디로든갈수있다고믿어서어디로가야할지모르겠고어디로갈지모르겠어서어디든가보는기분어디든가본다면세월이지나고어디에가서어디든나의땅'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'youheegon',
    name: '유희곤',
    aka: 'You Hee Gon',
    role: 'Contents Creator',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/youheegon.png',
    tagline: '힘들 때 웃는 자가 일류다',
    bio:
      '유희곤이라는 사람입니다.\n' +
      '힘들 땐 하늘을 보고 좋아하는 음악을 들어요.' +
      '좋은 음악이 넘쳐나는 아름다운 세상! 음악만세!'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },


  {
    id: 'choihyojung',
    name: '최효정',
    aka: 'Hyojung Choi',
    role: 'Contents Marketer',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/choihyojung.png',
    tagline: '사랑을 담아,',
    bio:
      '가장 때 묻지 않은 그런 감정은 우리만의 것!'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'chomunkyo',
    name: '조문교',
    aka: 'Munkyo Cho',
    role: 'Contents Marketer',
    lab: 'contents',
    labLabel: 'Contents Lab',
    photo: '/about/member/contents/chomunkyo.png',
    tagline: '이건 비밀인데요.',
    bio:
      '음악보다 사람을 더 좋아하고요.\n' +
      '공연보다 삶에 더 관심이 많습니다.'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },



  {
    id: 'youjiyeon',
    name: '유지연',
    aka: 'Jiyeon YOU',
    role: 'Designer',
    lab: 'branding',
    labLabel: 'Branding Lab',
    photo: '/about/member/branding/youjiyeon.png',
    tagline: '안녕하십니까',
    bio:
      '조용하게 할 일을 하자..',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'kimyoungseo',
    name: '김영서',
    aka: 'Kimgwaseo',
    role: 'Graphic Designer',
    lab: 'branding',
    labLabel: 'Branding Lab',
    photo: '/about/member/branding/kimyoungseo.png',
    tagline: '멋쟁이 지망생',
    bio:
      '유지연이 조용하게 할 일을 하면 난 시끄럽게 하는 편 ..\n' +
      '그리고 꾸준히 좋아하는 것을 하는 모든 사람들을 동경하는 편 ..\n' +
      '그리고 그걸 몰래 질투하는 편 ..흥 부러워'
      ,
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  {
    id: 'shiniji',
    name: '신이지',
    aka: 'Iji Shin',
    role: 'Frontend Developer',
    lab: 'branding',
    labLabel: 'Branding Lab',
    photo: '/about/member/branding/shiniji.png',
    tagline: '행복회로가 불타 없어질 때까지',
    bio:
      '행복하게 맑게 자신있게!\n' +
      '작은 일에도 크나큰 사랑과 행복을 느끼는 사람이 되고 싶어요',
    top3: [
      { title: 'Album A', cover: '/members/albums/a.jpg' },
      { title: 'Album B', cover: '/members/albums/b.jpg' },
      { title: 'Album C', cover: '/members/albums/c.jpg' },
    ],
  },

  // … 나머지 멤버들
];


export const labAccentHex: Record<SubLab, string> = {
    all:       '#111111',
    research:  '#00A7FF',  // 예: 하늘색
    campaign:  '#FF8A00',  // 예: 오렌지
    contents:  '#7C3AED',  // 예: 보라
    branding:  '#FF2D55',  // 예: 레드
  };