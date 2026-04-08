// 本地每日一句（不依赖外部API，日期哈希保证同一天永远同一条）

const QUOTE_POOL = [
  { content: "The secret of getting ahead is getting started.", note: "领先的秘诀就是开始行动。— 马克·吐温" },
  { content: "An investment in knowledge pays the best interest.", note: "知识的投资回报率最高。— 富兰克林" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", note: "成功不是终点，失败不是终结，重要的是继续前进的勇气。— 丘吉尔" },
  { content: "It always seems impossible until it's done.", note: "在完成之前，一切总是看起来不可能。— 曼德拉" },
  { content: "The beautiful thing about learning is that nobody can take it away from you.", note: "学习最美好的一点，是没有人能把它从你身上夺走。— B.B. King" },
  { content: "Motivation is what gets you started. Habit is what keeps you going.", note: "动力让你出发，习惯让你坚持。— 吉姆·莱恩" },
  { content: "There are no shortcuts to any place worth going.", note: "通往任何值得去的地方，都没有捷径。— 贝弗利·西尔斯" },
  { content: "Fall seven times, stand up eight.", note: "跌倒七次，第八次站起来。— 日本谚语" },
  { content: "Hard work beats talent when talent doesn't work hard.", note: "当天赋不努力，勤奋就会超越天赋。" },
  { content: "Every accomplishment starts with the decision to try.", note: "每一个成就都始于决定去尝试。— 肯尼迪" },
  { content: "The harder the battle, the sweeter the victory.", note: "战斗越艰难，胜利越甜蜜。— 莱斯·布朗" },
  { content: "Don't stop when you're tired. Stop when you're done.", note: "累了不要停，完成了再停。" },
  { content: "Do something today that your future self will thank you for.", note: "今天做一件让未来的自己感谢你的事。" },
  { content: "Little by little, one travels far.", note: "一步一步，走得更远。— 托尔金" },
  { content: "Work hard in silence, let success make the noise.", note: "默默努力，让成功替你发声。" },
  { content: "Strive for progress, not perfection.", note: "追求进步，而不是完美。" },
  { content: "Knowledge is power.", note: "知识就是力量。— 培根" },
  { content: "I find that the harder I work, the more luck I seem to have.", note: "我发现我越努力，似乎越幸运。— 托马斯·杰斐逊" },
  { content: "Genius is one percent inspiration and ninety-nine percent perspiration.", note: "天才是百分之一的灵感加上百分之九十九的汗水。— 爱迪生" },
  { content: "Nothing in this world can take the place of persistence.", note: "世界上没有什么能取代坚持。— 卡尔文·柯立芝" },
  { content: "The difference between ordinary and extraordinary is that little extra.", note: "普通与非凡的区别，就在于那一点点额外的付出。" },
  { content: "It does not matter how slowly you go as long as you do not stop.", note: "只要不停下，走多慢都没关系。— 孔子" },
  { content: "You don't have to be great to start, but you have to start to be great.", note: "你不必很厉害才能开始，但你必须开始才能变得厉害。" },
  { content: "The expert in anything was once a beginner.", note: "任何领域的专家，都曾经是初学者。" },
  { content: "Education is not the filling of a pail, but the lighting of a fire.", note: "教育不是灌满一桶水，而是点燃一把火。— 叶芝" },
  { content: "Push yourself, because no one else is going to do it for you.", note: "逼自己一把，因为没有人会替你做这件事。" },
  { content: "Great things never came from comfort zones.", note: "伟大的事情，从来不在舒适区里发生。" },
  { content: "The pain you feel today will be the strength you feel tomorrow.", note: "今天感受到的痛苦，将成为明天拥有的力量。" },
  { content: "Excellence is not a destination; it is a continuous journey.", note: "卓越不是终点，而是一段持续的旅程。— 布莱恩·特雷西" },
  { content: "Success doesn't just find you. You have to go out and get it.", note: "成功不会自己找来，你必须主动出击。" },
  { content: "Wake up with determination. Go to bed with satisfaction.", note: "带着决心醒来，带着满足入睡。" },
  { content: "The more that you read, the more things you will know.", note: "你读得越多，你知道的就越多。— 苏斯博士" },
  { content: "Dream it. Wish it. Do it.", note: "梦想它，期望它，然后去做它。" },
  { content: "You are braver than you believe, stronger than you seem, smarter than you think.", note: "你比你想象的更勇敢，比你看起来更坚强，比你以为的更聪明。" },
  { content: "You miss 100% of the shots you don't take.", note: "你不出手，就有100%的概率错过。— 韦恩·格雷茨基" },
  { content: "A goal without a plan is just a wish.", note: "没有计划的目标不过是一个愿望。" },
  { content: "The only way to do great work is to love what you do.", note: "做出伟大工作的唯一方式，是热爱你所做的事。— 乔布斯" },
  { content: "Don't watch the clock; do what it does. Keep going.", note: "别盯着时钟；学时钟的样子，一直走。— 山姆·利文森" },
  { content: "Study hard, for the well is deep and our brains are shallow.", note: "努力学习，因为知识的井很深，我们的头脑很浅。— 理查德·巴克斯特" },
  { content: "Believe you can and you're halfway there.", note: "相信你能做到，你就已经成功了一半。— 西奥多·罗斯福" }
];

// 日期哈希：同一天永远返回同一条（与 vocabulary.js 算法一致）
function dateHashIndex(dateStr, len) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % len;
}

export async function getDailyQuote() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  return QUOTE_POOL[dateHashIndex(dateStr, QUOTE_POOL.length)];
}
