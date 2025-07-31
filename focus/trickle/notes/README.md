# 番茄计时器 - 白噪音番茄钟

一个结合了番茄工作法和白噪音的番茄计时器应用。

## 功能特性

- **番茄钟计时器**: 可自定义工作时间、短休息和长休息时长
- **真实环境音效**: 包括雨声、海浪、风声、鸟鸣等9种高质量环境音
- **YouTube 背景音乐**: 支持插入 YouTube 链接播放背景音乐或白噪音
- **Bilibili 背景音乐**: 支持插入 Bilibili 链接播放背景音乐
- **小窗模式**: YouTube和Bilibili播放器支持小窗化，可作为背景音使用
- **本地音频支持**: 支持本地MP3文件，提供更高质量的环境音效
- **音效组合**: 支持同时播放多种音效，创造个性化的专注环境
- **美观界面**: 采用毛玻璃效果和自然背景，提供舒适的视觉体验
- **背景轮换**: 每30秒自动切换不同的自然风景背景
- **音量控制**: 可调节环境音效和背景音乐的音量大小
- **计时提醒**: 计时结束时播放提示音

## 技术架构

- **前端框架**: React 18
- **样式系统**: TailwindCSS
- **图标库**: Lucide Icons
- **音频处理**: Web Audio API

## 文件结构

```
├── index.html              # 主页面
├── app.js                  # 应用主组件
├── components/
│   ├── Timer.js            # 计时器组件
│   ├── SoundGrid.js        # 音效网格组件
│   ├── Settings.js         # 设置面板组件
│   ├── YouTubePlayer.js    # YouTube 播放器组件
│   └── BilibiliPlayer.js   # Bilibili 播放器组件
├── utils/
│   └── audioManager.js     # 音频管理工具
├── assets/
│   └── audio/              # 本地音频文件目录
│       └── download-guide.md # 音频下载指南
└── trickle/
    ├── assets/
    │   ├── mountain-landscape.json
    │   ├── forest-landscape.json
    │   ├── lake-landscape.json
    │   └── valley-landscape.json
    ├── notes/
    │   └── README.md
    └── rules/
        └── rule_for_readme_maintenance.md
```

## 使用方法

1. 点击"开始"按钮启动计时器
2. 选择喜欢的环境音效（可多选）
3. 通过"设置"调整工作时间和音量
4. 可选择"YouTube"或"Bilibili"功能播放背景音乐
5. 专注工作直到计时结束

## 设计理念

采用现代简约的设计风格，通过毛玻璃效果和自然背景营造宁静舒适的工作氛围，帮助用户更好地集中注意力。