// 提取天气字符串中的温度 (如 "Partly cloudy +10°C")
function parseTemperature(weatherStr) {
  // 匹配 +10°C, -5°C, 25°C 等格式
  const match = weatherStr.match(/([+-]?\d+)°C/);
  if (match) {
    return parseInt(match[1], 10);
  }
  // 如果没找到，默认返回一个舒适温度
  return 20;
}

export function getClothingAdvice(weatherStr) {
  const temp = parseTemperature(weatherStr);
  const isRainy = weatherStr.includes('Rain') || weatherStr.includes('rain') || weatherStr.includes('雨');
  const isSnowy = weatherStr.includes('Snow') || weatherStr.includes('snow') || weatherStr.includes('雪');
  const isWindy = weatherStr.includes('Wind') || weatherStr.includes('wind') || weatherStr.includes('风');

  let advice = '';
  let icon = '👕';

  if (temp < 0) {
    advice = '🥶 严寒警告！请穿加厚羽绒服、保暖内衣，戴围巾手套。';
    icon = '🧥';
  } else if (temp < 10) {
    advice = '❄️ 天气寒冷，建议穿棉袄或厚大衣，里面穿毛衣。';
    icon = '🧥';
  } else if (temp < 18) {
    advice = '🍂 凉意袭人，建议穿卫衣、风衣或夹克，加一件薄外套。';
    icon = '🧥';
  } else if (temp < 25) {
    advice = '🌤 舒适宜人，建议穿长袖衬衫、薄卫衣或T恤加薄外套。';
    icon = '👕';
  } else {
    advice = '☀️ 炎热似火，建议穿短袖、短裤，注意防晒。';
    icon = '🎽';
  }

  if (isRainy) advice += ' ☔ 记得带伞！';
  if (isSnowy) advice += ' ☃️ 注意防滑！';
  if (isWindy) advice += ' 🌬 风大，注意发型！';

  return {
    temp,
    advice,
    icon
  };
}
