// ========== 从 config.js 读取配置 ==========
var memo = (typeof siteConfig !== "undefined" && siteConfig.memos) ? siteConfig.memos : {
    host: 'https://demo.usememos.com/',
    limit: '10',
    creatorId: '1',
    domId: '#memos',
    username: 'Admin',
    name: 'Administrator',
    APIVersion: 'new',
    language: 'zh-CN',
    total: true,
    doubanAPI: '',
};

// 兼容旧的 memos 变量覆盖
if (typeof memos !== "undefined") {
    for (var key in memos) {
        if (memos[key]) {
            memo[key] = memos[key];
        }
    }
}

// ========== 初始化站点信息 ==========
function initSiteInfo() {
    if (typeof siteConfig !== "undefined") {
        // 站点标题
        var siteTitle = document.getElementById('site-title');
        if (siteTitle) siteTitle.textContent = siteConfig.title || 'Memos';
        
        // 页面标题
        if (siteConfig.title) {
            document.title = siteConfig.title + ' - ' + (siteConfig.footer.author || '');
        }
        
        // Profile
        var profileName = document.getElementById('profile-name');
        var profileBio = document.getElementById('profile-bio');
        var profileDesc = document.getElementById('profile-desc');
        if (profileName) profileName.textContent = siteConfig.memos.name || 'Memos';
        if (profileBio) profileBio.textContent = siteConfig.bio || '';
        if (profileDesc) profileDesc.textContent = siteConfig.description || '';
        
        // 导航链接 - 动态生成
        var navLinks = document.getElementById('nav-links');
        if (navLinks && siteConfig.nav) {
            var links = [];
            for (var key in siteConfig.nav) {
                if (siteConfig.nav.hasOwnProperty(key)) {
                    links.push('<a href="' + siteConfig.nav[key] + '" target="_blank" rel="noopener noreferrer">' + key + '</a>');
                }
            }
            navLinks.innerHTML = links.join(' · ');
        }
        
        // 页脚
        var footerYear = document.getElementById('footer-year');
        var footerAuthor = document.getElementById('footer-author');
        if (footerYear) footerYear.textContent = new Date().getFullYear();
        if (footerAuthor && siteConfig.footer) {
            footerAuthor.textContent = siteConfig.footer.author || '';
            footerAuthor.href = siteConfig.footer.authorUrl || '#';
        }
        
        // 备案号
        var footerBeian = document.getElementById('footer-beian');
        if (footerBeian && siteConfig.footer) {
            var beianHtml = [];
            // ICP 备案
            if (siteConfig.footer.icp) {
                var icpUrl = siteConfig.footer.icpUrl || 'https://beian.miit.gov.cn/';
                beianHtml.push('<a href="' + icpUrl + '" target="_blank" rel="noopener noreferrer">' + siteConfig.footer.icp + '</a>');
            }
            // 公安备案
            if (siteConfig.footer.gongan) {
                var gonganUrl = siteConfig.footer.gonganUrl || 'http://www.beian.gov.cn/';
                beianHtml.push('<a href="' + gonganUrl + '" target="_blank" rel="noopener noreferrer"><img src="assets/img/gongan.png" alt="" style="vertical-align:middle;margin-right:3px;width:14px;height:14px;">' + siteConfig.footer.gongan + '</a>');
            }
            if (beianHtml.length > 0) {
                footerBeian.innerHTML = beianHtml.join(' · ');
                footerBeian.style.display = 'block';
            }
        }
        
        // 访问统计
        var siteStats = document.getElementById('site-stats');
        if (siteStats && siteConfig.stats && siteConfig.stats.enabled) {
            var statsHtml = [];
            if (siteConfig.stats.showPV) {
                statsHtml.push('<span class="stat-pv">访问量: <span id="busuanzi_site_pv">-</span></span>');
            }
            if (siteConfig.stats.showUV) {
                statsHtml.push('<span class="stat-uv">访客数: <span id="busuanzi_site_uv">-</span></span>');
            }
            if (statsHtml.length > 0) {
                siteStats.innerHTML = statsHtml.join(' · ');
                siteStats.style.display = 'inline';
            }
        }
    }
}
initSiteInfo();

