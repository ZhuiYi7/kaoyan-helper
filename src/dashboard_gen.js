import { getHealthTip } from './health.js';
import { getMonthlyTarot } from './tarot.js';
import { getStudyFortune } from './fortune.js';

export function generateDashboard(config, weather, quote, fortune, clothing, task, progress, daysLeft, dailyQuiz, dailyWord, streak = 0, phase = null, aiContent = null, timetable = null) {
  const healthTip = getHealthTip(); // 获取健康建议
  const tarot = getMonthlyTarot(); // 获取本月塔罗牌提醒
  const sf = getStudyFortune(fortune.element); // 获取学习运势
  // phase 由 index.js 传入，此处兜底
  const _phase = phase || { name: '基础阶段', icon: '📖', color: '#93c5fd' };

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>考研小助手 - 今日看板</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f6f8; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .quote { padding: 20px; background: #fafafa; border-bottom: 1px solid #eee; text-align: center; font-style: italic; color: #666; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
    .card { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px; }
    .card h3 { margin-top: 0; color: #764ba2; border-bottom: 2px solid #ddd; padding-bottom: 10px; font-size: 16px; }
    .task-list { list-style: none; padding: 0; }
    .task-item { display: flex; align-items: center; padding: 10px; background: #fff; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .task-item:hover { transform: translateY(-2px); box-shadow: 0 3px 6px rgba(0,0,0,0.1); }
    .task-item input[type="checkbox"] { margin-right: 12px; width: 20px; height: 20px; cursor: pointer; }
    .task-item.completed { text-decoration: line-through; color: #999; background: #f0f0f0; }
    .progress-bar { height: 10px; background: #eee; border-radius: 5px; margin-top: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #48bb78; width: ${progress}%; transition: width 0.5s; }
    .fortune-tag { display: inline-block; padding: 4px 8px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 12px; margin-right: 5px; margin-bottom: 5px;}
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
    .yi-ji-box { display: flex; gap: 10px; margin-bottom: 10px; font-size: 13px; }
    .yi-box { flex: 1; background: #dcfce7; color: #166534; padding: 5px; border-radius: 4px; }
    .ji-box { flex: 1; background: #fee2e2; color: #991b1b; padding: 5px; border-radius: 4px; }
    
    .diary-input { width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical; margin-top: 10px; font-family: inherit; }
    .diary-btn { margin-top: 5px; background: #667eea; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; float: right; }
    .diary-btn:hover { background: #5a67d8; }
    
    .answer-box { display: none; background: #fff; padding: 10px; border-left: 3px solid #48bb78; margin-top: 10px; font-size: 14px; color: #333; }
    .show-answer-btn { background: none; border: none; color: #667eea; cursor: pointer; font-size: 12px; padding: 0; text-decoration: underline; }
    
    .phase-badge { display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; }
    .streak-badge { display: inline-block; background: linear-gradient(135deg, #f093fb, #f5576c); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-left: 10px; }

    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 考研倒计时 ${daysLeft} 天<span class="streak-badge">${streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '📌'} 连续${streak}天</span></h1>
      <p><span class="phase-badge" style="background:${_phase.color}; color:#1a1a1a;">${_phase.icon} 当前阶段：${_phase.name}</span></p>
      <p>坐标：${config.city} | 天气：${weather}</p>
      <div class="progress-bar"><div class="progress-fill"></div></div>
      <p style="font-size: 12px; margin-top: 5px;">总复习进度：${progress}%</p>
    </div>
    
    <div class="quote">
      "${quote.content}"
      <br><span style="font-size: 12px; color: #999;">${quote.note}</span>
    </div>

    <div class="grid">
      <div class="card" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; box-shadow: 0 4px 16px rgba(16,185,129,0.18);">
        <h3 style="color: #065f46; border-bottom-color: #6ee7b7;">� 今日任务 (点击打卡)</h3>
        <ul class="task-list" id="taskList">
          <!-- 任务列表由 JS 动态生成 -->
        </ul>
        ${aiContent && aiContent.encouragement ? `<div style="margin-top:12px; padding:10px 14px; background:#dcfce7; border-radius:8px; color:#14532d; font-size:13px; border-left:3px solid #16a34a;">💬 ${aiContent.encouragement}</div>` : ''}
      </div>

      <div class="card">
        <h3>🔮 今日玄学 & 穿搭</h3>
        <div style="margin-bottom: 15px;">
          <span class="fortune-tag">日柱: ${fortune.ganZhi}</span>
          <span class="fortune-tag">五行: ${fortune.element}</span>
          <span class="fortune-tag">运势: ${fortune.stars}</span>
        </div>

        <div class="yi-ji-box">
           <div class="yi-box">🟢 宜: ${fortune.yi}</div>
           <div class="ji-box">🔴 忌: ${fortune.ji}</div>
        </div>

        <p style="font-size: 13px; color: #555; margin: 5px 0;">
           ⚡ <strong>冲煞:</strong> 冲${fortune.chong} | 煞${fortune.sha} <br>
           🙏 <strong>神位:</strong> 喜神(${fortune.xiShen}) | 财神(${fortune.caiShen})
        </p>

        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 10px 0;">

        <p><strong>✨ 运势:</strong> ${fortune.relation} (${fortune.mood})</p>
        <p><strong>💡 建议:</strong> ${fortune.advice}</p>
        <p><strong>🎨 幸运色:</strong> ${fortune.luckyColor}</p>
        
        ${tarot ? `
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 10px 0;">
        
        <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 8px 0;"><strong>🃏 本月塔罗: ${tarot.card}</strong></p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; line-height: 1.6;">⚠️ <strong>人生提示</strong>: ${tarot.warning}</p>
          ${tarot.study ? `<p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6; background: #dbeafe; padding: 8px; border-radius: 4px;">📚 <strong>考研专属</strong>: ${tarot.study}</p>` : ''}
        </div>
        ` : ''}
        
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 10px 0;">
        
        <p><strong>${clothing.icon} 穿搭:</strong> ${clothing.advice}</p>
      </div>
    </div>
    
    <div class="card" style="margin: 0 20px 20px 20px;">
      <h3>📚 今日学习运势 [${fortune.element}日 ${fortune.stars}]</h3>
      <p style="color:#555; margin: 0 0 12px 0; font-size:13px;">${sf.tip}</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
        ${[
          { label: '🧠 记忆力', val: sf.memory, color: '#667eea' },
          { label: '🎯 专注力', val: sf.focus,  color: '#48bb78' },
          { label: '⚡ 学习精力', val: sf.energy, color: '#ed8936' }
        ].map(item => `
        <div style="display:flex; align-items:center; gap:10px; font-size:13px;">
          <span style="width:70px; flex-shrink:0;">${item.label}</span>
          <div style="flex:1; height:8px; background:#eee; border-radius:4px; overflow:hidden;">
            <div style="width:${item.val}%; height:100%; background:${item.color}; border-radius:4px; transition:width 0.6s;"></div>
          </div>
          <span style="width:36px; text-align:right; color:${item.color}; font-weight:bold;">${item.val}%</span>
        </div>`).join('')}
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; font-size:13px;">
        <div style="flex:1; min-width:140px; background:#dcfce7; color:#166534; padding:8px 12px; border-radius:6px;">
          <strong>✅ 今日最适合</strong><br>${sf.best.join(' · ')}
        </div>
        <div style="flex:1; min-width:140px; background:#fee2e2; color:#991b1b; padding:8px 12px; border-radius:6px;">
          <strong>⚠️ 今日少做</strong><br>${sf.worst.join(' · ')}
        </div>
      </div>
      ${aiContent && aiContent.study_strategy ? `<div style="margin-top:12px; padding:10px 14px; background:#eff6ff; border-radius:8px; color:#1e3a8a; font-size:13px; border-left:3px solid #3b82f6;">📌 <strong>今日策略</strong>: ${aiContent.study_strategy}</div>` : ''}
    </div>

    ${fortune.yijing ? (() => {
      const y = fortune.yijing;
      const typeColor = y.typeStats?.color || '#764ba2';
      // 六爻图（从上爻到初爻倒序展示，上卦在上）
      const linesHtml = [...y.lines].reverse().map(l => `
        <div style="display:flex; align-items:center; gap:8px; margin:4px 0;">
          <span style="font-size:11px; color:#999; width:28px; text-align:right;">${l.num}爻</span>
          <div style="flex:1; display:flex; align-items:center; gap:4px;">
            ${l.isYang
              ? `<div style="flex:1; height:5px; background:#1a1a1a; border-radius:2px;"></div>`
              : `<div style="flex:1; height:5px; background:#1a1a1a; border-radius:2px;"></div><div style="width:14px; flex-shrink:0;"></div><div style="flex:1; height:5px; background:#1a1a1a; border-radius:2px;"></div>`}
          </div>
          <span style="font-size:11px; min-width:56px; padding:1px 5px; background:${l.shenBg}; color:${l.shenColor}; border-radius:3px; text-align:center;">${l.shenEmoji}${l.liuShen}</span>
          <span style="font-size:11px; color:#888;">${l.type}</span>
        </div>`).join('');
      return `
    <div class="card" style="margin: 0 20px 20px 20px; background: linear-gradient(135deg,#fefce8,#fef9c3); border: 2px solid #fbbf24;">
      <h3 style="color:#92400e; border-bottom-color:#fcd34d;">☯ 周易六爻 · 今日卦象</h3>

      <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap; margin-bottom:14px;">
        <!-- 卦象主体 -->
        <div style="text-align:center; min-width:80px;">
          <div style="font-size:52px; line-height:1; color:#1a1a1a;">${y.char}</div>
          <div style="font-size:18px; font-weight:bold; color:#92400e; margin-top:4px;">第${y.kwNum}卦 · ${y.name}卦</div>
          <div style="font-size:12px; color:#b45309; margin-top:2px;">${y.upper.symbol}${y.upper.name}(上) / ${y.lower.symbol}${y.lower.name}(下)</div>
          <div style="display:inline-block; margin-top:6px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:bold; background:${typeColor}22; color:${typeColor}; border:1px solid ${typeColor}55;">${y.type}型</div>
          <div style="margin-top:8px; font-size:12px; color:#6b7280;">卦宫：${y.palaceName} · ${y.palaceElement}</div>
        </div>

        <!-- 六爻线 -->
        <div style="flex:1; min-width:200px;">
          <div style="font-size:11px; color:#b45309; margin-bottom:6px;">━ 六爻排列（上爻→初爻）</div>
          ${linesHtml}
        </div>
      </div>

      <!-- 卦辞建议 -->
      <div style="background:#fff; border-radius:8px; padding:10px 14px; border-left:4px solid #f59e0b; margin-bottom:10px;">
        <div style="font-size:13px; font-weight:bold; color:#92400e; margin-bottom:4px;">📜 象辞: ${y.judgment}</div>
        <div style="font-size:13px; color:#555; line-height:1.6;">💡 ${y.advice}</div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:12px; margin-bottom:10px;">
        <span style="padding:3px 8px; background:#e0f2fe; color:#0c4a6e; border-radius:4px;">🎯 用神: ${y.studyUseGod}</span>
        <span style="padding:3px 8px; background:#ede9fe; color:#5b21b6; border-radius:4px;">📚 ${y.useGodMeaning}</span>
        <span style="padding:3px 8px; background:#fef3c7; color:#92400e; border-radius:4px;">👤 世:${y.shiLine.label}爻 / 应:${y.yingLine.label}爻</span>
      </div>
      <p style="font-size:12px; color:#6b7280; margin:0 0 10px 0;">${y.useGodAdvice}</p>

      <!-- 青龙贵人爻提示 -->
      ${y.qingLongLine ? `
      <div style="background:#dcfce7; border-radius:6px; padding:8px 12px; font-size:13px; color:#166534; margin-bottom:10px;">
        🐉 <strong>第${y.qingLongLine.num}爻 青龙贵人</strong> — ${y.qingLongLine.shenStudy}
      </div>` : ''}

      ${y.usefulLine ? `
      <div style="background:#eff6ff; border-radius:6px; padding:8px 12px; font-size:13px; color:#1d4ed8; margin-bottom:10px;">
        🌟 <strong>关键主爻</strong>：${y.usefulLine.label}爻 · ${y.usefulLine.sixQin}${y.usefulLine.movingMark} · ${y.usefulLine.liuShen}
      </div>` : ''}

      ${y.movingLines.length ? `
      <div style="background:#fff7ed; border-radius:6px; padding:8px 12px; font-size:13px; color:#9a3412; margin-bottom:10px;">
        🔁 <strong>动爻</strong>：${y.movingLines.map(l => `${l.label}爻(${l.sixQin}/${l.liuShen})`).join('、')}<br>
        <strong>变卦</strong>：第${y.changed.kwNum}卦 ${y.changed.name}卦 ${y.changed.char} [${y.changed.type}型] — ${y.changed.advice}
      </div>` : ''}

      <!-- 纳音 / 二十八宿 / 彭祖 -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:12px;">
        ${fortune.naYin ? `<span style="padding:3px 8px; background:#e0e7ff; color:#3730a3; border-radius:4px;">🎵 纳音: ${fortune.naYin}</span>` : ''}
        ${fortune.xiu ? `<span style="padding:3px 8px; background:#f3e8ff; color:#6b21a8; border-radius:4px;">⭐ 值宿: ${fortune.xiu}宿</span>` : ''}
        ${fortune.pengZuGan ? `<span style="padding:3px 8px; background:#fef3c7; color:#92400e; border-radius:4px;">🚫 彭祖忌: ${fortune.pengZuGan}</span>` : ''}
      </div>
      ${fortune.xiuAdvice ? `<p style="font-size:12px; color:#6b7280; margin:8px 0 0 0;">🌙 ${fortune.xiu}宿提示: ${fortune.xiuAdvice}</p>` : ''}
    </div>`;
    })() : ''}

    <div class="grid" style="padding-top: 0;">
       <div class="card">
          <h3>📝 每日一题 [${dailyQuiz ? dailyQuiz.subject : '无'}]</h3>
          <p>${dailyQuiz ? dailyQuiz.question : '今日无题'}</p>
          <button class="show-answer-btn" onclick="toggleAnswer()">👀 查看答案</button>
          <div class="answer-box" id="answerBox">
             ${dailyQuiz ? dailyQuiz.answer : ''}
          </div>
       </div>

       <div class="card">
          <h3>🍵 养生小贴士</h3>
          <p>${healthTip}</p>
       </div>
    </div>

    <div class="card" style="margin: 0 20px 20px 20px;">
       <h3>🔤 每日核心词: ${dailyWord ? dailyWord.word : 'Loading...'}</h3>
       <p><strong>释义:</strong> ${dailyWord ? dailyWord.meaning : ''}</p>
       <p style="color: #666; font-style: italic;">"${dailyWord ? dailyWord.example : ''}"</p>
       ${aiContent && aiContent.word_mnemonic ? `<div style="margin-top:10px; padding:10px 14px; background:#fef9c3; border-radius:8px; color:#713f12; font-size:13px; border-left:3px solid #eab308;">🧠 <strong>记忆口诀</strong>: ${aiContent.word_mnemonic}</div>` : ''}
    </div>

    ${timetable ? `
    <div class="card" style="margin: 0 20px 20px 20px; background: linear-gradient(135deg,#f0f9ff,#e0f2fe); border: 2px solid #38bdf8;">
      <h3 style="color:#0c4a6e;">⏰ 今日时间表 <span style="font-size:13px; font-weight:normal; color:#0369a1;">(共约${timetable.reduce((s,t)=>s+parseFloat(t.duration),0)}h)</span></h3>
      <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
        ${timetable.map(t => `<div style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:#fff; border-radius:8px; border-left:3px solid #38bdf8;">
          <span style="font-weight:bold; color:#0369a1; white-space:nowrap;">${t.time}</span>
          <span style="flex:1;">${t.subject} <strong>${t.duration}</strong></span>
          <span style="color:#64748b; font-size:12px;">${t.tip}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="footer">
      Generated by 考研小助手 | ${new Date().toLocaleString()}
    </div>
  </div>

  <script>
    // 任务数据
    const tasks = [
      { id: 'math', label: '数学: ${task ? task.math.replace(/'/g, "\\'") : ""}' },
      { id: '408', label: '408: ${task ? task['408'].replace(/'/g, "\\'") : ""}' },
      { id: 'english', label: '英语: ${task ? task.english.replace(/'/g, "\\'") : ""}' },
      { id: 'politics', label: '政治: ${task ? (task.politics || "").replace(/'/g, "\\'") : ""}' }
    ];

    const taskListEl = document.getElementById('taskList');
    
    function localDate() {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    // 初始化任务列表
    function renderTasks() {
      const today = localDate();
      const savedStatus = JSON.parse(localStorage.getItem('task_status_' + today) || '{}');
      
      taskListEl.innerHTML = '';
      tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = 'task-item ' + (savedStatus[t.id] ? 'completed' : '');
        li.onclick = (e) => toggleTask(t.id, li);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!savedStatus[t.id];
        checkbox.onclick = (e) => e.stopPropagation();
        checkbox.onchange = () => toggleTask(t.id, li);
        
        const span = document.createElement('span');
        span.textContent = t.label;
        
        li.appendChild(checkbox);
        li.appendChild(span);
        taskListEl.appendChild(li);
      });
    }

    function toggleTask(id, li) {
      const today = localDate();
      const savedStatus = JSON.parse(localStorage.getItem('task_status_' + today) || '{}');
      
      savedStatus[id] = !savedStatus[id];
      localStorage.setItem('task_status_' + today, JSON.stringify(savedStatus));
      
      renderTasks();
    }
    
    function toggleAnswer() {
       const box = document.getElementById('answerBox');
       if (box.style.display === 'block') {
          box.style.display = 'none';
       } else {
          box.style.display = 'block';
       }
    }

    renderTasks();
  </script>
</body>
</html>
  `;
  
  return html;
}
