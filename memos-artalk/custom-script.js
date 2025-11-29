/**
 * Memos 自定义脚本 - Artalk 评论集成
 * 
 * 使用方法：
 * 1. 登录 Memos 后台
 * 2. 进入 设置 -> 系统 -> 自定义脚本
 * 3. 粘贴此 JS 内容
 */

// ========== 配置区域 ==========
var ARTALK_SERVER = 'https://artalk.yanming.net';  // 替换为你的 Artalk 服务端地址
var ARTALK_SITE = 'yanming.net comment';           // 替换为你在 Artalk 中配置的站点名称
// ========== 配置区域结束 ==========

// 加载 Artalk CSS
document.head.innerHTML += '<link rel="stylesheet" href="https://unpkg.com/artalk/dist/Artalk.css" type="text/css"/>';

// 加载 Artalk JS
function addArtalkJS() {
    var memosArtalk = document.createElement("script");
    memosArtalk.src = 'https://unpkg.com/artalk/dist/Artalk.js';
    var artakPos = document.getElementsByTagName("script")[0];
    artakPos.parentNode.insertBefore(memosArtalk, artakPos);
}

// 启动 Artalk
function startArtalk() {
    var start = setInterval(function() {
        var artalkDom = document.getElementById('Comments') || '';
        // 适配新版 Memos: .memo-wrapper 或 .memo-container
        var memoAt = document.querySelector('.memo-wrapper') || 
                     document.querySelector('.memo-container') ||
                     document.querySelector('[class*="MemoDetail"]') ||
                     document.querySelector('main > section > div > div > div');
        
        // 检查是否在单条 memo 页面 (/m/ 或 /memos/)
        var isMemoPage = /\/(m|memos)\//.test(window.location.href);
        
        if (isMemoPage && !artalkDom) {
            addArtalkJS();
            if (memoAt) {
                clearInterval(start);
                // 在 memo 内容后插入评论容器
                memoAt.insertAdjacentHTML('afterend', '<div id="Comments" style="margin-top:20px;"></div>');
                
                setTimeout(function() {
                    if (typeof Artalk !== 'undefined') {
                        Artalk.init({
                            el: '#Comments',
                            pageKey: location.pathname,
                            pageTitle: document.title,
                            server: ARTALK_SERVER,
                            site: ARTALK_SITE,
                            darkMode: 'auto'
                        });
                    }
                }, 1000);
            }
        }
    }, 1000);
}

startArtalk();
