// src/yijing.js
// 周易六爻 · 每日卦象系统
// 根据日柱干支确定性推算今日卦象，同一天永远显示相同的卦，不同月份有变化

// ─── 天干地支序列 ───
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// ─── 八卦（三爻卦）基础数据 ───
// binary(0-7) = 从初爻到上爻，阳=1/阴=0 的三位二进制
export const BAGUA = {
  0: { name: '坤', symbol: '☷', element: '土', nature: '顺', meaning: '厚德载物' },
  1: { name: '震', symbol: '☳', element: '木', nature: '动', meaning: '奋发雷动' },
  2: { name: '坎', symbol: '☵', element: '水', nature: '险', meaning: '险中求智' },
  3: { name: '兑', symbol: '☱', element: '金', nature: '悦', meaning: '喜悦沟通' },
  4: { name: '艮', symbol: '☶', element: '土', nature: '止', meaning: '静守笃实' },
  5: { name: '离', symbol: '☲', element: '火', nature: '明', meaning: '光明附丽' },
  6: { name: '巽', symbol: '☴', element: '木', nature: '入', meaning: '柔顺渗透' },
  7: { name: '乾', symbol: '☰', element: '金', nature: '健', meaning: '天行健进' },
};

// ─── 六十四卦数据 ───
// 格式: [卦序(1-64), 上卦(0-7), 下卦(0-7), 卦名, 学习类型, 象辞精要, 备考建议]
// 学习类型: '冲刺'|'吸收'|'整合'|'调整'|'创造'
const HEXAGRAM_RAW = [
  [1,  7, 7, '乾', '冲刺', '天行健，自强不息', '元气最旺，全力攻坚难题，今日战斗力MAX！'],
  [2,  0, 0, '坤', '吸收', '地势坤，厚德载物', '博采广纳，今日适合大量输入，打好知识地基'],
  [3,  2, 1, '屯', '调整', '云雷互动，始创维艰', '起步虽难，踏稳每一步，勿急于求成'],
  [4,  4, 2, '蒙', '吸收', '山下有泉，发蒙启智', '虚心求教，遇到卡点可请教老师或上网查，必有所获'],
  [5,  2, 7, '需', '调整', '云上于天，静待时机', '打好基础，时机成熟才能爆发，今日稳扎稳打'],
  [6,  7, 2, '讼', '调整', '天水相违，退一步海阔', '放下执念以退为进，完成基础任务即是胜利'],
  [7,  0, 2, '师', '整合', '地中有水，统率有方', '系统整理知识架构，大局在握方能制胜'],
  [8,  2, 0, '比', '整合', '地上有水，亲比互辅', '今日适合研友对练，相互检验弱点'],
  [9,  6, 7, '小畜', '吸收', '风行天上，小积大用', '积少成多，每个知识点都是未来的得分项'],
  [10, 7, 3, '履', '整合', '天泽相履，谨慎前行', '按部就班完成计划，谨慎审题，不急不躁'],
  [11, 0, 7, '泰', '冲刺', '天地交泰，万物通达', '今日大吉大利！全力冲刺，能量满格'],
  [12, 7, 0, '否', '调整', '天地不交，闭塞之时', '随势休整，保存实力，完成轻松任务即可'],
  [13, 7, 5, '同人', '整合', '天火同人，万众一心', '集中力量攻克核心考点，团结就是力量'],
  [14, 5, 7, '大有', '冲刺', '火在天上，大有所获', '今日努力收益倍增，适合挑战高分任务'],
  [15, 0, 4, '谦', '整合', '地中有山，谦虚处下', '整理错题本，低调精进，谦德之光必显'],
  [16, 1, 0, '豫', '冲刺', '雷出地奋，豫乐奋发', '精力充沛，乘兴大干，一口气拿下！'],
  [17, 3, 1, '随', '吸收', '泽中有雷，随时而动', '顺势而为，跟着状态走，今日适合流畅学习'],
  [18, 4, 6, '蛊', '整合', '山下有风，振败起弊', '专项补弱，清理积压错题，今日适合大扫除'],
  [19, 0, 3, '临', '冲刺', '泽上有地，大临将至', '目标在望，倍加努力，冲刺感十足'],
  [20, 6, 0, '观', '吸收', '风行地上，观风察势', '深入洞察，理解深层原理，读懂比做题更重要'],
  [21, 5, 1, '噬嗑', '冲刺', '雷电噬嗑，决断克难', '果断咬合，攻克难题，绝不拖延'],
  [22, 4, 5, '贲', '创造', '山下有火，文质彬彬', '今日宜整理笔记、写作输出，言之有文'],
  [23, 4, 0, '剥', '调整', '山附于地，剥落更新', '能量偏低，量力而行，完成轻松任务即可'],
  [24, 0, 1, '复', '吸收', '地中有雷，一阳复始', '温故知新，今日适合回顾已学内容'],
  [25, 7, 1, '无妄', '创造', '天下有雷，无妄而动', '顺其自然，不要强迫自己，灵感会自然涌现'],
  [26, 4, 7, '大畜', '吸收', '天在山中，大量蓄积', '广泛积累，今日适合狂刷知识点，厚积薄发'],
  [27, 4, 1, '颐', '吸收', '山下有雷，颐养心神', '精心钻研，细嚼慢咽，深度吸收优于走马观花'],
  [28, 3, 6, '大过', '冲刺', '泽灭木没，超越常规', '挑战高难度！今日可突破自我极限'],
  [29, 2, 2, '坎', '调整', '重险叠坎，险中求稳', '谨慎稳健，步步为营，绝不冒进'],
  [30, 5, 5, '离', '创造', '明两作离，光明照耀', '思维清晰，宜总结输出，写作/答题状态佳'],
  [31, 3, 4, '咸', '创造', '山上有泽，感应相通', '触类旁通，各科知识之间灵感四射'],
  [32, 1, 6, '恒', '整合', '雷风相与，坚持不懈', '恒心是考研第一武器，今日按计划雷打不动'],
  [33, 7, 4, '遯', '调整', '天下有山，适时退守', '保存实力，今日宜养精蓄锐，以退为进'],
  [34, 1, 7, '大壮', '冲刺', '雷在天上，大壮之势', '干劲十足，攻坚克难正当时，一往无前'],
  [35, 5, 0, '晋', '冲刺', '地上有火，进如日出', '向阳突破，今日是最佳冲刺时机'],
  [36, 0, 5, '明夷', '调整', '明入地中，韬光养晦', '低调蓄力，不急于表现，潜心复习'],
  [37, 6, 5, '家人', '整合', '风自火出，家人有序', '整理知识体系，井井有条，体系越清晰得分越高'],
  [38, 5, 3, '睽', '调整', '泽上有火，睽违之时', '状态欠佳，以轻松复习任务为主，别硬撑'],
  [39, 2, 4, '蹇', '调整', '山上有水，前路艰难', '迂回推进，补缺优先于攻难，找软柿子捏'],
  [40, 1, 2, '解', '整合', '雷雨作解，涣然冰释', '清理积压，大扫除式复盘，今日解决历史遗留问题'],
  [41, 4, 3, '损', '整合', '山下有泽，损益互补', '精简任务，做减法而非加法，专注核心'],
  [42, 6, 1, '益', '冲刺', '风雷益助，增益向上', '今日学习收效最大化，能投入多少就投入多少'],
  [43, 3, 7, '夬', '冲刺', '泽上于天，决断果行', '排除一切干扰，手机收起来，全力以赴'],
  [44, 7, 6, '姤', '创造', '天下有风，邂逅奇遇', '今日思路迸发，适合头脑风暴，跨科联想'],
  [45, 3, 0, '萃', '整合', '泽上于地，萃聚精华', '汇总整合，今日构建知识体系最合适'],
  [46, 0, 6, '升', '冲刺', '地中生木，步步攀升', '脚踏实地一步步攀登，今日爬坡题最适合'],
  [47, 3, 2, '困', '调整', '泽无水困，困而后亨', '陷于困境时养精蓄锐，明日再战，今日休整'],
  [48, 2, 6, '井', '吸收', '木上有水，井养不穷', '知识如井水，汲取不尽，今日适合大量吸收'],
  [49, 3, 5, '革', '冲刺', '泽中有火，革故鼎新', '今日最适合改变薄弱环节，蜕变从今天开始'],
  [50, 5, 6, '鼎', '创造', '木上有火，鼎新烹调', '融合多科知识，今日整合输出效果最佳'],
  [51, 1, 1, '震', '冲刺', '洊雷动物，奋起直追', '受到震撼，精神抖擞，今日不进则退'],
  [52, 4, 4, '艮', '吸收', '兼山止静，安静如山', '潜心专研，今日宜深度学习，一门深入'],
  [53, 6, 4, '渐', '吸收', '山上有木，渐进有序', '循序渐进，今日功到自然成，勿跳跃'],
  [54, 1, 3, '归妹', '整合', '泽上有雷，归妹以行', '按章程行事，今日宜回顾计划和历史错题'],
  [55, 1, 5, '丰', '冲刺', '雷电皆至，日中则丰', '精力充沛，全速推进，今日能量值满格'],
  [56, 5, 4, '旅', '创造', '山上有火，行旅异乡', '换个角度思考，触发新灵感，试试不同解法'],
  [57, 6, 6, '巽', '吸收', '随风入室，细水长流', '润物无声，今日潜移默化式学习效果最好'],
  [58, 3, 3, '兑', '创造', '两泽相资，喜悦交流', '讲题给人听，讲出来才是真掌握，今日宜输出'],
  [59, 6, 2, '涣', '整合', '风行水上，涣散整合', '理清思路，今日先整理再学习，事半功倍'],
  [60, 2, 3, '节', '整合', '泽上有水，节制有度', '合理分配精力，今日勿贪多，每科专注到位'],
  [61, 6, 3, '中孚', '吸收', '泽上有风，内心诚信', '心无旁骛，今日深度理解一个核心概念'],
  [62, 1, 4, '小过', '整合', '山上有雷，小有过失', '及时纠错，今日专项突破错题最合适'],
  [63, 2, 5, '既济', '整合', '水上有火，功成圆满', '全面复盘，锁定已掌握成果，整理得分手段'],
  [64, 5, 2, '未济', '冲刺', '火上有水，事业未竟', '功业未竟，奋勇向前，考研本就是一场未济之旅！'],
];

