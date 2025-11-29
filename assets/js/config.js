/**
 * 站点配置文件
 * Site Configuration
 */

var siteConfig = {
    // ========== 站点信息 ==========
    title: "Ming's log",
    bio: "既创，且寻 Built & Found",
description: "一些关于声学、电子与创造的日常 Acoustics, Electronics & Builds",  // 个人简介
    
    // ========== Memos API 配置 ==========
    memos: {
        host: 'https://memos.yanming.net/',  // Memos 实例地址
        limit: '10',                          // 每页显示数量
        creatorId: '1',                       // 用户 ID (旧版是 101，新版是 1)
        domId: '#memos',                      // DOM 容器选择器
        username: 'ming',                     // 显示的用户名 (@xxx)
        name: 'Ming',                         // 显示的昵称
        language: 'zh-CN',                    // 语言设置 (用于相对时间)
        APIVersion: 'new',                    // API 版本: 'new' (>=v0.22.0) 或 'legacy' (<v0.22.0)
        total: true,                          // 是否显示总数统计
        doubanAPI: '',                        // 豆瓣 API 地址 (留空禁用)
    },
    
    // ========== Artalk 评论配置 ==========
    artalk: {
        enabled: true,                        // 是否启用评论
        server: 'https://artalk.yanming.net', // Artalk 服务端地址 (需替换为你的地址)
        site: 'yanming.net comment',                        // 站点名称
    },
    
    // ========== 导航链接 ==========
    nav: {
        Backend: 'https://memos.yanming.net/',
        Comment: 'https://artalk.yanming.net',
    },
    
    // ========== 页脚信息 ==========
    footer: {
        author: 'Yan Ming',
        authorUrl: 'https://yanming.net/',
    }
};

// 兼容旧的 memos 变量名
var memos = siteConfig.memos;
