const fs = require('fs');
let code = fs.readFileSync('d:/旅游/考研小助手/src/plan22_v3.js', 'utf8');

function expandArray(name, additions) {
  const regex = new RegExp(`const ${name} = \\[\\[\\\\s\\\\S\\]*?\\];`);
  // wait, regex is hard, let's just find the start and end indices
  const start = code.indexOf(`const ${name} = [`);
  if (start === -1) return code;
  const end = code.indexOf('];', start);
  
  let content = code.substring(start + `const ${name} = [`.length, end).trim();
  if (content.endsWith(',')) {
    content = content.slice(0, -1);
  }
  
  const addedLines = additions.map(a => `  '${a}'`).join(',\n');
  const newContent = `const ${name} = [\n  ${content},\n${addedLines}\n];`;
  
  return code.substring(0, start) + newContent + code.substring(end + 2);
}

const math2Add = [];
for (let i = 0; i < 25; i++) {
  if (i < 3) math2Add.push(`基础回炉 第${i+1}天：高数上册（极限与连续）880基础题错题二刷，重点看计算失误`);
  else if (i < 6) math2Add.push(`基础回炉 第${i+1}天：高数上册（一元微分学）880基础题错题二刷，复习构造辅助函数`);
  else if (i < 9) math2Add.push(`基础回炉 第${i+1}天：高数上册（一元积分学）不定积分/定积分应用错题回顾`);
  else if (i < 12) math2Add.push(`基础回炉 第${i+1}天：高数下册（多元微积分与微分方程）偏导与极值专题重算`);
  else if (i < 15) math2Add.push(`基础回炉 第${i+1}天：线代前半本（行列式、矩阵、方程组）秩与解结构错题扫尾`);
  else if (i < 18) math2Add.push(`基础回炉 第${i+1}天：线代后半本（特征值、二次型）正定与合同变换错题二刷`);
  else if (i < 24) math2Add.push(`基础回炉 第${i+1}天：阶段小测与错题本整理：半套卷限时训练与全科弱点排查`);
  else math2Add.push('基础大收官：明天进入强化期！今晚只做口算和公式默写，保持手感');
}

const eng2Add = [];
for (let i = 0; i < 35; i++) {
  if (i < 4) eng2Add.push(`墨墨英二词汇 60词 + 201${i}年真题阅读4篇重新通读，重点扫除所有残存生词`);
  else if (i === 4) eng2Add.push('墨墨英二词汇 60词 + 柴荣方法论总复习（主旨/态度/细节/推断）框架默写');
  else if (i === 5) eng2Add.push('墨墨英二词汇 60词 + 唐静翻译基础导学，了解英二翻译评分标准');
  else if (i < 10) eng2Add.push(`墨墨英二词汇 60词 + 201${i-6}年英二翻译真题 逐句精翻对照`);
  else if (i === 10) eng2Add.push('墨墨英二词汇 60词 + 王江涛小作文导学，了解书信/通知基本格式');
  else if (i < 15) eng2Add.push(`墨墨英二词汇 60词 + 201${i-11}年小作文真题 格式与开头结尾句摘抄`);
  else if (i === 15) eng2Add.push('墨墨英二词汇 60词 + 易熙人完型导学，了解完型逻辑套路');
  else if (i < 20) eng2Add.push(`墨墨英二词汇 60词 + 201${i-16}年完型真题 感受逻辑连接词与介词搭配`);
  else if (i === 20) eng2Add.push('墨墨英二词汇 60词 + 王江涛大作文导学，图表描述句型储备');
  else if (i < 25) eng2Add.push(`墨墨英二词汇 60词 + 201${i-21}年大作文真题 图表描述段试写`);
  else if (i < 27) eng2Add.push(`墨墨英二词汇 60词 + 基础阶段词汇大回炉：复现这一个月的生词本（第${i-24}半本）`);
  else if (i < 30) eng2Add.push(`墨墨英二词汇 60词 + 2010-2013阅读 错题集中再刷（第${i-26}轮）`);
  else if (i < 32) eng2Add.push(`墨墨英二词汇 60词 + 长难句10个最难句子手写拆分再战（第${i-29}部分）`);
  else if (i === 32) eng2Add.push('墨墨英二词汇 60词 + 小作文3大类通用框架句默写');
  else if (i === 33) eng2Add.push('墨墨英二词汇 60词 + 大作文动态图/静态图描述万能句默写');
  else eng2Add.push('墨墨英二词汇 60词 + 基础大收官：明天进入强化期！整理所有方法论卡片准备迎战2014年真题');
}

const cs408Add = [];
for (let i = 0; i < 15; i++) {
  if (i === 0) cs408Add.push('【408】计网第6章 第2天：应用层常见协议端口、过程复习 + 第6章错题收尾');
  else if (i === 1) cs408Add.push('【408】数据结构大复盘：线性表、树、图核心代码手写各1题');
  else if (i === 2) cs408Add.push('【408】数据结构大复盘：查找与排序复杂度表闭卷默写 + 综合选择 15 题');
  else if (i === 3) cs408Add.push('【408】计组大复盘：浮点数 IEEE754 与原补移码转换限时计算 5 题');
  else if (i === 4) cs408Add.push('【408】计组大复盘：Cache 映射机制与缺失率大题手写 2 题');
  else if (i === 5) cs408Add.push('【408】计组大复盘：微指令格式与数据通路综合题突破');
  else if (i === 6) cs408Add.push('【408】操作系统大复盘：进程同步（PV操作）经典问题手写 2 题');
  else if (i === 7) cs408Add.push('【408】操作系统大复盘：虚拟内存与页面置换算法限时计算');
  else if (i === 8) cs408Add.push('【408】操作系统大复盘：文件系统与磁盘调度综合选择题 15 题');
  else if (i === 9) cs408Add.push('【408】计网大复盘：IP 地址与子网划分（VLSM）限时计算大题 2 题');
  else if (i === 10) cs408Add.push('【408】计网大复盘：TCP 三次握手/四次挥手/拥塞控制状态图闭卷绘制');
  else if (i === 11) cs408Add.push('【408】408全科融合测试：跨学科概念辨析（如IO中断在OS和计组中的对比）');
  else if (i === 12) cs408Add.push('【408】错题本清零（上）：把这一个月积累的必忘概念录入闪存卡或速记本');
  else if (i === 13) cs408Add.push('【408】错题本清零（下）：把最差的3个大题重新手写一遍');
  else cs408Add.push('【408】基础大收官：明天进入强化期！今天只回顾核心导图，准备迎接真题化综合');
}

code = expandArray('MATH2_DAILY_ANCHORED', math2Add);
code = expandArray('ENG2_DAILY_ANCHORED', eng2Add);
code = expandArray('CS408_DAILY_ANCHORED', cs408Add);

fs.writeFileSync('d:/旅游/考研小助手/src/plan22_v3.js', code);
console.log('Update successful');