// ─── 构建查找表 ───
const HEXAGRAM_BY_KW   = {};  // KW序号 1-64
const HEXAGRAM_BY_BIN  = {};  // binary(upper*8+lower) 0-63
HEXAGRAM_RAW.forEach(([kw, upper, lower, name, type, judgment, advice]) => {
  const entry = { kw, upper, lower, name, type, judgment, advice };
  HEXAGRAM_BY_KW[kw] = entry;
  HEXAGRAM_BY_BIN[upper * 8 + lower] = entry;
});

// ─── 六神系统 ───
// 六神序列：青龙→朱雀→勾陈→腾蛇→白虎→玄武（循环）
// 起始点由日干决定：甲/己→青龙起初爻，乙/庚→朱雀，丙/辛→勾陈，丁/壬→腾蛇，戊/癸→白虎
const LIUSHEN = [
  { name: '青龙', color: '#16a34a', bg: '#dcfce7', emoji: '🐉',
    study: '贵人运旺，今日宜阅读记忆，遇到难点会有灵感' },
  { name: '朱雀', color: '#dc2626', bg: '#fee2e2', emoji: '🔴',
    study: '文书大动，今日宜写作背诵，语言表达顺畅' },
  { name: '勾陈', color: '#92400e', bg: '#fef3c7', emoji: '🟤',
    study: '稳重踏实，今日宜做计算题，数学/408算法最稳' },
  { name: '腾蛇', color: '#7c3aed', bg: '#ede9fe', emoji: '🐍',
    study: '变化多端，今日宜检查验算，警惕陷阱题' },
  { name: '白虎', color: '#1d4ed8', bg: '#dbeafe', emoji: '🐅',
    study: '竞争利刃，今日宜限时冲刺，模拟考场压力' },
  { name: '玄武', color: '#0f172a', bg: '#f1f5f9', emoji: '🐢',
    study: '暗伏查漏，今日宜补缺查遗，找出盲区' },
];
// 日干→六神起始索引（甲/己=0青龙, 乙/庚=1朱雀, 丙/辛=2勾陈, 丁/壬=3腾蛇, 戊/癸=4白虎）
const GAN_TO_LIUSHEN_START = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4];

