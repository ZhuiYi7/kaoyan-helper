import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './src/config.js';
import getWeather from './src/weather.js';
import { getDailyQuote } from './src/quote.js';
import { sendEmail, sendWXPusher } from './src/pusher.js';
import { getDailyFortune, getStudyFortune } from './src/fortune.js';
import { getClothingAdvice } from './src/clothing.js';
import { generateDashboard } from './src/dashboard_gen.js';
import { getAIContent } from './src/ai.js';
import { getRandomQuiz } from './src/quiz.js';
import { getDailyWord } from './src/vocabulary.js';
import { formatTarotWarning } from './src/tarot.js';
import { getHealthTip } from './src/health.js';
import { checkIn, getStreak, getWeeklySummary } from './src/checkin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

// PREVIEW_DATE=2026-04-07 可模拟任意日期
function getNow() {
  return process.env.PREVIEW_DATE ? new Date(process.env.PREVIEW_DATE + 'T08:00:00') : new Date();
}

// ---------------- 辅助函数 ----------------

function getCountdown() {
  const now = getNow();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayMs = new Date(`${y}-${m}-${d}T00:00:00`).getTime();
  const targetMs = new Date(`${config.targetDate}T00:00:00`).getTime();
  return Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24));
}

function getStudyPhase() {
  const m = getNow().getMonth() + 1, d = getNow().getDate();
  if (m < 3 || (m === 3 && d < 21)) return { name: '备考准备期', icon: '🌱', color: '#86efac' };
  if (m <= 6)  return { name: '基础阶段',  icon: '📖', color: '#93c5fd' };
  if (m <= 8)  return { name: '强化阶段',  icon: '💪', color: '#fde68a' };
  if (m === 9 || (m === 10 && d <= 15)) return { name: '真题阶段', icon: '📝', color: '#f9a8d4' };
  if (m <= 11) return { name: '冲刺阶段',  icon: '🔥', color: '#fca5a5' };
  return { name: '考前冲刺', icon: '🚀', color: '#c4b5fd' };
}

function getDailyTimetable(date = null) {
  // ══════════════════════════════════════════════════
  // 八字+星盘双系统推算最佳学习时段
  // 八字：丁火日主身弱，喜木火忌金水
  //   ✅ 卯(6-7木旺) 巳(9-11火旺) 午(11-13火旺) 戌(19-21藏火)
  //   ❌ 申(15-17金旺) 酉(17-19金旺) 亥(21-23水旺)
  // 星盘：太阳处女(土象，清晨分析力强) 月亮摩羯(情绪稳，忌熬夜)
  //       上升狮子(火象，上午阳气旺)
  // 双峰值：9:00-12:00 = 八字巳午火旺 × 星盘上升狮子 × 太阳处女逻辑峰
  // ══════════════════════════════════════════════════
  const m = (date || getNow()).getMonth() + 1;

  // 基础阶段 4-6月：约7h/天
  if (m >= 4 && m <= 6) return [
    { subject: '� 英语背词', time: '6:30–7:30',  duration: '1h',   tip: '卯时木旺，印星生丁火，记忆力峰值' },
    { subject: '📐 数学',     time: '9:00–12:00', duration: '3h',   tip: '巳午双火时：八字+上升狮子双峰，全天最强专注窗口' },
    { subject: '💻 408',      time: '14:00–16:30',duration: '2.5h', tip: '未时土旺中性，适合理解+刷题，避开申金忌时' },
    { subject: '📖 英语阅读', time: '19:00–20:00',duration: '1h',   tip: '戌时藏火，效率尚可，月亮摩羯此时仍稳定' },
    { subject: '📋 复盘',     time: '20:00–21:00',duration: '1h',   tip: '月亮摩羯：21点前必须结束，之后效率断崖' },
  ];

  // 强化阶段 7-8月：约9h/天（含政治）
  if (m >= 7 && m <= 8) return [
    { subject: '� 英语背词', time: '6:30–7:30',  duration: '1h',   tip: '卯时木旺，考研单词记忆最佳时段' },
    { subject: '📐 数学',     time: '9:00–12:00', duration: '3h',   tip: '巳午火旺双峰值，强化真题专项攻坚' },
    { subject: '💻 408',      time: '14:00–17:00',duration: '3h',   tip: '未申交界，避免15:30后金气过重，提前收尾' },
    { subject: '🏴 政治',     time: '19:00–20:30',duration: '1.5h', tip: '戌时记忆尚可，马原+史纲优先' },
    { subject: '📋 复盘',     time: '20:30–21:00',duration: '0.5h', tip: '摩羯月亮：21点硬截止，保护睡眠' },
  ];

  // 真题阶段 9-10月中旬：约10h/天
  if (m === 9 || (m === 10 && (date || getNow()).getDate() <= 15)) return [
    { subject: '� 英语',     time: '7:00–8:00',  duration: '1h',   tip: '卯辰时，真题阅读替代背词' },
    { subject: '📐 数学',     time: '9:00–12:30', duration: '3.5h', tip: '巳午时双峰，全真题计时模拟' },
    { subject: '💻 408',      time: '14:00–17:00',duration: '3h',   tip: '未时理解，申时前收尾（忌金时做难题）' },
    { subject: '🏴 政治',     time: '19:00–20:30',duration: '1.5h', tip: '戌时，腿姐技巧班+腿四' },
    { subject: '📋 复盘',     time: '20:30–21:00',duration: '0.5h', tip: '月亮摩羯21点必睡，保证明日状态' },
  ];

  // 冲刺/考前阶段 10月下旬-12月：约10h/天
  return [
    { subject: '� 英语',     time: '7:00–8:00',  duration: '1h',   tip: '卯时，作文模板朗读+翻译热身' },
    { subject: '📐 数学',     time: '9:00–12:30', duration: '3.5h', tip: '巳午峰值，错题二刷+押题模拟卷' },
    { subject: '💻 408',      time: '14:00–17:00',duration: '3h',   tip: '真题三刷+冲刺笔记，申时前强制收尾' },
    { subject: '🏴 政治',     time: '19:00–20:30',duration: '1.5h', tip: '戌时，肖四肖八押题卷' },
    { subject: '📋 复盘',     time: '20:30–21:00',duration: '0.5h', tip: '上升狮子需要总结成就感，今日收获写下来' },
  ];
}

