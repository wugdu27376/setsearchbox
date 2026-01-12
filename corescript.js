// 检测是否为电脑端
function isDesktop() {
    return !/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isMobileAndroidApple() {
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 页面加载时恢复保存的选择
document.addEventListener('DOMContentLoaded', function() {
    var savedEngine = localStorage.getItem('selectedEngine');
    if (savedEngine) {
        document.getElementById('engineSelect').value = savedEngine;
    }
    // 如果保存的选择是iFrameFree，则显示iframe容器
    if (savedEngine === 'iFrameFree') {
        document.getElementById('iframeContainer').style.display = 'block';
        document.getElementById('hitokotoDisplay').style.marginTop = '40px';
        document.getElementById('iframeControls').style.display = 'block';
    }
    if (isMobileAndroidApple()) {
        if (savedEngine === 'baiduTw' ||
            savedEngine === 'quarkpcAI' || savedEngine === 'transmartQQTs' || savedEngine === 'dyIsWindows' || savedEngine === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        }
    }
    if (isDesktop()) {
        if (savedEngine === 'sodouyinM' || savedEngine === 'yzmsmM' || savedEngine === 'sotoutiaoM' || savedEngine === 'qksmSearch' || savedEngine === 'baiduMEasy' || savedEngine === 'oldBaiduFanyi' || savedEngine === 'quarkTranslateTools' || savedEngine === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        }
    }
    var savedDirectUrlJumpState = localStorage.getItem('directUrlJumpChecked');
    if (savedDirectUrlJumpState === 'true') {
        document.getElementById('directUrlJumpCheckbox').checked = true;
    }
    var savedShowVisitWebsiteState = localStorage.getItem('showVisitWebsiteChecked');
    if (savedShowVisitWebsiteState === 'true') {
        document.getElementById('showVisitWebsiteCheckbox').checked = true;
    } else if (savedShowVisitWebsiteState === 'false') {
        document.getElementById('showVisitWebsiteCheckbox').checked = false;
    }
    var savedLayoutState = localStorage.getItem('layoutChecked');
    if (savedLayoutState === 'true') {
        var centerBox = document.getElementById('centerBoxDisplay');
        if (centerBox) {
            centerBox.style.display = 'block';
            var savedHeightPercent = localStorage.getItem('heightPercent') || '25%';
            centerBox.style.height = savedHeightPercent;
            centerBox.style.textAlign = 'center';
        }
    }
    // 如果保存的选择是showCheckbox，则显示autoFillhttps div
    if (savedEngine === 'showCheckbox') {
        document.getElementById('autoFillhttps').style.display = 'block';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('urlInput').disabled = true;
        
        // 同时应用保存的布局状态
        var savedLayoutState = localStorage.getItem('layoutChecked');
        if (savedLayoutState === 'true') {
            applyLayoutStyle(true);
        }
    }
    // 初始化用户输入状态
    if (document.getElementById('urlInput').value !== 'https://') {
        document.getElementById('urlInput').dataset.userInput = 'true';
    }
    var iframe = document.getElementById('webFrame');
    var container = document.getElementById('iframeContainer');
    
    function resizeIframe() {
        if (container && iframe) {
            // 获取容器高度并减去30px
            var containerHeight = container.offsetHeight;
            iframe.style.height = (containerHeight - 30) + 'px';
        }
    }
    
    // 初始调整
    resizeIframe();
    
    setTimeout(applyLinkSpacing, 100);
    
    // 窗口大小改变时调整
    window.addEventListener('resize', resizeIframe);
    
    var showLinkChecked = document.getElementById('showLinkCheckbox').checked;
    var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
    
    // 控制时间链接checkbox的可用性
    document.getElementById('showTimeCheckbox').disabled = !showLinkChecked;
    
    if (showLinkChecked && showTimeChecked) {
        showTimeLink();
    }
    
    var showLinkChecked = document.getElementById('showLinkCheckbox').checked;
    var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
    
    // 控制时间链接checkbox的可用性
    document.getElementById('showTimeCheckbox').disabled = !showLinkChecked;
    
    // 初始化时间格式下拉框（如果没有保存的设置，默认为24hours）
    var savedTimeFormat = localStorage.getItem('timeFormat');
    if (!savedTimeFormat) {
        localStorage.setItem('timeFormat', '24hours');
        document.getElementById('timeFormatSelect').value = '24hours';
    }
    
    if (showLinkChecked && showTimeChecked) {
        showTimeLink();
    }
    
    // 加载保存的时间链接设置
    var savedShowTimeState = localStorage.getItem('showTimeChecked');
    if (savedShowTimeState === 'true') {
        document.getElementById('showTimeCheckbox').checked = true;
        // 修改这里：如果时间链接启用，检查是否有原始图片需要隐藏
        var savedOriginalImage = localStorage.getItem('timeLinkOriginalImage');
        if (savedOriginalImage) {
            // 如果有保存的原始图片，暂时从linkImage中移除，避免冲突显示
            localStorage.removeItem('linkImage');
        }
    }
});

// 如果是电脑端，禁用移动搜索选项
if (isDesktop()) {
    document.getElementById('douyinOption').disabled = true;
    document.getElementById('shenmaOption').disabled = true;
    document.getElementById('toutiaoOption').disabled = true;
    document.getElementById('quarksoOption').disabled = true;
    document.getElementById('baidueasyOption').disabled = true;
    document.getElementById('baiduFanyiOption').disabled = true;
    document.getElementById('quarkFanyiOption').disabled = true;
}

if (isMobileAndroidApple()) {
    document.getElementById('quarkaiOption').disabled = true;
    document.getElementById('baidutwOption').disabled = true;
    document.getElementById('douyinpcOption').disabled = true;
    document.getElementById('tencentFanyi2').style.display = 'none';
}

document.getElementById('submitBtn').addEventListener('click', function() {
    var url = document.getElementById('urlInput').value.trim();
    var engine = document.getElementById('engineSelect').value;
    
    // 保存当前选择
    localStorage.setItem('selectedEngine', engine);
    
    // 检测是否启用直接跳转网址功能且输入符合网址格式
    if (document.getElementById('directUrlJumpCheckbox').checked) {
        var inputText = url;
        var isUrlPattern = false;
        
        // 检测网址格式（与搜索建议的检测逻辑保持一致）
        var urlPatterns = [
            /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
            /\.[a-zA-Z]{2,}/,
            /^https?:\/\//,
            /^www\./,
            /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z]{2,}/
        ];
        
        for (var i = 0; i < urlPatterns.length; i++) {
            if (urlPatterns[i].test(inputText)) {
                isUrlPattern = true;
                break;
            }
        }
        
        // 额外检测包含斜杠的网址格式（如 m.baidu.com/xxx）
        if (!isUrlPattern && inputText.indexOf('/') !== -1) {
            var slashIndex = inputText.indexOf('/');
            var beforeSlash = inputText.substring(0, slashIndex);
            
            // 检查斜杠前的内容是否符合网址格式
            for (var i = 0; i < urlPatterns.length; i++) {
                if (urlPatterns[i].test(beforeSlash)) {
                    isUrlPattern = true;
                    break;
                }
            }
        }
        
        // 保存历史记录
        if (inputText && document.getElementById('searchHistoryCheckbox').checked) {
            var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            if (inputText === 'https://' || inputText === 'http://') {
                return;
            }
            // 移除重复项
            var filteredHistory = history.filter(function(item) {
                return item.text !== inputText;
            });
            // 添加到开头
            filteredHistory.unshift({ text: inputText });
            // 限制最多10条记录
            var limitedHistory = filteredHistory.slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
            updateSearchHistory();
        }
        
        // 如果符合网址格式且不包含://，则直接跳转
        if (isUrlPattern && inputText.indexOf('://') === -1 && inputText.indexOf('/') !== 0) {
            var finalUrl = inputText;
            var hasProtocol = finalUrl.indexOf('://') !== -1;
            var isRelativePath = finalUrl.indexOf('/') === 0;
            
            // 根据选择的引擎处理URL
            if (!hasProtocol && !isRelativePath) {
                // 如果没有协议前缀且不是相对路径，根据选择的引擎添加
                if (engine === 'autofillHttp1') {
                    finalUrl = 'http://' + finalUrl;
                } else if (engine === 'autofillHttps') {
                    finalUrl = 'https://' + finalUrl;
                } else if (engine === 'iFrameFree') {
                    finalUrl = 'https://' + finalUrl;
                    document.getElementById('webFrame').src = finalUrl;
                    document.getElementById('iframeContainer').style.display = 'block';
                    return;
                } else {
                    // 默认添加https://
                    finalUrl = 'https://' + finalUrl;
                }
            }
            
            // 搜索后清空输入功能
            if (document.getElementById('clearOnSearchCheckbox').checked && engine !== 'iFrameFree') {
                setTimeout(function() {
                    document.getElementById('urlInput').value = '';
                    // 如果保存输入文本复选框被勾选，同时清空保存的文本
                    if (document.getElementById('saveInputCheckbox').checked) {
                        localStorage.removeItem('savedInputText');
                    }
                }, 0);
            }
            
            // 在submitBtn点击事件开始处添加：
            var isAutoNewTabChecked = document.getElementById('autoNewTabCheckbox').checked;
            var excludedEngines = ['autofillHttp1', 'autofillHttps', 'newtabpageHttp1', 'newtabpageHttps', 'httpsAutoFill', 'iFrameFree'];
            var shouldOpenNewTab = isAutoNewTabChecked && excludedEngines.indexOf(engine) === -1;
            
            // 根据设置决定是否在新标签页打开
            if (shouldOpenNewTab) {
                window.open(finalUrl, '_blank');
            } else {
                window.location.href = finalUrl;
            }
            return; // 直接返回，不执行后续的搜索引擎处理逻辑
        }
    }
    
    // 搜索后清空输入功能
    if (document.getElementById('clearOnSearchCheckbox').checked && engine !== 'iFrameFree') {
        setTimeout(function() {
            document.getElementById('urlInput').value = '';
            // 如果保存输入文本复选框被勾选，同时清空保存的文本
            if (document.getElementById('saveInputCheckbox').checked) {
                localStorage.removeItem('savedInputText');
            }
        }, 0);
    }
    
    // 如果选择iFrameFree且输入了完整URL，直接在iframe中加载
    if (engine === 'iFrameFree' && url.indexOf('://') !== -1) {
        document.getElementById('webFrame').src = url;
        document.getElementById('iframeContainer').style.display = 'block';
        return; // 不执行后续跳转
    }
    
    var searchText = document.getElementById('urlInput').value.trim();
    if (searchText && document.getElementById('searchHistoryCheckbox').checked) {
        var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (searchText === 'https://' || searchText === 'http://') {
            return;
        }
        // 移除重复项
        var filteredHistory = history.filter(function(item) {
            return item.text !== searchText;
        });
        // 添加到开头
        filteredHistory.unshift({ text: searchText });
        // 限制最多10条记录
        var limitedHistory = filteredHistory.slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
        updateSearchHistory();
    }
    
    // 如果保存输入文本复选框被勾选，保存当前输入
    if (document.getElementById('saveInputCheckbox').checked) {
        localStorage.setItem('savedInputText', document.getElementById('urlInput').value.trim());
    }
    
    if (url && url.indexOf('://') === -1) {
        // 根据选择的搜索引擎构建搜索URL
        switch (engine) {
            case 'baidu':
                url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(url);
                break;
            case 'google':
                url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
                break;
            case 'bing':
                url = 'https://www.bing.com/search?q=' + encodeURIComponent(url);
                break;
            case 'sogou':
                url = 'https://www.sogou.com/web?query=' + encodeURIComponent(url);
                break;
            case 'so':
                url = 'https://www.so.com/s?q=' + encodeURIComponent(url);
                break;
            case 'yandex':
                url = 'https://yandex.com/search/?text=' + encodeURIComponent(url);
                break;
            case 'yahooSearch':
                url = 'https://sg.search.yahoo.com/search?p=' + encodeURIComponent(url);
                break;
            case 'autofillHttp1':
                // 自动填充http://前缀
                url = 'http://' + url;
                break;
            case 'autofillHttps':
                // 自动填充https://前缀
                url = 'https://' + url;
                break;
            case 'newtabpageHttp1':
                // 新建标签页处理
                if (url) {
                    // 如果没有协议前缀，添加http://
                    if (url.indexOf('://') === -1) {
                        url = 'http://' + url;
                    }
                    window.open(url, '_blank');
                    return; // 直接返回，不执行下面的跳转
                }
                break;
            case 'newtabpageHttps':
                // 新建标签页处理
                if (url) {
                    // 如果没有协议前缀，添加https://
                    if (url.indexOf('://') === -1) {
                        url = 'https://' + url;
                    }
                    window.open(url, '_blank');
                    return; // 直接返回，不执行下面的跳转
                }
                break;
            case 'httpsAutoFill':
                // 获取输入值
                var inputText = document.getElementById('urlInput').value.trim();
                // 检查是否以https://开头
                if (inputText.indexOf('https://') !== 0) {
                    // 如果没有，自动添加https://
                    inputText = 'https://' + inputText;
                }
                
                // 创建隐藏的表单
                var form = document.createElement('form');
                form.id = 'httpsForm';
                form.action = inputText;
                form.target = '_self';
                form.method = 'post';
                form.style.display = 'none';
                
                // 创建提交按钮
                var submitButton = document.createElement('button');
                submitButton.type = 'submit';
                
                // 将按钮添加到表单
                form.appendChild(submitButton);
                
                // 将表单添加到页面并提交
                document.body.appendChild(form);
                form.submit();
                
                // 移除表单
                document.body.removeChild(form);
                return; // 直接返回，不执行后续跳转
                break;
            case 'duckduckgo':
                url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
                break;
            case 'sodouyinM':
                url = 'https://so.douyin.com/s?keyword=' + encodeURIComponent(url);
                break;
            case 'yzmsmM':
                url = 'https://yz.m.sm.cn/s?q=' + encodeURIComponent(url);
                break;
            case 'sotoutiaoM':
                url = 'https://so.toutiao.com/search?keyword=' + encodeURIComponent(url);
                break;
            case 'qksmSearch':
                url = 'https://quark.sm.cn/s?q=' + encodeURIComponent(url);
                break;
            case 'baiduMEasy':
                url = 'https://m.baidu.com/from=1030335w/pu=sz%401321_1001/s?word=' + encodeURIComponent(url);
                break;
            case 'metasosuoAI':
                url = 'https://metaso.cn/?s=nyzav&referrer_s=nyzav&q=' + encodeURIComponent(url);
                break;
            case 'baiduAI':
                url = 'https://chat.baidu.com/search?word=' + encodeURIComponent(url);
                break;
            case '360namisoAI':
                url = 'https://www.n.cn/?src=360ai_so&s_type=l&q=' + encodeURIComponent(url);
                break;
            case 'zhihuZhiDaAI':
                url = 'https://zhida.zhihu.com/search?q=' + encodeURIComponent(url);
                break;
            case 'quarkpcAI':
                url = 'https://ai.quark.cn/s?ch=pcquark%40homepage_quarkweb&q=' + encodeURIComponent(url) + '&frame_scene=deep_think_light_r1lite&by=deepthink_light';
                break;
            case 'googleTranslate':
                url = 'https://translate.google.com/?sl=auto&tl=zh-CN&text=' + encodeURIComponent(url);
                break;
            case 'mcTranslator':
                url = 'https://cn.bing.com/translator?text=' + encodeURIComponent(url) + '&from=en&to=zh-Hans';
                break;
            case 'yandexTranslate':
                url = 'https://translate.yandex.com/?source_lang=en&target_lang=zh&text=' + encodeURIComponent(url);
                break;
            case 'sogouFanyi':
                url = 'https://fanyi.sogou.com/text?fr=default&keyword=' + encodeURIComponent(url);
                break;
            case 'oldBaiduFanyi':
                url = 'https://fanyi.baidu.com/translate#auto/zh/' + encodeURIComponent(url);
                break;
            case 'fanyiSo':
                url = 'https://fanyi.so.com/#' + encodeURIComponent(url);
                break;
            case 'quarkTranslateTools':
                url = 'https://vt.quark.cn/blm/translation-486/translate?query=' + encodeURIComponent(url) + '&source_language=detect&target_language=zh&from=douyin';
                break;
            case 'volcTranslate':
                url = 'https://translate.volcengine.com/mobile?text=' + encodeURIComponent(url) + '&source_language=detect&target_language=zh&from=douyin';
                break;
            case 'transmartQQTs':
                url = 'https://transmart.qq.com/zh-CN/index?sourcelang=auto&targetlang=zh&source=' + encodeURIComponent(url);
                break;
            case 'taobaoWeb':
                if (isMobileAndroidApple()) {
                    url = 'https://main.m.taobao.com/search/index.html?q=' + encodeURIComponent(url);
                } else {
                    url = 'https://s.taobao.com/search?q=' + encodeURIComponent(url);
                }
                break;
            case 'jdWebPage':
                if (isMobileAndroidApple()) {
                    url = 'https://so.m.jd.com/ware/search.action?keyword=' + encodeURIComponent(url);
                } else {
                    url = 'https://search.jd.com/Search?keyword=' + encodeURIComponent(url);
                }
                break;
            case 'githubCode':
                url = 'https://github.com/search?q=' + encodeURIComponent(url);
                break;
            case 'baiduTw':
                url = 'https://www.baidu.com/s?cl=3&tn=baidubig5&ie=utf8&wd=' + encodeURIComponent(url);
                break;
            case 'biliTv':
                url = 'http://search.bilibili.com/all?keyword=' + encodeURIComponent(url);
                break;
            case 'dyIsWindows':
                url = 'https://www.douyin.com/root/search/' + encodeURIComponent(url);
                break;
            case 'haokanVideo':
                if (isMobileAndroidApple()) {
                    url = 'https://haokan.baidu.com/videoui/page/search/result?searchword=' + encodeURIComponent(url);
                } else {
                    url = 'https://haokan.baidu.com/web/search/page?query=' + encodeURIComponent(url);
                }
                break;
            case 'zhihuFriends':
                url = 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(url);
                break;
            case 'csdnWebPage':
                if (isMobileAndroidApple()) {
                    url = 'https://so.csdn.net/so/search?q=' + encodeURIComponent(url);
                } else {
                    url = 'https://so.csdn.net/so/search?spm=0&q=' + encodeURIComponent(url);
                }
                break;
            case 'weiboFriends':
                url = 'https://s.weibo.com/weibo?q=' + encodeURIComponent(url);
                break;
            case 'bdZhidao':
                if (isMobileAndroidApple()) {
                    url = 'https://zhidao.baidu.com/index?word=' + encodeURIComponent(url);
                } else {
                    url = 'https://zhidao.baidu.com/search?word=' + encodeURIComponent(url);
                }
                break;
            case 'showCheckbox':
                url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(url);
                break;
            case 'kfBaidu':
                url = 'https://kaifa.baidu.com/searchPage?wd=' + encodeURIComponent(url);
                break;
            case 'weixinSogou':
                if (isMobileAndroidApple()) {
                    url = 'https://weixin.sogou.com/weixinwap?type=2&query=' + encodeURIComponent(url);
                } else {
                    url = 'https://weixin.sogou.com/weixin?type=2&query=' + encodeURIComponent(url);
                }
                break;
            case 'baidu_0':
                url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(url);
                break;
            case 'customSearch':
                var customSearchUrl = localStorage.getItem('customSearchUrl');
                if (customSearchUrl) {
                    url = customSearchUrl.replace('{keywords}', encodeURIComponent(url));
                } else {
                    url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(url);
                }
                break;
            default:
                if (engine.indexOf('customSearch_') === 0) {
                    var order = parseInt(engine.split('_')[1]);
                    var customSearches = JSON.parse(localStorage.getItem('customSearches') || '[]');
                    var customSearch = null;
                    for (var i = 0; i < customSearches.length; i++) {
                        if (customSearches[i].order === order) {
                            customSearch = customSearches[i];
                            break;
                        }
                    }
                    if (customSearch) {
                        url = customSearch.url.replace('{keywords}', encodeURIComponent(url));
                    } else {
                        url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(url);
                    }
                }
                break;
            case 'iFrameFree':
                // 在iframe中加载网页
                if (url && url.indexOf('://') === -1) {
                    url = 'https://' + url;
                }
                if (url) {
                    document.getElementById('webFrame').src = url;
                    document.getElementById('iframeContainer').style.display = 'block';
                }
                return; // 不执行页面跳转
        }
    } else if (url) {
        // 如果包含://，直接使用输入的URL
        // 无需修改
    }
    
    if (localStorage.getItem('focusCheckboxChecked') === 'true') {
        document.body.classList.remove('focused');
        document.querySelector('.search-container').classList.remove('focused');
        document.getElementById('quickInputBtn').style.display = 'none';
        document.getElementById('hitokotoDisplay').style.display = 'block';
        document.getElementById('searchContainer').style.marginTop = savedSearchContainerMargin;
        // 恢复iframe显示（仅在iFrameFree选中时）
        if (document.getElementById('engineSelect').value === 'iFrameFree') {
            document.getElementById('iframeContainer').style.display = 'block';
        }
        if (document.getElementById('layoutCheckbox').checked) {
            document.getElementById('centerBoxDisplay').style.display = 'block';
        }
    }
    
    // 在submitBtn点击事件开始处添加：
    var isAutoNewTabChecked = document.getElementById('autoNewTabCheckbox').checked;
    var excludedEngines = ['autofillHttp1', 'autofillHttps', 'newtabpageHttp1', 'newtabpageHttps', 'iFrameFree'];
    var shouldOpenNewTab = isAutoNewTabChecked && excludedEngines.indexOf(engine) === -1;
    
    // 在最后的跳转逻辑处修改：
    if (url) {
        // 对于新建标签页选项，如果输入为空则不执行任何操作
        if (engine === 'newtabpage' && !url) {
            return;
        }
        
        // 根据设置决定是否在新标签页打开
        if (shouldOpenNewTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }
});
// 重新自定义搜索网址文字点击事件
document.querySelector('label[for="redefineSearchBtn"]').addEventListener('click', function() {
    var customSearches = JSON.parse(localStorage.getItem('customSearches') || '[]');
    var savedCustomSearchName = localStorage.getItem('customSearchName') || '自定义';
    var defaultSearch = null;
    for (var i = 0; i < customSearches.length; i++) {
        if (customSearches[i].order === 0) {
            defaultSearch = customSearches[i];
            break;
        }
    }
    if (!defaultSearch) {
        defaultSearch = { name: savedCustomSearchName, url: localStorage.getItem('customSearchUrl') || 'https://www.baidu.com/s?wd={keywords}', order: 0 };
    }
    
    showCustomDoubleInput(
        '创建/修改自定义搜索',
        '输入选项名称 {数值}（数值0为默认，输入0以外数值自动创建自定义搜索选项，但输入选项名称为空时删除当前新建自定义搜索选项）',
        '输入搜索网址（使用{keywords}作为占位符）',
        defaultSearch.name + ' {' + defaultSearch.order + '}',
        defaultSearch.url,
        function(nameInput, urlInput) {
            if (nameInput === null || urlInput === null) return;
            
            // 解析名称和排序数值
            var nameMatch = nameInput.match(/^(.*)\s*\{(\d+)\}$/);
            var name = nameMatch ? nameMatch[1].trim() : nameInput.trim();
            var order = nameMatch ? parseInt(nameMatch[2]) : 0;
            
            // 检查是否只有{0}时恢复默认名称
            if (name === '' && order === 0) {
                name = '自定义';
            }
            
            if (name === '' || urlInput === '') {
                // 输入为空时移除该选项
                var updatedSearches = customSearches.filter(function(item) {
                    return item.order !== order;
                });
                localStorage.setItem('customSearches', JSON.stringify(updatedSearches));
                // 如果是order为0，同时清除customSearchUrl
                if (order === 0) {
                    localStorage.removeItem('customSearchUrl');
                    localStorage.removeItem('customSearchName');
                    customSearchOption.textContent = '自定义';
                }
                updateCustomSearchOptions();
            } else if (order === 0) {
                // order为0时只更新customSearchUrl和选项名称，不创建新选项
                localStorage.setItem('customSearchUrl', urlInput);
                // 保存customSearch选项名称
                localStorage.setItem('customSearchName', name);
                updateCustomSearchOptions();
            } else if (urlInput.indexOf('{keywords}') !== -1) {
                // 更新或添加自定义搜索
                var existingIndex = -1;
                for (var i = 0; i < customSearches.length; i++) {
                    if (customSearches[i].order === order) {
                        existingIndex = i;
                        break;
                    }
                }
                if (existingIndex !== -1) {
                    customSearches[existingIndex] = { name: name, url: urlInput, order: order };
                } else {
                    customSearches.push({ name: name, url: urlInput, order: order });
                }
                
                // 按order数值从小到大排序
                customSearches.sort(function(a, b) {
                    return a.order - b.order;
                });
                localStorage.setItem('customSearches', JSON.stringify(customSearches));
                updateCustomSearchOptions();
            }
            // 检查数字是否已存在（除了当前编辑的order为0的情况）
            if (order !== 0) {
                var existingWithSameOrder = null;
                for (var i = 0; i < customSearches.length; i++) {
                    if (customSearches[i].order === order) {
                        existingWithSameOrder = customSearches[i];
                        break;
                    }
                }
                if (existingWithSameOrder) {
                    if (name === '' || urlInput === '') {
                        // 输入为空时移除该选项
                        var updatedSearches = customSearches.filter(function(item) {
                            return item.order !== order;
                        });
                        localStorage.setItem('customSearches', JSON.stringify(updatedSearches));
                        updateCustomSearchOptions();
                        return;
                    } else if (urlInput.indexOf('{keywords}') !== -1) {
                        // 替换已存在选项
                        var existingIndex = -1;
                        for (var i = 0; i < customSearches.length; i++) {
                            if (customSearches[i].order === order) {
                                existingIndex = i;
                                break;
                            }
                        }
                        customSearches[existingIndex] = { name: name, url: urlInput, order: order };
                        
                        // 按order数字从小到大排序
                        customSearches.sort(function(a, b) {
                            return a.order - b.order;
                        });
                        localStorage.setItem('customSearches', JSON.stringify(customSearches));
                        updateCustomSearchOptions();
                        return;
                    }
                }
            }
        }
    );
});

// 保存和加载clearOnSearchCheckbox状态
var savedClearOnSearchState = localStorage.getItem('clearOnSearchChecked');
if (savedClearOnSearchState === 'true') {
    document.getElementById('clearOnSearchCheckbox').checked = true;
}

// 监听clearOnSearchCheckbox变化
document.getElementById('clearOnSearchCheckbox').addEventListener('change', function() {
    localStorage.setItem('clearOnSearchChecked', this.checked);
});

// 更新自定义搜索选项
function updateCustomSearchOptions() {
    var customSearches = JSON.parse(localStorage.getItem('customSearches') || '[]');
    var engineSelect = document.getElementById('engineSelect');
    
    // 移除所有自定义搜索选项（除了默认的customSearch）
    var optionsToRemove = [];
    for (var i = 0; i < engineSelect.options.length; i++) {
        if (engineSelect.options[i].value.indexOf('customSearch_') === 0) {
            optionsToRemove.push(i);
        }
    }
    // 更新customSearch选项名称
    var savedCustomSearchName = localStorage.getItem('customSearchName');
    if (savedCustomSearchName) {
        var customSearchOption = document.getElementById('customSearchOption');
        if (customSearchOption) {
            customSearchOption.textContent = savedCustomSearchName;
        }
    }
    // 从后往前移除避免索引变化
    optionsToRemove.reverse().forEach(function(index) {
        engineSelect.remove(index);
    });
    
    // 添加自定义搜索选项
    customSearches.forEach(function(item) {
        var option = document.createElement('option');
        option.value = 'customSearch_' + item.order;
        option.textContent = item.name;
        // 插入到最后一个自定义搜索选项后面
        var existingCustomOptions = engineSelect.querySelectorAll('option[value^="customSearch_"]');
        if (existingCustomOptions.length > 0) {
            var lastCustomOption = existingCustomOptions[existingCustomOptions.length - 1];
            lastCustomOption.parentNode.insertBefore(option, lastCustomOption.nextSibling);
        } else {
            // 如果没有自定义选项，插入到customSearch选项后面
            var customSearchOption = engineSelect.querySelector('option[value="customSearch"]');
            if (customSearchOption) {
                customSearchOption.parentNode.insertBefore(option, customSearchOption.nextSibling);
            }
        }
    });
}

// 在页面加载时更新自定义搜索选项
document.addEventListener('DOMContentLoaded', function() {
    updateCustomSearchOptions();
    // 恢复自定义搜索选项的选择状态
    var savedCustomSearch = localStorage.getItem('selectedCustomSearch');
    if (savedCustomSearch) {
        document.getElementById('engineSelect').value = savedCustomSearch;
    }
    // 恢复自定义搜索{0}的名称和网址
    var savedCustomSearchName = localStorage.getItem('customSearchName');
    if (savedCustomSearchName) {
        document.getElementById('customSearchOption').textContent = savedCustomSearchName;
    }
    var customSearchUrl = localStorage.getItem('customSearchUrl');
    if (customSearchUrl) {
        // 确保customSearch选项可用
        showCustomSearchButton();
    }
});

// 清除所有自定义搜索功能
document.querySelector('label[for="clearCustomSearchesBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要清除所有自定义搜索吗？', function(result) {
        if (result) {
            customSearchOption.textContent = '自定义';
            localStorage.removeItem('customSearches');
            localStorage.removeItem('customSearchUrl');
            localStorage.removeItem('customSearchName');
            localStorage.removeItem('selectedCustomSearch');
            updateCustomSearchOptions();
        }
    });
});