// ─── 六亲 / 卦宫 / 动爻规则 ───
const ELEMENTS = ['木', '火', '土', '金', '水'];
const LINE_LABELS = ['初', '二', '三', '四', '五', '上'];
const BAGUA_GONG = {
  '乾': '乾宫', '兑': '兑宫', '离': '离宫', '震': '震宫',
  '巽': '巽宫', '坎': '坎宫', '艮': '艮宫', '坤': '坤宫'
};
const STUDY_USE_GODS = {
  '父母': '资料/笔记/老师/知识输入',
  '官鬼': '考试压力/难题/约束/排名',
  '子孙': '理解力/发挥感/解题流畅度',
  '妻财': '效率/成果/得分回报',
  '兄弟': '同伴/分心/竞争/内耗'
};

function getElementRelation(base, target) {
  const baseIdx = ELEMENTS.indexOf(base);
  const targetIdx = ELEMENTS.indexOf(target);
  if (baseIdx === -1 || targetIdx === -1) return '兄弟';
  if (base === target) return '兄弟';
  if (ELEMENTS[(baseIdx + 1) % 5] === target) return '子孙';
  if (ELEMENTS[(baseIdx + 2) % 5] === target) return '妻财';
  if (ELEMENTS[(baseIdx + 4) % 5] === target) return '父母';
  return '官鬼';
}

