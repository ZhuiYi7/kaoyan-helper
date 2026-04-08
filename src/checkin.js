import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = path.join(__dirname, '../history.json');

function readHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

// 写入今日打卡记录，返回完整历史
export function checkIn(todayStr) {
  const history = readHistory();
  history[todayStr] = { checked: true, ts: Date.now() };
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  return history;
}

// 本地时间格式化为 YYYY-MM-DD（避免 toISOString() 的 UTC 偏差）
function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 计算连续打卡天数（从今天往前数）
export function getStreak(history) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = localDateStr(d);
    if (history[key] && history[key].checked) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// 获取最近7天打卡详情，供周报使用
export function getWeeklySummary(history) {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localDateStr(d);
    days.push({ date: key, checked: !!(history[key] && history[key].checked) });
  }
  const checkedCount = days.filter(d => d.checked).length;
  return { days, checkedCount };
}