// 监听选择变化并保存
document.getElementById('engineSelect').addEventListener('change', function() {
    localStorage.setItem('selectedEngine', this.value);
    // 根据选择显示或隐藏 checkbox
    if (this.value === 'showCheckbox') {
        document.getElementById('autoFillhttps').style.display = 'block';
        submitBtn.disabled = true;
        urlInput.disabled = true;
    } else {
        document.getElementById('autoFillhttps').style.display = 'none';
        submitBtn.disabled = false;
        urlInput.disabled = false;
    }
    // 控制iframe显示
    if (this.value === 'iFrameFree') {
        document.getElementById('iframeContainer').style.display = 'block';
        document.getElementById('hitokotoDisplay').style.marginTop = '40px';
        document.getElementById('iframeControls').style.display = 'block';
    } else {
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('hitokotoDisplay').style.marginTop = '10px';
        document.getElementById('iframeControls').style.display = 'none';
    }
    // 根据选择显示或隐藏 checkbox
    if (this.value === 'showCheckbox') {
        document.getElementById('autoFillhttps').style.display = 'block';
        var savedLayoutState = localStorage.getItem('layoutChecked');
        if (savedLayoutState === 'true') {
            applyLayoutStyle(true);
        }
    } else {
        document.getElementById('autoFillhttps').style.display = 'none';
        var savedLayoutState = localStorage.getItem('layoutChecked');
        if (savedLayoutState !== 'true') {
            applyLayoutStyle(false);
        }
    }
    if (isMobileAndroidApple()) {
        if (this.value === 'baiduTw' ||
            this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || this.value === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        } else {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('urlInput').disabled = false;
        }
    }
    if (isDesktop()) {
        if (this.value === 'sodouyinM' || this.value === 'yzmsmM' ||
            this.value === 'sotoutiaoM' || this.value === 'qksmSearch' || this.value === 'baiduMEasy' || this.value === 'oldBaiduFanyi' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        } else {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('urlInput').disabled = false;
        }
    }
    if (this.value === 'showCheckbox') {
        document.getElementById('autoFillhttps').style.display = 'block';
        linkCreatorBtn.style.display = 'inline-block';
    } else {
        document.getElementById('autoFillhttps').style.display = 'none';
        linkCreatorBtn.style.display = 'none';
        document.getElementById('linkCreatorPanel').style.display = 'none';
    }
    // 保存自定义搜索选项的选择状态
    if (this.value.indexOf('customSearch_') === 0 || this.value === 'customSearch') {
        localStorage.setItem('selectedCustomSearch', this.value);
    } else {
        localStorage.removeItem('selectedCustomSearch');
    }
    // 无论选择什么，都更新快捷链接显示
    updateQuickLinks();
    var currentValue = this.value;
    localStorage.setItem('selectedEngine', currentValue);
    
    // 如果选择customSearch，检查是否已设置自定义搜索网址
    if (currentValue === 'customSearch') {
        var customSearchUrl = localStorage.getItem('customSearchUrl');
        if (!customSearchUrl) {
            // 首次选择，提示输入自定义搜索网址
            var newCustomSearchUrl = prompt('请输入自定义搜索网址（使用{keywords}作为搜索词占位符）：', 'https://www.baidu.com/s?wd={keywords}');
            if (newCustomSearchUrl === null) {
                // 用户点击取消，恢复之前的选择
                var previousEngine = localStorage.getItem('previousEngine') || 'baidu';
                this.value = previousEngine;
                localStorage.setItem('selectedEngine', previousEngine);
                if (previousEngine.indexOf('customSearch_') === 0) {
                    localStorage.setItem('selectedCustomSearch', previousEngine);
                }
                if (previousEngine.indexOf('customSearch_') !== 0) {
                    localStorage.removeItem('selectedCustomSearch');
                }
                if (document.getElementById('engineSelect').value === 'showCheckbox') {
                    linkCreatorBtn.style.display = 'inline-block';
                    updateQuickLinks();
                    document.getElementById('autoFillhttps').style.display = 'block';
                    submitBtn.disabled = true;
                    urlInput.disabled = true;
                }
                if (document.getElementById('engineSelect').value === 'iFrameFree') {
                    document.getElementById('iframeContainer').style.display = 'block';
                }
                if (isMobileAndroidApple()) {
                    if (this.value === 'baiduTw' ||
                        this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                if (isDesktop()) {
                    if (this.value === 'sodouyinM' || this.value === 'yzmsmM' ||
                        this.value === 'sotoutiaoM' || this.value === 'qksmSearch' || this.value === 'baiduMEasy' || this.value === 'oldBaiduFanyi' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                return;
            }
            if (newCustomSearchUrl && newCustomSearchUrl.indexOf('{keywords}') !== -1) {
                localStorage.setItem('customSearchUrl', newCustomSearchUrl);
                showCustomSearchButton();
            } else {
                // 网址格式不正确，恢复之前的选择
                var previousEngine = localStorage.getItem('previousEngine') || 'baidu';
                this.value = previousEngine;
                localStorage.setItem('selectedEngine', previousEngine);
                if (previousEngine.indexOf('customSearch_') === 0) {
                    localStorage.setItem('selectedCustomSearch', previousEngine);
                }
                if (previousEngine.indexOf('customSearch_') !== 0) {
                    localStorage.removeItem('selectedCustomSearch');
                }
                if (document.getElementById('engineSelect').value === 'showCheckbox') {
                    linkCreatorBtn.style.display = 'inline-block';
                    updateQuickLinks();
                    document.getElementById('autoFillhttps').style.display = 'block';
                    submitBtn.disabled = true;
                    urlInput.disabled = true;
                }
                if (document.getElementById('engineSelect').value === 'iFrameFree') {
                    document.getElementById('iframeContainer').style.display = 'block';
                }
                if (isMobileAndroidApple()) {
                    if (this.value === 'baiduTw' ||
                        this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                if (isDesktop()) {
                    if (this.value === 'sodouyinM' || this.value === 'yzmsmM' ||
                        this.value === 'sotoutiaoM' || this.value === 'qksmSearch' || this.value === 'baiduMEasy' || this.value === 'oldBaiduFanyi' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                return;
            }
        } else {
            showCustomSearchButton();
        }
    } else {
        // 保存当前选择作为previousEngine，用于customSearch取消时恢复
        localStorage.setItem('previousEngine', currentValue);
        hideCustomSearchButton();
    }
});

// 保存和加载focusCheckbox状态
var savedFocusCheckboxState = localStorage.getItem('focusCheckboxChecked');
if (savedFocusCheckboxState === 'true') {
    document.getElementById('focusCheckbox').checked = true;
    document.getElementById('quickInputCheckbox').disabled = false;
    // 监听输入框聚焦时的高度变化，调整quickInputUi位置
    document.getElementById('urlInput').addEventListener('focus', function() {
        adjustQuickInputPosition();
        document.body.classList.add('focused');
        document.querySelector('.search-container').classList.add('focused');
        document.getElementById('quickInputBtn').style.display = 'block';
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('centerBoxDisplay').style.display = 'none';
        document.getElementById('searchContainer').style.marginTop = '0';
        
        // 添加高度检测和间距调整
        var inputHeight = parseInt(getComputedStyle(this).height);
        var submitBtnHeight = parseInt(getComputedStyle(document.getElementById('submitBtn')).height);
        var maxHeight = Math.max(inputHeight, submitBtnHeight);
        
        if (maxHeight > 24) {
            var extraSpace = maxHeight - 24;
            document.getElementById('quickInputBtn').style.marginTop = (0 + extraSpace) + 'px';
        } else {
            document.getElementById('quickInputBtn').style.marginTop = '0px';
        }
        
        // 检查是否启用了自动选择https文本功能
        var isSelectHttpsTextChecked = localStorage.getItem('selectHttpsTextChecked') === 'true';
        var isAutoFillHttpsChecked = localStorage.getItem('autoFillHttpsChecked') === 'true';
        
        // 只有当所有条件满足且用户没有手动输入时才自动选择
        if (isSelectHttpsTextChecked && isAutoFillHttpsChecked &&
            this.value === 'https://' && !this.dataset.userInput) {
            this.select(); // 自动选择所有文本
        }
    });
}

// 监听focusCheckbox变化
document.getElementById('focusCheckbox').addEventListener('change', function() {
    localStorage.setItem('focusCheckboxChecked', this.checked);
    document.getElementById('quickInputCheckbox').disabled = !this.checked;
});

var urlInput = document.getElementById('urlInput');
var quickInputBtn = document.getElementById('quickInputBtn');
var buttons = quickInputBtn.querySelectorAll('button');

// 为所有键盘按钮添加点击事件
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
        var id = this.id; // 改为获取id
        
        // 处理光标位置按钮
        if (id.indexOf('pos_') === 0) { // 改为判断id前缀
            var currentPos = urlInput.selectionStart;
            var newPos = currentPos;
            
            if (id === 'pos_plus1') newPos = currentPos + 1; // 改为使用id判断
            else if (id === 'pos_minus1') newPos = Math.max(0, currentPos - 1); // 改为使用id判断
            else if (id === 'pos_plus10') newPos = currentPos + 10; // 改为使用id判断
            else if (id === 'pos_minus10') newPos = Math.max(0, currentPos - 10); // 改为使用id判断
            else if (id === 'pos_plusInf') newPos = urlInput.value.length; // 改为使用id判断
            else if (id === 'pos_minusInf') newPos = 0; // 改为使用id判断
            
            // 设置新的光标位置
            urlInput.setSelectionRange(newPos, newPos);
        } else {
            var text = this.textContent; // 其他按钮仍然使用文本
            
            // 标记用户已经开始输入
            urlInput.dataset.userInput = 'true';
            
            // 替换选中文本的逻辑
            var selectionStart = urlInput.selectionStart;
            var selectionEnd = urlInput.selectionEnd;
            var currentValue = urlInput.value;
            
            // 如果有选中文本，则替换选中部分
            if (selectionStart !== selectionEnd) {
                urlInput.value = currentValue.substring(0, selectionStart) + text + currentValue.substring(selectionEnd);
                // 将光标移动到插入文本之后
                urlInput.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
            } else {
                // 原有逻辑：在当前位置插入文本
                urlInput.value = currentValue.substring(0, selectionStart) + text + currentValue.substring(selectionStart);
                // 将光标移动到插入文本之后
                urlInput.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
            }
        }
        urlInput.focus();
        // 更新搜索建议
        fetchSearchSuggestions(urlInput.value);
        setTimeout(function() {
            if (document.getElementById('searchSuggestionsCheckbox').checked) {
                searchSuggestions.style.display = 'block';
                fetchSearchSuggestions(urlInput.value);
            }
        }, 100);
        // 如果保存输入文本复选框被勾选，保存当前输入
        if (document.getElementById('saveInputCheckbox').checked) {
            localStorage.setItem('savedInputText', urlInput.value);
        }
    });
}

// 保存和加载autoNewTabCheckbox状态
var savedAutoNewTabState = localStorage.getItem('autoNewTabChecked');
if (savedAutoNewTabState === 'true') {
    document.getElementById('autoNewTabCheckbox').checked = true;
}

// 监听autoNewTabCheckbox变化
document.getElementById('autoNewTabCheckbox').addEventListener('change', function() {
    localStorage.setItem('autoNewTabChecked', this.checked);
});

// 链接颜色控制
document.querySelector('label[for="linkColorPicker"]').addEventListener('click', function() {
    var savedLinkImage = localStorage.getItem('linkImage');
    if (savedLinkImage) {
        // 当前使用图片，直接弹出图片URL输入框
        var currentImage = localStorage.getItem('linkImage') || '';
        showCustomModal('请输入图片URL：', currentImage, function(imageUrl) {
            if (imageUrl && imageUrl.trim() !== '') {
                var linkElement = document.getElementById('85727544071588039023');
                var linkSize = localStorage.getItem('linkSize') || '30px';
                linkElement.innerHTML = '<img src="' + imageUrl + '" style="width: auto; height: auto; max-width: ' + linkSize + '; max-height: ' + linkSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
                document.getElementById('linkColorValue').textContent = 'Image';
                localStorage.setItem('linkImage', imageUrl);
            } else if (imageUrl === '') {
                // 输入为空时恢复默认颜色
                var defaultColor = '#0000ee';
                var linkElement = document.getElementById('85727544071588039023');
                linkElement.style.color = defaultColor;
                linkElement.innerHTML = 'Baidu.com';
                document.getElementById('linkColorValue').textContent = defaultColor;
                localStorage.setItem('linkColor', defaultColor);
                localStorage.removeItem('linkImage');
            }
        });
        return;
    }
    if (!document.getElementById('showLinkCheckbox').checked) {
        return;
    }
    var currentColor = localStorage.getItem('linkColor') || '#0000ee';
    var currentLinkValue = localStorage.getItem('linkColor') || '#0000ee';
    showCustomModal('请输入快捷链接颜色值（如 #0000ee 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);try{var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';colorPicker.value=\'' + currentColor + '\';colorPicker.style.position=\'fixed\';colorPicker.style.left=\'50%\';colorPicker.style.top=\'50%\';colorPicker.style.transform=\'translate(-50%,-50%)\';colorPicker.style.width=\'1px\';colorPicker.style.height=\'1px\';colorPicker.style.opacity=\'0.001\';colorPicker.style.zIndex=\'10001\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){colorPicker.focus&&colorPicker.focus();colorPicker.click&&colorPicker.click();},50);}catch(e){}}return false;">调色盘</a>。或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){input.value=\'image url\';var labels=document.querySelectorAll(\'label[onclick*=\\\'modalCallback_\\\']\');if(labels.length>0){labels[labels.length-1].click();}}}return false;">图片</a> <span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-left: 5px;margin-bottom: 1px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentLinkValue, function(newValue) {
        if (newValue !== null) {
            if (newValue === '') {
                // 输入为空时恢复默认颜色
                var defaultColor = '#0000ee';
                var linkElement = document.getElementById('85727544071588039023');
                linkElement.style.color = defaultColor;
                linkElement.innerHTML = 'Baidu.com';
                document.getElementById('linkColorValue').textContent = defaultColor;
                localStorage.setItem('linkColor', defaultColor);
                localStorage.removeItem('linkImage');
            } else if (newValue.toLowerCase() === 'image url') {
                var currentImage = localStorage.getItem('linkImage') || '';
                showCustomModal('请输入图片URL：', currentImage, function(imageUrl) {
                    if (imageUrl && imageUrl.trim() !== '') {
                        var linkElement = document.getElementById('85727544071588039023');
                        var linkSize = localStorage.getItem('linkSize') || '30px';
                        linkElement.innerHTML = '<img src="' + imageUrl + '" style="width: auto; height: auto; max-width: ' + linkSize + '; max-height: ' + linkSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
                        document.getElementById('linkColorValue').textContent = 'Image';
                        localStorage.setItem('linkImage', imageUrl);
                        if (!localStorage.getItem('36156798756549916136')) {
                            localStorage.setItem('36156798756549916136', 'true');
                        }
                    } else if (imageUrl === '') {
                        // 输入为空时恢复默认颜色
                        var defaultColor = '#0000ee';
                        var linkElement = document.getElementById('85727544071588039023');
                        linkElement.style.color = defaultColor;
                        linkElement.innerHTML = 'Baidu.com';
                        document.getElementById('linkColorValue').textContent = defaultColor;
                        localStorage.setItem('linkColor', defaultColor);
                        localStorage.removeItem('linkImage');
                    }
                });
            } else if (/^#([0-9A-F]{3,6})$/i.test(newValue) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue) || /^[a-z]+$/i.test(newValue) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue)) {
                var linkElement = document.getElementById('85727544071588039023');
                linkElement.style.color = newValue;
                linkElement.innerHTML = 'Baidu.com';
                document.getElementById('linkColorValue').textContent = newValue;
                localStorage.setItem('linkColor', newValue);
                localStorage.removeItem('linkImage');
                truncateText('linkColorValue', newValue, 80);
                
                // 首次修改链接颜色时添加active样式
                if (!localStorage.getItem('linkActiveStyleAdded')) {
                    var linkStyle = document.createElement('style');
                    linkStyle.textContent = 'a:active.link-85727544071588039023 { color: #ff0000 !important; }';
                    document.head.appendChild(linkStyle);
                    localStorage.setItem('linkActiveStyleAdded', 'true');
                }
            }
        }
    });
});

// 加载保存的图片链接（优先检查图片）
var savedLinkImage = localStorage.getItem('linkImage');
if (savedLinkImage) {
    setTimeout(function() {
        var linkElement = document.getElementById('85727544071588039023');
        var linkSize = localStorage.getItem('linkSize') || '30px';
        
        // 创建图片元素并添加加载失败处理
        var img = new Image();
        img.onload = function() {
            linkElement.innerHTML = '<img src="' + savedLinkImage + '" style="max-width: ' + linkSize + '; height: auto; display: block; left: 0; right: 0; margin: 0 auto;">';
            document.getElementById('linkColorValue').textContent = 'Image';
            // 添加链接激活状态样式
            var linkStyle = document.createElement('style');
            linkStyle.textContent = 'a:active.link-85727544071588039023 { color: #ff0000 !important; }';
            document.head.appendChild(linkStyle);
        };
        img.onerror = function() {
            linkElement.innerHTML = '';
            document.getElementById('linkColorValue').textContent = 'Image';
        };
        img.src = savedLinkImage;
    }, 0);
} else {
    // 加载保存的链接颜色
    var savedLinkColor = localStorage.getItem('linkColor');
    if (savedLinkColor) {
        var linkElement = document.getElementById('85727544071588039023');
        linkElement.style.color = savedLinkColor;
        document.getElementById('linkColorValue').textContent = savedLinkColor;
        // 添加链接激活状态样式
        var linkStyle = document.createElement('style');
        linkStyle.textContent = 'a:active.link-85727544071588039023 { color: #ff0000 !important; }';
        document.head.appendChild(linkStyle);
    }
}

// 添加重命名功能
document.querySelector('label[for="renameLinkBtn"]').addEventListener('click', function() {
    if (!document.getElementById('showLinkCheckbox').checked) {
        return;
    }
    if (document.getElementById('showTimeCheckbox').checked) {
        return;
    }
    var linkElement = document.getElementById('85727544071588039023');
    var currentName = linkElement.textContent;
    showCustomModal('请输入链接名称：', currentName, function(newName) {
        if (newName === null) {
            return;
        }
        if (newName === '') {
            // 输入为空时恢复默认名称
            var defaultName = 'Baidu.com';
            linkElement.textContent = defaultName;
            document.getElementById('linkNameValue').textContent = defaultName;
            localStorage.setItem('linkName', defaultName);
        } else if (newName.trim() !== '') {
            linkElement.textContent = newName.trim();
            document.getElementById('linkNameValue').textContent = newName.trim();
            localStorage.setItem('linkName', newName.trim());
            truncateText('linkNameValue', newName.trim(), 100);
            if (!localStorage.getItem('36156798756549916136')) {
                localStorage.setItem('36156798756549916136', 'true');
            }
        }
    });
});

// 重置链接颜色和名称
document.getElementById('resetLinkColorBtn').addEventListener('click', function() {
    if (!document.getElementById('showLinkCheckbox').checked) {
        return;
    }
    showCustomConfirm('确定要重置链接样式吗？', function(result) {
        if (result) {
            // 重置链接颜色
            var linkElement = document.getElementById('85727544071588039023');
            linkElement.style.color = '#0000ee';
            document.getElementById('linkColorValue').textContent = '#0000ee';
            localStorage.setItem('linkColor', '#0000ee');
            
            // 重置链接名称
            linkElement.textContent = 'Baidu.com';
            document.getElementById('linkNameValue').textContent = 'Baidu.com';
            localStorage.setItem('linkName', 'Baidu.com');
            // 重置链接字体大小
            linkElement.style.fontSize = '30px';
            document.getElementById('linkSizeValue').textContent = '30px';
            localStorage.setItem('linkSize', '30px');
            // 重置图片链接
            localStorage.removeItem('linkImage');
        }
    });
});

// 加载保存的链接名称
var savedLinkName = localStorage.getItem('linkName');
if (savedLinkName) {
    var linkElement = document.getElementById('85727544071588039023');
    linkElement.textContent = savedLinkName;
    document.getElementById('linkNameValue').textContent = savedLinkName;
}

// searchContainer边距调整功能
document.querySelector('label[for="searchContainerMarginPicker"]').addEventListener('click', function() {
    var currentMargin = localStorage.getItem('searchContainerMargin') || 'Default';
    showCustomModal('请输入搜索框边距值（如 20px、5%，输入空值恢复默认）：',
        currentMargin === 'Default' ? '' : currentMargin,
        function(newMargin) {
            if (newMargin === '') {
                // 输入为空时恢复默认边距
                document.getElementById('searchContainer').style.marginTop = '';
                document.getElementById('searchContainerMarginValue').textContent = 'Default';
                localStorage.setItem('searchContainerMargin', 'Default');
            } else if (/^\d+(\.\d+)?(px|in|mm|pt|%)$/.test(newMargin)) {
                document.getElementById('searchContainer').style.marginTop = newMargin;
                document.getElementById('searchContainerMarginValue').textContent = newMargin;
                localStorage.setItem('searchContainerMargin', newMargin);
            }
        });
});

// 加载保存的searchContainer边距设置
var savedSearchContainerMargin = localStorage.getItem('searchContainerMargin');
if (savedSearchContainerMargin && savedSearchContainerMargin !== 'Default') {
    document.getElementById('searchContainer').style.marginTop = savedSearchContainerMargin;
    document.getElementById('searchContainerMarginValue').textContent = savedSearchContainerMargin;
}

// submitBtn重命名功能
document.querySelector('label[for="renameSubmitBtn"]').addEventListener('click', function() {
    // 检查 showSendCheckbox 是否勾选，如果未勾选则不执行任何操作
    if (!document.getElementById('showSendCheckbox').checked) {
        return;
    }
    var currentName = document.getElementById('submitBtn').value;
    showCustomModal('请输入按钮名称（六字以内，输入为空时恢复默认）：', currentName, function(newName) {
        // 当点击取消时，newName 为 null，不执行任何操作
        if (newName === null) {
            return;
        }
        if (newName === '') {
            // 输入为空时恢复默认名称
            var defaultName = '跳转';
            document.getElementById('submitBtn').value = defaultName;
            document.getElementById('submitBtnNameValue').textContent = defaultName;
            localStorage.setItem('submitBtnName', defaultName);
        } else if (newName.length <= 6) { //>
            document.getElementById('submitBtn').value = newName;
            document.getElementById('submitBtnNameValue').textContent = newName;
            localStorage.setItem('submitBtnName', newName);
        }
    });
});

// 加载保存的submitBtn名称
var savedSubmitBtnName = localStorage.getItem('submitBtnName');
if (savedSubmitBtnName) {
    document.getElementById('submitBtn').value = savedSubmitBtnName;
    document.getElementById('submitBtnNameValue').textContent = savedSubmitBtnName;
}

// 执行JavaScript代码功能 - 修改modal部分
document.querySelector('label[for="executeJsBtn"]').addEventListener('click', function() {
    var currentJs = localStorage.getItem('customJs') || '';
    
    showCustomCodeModal('输入JavaScript脚本（输入为空时不执行）：', currentJs, function(jsCode) {
        if (jsCode === null) {
            return;
        }
        if (jsCode === '') {
            // 输入为空时不执行任何操作，同时清除保存的代码
            if (document.getElementById('trustJsCheckbox').checked) {
                localStorage.removeItem('customJs');
            }
            return;
        } else {
            try {
                // 执行JavaScript代码
                eval(jsCode);
                
                // 如果信任保存checkbox被勾选，则保存代码
                if (document.getElementById('trustJsCheckbox').checked) {
                    localStorage.setItem('customJs', jsCode);
                } else {
                    // 未勾选信任保存时，清空已保存的代码
                    localStorage.removeItem('customJs');
                }
            } catch (error) {
                // 执行出错时不保存
            }
        }
    }, '输入JavaScript脚本');
});

// 信任保存JavaScript代码checkbox事件监听
document.getElementById('trustJsCheckbox').addEventListener('change', function() {
    if (this.checked) {
        showCustomConfirm('警告：启用此功能后，保存的JavaScript脚本将在每次页面加载时自动运行，在启用此功能后请勿运行对本网站造成威胁的代码，否则无法恢复！', function(result) {
            if (!result) {
                document.getElementById('trustJsCheckbox').checked = false;
            } else {
                localStorage.setItem('trustJsChecked', 'true');
            }
        });
    } else {
        localStorage.setItem('trustJsChecked', 'false');
        localStorage.removeItem('customJs');
    }
});

// 加载保存的信任JavaScript设置
var savedTrustJsState = localStorage.getItem('trustJsChecked');
if (savedTrustJsState === 'true') {
    document.getElementById('trustJsCheckbox').checked = true;
}

// 页面加载时执行保存的JavaScript代码（如果信任保存被勾选）
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('trustJsChecked') === 'true') {
        var savedJs = localStorage.getItem('customJs');
        if (savedJs) {
            try {
                eval(savedJs);
            } catch (error) {
                // 执行出错时不处理
            }
        }
    }
});

// 通用编辑代码输入框函数
function showCustomCodeModal(title, currentCode, callback, placeholder) {
    // 禁止页面滚动（兼容所有浏览器）
    var originalBodyOverflow = document.body.style.overflow;
    var originalHtmlOverflow = document.documentElement.style.overflow;
    var originalScrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var originalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 兼容所有浏览器的滚动禁止
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originalScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    var modal = document.createElement('div');
    modal.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: rgba(0,0,0,0.5)',
        'z-index: 10000',
        'display: flex',
        'justify-content: center',
        'align-items: center'
    ].join(';');
    
    setTimeout(function() {
        centerModalElement(modal);
    }, 0);
    
    // 创建唯一的回调函数名称以避免冲突
    var callbackName = 'codeCallback_' + Date.now();
    window[callbackName] = function(code) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // 恢复页面滚动（兼容所有浏览器）
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // 恢复滚动位置
        window.scrollTo(originalScrollX, originalScrollY);
        
        if (typeof callback === 'function') {
            callback(code);
        }
        
        setTimeout(function() {
            delete window[callbackName];
        }, 100);
    };
    
    modal.innerHTML = [
        '<div id="userSelectModalDisabled" style="background: #ffffff; padding: 20px; border-radius: 3px; width: 72%; max-width: 320px;">',
        '<p style="margin-top: 0; user-select: none; text-align: left;">' + title + '</p>',
        '<textarea id="codeInput_' + callbackName + '" style="min-height:46px;max-height:110px;overflow-y:auto;width:100%;padding:4px;box-sizing:border-box;border:1px solid #ccc;font-family:inherit;font-size:inherit;resize:none;" placeholder="' + (placeholder || '输入文本') + '" oninput="executeCodeAutoResize(this)">' + (currentCode || '') + '</textarea>',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(null)">取消</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="var textarea=document.getElementById(\'codeInput_' + callbackName + '\');window.' + callbackName + '(textarea?textarea.value:null)">确定</label>',
        '</div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(modal);
    
    var textarea = document.getElementById('codeInput_' + callbackName);
    if (textarea) {
        executeCodeAutoResize(textarea);
    }
}

function showCustomAlert(title, prompts) {
    // 禁止页面滚动（兼容所有浏览器）
    var originalBodyOverflow = document.body.style.overflow;
    var originalHtmlOverflow = document.documentElement.style.overflow;
    var originalScrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var originalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 兼容所有浏览器的滚动禁止
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originalScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    var modal = document.createElement('div');
    modal.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: rgba(0,0,0,0.5)',
        'z-index: 10000',
        'display: flex',
        'justify-content: center',
        'align-items: center'
    ].join(';');
    
    setTimeout(function() {
        centerModalElement(modal);
    }, 0);
    
    // 创建唯一的回调函数名称以避免冲突
    var callbackName = 'alertCallback_' + Date.now();
    window[callbackName] = function() {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // 恢复页面滚动（兼容所有浏览器）
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // 恢复滚动位置
        window.scrollTo(originalScrollX, originalScrollY);
        
        // 清理全局函数
        setTimeout(function() {
            delete window[callbackName];
        }, 100);
    };
    
    modal.innerHTML = [
        '<div id="userSelectModalDisabled" style="background: #ffffff; padding: 20px; border-radius: 3px; width: 72%; max-width: 320px; text-align: left; max-height: 220px;">',
        '<h3 style="margin-top: 0; user-select: none; margin-bottom: 15px;">' + (title || '提示') + '</h3>',
        '<div style="max-height: 150px; overflow: auto; margin-top: -7px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">',
        '<p style="user-select: none; margin-bottom: 15px; margin-left: 5px; font-size: 15px; margin-top: -2px;">' + (prompts || '') + '</p>',
        '</div>',
        '<div style="text-align: right; margin-top: 15px;">',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="window.' + callbackName + '()">' + (isDesktop() ? '关闭(Esc)' : '确定') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 添加键盘事件处理函数（仅电脑端支持Esc键）
    modal._keyHandler = function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        // 按Esc键关闭提示（仅电脑端）
        if (keyCode === 27 && isDesktop()) { // 27是Esc键的keyCode
            window[callbackName]();
            e.preventDefault();
            return false;
        }
    };
    
    // 添加键盘事件监听
    document.addEventListener('keydown', modal._keyHandler);
    
    document.body.appendChild(modal);
    
    // 在移除modal时清理事件监听
    var originalCallback = window[callbackName];
    window[callbackName] = function() {
        document.removeEventListener('keydown', modal._keyHandler);
        originalCallback();
    };
}

