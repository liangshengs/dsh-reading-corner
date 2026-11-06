# 读书角 Reading Corner

在聊天旁边读书：内置一本技术小书，也可以导入自己的 PDF；看不懂的地方用鼠标划选或框选，带上原文/截图直接问智能体，并把回答收进按书分的 Markdown 笔记。

## 安装

从 GitHub 安装（现在可用）：

```powershell
dsh plugin --profile <profile> add https://github.com/liangshengs/dsh-reading-corner
```

npm 包发布后，也可以直接用包名 `dsh-reading-corner`；或者在 **Plugins → Add** 里填上面任一地址。包自带构建好的 `client.js`，安装时不需要批准依赖构建脚本。

## 用法

- 侧边栏底部、设置按钮旁边有一个书本图标，点一下打开读书抽屉；`Esc` 关闭。
- 顶部两个标签：**小书**（内置的《智能体是怎么写代码的》）和 **PDF**。
- 左边目录栏，右边阅读区；目录可以收起（右上角「‹」，收起后点窄边里的「›」展开）。
- 抽屉左边缘可以**拖动改宽度**，双击恢复默认；小书和 PDF 的宽度分别记住。
- **PDF**：导入后可翻页、缩放；目录优先显示 PDF 书签，没有书签时显示页码网格。
- **翻页**：滚轮滚到页底继续往下会翻下一页（页首往上回上一页）；底部按钮；键盘左右方向键。
- 重新打开会回到上次的页码、页内滚动位置和缩放。
- **划词提问**：选中一段话 → 「提问」→ 写问题（留空默认问“这段话是什么意思？”）→ 「放到输入框」或「发送到对话」。
- **图片型 PDF**：用底部「框选」按钮拖一个矩形，截图会连同问题一起发送。
- 提问会自动带上《书名》第 X / Y 页、当前章节（有书签时）和“老师讲给学生”的说明。
- **加入笔记**：每条回答下方的操作行有「加入笔记」，点一下把该问答追加到当前工作区的 `读书笔记/<书名>.md`，截图存到 `读书笔记/assets/<书名>/`；重复点击不会重复追加。

## 开发

```powershell
# 只有升级 pdf.js 时才需要
node tools/pdf-build/build-engine.mjs
node tools/pdf-build/build-reading-corner.mjs
```

`client.js` 是构建产物；界面源码在 `src/`，Host 半边在 `index.js`。

发布、npm 与社区目录投稿见 [PUBLISHING.md](PUBLISHING.md)。

## 文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | 包清单、`dsh.bundle` / `dsh.client` |
| `cordis.patch.yml` | 往 profile 插入一行插件 |
| `index.js` | Host 半边：同源笔记路由，读会话日志并写 `读书笔记/` |
| `src/` | 界面源码（书稿、PDF 阅读器、提问面板、笔记动作） |
| `client.js` | 构建产物：源码 + 内嵌 pdf.js 引擎 |
| `locale/en.json`、`locale/zh.json` | 插件管理器显示的名称与描述 |
| `icon.svg` | 插件图标 |
| `LICENSE`、`THIRD_PARTY_NOTICES.md` | 许可与 pdf.js 声明 |

## License

本插件代码使用 MIT 许可。内嵌的 pdf.js 使用 Apache-2.0，完整声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
