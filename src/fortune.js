import { Solar, Lunar } from 'lunar-javascript';
import { userProfile } from './user.js';
import { getDailyYijing, getXiuAdvice } from './yijing.js';

// 从 user.js 获取配置，不再硬编码
const FAVORED_ELEMENTS = userProfile.bazi.favored; // 喜用神

// 五行相生：木→火→土→金→水→木
const GENERATES = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
// 五行相克：木克土，土克水，水克火，火克金，金克木
const OVERCOMES  = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

// 根据日主五行动态推算十神关系（生克角度）
function buildRelation(masterEl) {
  const MOOD = {
    generates_me: '头脑清晰，适合学习吸收新知',  // 印枭
    same:         '精力充沛，适合刷题攻坚',       // 比劫
    i_generate:   '思维活跃，适合总结输出',       // 食伤
    i_overcome:   '容易分心，注意专注',           // 财星
    overcomes_me: '压力较大，注意调节心态'        // 官杀
  };
  const rel = {};
  for (const el of ['木', '火', '土', '金', '水']) {
    if (el === masterEl) {
      rel[el] = { s: '比劫 (朋友)', effect: '帮身', mood: MOOD.same };
    } else if (GENERATES[el] === masterEl) {
      rel[el] = { s: '印枭 (贵人)', effect: '生身', mood: MOOD.generates_me };
    } else if (GENERATES[masterEl] === el) {
      rel[el] = { s: '食伤 (才华)', effect: '泄身', mood: MOOD.i_generate };
    } else if (OVERCOMES[masterEl] === el) {
      rel[el] = { s: '财星 (欲望)', effect: '耗身', mood: MOOD.i_overcome };
    } else {
      rel[el] = { s: '官杀 (压力)', effect: '克身', mood: MOOD.overcomes_me };
    }
  }
  return rel;
}

// 从日主字符串提取五行（如 '丁火' → '火'）
function masterToElement(masterStr) {
  if (masterStr.includes('木')) return '木';
  if (masterStr.includes('火')) return '火';
  if (masterStr.includes('土')) return '土';
  if (masterStr.includes('金')) return '金';
  if (masterStr.includes('水')) return '水';
  return '火';
}

const MASTER_ELEMENT = masterToElement(userProfile.bazi.master);
const RELATION = buildRelation(MASTER_ELEMENT);

// 建议库 (每种五行增加多个随机文案)
const ADVICE_POOL = {
  '木': [
    '今日印星高照，记忆力超群，背单词效率极高！',
    '贵人运旺，遇到不懂的难题可以请教同学或老师，必有收获。',
    '头脑格外清醒，适合整理错题本，构建知识框架。',
    '适合吸收新知识，看网课或读专业书会有深刻领悟。'
  ],
  '火': [
    '今日比劫帮身，动力十足，适合挑战数学大题！',
    '精力充沛，不要浪费，一口气刷完这套真题吧。',
    '同伴运不错，可以找个研友互相监督，效率翻倍。',
    '斗志昂扬，感觉自己无所不能，正是攻坚克难的好时机。'
  ],
  '土': [
    '今日食伤泄秀，才思敏捷，适合写代码或做总结！',
    '灵感迸发，写英语作文或政治大题会有神来之笔。',
    '思维活跃，容易举一反三，复习旧知识会有新发现。',
    '表达能力强，适合给别人讲题，顺便巩固自己的知识。'
  ],
  '金': [
    '今日财星坏印，容易被手机干扰，请把手机扔远点！',
    '可能会有些浮躁，建议先做两道简单的题静静心。',
    '注意劳逸结合，如果实在学不进去，去操场跑两圈再回来。',
    '外界诱惑较多，今天适合去图书馆等安静的地方闭关。'
  ],
  '水': [
    '今日官杀克身，可能感到焦虑，多喝热水，早点休息。',
    '压力有点大，不要给自己定太高的目标，完成基础任务就是胜利。',
    '容易自我怀疑，请对着镜子说三遍：我能行！',
    '适合按部就班地复习，不要挑战太难的新题，稳住心态最重要。'
  ]
};

// 五行对应颜色
const COLORS = {
  '木': '🟢 绿色/青色',
  '火': '🔴 红色/粉色/紫色',
  '土': '🟤 黄色/咖啡色',
  '金': '⚪ 白色/金色',
  '水': '🔵 黑色/蓝色'
};
// 五行对应方位
const DIRECTIONS = { '木': '东方', '火': '南方', '土': '中央', '金': '西方', '水': '北方' };

