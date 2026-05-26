# 周刊视频音频素材

| 文件 | 说明 |
|------|------|
| **`custom-bgm.mp3`** | **推荐**：真实配乐（古筝/史诗/游戏 OST 等你合法持有的 MP3） |
| `default-bgm.mp3` | 仅 `--synth-bgm` 时使用的程序合成备用，**不是音乐** |
| `set-bgm.sh` | 导入并归一化你的 MP3 |
| `BGM.md` | 大唐豪侠风格、Pixabay 免版权替代、版权说明 |

## 快速设置（例如《大唐豪侠》BGM）

```bash
bash tools/video-assets/set-bgm.sh ~/Downloads/你的配乐.mp3
node .cursor/skills/wisdom-weekly/scripts/generate-video.js week-01-naval-ravikant
```

详见 [BGM.md](./BGM.md)。
