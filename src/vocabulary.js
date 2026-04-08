import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let vocabList = [];

try {
  const data = fs.readFileSync(path.join(__dirname, 'vocabulary.json'), 'utf-8');
  vocabList = JSON.parse(data);
} catch (e) {
  console.error('加载词库失败:', e);
  // Fallback
  vocabList = [
    { word: "abandon", meaning: "v. 放弃，遗弃", example: "He abandoned his hope." }
  ];
}

export function getDailyWord() {
  const now = process.env.PREVIEW_DATE ? new Date(process.env.PREVIEW_DATE + 'T08:00:00') : new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; // 本地时间
  
  // 使用日期字符串的简单哈希算法来选择索引，保证每天的单词是固定的
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % vocabList.length;
  return vocabList[index];
}