// 各五行日对应的学习运势数据（基于日主与当日十神关系）
const STUDY_FORTUNE = {
  '木': {
    memory: 95, focus: 75, energy: 65,
    best: ['英语背词', '政治记忆', '408知识点'],
    worst: ['数学大题冲刺'],
    tip: '印星高照，今天是背东西的黄金时段！单词/公式优先。'
  },
  '火': {
    memory: 65, focus: 88, energy: 95,
    best: ['数学大题', '408算法题', '冲刺刷题'],
    worst: ['大量机械记忆'],
    tip: '比劫帮身，干劲十足，攻坚克难正当时！'
  },
  '土': {
    memory: 70, focus: 75, energy: 72,
    best: ['整理错题本', '英语写作', '政治总结'],
    worst: ['高难度新题'],
    tip: '食伤泄秀，思维灵活，适合总结归纳和输出表达。'
  },
  '金': {
    memory: 42, focus: 45, energy: 65,
    best: ['限时真题', '机械练习', '整理学习环境'],
    worst: ['背单词', '理解新概念'],
    tip: '财星扰印，记忆力偏弱，今天换限时刷题模式更稳。'
  },
  '水': {
    memory: 55, focus: 62, energy: 38,
    best: ['查漏补缺', '基础巩固', '适当休息'],
    worst: ['冲刺难题', '高压模拟'],
    tip: '官杀克身，稳扎稳打，完成基础任务就是今日胜利。'
  }
};

export function getStudyFortune(dayElement) {
  return STUDY_FORTUNE[dayElement] || STUDY_FORTUNE['土'];
}

// 获取今日五行属性 (以日柱天干为主)
function getDailyElement(lunar) {
  const dayGan = lunar.getDayGan(); // 今日天干
  // 简易判断天干五行
  if (['甲', '乙'].includes(dayGan)) return '木';
  if (['丙', '丁'].includes(dayGan)) return '火';
  if (['戊', '己'].includes(dayGan)) return '土';
  if (['庚', '辛'].includes(dayGan)) return '金';
  if (['壬', '癸'].includes(dayGan)) return '水';
  return '土';
}

// 随机获取一条建议
function getRandomAdvice(element) {
  const pool = ADVICE_POOL[element] || ADVICE_POOL['土'];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getDailyFortune() {
  const now = process.env.PREVIEW_DATE ? new Date(process.env.PREVIEW_DATE + 'T08:00:00') : new Date(); // 支持PREVIEW_DATE
  const solar = Solar.fromDate(now); // 转换为阳历
  const lunar = solar.getLunar(); // 转换为阴历

  
  const dayGanZhi = lunar.getDayInGanZhi(); // 今日干支 (如 甲子)
  const dayElement = getDailyElement(lunar); // 今日五行
  const relation = RELATION[dayElement];
  
  const advice = getRandomAdvice(dayElement);

  // 获取更多每日变动参数
  const yi = lunar.getDayYi().slice(0, 3).join('、'); // 只取前3个
  const ji = lunar.getDayJi().slice(0, 3).join('、'); // 只取前3个
  const chong = lunar.getDayChongDesc(); // 冲 (如 "马")
  const sha = lunar.getDaySha(); // 煞 (如 "南")
  const xiShen = lunar.getPositionXiDesc(); // 喜神方位
  const caiShen = lunar.getPositionCaiDesc(); // 财神方位

  // 六爻卦象（周易·六神·二十八宿）
  const yijing = getDailyYijing(lunar);

  // 纳音五行（60甲子纳音，如「海中金」「炉中火」）
  let naYin = '';
  try { naYin = lunar.getDayNaYin?.() ?? ''; } catch(_) {}

  // 二十八宿
  let xiu = '';
  let xiuAdvice = '';
  try {
    xiu = lunar.getDayXiu?.() ?? '';
    xiuAdvice = xiu ? getXiuAdvice(xiu) : '';
  } catch(_) {}

  // 彭祖百忌
  let pengZuGan = '', pengZuZhi = '';
  try { pengZuGan = lunar.getPengZuGan?.() ?? ''; } catch(_) {}
  try { pengZuZhi = lunar.getPengZuZhi?.() ?? ''; } catch(_) {}

  return {
    ganZhi: dayGanZhi,
    element: dayElement,
    relation: relation.s,
    mood: relation.mood,
    luckyColor: FAVORED_ELEMENTS.map(el => COLORS[el]).join(' 或 '),
    luckyDirection: FAVORED_ELEMENTS.map(el => `${DIRECTIONS[el]}(${el})`).join(' 或 '),
    advice: advice,
    stars: { '木': '⭐⭐⭐⭐⭐', '火': '⭐⭐⭐⭐⭐', '土': '⭐⭐⭐', '金': '⭐⭐', '水': '⭐' }[dayElement] || '⭐⭐⭐',

    // 黄历基础
    yi: yi || '诸事不宜',
    ji: ji || '诸事不忌',
    chong: chong,
    sha: sha,
    xiShen: xiShen,
    caiShen: caiShen,

    // 周易六爻
    yijing,

    // 纳音五行 & 二十八宿
    naYin,
    xiu,
    xiuAdvice,

    // 彭祖百忌
    pengZuGan,
    pengZuZhi,
  };
}