// ========== 配置 marked ==========
marked.setOptions({
    breaks: true,  // 将换行符转换为 <br>
    gfm: true      // 启用 GitHub Flavored Markdown
});

// ========== 数学公式渲染 ==========
function renderMathInElement(element) {
    if (typeof renderMathInElement !== 'undefined' && window.renderMathInElement) {
        window.renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},   // 块级公式
                {left: '$', right: '$', display: false},    // 行内公式
                {left: '\\[', right: '\\]', display: true}, // 块级公式（LaTeX 风格）
                {left: '\\(', right: '\\)', display: false} // 行内公式（LaTeX 风格）
            ],
            throwOnError: false,
            strict: false
        });
    }
}

// 渲染页面中所有 memo 内容的数学公式
function renderAllMath() {
    if (typeof window.renderMathInElement === 'undefined') {
        // KaTeX 尚未加载完成，稍后重试
        setTimeout(renderAllMath, 100);
        return;
    }
    var memoContents = document.querySelectorAll('.memo-content');
    memoContents.forEach(function(el) {
        window.renderMathInElement(el, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false,
            strict: false
        });
    });
}

var limit = memo.limit;
var memosHost = memo.host.replace(/\/$/, '');
var page = 1, offset = 0, nextLength = 0, nextDom = '', nextPageToken = '', btnRemove = 0, tag = '';
var memoDom = document.querySelector(memo.domId);

// ========== API URL ==========
let memoUrl;
if (memo.APIVersion === 'new') {
    memoUrl = `${memosHost}/api/v1/memos?parent=users/${memo.creatorId}`;
} else if (memo.APIVersion === 'legacy') {
    memoUrl = memosHost + "/api/v1/memo?creatorId=" + memo.creatorId + "&rowStatus=NORMAL";
} else {
    throw new Error('Invalid APIVersion');
}

// ========== Initialize ==========
if (memoDom) {
    // Set avatar
    setUserAvatar();
    
    // Add loading
    var load = '<button class="load-btn button-load">加载中...</button>';
    memoDom.insertAdjacentHTML('afterend', load);
    
    // Fetch first batch
    getFirstList();
    
    // Add load more button listener
    var btn = document.querySelector("button.button-load");
    btn.addEventListener("click", function () {
        btn.textContent = '加载中...';
        updateHTMl(nextDom);
        if (nextLength < limit) {
            document.querySelector("button.button-load").remove();
            btnRemove = 1;
            return;
        }
        getNextList();
    });
}

// ========== Set User Avatar ==========
function setUserAvatar() {
    var avatarImg = document.getElementById('user-avatar');
    if (avatarImg) {
        if (memo.APIVersion === 'new') {
            avatarImg.src = memosHost + '/api/v1/users/' + memo.creatorId + '/avatar';
        } else {
            avatarImg.src = 'assets/img/avatar.jpg';
        }
    }
}

// ========== Get First List ==========
function getFirstList() {
    let memoUrl_first;
    if (memo.APIVersion === 'new') {
        memoUrl_first = memoUrl + '&pageSize=' + limit;
        fetch(memoUrl_first).then(res => res.json()).then(resdata => {
            updateHTMl(resdata);
            nextPageToken = resdata.nextPageToken;
            var nowLength = resdata.memos ? resdata.memos.length : 0;
            if (nowLength < limit) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
            page++;
            getNextList();
        });
    } else if (memo.APIVersion === 'legacy') {
        memoUrl_first = memoUrl + "&limit=" + limit;
        fetch(memoUrl_first).then(res => res.json()).then(resdata => {
            updateHTMl(resdata);
            var nowLength = resdata.length;
            if (nowLength < limit) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
            page++;
            offset = limit * (page - 1);
            getNextList();
        });
    }
}

