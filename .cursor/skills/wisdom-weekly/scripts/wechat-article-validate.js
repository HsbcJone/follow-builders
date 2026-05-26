/**
 * 推送前校验 wechat-article.md 格式（每期默认规则）
 */
function validateWechatArticle(markdown) {
  const errors = [];
  const warnings = [];

  if (/在此添加|个人感悟——/.test(markdown)) {
    errors.push("「我的思考」仍为占位符，须写成完整第一人称短文");
  }

  if (!/>\s*\*\*我的思考\*\*/.test(markdown) && !/>\s*我的思考/.test(markdown)) {
    warnings.push("建议保留「我的思考」引用块格式");
  }

  const actionSection = markdown.split(/##\s*今天就可以开始做的\s*3\s*件事/i)[1];
  if (actionSection) {
    const body = actionSection.split(/^---/m)[0] || actionSection.slice(0, 800);
    if (/^\d+\.\s+\*\*/m.test(body) || /^\d+\.\s+[^*]/m.test(body)) {
      errors.push(
        "「3 件事」勿用 Markdown 有序列表(1.)，请改为 **1.** **2.** **3.**（公众号会显示 1–6 空号）"
      );
    }
    const nBold = (body.match(/^\*\*([123])\.\*\*/gm) || []).length;
    if (nBold < 3) {
      errors.push("「3 件事」须包含 **1.** **2.** **3.** 三条");
    }
  } else {
    warnings.push("未找到「今天就可以开始做的 3 件事」章节");
  }

  return { ok: errors.length === 0, errors, warnings };
}

module.exports = { validateWechatArticle };
