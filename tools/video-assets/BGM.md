# 视频背景音乐说明

周刊视频需要**真实器乐/配乐 MP3**，不再使用程序合成的「环境噪声」作为默认 BGM。

## 当前默认 BGM

项目已配置 **`custom-bgm.mp3`**（来源：酷狗《天上人间》/ 大唐豪侠原声，月之门音乐文化）。

以后每期 `/generate-video` 会自动使用，无需重复设置。

若酷狗里更新了文件，可重新执行：

```bash
bash tools/video-assets/set-bgm.sh "/Users/mengxp/Music/酷狗音乐/kgmusic/月之门音乐文化 - 天上人间_MQ.mp3"
```

## 推荐：使用你自己的音乐文件

### 《大唐豪侠》等游戏配乐

游戏 OST 通常**有版权**，请仅在你拥有合法使用权时使用（如个人已购买、获授权等）。  
仓库**不会**内置或自动下载任何游戏原声。

若你本地已有 MP3（从正版渠道导出、或自行购买），执行：

```bash
bash tools/video-assets/set-bgm.sh /你的路径/大唐豪侠-主界面.mp3
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant
```

也可直接复制为 `tools/video-assets/custom-bgm.mp3`。

### 生成时指定路径（不覆盖 custom-bgm）

```bash
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant --bgm ~/Music/my-bgm.mp3
```

## 免版权替代（武侠/中国风）

若暂时没有目标曲目，可到 [Pixabay 音乐](https://pixabay.com/music/search/chinese%20epic/) 搜索 **chinese epic / guzheng**，手动下载 MP3 后：

| 风格参考 | 搜索关键词 |
|---------|-----------|
| 史诗武侠 | `China Chinese Epic Music` |
| 古筝叙事 | `guzheng cinematic` |
| 春节史诗 | `Lunar New Year Chinese Epic` |

下载后同样用 `set-bgm.sh` 导入。

## 混音说明

- BGM 会**循环**铺满整段视频
- 旁白时段 BGM 自动**压低**（侧链压缩），避免盖过人声
- 可用 `custom-bgm.mp3` 长期固定一首品牌 BGM
