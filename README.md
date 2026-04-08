# 📚 考研小助手 - 2027 考研倒计时助手

一个基于 Node.js 的智能考研助手，每天自动推送学习任务、天气提醒、运势解读和每日一题，帮助你科学备考，稳步前进！

## ✨ 核心功能

- 📅 **考研倒计时** - 实时显示距离考试的天数和复习进度
- 🌤️ **天气 + 穿搭** - 自动获取当地天气并给出穿衣建议
- 🔮 **每日运势** - 基于黄历五行的玄学运势分析
- 🃏 **月度塔罗** - 每月塔罗牌提醒，帮你规避潜在风险（3-12月）
- 📝 **任务推送** - 每日推送数学、408、英语、政治的学习任务
- 🤖 **AI 助手** - DeepSeek AI 生成个性化鼓励语、运势解读和题目解析
- 📖 **每日一题** - 随机抽取考研真题并提供 AI 解析
- 🔤 **每日单词** - 核心考研词汇学习
- 📊 **本地看板** - 生成可视化打卡页面（dashboard.html）
- ⚠️ **危机感提醒** - 年度和周进度提醒，保持紧迫感

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并填写你的配置：

```env
# 基础配置
CITY_NAME=洛阳
TARGET_DATE=2026-12-20

# 推送方式（二选一或都开启）
ENABLE_EMAIL=false
ENABLE_WXPUSHER=true
WXPUSHER_APP_TOKEN=你的Token
WXPUSHER_UID=你的UID

# AI 配置（强烈推荐开启）
ENABLE_AI=true
AI_BASE_URL=https://api.deepseek.com
AI_API_KEY=你的API密钥
AI_MODEL=deepseek-chat
```

### 3. 生成学习计划

```bash
node generate_schedule.js
```

这会生成 `schedule.json` 文件，包含每日的学习任务安排。

### 4. 运行程序

```bash
npm start
```

或者手动运行：

```bash
node index.js
```

## 📦 项目结构

```
考研小助手/
├── index.js              # 主程序入口
├── generate_schedule.js  # 学习计划生成器
├── schedule.json         # 每日任务配置
├── dashboard.html        # 本地打卡看板
├── .env                  # 环境变量配置
├── src/
│   ├── config.js         # 配置加载
│   ├── ai.js             # AI 内容生成
│   ├── weather.js        # 天气查询
│   ├── fortune.js        # 黄历运势
│   ├── tarot.js          # 塔罗牌月度提醒
│   ├── clothing.js       # 穿搭建议
│   ├── quote.js          # 每日金句
│   ├── quiz.js           # 每日一题
│   ├── vocabulary.js     # 每日单词
│   ├── pusher.js         # 消息推送（邮件/微信）
│   ├── dashboard_gen.js  # 看板生成
│   └── user.js           # 用户信息（八字等）
└── package.json
```

## 🔧 配置说明

### 推送方式

支持两种推送方式：

1. **邮件推送** - 使用 QQ 邮箱或其他 SMTP 服务
2. **WxPusher** - 微信推送（推荐，更方便）

### AI 功能

开启 AI 后，会自动生成：
- 结合天气的个性化鼓励语
- 基于八字的运势解读
- 每日一题的解析和记忆口诀
- 计算机考研行业动态

支持的 AI 平台：
- DeepSeek（推荐，性价比高）
- OpenAI ChatGPT
- Moonshot Kimi

## 📅 定时任务

### Windows 系统

使用任务计划程序：

1. 运行 `setup_task.bat`（需要管理员权限）
2. 或手动创建任务：
   - 打开"任务计划程序"
   - 创建基本任务
   - 触发器：每天早上 7:00
   - 操作：启动程序 `node.exe`
   - 参数：`index.js`
   - 起始于：项目目录

### Linux/Mac 系统

使用 crontab：

```bash
crontab -e
```

添加：

```
0 7 * * * cd /path/to/project && node index.js
```

## 🎯 使用建议

1. 每天早上查看推送消息，了解当日任务
2. 打开 `dashboard.html` 进行任务打卡
3. 完成每日一题和单词学习
4. 根据天气和运势调整学习状态
5. 关注危机感提醒，保持学习节奏
6. 留意月度塔罗提醒，规避潜在风险

## 🃏 塔罗牌月度提醒说明

每个月都有对应的塔罗牌提醒，帮助你提前规避可能的风险：

- **3月 - 圣杯骑士**: 注意情绪管理，保持稳定节奏
- **4月 - 星币六**: 注意财务管理，避免冲动消费
- **5月 - 星币骑士**: 学会拒绝，避免被过度剥削
- **6月 - 宝剑八**: 避免过度思虑，有问题及时沟通
- **7月 - 圣杯六**: 不要沉溺过去，尝试新方法
- **8月 - 圣杯八**: 小问题及时处理，注意健康防护
- **9月 - 愚人**: 对新机会保持警惕，不要冲动
- **10月 - 恶魔**: 避免深度绑定，保持选择自由
- **11月 - 审判**: 保持低调，不要过早宣告
- **12月 - 倒吊人**: 提前完成任务，避免最后赶工

这些提醒会自动显示在每日推送和本地看板中。

## 🛠️ 技术栈

- Node.js + ES Modules
- axios - HTTP 请求
- nodemailer - 邮件发送
- node-schedule - 定时任务
- lunar-javascript - 农历黄历
- DeepSeek AI - 智能内容生成

## 📝 许可证

MIT License

## 💡 贡献

欢迎提交 Issue 和 Pull Request！

---

> 💪 心态稳住，按部就班，科软在等你！