function getHexPalace(hex) {
  return BAGUA[hex.lower].name;
}

function getShiYingIndices(hex) {
  const same = hex.upper === hex.lower;
  if (same) return { shiIndex: 5, yingIndex: 2, rule: '纯卦取上爻为世，三爻为应' };
  if (hex.lower === 7 || hex.lower === 0) return { shiIndex: 2, yingIndex: 5, rule: '乾坤基层卦取三爻为世，上爻为应' };
  if (hex.upper === 7 || hex.upper === 0) return { shiIndex: 3, yingIndex: 0, rule: '乾坤外临卦取四爻为世，初爻为应' };
  return { shiIndex: 2, yingIndex: 5, rule: '通用简化规则取三爻为世，上爻为应' };
}

function getMovingLineIndices(cyclePos, monthGanIdx) {
  const first = cyclePos % 6;
  const second = (cyclePos + monthGanIdx + 2) % 6;
  const set = new Set([first]);
  if ((cyclePos + monthGanIdx) % 3 !== 0) set.add(second);
  return [...set].sort((a, b) => a - b);
}

function flipBinary(binary, indices) {
  let result = binary;
  indices.forEach(idx => {
    result ^= (1 << idx);
  });
  return result;
}

function getStudyJudgment(useGod) {
  if (useGod === '父母') return '宜看课本、背诵、整理笔记，输入效率更高';
  if (useGod === '官鬼') return '宜啃难题、做模拟、顶压力训练';
  if (useGod === '子孙') return '宜理解归纳、讲题输出、追求做题手感';
  if (useGod === '妻财') return '宜追求得分率，做真题和限时训练最划算';
  return '宜同伴互测、错题对练，但要防分心和内耗';
}

