/**
 * 微信公众号 API（草稿箱）
 */
const fs = require("fs");
const path = require("path");
const { File } = require("node:buffer");

const API = "https://api.weixin.qq.com";

async function parseJson(res) {
  const data = await res.json();
  if (data.errcode && data.errcode !== 0) {
    const err = new Error(data.errmsg || `微信 API 错误 ${data.errcode}`);
    err.errcode = data.errcode;
    throw err;
  }
  return data;
}

async function getAccessToken(appId, appSecret) {
  const url = `${API}/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(appSecret)}`;
  const res = await fetch(url);
  const data = await parseJson(res);
  return data.access_token;
}

async function uploadPermanentImage(accessToken, imagePath) {
  const url = `${API}/cgi-bin/material/add_material?access_token=${accessToken}&type=image`;
  const buf = fs.readFileSync(imagePath);
  const name = path.basename(imagePath);
  const ext = path.extname(name).toLowerCase();
  const mime =
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : "image/jpeg";
  const form = new FormData();
  form.append("media", new File([buf], name, { type: mime }));

  const res = await fetch(url, { method: "POST", body: form });
  const data = await parseJson(res);
  return data.media_id;
}

async function addDraft(accessToken, article) {
  const url = `${API}/cgi-bin/draft/add?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ articles: [article] }),
  });
  return parseJson(res);
}

async function submitPublish(accessToken, mediaId) {
  const url = `${API}/cgi-bin/freepublish/submit?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ media_id: mediaId }),
  });
  return parseJson(res);
}

module.exports = {
  getAccessToken,
  uploadPermanentImage,
  addDraft,
  submitPublish,
};
