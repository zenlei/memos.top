# Memos Artalk 评论集成

为 Memos 集成 Artalk 评论系统的自定义样式和脚本。

## 前提条件

1. **部署 Artalk 服务端** - [官方文档](https://artalk.js.org/guide/deploy.html)
2. **在 Artalk 后台创建站点**

## 配置步骤

### 1. 配置前端

编辑 `assets/js/config.js`：

```javascript
artalk: {
    enabled: true,
    server: 'https://your-artalk-server.com',
    site: 'Your Site Name',
},
```

### 2. 配置 Memos 后台（可选）

用于在 Memos 本身显示评论。

**自定义样式**：设置 → 系统 → 自定义样式，粘贴 `custom-style.css` 内容

**自定义脚本**：设置 → 系统 → 自定义脚本，粘贴 `custom-script.js` 内容，并修改配置：

```javascript
var ARTALK_SERVER = 'https://your-artalk-server.com';
var ARTALK_SITE = 'Your Site Name';
```

## 文件说明

| 文件 | 用途 |
|------|------|
| `custom-style.css` | Memos 自定义样式 |
| `custom-script.js` | Memos 自定义脚本 |

## 功能特性

- ✅ 每条 Memo 独立评论
- ✅ 自动适配深色/浅色主题
- ✅ 懒加载评论（点击后加载）
- ✅ 评论数量显示（使用 `Artalk.loadCountWidget`）
- ✅ 前端和 Memos 评论数据互通

## 注意事项

1. **pageKey 格式**: `/memos/{id}`（Memos 会将 `/m/{id}` 重定向到 `/memos/{id}`）

2. **跨域配置**: 在 Artalk 服务端 `artalk.yml` 添加：
   ```yaml
   trusted_domains:
     - https://your-memos-domain.com
     - https://your-frontend-domain.com
   ```

3. **安全建议**: 使用 HTTPS，启用垃圾评论过滤
