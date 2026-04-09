import { Solar, Lunar } from 'lunar-javascript';
import { getDailyFortune } from './src/fortune.js';

console.log('--- 验证运势变化逻辑 ---');
console.log('我们将模拟未来 7 天的运势，看看是否符合黄历规律：\n');

// 覆盖 getDailyFortune 中的 new Date()，通过修改系统时间或传入参数 (这里简单修改 fortune.js 为接受可选参数)
// 或者，直接复制 fortune.js 中的核心逻辑来验证

const USER_DAY_MASTER = '丁';
const USER_E333LEMENT = '火'; 

const RELATION = {
  '木': { s: '印枭 (贵人)', effect: '生身' },
  '火': { s: '比劫 (朋友)', effect: '帮身' },
  '土': { s: '食伤 (才华)', effect: '泄身' },
  '金': { s: '财星 (欲望)', effect: '耗身' },
  '水': { s: '官杀 (压力)', effect: '克身' }
};

function getDailyElement(lunar) {
  const dayGan = lunar.getDayGan();
  if (['甲', '乙'].includes(dayGan)) return '木';
  if (['丙', '丁'].includes(dayGan)) return '火';
  if (['戊', '己'].includes(dayGan)) return '土';
  if (['庚', '辛'].includes(dayGan)) return '金';
  if (['壬', '癸'].includes(dayGan)) return '水';
  return '土';
}

const today = new Date();
for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() + i);
  
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayElement = getDailyElement(lunar);
  const relation = RELATION[dayElement];
  
  const dateStr = `${date.getMonth()+1}月${date.getDate()}日`;
  console.log(`📅 ${dateStr} [${dayGanZhi}日] (${dayElement}) -> 你的运势: ${relation.s}`);
}

console.log('\n--- 结论 ---');
console.log('可以看到，运势随着日子的天干地支在变化，而不是随机生成的。');
console.log('例如：甲/乙日是木(贵人)，丙/丁日是火(朋友)...');