function getProgress() {
  // 备考实际开始日，与 generate_schedule.js 的 START_DATE 保持一致
  const start = new Date('2026-04-07');
  const target = new Date(config.targetDate);
  const now = getNow();
  
  const total = target - start;
  const passed = now - start;
  
  let percentage = (passed / total) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  
  return percentage.toFixed(1);
}

function getProgressBar(percentage) {
  const length = 20;
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

function getTeacherRemarks(todayTask, plan22, phase) {
  const text = [
    todayTask?.math,
    todayTask?.['408'],
    todayTask?.english,
    todayTask?.politics,
    plan22?.math,
    plan22?.english,
    plan22?.['408'],
    plan22?.politics,
  ].filter(Boolean).join(' | ');

  const remarks = [];

  if (/中值定理|拉格朗日|罗尔|柯西/.test(text)) {
    remarks.push('📌 数学补充：中值定理辅助函数如果还不顺，优先补 `杨超` 的专题讲解，专治“会听不会构造”。');
  }
  if (/极限|连续/.test(text)) {
    remarks.push('📌 数学补充：极限与连续卡壳时，可加看 `张宇` 的极限题型归纳，夹逼/等价无穷小/周期函数极限讲得更有题感。');
  }
  if (/线代|行列式|矩阵|向量组|方程组|特征值|二次型/.test(text)) {
    remarks.push('📌 线代补充：主线按 `武宇乐（没咋了）` 走；若某个定义证明或基础概念还发虚，再用 `李永乐` 做查漏，不反客为主。');
  }
  if (/定积分几何应用|面积|体积|弧长|侧面积/.test(text)) {
    remarks.push('📌 数学补充：定积分几何应用建议补 `武忠祥` 专题，面积/体积/弧长这类题型拆得更细。');
  }
  if (/微分方程/.test(text)) {
    remarks.push('📌 数学补充：微分方程想稳拿分，优先跟 `张宇` 打主线，步骤模板再结合真题自己固化。');
  }
  if (/英语|阅读|长难句|主干公式|句句讲|读9项/.test(text)) {
    remarks.push('📌 英语补充：英二阅读主线继续 `柴荣 + 颉斌斌`；如果你当天是长难句卡顿，优先回 `颉斌斌主干公式`，不要盲目加老师。');
  }
  if (/翻译/.test(text)) {
    remarks.push('📌 英语补充：翻译专项优先 `唐静`，重点不是词对词，而是“拆主干 + 顺句序 + 补逻辑”。');
  }
  if (/作文|图表|小作文/.test(text)) {
    remarks.push('📌 英语补充：作文以 `王江涛` 为模板库，但最后一定要整理你自己的定稿版，避免模板味过重。');
  }
  if (/完型/.test(text)) {
    remarks.push('📌 英语补充：完型性价比不高，`易熙人` 带一遍方法足够，别在这块过度耗时。');
  }
  if (/数据结构|链表|树|图|拓扑|AOE|排序|栈|队列|KMP/.test(text)) {
    remarks.push('📌 408补充：数据结构主线仍以 `王道` 为核心；代码手写薄弱时，可额外补 `B站 C语言/数据结构手写题`，重点补实现感。');
  }
  if (/组成原理|计组|Cache|IEEE754|流水线|指令/.test(text)) {
    remarks.push('📌 408补充：计组计算题一定要自己列步骤；`王道` 够做主线，难点在 Cache、浮点数、流水线，建议单独整理公式卡。');
  }
  if (/操作系统|PV|进程|线程|调度|文件管理|死锁/.test(text)) {
    remarks.push('📌 408补充：操作系统里 `PV` 和 `文件管理` 是大题高频坑点，主线用 `王道`，但必须靠你自己反复手写过程。');
  }
  if (/计网|网络|TCP|IP|子网|路由|拥塞/.test(text)) {
    remarks.push('📌 408补充：计网易混概念多，建议继续以 `王道` 为主，尤其把 TCP、拥塞控制、子网划分做成一页对照表。');
  }
  if (/政治|马原|史纲|毛中特|思修|时政/.test(text) || phase.name === '强化阶段' || phase.name === '真题阶段' || phase.name === '冲刺阶段' || phase.name === '考前冲刺') {
    remarks.push('📌 政治补充：主线继续 `腿姐技巧班 + 肖四肖八`；如果想把基础概念听顺一点，可补 `徐涛` 的马原/史纲基础讲解。');
  }

  return remarks.slice(0, 4);
}

function renderPlan22Card(card) {
  if (!card) return '';
  const coachLines = Array.isArray(card.coaches)
    ? card.coaches.map(line => `> - ${line}`).join('\n')
    : '';
  return [
    '> ',
    '> 🗂 **22408作战卡**',
    `> - **当前阶段**：${card.phaseLabel}`,
    `> - **今日主攻**：${card.focus}`,
    coachLines,
    `> - **易错提醒**：${card.warning}`,
    `> - **晚间验收**：${card.checkpoint}`,
    '',
  ].filter(Boolean).join('\n');
}

function renderPlan22TomorrowCard(card) {
  if (!card) return '';
  return [
    '> ',
    '> 🗓 **22408明日作战卡**',
    `> - **明日主攻**：${card.focus}`,
    `> - **明日避坑**：${card.warning}`,
    `> - **收尾标准**：${card.checkpoint}`,
    '',
  ].filter(Boolean).join('\n');
}

// 模拟考 / 重要节点提醒（7天内预警）
function getMockExamReminder(mockExams) {
  if (!mockExams || !mockExams.length) return null;
  const now = getNow();
  const reminders = [];
  for (const exam of mockExams) {
    const examDate = new Date(exam.date);
    const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      reminders.push(`🎯 **【模拟考预警】** ${exam.name} 还有 **${diffDays}** 天！(${exam.date})`);
    }
  }
  return reminders.length ? reminders.join('\n') : null;
}