// ========== Get Next List ==========
function getNextList() {
    if (memo.APIVersion === 'new') {
        var memoUrl_next = memoUrl + '&pageSize=' + limit + '&pageToken=' + nextPageToken;
        fetch(memoUrl_next).then(res => res.json()).then(resdata => {
            nextPageToken = resdata.nextPageToken;
            nextDom = resdata;
            nextLength = resdata.memos ? resdata.memos.length : 0;
            page++;
            if (nextLength < 1) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
        });
    } else if (memo.APIVersion === 'legacy') {
        var memoUrl_next = tag 
            ? memoUrl + "&limit=" + limit + "&offset=" + offset + "&tag=" + tag
            : memoUrl + "&limit=" + limit + "&offset=" + offset;
        fetch(memoUrl_next).then(res => res.json()).then(resdata => {
            nextDom = resdata;
            nextLength = resdata.length;
            page++;
            offset = limit * (page - 1);
            if (nextLength < 1) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
        });
    }
}

// ========== Tag Selection ==========
document.addEventListener('click', function (event) {
    var target = event.target;
    if (target.tagName.toLowerCase() === 'a' && target.getAttribute('href') && target.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        tag = target.getAttribute('href').substring(1);
        
        if (btnRemove) {
            btnRemove = 0;
            memoDom.insertAdjacentHTML('afterend', '<button class="load-btn button-load">加载中...</button>');
            var btn = document.querySelector("button.button-load");
            btn.addEventListener("click", function () {
                btn.textContent = '加载中...';
                updateHTMl(nextDom);
                if (nextLength < limit) {
                    document.querySelector("button.button-load").remove();
                    btnRemove = 1;
                    return;
                }
                getNextList();
            });
        }
        
        getTagFirstList();
        
        var filterElem = document.getElementById('tag-filter');
        filterElem.style.display = 'block';
        var tags = document.getElementById('tags');
        tags.innerHTML = `#${tag}<svg class="tag-close" viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

function getTagFirstList() {
    page = 1;
    offset = 0;
    nextLength = 0;
    nextDom = '';
    nextPageToken = '';
    memoDom.innerHTML = "";
    
    // 隐藏加载更多按钮，因为标签筛选会一次性加载所有匹配的内容
    var loadBtn = document.querySelector("button.button-load");
    if (loadBtn) {
        loadBtn.style.display = 'none';
    }
    
    if (memo.APIVersion === 'new') {
        // 新版 API: 获取较大数量的 memos 并在客户端筛选
        var tagFilterUrl = memoUrl + '&pageSize=100';
        fetchAllMemosWithTag(tagFilterUrl, []);
    } else if (memo.APIVersion === 'legacy') {
        var memoUrl_tag = memoUrl + "&limit=" + limit + "&tag=" + tag;
        fetch(memoUrl_tag).then(res => res.json()).then(resdata => {
            updateHTMl(resdata);
            var nowLength = resdata.length;
            if (nowLength < limit) {
                var btn = document.querySelector("button.button-load");
                if (btn) btn.remove();
                btnRemove = 1;
                return;
            }
            page++;
            offset = limit * (page - 1);
            getNextList();
        });
    }
}

// 递归获取所有包含指定标签的 memos
function fetchAllMemosWithTag(url, allMemos) {
    fetch(url).then(res => res.json()).then(resdata => {
        var memosList = resdata.memos || [];
        
        // 筛选包含指定标签的 memos
        var filteredMemos = memosList.filter(function(memoData) {
            var content = memoData.content || '';
            var tagRegex = new RegExp('#' + escapeRegExp(tag) + '(?=[\\s\\[\\]<>]|$)', 'i');
            return tagRegex.test(content);
        });
        
        allMemos = allMemos.concat(filteredMemos);
        
        // 如果还有下一页，继续获取
        if (resdata.nextPageToken && memosList.length > 0) {
            var nextUrl = memoUrl + '&pageSize=100&pageToken=' + resdata.nextPageToken;
            fetchAllMemosWithTag(nextUrl, allMemos);
        } else {
            // 所有数据获取完成，渲染筛选结果
            if (allMemos.length > 0) {
                updateHTMl({ memos: allMemos });
            } else {
                memoDom.innerHTML = '<div class="no-results">没有找到包含 #' + tag + ' 标签的内容</div>';
            }
            // 标签筛选模式下隐藏加载更多按钮
            var loadBtn = document.querySelector("button.button-load");
            if (loadBtn) loadBtn.remove();
            btnRemove = 1;
        }
    });
}

// 转义正则特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearFilter() {
    tag = '';
    page = 1;
    offset = 0;
    nextLength = 0;
    nextDom = '';
    nextPageToken = '';
    
    var filterElem = document.getElementById('tag-filter');
    filterElem.style.display = 'none';
    
    memoDom.innerHTML = "";
    
    if (btnRemove) {
        btnRemove = 0;
        memoDom.insertAdjacentHTML('afterend', '<button class="load-btn button-load">加载中...</button>');
        var btn = document.querySelector("button.button-load");
        btn.addEventListener("click", function () {
            btn.textContent = '加载中...';
            updateHTMl(nextDom);
            if (nextLength < limit) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
            getNextList();
        });
    }
    
    getFirstList();
}

// ========== Update HTML ==========
function updateHTMl(data) {
    var memoResult = "";
    
    // Regex patterns - 改进的标签正则，支持中文标签，不要求后面有空格
    const TAG_REG = /#([^\s#\[\]<>]+)/g;
    const BILIBILI_REG = /<a\shref="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?">.*<\/a>/g;
    const NETEASE_MUSIC_REG = /<a\shref="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g;
    const QQMUSIC_REG = /<a\shref="https\:\/\/y\.qq\.com\/.*(\/[0-9a-zA-Z]+)(\.html)?".*?>.*?<\/a>/g;
    const QQVIDEO_REG = /<a\shref="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g;
    const SPOTIFY_REG = /<a\shref="https:\/\/open\.spotify\.com\/(track|album)\/([\s\S]+)".*?>.*<\/a>/g;
    const YOUKU_REG = /<a\shref="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g;
    const YOUTUBE_REG = /<a\shref="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;
    
    // Process data based on API version
    var memosList = memo.APIVersion === 'new' ? data.memos : data;
    
    if (!memosList || memosList.length === 0) return;
    
    for (var i = 0; i < memosList.length; i++) {
        var memoData = memosList[i];
        // 新版 API: name 格式为 "memos/{uid}"，需要提取 uid
        // 旧版 API: 直接使用 id
        var uId;
        if (memo.APIVersion === 'new') {
            // 优先使用 uid，否则从 name 中提取
            uId = memoData.uid || (memoData.name ? memoData.name.split('/').pop() : '');
        } else {
            uId = memoData.id;
        }
        
        // 提取标签并生成标签 HTML
        var tagsHtml = '';
        var contentForParse = memoData.content;
        
        // 从内容中提取标签
        var tagMatches = contentForParse.match(TAG_REG);
        if (tagMatches) {
            var uniqueTags = [...new Set(tagMatches)];
            tagsHtml = uniqueTags.map(tag => {
                var tagName = tag.substring(1); // 去掉 # 号
                return `<span class='tag-span'><a rel='noopener noreferrer' href='#${tagName}'>#${tagName}</a></span>`;
            }).join(' ');
            
            // 从内容中移除标签（避免重复显示）
            contentForParse = contentForParse.replace(TAG_REG, '');
        }
        
        // Parse content with marked
        var memoContREG = marked.parse(contentForParse)
            .replace(BILIBILI_REG, "<div class='video-wrapper'><iframe src='//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true'></iframe></div>")
            .replace(YOUTUBE_REG, "<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe></div>")
            .replace(NETEASE_MUSIC_REG, "<meting-js auto='https://music.163.com/#/song?id=$1'></meting-js>")
            .replace(QQMUSIC_REG, "<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>")
            .replace(QQVIDEO_REG, "<div class='video-wrapper'><iframe src='//v.qq.com/iframe/player.html?vid=$1' allowFullScreen='true' frameborder='no'></iframe></div>")
            .replace(SPOTIFY_REG, "<div class='spotify-wrapper'><iframe style='border-radius:12px' src='https://open.spotify.com/embed/$1/$2?utm_source=generator&theme=0' width='100%' frameBorder='0' allowfullscreen='' allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' loading='lazy'></iframe></div>")
            .replace(YOUKU_REG, "<div class='video-wrapper'><iframe src='https://player.youku.com/embed/$1' frameborder=0 'allowfullscreen'></iframe></div>");
        
        // Process resources/images
        memoContREG += processResources(memoData, memo.APIVersion);
        
        // Get time and avatar
        var relativeTime, avatarUrl;
        if (memo.APIVersion === 'new') {
            relativeTime = getRelativeTime(new Date(memoData.createTime));
            avatarUrl = memosHost + '/api/v1/users/' + memo.creatorId + '/avatar';
        } else {
            relativeTime = getRelativeTime(new Date(memoData.createdTs * 1000));
            avatarUrl = 'assets/img/avatar.jpg';
        }
        
        // Comment icon HTML (if Artalk enabled)
        var commentIconHtml = '';
        var commentContainerHtml = '';
        if (siteConfig.artalk && siteConfig.artalk.enabled) {
            var pageKey = '/memos/' + uId;
            commentIconHtml = `
                <a class="memo-comment-btn" href="javascript:void(0)" onclick="toggleArtalk('${uId}')" title="评论">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                    <span class="comment-count artalk-comment-count" data-page-key="${pageKey}"></span>
                </a>`;
            commentContainerHtml = `
                <div class="memo-comment artalk-container-${uId}" style="display:none;">
                    <div id="artalk-${uId}"></div>
                </div>`;
        }
        
        // Build memo HTML
        memoResult += `
            <article class="memo-item" data-memo-id="${uId}">
                <div class="memo-actions">
                    ${commentIconHtml}
                    <a class="memo-outlink" href="${memosHost}/m/${uId}" target="_blank" rel="noopener noreferrer" title="查看原文">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill="currentColor" d="M864 640a32 32 0 0 1 64 0v224.096A63.936 63.936 0 0 1 864.096 928H159.904A63.936 63.936 0 0 1 96 864.096V159.904C96 124.608 124.64 96 159.904 96H384a32 32 0 0 1 0 64H192.064A31.904 31.904 0 0 0 160 192.064v639.872A31.904 31.904 0 0 0 192.064 864h639.872A31.904 31.904 0 0 0 864 831.936V640zm-485.184 52.48a31.84 31.84 0 0 1-45.12-.128 31.808 31.808 0 0 1-.128-45.12L815.04 166.048l-176.128.736a31.392 31.392 0 0 1-31.584-31.744 32.32 32.32 0 0 1 31.84-32l255.232-1.056a31.36 31.36 0 0 1 31.584 31.584L924.928 388.8a32.32 32.32 0 0 1-32 31.84 31.392 31.392 0 0 1-31.712-31.584l.736-179.392L378.816 692.48z"/></svg>
                    </a>
                </div>
                <div class="memo-header">
                    <div class="memo-avatar">
                        <img src="${avatarUrl}" alt="${memo.name}" loading="lazy" />
                    </div>
                    <div class="memo-meta">
                        <div class="memo-author">
                            <span class="memo-name">${memo.name}</span>
                            <svg class="memo-verify" viewBox="0 0 24 24" aria-label="已认证">
                                <path fill="currentColor" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                            </svg>
                            <span class="memo-username">@${memo.username}</span>
                        </div>
                        <div class="memo-time">${relativeTime}</div>
                    </div>
                </div>
                <div class="memo-content">
                    ${tagsHtml ? '<div class="memo-tags">' + tagsHtml + '</div>' : ''}
                    ${memoContREG}
                </div>
                ${commentContainerHtml}
            </article>
        `;
    }
    
    memoDom.insertAdjacentHTML('beforeend', memoResult);
    
    // Parse Douban
    if (memo.doubanAPI) {
        fetchDB();
    }
    
    // Update button text
    var btn = document.querySelector('button.button-load');
    if (btn) {
        btn.textContent = '加载更多';
    }
    
    // Initialize image lightbox
    window.ViewImage && ViewImage.init('.memo-content img');
    
    // 渲染数学公式
    renderAllMath();
    
    // 更新 Artalk 评论计数
    if (siteConfig.artalk && siteConfig.artalk.enabled) {
        loadArtalkCommentCounts();
    }
}