// ─── 二十八宿 · 备考建议 ───
const XIU_ADVICE = {
  '角': '角宿大吉，开始新任务、启动新阶段的好时机',
  '亢': '亢星刚强，注意劳逸结合，莫过度疲劳',
  '氐': '氐宿吉祥，踏实学习，积累一定有回报',
  '房': '房宿贵人，遇到难点可求助老师研友，必有收获',
  '心': '心宿核心，专注当下最重要的考点',
  '尾': '尾宿延续，今日适合接续昨天内容，保持节奏',
  '箕': '箕宿大吉，整理输出效果极佳，宜写作总结',
  '斗': '斗宿博学，今日适合广泛涉猎，扩充知识面',
  '牛': '牛宿勤耕，埋头苦干，稳扎稳打终有所成',
  '女': '女宿细腻，精细整理笔记错题，今日适合整理',
  '虚': '虚宿空乏，注意专注度，避免发呆走神',
  '危': '危宿谨慎，今日务必仔细审题，防止粗心犯错',
  '室': '室宿建基，适合夯实基础，查缺补漏',
  '壁': '壁宿文章，宜大量阅读背诵，知识积累型任务',
  '奎': '奎宿文魁，英语写作/政治大题今日写得流畅',
  '娄': '娄宿收获，坚持就是胜利，今日付出定有回报',
  '胃': '胃宿储备，大量刷题，储备题感和解题套路',
  '昴': '昴宿专注，屏蔽干扰，今日深度学习效果好',
  '毕': '毕宿稳健，一步一个脚印，完成今日计划即胜',
  '觜': '觜宿快决，限时训练，提升速度和决断力',
  '参': '参宿精准，今日适合挑战难题，严格精准',
  '井': '井宿智涌，今日灵感之泉，吸收力与理解力强',
  '鬼': '鬼宿凶险，注意保持健康和情绪，劳逸结合',
  '柳': '柳宿柔韧，文科复习（英语政治）今日效果佳',
  '星': '星宿光明，精神状态好，任何科目都能学进去',
  '张': '张宿满弓，适合模拟考试，弓开月满一击即中',
  '翼': '翼宿高飞，今日综合冲刺，翱翔在知识的天空',
  '轸': '轸宿终结，做好当下每一道题，终点在望',
};