// 考研关键节点提醒
function getExamMilestone() {
  const now = getNow();
  const month = now.getMonth() + 1;
  
  if (month === 9) return '📢 【预报名】本月开启，请关注研招网公告！';
  if (month === 10) return '📢 【正式报名】本月开启，千万别错过！';
  if (month === 11) return '📢 【现场确认】本月进行，记得核对信息！';
  if (month === 12) return '🔥 【冲刺阶段】打印准考证，调整作息！';
  
  return null;
}

// 危机感进度条
function getCrisisAlert() {
  const now = getNow();
  const year = now.getFullYear();
  
  // 年进度
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);
  const yearProgress = ((now - startOfYear) / (endOfYear - startOfYear) * 100).toFixed(1);
  
  // 周进度 (周一为开始)
  const day = now.getDay() || 7; // 1-7
  const weekProgress = ((day / 7) * 100).toFixed(0);
  
  return `⚠️ **危机感提醒**: 今年已过去 ${yearProgress}%，本周已过去 ${weekProgress}%。`;
}

// 扫描 schedule.json 统计某知识点共几天，返回格式化字符串 "D1/2天"
function fmtTask(scheduleData, subject, taskStr) {
  const dMatch = taskStr.match(/D(\d+)/);
  if (!dMatch) return taskStr;
  const curDay = parseInt(dMatch[1]);
  const baseTopic = taskStr.replace(/\s*D\d+[:\s].*$/, '').trim();
  let maxDay = curDay;
  for (const entry of Object.values(scheduleData)) {
    const t = entry[subject];
    if (t && t.startsWith(baseTopic)) {
      const m = t.match(/D(\d+)/);
      if (m) maxDay = Math.max(maxDay, parseInt(m[1]));
    }
  }
  return taskStr.replace(/D(\d+)([:\s])/, `**[第${curDay}天/共${maxDay}天]**$2`);
}

