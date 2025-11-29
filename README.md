通过 Memos API 渲染的静态网页。
简单的 HTML、纯净的 CSS、原生的 JS。

基于原项目进行了以下修改：

个人只使用新版（>= `v0.25.0`），老版（< `v0.25.0`）未进行测试。

### 新增功能

- **Artalk 评论系统集成**
  - 每条 Memo 支持独立评论
  - 评论数量显示（使用 `Artalk.loadCountWidget`）
  - 自动适配深色/浅色主题
  - 前端与 Memos 后台评论数据互通
  - 详见 [`memos-artalk/`](./memos-artalk/) 目录

- **配置文件独立**
  - 新增 `assets/js/config.js` 统一管理配置
  - 支持站点信息、导航链接、Artalk 等配置项

### 优化改进

- **标签筛选优化**：改进中文标签支持，添加清除筛选按钮
- **时间显示优化**：超过 24 小时显示完整日期时间
- **UI 样式优化**：重构 CSS 变量，优化响应式布局
- **代码重构**：移除冗余代码，提升可维护性

### 文件变更

| 文件 | 变更 |
|------|------|
| `assets/js/config.js` | 新增，集中配置管理 |
| `assets/js/main.js` | 重构，添加 Artalk 集成 |
| `assets/css/style.css` | 重构，优化样式变量 |
| `index.html` | 简化，配置移至 config.js |
| `memos-artalk/` | 新增，Memos 后台评论集成 |


### 前端框架

> • 暗黑模式适配  
> • 移动端自适应

- [**Memos**](https://github.com/usememos/memos)
- [Highlight.js](https://github.com/highlightjs/highlight.js)
- [Markedjs](https://github.com/markedjs/marked)
- [ViewImage.js](https://github.com/Tokinx/ViewImage)

### 使用方法

##### 1. `clone`本仓库或[下载](https://github.com/eallion/memos.top/archive/refs/heads/main.zip)后部署

```bash
git clone https://github.com/eallion/memos.top
```

##### 2. 设置

编辑 `assets/js/config.js` 文件，调整以下配置：

```javascript
var siteConfig = {
    // Memos API 配置
    memos: {
        host: 'https://demo.usememos.com/',  // Memos 服务地址，末尾有 /
        limit: '10',                          // 每页显示条数
        creatorId: '1',                       // 用户 ID
        domId: '#memos',
        username: 'memos',                    // 显示的用户名
        name: 'Official Demo',                // 显示的全名
        language: 'zh-CN',
        APIVersion: 'new',                    // 'new' (>= v0.25.0) 或 'legacy'
        total: true,
        doubanAPI: '',
    },
    
    // Artalk 评论配置（可选）
    artalk: {
        enabled: true,                        // 是否启用评论
        server: 'https://artalk.example.com', // Artalk 服务地址
        site: 'My Site',                      // Artalk 站点名称
    },
    
    // 站点信息
    site: {
        title: 'Memos',
        subtitle: '记录生活',
    },
};
```

##### 3. 网站图标和头像 (*可选*)

在 `assets/img` 目录中，替换成自己的图标和头像。

- `logo.webp` 是网站图标，显示在浏览器标签上。
- `avatar.jpg` 是头像，显示在每条 Memos 的左侧。

- [ ] 待办：获取 Memos 的默认头像：https://memos.apidocumentation.com/reference#tag/userservice/GET/file/{name}/avatar

##### 4. 上传

上传 `index.html` 文件 `assets` 目录及目录中的所有文件到网站根目录。

### 部署到 GitHub Pages

> Demo: <https://eallion.github.io/memos.top>

1. Fork 本仓库
2. 按照 #[使用方法.2](#2-设置) 设置自己的 API
3. 转到自己的 `memos.top` 仓库的设置 - `Setting` - `Pages` - `Deploy from a branch` - `Branch(main/root)`

### 部署到 Vercel

> Demo: <https://memos-demo.vercel.app/>

1. Fork 本仓库
2. 按照 #[使用方法.2](#2-设置) 设置自己的 API
3. 进入自己的 Vercel 面板
4. 新建一个 Project，导入 GitHub 上的仓库
5. 按默认设置不用改动，直接点`Deploy`
6. 中国大陆可能需要绑定一个自定义域名才能访问 Vercel

Todo:

- [ ] Vercel 一键部署

### 其他平台

你也可以把这个静态页面部署到 Cloudflare Pages 或者 Netlify 等平台。

### 使用技巧

<details><summary>
发布 Memos 时的格式： 👈👈👈
</summary>  

1. Bilibili 视频。分享的视频链接。支持`BV/AV`号。暂不支持`b23.tv`链接。

```
https://www.bilibili.com/video/BV1Sd4y1b7yg/
```

2. Youtube 视频。分享的视频链接。

```
https://www.youtube.com/watch?v=mNK6h1dfy2o
```

3. Youku 视频。分享的视频链接。

```
https://v.youku.com/v_show/id_XNTkyMjkxNTEyOA==.html
```

4. 腾讯视频。分享的视频链接。

```
https://v.qq.com/x/cover/mzc00200z47sdeu/m0044zpag6c.html
```

5. Spotify 音乐。分享的链接。支持`track/album`。

```
https://open.spotify.com/track/6Uq8BnOxvXJsQiJ2XqfO5P
```

6. 网易云音乐。链接即可。

```
https://music.163.com/#/song?id=4153490
```

7. QQ 音乐。只支持 `sondmid` 不支持 `songid`。

```
https://y.qq.com/n/ryqq/songDetail/004W3BfK46dMXk
```

8. 豆瓣。链接即可。需要自己的 API。

> 如果要启动解析豆瓣功能，需要取消注释 [`// fetchDB()`](https://github.com/eallion/memos.top/blob/main/assets/js/main.js#L208) 然后替换成可用的 API [`var dbAPI = "https://api.example.com/"`](https://github.com/eallion/memos.top/blob/main/assets/js/main.js#L218)，这两行位于： [`assets/js/main.js`](https://github.com/eallion/memos.top/blob/main/assets/js/main.js)

```
https://book.douban.com/subject/2567698/
https://movie.douban.com/subject/1889243/
```

</details>

### [许可证 GLWTPL](https://github.com/me-shaon/GLWTPL)

```
GLWT（Good Luck With That，祝你好运）公共许可证
版权所有© 每个人，除了作者

任何人都被允许复制、分发、修改、合并、销售、出版、再授权或
任何其它操作，但风险自负。

作者对这个项目中的代码一无所知。
代码处于可用或不可用状态，没有第三种情况。


                祝你好运公共许可证
            复制、分发和修改的条款和条件

0 ：在不导致作者被指责或承担责任的情况下，你可以做任何你想
要做的事情。

无论是在合同行为、侵权行为或其它因使用本软件产生的情形，作
者不对任何索赔、损害承担责任。

祖宗保佑。
```