function executeCodeAutoResize(textarea) {
    textarea.style.height = 'auto';
    var contentHeight = textarea.scrollHeight;
    
    if (contentHeight < 46) {
        textarea.style.height = '46px';
    } else if (contentHeight > 110) {
        textarea.style.height = '110px';
    } else {
        textarea.style.height = contentHeight + 'px';
    }
}

// 通用文本截断函数
function truncateText(elementId, text, maxWidth) {
    var element = document.getElementById(elementId);
    if (!element) return;
    
    var tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.font = getComputedStyle(element).font;
    tempSpan.textContent = text;
    document.body.appendChild(tempSpan);
    
    var displayText = text;
    if (tempSpan.offsetWidth > maxWidth) {
        while (tempSpan.offsetWidth > maxWidth && displayText.length > 3) {
            displayText = displayText.substring(0, displayText.length - 1);
            tempSpan.textContent = displayText + '...';
        }
        displayText = displayText + '...';
    }
    
    document.body.removeChild(tempSpan);
    element.textContent = displayText;
    element.title = text; // 添加title显示完整内容
}

// 在placeholder重命名功能中使用
document.querySelector('label[for="renamePlaceholderBtn"]').addEventListener('click', function() {
    var currentPlaceholder = localStorage.getItem('urlInputPlaceholder') || '输入网址';
    showCustomModal('请输入输入框提示文字（输入{empty}时显示空白，输入为空时恢复默认）：', currentPlaceholder, function(newPlaceholder) {
        if (newPlaceholder === null) {
            return;
        }
        if (newPlaceholder === '') {
            // 输入为空时恢复默认
            var defaultPlaceholder = '输入网址';
            document.getElementById('urlInput').placeholder = defaultPlaceholder;
            truncateText('placeholderValue', defaultPlaceholder, 100);
            localStorage.setItem('urlInputPlaceholder', defaultPlaceholder);
        } else if (newPlaceholder === '{empty}') {
            // 输入{empty}时显示空白
            document.getElementById('urlInput').placeholder = '';
            truncateText('placeholderValue', '{empty}', 100);
            localStorage.setItem('urlInputPlaceholder', '{empty}');
        } else {
            document.getElementById('urlInput').placeholder = newPlaceholder;
            truncateText('placeholderValue', newPlaceholder, 100);
            localStorage.setItem('urlInputPlaceholder', newPlaceholder);
        }
    });
});

// 加载保存的placeholder设置时也使用截断函数
var savedPlaceholder = localStorage.getItem('urlInputPlaceholder');
if (savedPlaceholder) {
    if (savedPlaceholder === '{empty}') {
        document.getElementById('urlInput').placeholder = '';
        truncateText('placeholderValue', '{empty}', 100);
    } else {
        document.getElementById('urlInput').placeholder = savedPlaceholder;
        truncateText('placeholderValue', savedPlaceholder, 100);
    }
}

