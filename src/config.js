import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 加载 .env
dotenv.config({ path: path.join(__dirname, '../.env') });

export default {
  city: process.env.CITY_NAME || '洛阳',
  targetDate: process.env.TARGET_DATE || '2026-12-20',
  
  email: {
    enable: process.env.ENABLE_EMAIL === 'true',
    service: process.env.EMAIL_SERVICE || 'qq',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    to: process.env.EMAIL_TO
  },
  
  wxpusher: {
    enable: process.env.ENABLE_WXPUSHER === 'true',
    appToken: process.env.WXPUSHER_APP_TOKEN,
    uid: process.env.WXPUSHER_UID
  },
  
  ai: {
    enable: process.env.ENABLE_AI === 'true',
    baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'deepseek-chat'
  },

  // 模拟考 / 重要节点，日期格式 YYYY-MM-DD
  mockExams: [
    { date: '2026-05-20', name: '五月模拟考（数学+408）' },
    { date: '2026-08-15', name: '暑假全科模拟考' },
    { date: '2026-10-10', name: '十月冲刺模拟（全科）' },
    { date: '2026-11-20', name: '最终冲刺模拟考' },
  ]
};