// 加载 Artalk 评论计数
function loadArtalkCommentCounts() {
    // 等待 Artalk 加载完成
    if (typeof Artalk === 'undefined') {
        setTimeout(loadArtalkCommentCounts, 200);
        return;
    }
    
    Artalk.loadCountWidget({
        server: siteConfig.artalk.server,
        site: siteConfig.artalk.site,
        countEl: '.artalk-comment-count',
        statPageKeyAttr: 'data-page-key'
    });
    
    // 延迟隐藏零评论数
    setTimeout(function() {
        document.querySelectorAll('.artalk-comment-count').forEach(function(el) {
            if (el.textContent === '0' || el.textContent === '') {
                el.classList.add('hide-zero');
            } else {
                el.classList.remove('hide-zero');
            }
        });
    }, 1000);
}

// ========== Process Resources ==========
function processResources(memoData, apiVersion) {
    var imgUrl = '', resUrl = '';
    // 新版 API 使用 attachments 或 resources，旧版使用 resourceList
    var resourceList = apiVersion === 'new' 
        ? (memoData.attachments || memoData.resources) 
        : memoData.resourceList;
    
    if (!resourceList || resourceList.length === 0) return '';
    
    var imageCount = 0;
    var images = [];
    
    for (var j = 0; j < resourceList.length; j++) {
        var res = resourceList[j];
        var resType = res.type.slice(0, 5);
        var resLink = '';
        
        if (apiVersion === 'new') {
            if (res.externalLink) {
                resLink = res.externalLink;
            } else {
                resLink = memosHost + '/file/' + res.name + '/' + res.filename;
            }
        } else {
            if (res.externalLink) {
                resLink = res.externalLink;
            } else {
                var fileId = res.publicId || res.filename;
                resLink = memosHost + '/o/r/' + res.id + '/' + fileId;
            }
        }
        
        if (resType === 'image') {
            images.push(resLink);
            imageCount++;
        } else if (resType === 'video') {
            imgUrl += `<div class="video-wrapper"><video controls><source src="${resLink}" type="video/mp4"></video></div>`;
        } else {
            resUrl += `<a target="_blank" rel="noreferrer" href="${resLink}">${res.filename}</a>`;
        }
    }
    
    // Build image grid
    if (images.length > 0) {
        var gridClass = 'images-wrapper';
        if (images.length === 1) gridClass += ' single-image';
        else if (images.length === 2) gridClass += ' two-images';
        
        imgUrl += `<div class="resource-wrapper"><div class="${gridClass}">`;
        for (var k = 0; k < images.length; k++) {
            imgUrl += `<div class="resimg"><img loading="lazy" src="${images[k]}" alt=""/></div>`;
        }
        imgUrl += '</div></div>';
    }
    
    if (resUrl) {
        imgUrl += `<div class="resource-wrapper"><p class="datasource">${resUrl}</p></div>`;
    }
    
    return imgUrl;
}