// 对其他需要截断的元素也应用此函数
// 在页面加载时对已有元素应用截断
document.addEventListener('DOMContentLoaded', function() {
    // linkNameValue
    var savedLinkName = localStorage.getItem('linkName');
    if (savedLinkName) {
        truncateText('linkNameValue', savedLinkName, 100);
    }
    
    // linkColorValue
    var savedLinkColor = localStorage.getItem('linkColor');
    if (savedLinkColor) {
        truncateText('linkColorValue', savedLinkColor, 80);
    }
    
    // colorValue
    var savedBgColor = localStorage.getItem('backgroundColor');
    if (savedBgColor) {
        truncateText('colorValue', savedBgColor, 80);
    }
    
    // placeholderValue
    var savedPlaceholder = localStorage.getItem('urlInputPlaceholder');
    if (savedPlaceholder) {
        truncateText('placeholderValue', savedPlaceholder === '{empty}' ? '{empty}' : savedPlaceholder, 100);
    }
    
    // fontColorValue
    var savedFontColor = localStorage.getItem('fontColor');
    if (savedFontColor) {
        truncateText('fontColorValue', savedFontColor, 80);
    }
    
    var savedQuickLinksColor = localStorage.getItem('quickLinksColor');
    if (savedQuickLinksColor) {
        truncateText('quickLinksColorValue', savedQuickLinksColor, 80);
    }
});

// 链接大小控制
document.querySelector('label[for="linkSizePicker"]').addEventListener('click', function() {
    var currentSize = localStorage.getItem('linkSize') || '30px';
    if (!document.getElementById('showLinkCheckbox').checked) {
        return;
    }
    showCustomModal('请输入链接大小（如 30px，输入为空时恢复默认）：', currentSize, function(newSize) {
        if (newSize === null) {
            return;
        }
        if (newSize === '') {
            // 输入为空时恢复默认大小
            var defaultSize = '30px';
            var linkElement = document.getElementById('85727544071588039023');
            var linkImage = localStorage.getItem('linkImage');
            if (linkImage) {
                linkElement.innerHTML = '<img src="' + linkImage + '" style="width: auto; height: auto; max-width: ' + defaultSize + '; max-height: ' + defaultSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
            } else {
                linkElement.style.fontSize = defaultSize;
            }
            document.getElementById('linkSizeValue').textContent = defaultSize;
            localStorage.setItem('linkSize', defaultSize);
        } else if (/^\d+(\.\d+)?(px|in|mm|pt)$/.test(newSize)) {
            var linkElement = document.getElementById('85727544071588039023');
            var linkImage = localStorage.getItem('linkImage');
            if (linkImage) {
                linkElement.innerHTML = '<img src="' + linkImage + '" style="width: auto; height: auto; max-width: ' + newSize + '; max-height: ' + newSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
            } else {
                linkElement.style.fontSize = newSize;
            }
            document.getElementById('linkSizeValue').textContent = newSize;
            localStorage.setItem('linkSize', newSize);
        }
    });
});

// 加载保存的链接大小
var savedLinkSize = localStorage.getItem('linkSize');
if (savedLinkSize) {
    var linkElement = document.getElementById('85727544071588039023');
    linkElement.style.fontSize = savedLinkSize;
    document.getElementById('linkSizeValue').textContent = savedLinkSize;
    // 加载保存的图片链接
    var savedLinkImage = localStorage.getItem('linkImage');
    if (savedLinkImage) {
        var linkElement = document.getElementById('85727544071588039023');
        var linkSize = localStorage.getItem('linkSize') || '30px';
        linkElement.innerHTML = '<img src="' + savedLinkImage + '" style="width: auto; height: auto; max-width: ' + linkSize + '; max-height: ' + linkSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
        document.getElementById('linkColorValue').textContent = 'Image';
    }
}

// 保存和加载搜索历史记录checkbox状态
var savedSearchHistoryState = localStorage.getItem('searchHistoryChecked');
if (savedSearchHistoryState === 'true') {
    document.getElementById('searchHistoryCheckbox').checked = true;
    document.getElementById('searchHistory').style.display = 'block';
    updateSearchHistory();
}

// 监听搜索历史记录checkbox变化
document.getElementById('searchHistoryCheckbox').addEventListener('change', function() {
    if (this.checked) {
        localStorage.setItem('searchHistoryChecked', this.checked);
        document.getElementById('searchHistory').style.display = 'block';
        updateSearchHistory();
    } else {
        var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (history.length > 0) {
            showCustomConfirm('确定要清除搜索历史记录并关闭此功能吗？', function(result) {
                if (result) {
                    localStorage.removeItem('searchHistory');
                    document.getElementById('searchHistory').style.display = 'none';
                    document.getElementById('clearHistoryBtn').style.display = 'none';
                    localStorage.setItem('searchHistoryChecked', false);
                } else {
                    // 用户点击取消，恢复checkbox选中状态
                    document.getElementById('searchHistoryCheckbox').checked = true;
                }
            });
        } else {
            // 没有搜索记录时直接取消选择
            localStorage.setItem('searchHistoryChecked', this.checked);
            document.getElementById('searchHistory').style.display = 'none';
            document.getElementById('clearHistoryBtn').style.display = 'none';
        }
    }
});

// 清空搜索历史记录功能
document.querySelector('#clearHistoryBtn label').addEventListener('click', function() {
    showCustomConfirm('确定要清空搜索历史记录吗？', function(result) {
        if (result) {
            localStorage.removeItem('searchHistory');
            document.getElementById('searchHistory').innerHTML = '';
            document.getElementById('clearHistoryBtn').style.display = 'none';
        }
    });
});

function updateSearchHistory() {
    var searchHistoryDiv = document.getElementById('searchHistory');
    var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    searchHistoryDiv.innerHTML = '';
    
    if (history.length === 0) {
        searchHistoryDiv.style.display = 'none';
        document.getElementById('clearHistoryBtn').style.display = 'none';
        return;
    }
    
    searchHistoryDiv.style.display = 'block';
    document.getElementById('clearHistoryBtn').style.display = 'block';
    searchHistoryDiv.style.textAlign = 'center';
    
    var container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.width = '100%';
    container.style.left = '0';
    container.style.right = '0';
    container.style.margin = '0 auto';
    
    history.forEach(function(item, index) {
        var linkElement = document.createElement('a');
        linkElement.href = '#';
        
        // 处理显示文本，超过150px时显示...
        var displayText = item.text;
        var tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.font = getComputedStyle(linkElement).font;
        tempSpan.textContent = displayText;
        document.body.appendChild(tempSpan);
        
        if (tempSpan.offsetWidth > 150) {
            while (tempSpan.offsetWidth > 150 && displayText.length > 3) {
                displayText = displayText.substring(0, displayText.length - 1);
                tempSpan.textContent = displayText + '...';
            }
            displayText = displayText + '...';
        }
        
        document.body.removeChild(tempSpan);
        linkElement.textContent = displayText;
        linkElement.title = item.text; // 添加title显示完整内容
        
        linkElement.style.margin = '0 5px';
        linkElement.style.maxWidth = '150px';
        linkElement.style.overflow = 'hidden';
        linkElement.style.textOverflow = 'ellipsis';
        linkElement.style.whiteSpace = 'nowrap';
        linkElement.style.display = 'inline-block';
        linkElement.style.verticalAlign = 'bottom';
        linkElement.onclick = function(e) {
            e.preventDefault();
            document.getElementById('urlInput').value = item.text;
            document.getElementById('urlInput').focus();
        };
        
        var linkContainer = document.createElement('div');
        linkContainer.style.display = 'inline-block';
        linkContainer.style.alignItems = 'center';
        linkContainer.appendChild(linkElement);
        
        container.appendChild(linkContainer);
    });
    
    searchHistoryDiv.appendChild(container);
}

// 保存和加载一言显示checkbox状态
var savedHitokotoState = localStorage.getItem('hitokotoChecked');
if (savedHitokotoState === 'true') {
    document.getElementById('hitokotoCheckbox').checked = true;
    document.getElementById('hitokotoDisplay').style.display = 'block';
    fetchHitokoto();
}

// 监听一言显示checkbox变化
document.getElementById('hitokotoCheckbox').addEventListener('change', function() {
    if (this.checked) {
        showCustomConfirm('启用后，会在下方显示随机生成一条一言，生成的一言内容与本网站无关，确定要启用此功能吗？', function(result) {
            if (result) {
                localStorage.setItem('hitokotoChecked', 'true');
                document.getElementById('hitokotoDisplay').style.display = 'block';
                fetchHitokoto();
            } else {
                document.getElementById('hitokotoCheckbox').checked = false;
            }
        });
    } else {
        localStorage.setItem('hitokotoChecked', 'false');
        document.getElementById('hitokotoDisplay').style.display = 'none';
    }
});

// 获取一言数据
function fetchHitokoto() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://v1.hitokoto.cn/', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var data = JSON.parse(xhr.responseText);
                document.getElementById('hitokotoDisplay').textContent = '「' + data.hitokoto + '」—— ' + data.from;
            } catch (e) {
                document.getElementById('hitokotoDisplay').textContent = 'Network Error';
            }
        }
    };
    xhr.onerror = function() {
        document.getElementById('hitokotoDisplay').textContent = 'Network Error';
    };
    xhr.send();
}

// 保存和加载搜索引擎显示checkbox状态
var savedSearchEngineDisplayState = localStorage.getItem('searchEngineDisplayChecked');
if (savedSearchEngineDisplayState === 'true') {
    document.getElementById('searchEngineDisplayCheckbox').checked = true;
    hideSearchEngineOptions();
}

// 监听搜索引擎显示checkbox变化
document.getElementById('searchEngineDisplayCheckbox').addEventListener('change', function() {
    localStorage.setItem('searchEngineDisplayChecked', this.checked);
    if (this.checked) {
        hideSearchEngineOptions();
    } else {
        showAllSearchEngineOptions();
    }
});

// 隐藏指定搜索引擎选项
function hideSearchEngineOptions() {
    var engineSelect = document.getElementById('engineSelect');
    var optgroups = engineSelect.getElementsByTagName('optgroup');
    
    // 要隐藏的optgroup id列表
    var groupsToHide = [
        'mobileSearchGroup', 'aiSearchGroup', 'translateGroup',
        'shoppingGroup', 'videoGroup', 'communityGroup'
    ];
    
    for (var i = 0; i < optgroups.length; i++) {
        if (groupsToHide.indexOf(optgroups[i].id) !== -1) {
            optgroups[i].style.display = 'none';
        }
    }
    
    // 隐藏特定选项值
    var optionsToHide = ['yahooSearch',
        'sodouyinM', 'yzmsmM', 'sotoutiaoM', 'qksmSearch', 'baiduMEasy',
        'metasosuoAI', 'baiduAI', '360namisoAI', 'zhihuZhiDaAI', 'quarkpcAI',
        'googleTranslate', 'mcTranslator', 'yandexTranslate', 'sogouFanyi', 'oldBaiduFanyi', 'quarkTranslateTools', 'fanyiSo', 'volcTranslate', 'transmartQQTs',
        'taobaoWeb', 'jdWebPage',
        'biliTv', 'dyIsWindows', 'haokanVideo',
        'githubCode', 'zhihuFriends', 'csdnWebPage', 'weiboFriends', 'bdZhidao',
        'kfBaidu', 'weixinSogou', 'baiduTw', 'iFrameFree', 'httpsAutoFill'];
    for (var i = 0; i < engineSelect.options.length; i++) {
        if (optionsToHide.indexOf(engineSelect.options[i].value) !== -1 && engineSelect.options[i].id !== 'nullBaidu') {
            engineSelect.options[i].style.display = 'none';
        }
    }
}

// 显示所有搜索引擎选项
function showAllSearchEngineOptions() {
    var engineSelect = document.getElementById('engineSelect');
    var optgroups = engineSelect.getElementsByTagName('optgroup');
    
    for (var i = 0; i < optgroups.length; i++) {
        optgroups[i].style.display = '';
    }
    
    for (var i = 0; i < engineSelect.options.length; i++) {
        // 修改这里：除了 nullBaidu ID 外都显示
        if (engineSelect.options[i].id !== 'nullBaidu') {
            engineSelect.options[i].style.display = '';
        }
        // 添加特殊处理：在电脑端显示 tencentFanyi2，移动端隐藏
        if (engineSelect.options[i].value === 'transmartQQTs') {
            if (isMobileAndroidApple()) {
                engineSelect.options[i].style.display = 'none';
            } else {
                engineSelect.options[i].style.display = '';
            }
        }
    }
}

// 保存和加载quickInputCheckbox状态
var savedQuickInputState = localStorage.getItem('quickInputChecked');
if (savedQuickInputState === 'true') {
    document.getElementById('quickInputCheckbox').checked = true;
    document.getElementById('quickInputUi').style.display = 'block';
}

// 监听quickInputCheckbox变化
document.getElementById('quickInputCheckbox').addEventListener('change', function() {
    localStorage.setItem('quickInputChecked', this.checked);
    if (this.checked) {
        document.getElementById('quickInputUi').style.display = 'block';
    } else {
        document.getElementById('quickInputUi').style.display = 'none';
    }
});

// 只有在focusCheckbox勾选时才添加focus/blur事件
if (localStorage.getItem('focusCheckboxChecked') === 'true') {
    document.getElementById('urlInput').addEventListener('focus', function() {
        document.body.classList.add('focused');
        document.querySelector('.search-container').classList.add('focused');
        document.getElementById('quickInputBtn').style.display = 'block';
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('centerBoxDisplay').style.display = 'none';
        document.getElementById('hitokotoDisplay').style.display = 'none';
        document.getElementById('searchContainer').style.marginTop = '0';
    });
    
    // 添加延迟恢复
    document.getElementById('urlInput').addEventListener('blur', function(e) {
        // 检查相关目标是否是quickInputBtn内的按钮
        var relatedTarget = e.relatedTarget;
        var isQuickInputBtnTarget = relatedTarget &&
            (relatedTarget.parentNode &&
                (relatedTarget.parentNode.id === 'quickInputBtn' ||
                    relatedTarget.parentNode.id === 'quickInputBtn1Head' ||
                    relatedTarget.parentNode.id === 'quickInputBtn2' ||
                    relatedTarget.parentNode.id === 'quickInputBtn3' ||
                    relatedTarget.parentNode.id === 'quickInputBtn4'));
        
        // 如果不是quickInputBtn内的按钮，才执行恢复操作
        if (!isQuickInputBtnTarget) {
            // 添加延迟恢复
            setTimeout(function() {
                document.body.classList.remove('focused');
                document.querySelector('.search-container').classList.remove('focused');
                document.getElementById('quickInputBtn').style.display = 'none';
                document.getElementById('hitokotoDisplay').style.display = 'block';
                document.getElementById('searchContainer').style.marginTop = savedSearchContainerMargin;
                // 恢复iframe显示（仅在iFrameFree选中时）
                if (document.getElementById('engineSelect').value === 'iFrameFree') {
                    document.getElementById('iframeContainer').style.display = 'block';
                }
                if (document.getElementById('layoutCheckbox').checked) {
                    document.getElementById('centerBoxDisplay').style.display = 'block';
                }
            }, 100);
        }
    });
}

// 动态添加CSS样式
var style = document.createElement('style');
style.textContent = [
    '.search-container.focused {',
    '    position: fixed;',
    '    top: 10px;',
    '    left: 0;',
    '    right: 0;',
    '    width: 85%;',
    '    z-index: 1000;',
    '    margin: 0 auto;',
    '    background: white;',
    '}',
    '',
    'body.focused #autoFillhttps,',
    'body.focused a {',
    '    display: none !important;',
    '}',
    '',
    'body.focused #quickInputBtn {',
    '    display: block !important;',
    '    position: fixed;',
    '    left: 0;',
    '    right: 0;',
    '    text-align: center;',
    '    z-index: 1001;',
    '    top: 60px;',
    '}',
    '',
    'body.focused #clearHistoryBtn {',
    '    display: none !important;',
    '}',
    '',
    '/* 新增子容器横向排列样式 */',
    'body.focused #quickInputBtn > div {',
    '    display: inline-block;',
    '    white-space: nowrap;',
    '}',
    '',
    'body.focused #quickInputBtn1Head, #quickInputBtn2, #quickInputBtn3 {',
    '    overflow-x: auto;',
    '    white-space: nowrap;',
    '    width: 95%;',
    '}',
    '',
    'body.focused #engineSelect {',
    '    opacity: 0;',
    '    width: 0;',
    '    min-width: 0;',
    '    margin: 0;',
    '    padding: 0;',
    '    border: none;',
    '    overflow: hidden;',
    '}'
].join('');
document.head.appendChild(style);

// 监听布局复选框状态变化
document.getElementById('layoutCheckbox').addEventListener('change', function() {
    localStorage.setItem('layoutChecked', this.checked);
    applyLayoutStyle(this.checked);
    
    // 添加：当重复勾选时恢复当前调节的高度
    if (this.checked) {
        var savedHeightPercent = localStorage.getItem('heightPercent') || '25%';
        document.getElementById('centerBoxDisplay').style.height = savedHeightPercent;
    }
});

// 应用布局样式函数
function applyLayoutStyle(checked) {
    if (checked) {
        // 仅作用于centerBoxDisplay区域
        var centerBox = document.getElementById('centerBoxDisplay');
        if (centerBox) {
            centerBox.style.textAlign = 'center';
            centerBox.style.display = 'block';
            // 修改：使用保存的高度值而不是固定值
            var savedHeightPercent = localStorage.getItem('heightPercent') || '25%';
            centerBox.style.height = savedHeightPercent;
            document.body.style.height = '90%';
        }
    } else {
        // 仅作用于centerBoxDisplay区域
        var centerBox = document.getElementById('centerBoxDisplay');
        if (centerBox) {
            centerBox.style.textAlign = '';
            centerBox.style.display = 'none';
            centerBox.style.height = '';
            document.body.style.height = '';
        }
    }
}

// 添加urlInput的mousedown事件处理，用于取消自动选择
document.getElementById('urlInput').addEventListener('mousedown', function() {
    // 检查是否启用了自动选择https文本功能
    var isSelectHttpsTextChecked = localStorage.getItem('selectHttpsTextChecked') === 'true';
    var isAutoFillHttpsChecked = localStorage.getItem('autoFillHttpsChecked') === 'true';
    
    // 只有当所有条件满足且用户没有手动输入时才处理
    if (isSelectHttpsTextChecked && isAutoFillHttpsChecked &&
        this.value === 'https://' && !this.dataset.userInput) {
        
        // 检查是否已经选择了文本
        var selectionStart = this.selectionStart;
        var selectionEnd = this.selectionEnd;
        
        if (selectionStart === 0 && selectionEnd === this.value.length) {
            // 如果文本已经被全选，阻止默认的focus行为，取消选择
            this.setSelectionRange(this.value.length, this.value.length);
        }
    }
});

// 加载保存的布局复选框状态
var savedLayoutState = localStorage.getItem('layoutChecked');
if (savedLayoutState === 'true') {
    document.getElementById('layoutCheckbox').checked = true;
    applyLayoutStyle(true);
}

// 在加载保存的布局复选框状态部分添加以下代码
var savedHeightPercent = localStorage.getItem('heightPercent');
if (savedHeightPercent) {
    document.getElementById('heightPercentValue').textContent = savedHeightPercent;
    // 只有当布局居中启用时才应用保存的高度到centerBoxDisplay
    if (document.getElementById('layoutCheckbox').checked) {
        var centerBox = document.getElementById('centerBoxDisplay');
        if (centerBox) {
            centerBox.style.height = savedHeightPercent;
        }
    }
}

// 保存和加载saveInputCheckbox状态
var savedInputState = localStorage.getItem('saveInputChecked');
if (savedInputState === 'true') {
    document.getElementById('saveInputCheckbox').checked = true;
    var savedInputText = localStorage.getItem('savedInputText');
    if (savedInputText) {
        document.getElementById('urlInput').value = savedInputText;
    }
}

// 监听saveInputCheckbox变化
document.getElementById('saveInputCheckbox').addEventListener('change', function() {
    localStorage.setItem('saveInputChecked', this.checked);
    if (!this.checked) {
        localStorage.removeItem('savedInputText');
    }
});

