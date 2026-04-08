import axios from 'axios';

// 天气状态映射 (Fallback)
const WEATHER_MAP = {
  'Sunny': '晴',
  'Clear': '晴',
  'Partly cloudy': '多云',
  'Cloudy': '阴',
  'Overcast': '阴',
  'Mist': '雾',
  'Fog': '雾',
  'Light rain': '小雨',
  'Moderate rain': '中雨',
  'Heavy rain': '大雨',
  'Light snow': '小雪',
  'Moderate snow': '中雪',
  'Heavy snow': '大雪',
  'Thundery outbreaks possible': '雷阵雨',
  'Patchy rain possible': '阵雨'
};

function translateWeather(desc) {
  // 简单的模糊匹配
  for (const [en, zh] of Object.entries(WEATHER_MAP)) {
    if (desc.toLowerCase().includes(en.toLowerCase())) return zh;
  }
  return desc; // 找不到对应中文就返回原文
}

async function getWeather(city, retries = 3) {
  try {
    // format=j1 返回 JSON，lang=zh 尝试获取中文
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`, {
      timeout: 8000, // 稍微延长时间
      headers: { 'User-Agent': 'curl/7.64.1' } // 伪装成 curl
    });
    
    const data = response.data;
    
    // 1. 获取当前天气
    if (!data.current_condition || data.current_condition.length === 0) {
        throw new Error('Invalid weather data');
    }
    
    const current = data.current_condition[0];
    
    // 优先使用 API 返回的中文描述
    let condition = '';
    if (current.lang_zh && current.lang_zh.length > 0) {
        condition = current.lang_zh[0].value;
    } else {
        condition = translateWeather(current.weatherDesc[0].value);
    }
    
    const temp = current.temp_C;
    
    // 2. 获取今日最高/最低温
    let tempRange = '';
    if (data.weather && data.weather.length > 0) {
        const today = data.weather[0];
        const maxTemp = today.maxtempC;
        const minTemp = today.mintempC;
        tempRange = ` (${minTemp}°C~${maxTemp}°C)`;
    }
    
    // 3. 组合字符串
    // 格式: 多云 25°C (18°C~30°C)
    return `${condition} ${temp}°C${tempRange}`;
    
  } catch (error) {
    if (retries > 0) {
      console.log(`天气获取失败 (${error.message})，剩余重试次数: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getWeather(city, retries - 1);
    }
    console.error('天气获取失败，使用默认值');
    return '天气服务暂不可用';
  }
}

export default getWeather;
