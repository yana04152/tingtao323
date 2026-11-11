# 听涛 · 323

《周涛 · 岁月有声》——一份因喜欢而开始、可以反复翻阅的人物册。

“听涛”回应她的声音，“323”记下三月二十三日。网站保留原有的五个人生章节，以及年表、影像与长谈、工作与荣誉、作品索引、访谈阅读、照片与旧帖、足迹关联和本人原话。

网站入口：https://yana04152.github.io/tingtao323/

这是独立整理的非官方网站。事实、本人表达与编辑叙述分别呈现，年代疑点和原始出处保留在相应记录中。

## 开发与部署

使用 Node.js 22.13 或更新版本，以及 Python 3。首次获取仓库后，先展开图片和配乐包：

```sh
python3 -m zipfile -e site-media.zip public
npm ci
npm run dev
npm run build
```

构建输出为 `dist/`，可放在任意普通静态网站托管平台。网站使用片段路由，支持 GitHub Pages 项目子目录；人物册阅读不需要 ChatGPT 登录或数据库，留言与统计另接 Supabase。收藏保存在访问者自己的浏览器中。

GitHub Pages 使用仓库的 Actions 工作流构建和发布。图片与配乐随网站部署，视频通过原平台播放器或原链接按需打开。

## 回声：留言、反馈与访问统计

新增页面为 `#guestbook`（公开留言）与 `#manage`（整理者管理）。网站阅读继续免登录；游客填写昵称即可提交，公开留言审核后展示，私密反馈只能由管理者读取。

数据服务已接入 Supabase Free。免费项目可能因连续一周低活跃而暂停；暂停不影响人物册本身，但留言和统计会暂时不可用。管理页支持导出留言和当前统计，访问事件在后续有效访问时清理超过90天的部分，短期防刷散列记录在后续请求时清理超过25小时的部分。

首次连接步骤：

1. 创建个人免费项目，在 SQL Editor 执行 `backend/guestbook.sql`。
2. 在项目私有 SQL Editor 中为本人邮箱添加管理员：`insert into tingtao_private.admins(email) values ('你的管理邮箱');`。不要把实际管理邮箱写入公开源码。
3. Authentication → URL Configuration：Site URL 设置为 `https://yana04152.github.io/tingtao323/`。登录回跳使用这个不带片段的网址，避免与验证信息冲突。邮箱验证保持开启。管理页使用邮箱登录链接，无需为读者创建账号。
4. 将项目 URL 和 **publishable key** 写入 `src/lib/guestbook-config.json`。此文件只允许公开客户端密钥，禁止使用 secret key 或 service-role key。
5. 使用已登记邮箱打开 `#manage`，请求并验证登录邮件。Supabase 默认邮件服务通常仅允许项目团队邮箱；需要其他邮箱时先配置正规邮件服务。
6. 运行 `npm test` 与 `npm run build`。验证公开留言提交后默认不公开、私密反馈不会泄露、管理员可审核回复，最后再发布。

数据表位于不对 Data API 暴露的私有 schema，并开启行级安全。匿名请求仅能调用限定的公开读取、提交与统计入口；管理入口同时验证 Supabase 身份、邮箱已验证以及管理员白名单。所有渲染为纯文本，不执行留言中的 HTML。

访问统计以标签页的30分钟浏览会话计数，不能识别访客本人，也不等同于独立人数。只记录板块名和概括后的来源类别，不记录完整来源链接。管理页面不展示 IP 或单个读者轨迹。尊重浏览器 Do Not Track / Global Privacy Control；留言页可以关闭本浏览器统计。测试环境与已登录的管理者不计入访问量。

## 内容与配乐

资料与影像出处见网页各条记录。图片、影像、引文及其原始作品的权利归相应权利人所有，本仓库不为这些内容授予额外授权。

配乐：Erik Satie — Gymnopédie No. 1；演奏/编配：Kevin MacLeod（incompetech.com）。

授权：[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。音源：[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1_(ISRC_USUAN1100787).mp3)。