// 监听复选框状态变化
document.getElementById('customCheckbox').addEventListener('change', function() {
    localStorage.setItem('autoFillHttpsChecked', this.checked);
    
    // 控制selectHttpsText的disabled状态
    document.getElementById('selectHttpsText').disabled = !this.checked;
    
    if (this.checked) {
        // 只有当输入框为空时才自动填充
        if (!document.getElementById('urlInput').value.trim()) {
            document.getElementById('urlInput').value = 'https://';
            // 重置用户输入状态
            document.getElementById('urlInput').dataset.userInput = '';
        }
    } else {
        document.getElementById('urlInput').value = '';
        // 重置用户输入状态
        document.getElementById('urlInput').dataset.userInput = '';
    }
});
// 监听selectHttpsText变化
document.getElementById('selectHttpsText').addEventListener('change', function() {
    localStorage.setItem('selectHttpsTextChecked', this.checked);
});

// 加载保存的selectHttpsText状态
var savedSelectHttpsTextState = localStorage.getItem('selectHttpsTextChecked');
if (savedSelectHttpsTextState === 'true') {
    document.getElementById('selectHttpsText').checked = true;
}

// 添加urlInput的focus事件处理，用于自动选择https文本
document.getElementById('urlInput').addEventListener('focus', function() {
    // 检查是否启用了自动选择https文本功能
    var isSelectHttpsTextChecked = localStorage.getItem('selectHttpsTextChecked') === 'true';
    var isAutoFillHttpsChecked = localStorage.getItem('autoFillHttpsChecked') === 'true';
    
    // 只有当所有条件满足且用户没有手动输入时才自动选择
    if (isSelectHttpsTextChecked && isAutoFillHttpsChecked &&
        this.value === 'https://' && !this.dataset.userInput) {
        this.select(); // 自动选择所有文本
    }
});

// 右键控制
document.getElementById('urlInput').addEventListener('contextmenu', function(e) {
    var isSelectHttpsTextChecked = localStorage.getItem('selectHttpsTextChecked') === 'true';
    var isAutoFillHttpsChecked = localStorage.getItem('autoFillHttpsChecked') === 'true';
    
    // 当启用自动选择https文本且当前值为https://且用户没有手动输入时，禁用右键菜单
    if (isSelectHttpsTextChecked && isAutoFillHttpsChecked &&
        this.value === 'https://' && !this.dataset.userInput) {
        e.preventDefault();
        return false;
    }
});

// 监听urlInput的keydown事件来检测手动输入https://
document.getElementById('urlInput').addEventListener('keydown', function(e) {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        this.dataset.manualHttps = 'true';
    }
});

// 监听urlInput的focus事件，重置manualHttps标记
document.getElementById('urlInput').addEventListener('focus', function() {
    this.dataset.manualHttps = '';
});

// 保存和加载自动聚焦checkbox状态
var savedAutoFocusState = localStorage.getItem('autoFocusChecked');
if (savedAutoFocusState === 'true') {
    document.getElementById('autoFocusCheckbox').checked = true;
    // 页面加载时自动聚焦输入框
    setTimeout(function() {
        document.getElementById('urlInput').focus();
    }, 100);
}

// 监听自动聚焦checkbox变化
document.getElementById('autoFocusCheckbox').addEventListener('change', function() {
    localStorage.setItem('autoFocusChecked', this.checked);
});

// 监听directUrlJumpCheckbox变化
document.getElementById('directUrlJumpCheckbox').addEventListener('change', function() {
    localStorage.setItem('directUrlJumpChecked', this.checked);
});

// 监听showVisitWebsiteCheckbox变化
document.getElementById('showVisitWebsiteCheckbox').addEventListener('change', function() {
    localStorage.setItem('showVisitWebsiteChecked', this.checked);
});

// 执行CSS代码功能 - 修改modal部分
document.querySelector('label[for="executeCssBtn"]').addEventListener('click', function() {
    var currentCss = localStorage.getItem('customCss') || '';
    
    showCustomCodeModal('输入CSS代码（输入为空时恢复默认）：', currentCss, function(cssCode) {
        if (cssCode === null) {
            return;
        }
        if (cssCode === '') {
            // 输入为空时恢复默认，移除自定义样式
            var existingStyle = document.getElementById('customCssStyle');
            if (existingStyle) {
                existingStyle.remove();
            }
            localStorage.removeItem('customCss');
        } else {
            // 移除现有自定义样式
            var existingStyle = document.getElementById('customCssStyle');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            // 创建新的样式元素
            var styleElement = document.createElement('style');
            styleElement.id = 'customCssStyle';
            styleElement.textContent = cssCode;
            document.head.appendChild(styleElement);
            
            // 保存CSS代码
            localStorage.setItem('customCss', cssCode);
        }
    }, '输入CSS代码');
});

function executeCssAutoResize(textarea) {
    // 重置高度为auto以计算正确的内容高度
    textarea.style.height = 'auto';
    
    // 计算内容高度
    var contentHeight = textarea.scrollHeight;
    
    // 应用高度限制
    if (contentHeight < 46) {
        textarea.style.height = '46px';
    } else if (contentHeight > 110) {
        textarea.style.height = '110px';
    } else {
        textarea.style.height = contentHeight + 'px';
    }
}

// 加载保存的CSS代码
var savedCss = localStorage.getItem('customCss');
if (savedCss) {
    var styleElement = document.createElement('style');
    styleElement.id = 'customCssStyle';
    styleElement.textContent = savedCss;
    document.head.appendChild(styleElement);
}

// 监听urlInput输入事件，当用户开始输入时记录状态
document.getElementById('urlInput').addEventListener('input', function() {
    // 记录用户已经开始输入，禁用自动选择
    if (this.value !== 'https://') {
        this.dataset.userInput = 'true';
    } else {
        // 当值恢复为https://时，重置用户输入状态（除非是手动输入的）
        if (!this.dataset.manualHttps) {
            this.dataset.userInput = '';
        }
    }
    
    if (document.getElementById('saveInputCheckbox').checked) {
        localStorage.setItem('savedInputText', this.value);
    }
});

var savedEngine = localStorage.getItem('selectedEngine');
if (savedEngine) {
    document.getElementById('engineSelect').value = savedEngine;
}

// 显示/隐藏链接的checkbox
document.getElementById('showLinkCheckbox').addEventListener('change', function() {
    localStorage.setItem('showLinkChecked', this.checked);
    toggleLinkDisplay(this.checked);
    
    var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
    
    if (!this.checked && showTimeChecked) {
        // 取消显示链接时，取消时间链接并隐藏
        document.getElementById('showTimeCheckbox').checked = false;
        localStorage.setItem('showTimeChecked', 'false');
        hideTimeLink();
        timeLinkElement.style.display = 'none';
    } else if (this.checked && showTimeChecked) {
        // 重新显示链接且时间链接已勾选时，显示时间
        timeLinkElement.style.display = 'inline-block';
        showTimeLink();
    } else if (this.checked) {
        // 显示链接但时间链接未勾选时，正常显示
        timeLinkElement.style.display = 'inline-block';
    }
    
    // 控制时间链接checkbox的可用性
    document.getElementById('showTimeCheckbox').disabled = !this.checked;
});

// 加载保存的显示链接复选框状态
var savedShowLinkState = localStorage.getItem('showLinkChecked');
if (savedShowLinkState === 'true') {
    document.getElementById('showLinkCheckbox').checked = true;
    toggleLinkDisplay(true);
} else if (savedShowLinkState === 'false') {
    document.getElementById('showLinkCheckbox').checked = false;
    toggleLinkDisplay(false);
}

// 切换链接显示状态的函数
function toggleLinkDisplay(show) {
    var linkElement = document.getElementById('85727544071588039023');
    if (linkElement) {
        linkElement.style.display = show ? 'inline-block' : 'none';
    }
}

// 保存和加载showSendCheckbox状态
var savedShowSendCheckboxState = localStorage.getItem('showSendCheckboxChecked');
if (savedShowSendCheckboxState === 'true') {
    document.getElementById('showSendCheckbox').checked = true;
    document.getElementById('submitBtn').style.display = 'inline-block';
} else if (savedShowSendCheckboxState === 'false') {
    document.getElementById('showSendCheckbox').checked = false;
    document.getElementById('submitBtn').style.display = 'none';
}

// 监听showSendCheckbox变化
document.getElementById('showSendCheckbox').addEventListener('change', function() {
    localStorage.setItem('showSendCheckboxChecked', this.checked);
    if (this.checked) {
        document.getElementById('submitBtn').style.display = 'inline-block';
    } else {
        document.getElementById('submitBtn').style.display = 'none';
    }
});

// 加载保存的背景图片（优先检查图片）
var savedBackgroundImage = localStorage.getItem('backgroundImage');
if (savedBackgroundImage) {
    setTimeout(function() {
        document.body.style.backgroundColor = '';
        document.body.style.backgroundImage = 'url("' + savedBackgroundImage + '")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        document.getElementById('searchContainer').style.background = '';
        document.getElementById('colorValue').textContent = 'Image';
        // 设置颜色选择器的值为图片URL，以便后续识别
        document.getElementById('bgColorPicker').value = savedBackgroundImage;
    }, 0);
} else {
    // 加载保存的背景颜色
    var savedBgColor = localStorage.getItem('backgroundColor') || '#ffffff';
    document.body.style.backgroundColor = savedBgColor;
    document.getElementById('searchContainer').style.background = savedBgColor;
    document.getElementById('bgColorPicker').value = savedBgColor;
    document.getElementById('colorValue').textContent = savedBgColor;
}

// 监听背景颜色变化
document.getElementById('bgColorPicker').addEventListener('input', function() {
    var color = this.value;
    document.body.style.backgroundColor = color;
    document.getElementById('searchContainer').style.background = color;
    localStorage.setItem('backgroundColor', color);
});

// 点击label触发颜色输入提示
document.querySelector('label[for="bgColorPicker"]').addEventListener('click', function() {
    var savedBackgroundImage = localStorage.getItem('backgroundImage');
    if (savedBackgroundImage) {
        // 当前使用图片，直接弹出图片URL输入框
        var currentImage = localStorage.getItem('backgroundImage') || '';
        showCustomModal('请输入图片URL：', currentImage, function(imageUrl) {
            if (imageUrl && imageUrl.trim() !== '') {
                document.body.style.backgroundColor = '';
                document.body.style.backgroundImage = 'url("' + imageUrl + '")';
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundAttachment = 'fixed';
                document.getElementById('searchContainer').style.background = '';
                document.getElementById('colorValue').textContent = 'Image';
                localStorage.setItem('backgroundImage', imageUrl);
            } else if (imageUrl === '') {
                // 输入为空时恢复默认颜色
                var defaultColor = '#ffffff';
                document.body.style.backgroundColor = defaultColor;
                document.body.style.backgroundImage = '';
                document.getElementById('searchContainer').style.background = defaultColor;
                document.getElementById('colorValue').textContent = defaultColor;
                localStorage.setItem('backgroundColor', defaultColor);
                localStorage.removeItem('backgroundImage');
            }
        });
        return;
    }
    var currentColor = localStorage.getItem('backgroundColor') || '#ffffff';
    var currentBgValue = localStorage.getItem('backgroundColor') || '#ffffff';
    showCustomModal('请输入颜色值（如 #ffffff 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);try{var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';colorPicker.value=\'' + currentColor + '\';colorPicker.style.position=\'fixed\';colorPicker.style.left=\'50%\';colorPicker.style.top=\'50%\';colorPicker.style.transform=\'translate(-50%,-50%)\';colorPicker.style.width=\'1px\';colorPicker.style.height=\'1px\';colorPicker.style.opacity=\'0.001\';colorPicker.style.zIndex=\'10001\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){colorPicker.focus&&colorPicker.focus();colorPicker.click&&colorPicker.click();},50);}catch(e){}}return false;">调色盘</a>。或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){input.value=\'image url\';var labels=document.querySelectorAll(\'label[onclick*=\\\'modalCallback_\\\']\');if(labels.length>0){labels[labels.length-1].click();}}}return false;">图片</a> <span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-left: 5px;margin-bottom: 1px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentBgValue, function(newValue) {
        if (newValue === null) {
            return;
        }
        if (newValue === '') {
            // 输入为空时恢复默认颜色
            var defaultColor = '#ffffff';
            document.body.style.backgroundColor = defaultColor;
            document.body.style.backgroundImage = '';
            document.getElementById('searchContainer').style.background = defaultColor;
            document.getElementById('colorValue').textContent = defaultColor;
            localStorage.setItem('backgroundColor', defaultColor);
            localStorage.removeItem('backgroundImage');
        } else if (newValue.toLowerCase() === 'image url') {
            // 输入image时弹出背景图片链接输入框
            var currentImage = localStorage.getItem('backgroundImage') || '';
            showCustomModal('请输入图片URL：', currentImage, function(imageUrl) {
                if (imageUrl && imageUrl.trim() !== '') {
                    document.body.style.backgroundColor = '';
                    document.body.style.backgroundImage = 'url("' + imageUrl + '")';
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    document.body.style.backgroundAttachment = 'fixed';
                    document.getElementById('searchContainer').style.background = '';
                    document.getElementById('colorValue').textContent = 'Image';
                    localStorage.setItem('backgroundImage', imageUrl);
                } else if (imageUrl === '') {
                    // 输入为空时恢复默认颜色
                    var defaultColor = '#ffffff';
                    document.body.style.backgroundColor = defaultColor;
                    document.body.style.backgroundImage = '';
                    document.getElementById('searchContainer').style.background = defaultColor;
                    document.getElementById('colorValue').textContent = defaultColor;
                    localStorage.setItem('backgroundColor', defaultColor);
                    localStorage.removeItem('backgroundImage');
                }
            });
        } else if (/^#([0-9A-F]{3,6})$/i.test(newValue) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue) || /^[a-z]+$/i.test(newValue) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue)) {
            document.body.style.backgroundColor = newValue;
            document.body.style.backgroundImage = '';
            document.getElementById('searchContainer').style.background = newValue;
            document.getElementById('colorValue').textContent = newValue;
            localStorage.setItem('backgroundColor', newValue);
            localStorage.removeItem('backgroundImage');
            truncateText('colorValue', newValue, 80);
        }
    });
});

// 加载保存的复选框状态
var savedCheckboxState = localStorage.getItem('autoFillHttpsChecked');
if (savedCheckboxState === 'true') {
    document.getElementById('customCheckbox').checked = true;
    // 如果勾选，自动填充 https:// 到输入框
    // 只有当输入框为空时才自动填充
    if (!document.getElementById('urlInput').value.trim()) {
        document.getElementById('urlInput').value = 'https://';
    }
    if (savedCheckboxState === 'true') {
        document.getElementById('selectHttpsText').disabled = false;
    }
}

// 字体颜色控制
document.querySelector('label[for="fontColorPicker"]').addEventListener('click', function() {
    var currentColor = localStorage.getItem('fontColor') || '#000000';
    showCustomModal('请输入字体颜色值（如 #000000 或 black）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);try{var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';colorPicker.value=\'' + currentColor + '\';colorPicker.style.position=\'fixed\';colorPicker.style.left=\'50%\';colorPicker.style.top=\'50%\';colorPicker.style.transform=\'translate(-50%,-50%)\';colorPicker.style.width=\'1px\';colorPicker.style.height=\'1px\';colorPicker.style.opacity=\'0.001\';colorPicker.style.zIndex=\'10001\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){colorPicker.focus&&colorPicker.focus();colorPicker.click&&colorPicker.click();},50);}catch(e){}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newColor) {
        if (newColor === null) {
            return;
        }
        if (newColor === '') {
            // 输入为空时恢复默认颜色
            var defaultColor = '#000000';
            document.getElementById('autoFillhttps').style.color = defaultColor;
            document.getElementById('iframeContainer').style.color = defaultColor;
            document.getElementById('fontColorValue').textContent = defaultColor;
            localStorage.setItem('fontColor', defaultColor);
        } else if (/^#([0-9A-F]{3,6})$/i.test(newColor) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor) || /^[a-z]+$/i.test(newColor) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor)) {
            document.getElementById('autoFillhttps').style.color = newColor;
            document.getElementById('iframeContainer').style.color = newColor;
            document.getElementById('fontColorValue').textContent = newColor;
            localStorage.setItem('fontColor', newColor);
            truncateText('fontColorValue', newColor, 80);
        }
    });
});

// 加载保存的字体颜色
var savedFontColor = localStorage.getItem('fontColor');
if (savedFontColor) {
    document.getElementById('autoFillhttps').style.color = savedFontColor;
    document.getElementById('iframeContainer').style.color = savedFontColor;
    document.getElementById('fontColorValue').textContent = savedFontColor;
}

// 超链接快捷跳转功能
document.querySelector('label[for="linkCreatorBtn0"]').addEventListener('click', function() {
    showCustomDoubleInput(
        '创建快捷链接',
        '输入链接显示文本',
        '输入URL地址（必须以 https://、http:// 开头）',
        '快捷方式',
        'https://baidu.com',
        function(text, url) {
            if (text && url) {
                // 验证格式
                if (url.indexOf('https://') !== 0 && url.indexOf('http://') !== 0 && url.indexOf('#') !== 0) {
                    return;
                }
                
                // 保存链接
                var links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                links.push({ url: url, text: text });
                localStorage.setItem('quickLinks', JSON.stringify(links));
                
                // 更新显示
                updateQuickLinks();
            }
        }
    );
});

// 默认导航链接功能
document.querySelector('label[for="defaultLinksBtn"]').addEventListener('click', function() {
    showCustomConfirm('是否导入常用书签？导入后将添加百度、谷歌、B站等常用书签。', function(result) {
        if (result) {
            var defaultLinks = [
                { url: 'https://www.baidu.com', text: '百度' },
                { url: 'https://www.google.com', text: '谷歌' },
                { url: 'https://www.bilibili.com', text: 'B站' },
                { url: 'https://github.com', text: 'GitHub' },
                { url: 'https://zhihu.com', text: '知乎' },
                { url: 'https://weibo.com', text: '微博' },
                { url: 'https://taobao.com', text: '淘宝' },
                { url: 'https://jd.com', text: '京东' },
                { url: 'https://youtube.com', text: 'YouTube' },
                { url: 'https://twitter.com', text: 'Twitter' }
            ];
            
            var existingLinks = JSON.parse(localStorage.getItem('quickLinks') || '[]');
            var mergedLinks = existingLinks.concat(defaultLinks);
            localStorage.setItem('quickLinks', JSON.stringify(mergedLinks));
            
            updateQuickLinks();
        }
    });
});

// 字体大小调整功能
document.querySelector('label[for="fontSizePicker"]').addEventListener('click', function() {
    var currentSize = localStorage.getItem('urlInputFontSize') || 'Default';
    showCustomModal('请输入字体大小（如 14px，输入为空时恢复默认）：', currentSize === 'Default' ? '' : currentSize, function(newSize) {
        if (newSize === '') {
            // 输入为空时恢复默认大小
            document.getElementById('urlInput').style.fontSize = '';
            document.getElementById('engineSelect').style.fontSize = '';
            document.getElementById('submitBtn').style.fontSize = '';
            document.getElementById('fontSizeValue').textContent = 'Default';
            localStorage.removeItem('urlInputFontSize');
        } else if (/^\d+(\.\d+)?%$/.test(newSize) || /^\d+(\.\d+)?(px|in|mm|pt)$/.test(newSize)) {
            document.getElementById('urlInput').style.fontSize = newSize;
            document.getElementById('engineSelect').style.fontSize = newSize;
            document.getElementById('submitBtn').style.fontSize = newSize;
            document.getElementById('fontSizeValue').textContent = newSize;
            localStorage.setItem('urlInputFontSize', newSize);
        }
    });
});

// 加载保存的字体大小设置
var savedFontSize = localStorage.getItem('urlInputFontSize');
if (savedFontSize) {
    document.getElementById('urlInput').style.fontSize = savedFontSize;
    document.getElementById('engineSelect').style.fontSize = savedFontSize;
    document.getElementById('submitBtn').style.fontSize = savedFontSize;
    document.getElementById('fontSizeValue').textContent = savedFontSize;
}

// 高度调整功能
document.querySelector('label[for="heightPicker"]').addEventListener('click', function() {
    var currentHeight = localStorage.getItem('elementHeight') || '24px';
    showCustomModal('请输入高度值（如 24px，输入为空时恢复默认）：', currentHeight, function(newHeight) {
        if (newHeight === '') {
            // 输入为空时恢复默认高度
            var defaultHeight = '24px';
            document.getElementById('engineSelect').style.height = defaultHeight;
            document.getElementById('urlInput').style.height = defaultHeight;
            document.getElementById('submitBtn').style.height = defaultHeight;
            document.getElementById('heightValue').textContent = defaultHeight;
            localStorage.setItem('elementHeight', defaultHeight);
        } else if (/^\d+(\.\d+)?(px|in|mm|pt)$/.test(newHeight)) {
            document.getElementById('engineSelect').style.height = newHeight;
            document.getElementById('urlInput').style.height = newHeight;
            document.getElementById('submitBtn').style.height = newHeight;
            document.getElementById('heightValue').textContent = newHeight;
            localStorage.setItem('elementHeight', newHeight);
        }
    });
});