// ========== Fetch Douban ==========
function fetchDB() {
    var dbAPI = memo.doubanAPI;
    var dbA = document.querySelectorAll(".memo-content a[href*='douban.com/subject/']:not([rel='noreferrer'])") || '';
    
    if (!dbA) return;
    
    for (var i = 0; i < dbA.length; i++) {
        var _this = dbA[i];
        var dbHref = _this.href;
        var db_reg = /^https\:\/\/(movie|book)\.douban\.com\/subject\/([0-9]+)\/?/;
        var db_type = dbHref.replace(db_reg, "$1");
        var db_id = dbHref.replace(db_reg, "$2").toString();
        
        if (db_type === 'movie') {
            var this_item = 'movie' + db_id;
            var url = dbAPI + "movies/" + db_id;
            if (localStorage.getItem(this_item) == null || localStorage.getItem(this_item) === 'undefined') {
                fetch(url).then(res => res.json()).then(data => {
                    let fetch_item = 'movies' + data.sid;
                    let fetch_href = "https://movie.douban.com/subject/" + data.sid + "/";
                    localStorage.setItem(fetch_item, JSON.stringify(data));
                    movieShow(fetch_href, fetch_item);
                });
            } else {
                movieShow(dbHref, this_item);
            }
        } else if (db_type === 'book') {
            var this_item = 'book' + db_id;
            var url = dbAPI + "v2/book/id/" + db_id;
            if (localStorage.getItem(this_item) == null || localStorage.getItem(this_item) === 'undefined') {
                fetch(url).then(res => res.json()).then(data => {
                    let fetch_item = 'book' + data.id;
                    let fetch_href = "https://book.douban.com/subject/" + data.id + "/";
                    localStorage.setItem(fetch_item, JSON.stringify(data));
                    bookShow(fetch_href, fetch_item);
                });
            } else {
                bookShow(dbHref, this_item);
            }
        }
    }
}

function movieShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating);
    var db_html = `<div class='post-preview'>
        <div class='post-preview--meta'>
            <h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='${fetch_href}'>《${data.name}》</a></h4>
            <div class='rating'><div class='rating-star allstar${db_star}'></div><div class='rating-average'>${data.rating}</div></div>
            <time class='post-preview--date'>导演：${data.director} / 类型：${data.genre} / ${data.year}</time>
            <section class='post-preview--excerpt'>${data.intro.replace(/\s*/g, "")}</section>
        </div>
        <img referrerpolicy='no-referrer' loading='lazy' class='post-preview--image' src='${data.img}'>
    </div>`;
    
    var qs_href = ".memo-content a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    if (qs_dom) {
        var db_div = document.createElement("div");
        qs_dom.parentNode.replaceChild(db_div, qs_dom);
        db_div.innerHTML = db_html;
    }
}

function bookShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating.average);
    var db_html = `<div class='post-preview'>
        <div class='post-preview--meta'>
            <h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='${fetch_href}'>《${data.title}》</a></h4>
            <div class='rating'><div class='rating-star allstar${db_star}'></div><div class='rating-average'>${data.rating.average}</div></div>
            <time class='post-preview--date'>作者：${data.author}</time>
            <section class='post-preview--excerpt'>${data.summary.replace(/\s*/g, "")}</section>
        </div>
        <img referrerpolicy='no-referrer' loading='lazy' class='post-preview--image' src='${data.images.medium}'>
    </div>`;
    
    var qs_href = ".memo-content a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    if (qs_dom) {
        var db_div = document.createElement("div");
        qs_dom.parentNode.replaceChild(db_div, qs_dom);
        db_div.innerHTML = db_html;
    }
}

