import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';

// 邮件发送
export async function sendEmail(config, title, content) {
  if (!config.user || !config.pass) {
    console.error('请先配置邮箱！');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  // 转换 Markdown 为简单的 HTML
  const htmlContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/### (.*?)/g, '<h3>$1</h3>')
    .replace(/- (.*?)/g, '<li>$1</li>');

  const mailOptions = {
    from: `"考研小助手" <${config.user}>`,
    to: config.to,
    subject: title,
    html: `<div style="font-family: sans-serif; padding: 20px;">${htmlContent}</div>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('邮件发送成功！');
  } catch (error) {
    console.error('邮件发送失败:', error);
  }
}

// WxPusher 推送
export async function sendWXPusher(config, title, content) {
  if (!config.appToken || config.appToken.length < 5) {
    console.error('请先配置 WXPusher Token！');
    return;
  }

  try {
    const url = 'https://wxpusher.zjiecode.com/api/send/message';
    const response = await axios.post(url, {
      appToken: config.appToken,
      content: content,
      summary: title,
      contentType: 3, // Markdown
      uids: [config.uid]
    });
    console.log('WXPusher 推送结果:', response.data);
    fs.appendFileSync('debug.log', `WXPusher结果: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    console.error('WXPusher 推送失败:', error);
    fs.appendFileSync('debug.log', `WXPusher失败: ${error.message}\n`);
  }
}