// 宽度调整功能
document.querySelector('label[for="widthPicker"]').addEventListener('click', function() {
    var currentWidth = localStorage.getItem('buttonWidth') || 'Default';
    if (!document.getElementById('showSendCheckbox').checked) {
        return;
    }
    showCustomModal('请输入按钮宽度值（如 50px，输入空值恢复默认）：', currentWidth === 'Default' ? '' : currentWidth, function(newWidth) {
        if (newWidth === '') {
            // 输入为空时恢复默认宽度
            document.getElementById('submitBtn').style.width = '';
            document.getElementById('widthValue').textContent = 'Default';
            localStorage.setItem('buttonWidth', 'Default');
        } else if (/^\d+(\.\d+)?(px|in|mm|pt)$/.test(newWidth)) {
            document.getElementById('submitBtn').style.width = newWidth;
            document.getElementById('widthValue').textContent = newWidth;
            localStorage.setItem('buttonWidth', newWidth);
        }
    });
});

// 加载保存的高度设置
var savedHeight = localStorage.getItem('elementHeight');
if (savedHeight) {
    document.getElementById('engineSelect').style.height = savedHeight;
    document.getElementById('urlInput').style.height = savedHeight;
    document.getElementById('submitBtn').style.height = savedHeight;
    document.getElementById('heightValue').textContent = savedHeight;
}

// 加载保存的宽度设置
var savedWidth = localStorage.getItem('buttonWidth');
if (savedWidth && savedWidth !== 'Default') {
    document.getElementById('submitBtn').style.width = savedWidth;
    document.getElementById('widthValue').textContent = savedWidth;
}

// 导出设置功能
document.querySelector('label[for="exportSettingsBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要导出用户数据吗？', function(result) {
        if (result) {
            exportSettingsData()
        }
    });
});

function exportSettingsData() {
    var settings = {
        autoFillHttpsChecked: localStorage.getItem('autoFillHttpsChecked') || 'false',
        focusCheckboxChecked: localStorage.getItem('focusCheckboxChecked') || 'false',
        layoutChecked: localStorage.getItem('layoutChecked') || 'false',
        showLinkChecked: localStorage.getItem('showLinkChecked') || 'true',
        showSendCheckboxChecked: localStorage.getItem('showSendCheckboxChecked') || 'true',
        backgroundColor: localStorage.getItem('backgroundColor') || '#ffffff',
        quickInputChecked: localStorage.getItem('quickInputChecked') || 'false',
        linkColor: localStorage.getItem('linkColor') || '#0000ee',
        linkName: localStorage.getItem('linkName') || 'Baidu.com',
        elementHeight: localStorage.getItem('elementHeight') || '24px',
        buttonWidth: localStorage.getItem('buttonWidth') || 'Default',
        saveInputChecked: localStorage.getItem('saveInputChecked') || 'false',
        savedInputText: localStorage.getItem('savedInputText') || '',
        iframeWidth: localStorage.getItem('iframeWidth') || '100%',
        iframeHeight: localStorage.getItem('iframeHeight') || '600px',
        customSearchUrl: localStorage.getItem('customSearchUrl') || '',
        customSearchName: localStorage.getItem('customSearchName') || '自定义',
        quickLinks: localStorage.getItem('quickLinks') || '[]',
        selectHttpsTextChecked: localStorage.getItem('selectHttpsTextChecked') || 'false',
        heightPercent: localStorage.getItem('heightPercent') || '25%',
        urlInputFontSize: localStorage.getItem('urlInputFontSize') || 'Default',
        selectedEngine: localStorage.getItem('selectedEngine') || 'baidu',
        submitBtnName: localStorage.getItem('submitBtnName') || '跳转',
        linkSize: localStorage.getItem('linkSize') || '30px',
        autoNewTabChecked: localStorage.getItem('autoNewTabChecked') || 'false',
        linkImage: localStorage.getItem('linkImage'),
        backgroundImage: localStorage.getItem('backgroundImage'),
        fontColor: localStorage.getItem('fontColor') || '#000000',
        customCss: localStorage.getItem('customCss') || '',
        cssTextareaHeight: localStorage.getItem('cssTextareaHeight') || '46px',
        searchHistory: localStorage.getItem('searchHistory') || '[]',
        customSearches: localStorage.getItem('customSearches') || '[]',
        selectedCustomSearch: localStorage.getItem('selectedCustomSearch') || '',
        searchHistoryChecked: localStorage.getItem('searchHistoryChecked') || 'false',
        urlInputPlaceholder: localStorage.getItem('urlInputPlaceholder') || '输入网址',
        quickLinksColor: localStorage.getItem('quickLinksColor') || '#0000ee',
        trustJsChecked: localStorage.getItem('trustJsChecked') || 'false',
        customJs: localStorage.getItem('customJs') || '',
        hitokotoChecked: localStorage.getItem('hitokotoChecked') || 'false',
        searchEngineDisplayChecked: localStorage.getItem('searchEngineDisplayChecked') || 'false',
        searchSuggestionsChecked: localStorage.getItem('searchSuggestionsChecked') || 'false',
        autoFocusChecked: localStorage.getItem('autoFocusChecked') || 'false',
        directUrlJumpChecked: localStorage.getItem('directUrlJumpChecked') || 'false',
        showVisitWebsiteChecked: localStorage.getItem('showVisitWebsiteChecked') || 'true',
        searchContainerMargin: localStorage.getItem('searchContainerMargin') || 'Default',
        autoFillAndJumpChecked: localStorage.getItem('autoFillAndJumpChecked') || 'false',
        linkVerticalSpacing: localStorage.getItem('linkVerticalSpacing') || '',
        linkHorizontalSpacing: localStorage.getItem('linkHorizontalSpacing') || '',
        quickLinksFontSize: localStorage.getItem('quickLinksFontSize') || 'Default',
        selectedSearchApi: localStorage.getItem('selectedSearchApi') || 'baidu_sugrec',
        clearOnSearchChecked: localStorage.getItem('clearOnSearchChecked') || 'false',
        showTimeChecked: localStorage.getItem('showTimeChecked') || 'false',
        timeLinkOriginalImage: localStorage.getItem('timeLinkOriginalImage'),
        timeFormat: localStorage.getItem('timeFormat') || '24hours'
    };
    
    var jsonContent = JSON.stringify(settings, null, 2);
    var base64Content = btoa(unescape(encodeURIComponent(jsonContent)));
    var dataUrl = 'data:application/json;base64,' + base64Content;
    
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'search_settings.json';
    a.click();
}

// 导入设置功能
document.querySelector('label[for="importSettingsBtn"]').addEventListener('click', function() {
    document.getElementById('importSettingsInput').click();
});

document.getElementById('importSettingsInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var content = event.target.result;
            var settings = JSON.parse(content);
            
            // 恢复所有设置到localStorage
            var settingsKeys = Object.keys(settings);
            for (var k = 0; k < settingsKeys.length; k++) {
                var key = settingsKeys[k];
                if (settings[key] !== null) {
                    localStorage.setItem(key, settings[key]);
                }
            }
            
            // 重新加载页面应用设置
            location.reload();
        } catch (error) {
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});

// 为导入设置按钮添加拖放支持
var importSettingsLabel = document.querySelector('label[for="importSettingsBtn"]');
setupDragDrop(importSettingsLabel, function(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var content = event.target.result;
            var settings = JSON.parse(content);
            
            // 恢复所有设置到localStorage
            var settingsKeys = Object.keys(settings);
            for (var k = 0; k < settingsKeys.length; k++) {
                var key = settingsKeys[k];
                if (settings[key] !== null) {
                    localStorage.setItem(key, settings[key]);
                }
            }
            
            // 重新加载页面应用设置
            location.reload();
        } catch (error) {
        }
    };
    reader.readAsText(file);
});

// 为导入链接按钮添加拖放支持
var importLinksLabel = document.querySelector('label[for="importLinksBtn"]');
setupDragDrop(importLinksLabel, function(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var content = event.target.result;
            var links = JSON.parse(content);
            
            if (links.length > 0) {
                var existingLinks = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                var mergedLinks = existingLinks.concat(links);
                localStorage.setItem('quickLinks', JSON.stringify(mergedLinks));
                updateQuickLinks();
            }
        } catch (error) {
            // JSON解析失败
        }
    };
    reader.readAsText(file);
});

// 拖放支持函数
function setupDragDrop(element, callback) {
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.color = '#ff0000';
    });
    
    element.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.color = '';
    });
    
    element.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.color = '';
        
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            callback(files[0]);
        }
    });
}

// 在 layoutCheckbox 事件监听器附近添加以下代码
document.querySelector('label[for="heightAdjustBtn"]').addEventListener('click', function() {
    // 只有当layoutCheckbox勾选时才弹出提示
    if (!document.getElementById('layoutCheckbox').checked) {
        return;
    }
    
    var currentPercent = localStorage.getItem('heightPercent') || '25%';
    showCustomModal('请输入居中高度百分比 (5%-40%，输入为空时恢复默认25%) ：', currentPercent, function(newPercent) {
        if (newPercent === '') {
            // 输入为空时恢复默认高度
            var defaultPercent = '25%';
            var centerBox = document.getElementById('centerBoxDisplay');
            if (centerBox) {
                centerBox.style.height = defaultPercent;
            }
            document.getElementById('heightPercentValue').textContent = defaultPercent;
            localStorage.setItem('heightPercent', defaultPercent);
        } else if (/^([5-9](\.[0-9]+)?|[1-3][0-9](\.[0-9]+)?|40(\.[0]+)?)%$/.test(newPercent)) {
            // 验证输入是否在5%-40%范围内（支持小数点）
            var percentValue = parseFloat(newPercent);
            if (percentValue >= 5 && percentValue <= 40) { //>
                var centerBox = document.getElementById('centerBoxDisplay');
                if (centerBox) {
                    centerBox.style.height = newPercent;
                }
                document.getElementById('heightPercentValue').textContent = newPercent;
                localStorage.setItem('heightPercent', newPercent);
            }
        }
    });
});

// 搜索建议功能
var searchSuggestions = document.getElementById('searchSuggestions');

function showSearchSuggestions(suggestions) {
    if (!document.getElementById('searchSuggestionsCheckbox').checked || document.getElementById('engineSelect').value === 'httpsAutoFill') return;
    
    // 检测输入内容是否包含网址格式
    var inputText = document.getElementById('urlInput').value.trim();
    var isUrlPattern = false;
    
    var urlPatterns = [
        /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
        /\.[a-zA-Z]{2,}/,
        /^https?:\/\//,
        /^www\./,
        /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z]{2,}/
    ];
    
    for (var i = 0; i < urlPatterns.length; i++) {
        if (urlPatterns[i].test(inputText)) {
            isUrlPattern = true;
            break;
        }
    }
    
    // 额外检测包含斜杠的网址格式（如 m.baidu.com/xxx）
    if (!isUrlPattern && inputText.indexOf('/') !== -1) {
        var slashIndex = inputText.indexOf('/');
        var beforeSlash = inputText.substring(0, slashIndex);
        
        // 检查斜杠前的内容是否符合网址格式
        for (var i = 0; i < urlPatterns.length; i++) {
            if (urlPatterns[i].test(beforeSlash)) {
                isUrlPattern = true;
                break;
            }
        }
    }
    
    searchSuggestions.innerHTML = '';
    
    if (document.getElementById('searchSuggestionsCheckbox').checked && isDesktop()) {
        searchSuggestions.style.maxHeight = '800px';
    }
    
    // 如果检测到网址格式，在建议列表第一位添加访问网站选项
    if (isUrlPattern && inputText.length > 0 && document.getElementById('showVisitWebsiteCheckbox').checked) {
        var visitDiv = document.createElement('div');
        
        // 创建文本内容
        var visitText = document.createElement('span');
        visitText.textContent = '访问: ' + inputText;
        
        // 电脑端时添加Alt+Enter提示
        var altEnterText = null;
        if (isDesktop()) {
            altEnterText = document.createElement('span');
            altEnterText.textContent = 'Alt+Enter';
            altEnterText.style.color = '#666';
            altEnterText.style.fontSize = '10px';
            altEnterText.style.marginLeft = '10px';
        }
        
        visitDiv.appendChild(visitText);
        if (altEnterText) {
            visitDiv.appendChild(altEnterText);
        }
        
        visitDiv.style.padding = isDesktop() ? '6px 10px' : '5px 10px';
        visitDiv.style.cursor = 'pointer';
        visitDiv.style.borderBottom = '1px solid #eee';
        visitDiv.style.fontWeight = 'bold';
        visitDiv.style.fontSize = isDesktop() ? '11px' : '13px';
        visitDiv.style.backgroundColor = '#f8f8f8';
        visitDiv.style.display = 'flex';
        visitDiv.style.justifyContent = 'space-between';
        visitDiv.style.alignItems = 'center';
        
        visitText.style.overflow = 'hidden';
        visitText.style.textOverflow = 'ellipsis';
        visitText.style.whiteSpace = 'nowrap';
        visitText.style.display = 'inline-block';
        visitText.style.verticalAlign = 'middle';
        
        visitDiv.onclick = function() {
            var engine = document.getElementById('engineSelect').value;
            var url = inputText;
            
            // 检查是否已包含协议
            var hasProtocol = url.indexOf('://') !== -1;
            var isRelativePath = url.indexOf('/') === 0;
            
            // 根据选择的引擎处理URL
            if (!hasProtocol && !isRelativePath) {
                // 如果没有协议前缀且不是相对路径，根据选择的引擎添加
                if (engine === 'autofillHttp1') {
                    url = 'http://' + url;
                } else if (engine === 'autofillHttps') {
                    url = 'https://' + url;
                } else if (engine === 'iFrameFree') {
                    url = 'https://' + url;
                } else {
                    // 默认添加https://
                    url = 'https://' + url;
                }
            }
            
            // 记录搜索历史（如果启用了searchHistoryCheckbox）
            if (inputText && document.getElementById('searchHistoryCheckbox').checked) {
                var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                if (inputText === 'https://' || inputText === 'http://') {
                    // 不记录空协议
                } else {
                    // 移除重复项
                    var filteredHistory = history.filter(function(item) {
                        return item.text !== inputText;
                    });
                    // 添加到开头
                    filteredHistory.unshift({ text: inputText });
                    // 限制最多10条记录
                    var limitedHistory = filteredHistory.slice(0, 10);
                    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
                    updateSearchHistory();
                }
            }
            
            // 如果是iFrameFree，在iframe中打开
            if (engine === 'iFrameFree') {
                document.getElementById('webFrame').src = url;
                document.getElementById('iframeContainer').style.display = 'block';
                searchSuggestions.style.display = 'none';
            } else {
                window.open(url, '_blank');
                urlInput.blur();
            }
            
            // 搜索后清空输入功能
            if (document.getElementById('clearOnSearchCheckbox').checked && engine !== 'iFrameFree') {
                setTimeout(function() {
                    document.getElementById('urlInput').value = '';
                    // 如果保存输入文本复选框被勾选，同时清空保存的文本
                    if (document.getElementById('saveInputCheckbox').checked) {
                        localStorage.removeItem('savedInputText');
                    }
                }, 0);
            }
        };
        
        var visitUrl = inputText;
        var visitEngine = document.getElementById('engineSelect').value;
        
        visitDiv.onmouseover = function() {
            this.style.backgroundColor = '#e0e0e0';
        };
        visitDiv.onmouseout = function() {
            this.style.backgroundColor = '#f8f8f8';
        };
        
        searchSuggestions.appendChild(visitDiv);
    }
    
    // 原有的建议显示代码（保持原样）
    if (suggestions && suggestions.length > 0) {
        for (var i = 0; i < suggestions.length; i++) {
            var div = document.createElement('div');
            div.textContent = suggestions[i];
            div.style.padding = isDesktop() ? '7px 10px' : '6px 10px';
            div.style.fontSize = isDesktop() ? '12.4px' : '';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #eee';
            div.style.overflow = 'hidden';
            div.style.textOverflow = 'ellipsis';
            
            (function(suggestion) {
                div.onclick = function() {
                    if (document.getElementById('autoFillAndJumpCheckbox').checked) {
                        // 自动填充并跳转
                        document.getElementById('urlInput').value = suggestion;
                        // 如果保存输入文本复选框被勾选，保存当前输入
                        if (document.getElementById('saveInputCheckbox').checked) {
                            localStorage.setItem('savedInputText', suggestion);
                        }
                        // 触发搜索跳转
                        document.getElementById('submitBtn').click();
                        document.getElementById('urlInput').blur();
                        if (document.getElementById('clearOnSearchCheckbox').checked && engine !== 'iFrameFree') {
                            setTimeout(function() {
                                document.getElementById('urlInput').value = '';
                                // 如果保存输入文本复选框被勾选，同时清空保存的文本
                                if (document.getElementById('saveInputCheckbox').checked) {
                                    localStorage.removeItem('savedInputText');
                                }
                            }, 0);
                        }
                    } else {
                        // 原有逻辑：仅填充不跳转
                        document.getElementById('urlInput').value = suggestion;
                        // 如果保存输入文本复选框被勾选，保存当前输入
                        if (document.getElementById('saveInputCheckbox').checked) {
                            localStorage.setItem('savedInputText', suggestion);
                        }
                        // 不隐藏搜索建议列表，保持显示
                        // 自动更新搜索建议
                        fetchSearchSuggestions(suggestion);
                        // 保持输入框焦点
                        document.getElementById('urlInput').focus();
                    }
                };
            })(suggestions[i]);
            
            div.onmouseover = function() {
                this.style.backgroundColor = '#f0f0f0';
            };
            div.onmouseout = function() {
                this.style.backgroundColor = '';
            };
            searchSuggestions.appendChild(div);
        }
        searchSuggestions.style.display = 'block';
        updateSuggestionsPosition();
    } else {
        // 只有网址选项时也显示
        if (isUrlPattern) {
            searchSuggestions.style.display = 'block';
            updateSuggestionsPosition();
        } else {
            searchSuggestions.style.display = 'none';
            // 隐藏搜索建议时恢复quickInputUi位置
            resetQuickInputPosition();
            // 隐藏搜索建议时恢复quickInputUi位置
            if (document.getElementById('quickInputCheckbox').checked) {
                var quickInputBtn = document.getElementById('quickInputBtn');
                quickInputBtn.style.marginTop = '0px';
            }
        }
    }
}

// 监听autoFillAndJumpCheckbox变化
document.getElementById('autoFillAndJumpCheckbox').addEventListener('change', function() {
    localStorage.setItem('autoFillAndJumpChecked', this.checked);
});

// 加载保存的autoFillAndJumpCheckbox状态
var savedAutoFillAndJumpState = localStorage.getItem('autoFillAndJumpChecked');
if (savedAutoFillAndJumpState === 'true') {
    document.getElementById('autoFillAndJumpCheckbox').checked = true;
}

document.getElementById('urlInput').addEventListener('keydown', function(e) {
    e = e || window.event;
    var keyCode = e.keyCode || e.which;
    
    // 检查是否按下了 alt + enter
    if (keyCode === 13 && e.altKey) {
        // 检查搜索建议是否显示并且包含访问建议
        var searchSuggestions = document.getElementById('searchSuggestions');
        if (searchSuggestions.style.display === 'block') {
            // 检查第一个建议项是否是访问网站建议
            var firstSuggestion = searchSuggestions.firstChild;
            if (firstSuggestion && firstSuggestion.textContent.indexOf('访问:') === 0) {
                // 获取当前输入框的值
                var inputText = this.value.trim();
                if (inputText) {
                    // 模拟点击访问建议
                    firstSuggestion.click();
                    e.preventDefault();
                    return false;
                }
            }
        }
    }
});

