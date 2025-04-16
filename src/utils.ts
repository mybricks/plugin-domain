// 字符串集合包含了大小写字母和数字
const UUID_CHARTS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const UUID_CHARTS_LENGTH = UUID_CHARTS.length;
const uuid = (length: number = 8) => {
  let id = "";
  // 随机选取两个字符
  for (let i = 0; i < length; i++) {
    id += UUID_CHARTS.charAt(Math.floor(Math.random() * UUID_CHARTS_LENGTH));
  }
  return id;
};

export { uuid };