// ========== Get Total Memos ==========
function getTotal() {
    let pageUrl;
    
    if (memo.APIVersion === 'new') {
        pageUrl = `${memosHost}/api/v1/users/${memo.creatorId}:getStats`;
        fetch(pageUrl)
            .then(res => res.json())
            .then(resdata => {
                if (resdata && resdata.totalMemoCount !== undefined) {
                    var memosCount = document.getElementById('total');
                    if (memosCount) {
                        memosCount.innerHTML = resdata.totalMemoCount;
                    }
                }
            })
            .catch(err => console.error('Error fetching memos:', err));
    } else if (memo.APIVersion === 'legacy') {
        pageUrl = `${memosHost}/api/v1/memo/stats?creatorId=${memo.creatorId}`;
        fetch(pageUrl)
            .then(res => res.json())
            .then(resdata => {
                if (resdata) {
                    var memosCount = document.getElementById('total');
                    if (memosCount) {
                        memosCount.innerHTML = resdata.length;
                    }
                }
            })
            .catch(err => console.error('Error fetching memos:', err));
    }
}

if (memo.total === true) {
    window.addEventListener('load', getTotal);
}

// ========== Relative Time ==========
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    // 超过24小时显示绝对日期时间
    if (hours >= 24) {
        return formatDateTime(date);
    }
    
    // 24小时内显示相对时间
    const rtf = new Intl.RelativeTimeFormat(memo.language, { numeric: "auto", style: 'short' });
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
}