// 获取搜索建议
function fetchSearchSuggestions(query) {
    // 检查是否启用搜索建议功能
    if (!document.getElementById('searchSuggestionsCheckbox').checked || document.getElementById('engineSelect').value === 'iFrameFree') return;
    
    if (!query || query.trim() === '') {
        // 空查询时显示搜索热词
        searchSuggestions.style.display = 'none';
        resetQuickInputPosition();
        setTimeout(function() {
            searchSuggestions.style.display = 'none';
            resetQuickInputPosition();
        }, 100);
        return;
    }
    
    // 根据选择的API源构建请求URL
    var apiSelect = document.getElementById('searchApiSelect');
    var apiType = apiSelect ? apiSelect.value : 'baidu_sugrec';
    var apiUrl = '';
    
    if (apiType === 'baidu_sugrec') {
        apiUrl = 'https://www.baidu.com/sugrec?prod=pc&wd=' + encodeURIComponent(query) + '&cb=window.handleSuggestion';
    } else if (apiType === 'baidu_su') {
        apiUrl = 'https://suggestion.baidu.com/su?wd=' + encodeURIComponent(query) + '&cb=window.handleSuggestion&t=' + new Date().getTime();
    }
    
    // 创建script标签进行JSONP请求（兼容所有浏览器）
    var script = document.createElement('script');
    script.src = apiUrl;
    document.head.appendChild(script);
    
    // 设置超时处理
    setTimeout(function() {
        // 检查输入框是否失焦，如果失焦则不再执行后续代码
        if (document.activeElement !== document.getElementById('urlInput')) {
            // 如果输入框没有焦点，清理script标签但不执行本地建议
            if (script.parentNode === document.head) {
                document.head.removeChild(script);
            }
            return;
        }
        
        if (script.parentNode === document.head) {
            document.head.removeChild(script);
            // 如果API失败，显示本地建议
            var localSuggestions = [query];
            showSearchSuggestions(localSuggestions);
        }
    }, 3000);
}

// 监听API源选择变化
document.getElementById('searchApiSelect').addEventListener('change', function() {
    localStorage.setItem('selectedSearchApi', this.value);
});

// 加载保存的搜索建议API源
var savedSearchApi = localStorage.getItem('selectedSearchApi');
if (savedSearchApi) {
    document.getElementById('searchApiSelect').value = savedSearchApi;
}

// 处理百度搜索建议回调
window.handleSuggestion = function(data) {
    // 移除script标签
    var scripts = document.head.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src.indexOf('sugrec') > -1 || scripts[i].src.indexOf('suggestion.baidu.com') > -1) {
            document.head.removeChild(scripts[i]);
        }
    }
    
    // 根据API类型解析数据
    var apiSelect = document.getElementById('searchApiSelect');
    var apiType = apiSelect ? apiSelect.value : 'baidu_sugrec';
    var suggestions = [];
    
    if (apiType === 'baidu_sugrec') {
        // 解析sugrec格式
        if (data && data.g && data.g.length > 0) {
            for (var j = 0; j < data.g.length; j++) {
                if (data.g[j] && data.g[j].q) {
                    suggestions.push(data.g[j].q);
                }
            }
        }
    } else if (apiType === 'baidu_su') {
        // 解析su格式 - 兼容低版本浏览器的JSONP回调格式
        try {
            // 检查是否是百度su API返回的格式
            if (typeof data === 'string') {
                // 尝试解析字符串格式的JSONP响应
                var match = data.match(/window\.handleSuggestion\((.+)\)/);
                if (match && match[1]) {
                    var parsedData = JSON.parse(match[1]);
                    if (parsedData && parsedData.s && parsedData.s.length > 0) {
                        suggestions = parsedData.s;
                    }
                }
            } else if (data && data.s && data.s.length > 0) {
                // 直接处理对象格式
                suggestions = data.s;
            } else if (data && Array.isArray(data)) {
                // 处理旧格式的数组响应
                suggestions = data;
            }
        } catch (e) {
            // 解析失败，使用备用方案
        }
    }
    
    if (suggestions.length > 0) {
        showSearchSuggestions(suggestions);
    } else {
        var localSuggestions = [document.getElementById('urlInput').value.trim()];
        showSearchSuggestions(localSuggestions);
    }
};

// 输入框焦点事件
document.getElementById('urlInput').addEventListener('focus', function() {
    var query = this.value.trim();
    fetchSearchSuggestions(query);
    
    // 定位搜索建议框（兼容所有浏览器）
    var inputRect = this.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    
    searchSuggestions.style.top = (inputRect.bottom + scrollTop) + 'px';
    searchSuggestions.style.left = (inputRect.left + scrollLeft) + 'px';
    searchSuggestions.style.width = (inputRect.width - 2) + 'px';
});

// 输入框输入事件
document.getElementById('urlInput').addEventListener('input', function() {
    if (!document.getElementById('searchSuggestionsCheckbox').checked) return;
    
    var query = this.value.trim();
    fetchSearchSuggestions(query);
    
    // 立即更新建议框位置（确保网址检测后能正确显示）
    setTimeout(function() {
        if (document.getElementById('searchSuggestionsCheckbox').checked) {
            updateSuggestionsPosition();
        }
        if (document.getElementById('urlInput').value === '') {
            searchSuggestions.style.display = 'none';
            resetQuickInputPosition();
            setTimeout(function() {
                searchSuggestions.style.display = 'none';
                resetQuickInputPosition();
            }, 100);
            setTimeout(function() {
                searchSuggestions.style.display = 'none';
                resetQuickInputPosition();
            }, 150);
        }
    }, 10);
});

// 输入框失焦事件
document.getElementById('urlInput').addEventListener('blur', function() {
    setTimeout(function() {
        searchSuggestions.style.display = 'none';
    }, 100);
    setTimeout(function() {
        searchSuggestions.style.display = 'none';
    }, 150);
});

// 点击搜索建议时阻止失焦
searchSuggestions.addEventListener('mousedown', function(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    return false;
});

// 保存和加载搜索建议checkbox状态
var savedSearchSuggestionsState = localStorage.getItem('searchSuggestionsChecked');
if (savedSearchSuggestionsState === 'true') {
    document.getElementById('searchSuggestionsCheckbox').checked = true;
    if (document.getElementById('searchSuggestionsCheckbox').checked) {
        setTimeout(function() {
            searchSuggestions.style.display = 'none';
        }, 100);
    }
    document.getElementById('showVisitWebsiteCheckbox').disabled = !document.getElementById('searchSuggestionsCheckbox').checked;
    document.getElementById('autoFillAndJumpCheckbox').disabled = !document.getElementById('searchSuggestionsCheckbox').checked;
}

// 输入框焦点事件
document.getElementById('urlInput').addEventListener('focus', function() {
    if (!document.getElementById('searchSuggestionsCheckbox').checked) return;
    
    var query = this.value.trim();
    fetchSearchSuggestions(query);
    updateSuggestionsPosition();
});

// 更新搜索建议框位置和尺寸
function updateSuggestionsPosition() {
    var urlInput = document.getElementById('urlInput');
    var inputRect = urlInput.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    
    searchSuggestions.style.top = (inputRect.bottom + scrollTop) + 'px';
    searchSuggestions.style.left = (inputRect.left + scrollLeft) + 'px';
    searchSuggestions.style.width = (inputRect.width - 2) + 'px';
    
    // 如果启用了quickInputCheckbox且搜索建议显示，调整quickInputUi位置
    if (document.getElementById('quickInputCheckbox').checked &&
        document.getElementById('searchSuggestionsCheckbox').checked &&
        searchSuggestions.style.display === 'block') {
        var quickInputBtn = document.getElementById('quickInputBtn');
        var suggestionsHeight = searchSuggestions.offsetHeight;
        quickInputBtn.style.marginTop = (suggestionsHeight + 10) + 'px';
    }
}

// 恢复quickInputUi位置
function resetQuickInputPosition() {
    if (document.getElementById('quickInputCheckbox').checked) {
        var quickInputBtn = document.getElementById('quickInputBtn');
        quickInputBtn.style.marginTop = '0px';
    }
}

// 监听搜索建议checkbox变化
document.getElementById('searchSuggestionsCheckbox').addEventListener('change', function() {
    localStorage.setItem('searchSuggestionsChecked', this.checked);
    if (!this.checked) {
        searchSuggestions.style.display = 'none';
        // 取消勾选时恢复quickInputUi位置
        resetQuickInputPosition();
    }
    // 控制showVisitWebsiteCheckbox的disabled状态
    document.getElementById('showVisitWebsiteCheckbox').disabled = !this.checked;
    if (!this.checked) {
        searchSuggestions.style.display = 'none';
    }
    // 控制autoFillAndJumpCheckbox的disabled状态
    document.getElementById('autoFillAndJumpCheckbox').disabled = !this.checked;
    if (!this.checked) {
        searchSuggestions.style.display = 'none';
    }
});

// 输入框失焦事件
document.getElementById('urlInput').addEventListener('blur', function() {
    setTimeout(function() {
        // 只有在未启用搜索建议功能时才隐藏
        if (!document.getElementById('searchSuggestionsCheckbox').checked) {
            searchSuggestions.style.display = 'none';
            resetQuickInputPosition();
        }
    }, 100);
});

// 窗口尺寸变化时更新搜索建议框位置
window.addEventListener('resize', function() {
    if (document.getElementById('searchSuggestionsCheckbox').checked && searchSuggestions.style.display === 'block') {
        updateSuggestionsPosition();
    }
});

// 在加载保存的布局复选框状态部分添加以下代码
var savedHeightPercent = localStorage.getItem('heightPercent');
if (savedHeightPercent) {
    document.getElementById('heightPercentValue').textContent = savedHeightPercent;
    // 只有当布局居中启用时才应用保存的高度
    if (document.getElementById('layoutCheckbox').checked) {
        document.getElementById('centerBoxDisplay').style.height = savedHeightPercent;
    }
}

// 更新快捷链接显示
function updateQuickLinks() {
    var quickLinksDiv = document.getElementById('quickLinks');
    var links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
    var isShowCheckbox = document.getElementById('engineSelect').value === 'showCheckbox';
    
    quickLinksDiv.innerHTML = '';
    
    setTimeout(function() {
        var savedColor = localStorage.getItem('quickLinksColor');
        if (savedColor) {
            updateQuickLinksColor(savedColor);
        }
    }, 0);
    
    // 添加防止链接变紫色的样式
    var style = document.createElement('style');
    style.textContent = [
        '#quickLinks a:visited {',
        '    color: ' + (localStorage.getItem('quickLinksColor') || '#0000ee') + ' !important;',
        '}',
        '#quickLinks a:active {',
        '    color: #ff0000 !important;',
        '}'
    ].join('');
    document.head.appendChild(style);
    
    if (links.length === 0) {
        quickLinksDiv.style.display = 'none';
        return;
    }
    
    quickLinksDiv.style.display = 'block';
    quickLinksDiv.style.textAlign = 'center';
    
    var container = document.createElement('div');
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.justifyContent = 'center';
    container.style.flexWrap = 'wrap';
    container.style.margin = '10px';
    container.style.left = '0';
    container.style.right = '0';
    container.style.margin = '0 auto';
    
    links.forEach(function(link, index) {
        var linkElement = document.createElement('a');
        linkElement.href = link.url.indexOf('http') === 0 ? link.url : '#';
        linkElement.textContent = link.text;
        linkElement.style.margin = '0 5px';
        linkElement.target = '_blank';
        
        // 应用保存的字体大小
        var savedQuickLinksFontSize = localStorage.getItem('quickLinksFontSize');
        if (savedQuickLinksFontSize) {
            linkElement.style.fontSize = savedQuickLinksFontSize;
        }
        
        // 在这里添加点击事件处理
        linkElement.addEventListener('click', function(e) {
            // 当选择showCheckbox时，阻止默认跳转并显示编辑对话框
            if (document.getElementById('engineSelect').value === 'showCheckbox') {
                e.preventDefault();
                
                showCustomDoubleInput(
                    '编辑快捷链接-<a href="' + link.url + '" target="_blank" onclick="setTimeout(function(){var cancelBtn=document.querySelector(\'label[onclick*=\\\'doubleInputCallback_\\\']\');if(cancelBtn)cancelBtn.click();},100)">直达</a>',
                    '输入链接显示文本',
                    '输入URL地址（必须以 https://、http:// 开头）',
                    link.text,
                    link.url,
                    function(text, url) {
                        if (text && url) {
                            // 验证格式
                            if (url.indexOf('https://') !== 0 && url.indexOf('http://') !== 0 && url.indexOf('#') !== 0) {
                                return;
                            }
                            
                            // 更新链接
                            var updatedLinks = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                            updatedLinks[index] = { url: url, text: text };
                            localStorage.setItem('quickLinks', JSON.stringify(updatedLinks));
                            
                            // 更新显示
                            updateQuickLinks();
                        }
                    }
                );
            }
        });
        
        var linkContainer = document.createElement('span'); // 修改这里
        linkContainer.style.display = 'inline-flex'; // 修改这里
        linkContainer.style.alignItems = 'center';
        linkContainer.style.margin = '0 0'; // 添加这行
        linkContainer.style.display = 'inline-block';
        
        // 只在showCheckbox时显示删除按钮
        if (isShowCheckbox) {
            var deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.style.marginLeft = '5px';
            deleteBtn.onclick = function(e) {
                e.preventDefault();
                var updatedLinks = links.filter(function(_, i) {
                    return i !== index;
                });
                localStorage.setItem('quickLinks', JSON.stringify(updatedLinks));
                updateQuickLinks();
            };
            linkContainer.appendChild(linkElement);
            linkContainer.appendChild(deleteBtn);
        } else {
            linkContainer.appendChild(linkElement);
        }
        
        container.appendChild(linkContainer);
    });
    
    quickLinksDiv.appendChild(container);
    applyLinkSpacing();
}

// quickLinks字体大小调整功能
document.querySelector('label[for="quickLinksSizePicker"]').addEventListener('click', function() {
    var currentSize = localStorage.getItem('quickLinksFontSize') || 'Default';
    showCustomModal('请输入超链接字体大小（如 14px，输入为空时恢复默认）：',
        currentSize === 'Default' ? '' : currentSize,
        function(newSize) {
            if (newSize === '') {
                // 输入为空时恢复默认大小
                var quickLinks = document.getElementById('quickLinks').getElementsByTagName('a');
                for (var i = 0; i < quickLinks.length; i++) {
                    quickLinks[i].style.fontSize = '';
                }
                document.getElementById('quickLinksSizeValue').textContent = 'Default';
                localStorage.removeItem('quickLinksFontSize');
            } else if (/^\d+(\.\d+)?%$/.test(newSize) || /^\d+(\.\d+)?(px|in|mm|pt)$/.test(newSize)) {
                var quickLinks = document.getElementById('quickLinks').getElementsByTagName('a');
                for (var i = 0; i < quickLinks.length; i++) {
                    quickLinks[i].style.fontSize = newSize;
                }
                document.getElementById('quickLinksSizeValue').textContent = newSize;
                localStorage.setItem('quickLinksFontSize', newSize);
            }
        });
});

// 加载保存的quickLinks字体大小设置
var savedQuickLinksFontSize = localStorage.getItem('quickLinksFontSize');
if (savedQuickLinksFontSize) {
    setTimeout(function() {
        var quickLinks = document.getElementById('quickLinks').getElementsByTagName('a');
        for (var i = 0; i < quickLinks.length; i++) {
            quickLinks[i].style.fontSize = savedQuickLinksFontSize;
        }
        document.getElementById('quickLinksSizeValue').textContent = savedQuickLinksFontSize;
    }, 0);
}

// 添加位置：在现有按钮事件监听代码后添加超链接间距调整功能
document.querySelector('label[for="linkSpacingBtn"]').addEventListener('click', function() {
    // 获取当前保存的间距设置
    var savedHorizontalSpacing = localStorage.getItem('linkHorizontalSpacing') || '0';
    var savedVerticalSpacing = localStorage.getItem('linkVerticalSpacing') || '0';
    
    showCustomDoubleInput(
        '设置超链接间距',
        '输入左右间距（如 10px，输入空值恢复默认）',
        '输入上下间距（如 5px，输入空值恢复默认）',
        savedHorizontalSpacing === '0' ? '' : savedHorizontalSpacing,
        savedVerticalSpacing === '0' ? '' : savedVerticalSpacing,
        function(horizontalSpacing, verticalSpacing) {
            if (horizontalSpacing !== null && verticalSpacing !== null) {
                // 保存间距设置
                if (horizontalSpacing === '') {
                    localStorage.setItem('linkHorizontalSpacing', '0');
                } else if (/^\d+(\.\d+)?(px|in|mm|pt|em|rem)$/.test(horizontalSpacing)) {
                    localStorage.setItem('linkHorizontalSpacing', horizontalSpacing);
                }
                
                if (verticalSpacing === '') {
                    localStorage.setItem('linkVerticalSpacing', '0');
                } else if (/^\d+(\.\d+)?(px|in|mm|pt|em|rem)$/.test(verticalSpacing)) {
                    localStorage.setItem('linkVerticalSpacing', verticalSpacing);
                }
                
                // 应用间距设置到现有超链接
                applyLinkSpacing();
            }
        }
    );
});

// 应用超链接间距的函数
function applyLinkSpacing() {
    var horizontalSpacing = localStorage.getItem('linkHorizontalSpacing') || '0';
    var verticalSpacing = localStorage.getItem('linkVerticalSpacing') || '0';
    
    var quickLinks = document.getElementById('quickLinks');
    if (quickLinks) {
        var linkContainers = quickLinks.querySelectorAll('span');
        var links = quickLinks.getElementsByTagName('a');
        
        // 设置每个链接容器的间距
        for (var i = 0; i < linkContainers.length; i++) {
            if (horizontalSpacing !== '0') {
                linkContainers[i].style.marginLeft = horizontalSpacing;
            } else {
                linkContainers[i].style.marginLeft = '';
            }
            
            if (verticalSpacing !== '0') {
                linkContainers[i].style.marginTop = verticalSpacing;
                linkContainers[i].style.marginBottom = verticalSpacing;
            } else {
                linkContainers[i].style.marginTop = '';
                linkContainers[i].style.marginBottom = '';
            }
        }
        
        // 设置每个链接的间距
        for (var j = 0; j < links.length; j++) {
            if (horizontalSpacing !== '0') {
                links[j].style.marginLeft = horizontalSpacing;
            } else {
                links[j].style.marginLeft = '5px';
            }
            
            if (verticalSpacing !== '0') {
                links[j].style.marginTop = verticalSpacing;
                links[j].style.marginBottom = verticalSpacing;
            } else {
                links[j].style.marginTop = '';
                links[j].style.marginBottom = '';
            }
        }
    }
}

document.querySelector('label[for="quickLinksColorPicker"]').addEventListener('click', function() {
    var currentColor = localStorage.getItem('quickLinksColor') || '#0000ee';
    showCustomModal('请输入快捷链接颜色值（如 #0000ee 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);try{var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';colorPicker.value=\'' + currentColor + '\';colorPicker.style.position=\'fixed\';colorPicker.style.left=\'50%\';colorPicker.style.top=\'50%\';colorPicker.style.transform=\'translate(-50%,-50%)\';colorPicker.style.width=\'1px\';colorPicker.style.height=\'1px\';colorPicker.style.opacity=\'0.001\';colorPicker.style.zIndex=\'10001\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){colorPicker.focus&&colorPicker.focus();colorPicker.click&&colorPicker.click();},50);}catch(e){}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newValue) {
        if (newValue !== null) {
            if (newValue === '') {
                // 输入为空时恢复默认颜色
                var defaultColor = '#0000ee';
                updateQuickLinksColor(defaultColor);
                document.getElementById('quickLinksColorValue').textContent = defaultColor;
                localStorage.setItem('quickLinksColor', defaultColor);
                updateQuickLinks(); // 添加此行
            } else if (/^#([0-9A-F]{3,6})$/i.test(newValue) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue) || /^[a-z]+$/i.test(newValue) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue)) {
                updateQuickLinksColor(newValue);
                document.getElementById('quickLinksColorValue').textContent = newValue;
                localStorage.setItem('quickLinksColor', newValue);
                truncateText('quickLinksColorValue', newValue, 80);
                updateQuickLinks(); // 添加此行
            }
        }
    });
});

// 更新快捷链接颜色的函数
function updateQuickLinksColor(color) {
    var quickLinks = document.getElementById('quickLinks').getElementsByTagName('a');
    for (var i = 0; i < quickLinks.length; i++) {
        quickLinks[i].style.color = color;
    }
}

// 加载保存的快捷链接颜色
var savedQuickLinksColor = localStorage.getItem('quickLinksColor');
if (savedQuickLinksColor) {
    document.getElementById('quickLinksColorValue').textContent = savedQuickLinksColor;
    updateQuickLinksColor(savedQuickLinksColor);
}