// ─── 核心函数：获取今日六爻卦象 ───
export function getDailyYijing(lunar) {
  const dayGanZhi = lunar.getDayInGanZhi();   // 如 "甲子"
  const monthGanZhi = lunar.getMonthInGanZhi(); // 如 "甲子"
  const dayGan   = dayGanZhi.charAt(0);
  const dayZhi   = dayGanZhi.charAt(1);
  const monthGan = monthGanZhi.charAt(0);

  const ganIdx      = GAN.indexOf(dayGan);
  const zhiIdx      = ZHI.indexOf(dayZhi);
  const monthGanIdx = GAN.indexOf(monthGan);

  // 60甲子周期定位（公式：6*干序 - 5*支序 ≡ 周期位 mod 60）
  const cyclePos = ((6 * ganIdx - 5 * zhiIdx) % 60 + 60) % 60;

  // 映射到1-64周易卦序（月干提供额外变化，使同一日柱在不同月份得到不同卦）
  const kwNum = ((cyclePos * 3 + monthGanIdx * 5) % 64) + 1;
  const hex   = HEXAGRAM_BY_KW[kwNum];
  const binary = hex.upper * 8 + hex.lower;
  const palaceName = getHexPalace(hex);
  const palaceElement = BAGUA[hex.lower].element;
  const { shiIndex, yingIndex, rule: shiYingRule } = getShiYingIndices(hex);
  const movingIndices = getMovingLineIndices(cyclePos, monthGanIdx);
  const changedBinary = flipBinary(binary, movingIndices);
  const changedHex = HEXAGRAM_BY_BIN[changedBinary] || hex;
  const studyUseGod = getElementRelation(palaceElement, '火');

  // 生成6爻线（从初爻到上爻，取 binary 的各位）
  const liuShenStart = GAN_TO_LIUSHEN_START[ganIdx] ?? 0;
  const lines = Array.from({ length: 6 }, (_, i) => {
    const isYang = Boolean((binary >> i) & 1);
    const shen   = LIUSHEN[(liuShenStart + i) % 6];
    const lineBagua = i < 3 ? BAGUA[hex.lower] : BAGUA[hex.upper];
    const sixQin = getElementRelation(palaceElement, lineBagua.element);
    const isMoving = movingIndices.includes(i);
    const changedIsYang = Boolean((changedBinary >> i) & 1);
    return {
      num: i + 1,
      label: LINE_LABELS[i],
      isYang,
      type: isYang ? '阳' : '阴',
      symbol: isYang ? '⚊' : '⚋',
      isMoving,
      movingMark: isMoving ? '动' : '静',
      changedType: changedIsYang ? '阳' : '阴',
      changedSymbol: changedIsYang ? '⚊' : '⚋',
      lineBagua: lineBagua.name,
      lineElement: lineBagua.element,
      sixQin,
      liuShen: shen.name,
      shenColor: shen.color,
      shenBg: shen.bg,
      shenEmoji: shen.emoji,
      shenStudy: shen.study,
    };
  });

  const shiLine   = lines[shiIndex];
  const yingLine  = lines[yingIndex];

  // 今日"吉神爻"——六神中最有利学习的爻（青龙所在爻）
  const qingLongLine = lines.find(l => l.liuShen === '青龙');
  const movingLines = lines.filter(l => l.isMoving);
  const usefulLine = [...lines].sort((a, b) => {
    const score = (line) => {
      let s = 0;
      if (line.sixQin === studyUseGod) s += 5;
      if (line.liuShen === '青龙') s += 3;
      if (line.isMoving) s += 2;
      if (line.num === shiLine.num) s += 2;
      return s;
    };
    return score(b) - score(a);
  })[0];

  // 学习类型对应数值
  const TYPE_STATS = {
    '冲刺': { memory: 62, focus: 92, energy: 96, color: '#dc2626' },
    '吸收': { memory: 95, focus: 80, energy: 62, color: '#2563eb' },
    '整合': { memory: 72, focus: 78, energy: 70, color: '#059669' },
    '调整': { memory: 50, focus: 55, energy: 42, color: '#d97706' },
    '创造': { memory: 68, focus: 82, energy: 75, color: '#7c3aed' },
  };

  return {
    kwNum,
    name: hex.name,
    char: String.fromCodePoint(0x4DC0 + kwNum - 1),
    upper: BAGUA[hex.upper],
    lower: BAGUA[hex.lower],
    palace: BAGUA[hex.lower].name,
    palaceName: BAGUA_GONG[palaceName],
    palaceElement,
    type: hex.type,
    typeStats: TYPE_STATS[hex.type],
    judgment: hex.judgment,
    advice: hex.advice,
    lines,          // 初爻[0] → 上爻[5]
    shiLine,        // 世爻
    yingLine,       // 应爻
    qingLongLine,   // 青龙贵人爻
    movingLines,
    movingLineCount: movingLines.length,
    changed: {
      kwNum: changedHex.kw,
      name: changedHex.name,
      char: String.fromCodePoint(0x4DC0 + changedHex.kw - 1),
      upper: BAGUA[changedHex.upper],
      lower: BAGUA[changedHex.lower],
      type: changedHex.type,
      judgment: changedHex.judgment,
      advice: changedHex.advice,
    },
    studyUseGod,
    useGodMeaning: STUDY_USE_GODS[studyUseGod],
    useGodAdvice: getStudyJudgment(studyUseGod),
    usefulLine,
    shiYingRule,
    dayGanZhi,
    cyclePos,
  };
}

// ─── 二十八宿建议 ───
export function getXiuAdvice(xiuName) {
  return XIU_ADVICE[xiuName] || `${xiuName}宿，顺势而为，按计划学习即可`;
}
