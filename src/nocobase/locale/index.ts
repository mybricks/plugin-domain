import zhCN from "./zhCN";

/**
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * t("Roles");
 *
 * 匹配t函数的第一个字符参数
 */
const tTemplateRegExp = /t\("([^"]+)"/;

const getLocaleText = (text: string) => {
  // {{t("Roles")}} - {{t('Roles')}}
  const result = text.match(tTemplateRegExp)?.[1];

  if (result) {
    if (!zhCN[result]) {
      console.warn(`[nocobase - getLocaleText] ${result}`);
    }
    // 匹配成功
    return zhCN[result];
  }

  return text;
};

export { getLocaleText };
