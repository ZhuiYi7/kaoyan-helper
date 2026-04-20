import axios from 'axios';
import config from './config.js';
import { userProfile } from './user.js';

export async function getAIContent(weather, fortune, task, dailyQuiz, dailyWord, retries = 1) {
  if (!config.ai.enable || !config.ai.apiKey) {
    return null;
  }
  if (!dailyQuiz) {
    dailyQuiz = { subject: '综合', question: '今日无题', answer: '无' };
  }

  console.log('正在请求 AI 生成个性化内容...');
  
  const systemPrompt = `你是一位深度融合传统八字命理、西方占星学、现代学习科学的顶级考研规划大师。
命主档案：日主${userProfile.bazi.master}（${userProfile.bazi.description}），喜用神：${userProfile.bazi.favored.join('/')}，忌神：${userProfile.bazi.taboo.join('/')}。
西方星盘：太阳${userProfile.astro.sun} · 月亮${userProfile.astro.moon} · 上升${userProfile.astro.rising}。${userProfile.astro.studyTraits}
目标：双非逆袭985，2026年12月考研初试。

你的任务：根据今日干支、天气、学习任务、星盘，深度推理后输出七个模块内容。

【输出规则 - 极其重要】
1. 只输出一个合法JSON对象，不加任何前缀/后缀/代码块
2. JSON必须包含且仅包含这七个字段：fortune, quiz_analysis, news, mood, word_mnemonic, study_strategy, encouragement
3. 所有字段值为字符串，不含换行符

字段要求：
- fortune：结合今日干支与命主喜忌，深度推理今日学习运势与具体行动建议，语言幽默犀利，≤120字
- quiz_analysis：对今日题目进行深度解析+最强记忆口诀，帮助命主快速记忆，≤120字
- news：一条真实可信的计算机/考研行业动态，≤60字
- mood：结合今日天气的个性化鼓励，必须含emoji，≤40字
- word_mnemonic：针对今日单词生成记忆口诀/联想记忆法，帮命主5秒内记住这个考研英语单词，≤60字
- study_strategy：结合今日运势和任务，给出具体可执行的学习顺序和时间分配建议，≤80字
- encouragement：针对双非逆袭985的当下备考阶段，给命主一句燃魂的个性化激励，必含emoji，≤50字

今日题目：${dailyQuiz.question}
参考答案：${dailyQuiz.answer}`;

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
  const userPrompt = `
今日日期：${dateStr}
今日天气：${weather}
今日干支：${fortune.ganZhi}日
今日五行：${fortune.element}
神位：喜神${fortune.xiShen}
今日任务：数学${task ? task.math : '无'}，英语${task ? task.english : '无'}
今日单词：${dailyWord ? dailyWord.word + ' - ' + dailyWord.meaning : '无'}
`;

  try {
    const response = await axios.post(
      `${config.ai.baseURL}/chat/completions`,
      {
        model: config.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ai.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      try {
        let raw = response.data.choices[0].message.content.trim();
        // R1可能在JSON前后有推理文字，用正则提取第一个完整JSON对象
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) raw = jsonMatch[0];
        const result = JSON.parse(raw);
        if (!result.mood) {
          result.mood = "✨ 今天也要元气满满哦！";
        }
        return result;
      } catch (e) {
        console.error('AI 返回格式错误:', e.message, '\n原始内容:', response.data.choices[0].message.content.slice(0, 200));
        return null;
      }
    }
  } catch (error) {
    console.error('AI 请求失败:', error.message);
    if (retries > 0) {
      console.log(`AI 重试中... (剩余 ${retries} 次)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return getAIContent(weather, fortune, task, dailyQuiz, dailyWord, retries - 1);
    }
  }

  return null;
}