// ---------------- 主函数 ----------------

export async function main(options = {}) {
  const { skipSend = false } = options;
  console.log('Script starting...');
  const now = getNow();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // 1. 读取任务
  const schedulePath = path.join(__dirname, 'schedule.json');
  let scheduleData = {};
  try {
    if (fs.existsSync(schedulePath)) {
      const rawData = fs.readFileSync(schedulePath, 'utf-8');
      scheduleData = JSON.parse(rawData);
    } else {
      console.warn('schedule.json not found! Please run generate_schedule.js first.');
    }
  } catch (err) {
    console.error('读取 schedule.json 失败:', err.message);
  }

  const todayTask = scheduleData[todayStr];
  const schedule22Path = path.join(__dirname, 'schedule22.json');
  let schedule22Data = {};
  try {
    if (fs.existsSync(schedule22Path)) {
      schedule22Data = JSON.parse(fs.readFileSync(schedule22Path, 'utf-8'));
    } else {
      console.warn('schedule22.json not found! Please run generate_schedule.js first.');
    }
  } catch (err) {
    console.error('读取 schedule22.json 失败:', err.message);
  }
  const todayTask22 = schedule22Data[todayStr];
  
  // 2. 计算本地数据
  const daysLeft = getCountdown();
  const progress = getProgress();
  const progressBar = getProgressBar(progress);
  const fortune = getDailyFortune();
  const phase = getStudyPhase();
  const timetable = getDailyTimetable();
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowTimetable = getDailyTimetable(tomorrowDate);
  const milestone = getExamMilestone();
  const crisisAlert = getCrisisAlert();
  const healthTip = getHealthTip();
  const mockExamReminder = getMockExamReminder(config.mockExams);
  const studyFortune = getStudyFortune(fortune.element);

  // 打卡记录 & 连续天数
  const history = checkIn(todayStr);
  const streak = getStreak(history);
  const isWeeklyReport = getNow().getDay() === 0; // 周日
  const weeklySummary = isWeeklyReport ? getWeeklySummary(history) : null;
  
  // 3. 获取外部数据 (并发)
  const [weather, quote] = await Promise.all([
    getWeather(config.city),
    getDailyQuote()
  ]);
  
  const clothing = getClothingAdvice(weather);

  // 4. 获取每日真题 (离线)
  const dailyQuiz = getRandomQuiz();
  // 4.1 获取每日单词 (离线)
  const dailyWord = getDailyWord();

  // 5. 获取 AI 生成内容 (整合请求)
  const aiContent = await getAIContent(weather, fortune, todayTask, dailyQuiz, dailyWord);

  // 6. 构建推送消息
  const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '📌';
  let title = `📅 考研倒计时: ${daysLeft}天 | ${streakEmoji} 连续打卡${streak}天`;
  let content = `### 早上好！今天是 ${todayStr}\n\n`;
  
  // AI 心情文案 (如果有)
  if (aiContent && aiContent.mood) {
    content += `> ${aiContent.mood}\n\n`;
  } else {
    content += `> ${quote.content}\n`;
    content += `> *${quote.note}*\n\n`;
  }
  
  content += `📍 **坐标**: ${config.city} | 🌤 **天气**: ${weather}\n\n`;
  content += `⏳ **复习进度**: ${progress}%\n`;
  content += `${progressBar}\n`;
  content += `${phase.icon} **当前阶段**: ${phase.name} | ${streakEmoji} **连续打卡**: ${streak} 天\n\n`;

  content += `\n`;

  // --- 任务板块（置顶，最重要）---
  content += `> ## � 今日学习任务\n`;
  if (todayTask) {
    content += `> ⬜ **📐 数学** → ${fmtTask(scheduleData, 'math', todayTask.math)}\n`;
    content += `> ⬜ **💻 408** → ${fmtTask(scheduleData, '408', todayTask['408'])}\n`;
    content += `> ⬜ **📖 英语** → ${todayTask.english}\n`;
    content += `> ⬜ **🏴 政治** → ${todayTask.politics || '暂不复习，8月开始'}\n`;
    if (todayTask.challenge) {
      content += `> \n`;
      content += `> 🚀 **学有余力**: ${todayTask.challenge}\n`;
    }
    if (todayTask.note) {
      const noteLines = String(todayTask.note)
        .split('\n')
        .filter(Boolean)
        .map(line => `> ${line}`)
        .join('\n');
      content += `> \n`;
      content += `> 🧭 **今日提醒**\n`;
      content += `${noteLines}\n`;
    }
    const teacherRemarks = getTeacherRemarks(todayTask, todayTask22, phase);
    if (teacherRemarks.length) {
      content += `> \n`;
      content += `> 🧑‍🏫 **补充名师备注**\n`;
      content += teacherRemarks.map(line => `> ${line}`).join('\n') + `\n`;
    }
  } else {
    content += `> 🎉 今日无特定任务，建议复习错题或休息。\n`;
  }

  // --- 🔀 22408 对比方案 (数二 + 英二 + 柴荣/颉斌斌体系) ---
  if (todayTask22) {
    content += `\n> ## 🔀 22408 对比方案 · ${todayStr} (数二·英二·柴荣/颉斌斌)\n`;
    content += `> ⬜ **📐 数二** → ${todayTask22.math}\n`;
    content += `> ⬜ **💻 408** → ${todayTask22['408']}\n`;
    content += `> ⬜ **📖 英二** → ${todayTask22.english}\n`;
    content += `> ⬜ **🏴 政治** → ${todayTask22.politics}\n`;
    if (todayTask22.challenge) {
      content += `> \n`;
      content += `> 🚀 **22408加固动作**: ${todayTask22.challenge}\n`;
    }
    if (todayTask22.note) {
      const note22Lines = String(todayTask22.note)
        .split('\n')
        .filter(Boolean)
        .map(line => `> ${line}`)
        .join('\n');
      content += `> \n`;
      content += `> 🧭 **22408提醒**\n`;
      content += `${note22Lines}\n`;
    }
    content += renderPlan22Card(todayTask22.card);
  }

  // AI 个性化激励
  if (aiContent && aiContent.encouragement) {
    content += `\n> 💬 ${aiContent.encouragement}\n`;
  }
  // 今日时间表
  const totalH = timetable.reduce((s, t) => s + parseFloat(t.duration), 0);
  content += `> \n> ⏰ **今日时间表** (总计约${totalH}h)\n`;
  timetable.forEach(t => {
    content += `> \`${t.time}\` ${t.subject} **${t.duration}** — ${t.tip}\n`;
  });
  content += `\n---\n\n`;

  // 危机感提醒
  content += `${crisisAlert}\n\n`;

  // 模拟考预警
  if (mockExamReminder) {
    content += `${mockExamReminder}\n\n`;
  }

  // 塔罗牌月度提醒
  const tarotWarning = formatTarotWarning();
  if (tarotWarning) {
    content += tarotWarning;
  }

  // 插入关键节点提醒
  if (milestone) {
    content += `${milestone}\n\n---\n\n`;
  } else {
    content += `---\n\n`;
  }

  // --- 玄学板块 ---
  content += `### 🔮 今日玄学 & 穿搭\n`;
  content += `- **五行运势**: ${fortune.element}日 (${fortune.relation}) ${fortune.stars}\n`;
  
  // AI 运势解读
  if (aiContent && aiContent.fortune) {
    content += `> **🧙‍♂️ 大师指点**: ${aiContent.fortune}\n`;
  } else {
    content += `- **玄学建议**: ${fortune.advice}\n`;
  }
  
  content += `- **黄历宜忌**: 🟢 宜[${fortune.yi}] | 🔴 忌[${fortune.ji}]\n`;
  content += `- **冲煞神位**: ⚡ 冲${fortune.chong} | 喜${fortune.xiShen}\n`;
  content += `- **${clothing.icon} 穿搭**: ${clothing.advice}\n\n`;

  // --- 周易六爻 ---
  if (fortune.yijing) {
    const y = fortune.yijing;
    content += `### ☯ 周易六爻 · 今日卦象\n`;
    content += `**第${y.kwNum}卦 ${y.name}卦** ${y.char}　${y.upper.symbol}${y.upper.name}(上) / ${y.lower.symbol}${y.lower.name}(下)　[${y.type}型]\n`;
    content += `- **卦宫**: ${y.palaceName} (${y.palaceElement}) | **学习用神**: ${y.studyUseGod} (${y.useGodMeaning})\n`;
    content += `> 📜 ${y.judgment}\n`;
    content += `> 💡 ${y.advice}\n`;
    content += `> 🎯 **用神提示**: ${y.useGodAdvice}\n`;
    if (y.qingLongLine) {
      content += `> 🐉 **第${y.qingLongLine.num}爻 青龙贵人** — ${y.qingLongLine.shenStudy}\n`;
    }
    if (y.usefulLine) {
      content += `> 🌟 **关键主爻**: ${y.usefulLine.label}爻 ${y.usefulLine.sixQin}${y.usefulLine.movingMark} · ${y.usefulLine.liuShen}\n`;
    }
    content += `- **世应**: 世在${y.shiLine.label}爻 / 应在${y.yingLine.label}爻\n`;
    // 六爻线图（文字版，从上爻到初爻）
    const lineChart = [...y.lines].reverse().map(l => {
      const bar = l.isYang ? '━━━━━━━━' : '━━━  ━━━';
      const moving = l.isMoving ? `→${l.changedType}` : '';
      return `${l.num}爻${bar}${l.sixQin}/${l.liuShen}·${l.type}${moving}`;
    }).join('  ');
    content += `\`${lineChart}\`\n`;
    if (y.movingLines.length) {
      content += `- **动爻**: ${y.movingLines.map(l => `${l.label}爻(${l.sixQin}/${l.liuShen})`).join('、')}\n`;
      content += `- **变卦**: 第${y.changed.kwNum}卦 ${y.changed.name}卦 ${y.changed.char} [${y.changed.type}型]\n`;
      content += `> 🔁 ${y.changed.judgment}；${y.changed.advice}\n`;
    }
    if (fortune.naYin) content += `- 🎵 **纳音五行**: ${fortune.naYin}\n`;
    if (fortune.pengZuGan) content += `- 🚫 **彭祖百忌**: ${fortune.pengZuGan}；${fortune.pengZuZhi}\n`;
    content += `\n`;
  }

  // --- 学习运势 ---
  (() => {
    const sf = studyFortune;
    const bar = (n) => { const f = Math.round(n / 10); return '▓'.repeat(f) + '░'.repeat(10 - f); };
    content += `### 📚 今日学习运势 [${fortune.element}日 ${fortune.stars}]\n`;
    content += `> ${sf.tip}\n`;
    content += `- 🧠 **记忆力** ${bar(sf.memory)} ${sf.memory}%\n`;
    content += `- 🎯 **专注力** ${bar(sf.focus)} ${sf.focus}%\n`;
    content += `- ⚡ **学习精力** ${bar(sf.energy)} ${sf.energy}%\n`;
    content += `- ✅ **今日最适合**: ${sf.best.join(' · ')}\n`;
    content += `- ⚠️ **今日少做**: ${sf.worst.join(' · ')}\n\n`;
    // AI 学习策略
    if (aiContent && aiContent.study_strategy) {
      content += `> 📌 **今日策略**: ${aiContent.study_strategy}\n\n`;
    }
  })();

  // --- 每日一题 (离线 + AI解析) ---
  if (dailyQuiz) {
    content += `\n---\n📝 **每日一题 [${dailyQuiz.subject}]**:\n`;
    content += `${dailyQuiz.question}\n`;
    
    // AI 题目解析
    if (aiContent && aiContent.quiz_analysis) {
      content += `\n💡 **AI 点拨**: ${aiContent.quiz_analysis}\n`;
    } else {
      content += `\n*答案请查看本地看板*\n`;
    }
  }

  // --- 每日单词 (离线) ---
  if (dailyWord) {
    content += `\n---\n🔤 **每日核心词**: ${dailyWord.word}\n`;
    content += `> ${dailyWord.meaning}\n`;
    content += `> *${dailyWord.example}*\n`;
    if (aiContent && aiContent.word_mnemonic) {
      content += `> 🧠 **记忆口诀**: ${aiContent.word_mnemonic}\n`;
    }
  }

  // --- 健康贴士 ---
  content += `\n---\n🍵 **养生小贴士**: ${healthTip}\n`;

  // --- 周报（仅周日）---
  if (isWeeklyReport && weeklySummary) {
    const bar = weeklySummary.days.map(d => d.checked ? '✅' : '⬜').join(' ');
    const scoreText = weeklySummary.checkedCount >= 6 ? '🏆 完美一周！' :
                      weeklySummary.checkedCount >= 4 ? '💪 表现不错！' :
                      weeklySummary.checkedCount >= 2 ? '⚠️ 需要加把劲！' : '🚨 本周打卡严重不足！';
    content += `\n---\n### 📊 本周打卡周报\n`;
    content += `${bar}\n`;
    content += `> 本周共打卡 **${weeklySummary.checkedCount}/7** 天  ${scoreText}\n`;
    content += `> 下周继续保持节奏，稳步前进！\n`;
  }

  // --- 行业动态 (AI) ---
  if (aiContent && aiContent.news) {
    content += `\n---\n📰 **行业速递**: ${aiContent.news}\n`;
  }

  // --- 明日预览 ---
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tmStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
  const tomorrowTask = scheduleData[tmStr];
  const tomorrowTask22 = schedule22Data[tmStr];
  // 从时间表中提取各科时段信息
  const tmSlot = (keyword) => {
    const t = tomorrowTimetable.find(t => t.subject.includes(keyword));
    return t ? ` \`${t.time}\` *(${t.duration})*` : '';
  };
  content += `\n---\n### 📅 明日预览 (${tmStr})\n`;
  if (tomorrowTask22) {
    content += `> ⬜ 📐 **数学**${tmSlot('数学')} → ${tomorrowTask22.math}\n`;
    content += `> ⬜ 💻 **408**${tmSlot('408')} → ${tomorrowTask22['408']}\n`;
    content += `> ⬜ 📖 **英语**${tmSlot('英语')} → ${tomorrowTask22.english}\n`;
    content += `> ⬜ 🏴 **政治** → ${tomorrowTask22.politics}\n`;
    content += renderPlan22TomorrowCard(tomorrowTask22.card);
  } else {
    content += `> 明日暂无特定任务，可自由安排复习或休息。\n`;
  }
  content += `\n---\n`;
  content += `> *心态稳住，按部就班，科软在等你！*`;

  console.log(skipSend ? '正在生成网页（跳过消息发送）...\n' : '正在发送消息...\n');
  console.log(content);

  // 7. 生成本地 Dashboard
  try {
    const dashboardHtml = generateDashboard(config, weather, quote, fortune, clothing, todayTask, progress, daysLeft, dailyQuiz, dailyWord, streak, phase, aiContent, timetable, todayTask22, tomorrowTask22);
    const dashboardPath = path.join(__dirname, 'dashboard.html');
    fs.writeFileSync(dashboardPath, dashboardHtml, 'utf-8');
    console.log(`\n✅ 本地打卡看板已生成: ${dashboardPath}`);
    console.log(`(你可以双击打开该文件进行任务打卡)`);
  } catch (e) {
    console.error('生成本地文件失败:', e);
  }

  // 8. 发送消息
  if (!skipSend) {
    if (config.email.enable) {
      await sendEmail(config.email, title, content);
    } 
    
    if (config.wxpusher.enable) {
      await sendWXPusher(config.wxpusher, title, content);
    }

    if (!config.email.enable && !config.wxpusher.enable) {
      console.log('未开启任何发送方式，请检查 .env 配置');
    }
  }
}

if (isDirectRun) {
  main().catch(err => {
    console.error('主程序错误:', err);
  });
}