// 通用弹窗函数（兼容所有浏览器版本）
function showCustomModal(title, currentValue, callback) {
    // 禁止页面滚动（兼容所有浏览器）
    var originalBodyOverflow = document.body.style.overflow;
    var originalHtmlOverflow = document.documentElement.style.overflow;
    var originalScrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var originalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 兼容所有浏览器的滚动禁止
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originalScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    var modal = document.createElement('div');
    modal.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: rgba(0,0,0,0.5)',
        'z-index: 10000',
        'display: flex',
        'justify-content: center',
        'align-items: center'
    ].join(';');
    
    setTimeout(function() {
        centerModalElement(modal);
    }, 0);
    
    // 创建唯一的回调函数名称以避免冲突
    var callbackName = 'modalCallback_' + Date.now();
    window[callbackName] = function(value) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // 恢复页面滚动（兼容所有浏览器）
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // 恢复滚动位置
        window.scrollTo(originalScrollX, originalScrollY);
        
        if (typeof callback === 'function') {
            callback(value);
        }
        // 清理全局函数
        setTimeout(function() {
            delete window[callbackName];
        }, 100);
    };
    
    // 添加输入事件监听来更新颜色预览
    setTimeout(function() {
        var input = document.getElementById('modalInput_' + callbackName);
        var colorPreview = document.getElementById('colorPreview');
        if (input && colorPreview) {
            input.addEventListener('input', function() {
                colorPreview.style.background = this.value;
            });
        }
    }, 0);
    
    modal.innerHTML = [
        '<div id="userSelectModalDisabled" style="background: #ffffff; padding: 20px; border-radius: 3px; width: 72%; max-width: 320px;">',
        '<p style="margin-top: 0; user-select: none; text-align: left;">' + title + '</p>',
        '<input type="search" id="modalInput_' + callbackName + '" placeholder="请输入" value="' + (currentValue || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(null)">取消</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="var input=document.getElementById(\'modalInput_' + callbackName + '\');window.' + callbackName + '(input?input.value:null)">确定</label>',
        '</div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(modal);
}

// 修改后的通用确认对话框函数（兼容所有浏览器）
function showCustomConfirm(title, callback) {
    // 禁止页面滚动（兼容所有浏览器）
    var originalBodyOverflow = document.body.style.overflow;
    var originalHtmlOverflow = document.documentElement.style.overflow;
    var originalScrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var originalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 兼容所有浏览器的滚动禁止
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originalScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    var modal = document.createElement('div');
    modal.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: rgba(0,0,0,0.5)',
        'z-index: 10000',
        'display: flex',
        'justify-content: center',
        'align-items: center'
    ].join(';');
    
    setTimeout(function() {
        centerModalElement(modal);
    }, 0);
    
    // 创建唯一的回调函数名称以避免冲突
    var callbackName = 'confirmCallback_' + Date.now();
    window[callbackName] = function(result) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // 恢复页面滚动（兼容所有浏览器）
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // 恢复滚动位置
        window.scrollTo(originalScrollX, originalScrollY);
        
        if (typeof callback === 'function') {
            callback(result);
        }
        // 清理全局函数
        setTimeout(function() {
            delete window[callbackName];
        }, 100);
    };
    
    modal.innerHTML = [
        '<div id="userSelectModalDisabled" style="background: #ffffff; padding: 20px; border-radius: 3px; width: 72%; max-width: 320px;">',
        '<p style="margin-top: 0; user-select: none; text-align: left;">' + title + '</p>',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(false)">取消' + (isDesktop() ? '(1)' : '') + '</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="window.' + callbackName + '(true)">确定' + (isDesktop() ? '(2)' : '') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 添加键盘事件处理函数
    modal._keyHandler = function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        // 按数字键1 (keyCode 49) 或 数字小键盘1 (keyCode 97) 为取消
        if (keyCode === 49 || keyCode === 97) {
            window[callbackName](false);
            e.preventDefault();
            return false;
        }
        
        // 按数字键2 (keyCode 50) 或 数字小键盘2 (keyCode 98) 为确定
        if (keyCode === 50 || keyCode === 98) {
            window[callbackName](true);
            e.preventDefault();
            return false;
        }
    };
    
    // 添加键盘事件监听
    document.addEventListener('keydown', modal._keyHandler);
    
    document.body.appendChild(modal);
}

// 双输入框通用弹窗函数（兼容所有浏览器版本）
function showCustomDoubleInput(title, label1, label2, currentValue1, currentValue2, callback) {
    // 禁止页面滚动（兼容所有浏览器）
    var originalBodyOverflow = document.body.style.overflow;
    var originalHtmlOverflow = document.documentElement.style.overflow;
    var originalScrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var originalScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 兼容所有浏览器的滚动禁止
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originalScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    
    var modal = document.createElement('div');
    modal.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'background: rgba(0,0,0,0.5)',
        'z-index: 10000',
        'display: flex',
        'justify-content: center',
        'align-items: center'
    ].join(';');
    
    setTimeout(function() {
        centerModalElement(modal);
    }, 0);
    
    // 创建唯一的回调函数名称以避免冲突
    var callbackName = 'doubleInputCallback_' + Date.now();
    window[callbackName] = function(value1, value2) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // 恢复页面滚动（兼容所有浏览器）
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // 恢复滚动位置
        window.scrollTo(originalScrollX, originalScrollY);
        
        if (typeof callback === 'function') {
            callback(value1, value2);
        }
        // 清理全局函数
        setTimeout(function() {
            delete window[callbackName];
        }, 100);
    };
    
    modal.innerHTML = [
        '<div id="userSelectModalDisabled" style="background: #ffffff; padding: 20px; border-radius: 3px; width: 72%; max-width: 320px;">',
        '<p style="margin-top: 0; user-select: none; text-align: left;">' + title + '</p>',
        '<div style="text-align: left; margin-bottom: 10px;">',
        '<div style="font-size: 12px; user-select: none; color: #666; margin-bottom: 5px;">' + label1 + '</div>',
        '<input type="text" id="doubleInput1_' + callbackName + '" placeholder="请输入" value="' + (currentValue1 || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '</div>',
        '<div style="text-align: left; margin-bottom: 15px;">',
        '<div style="font-size: 12px; user-select: none; color: #666; margin-bottom: 5px;">' + label2 + '</div>',
        '<input type="text" id="doubleInput2_' + callbackName + '" placeholder="请输入" value="' + (currentValue2 || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '</div>',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(null, null)">取消</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="var input1=document.getElementById(\'doubleInput1_' + callbackName + '\'),input2=document.getElementById(\'doubleInput2_' + callbackName + '\');window.' + callbackName + '(input1?input1.value:null,input2?input2.value:null)">确定</label>',
        '</div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(modal);
}

function centerModalElement(modal) {
    var modalContent = modal.firstChild;
    if (modalContent) {
        // 计算居中位置的函数
        function updateModalPosition() {
            var modalWidth = modalContent.offsetWidth;
            var modalHeight = modalContent.offsetHeight;
            var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            
            // 对于移动设备，确保模态框不会超出屏幕
            if (modalWidth > windowWidth * 0.9) {
                modalContent.style.width = '90%';
                modalWidth = modalContent.offsetWidth;
            }
            
            var leftPos = (windowWidth - modalWidth) / 2;
            var topPos = (windowHeight - modalHeight) / 2;
            
            // 设置绝对定位居中
            modalContent.style.position = 'absolute';
            modalContent.style.left = (leftPos > 0 ? leftPos : 0) + 'px';
            modalContent.style.top = (topPos > 0 ? topPos : 0) + 'px';
        }
        
        // 初始居中
        updateModalPosition();
        
        // 窗口大小改变时重新居中
        var resizeHandler = function() {
            updateModalPosition();
        };
        
        // 保存到modal对象上，以便移除事件监听
        modal._resizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler);
    }
}

// 清除所有设置功能
document.querySelector('label[for="clearAllSettingsBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要重置设置吗？此操作将清除所有已保存设置，并清除所有快捷链接和自定义搜索，请在进行此操作前备份本地数据。', function(result) {
        if (result) {
            // 第一个确认框点击确定后，保持滚动禁止状态，直接显示第二个输入框
            showCustomModal('请输入 "Clear All" 继续操作：', '', function(inputText) {
                // 验证输入内容（不区分大小写）
                if (inputText && inputText.toLowerCase() === 'clear all') {
                    clearAllSettingsThreeConfirm();
                }
            });
        }
    });
});

function clearAllSettingsThreeConfirm() {
    showCustomConfirm('<span style="font-weight: bold;">警告：</span>此操作将清除所有设置和快捷链接，并重置为默认状态！确定要继续吗？', function(result) {
        if (result) {
            // 清除所有localStorage设置
            localStorage.clear();
            
            // 重置engineSelect为默认选择（百度）
            document.getElementById('engineSelect').value = 'baidu_0';
            
            // 清除所有快捷链接
            updateQuickLinks();
            
            setTimeout(function() {
                window.close();
                document.body.innerHTML = '<p>重置完成，若没有自动刷新，请手动<a href="javascript:void(0)" onclick="javascript:location.reload(true);">刷新</a></p>';
            }, 100);
            setTimeout(function() {
                window.location.reload(true);
            }, 200);
        }
    });
}

// 导出链接功能
document.querySelector('label[for="exportLinksBtn"]').addEventListener('click', function() {
    var links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
    if (links.length === 0) {
        return;
    }
    
    var jsonContent = JSON.stringify(links, null, 2);
    var base64Content = btoa(unescape(encodeURIComponent(jsonContent)));
    var dataUrl = 'data:application/json;base64,' + base64Content;
    
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'quick_links_backup.json';
    a.click();
});

// 导入链接功能
document.querySelector('label[for="importLinksBtn"]').addEventListener('click', function() {
    document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var content = event.target.result;
            var links = JSON.parse(content);
            
            if (links.length > 0) {
                var existingLinks = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                var mergedLinks = existingLinks.concat(links);
                localStorage.setItem('quickLinks', JSON.stringify(mergedLinks));
                updateQuickLinks();
            }
        } catch (error) {
            // JSON解析失败
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});

// 清除所有快捷链接
document.querySelector('label[for="clearLinksBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要清空所有快捷链接吗？', function(result) {
        if (result) {
            localStorage.removeItem('quickLinks');
            updateQuickLinks();
        }
    });
});

// 页面加载时更新快捷链接
document.addEventListener('DOMContentLoaded', function() {
    updateQuickLinks();
});

document.getElementById('85727544071588039023').addEventListener('click', function(e) {
    e.preventDefault();
    
    // 检查是否已经点击过
    if (!localStorage.getItem('36156798756549916136')) {
        showCustomConfirm('即将跳转到百度，确定要跳转吗？', function(result) {
            if (result) {
                window.location.href = 'https://www.baidu.com';
                localStorage.setItem('36156798756549916136', 'true');
            }
        });
        localStorage.setItem('36156798756549916136', 'true');
    }
});

// 时间链接功能
var timeLinkElement = document.getElementById('85727544071588039023');
var timeLinkImage = null;
var timeLinkInterval = null;

// 更新时间显示函数
function updateTimeDisplay() {
    if (!timeLinkElement) return;
    
    var now = new Date();
    var timeFormat = localStorage.getItem('timeFormat') || '24hours';
    var timeStr;
    
    if (timeFormat === '24hours') {
        // 24小时制
        var hours = now.getHours();
        var minutes = now.getMinutes();
        
        // 兼容低版本浏览器的补零函数
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        timeStr = padZero(hours) + ':' + padZero(minutes);
    } else {
        // 12小时制
        var hours = now.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0点显示为12
        var minutes = now.getMinutes();
        
        // 兼容低版本浏览器的补零函数
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        timeStr = hours + ':' + padZero(minutes) + ' ' + ampm;
    }
    
    timeLinkElement.textContent = timeStr;
    timeLinkElement.style.fontSize = localStorage.getItem('linkSize') || '30px';
}

// 显示时间链接
function showTimeLink() {
    if (!timeLinkElement) return;
    
    // 保存当前图片链接（如果有）
    var savedLinkImage = localStorage.getItem('linkImage');
    if (savedLinkImage) {
        // 修改这里：将图片链接保存到专门的时间链接图片存储
        localStorage.setItem('timeLinkOriginalImage', savedLinkImage);
        localStorage.removeItem('linkImage');
    }
    
    // 清除图片显示
    timeLinkElement.innerHTML = '';
    
    // 开始更新时间 - 使用更兼容的方式
    updateTimeDisplay();
    if (timeLinkInterval) {
        try {
            clearInterval(timeLinkInterval);
        } catch (e) {
            // 兼容低版本浏览器的错误处理
        }
    }
    
    // 使用更兼容的方式设置定时器
    timeLinkInterval = window.setInterval(function() {
        try {
            updateTimeDisplay();
        } catch (e) {
            // 出错时停止定时器
            if (timeLinkInterval) {
                try {
                    clearInterval(timeLinkInterval);
                } catch (e2) {}
                timeLinkInterval = null;
            }
        }
    }, 1000);
}

// 隐藏时间链接
function hideTimeLink() {
    if (!timeLinkElement) return;
    
    // 停止更新时间
    if (timeLinkInterval) {
        try {
            clearInterval(timeLinkInterval);
        } catch (e) {
            // 兼容低版本浏览器的错误处理
        }
        timeLinkInterval = null;
    }
    
    // 恢复图片或文字
    var savedOriginalImage = localStorage.getItem('timeLinkOriginalImage');
    if (savedOriginalImage) {
        // 恢复图片
        var linkSize = localStorage.getItem('linkSize') || '30px';
        timeLinkElement.innerHTML = '<img src="' + savedOriginalImage + '" style="width: auto; height: auto; max-width: ' + linkSize + '; max-height: ' + linkSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
        localStorage.setItem('linkImage', savedOriginalImage);
        localStorage.removeItem('timeLinkOriginalImage');
        document.getElementById('linkColorValue').textContent = 'Image';
    } else {
        // 恢复文字
        var savedLinkName = localStorage.getItem('linkName') || 'Baidu.com';
        timeLinkElement.textContent = savedLinkName;
        timeLinkElement.style.color = localStorage.getItem('linkColor') || '#0000ee';
        timeLinkElement.style.fontSize = localStorage.getItem('linkSize') || '30px';
    }
}

// 加载保存的时间链接设置
var savedShowTimeState = localStorage.getItem('showTimeChecked');
if (savedShowTimeState === 'true') {
    document.getElementById('showTimeCheckbox').checked = true;
}

// 加载保存的时间格式设置
var savedTimeFormat = localStorage.getItem('timeFormat');
if (savedTimeFormat) {
    document.getElementById('timeFormatSelect').value = savedTimeFormat;
}

// 监听时间格式选择变化
document.getElementById('timeFormatSelect').addEventListener('change', function() {
    localStorage.setItem('timeFormat', this.value);
    
    // 如果时间链接正在显示，立即更新时间显示
    var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
    if (showTimeChecked) {
        updateTimeDisplay();
    }
});

// 监听时间格式选择变化 - 使用更兼容的事件处理
var timeFormatSelect = document.getElementById('timeFormatSelect');
if (timeFormatSelect) {
    if (timeFormatSelect.addEventListener) {
        // 现代浏览器
        timeFormatSelect.addEventListener('change', function() {
            localStorage.setItem('timeFormat', this.value);
            
            // 如果时间链接正在显示，立即更新时间显示
            var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
            if (showTimeChecked) {
                updateTimeDisplay();
            }
        });
    } else if (timeFormatSelect.attachEvent) {
        // IE8及以下
        timeFormatSelect.attachEvent('onchange', function() {
            localStorage.setItem('timeFormat', this.value);
            
            // 如果时间链接正在显示，立即更新时间显示
            var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
            if (showTimeChecked) {
                updateTimeDisplay();
            }
        });
    }
}

// 监听showTimeCheckbox变化
document.getElementById('showTimeCheckbox').addEventListener('change', function() {
    var showLinkChecked = document.getElementById('showLinkCheckbox').checked;
    
    if (this.checked && !showLinkChecked) {
        // 如果显示链接未勾选，不允许勾选时间链接
        this.checked = false;
        return;
    }
    
    localStorage.setItem('showTimeChecked', this.checked);
    
    if (this.checked) {
        showTimeLink();
        localStorage.setItem('36156798756549916136', 'true');
        var linkStyle = document.createElement('style');
        linkStyle.textContent = 'a:active.link-85727544071588039023 { color: #ff0000 !important; }';
        document.head.appendChild(linkStyle);
    } else {
        hideTimeLink();
        var linkStyle = document.createElement('style');
        linkStyle.textContent = 'a:active.link-85727544071588039023 { color: #ff0000 !important; }';
        document.head.appendChild(linkStyle);
    }
});

document.querySelector('label[for="iframeRefreshBtn"]').addEventListener('click', function() {
    var iframe = document.getElementById('webFrame');
    iframe.src = iframe.src;
});

document.querySelector('label[for="iframeCloseBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要关闭窗口吗？', function(result) {
        if (result) {
            document.getElementById('webFrame').src = 'about:blank';
        }
    });
});

// iframe控制功能
var iframeCount = 1;

// iframe控制功能 - 修改后的代码

// 删除旧的单独宽度和高度按钮事件，添加统一的高度/宽度按钮事件
document.querySelector('label[for="resizeIframeSizeBtn"]').addEventListener('click', function() {
    var currentWidth = localStorage.getItem('iframeWidth') || '100%';
    var currentHeight = localStorage.getItem('iframeHeight') || '600px';
    
    showCustomDoubleInput(
        '设置 iframe 尺寸',
        '输入窗口宽度（如 100% 或 800px）',
        '输入窗口高度（如 600px 或 80%）',
        currentWidth,
        currentHeight,
        function(width, height) {
            if (width !== null && height !== null) {
                if (width === '') {
                    // 输入为空时恢复默认宽度
                    var defaultWidth = '100%';
                    document.getElementById('webFrame').style.width = defaultWidth;
                    localStorage.setItem('iframeWidth', defaultWidth);
                } else {
                    document.getElementById('webFrame').style.width = width;
                    localStorage.setItem('iframeWidth', width);
                }
                
                if (height === '') {
                    // 输入为空时恢复默认高度
                    var defaultHeight = '600px';
                    document.getElementById('webFrame').style.height = defaultHeight;
                    document.getElementById('iframeContainer').style.height = defaultHeight;
                    document.getElementById('iframeContainer').style.height = defaultHeight;
                    localStorage.setItem('iframeHeight', defaultHeight);
                } else {
                    document.getElementById('webFrame').style.height = height;
                    document.getElementById('iframeContainer').style.height = height;
                    document.getElementById('iframeContainer').style.height = height;
                    localStorage.setItem('iframeHeight', height);
                }
            }
        }
    );
});

// 加载保存的iframe大小
var savedIframeWidth = localStorage.getItem('iframeWidth');
var savedIframeHeight = localStorage.getItem('iframeHeight');
if (savedIframeWidth && savedIframeHeight) {
    document.getElementById('webFrame').style.width = savedIframeWidth;
    document.getElementById('webFrame').style.height = savedIframeHeight;
    document.getElementById('iframeContainer').style.height = savedIframeHeight;
}

function getBrowserInfo() {
    var userAgent = navigator.userAgent;
    var browserName;
    var version;
    
    // 检测浏览器类型和版本
    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        version = userAgent.match(/Firefox\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
        version = userAgent.match(/Chrome\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Safari";
        version = userAgent.match(/Version\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
        version = userAgent.match(/Edge\/([0-9.]+)/)[1];
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
        browserName = "Internet Explorer";
        version = userAgent.match(/(MSIE |rv:)([0-9.]+)/)[2];
    } else {
        browserName = "Unknown";
        version = "Unknown";
    }
    
    return {
        name: browserName,
        version: version
    };
}

// 修改browserInfo的显示代码，将innerHTML赋值改为textContent，并添加点击事件
window.onload = function() {
    var browserInfo = getBrowserInfo();
    var displayElement = document.getElementById("browserInfo");
    // 确保browserInfo元素存在且没有被图片覆盖
    if (displayElement) {
        displayElement.innerHTML = "浏览器: " + browserInfo.name + "<br>版本号: " + browserInfo.version;
        // 兼容所有浏览器的z-index设置
        displayElement.style.position = 'relative';
        displayElement.style.zIndex = '9999';
        displayElement.style.userSelect = 'none';
        
        // 添加点击事件
        displayElement.addEventListener('click', function() {
            showCustomAlert('关于', '<div style="font-size: 15px;">搜索Easy<br>' + '<p>当前版本: v7.1<br></p>' + '<p>浏览器内核: ' + browserInfo.version + '<br></p>' + '<span style="font-weight: bold;">User-Agent: </span>' + navigator.userAgent + '<br><p style="display: inline-block;">Github源码: <form style="display: inline-block; float: right; margin-top: 14px;" action="https://github.com/wugdu27376/setsearchbox/" target="_blank"><button type="submit">点击跳转</button></form></p>' + '</div>');
        });
    }
};

// 支持按Enter键提交
document.getElementById('urlInput').addEventListener('keypress', function(e) {
    e = e || window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
        document.getElementById('submitBtn').click();
        if (this.value.trim() !== '') {
            this.blur();
        }
    }
});