// 格式化日期时间为 YYYY/MM/DD HH:MM:SS
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

// ========== Theme Toggle ==========
// 使用 sessionStorage，浏览器关闭后自动失效
const localTheme = window.sessionStorage && window.sessionStorage.getItem("theme");
const themeToggle = document.querySelector(".theme-toggle");

// 判断当前是否是白天
function isDaytime() {
    const themeConfig = (typeof siteConfig !== 'undefined' && siteConfig.theme) || {};
    const dayStart = themeConfig.dayStart !== undefined ? themeConfig.dayStart : 6;
    const dayEnd = themeConfig.dayEnd !== undefined ? themeConfig.dayEnd : 18;
    const currentHour = new Date().getHours();
    return currentHour >= dayStart && currentHour < dayEnd;
}

// 根据时间获取自动主题
function getAutoTheme() {
    return isDaytime() ? 'light-theme' : 'dark-theme';
}

// 检查是否启用自动主题切换
function isAutoThemeEnabled() {
    return typeof siteConfig !== 'undefined' && siteConfig.theme && siteConfig.theme.auto === true;
}

// 初始化主题
if (localTheme) {
    // 用户手动设置过主题，使用用户设置
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(localTheme);
} else if (isAutoThemeEnabled()) {
    // 启用自动主题且用户未手动设置，根据时间自动切换
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(getAutoTheme());
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const themeUndefined = !new RegExp("(dark|light)-theme").test(document.body.className);
        const isOSDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        if (themeUndefined) {
            document.body.classList.add(isOSDark ? "light-theme" : "dark-theme");
        } else {
            document.body.classList.toggle("light-theme");
            document.body.classList.toggle("dark-theme");
        }
        
        window.sessionStorage && window.sessionStorage.setItem(
            "theme",
            document.body.classList.contains("dark-theme") ? "dark-theme" : "light-theme"
        );
    });
}

// ========== Back to Top Button Visibility ==========
const backTopBtn = document.querySelector('.backtop');
if (backTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backTopBtn.style.display = 'flex';
        } else {
            backTopBtn.style.display = 'none';
        }
    });
    backTopBtn.style.display = 'none';
}

// ========== Artalk Comment System ==========
var artalkInstances = {};

function toggleArtalk(memoId) {
    if (!siteConfig.artalk || !siteConfig.artalk.enabled) return;
    
    var container = document.querySelector('.artalk-container-' + memoId);
    if (!container) return;
    
    var isHidden = container.style.display === 'none';
    
    // Hide all other comment containers
    document.querySelectorAll('.memo-comment').forEach(function(el) {
        el.style.display = 'none';
    });
    
    if (isHidden) {
        container.style.display = 'block';
        
        // Initialize Artalk if not already initialized
        if (!artalkInstances[memoId]) {
            var pageKey = '/memos/' + memoId;  // Memos 会将 /m/{id} 重定向到 /memos/{id}
            artalkInstances[memoId] = Artalk.init({
                el: '#artalk-' + memoId,
                pageKey: pageKey,
                pageTitle: 'Memo ' + memoId,
                server: siteConfig.artalk.server,
                site: siteConfig.artalk.site,
                darkMode: document.body.classList.contains('dark-theme') || 
                         (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && 
                          !document.body.classList.contains('light-theme')),
            });
        }
        
        // Scroll to comment section
        setTimeout(function() {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Update Artalk dark mode when theme changes
if (themeToggle) {
    themeToggle.addEventListener("click", function() {
        setTimeout(function() {
            var isDark = document.body.classList.contains('dark-theme') || 
                        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && 
                         !document.body.classList.contains('light-theme'));
            Object.values(artalkInstances).forEach(function(instance) {
                instance.setDarkMode(isDark);
            });
        }, 100);
    });
}


