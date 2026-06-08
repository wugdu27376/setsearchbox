// ========== IE兼容性补丁(第1803行后结束) ==========
(function() {
    // 检测是否为IE浏览器
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    
    if (isIE) {
        // 控制台兼容（IE下console.log在未打开开发者工具时会报错）
        if (!window.console) {
            window.console = {
                log: function() {},
                error: function() {},
                warn: function() {}
            };
        }
        
        // String.trim polyfill
        if (!String.prototype.trim) {
            String.prototype.trim = function() {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        }
        
        // Array.prototype.indexOf polyfill (IE8及以下)
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(searchElement, fromIndex) {
                var k;
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }
                var O = Object(this);
                var len = O.length >>> 0;
                if (len === 0) return -1;
                var n = fromIndex | 0;
                if (n >= len) return -1;
                k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                while (k < len) {
                    if (k in O && O[k] === searchElement) return k;
                    k++;
                }
                return -1;
            };
        }
        
        // Array.prototype.filter polyfill
        if (!Array.prototype.filter) {
            Array.prototype.filter = function(callback, thisArg) {
                if (this == null) throw new TypeError('this is null or not defined');
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
                var T = thisArg, k = 0, A = [];
                while (k < len) {
                    if (k in O) {
                        var kValue = O[k];
                        if (callback.call(T, kValue, k, O)) {
                            A.push(kValue);
                        }
                    }
                    k++;
                }
                return A;
            };
        }
        
        // localStorage检测警告
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                var test = '__ie_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
            }
        } catch(e) {
        //    alert('提示：当前浏览器隐私模式可能导致部分功能无法保存设置，建议关闭隐私模式后使用。');
        }
    }
    
    // classList兼容（针对IE9-10）
    // 【修复】IE8/IE7 兼容：检测 HTMLElement 和 Element 是否存在，避免 undefined 错误
    if (!('classList' in document.documentElement)) {
        var classListTarget = null;
        // 【修复】IE7 及以下：window.HTMLElement 和 window.Element 可能为 undefined
        if (typeof window.HTMLElement !== 'undefined' && window.HTMLElement) {
            classListTarget = HTMLElement.prototype;
        } else if (typeof window.Element !== 'undefined' && window.Element) {
            classListTarget = Element.prototype;
        } else if (typeof window.HTMLDocument !== 'undefined' && window.HTMLDocument) {
            // IE7 及以下使用 HTMLDocument.prototype
            classListTarget = HTMLDocument.prototype;
        } else if (document && document.documentElement) {
            // 最终回退：使用 document 对象
            classListTarget = Object.getPrototypeOf ? Object.getPrototypeOf(document.documentElement) : document.documentElement;
        }
        if (classListTarget && !classListTarget.classList) {
            (function(proto) {
                // 【修复】IE7 不支持 Object.defineProperty，使用 __defineGetter__ 替代
                if (proto.__defineGetter__) {
                    proto.__defineGetter__('classList', function() {
                        var self = this;
                        function update(fn) {
                            return function(value) {
                                var classes = self.className.split(/\s+/);
                                var index = classes.indexOf(value);
                                fn(classes, index, value);
                                self.className = classes.join(' ');
                            };
                        }
                        return {
                            add: update(function(classes, index, value) {
                                if (index === -1) classes.push(value);
                            }),
                            remove: update(function(classes, index, value) {
                                if (index !== -1) classes.splice(index, 1);
                            }),
                            contains: function(value) {
                                return self.className.split(/\s+/).indexOf(value) !== -1;
                            }
                        };
                    });
                } else if (Object.defineProperty) {
                    Object.defineProperty(proto, 'classList', {
                        get: function() {
                            var self = this;
                            function update(fn) {
                                return function(value) {
                                    var classes = self.className.split(/\s+/);
                                    var index = classes.indexOf(value);
                                    fn(classes, index, value);
                                    self.className = classes.join(' ');
                                };
                            }
                            return {
                                add: update(function(classes, index, value) {
                                    if (index === -1) classes.push(value);
                                }),
                                remove: update(function(classes, index, value) {
                                    if (index !== -1) classes.splice(index, 1);
                                }),
                                contains: function(value) {
                                    return self.className.split(/\s+/).indexOf(value) !== -1;
                                }
                            };
                        },
                        configurable: true
                    });
                }
            })(classListTarget);
        }
    }
    
    // 自定义事件创建兼容
    if (typeof window.CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        window.CustomEvent = CustomEvent;
    }
})();
// ========== IE兼容性补丁结束 ==========


// ========== 【修复】全局 addEventListener/removeEventListener 兼容 IE8 ==========
(function() {
    if (typeof window.Element !== 'undefined') {
        if (!Element.prototype.addEventListener) {
            Element.prototype.addEventListener = function(type, listener, useCapture) {
                if (this.attachEvent) {
                    this.attachEvent('on' + type, listener);
                }
            };
            Element.prototype.removeEventListener = function(type, listener, useCapture) {
                if (this.detachEvent) {
                    this.detachEvent('on' + type, listener);
                }
            };
        }
    }
    
    if (typeof window.addEventListener === 'undefined') {
        window.addEventListener = function(type, listener, useCapture) {
            if (this.attachEvent) {
                this.attachEvent('on' + type, listener);
            }
        };
        window.removeEventListener = function(type, listener, useCapture) {
            if (this.detachEvent) {
                this.detachEvent('on' + type, listener);
            }
        };
    }
    
    if (typeof document.addEventListener === 'undefined') {
        document.addEventListener = function(type, listener, useCapture) {
            if (this.attachEvent) {
                this.attachEvent('on' + type, listener);
            }
        };
        document.removeEventListener = function(type, listener, useCapture) {
            if (this.detachEvent) {
                this.detachEvent('on' + type, listener);
            }
        };
    }
})();
// ========== 全局 addEventListener 兼容结束 ==========


// ========== 【修复】全局 appendChild 兼容 IE8/IE7 ==========
(function() {
    // 修复 document.head 为 null 的问题
    if (!document.head) {
        document.head = document.getElementsByTagName('head')[0];
    }
    
    // 修复 Node 未定义问题（IE8/IE7 不支持 Node 接口）
    if (typeof window.Node === 'undefined') {
        window.Node = {
            ELEMENT_NODE: 1,
            ATTRIBUTE_NODE: 2,
            TEXT_NODE: 3,
            COMMENT_NODE: 8,
            DOCUMENT_NODE: 9,
            DOCUMENT_FRAGMENT_NODE: 11
        };
    }
    
    // 【修复】IE7 兼容：安全检测 HTMLElement 和 Element 是否存在
    var hasElement = (typeof window.Element !== 'undefined' && window.Element);
    var hasHTMLElement = (typeof window.HTMLElement !== 'undefined' && window.HTMLElement);
    
    // 安全包装 appendChild 方法（使用 Element 替代 Node）
    var originalAppendChild = null;
    if (hasElement && Element.prototype && Element.prototype.appendChild) {
        originalAppendChild = Element.prototype.appendChild;
    } else if (hasHTMLElement && HTMLElement.prototype && HTMLElement.prototype.appendChild) {
        originalAppendChild = HTMLElement.prototype.appendChild;
    } else if (document.body && document.body.appendChild) {
        // IE7 最终回退：使用 document.body.appendChild 作为参考
        originalAppendChild = document.body.appendChild;
    }
    
    if (originalAppendChild) {
        var targetProto = null;
        if (hasElement && Element.prototype) {
            targetProto = Element.prototype;
        } else if (hasHTMLElement && HTMLElement.prototype) {
            targetProto = HTMLElement.prototype;
        } else if (document.body && document.body.appendChild) {
            targetProto = Object.getPrototypeOf ? Object.getPrototypeOf(document.body) : document.body;
        }
        if (targetProto && !targetProto.appendChildModified) {
            targetProto.appendChildModified = true;
            targetProto.appendChild = function(child) {
                if (!this) {
                    return child;
                }
                try {
                    return originalAppendChild.call(this, child);
                } catch(e) {
                    if (document.body && this !== document.body) {
                        try {
                            return document.body.appendChild(child);
                        } catch(e2) {}
                    }
                    return child;
                }
            };
        }
    }
    
    // 确保每个 appendChild 调用前父元素存在
    var originalGetElementById = document.getElementById;
    if (originalGetElementById) {
        document.getElementById = function(id) {
            var element = originalGetElementById.call(document, id);
            if (!element && document.body) {
                var allElements = document.body.getElementsByTagName('*');
                for (var i = 0; i < allElements.length; i++) {
                    if (allElements[i].id === id) {
                        return allElements[i];
                    }
                }
            }
            return element;
        };
    }
})();
// ========== 全局 appendChild 兼容结束 ==========


// ========== 【修复】全局 indexOf 兼容 IE8 ==========
(function() {
    // 修复 String.prototype.indexOf（IE8 原生支持，但某些情况需要安全调用）
    if (typeof String.prototype.indexOf !== 'function') {
        String.prototype.indexOf = function(searchValue, fromIndex) {
            var len = this.length;
            var start = fromIndex ? Number(fromIndex) : 0;
            if (start < 0) start = 0;
            for (var i = start; i < len; i++) {
                if (this.charAt(i) === searchValue) return i;
            }
            return -1;
        };
    }
    
    // 修复 Array.prototype.indexOf（IE8 及以下不支持）
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) return -1;
            var n = fromIndex | 0;
            if (n >= len) return -1;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) return k;
                k++;
            }
            return -1;
        };
    }
    
    // 安全调用 indexOf 的包装函数（用于处理 null/undefined 情况）
    window.safeIndexOf = function(str, searchValue) {
        if (str == null) return -1;
        if (typeof str.indexOf === 'function') {
            return str.indexOf(searchValue);
        }
        return -1;
    };
})();
// ========== 全局 indexOf 兼容结束 ==========


// ========== IE 跳转兼容补丁 ==========
(function() {
    var isIE = false;
    try {
        isIE = /*@cc_on!@*/false || !!document.documentMode;
    } catch(e) {
        isIE = false;
    }
    
    if (isIE) {
        // 修复 IE 下 URL 跳转失败问题
        var originalSubmitBtnClick = null;
        document.addEventListener('DOMContentLoaded', function() {
            var submitBtn = document.getElementById('submitBtn');
            var urlInput = document.getElementById('urlInput');
            
            if (submitBtn && urlInput) {
                // 移除原有事件，使用更可靠的跳转方式
                var newBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newBtn, submitBtn);
                submitBtn = newBtn;
                
                submitBtn.onclick = function(e) {
                    e = e || window.event;
                    var url = urlInput.value;
                    var engine = document.getElementById('engineSelect').value;
                    
                    if (!url || url === 'https://') return false;
                    
                    // IE 下直接跳转
                    try {
                        if (engine === 'iFrameFree') {
                            var iframe = document.getElementById('webFrame');
                            if (iframe) iframe.src = url;
                            return false;
                        }
                        try {
    window.location.href = url;
} catch(e) {
    window.location = url;
}
                    } catch(err) {
                        window.location = url;
                    }
                    return false;
                };
            }
        });
    }
})();
// ========== IE 跳转补丁结束 ==========


// ========== IE8 布局修复函数 ==========
(function() {
    var isIE8 = false;
    try {
        var ua = navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            if (version === 8) isIE8 = true;
        }
    } catch(e) { isIE8 = false; }
    
    if (isIE8) {
        // 修复 body 布局
        if (document.body) {
            document.body.style.margin = '0';
            document.body.style.padding = '20px';
            document.body.style.textAlign = 'center';
            document.body.style.fontFamily = 'Arial, sans-serif';
        }
        
        // 修复 searchContainer 布局（IE8 使用 table 布局替代 flex）
        var searchContainer = document.getElementById('searchContainer');
        if (searchContainer) {
            searchContainer.style.display = 'table';
            searchContainer.style.width = '100%';
            searchContainer.style.maxWidth = '800px';
            searchContainer.style.margin = '0 auto';
            searchContainer.style.textAlign = 'center';
            searchContainer.style.borderCollapse = 'collapse';
            searchContainer.style.tableLayout = 'fixed';
        }
        
        // 修复 engineSelect 布局
        var engineSelect = document.getElementById('engineSelect');
        if (engineSelect) {
            engineSelect.style.display = 'inline-block';
            engineSelect.style.width = '90px';
            engineSelect.style.minWidth = '90px';
            engineSelect.style.height = '24px';
            engineSelect.style.verticalAlign = 'middle';
        }
        
        // 修复 urlInput 布局
        var urlInput = document.getElementById('urlInput');
        if (urlInput) {
            urlInput.style.display = 'inline-block';
            urlInput.style.width = '60%';
            urlInput.style.minWidth = '100px';
            urlInput.style.height = '24px';
            urlInput.style.verticalAlign = 'middle';
        }
        
        // 修复 submitBtn 布局
        var submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.style.height = '24px';
            submitBtn.style.verticalAlign = 'middle';
            submitBtn.style.marginLeft = '3px';
            submitBtn.style.cursor = 'pointer';
        }
        
        // 修复 autoFillhttps 容器布局
        var autoFillhttps = document.getElementById('autoFillhttps');
        if (autoFillhttps) {
            autoFillhttps.style.textAlign = 'center';
            autoFillhttps.style.marginTop = '10px';
            autoFillhttps.style.maxWidth = '560px';
            autoFillhttps.style.marginLeft = 'auto';
            autoFillhttps.style.marginRight = 'auto';
        }
        
        // 修复 autoFillhttps 内部子元素布局
        if (autoFillhttps) {
            var children = autoFillhttps.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName === 'DIV') {
                    children[i].style.display = 'inline-block';
                    children[i].style.zoom = '1';
                }
            }
        }
    }
})();
// ========== IE8 布局修复函数结束 ==========


// ========== IE8及以下版本专属兼容代码（最低IE6） ==========
(function() {
    var isIELowVersion = false;
    var ieVersion = 0;
    try {
        var ua = navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            ieVersion = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            if (ieVersion <= 8) isIELowVersion = true;
        }
    } catch(e) { isIELowVersion = false; }
    
    if (isIELowVersion) {
        // 修复 console 对象（IE6-7 不支持 console）
        if (typeof window.console === 'undefined') {
            window.console = {
                log: function() {},
                error: function() {},
                warn: function() {},
                info: function() {}
            };
        }
        
        // 修复 String.trim（IE6-8 不支持）
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        }
        
        // 修复 Array.prototype.indexOf（IE6-8 不支持）
        if (typeof Array.prototype.indexOf !== 'function') {
            Array.prototype.indexOf = function(searchElement, fromIndex) {
                var k;
                if (this == null) throw new TypeError('"this" is null or not defined');
                var O = Object(this);
                var len = O.length >>> 0;
                if (len === 0) return -1;
                var n = fromIndex | 0;
                if (n >= len) return -1;
                k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
                while (k < len) {
                    if (k in O && O[k] === searchElement) return k;
                    k++;
                }
                return -1;
            };
        }
        
        // 获取元素值辅助函数（兼容IE6-8）
        function getElementValue(el) {
            if (!el) return '';
            if (el.tagName === 'SELECT' && el.selectedIndex >= 0) {
                var opt = el.options[el.selectedIndex];
                return opt ? opt.value : '';
            }
            return el.value || '';
        }
        
        // 绑定提交事件
        function bindIESubmitEvent() {
            var submitBtn = document.getElementById('submitBtn');
            var urlInput = document.getElementById('urlInput');
            var engineSelect = document.getElementById('engineSelect');
            
            if (!submitBtn || !urlInput) return;
            
            // 移除已有事件
            submitBtn.onclick = null;
            
            // 构建搜索URL
            function buildSearchUrl(keyword, engine) {
                if (!keyword) return '';
                if (keyword.indexOf('://') !== -1) return keyword;
                
                switch (engine) {
                    case 'baidu': return 'https://m.baidu.com/s?wd=' + encodeURIComponent(keyword);
                    case 'google': return 'https://www.google.com/search?q=' + encodeURIComponent(keyword);
                    case 'bing': return 'https://www.bing.com/search?q=' + encodeURIComponent(keyword);
                    case 'sogou': return 'https://www.sogou.com/web?query=' + encodeURIComponent(keyword);
                    case 'so': return 'https://www.so.com/s?q=' + encodeURIComponent(keyword);
                    case 'yandex': return 'https://www.so.com/s?q=' + encodeURIComponent(keyword);
                    default: return 'https://pan.baidu.com/s?wd=' + encodeURIComponent(keyword);
                }
            }
            
            // 执行跳转
            function doNavigate(url) {
                if (!url) return;
                try {
                    window.location.href = url;
                } catch(e) {
                    window.location = url;
                }
            }
            
            // 提交按钮点击事件
            submitBtn.onclick = function(e) {
                e = e || window.event;
                var keyword = urlInput.value;
                if (!keyword || keyword === 'https://' || keyword === 'http://') {
                    return false;
                }
                
                var engine = engineSelect ? getElementValue(engineSelect) : 'baidu';
                try {
                    if (window.localStorage && localStorage.setItem) {
                        localStorage.setItem('selectedEngine', engine);
                    }
                } catch(err) {}
                
                var searchUrl = buildSearchUrl(keyword, engine);
                doNavigate(searchUrl);
                return false;
            };
            
            // Enter 键事件（IE6-8 使用 attachEvent）
            if (urlInput.attachEvent) {
                urlInput.attachEvent('onkeydown', function(e) {
                    e = e || window.event;
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 13) {
                        e.returnValue = false;
                        if (e.cancelBubble !== undefined) e.cancelBubble = true;
                        if (submitBtn && submitBtn.onclick) {
                            submitBtn.onclick(e);
                        } else if (submitBtn && submitBtn.click) {
                            submitBtn.click();
                        }
                        return false;
                    }
                });
            } else if (urlInput.addEventListener) {
                urlInput.addEventListener('keydown', function(e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        if (submitBtn && submitBtn.onclick) submitBtn.onclick(e);
                    }
                });
            }
        }
        
        // 页面加载完成后绑定（兼容IE6-8的onreadystatechange）
        if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    bindIESubmitEvent();
                }
            });
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', bindIESubmitEvent);
        } else {
            window.onload = bindIESubmitEvent;
        }
    }
})();
// ========== IE8及以下版本专属兼容代码结束 ==========


// ========== 【修复】IE8及以下浏览器搜索引擎保存与加载兼容性补丁 ==========
(function() {
    // 检测 IE 浏览器版本（支持 IE6+）
    var ieVersion = 0;
    var ua = navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        ieVersion = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var isIELowVersion = (ieVersion > 0 && ieVersion <= 8);
    
    // 获取保存的搜索引擎值（安全读取）
    function getSavedEngine() {
        try {
            if (typeof localStorage !== 'undefined' && localStorage !== null) {
                return localStorage.getItem('selectedEngine');
            }
        } catch(e) {}
        return null;
    }
    
    // 保存搜索引擎值（安全写入）
    function setSavedEngine(value) {
        try {
            if (typeof localStorage !== 'undefined' && localStorage !== null) {
                localStorage.setItem('selectedEngine', value);
            }
        } catch(e) {}
    }
    
    // 设置下拉框选中项（兼容 IE 低版本）
    function setSelectValue(selectEl, value) {
        if (!selectEl) return false;
        for (var i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value === value) {
                selectEl.selectedIndex = i;
                return true;
            }
        }
        return false;
    }
    
    var engineSelect = document.getElementById('engineSelect');
    if (!engineSelect) return;
    
    // 页面加载时恢复保存的选择
    var savedEngine = getSavedEngine();
    if (savedEngine) {
        if (setSelectValue(engineSelect, savedEngine)) {
            // 手动触发 change 事件（兼容 IE 低版本）
            if (engineSelect.fireEvent) {
                engineSelect.fireEvent('onchange');
            } else if (engineSelect.dispatchEvent) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('change', true, false);
                engineSelect.dispatchEvent(evt);
            }
        }
    }
    
    // 监听 change 事件保存选择（兼容 IE 低版本）
    var originalChangeHandler = engineSelect.onchange;
    engineSelect.onchange = function(e) {
        var selectedValue = engineSelect.value;
        if (selectedValue) {
            setSavedEngine(selectedValue);
        }
        if (originalChangeHandler) {
            originalChangeHandler.call(this, e);
        }
    };
    
    // 对于 IE8 及以下，使用 attachEvent 确保事件绑定
    if (isIELowVersion && engineSelect.attachEvent && !engineSelect._patched) {
        engineSelect._patched = true;
        engineSelect.attachEvent('onchange', function() {
            var selectedValue = engineSelect.value;
            if (selectedValue) {
                setSavedEngine(selectedValue);
            }
        });
    }
})();
// ========== 【修复结束】 ==========


// ========== IE 完整兼容补丁 ==========
(function() {
    var isIE = false;
    try {
        isIE = /*@cc_on!@*/false || !!document.documentMode;
    } catch(e) { isIE = false; }
    
    if (isIE) {
        // 修复 IE 下 select 元素 value 读取问题
        // 【修复】IE8 兼容：使用 Object.prototype.hasOwnProperty 替代直接调用
        if (HTMLSelectElement && HTMLSelectElement.prototype) {
            var hasValueProp = false;
            try {
                hasValueProp = Object.prototype.hasOwnProperty.call(HTMLSelectElement.prototype, 'value');
            } catch(e) {
                hasValueProp = false;
            }
            if (!hasValueProp) {
                Object.defineProperty(HTMLSelectElement.prototype, 'value', {
                    get: function() {
                        if (this.selectedIndex >= 0 && this.options[this.selectedIndex]) {
                            return this.options[this.selectedIndex].value;
                        }
                        return '';
                    },
                    set: function(val) {
                        for (var i = 0; i < this.options.length; i++) {
                            if (this.options[i].value == val) {
                                this.selectedIndex = i;
                                break;
                            }
                        }
                    }
                });
            }
        }
        
        // 修复 console 对象
        if (!window.console) {
            window.console = {
                log: function() {},
                error: function() {},
                warn: function() {},
                info: function() {}
            };
        }
        
        // 修复 CustomEvent
        if (typeof window.CustomEvent !== 'function') {
            window.CustomEvent = function(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };
        }
    }
})();
// ========== IE 兼容补丁结束 ==========


// ========== 跨浏览器事件绑定辅助函数 ==========
// 【修复】IE8 兼容：使用 attachEvent 替代 addEventListener
function addEvent(element, eventName, handler) {
    if (!element) return;
    if (element.addEventListener) {
        element.addEventListener(eventName, handler);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, handler);
    } else {
        element['on' + eventName] = handler;
    }
}

function removeEvent(element, eventName, handler) {
    if (!element) return;
    if (element.removeEventListener) {
        element.removeEventListener(eventName, handler);
    } else if (element.detachEvent) {
        element.detachEvent('on' + eventName, handler);
    } else {
        element['on' + eventName] = null;
    }
}

// DOM 加载完成检测（IE8 兼容）
function onDomReady(callback) {
    if (document.readyState === 'complete') {
        setTimeout(callback, 1);
        return;
    }
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState === 'complete') {
                callback();
            }
        });
        var oldOnLoad = window.onload;
        window.onload = function() {
            if (oldOnLoad) oldOnLoad();
            callback();
        };
    } else {
        window.onload = callback;
    }
}

// 【修复】提供全局的 addEventListener 兼容包装函数
if (!window.addEventListener) {
    window.addEventListener = function(eventName, handler, useCapture) {
        if (window.attachEvent) {
            window.attachEvent('on' + eventName, handler);
        } else {
            window['on' + eventName] = handler;
        }
    };
    window.removeEventListener = function(eventName, handler, useCapture) {
        if (window.detachEvent) {
            window.detachEvent('on' + eventName, handler);
        } else {
            window['on' + eventName] = null;
        }
    };
}

if (!document.addEventListener) {
    document.addEventListener = function(eventName, handler, useCapture) {
        if (document.attachEvent) {
            document.attachEvent('on' + eventName, handler);
        } else {
            document['on' + eventName] = handler;
        }
    };
    document.removeEventListener = function(eventName, handler, useCapture) {
        if (document.detachEvent) {
            document.detachEvent('on' + eventName, handler);
        } else {
            document['on' + eventName] = null;
        }
    };
}
// ========== 辅助函数结束 ==========


// ========== 跨浏览器事件绑定（最低 IE6 兼容） ==========
function addEvent(element, eventName, handler) {
    if (!element) return;
    if (element.addEventListener) {
        element.addEventListener(eventName, handler);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, handler);
    } else {
        element['on' + eventName] = handler;
    }
}

function removeEvent(element, eventName, handler) {
    if (!element) return;
    if (element.removeEventListener) {
        element.removeEventListener(eventName, handler);
    } else if (element.detachEvent) {
        element.detachEvent('on' + eventName, handler);
    } else {
        element['on' + eventName] = null;
    }
}

// DOM 加载完成检测（最低 IE6 兼容）
function onDomReady(callback) {
    if (document.readyState === 'complete') {
        setTimeout(callback, 1);
        return;
    }
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState === 'complete') {
                callback();
            }
        });
        // 确保 window.onload 也能触发
        var oldOnLoad = window.onload;
        window.onload = function() {
            if (oldOnLoad) oldOnLoad();
            callback();
        };
    } else {
        window.onload = callback;
    }
}
// ========== 事件辅助函数结束 ==========

// 确保提交按钮的点击事件在 IE 中正常工作
function bindSubmitButtonEvent() {
    var submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    // 保存原始点击处理函数
    var originalOnClick = submitBtn.onclick;
    
    // 使用兼容方式绑定
    if (submitBtn.addEventListener) {
        submitBtn.addEventListener('click', function(e) {
            // 原有的提交逻辑会由其他代码处理
        });
    } else if (submitBtn.attachEvent) {
        submitBtn.attachEvent('onclick', function(e) {
            // 确保事件冒泡
            return true;
        });
    }
}

// 在 DOM 加载完成后调用
onDomReady(function() {
    bindSubmitButtonEvent();
});


// IE 浏览器点击链接时激活为红色状态
(function() {
    var isIE = false;
    try {
        isIE = /*@cc_on!@*/false || !!document.documentMode;
    } catch(e) {
        isIE = false;
    }
    
    if (isIE) {
        var activeLink = document.getElementById('85727544071588039023');
        if (activeLink) {
            activeLink.onmousedown = function() {
                this.style.color = '#ff0000';
            };
            activeLink.onmouseup = function() {
                // 恢复保存的链接颜色
                var savedColor = localStorage.getItem('linkColor');
                if (savedColor) {
                    this.style.color = savedColor;
                } else {
                    this.style.color = '#0000ee';
                }
            };
            activeLink.onmouseout = function() {
                var savedColor = localStorage.getItem('linkColor');
                if (savedColor) {
                    this.style.color = savedColor;
                } else {
                    this.style.color = '#0000ee';
                }
            };
        }
    }
})();


// ========== 全局 Enter 键回退方案（最低 IE6 兼容） ==========
(function() {
    // 确保只绑定一次
    if (window.__enterKeyBound) return;
    window.__enterKeyBound = true;
    
    function globalEnterHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var keyCode = e.keyCode || e.which || e.charCode;
        
        if (keyCode !== 13) return true;
        
        if (target && (target.id === 'urlInput' || target === document.getElementById('urlInput'))) {
            var submitBtn = document.getElementById('submitBtn');
            var urlInput = document.getElementById('urlInput');
            
            if (submitBtn && urlInput) {
                var inputValue = urlInput.value;
                if (inputValue && inputValue !== '' && inputValue !== 'https://') {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    
                    // ========== 【修改位置】回车搜索时设置导航标记 ==========
                    window._isNavigating = true;
                    if (window._clearNavigationFlagTimer) {
                        clearTimeout(window._clearNavigationFlagTimer);
                    }
                    window._clearNavigationFlagTimer = setTimeout(function() {
                        window._isNavigating = false;
                    }, 3000);
                    // ========== 【修改结束】 ==========
                    
                    if (submitBtn.click) {
                        submitBtn.click();
                    } else if (submitBtn.fireEvent) {
                        submitBtn.fireEvent('onclick');
                    }
                    
                    return false;
                }
            }
        }
        return true;
    }
    
    // 绑定到 document 或 window
    if (document.addEventListener) {
        document.addEventListener('keydown', globalEnterHandler);
    } else if (document.attachEvent) {
        document.attachEvent('onkeydown', globalEnterHandler);
    } else {
        document.onkeydown = globalEnterHandler;
    }
})();


// ========== 【修复】增强页面卸载时的清理 ==========
(function() {
    function cleanupBeforeUnload() {
        // 清理导航标记定时器
        if (window._clearNavigationFlagTimer) {
            clearTimeout(window._clearNavigationFlagTimer);
            window._clearNavigationFlagTimer = null;
        }
        window._isNavigating = false;
        
        // 清理提交按钮的绑定事件引用
        var submitBtn = document.getElementById('submitBtn');
        if (submitBtn && submitBtn._boundClickHandler) {
            if (submitBtn.removeEventListener) {
                submitBtn.removeEventListener('click', submitBtn._boundClickHandler);
            } else if (submitBtn.detachEvent) {
                submitBtn.detachEvent('onclick', submitBtn._boundClickHandler);
            }
            submitBtn._boundClickHandler = null;
        }
    }
    
    if (window.addEventListener) {
        window.addEventListener('beforeunload', cleanupBeforeUnload);
        window.addEventListener('unload', cleanupBeforeUnload);
    } else if (window.attachEvent) {
        window.attachEvent('onbeforeunload', cleanupBeforeUnload);
        window.attachEvent('onunload', cleanupBeforeUnload);
    }
})();


// ========== IE9/10 完整兼容补丁 ==========
(function() {
    // 检测 IE 版本
    var isIE9 = false, isIE10 = false, isIE = false;
    var ua = navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        isIE = true;
        var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        if (version === 9) isIE9 = true;
        if (version === 10) isIE10 = true;
    }
    
    // 检测 Trident 内核 (IE11+)
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        isIE = true;
        var rv = ua.indexOf('rv:');
        if (rv > 0) {
            var version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            if (version <= 11) isIE = true;
        }
    }
    
    if (isIE9 || isIE10) {
        // 1. 添加 IE 专用 CSS 类到 body
        document.body.className += ' ie-legacy';
        if (isIE9) document.body.className += ' ie9-legacy';
        if (isIE10) document.body.className += ' ie10-legacy';
        
        // 2. 修复搜索容器布局（使用表格布局替代 flex）
        var searchContainer = document.getElementById('searchContainer');
        if (searchContainer) {
            searchContainer.style.display = 'table';
            searchContainer.style.width = '100%';
            searchContainer.style.textAlign = 'center';
            searchContainer.style.tableLayout = 'fixed';
        }
        
        // 3. 修复下拉框、输入框、按钮布局
        var engineSelect = document.getElementById('engineSelect');
        var urlInput = document.getElementById('urlInput');
        var submitBtn = document.getElementById('submitBtn');
        
        if (engineSelect) {
            engineSelect.style.display = 'inline-block';
            engineSelect.style.width = '90px';
            engineSelect.style.minWidth = '90px';
            engineSelect.style.verticalAlign = 'middle';
            if (isIE9) engineSelect.style.height = '26px';
        }
        
        if (urlInput) {
            urlInput.style.display = 'inline-block';
            urlInput.style.width = '60%';
            urlInput.style.minWidth = '100px';
            urlInput.style.verticalAlign = 'middle';
            if (isIE9) urlInput.style.height = '26px';
        }
        
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.style.verticalAlign = 'middle';
            submitBtn.style.minWidth = '50px';
            if (isIE9) submitBtn.style.height = '26px';
        }
        
        // 4. 窗口大小改变时重新调整输入框宽度
        function fixInputWidth() {
            if (urlInput && searchContainer) {
                var containerWidth = searchContainer.offsetWidth;
                if (containerWidth > 200) {
                    var otherWidth = 150; // 下拉框90px + 按钮50px + 间距
                    var inputWidth = containerWidth - otherWidth;
                    if (inputWidth > 100) {
                        urlInput.style.width = inputWidth + 'px';
                    }
                }
            }
        }
        
        if (window.addEventListener) {
            window.addEventListener('resize', fixInputWidth);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', fixInputWidth);
        }
        setTimeout(fixInputWidth, 100);
    }
    
    // 5. String.trim polyfill
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }
    
    // 6. Array.prototype.indexOf polyfill
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            var k;
            if (this == null) throw new TypeError('"this" is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) return -1;
            var n = fromIndex | 0;
            if (n >= len) return -1;
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) return k;
                k++;
            }
            return -1;
        };
    }
    
    // 7. Array.prototype.forEach polyfill
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg || window;
            var k = 0;
            while (k < len) {
                if (k in O) callback.call(T, O[k], k, O);
                k++;
            }
        };
    }
    
    // 8. Array.prototype.filter polyfill
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg, k = 0, A = [];
            while (k < len) {
                if (k in O) {
                    var kValue = O[k];
                    if (callback.call(T, kValue, k, O)) A.push(kValue);
                }
                k++;
            }
            return A;
        };
    }
    
    // 9. classList polyfill (用于 IE9)
    if (window.document && !('classList' in document.documentElement)) {
        (function() {
            var proto = window.HTMLElement ? HTMLElement.prototype : (window.Element ? Element.prototype : null);
            if (proto && !proto.classList) {
                Object.defineProperty(proto, 'classList', {
                    get: function() {
                        var self = this;
                        function update(fn) {
                            return function(value) {
                                var classes = self.className.split(/\s+/);
                                var index = classes.indexOf(value);
                                fn(classes, index, value);
                                self.className = classes.join(' ');
                            };
                        }
                        return {
                            add: update(function(classes, index, value) {
                                if (index === -1) classes.push(value);
                            }),
                            remove: update(function(classes, index, value) {
                                if (index !== -1) classes.splice(index, 1);
                            }),
                            contains: function(value) {
                                return self.className.split(/\s+/).indexOf(value) !== -1;
                            },
                            toggle: function(value, force) {
                                var classes = self.className.split(/\s+/);
                                var index = classes.indexOf(value);
                                var has = index !== -1;
                                var shouldAdd = force !== undefined ? force : !has;
                                if (shouldAdd && !has) {
                                    classes.push(value);
                                } else if (!shouldAdd && has) {
                                    classes.splice(index, 1);
                                }
                                self.className = classes.join(' ');
                                return shouldAdd;
                            }
                        };
                    }
                });
            }
        })();
    }
    
    // 10. localStorage 安全包装
    var localStorageAvailable = true;
    try {
        if (typeof localStorage !== 'undefined' && localStorage) {
            var testKey = '__test__' + Date.now();
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
        } else {
            throw new Error('localStorage not available');
        }
    } catch(e) {
        localStorageAvailable = false;
        // 创建内存存储替代
        var memoryStorage = {};
        window.localStorage = {
            setItem: function(key, value) { try { memoryStorage[key] = String(value); } catch(e) {} },
            getItem: function(key) { try { return memoryStorage[key] !== undefined ? memoryStorage[key] : null; } catch(e) { return null; } },
            removeItem: function(key) { try { delete memoryStorage[key]; } catch(e) {} },
            clear: function() { try { memoryStorage = {}; } catch(e) {} },
            "length": function() { try { var count = 0; for (var k in memoryStorage) { if (memoryStorage.hasOwnProperty(k)) count++; } return count; } catch(e) { return 0; } },
            key: function(index) { try { var keys = []; for (var k in memoryStorage) { if (memoryStorage.hasOwnProperty(k)) keys.push(k); } return keys[index] || null; } catch(e) { return null; } }
        };
    }
    
    // 11. console 安全包装
    if (!window.console) {
        window.console = {
            log: function() {},
            error: function() {},
            warn: function() {},
            info: function() {},
            debug: function() {}
        };
    }
    
    // 12. CustomEvent polyfill
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }
    
    // 13. requestAnimationFrame polyfill
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            return setTimeout(callback, 16);
        };
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    
    // 14. 为 IE9/10 修复 querySelectorAll 返回的 NodeList 不支持 forEach
    if (isIE9 || isIE10) {
        if (window.NodeList && !NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
        if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
            HTMLCollection.prototype.forEach = Array.prototype.forEach;
        }
    }
    
    // 检测 IE8 并添加专用类
    var isIE8 = false;
    try {
        var ua = navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            if (version === 8) isIE8 = true;
        }
    } catch(e) { isIE8 = false; }
    
    if (isIE8) {
        if (document.body) {
            document.body.className += ' ie8-legacy';
        }
        if (document.documentElement) {
            document.documentElement.className += ' ie8-legacy';
        }
    }
})();
// ========== IE9/10 兼容补丁结束 ==========


// IE 版本检测（放在 body 最开头）
(function() {
    var isIE9 = false, isIE10 = false;
    var ua = navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        if (version === 9) isIE9 = true;
        if (version === 10) isIE10 = true;
    }
    if (isIE9 || isIE10) {
        document.documentElement.className += ' ie-legacy';
        if (isIE9) document.documentElement.className += ' ie9-legacy';
        if (isIE10) document.documentElement.className += ' ie10-legacy';
    }
})();


// ========== IE9/10 搜索建议专用补丁 ==========
(function() {
    // 检测 IE9/10
    var isIE9 = false, isIE10 = false;
    var ua = navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        var version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        if (version === 9) isIE9 = true;
        if (version === 10) isIE10 = true;
    }
    
    if (isIE9 || isIE10) {
        // 1. 修复 input 事件：IE9/10 不支持 input 事件，使用 propertychange 替代
        var urlInput = document.getElementById('urlInput');
        if (urlInput) {
            // 保存原始事件处理函数
            var originalInputHandler = null;
            
            // 移除可能已绑定的 input 事件
            if (urlInput.removeEventListener) {
                urlInput.removeEventListener('input', urlInput._inputHandler);
            }
            
            // 添加 propertychange 事件监听
            urlInput.attachEvent('onpropertychange', function(e) {
                e = e || window.event;
                if (e.propertyName === 'value') {
                    // 触发搜索建议更新
                    if (typeof fetchSearchSuggestions === 'function') {
                        var query = urlInput.value;
                        fetchSearchSuggestions(query);
                    }
                    // 触发输入框的 oninput 回调（如果有）
                    if (urlInput.oninput) {
                        urlInput.oninput({ target: urlInput });
                    }
                }
            });
            
            // 同时保留 keyup 事件作为备份
            urlInput.attachEvent('onkeyup', function() {
                if (typeof fetchSearchSuggestions === 'function') {
                    fetchSearchSuggestions(urlInput.value);
                }
            });
        }
        
        // 2. 修复 textContent 为 innerText
        if (!('textContent' in document.documentElement)) {
            Object.defineProperty(HTMLElement.prototype, 'textContent', {
                get: function() {
                    return this.innerText;
                },
                set: function(value) {
                    this.innerText = value;
                }
            });
        }
        
        // 3. 修复 NodeList forEach
        if (window.NodeList && !NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
        if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
            HTMLCollection.prototype.forEach = Array.prototype.forEach;
        }
        
        // 4. 修复 getComputedStyle 对伪元素的支持
        if (window.getComputedStyle) {
            var originalGetComputedStyle = window.getComputedStyle;
            window.getComputedStyle = function(element, pseudo) {
                try {
                    return originalGetComputedStyle(element, pseudo);
                } catch(e) {
                    return {
                        getPropertyValue: function() { return ''; },
                        font: '',
                        fontSize: ''
                    };
                }
            };
        }
    }
    
    // 通用修复：确保搜索建议框位置正确
    function fixSuggestionsPosition() {
        var searchSuggestions = document.getElementById('searchSuggestions');
        var urlInput = document.getElementById('urlInput');
        if (!searchSuggestions || !urlInput) return;
        
        var inputRect = urlInput.getBoundingClientRect();
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        
        searchSuggestions.style.top = (inputRect.bottom + scrollTop) + 'px';
        searchSuggestions.style.left = (inputRect.left + scrollLeft) + 'px';
        searchSuggestions.style.width = (inputRect.width - 2) + 'px';
    }
    
    // 导出修复函数供全局使用
    window._fixSuggestionsPosition = fixSuggestionsPosition;
    
    // 监听滚动和窗口变化重新定位
    if (window.attachEvent) {
        window.attachEvent('onscroll', fixSuggestionsPosition);
        window.attachEvent('onresize', function() {
            setTimeout(fixSuggestionsPosition, 100);
        });
    }
})();
// ========== IE9/10 搜索建议补丁结束 ==========


// ========== 内存泄漏防护 - 资源管理器 ==========
var ResourceManager = (function() {
    var eventListeners = [];
    var timers = [];
    var intervals = [];
    var dynamicElements = [];
    var xhrRequests = [];
    
    // ========== 【新增】注册普通定时器（用于清理） ==========
    function registerTimeout(id) {
        if (id && timers.indexOf(id) === -1) {
            timers.push(id);
        }
        return id;
    }
    
    // ========== 【新增】注册间隔定时器 ==========
    function registerInterval(id) {
        if (id && intervals.indexOf(id) === -1) {
            intervals.push(id);
        }
        return id;
    }
    
    return {
        // 添加事件监听（自动记录）
        addEvent: function(element, eventName, handler, useCapture) {
            useCapture = useCapture || false;
            if (element && element.addEventListener) {
                element.addEventListener(eventName, handler, useCapture);
                eventListeners.push({ element: element, eventName: eventName, handler: handler, useCapture: useCapture });
            } else if (element && element.attachEvent) {
                element.attachEvent('on' + eventName, handler);
                eventListeners.push({ element: element, eventName: eventName, handler: handler, isAttachEvent: true });
            }
        },
        
        // 移除所有事件监听
        removeAllEvents: function() {
            for (var i = 0; i < eventListeners.length; i++) {
                var item = eventListeners[i];
                if (item.isAttachEvent && item.element.detachEvent) {
                    item.element.detachEvent('on' + item.eventName, item.handler);
                } else if (item.element.removeEventListener) {
                    item.element.removeEventListener(item.eventName, item.handler, item.useCapture);
                }
            }
            eventListeners = [];
        },
        
        // 添加定时器
        setTimeout: function(callback, delay) {
            var id = setTimeout(callback, delay);
            timers.push(id);
            return id;
        },
        
        // 添加间隔定时器
        setInterval: function(callback, interval) {
            var id = setInterval(callback, interval);
            intervals.push(id);
            return id;
        },
        
        // 清除所有定时器
        clearAllTimeouts: function() {
            for (var i = 0; i < timers.length; i++) {
                clearTimeout(timers[i]);
            }
            timers = [];
        },
        
        // 清除所有间隔定时器
        clearAllIntervals: function() {
            for (var i = 0; i < intervals.length; i++) {
                clearInterval(intervals[i]);
            }
            intervals = [];
        },
        
        // 注册动态元素
        registerElement: function(element) {
            if (element && dynamicElements.indexOf(element) === -1) {
                dynamicElements.push(element);
            }
        },
        
        // 清理动态元素
        cleanupElements: function() {
            for (var i = 0; i < dynamicElements.length; i++) {
                var el = dynamicElements[i];
                if (el && el.parentNode) {
                    // 清理元素内的事件
                    var allElements = el.getElementsByTagName ? el.getElementsByTagName('*') : [];
                    for (var j = 0; j < allElements.length; j++) {
                        var subEl = allElements[j];
                        if (subEl.onclick) subEl.onclick = null;
                        if (subEl.onmouseover) subEl.onmouseover = null;
                        if (subEl.onmouseout) subEl.onmouseout = null;
                        if (subEl.onchange) subEl.onchange = null;
                    }
                    if (el.onclick) el.onclick = null;
                    if (el.parentNode) el.parentNode.removeChild(el);
                }
            }
            dynamicElements = [];
        },
        
        // 注册 XHR 请求
        registerXHR: function(xhr) {
            xhrRequests.push(xhr);
        },
        
        // 中止所有 XHR 请求
        abortAllXHR: function() {
            for (var i = 0; i < xhrRequests.length; i++) {
                if (xhrRequests[i] && xhrRequests[i].abort) {
                    try { xhrRequests[i].abort(); } catch(e) {}
                }
            }
            xhrRequests = [];
        },
        
        // ========== 【新增】注册定时器方法 ==========
        setTimeout: function(callback, delay) {
            var id = setTimeout(callback, delay);
            timers.push(id);
            return id;
        },
        
        setInterval: function(callback, interval) {
            var id = setInterval(callback, interval);
            intervals.push(id);
            return id;
        },
        
        // ========== 【新增】注册全局标记清理方法 ==========
        registerGlobalFlag: function(name, value) {
            if (typeof window[name] !== 'undefined') {
                // 如果已存在，先清理旧值
                if (name === '_clearNavigationFlagTimer' && window[name]) {
                    clearTimeout(window[name]);
                }
            }
            window[name] = value;
        },
        
        // ========== 【新增】清理导航标记 ==========
        cleanupNavigationFlags: function() {
            if (window._clearNavigationFlagTimer) {
                clearTimeout(window._clearNavigationFlagTimer);
                window._clearNavigationFlagTimer = null;
            }
            window._isNavigating = false;
        },
        
        // 修改原有 cleanupAll 方法
        cleanupAll: function() {
            this.removeAllEvents();
            this.clearAllTimeouts();
            this.clearAllIntervals();
            this.cleanupElements();
            this.abortAllXHR();
            this.cleanupNavigationFlags();  // ========== 【新增】清理导航标记 ==========
        }
    };
})();

// 页面卸载时清理所有资源
if (window.addEventListener) {
    window.addEventListener('beforeunload', function() {
        ResourceManager.cleanupAll();
    });
} else if (window.attachEvent) {
    window.attachEvent('onbeforeunload', function() {
        ResourceManager.cleanupAll();
    });
}
// ========== 资源管理器结束 ==========


// 页面可见性检测 - 优化资源使用
(function() {
    var hiddenProperty = 'hidden' in document ? 'hidden' : 
                         'webkitHidden' in document ? 'webkitHidden' : 
                         'mozHidden' in document ? 'mozHidden' : null;
    var visibilityChangeEvent = 'visibilitychange';
    
    if (hiddenProperty) {
        function handleVisibilityChange() {
            var isHidden = document[hiddenProperty];
            if (isHidden) {
                // 页面隐藏时，停止时间链接更新
                if (window.timeLinkInterval) {
                    clearInterval(window.timeLinkInterval);
                }
                if (window.colonBlinkInterval) {
                    clearInterval(window.colonBlinkInterval);
                }
            } else {
                // 页面重新显示时，恢复时间链接更新
                var showTimeChecked = false;
                try {
                    var timeCheckbox = document.getElementById('showTimeCheckbox');
                    showTimeChecked = timeCheckbox && timeCheckbox.checked;
                } catch(e) {}
                if (showTimeChecked) {
                    if (typeof updateTimeDisplay === 'function') {
                        updateTimeDisplay();
                    }
                    var colonBlinkCheckbox = document.getElementById('colonBlinkCheckbox');
                    if (colonBlinkCheckbox && colonBlinkCheckbox.checked && typeof startColonBlink === 'function') {
                        startColonBlink();
                    }
                }
            }
        }
        
        if (document.addEventListener) {
            document.addEventListener(visibilityChangeEvent, handleVisibilityChange);
        } else if (document.attachEvent) {
            document.attachEvent('on' + visibilityChangeEvent, handleVisibilityChange);
        }
    }
})();


// ========== 页面卸载时清理所有定时器（修复内存泄漏） ==========
(function() {
    // 页面卸载前清理定时器
    function cleanupTimeIntervals() {
        if (timeLinkInterval) {
            clearInterval(timeLinkInterval);
            timeLinkInterval = null;
        }
        if (colonBlinkInterval) {
            clearInterval(colonBlinkInterval);
            colonBlinkInterval = null;
        }
    }
    
    // 页面可见性变化时暂停/恢复定时器（优化性能）
    var hiddenProperty = null;
    if (typeof document.hidden !== 'undefined') {
        hiddenProperty = 'hidden';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hiddenProperty = 'webkitHidden';
    } else if (typeof document.mozHidden !== 'undefined') {
        hiddenProperty = 'mozHidden';
    }
    
    if (hiddenProperty) {
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        
        function handleVisibilityChange() {
            var isHidden = document[hiddenProperty];
            var showTimeCheckbox = document.getElementById('showTimeCheckbox');
            var isTimeEnabled = showTimeCheckbox ? showTimeCheckbox.checked : false;
            
            if (isHidden) {
                // 页面隐藏时停止定时器
                if (timeLinkInterval && isTimeEnabled) {
                    clearInterval(timeLinkInterval);
                    timeLinkInterval = null;
                }
                if (colonBlinkInterval && isTimeEnabled) {
                    clearInterval(colonBlinkInterval);
                    colonBlinkInterval = null;
                }
            } else {
                // 页面恢复时重新启动定时器
                if (isTimeEnabled) {
                    if (!timeLinkInterval) {
                        timeLinkInterval = setInterval(function() {
                            updateTimeDisplay();
                        }, 1000);
                    }
                    var colonBlinkCheckbox = document.getElementById('colonBlinkCheckbox');
                    if (colonBlinkCheckbox && colonBlinkCheckbox.checked && !colonBlinkInterval) {
                        colonVisible = true;
                        colonBlinkInterval = setInterval(function() {
                            try {
                                colonVisible = !colonVisible;
                                updateTimeDisplayWithBlink();
                            } catch(e) {}
                        }, 1000);
                    }
                    updateTimeDisplay();
                }
            }
        }
        
        if (document.addEventListener) {
            document.addEventListener(visibilityChangeEvent, handleVisibilityChange);
        }
    }
    
    // 页面卸载时清理
    if (window.addEventListener) {
        window.addEventListener('beforeunload', cleanupTimeIntervals);
        window.addEventListener('unload', cleanupTimeIntervals);
    } else if (window.attachEvent) {
        window.attachEvent('onbeforeunload', cleanupTimeIntervals);
        window.attachEvent('onunload', cleanupTimeIntervals);
    }
})();
// ========== 定时器清理结束 ==========


// ========== IE兼容性补丁-添加结束 ==========
//


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
            savedEngine === 'quarkpcAI' || savedEngine === 'transmartQQTs' || savedEngine === 'dyIsWindows' || savedEngine === 'fastHandVideo' || savedEngine === 'hongshuVideo' || savedEngine === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        }
    }
    if (isDesktop()) {
        if (savedEngine === 'yzmsmM' || savedEngine === 'qksmSearch' || savedEngine === 'pddWebPage' || savedEngine === 'baiduMEasy' || savedEngine === 'quarkTranslateTools' || savedEngine === 'showCheckbox') {
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
    // 恢复 iFramePlus 窗口显示
    var savedEngine = localStorage.getItem('selectedEngine');
    if (savedEngine === 'iFramePlus') {
        var plusContainer = document.getElementById('iframePlusContainer');
        if (plusContainer && window.iframePlusWindows && window.iframePlusWindows.length > 0) {
            plusContainer.style.display = 'block';
            for (var i = 0; i < window.iframePlusWindows.length; i++) {
                if (window.iframePlusWindows[i].wrapper) {
                    window.iframePlusWindows[i].wrapper.style.display = 'inline-block';
                }
            }
        }
        var sizeBtn = document.getElementById('iframePlusSizeBtn');
        if (sizeBtn) sizeBtn.style.display = 'block';
    }
    // 根据一言显示状态初始化相关按钮的禁用状态
    var savedHitokotoState = localStorage.getItem('hitokotoChecked');
    var hitokotoColorBtn = document.getElementById('hitokotoColorBtn');
    var hitokotoStyleBtn = document.getElementById('hitokotoStyleBtn');
    var hitokotoSizeLabel = document.querySelector('label[for="hitokotoSizePicker"]');
    if (savedHitokotoState !== 'true') {
        if (hitokotoColorBtn) {
            hitokotoColorBtn.style.opacity = '0.7';
            hitokotoColorBtn.style.cursor = 'not-allowed';
            hitokotoColorBtn.style.pointerEvents = 'none';
        }
        if (hitokotoStyleBtn) {
            hitokotoStyleBtn.style.opacity = '0.7';
            hitokotoStyleBtn.style.cursor = 'not-allowed';
            hitokotoStyleBtn.style.pointerEvents = 'none';
        }
        if (hitokotoSizeLabel) {
            hitokotoSizeLabel.style.opacity = '0.7';
            hitokotoSizeLabel.style.cursor = 'not-allowed';
            hitokotoSizeLabel.style.pointerEvents = 'none';
        }
    } else {
        if (hitokotoColorBtn) {
            hitokotoColorBtn.style.opacity = '1';
            hitokotoColorBtn.style.cursor = 'pointer';
            hitokotoColorBtn.style.pointerEvents = 'auto';
        }
        if (hitokotoStyleBtn) {
            hitokotoStyleBtn.style.opacity = '1';
            hitokotoStyleBtn.style.cursor = 'pointer';
            hitokotoStyleBtn.style.pointerEvents = 'auto';
        }
        if (hitokotoSizeLabel) {
            hitokotoSizeLabel.style.opacity = '1';
            hitokotoSizeLabel.style.cursor = 'pointer';
            hitokotoSizeLabel.style.pointerEvents = 'auto';
        }
    }
    // 初始化 heightAdjustBtn、renameLinkBtn、renameSubmitBtn 的禁用状态和鼠标样式
    function initLabelDisabledState() {
        var heightAdjustBtn = document.querySelector('label[for="heightAdjustBtn"]');
        var linkColorPicker = document.querySelector('label[for="linkColorPicker"]');
        var renameLinkBtn = document.querySelector('label[for="renameLinkBtn"]');
        var renameSubmitBtn = document.querySelector('label[for="renameSubmitBtn"]');
        var linkSizePicker = document.querySelector('label[for="linkSizePicker"]');
        var showLinkChecked = document.getElementById('showLinkCheckbox') ? document.getElementById('showLinkCheckbox').checked : true;
        var showSendChecked = document.getElementById('showSendCheckbox') ? document.getElementById('showSendCheckbox').checked : true;
        var layoutChecked = document.getElementById('layoutCheckbox') ? document.getElementById('layoutCheckbox').checked : false;
        
        // heightAdjustBtn 依赖于 layoutCheckbox
        if (heightAdjustBtn) {
            if (!layoutChecked) {
                heightAdjustBtn.style.opacity = '0.7';
                heightAdjustBtn.style.cursor = 'not-allowed';
                heightAdjustBtn.style.pointerEvents = 'none';
            } else {
                heightAdjustBtn.style.opacity = '1';
                heightAdjustBtn.style.cursor = 'pointer';
                heightAdjustBtn.style.pointerEvents = 'auto';
            }
        }
        
        // renameLinkBtn 依赖于 showLinkCheckbox
        if (renameLinkBtn) {
            if (!showLinkChecked) {
                renameLinkBtn.style.opacity = '0.7';
                renameLinkBtn.style.cursor = 'not-allowed';
                renameLinkBtn.style.pointerEvents = 'none';
            } else {
                renameLinkBtn.style.opacity = '1';
                renameLinkBtn.style.cursor = 'pointer';
                renameLinkBtn.style.pointerEvents = 'auto';
            }
        }
        
        // linkColorPicker 依赖于 showLinkCheckbox
        if (linkColorPicker) {
            if (!showLinkChecked) {
                linkColorPicker.style.opacity = '0.7';
                linkColorPicker.style.cursor = 'not-allowed';
                linkColorPicker.style.pointerEvents = 'none';
            } else {
                linkColorPicker.style.opacity = '1';
                linkColorPicker.style.cursor = 'pointer';
                linkColorPicker.style.pointerEvents = 'auto';
            }
        }
        
        // renameSubmitBtn 依赖于 showSendCheckbox
        if (renameSubmitBtn) {
            if (!showSendChecked) {
                renameSubmitBtn.style.opacity = '0.7';
                renameSubmitBtn.style.cursor = 'not-allowed';
                renameSubmitBtn.style.pointerEvents = 'none';
            } else {
                renameSubmitBtn.style.opacity = '1';
                renameSubmitBtn.style.cursor = 'pointer';
                renameSubmitBtn.style.pointerEvents = 'auto';
            }
        }
        
        // linkSizePicker 依赖于 showLinkCheckbox
        if (linkSizePicker) {
            if (!showLinkChecked) {
                linkSizePicker.style.opacity = '0.7';
                linkSizePicker.style.cursor = 'not-allowed';
                linkSizePicker.style.pointerEvents = 'none';
            } else {
                linkSizePicker.style.opacity = '1';
                linkSizePicker.style.cursor = 'pointer';
                linkSizePicker.style.pointerEvents = 'auto';
            }
        }
    }
    
    // 调用初始化函数
    initLabelDisabledState();
    
    // 监听相关复选框变化以更新状态
    if (document.getElementById('showLinkCheckbox')) {
        document.getElementById('showLinkCheckbox').addEventListener('change', function() {
            initLabelDisabledState();
        });
    }
    if (document.getElementById('showSendCheckbox')) {
        document.getElementById('showSendCheckbox').addEventListener('change', function() {
            initLabelDisabledState();
        });
    }
    if (document.getElementById('layoutCheckbox')) {
        document.getElementById('layoutCheckbox').addEventListener('change', function() {
            initLabelDisabledState();
        });
    }
    // engineSelect 鼠标滚轮切换搜索引擎（兼容所有浏览器版本）
    (function() {
        var engineSelect = document.getElementById('engineSelect');
        if (!engineSelect) return;
        
        // 滚动累加值（用于累积滚动长度）
        var scrollDeltaAccumulator = 0;
        // 滚动阈值（累积超过此值才触发切换）
        var SCROLL_THRESHOLD = 120;
        
        // 获取下一个可用选项（非隐藏、非禁用）
        function getNextEnabledOption(currentIndex, step) {
            var options = engineSelect.options;
            var newIndex = currentIndex + step;
            while (newIndex >= 0 && newIndex < options.length) {
                var opt = options[newIndex];
                var isHidden = opt.style.display === 'none';
                var isDisabled = opt.disabled === true;
                if (!isHidden && !isDisabled) {
                    return newIndex;
                }
                newIndex += step;
            }
            return currentIndex;
        }
        
        // 执行切换
        function performSwitch(step) {
            var currentIndex = engineSelect.selectedIndex;
            var newIndex = getNextEnabledOption(currentIndex, step);
            if (newIndex !== currentIndex) {
                engineSelect.selectedIndex = newIndex;
                if (document.createEvent) {
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, false);
                    engineSelect.dispatchEvent(evt);
                } else if (engineSelect.fireEvent) {
                    engineSelect.fireEvent('onchange');
                }
            }
        }
        
        // 滚轮事件处理函数
        function handleWheel(e) {
            e = e || window.event;
            // 防止页面滚动
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            
            var delta = 0;
            if (e.wheelDelta) {
                delta = e.wheelDelta;
            } else if (e.detail) {
                delta = -e.detail;
            }
            
            // 累积滚动值
            scrollDeltaAccumulator += delta;
            
            // 判断是否达到切换阈值
            if (scrollDeltaAccumulator >= SCROLL_THRESHOLD) {
                scrollDeltaAccumulator = 0;
                performSwitch(-1);  // 向上滚动，切换上一个
            } else if (scrollDeltaAccumulator <= -SCROLL_THRESHOLD) {
                scrollDeltaAccumulator = 0;
                performSwitch(1);   // 向下滚动，切换下一个
            }
            
            return false;
        }
        
        // 添加滚轮事件监听（兼容所有浏览器）
        if (engineSelect.addEventListener) {
            engineSelect.addEventListener('wheel', handleWheel);
            engineSelect.addEventListener('mousewheel', handleWheel);
            engineSelect.addEventListener('DOMMouseScroll', handleWheel);
        } else if (engineSelect.attachEvent) {
            engineSelect.attachEvent('onmousewheel', handleWheel);
        }
    })();
    var savedSearchHistoryInSuggestState = localStorage.getItem('searchHistoryInSuggestChecked');
    // 获取两个依赖开关的状态 ===
    var historyChecked = document.getElementById('searchHistoryCheckbox').checked;
    var suggestionsChecked = document.getElementById('searchSuggestionsCheckbox').checked;
    
    if (savedSearchHistoryInSuggestState === 'true') {
        // === 只有两个依赖开关都勾选时才能恢复勾选状态 ===
        if (historyChecked && suggestionsChecked) {
            document.getElementById('searchHistoryInSuggestCheckbox').checked = true;
            var searchHistoryDiv = document.getElementById('searchHistory');
            var clearHistoryBtn = document.getElementById('clearHistoryBtn');
            if (searchHistoryDiv) {
                searchHistoryDiv.style.display = 'none';
            }
            if (clearHistoryBtn) {
                clearHistoryBtn.style.display = 'none';
            }
        } else {
            // 依赖开关未勾选，清除保存的状态
            localStorage.setItem('searchHistoryInSuggestChecked', 'false');
        }
    }
    
    // 初始化禁用状态
    updateHistoryInSuggestDisabled();
    // 修复 Chrome 21 以下版本输入框长度和居中问题
    (function fixOldBrowserLayout() {
        var isOldChrome = false;
        var ua = navigator.userAgent;
        var chromeMatch = ua.match(/Chrome\/(\d+)/);
        if (chromeMatch && parseInt(chromeMatch[1], 10) < 21) {
            isOldChrome = true;
        }
        // 检测是否不支持 flex（旧版浏览器回退）
        var div = document.createElement('div');
        var supportsFlex = typeof div.style.flex !== 'undefined' ||
                           typeof div.style.webkitFlex !== 'undefined' ||
                           typeof div.style.msFlex !== 'undefined';
        
        if (isOldChrome || !supportsFlex) {
            var searchContainer = document.getElementById('searchContainer');
            var engineSelect = document.getElementById('engineSelect');
            var urlInput = document.getElementById('urlInput');
            var submitBtn = document.getElementById('submitBtn');
            
            if (searchContainer && urlInput) {
                // 设置容器为块级居中
                if (!document.getElementById('hideSearchContainerCheckbox').checked) {
                    searchContainer.style.display = 'block';
                }
                searchContainer.style.textAlign = 'center';
                
                // 设置子元素内联块
                if (engineSelect) engineSelect.style.display = 'inline-block';
                if (urlInput) {
                    urlInput.style.display = 'inline-block';
                    urlInput.style.width = 'calc(100% - 90px)';
                    urlInput.style.width = 'expression((this.parentNode.offsetWidth - 90) + "px")';
                    urlInput.style.minWidth = '100px';
                }
                if (submitBtn) submitBtn.style.display = 'inline-block';
                
                // 窗口大小改变时重新计算宽度
                function fixInputWidth() {
                    if (urlInput && searchContainer) {
                        var containerWidth = searchContainer.offsetWidth;
                        var otherWidth = 160; // 下拉框和按钮的估算宽度
                        if (containerWidth > otherWidth) {
                            urlInput.style.width = (containerWidth - otherWidth) + 'px';
                        }
                    }
                }
                fixInputWidth();
                if (window.addEventListener) {
                    window.addEventListener('resize', fixInputWidth);
                } else if (window.attachEvent) {
                    window.attachEvent('onresize', fixInputWidth);
                }
            }
        }
    })();
    
    // 修复 Chrome 21-28 版本输入框长度问题
    (function fixChrome28Layout() {
        var ua = navigator.userAgent;
        var chromeMatch = ua.match(/Chrome\/(\d+)/);
        var isOldChrome = false;
        if (chromeMatch) {
            var version = parseInt(chromeMatch[1], 10);
            if (version >= 21 && version <= 28) {
                isOldChrome = true;
            }
        }
        
        // 检测是否支持标准 flex（Chrome 29+ 支持）
        var div = document.createElement('div');
        var supportsStandardFlex = typeof div.style.flex !== 'undefined';
        var supportsWebkitFlex = typeof div.style.webkitFlex !== 'undefined';
        
        if (isOldChrome || (supportsWebkitFlex && !supportsStandardFlex)) {
            var searchContainer = document.getElementById('searchContainer');
            var engineSelect = document.getElementById('engineSelect');
            var urlInput = document.getElementById('urlInput');
            var submitBtn = document.getElementById('submitBtn');
            
            if (searchContainer && urlInput) {
                if (!document.getElementById('hideSearchContainerCheckbox').checked) {
                    searchContainer.style.display = 'block';
                }
                searchContainer.style.textAlign = 'center';
                
                if (engineSelect) engineSelect.style.display = 'inline-block';
                if (urlInput) {
                    urlInput.style.display = 'inline-block';
                    urlInput.style.width = 'calc(100% - 90px)';
                    urlInput.style.minWidth = '100px';
                }
                if (submitBtn) submitBtn.style.display = 'inline-block';
                
                function fixWidth() {
                    if (urlInput && searchContainer) {
                        var w = searchContainer.offsetWidth;
                        if (w > 100) {
                            urlInput.style.width = (w - 160) + 'px';
                        }
                    }
                }
                fixWidth();
                if (window.addEventListener) {
                    window.addEventListener('resize', fixWidth);
                } else if (window.attachEvent) {
                    window.attachEvent('onresize', fixWidth);
                }
            }
        }
    })();
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
    // 【修复】兼容 IE 等旧浏览器中 dataset 属性可能为 undefined 的问题
    var initUrlInput = document.getElementById('urlInput');
    if (initUrlInput) {
        if (initUrlInput.value !== 'https://') {
            if (initUrlInput.dataset) {
                initUrlInput.dataset.userInput = 'true';
            } else {
                initUrlInput.setAttribute('data-user-input', 'true');
            }
        }
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
    ResourceManager.addEvent(window, 'resize', resizeIframe);
    
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
    
    var savedColonBlinkState = localStorage.getItem('colonBlinkChecked');
    if (savedColonBlinkState === 'true') {
        document.getElementById('colonBlinkCheckbox').checked = true;
        // 如果时间链接已启用，启动闪烁效果
        if (document.getElementById('showTimeCheckbox').checked) {
            startColonBlink();
        }
    }

    var savedShowSecondsState = localStorage.getItem('showSecondsChecked');
    if (savedShowSecondsState === 'true') {
        document.getElementById('showSecondsCheckbox').checked = true;
        // 如果时间链接已启用且勾选显示秒数，立即显示秒数
        if (document.getElementById('showTimeCheckbox').checked) {
        updateTimeDisplay(); // 立即更新时间显示
        }
    }
    
    // 检查时间链接是否启用，控制相关控件的disabled状态
    var showTimeChecked = document.getElementById('showTimeCheckbox').checked;
    document.getElementById('showSecondsCheckbox').disabled = !showTimeChecked;
    document.getElementById('colonBlinkCheckbox').disabled = !showTimeChecked;
    document.getElementById('timeFormatSelect').disabled = !showTimeChecked;
    
    var savedShowTimeState = localStorage.getItem('showTimeChecked');
    if (savedShowTimeState === 'true') {
        document.getElementById('showTimeCheckbox').checked = true;
        // 启用相关控件
        document.getElementById('showSecondsCheckbox').disabled = false;
        document.getElementById('colonBlinkCheckbox').disabled = false;
        document.getElementById('timeFormatSelect').disabled = false;
    }
    
    // 加载保存的新版历史记录开关状态
    var savedSearchHistoryInSuggestState = localStorage.getItem('searchHistoryInSuggestChecked');
    if (savedSearchHistoryInSuggestState === 'true') {
        document.getElementById('searchHistoryInSuggestCheckbox').checked = true;
    }
    
    // 监听新版历史记录开关变化
    var historyInSuggestCheckbox = document.getElementById('searchHistoryInSuggestCheckbox');
    if (historyInSuggestCheckbox) {
        historyInSuggestCheckbox.addEventListener('change', function() {
            if (this.disabled) {
                this.checked = false;
                return;
            }
            
            if (this.checked) {
                var searchHistoryDiv = document.getElementById('searchHistory');
                var clearHistoryBtn = document.getElementById('clearHistoryBtn');
                if (searchHistoryDiv) {
                    searchHistoryDiv.style.display = 'none';
                }
                if (clearHistoryBtn) {
                    clearHistoryBtn.style.display = 'none';
                }
                
                localStorage.setItem('searchHistoryInSuggestChecked', 'true');
            } else {
                var historyChecked = document.getElementById('searchHistoryCheckbox').checked;
                if (historyChecked) {
                    var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                    if (history.length > 0) {
                        var searchHistoryDiv = document.getElementById('searchHistory');
                        var clearHistoryBtn = document.getElementById('clearHistoryBtn');
                        if (searchHistoryDiv) {
                            searchHistoryDiv.style.display = 'block';
                        }
                        if (clearHistoryBtn) {
                            clearHistoryBtn.style.display = 'block';
                        }
                        updateSearchHistory();
                    }
                }
                
                localStorage.setItem('searchHistoryInSuggestChecked', 'false');
            }
            
            // === 更新历史记录大小和颜色选择器的禁用状态 ===
            updateHistoryInSuggestDisabled();
        });
    }
    
    // 控制历史记录在建议中显示开关的可用性
    function updateHistoryInSuggestDisabled() {
        var historyChecked = document.getElementById('searchHistoryCheckbox').checked;
        var suggestionsChecked = document.getElementById('searchSuggestionsCheckbox').checked;
        var historyInSuggestCheckbox = document.getElementById('searchHistoryInSuggestCheckbox');
        // === 获取历史记录大小和颜色选择器 ===
        var historyLinksSizeLabel = document.querySelector('label[for="historyLinksSizePicker"]');
        var historyLinksColorLabel = document.querySelector('label[for="historyLinksColorPicker"]');
        
        if (historyInSuggestCheckbox) {
            if (historyChecked && suggestionsChecked) {
                historyInSuggestCheckbox.disabled = false;
            } else {
                historyInSuggestCheckbox.disabled = true;
                if (historyInSuggestCheckbox.checked) {
                    historyInSuggestCheckbox.checked = false;
                    localStorage.setItem('searchHistoryInSuggestChecked', 'false');
                    if (historyChecked) {
                        var searchHistoryDiv = document.getElementById('searchHistory');
                        var clearHistoryBtn = document.getElementById('clearHistoryBtn');
                        if (searchHistoryDiv) {
                            var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                            if (history.length > 0) {
                                searchHistoryDiv.style.display = 'block';
                                if (clearHistoryBtn) clearHistoryBtn.style.display = 'block';
                                updateSearchHistory();
                            }
                        }
                    }
                }
            }
        }
        
        // === 控制历史记录大小和颜色选择器的禁用状态 ===
        // 条件：勾选 searchHistoryCheckbox 且 不勾选 searchHistoryInSuggestCheckbox 时解除禁用
        var shouldEnable = historyChecked && (!historyInSuggestCheckbox || !historyInSuggestCheckbox.checked);
        
        if (historyLinksSizeLabel) {
            if (shouldEnable) {
                historyLinksSizeLabel.style.opacity = '1';
                historyLinksSizeLabel.style.cursor = 'pointer';
                historyLinksSizeLabel.style.pointerEvents = 'auto';
            } else {
                historyLinksSizeLabel.style.opacity = '0.7';
                historyLinksSizeLabel.style.cursor = 'not-allowed';
                historyLinksSizeLabel.style.pointerEvents = 'none';
            }
        }
        
        if (historyLinksColorLabel) {
            if (shouldEnable) {
                historyLinksColorLabel.style.opacity = '1';
                historyLinksColorLabel.style.cursor = 'pointer';
                historyLinksColorLabel.style.pointerEvents = 'auto';
            } else {
                historyLinksColorLabel.style.opacity = '0.7';
                historyLinksColorLabel.style.cursor = 'not-allowed';
                historyLinksColorLabel.style.pointerEvents = 'none';
            }
        }
    }
    
    // 监听相关开关变化
    var searchHistoryCheckbox = document.getElementById('searchHistoryCheckbox');
    if (searchHistoryCheckbox) {
        var originalSearchHistoryChange = searchHistoryCheckbox.onchange || function() {};
        searchHistoryCheckbox.addEventListener('change', function() {
            updateHistoryInSuggestDisabled();
        });
    }
    
    var searchSuggestionsCheckbox = document.getElementById('searchSuggestionsCheckbox');
    if (searchSuggestionsCheckbox) {
        searchSuggestionsCheckbox.addEventListener('change', function() {
            updateHistoryInSuggestDisabled();
        });
    }
    
    // 初始化禁用状态
    updateHistoryInSuggestDisabled();
});

// 如果是电脑端，禁用移动搜索选项
if (isDesktop()) {
    document.getElementById('shenmaOption').disabled = true;
    document.getElementById('quarksoOption').disabled = true;
    document.getElementById('baidueasyOption').disabled = true;
    document.getElementById('quarkFanyiOption').disabled = true;
    document.getElementById('pinduoduoOption').disabled = true;
}

if (isMobileAndroidApple()) {
    document.getElementById('quarkaiOption').disabled = true;
    document.getElementById('baidutwOption').disabled = true;
    document.getElementById('douyinpcOption').disabled = true;
    document.getElementById('kuaiHandOption').disabled = true;
    document.getElementById('kuaiHandOption').style.display = 'none';
    document.getElementById('xHongshuOption').disabled = true;
    document.getElementById('xHongshuOption').style.display = 'none';
    document.getElementById('tencentFanyi2').disabled = true;
    document.getElementById('tencentFanyi2').style.display = 'none';
}

// ========== 修复 IE 浏览器下搜索引擎下拉框读取问题 ==========
// 获取当前选中的搜索引擎值（兼容 IE）
function getSelectedEngineValue() {
    var engineSelect = document.getElementById('engineSelect');
    if (!engineSelect) return 'baidu';
    
    // IE 兼容：优先使用 selectedIndex 获取选中项的值
    var selectedIndex = engineSelect.selectedIndex;
    if (selectedIndex >= 0 && engineSelect.options[selectedIndex]) {
        var optionValue = engineSelect.options[selectedIndex].value;
        if (optionValue && optionValue !== '') {
            return optionValue;
        }
    }
    
    // 备用方案：直接读取 value 属性
    var value = engineSelect.value;
    if (value && value !== '') return value;
    
    return 'baidu';
}

// 获取当前选中的搜索引擎显示文本（用于调试）
function getSelectedEngineText() {
    var engineSelect = document.getElementById('engineSelect');
    if (!engineSelect) return '';
    var selectedIndex = engineSelect.selectedIndex;
    if (selectedIndex >= 0 && engineSelect.options[selectedIndex]) {
        return engineSelect.options[selectedIndex].text;
    }
    return '';
}

// 重新绑定提交按钮事件（确保 IE 兼容）
function bindSubmitEvent() {
    var submitBtn = document.getElementById('submitBtn');
    var urlInput = document.getElementById('urlInput');
    
    if (!submitBtn) return;
    
    // ========== 【修复】使用更安全的事件绑定方式，避免 cloneNode 导致内存泄漏 ==========
    // 先移除旧事件（如果存在）
    if (submitBtn._boundClickHandler) {
        if (submitBtn.removeEventListener) {
            submitBtn.removeEventListener('click', submitBtn._boundClickHandler);
        } else if (submitBtn.detachEvent) {
            submitBtn.detachEvent('onclick', submitBtn._boundClickHandler);
        }
    }
    
    // 移除所有现有事件（避免重复绑定）
    var newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    submitBtn = newSubmitBtn;
    
    submitBtn.onclick = function(e) {
        e = e || window.event;
        
        var url = urlInput ? urlInput.value.trim() : '';
        var engine = getSelectedEngineValue();
        
        // 保存当前选择
        try {
            localStorage.setItem('selectedEngine', engine);
        } catch(err) {}
        
        // ========== 【修改位置】跳转/搜索前，记录即将失焦状态 ==========
        // 设置一个标记，表示即将进行跳转
        window._isNavigating = true;
        
        // 清除之前的定时器
        if (window._clearNavigationFlagTimer) {
            clearTimeout(window._clearNavigationFlagTimer);
        }
        // 3秒后清除标记（防止标记残留）
        window._clearNavigationFlagTimer = setTimeout(function() {
            window._isNavigating = false;
        }, 3000);
        // ========== 【修改结束】 ==========
        
        // 检测是否启用直接跳转网址功能且输入符合网址格式
        var directUrlJumpCheckbox = document.getElementById('directUrlJumpCheckbox');
        if (directUrlJumpCheckbox && directUrlJumpCheckbox.checked) {
            var inputText = url;
            var isUrlPattern = false;
            
            // 排除纯数字、小数、负数等非网址格式
            var isNumberPattern = /^[+-]?\d+(\.\d+)?$/;
            if (isNumberPattern.test(inputText)) {
                isUrlPattern = false;
            } else {
                // 检测网址格式
                var urlPatterns = [
                    /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/|$)/,
                    /^https?:\/\//,
                    /^www\.[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/,
                    /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}\.[a-zA-Z]{2,}/,
                    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?(?:\/|$)/
                ];
                
                for (var i = 0; i < urlPatterns.length; i++) {
                    if (urlPatterns[i].test(inputText)) {
                        isUrlPattern = true;
                        break;
                    }
                }
            }
            
            // 额外检测包含斜杠的网址格式
            if (!isUrlPattern && inputText.indexOf('/') !== -1) {
                var slashIndex = inputText.indexOf('/');
                var beforeSlash = inputText.substring(0, slashIndex);
                for (var i = 0; i < urlPatterns.length; i++) {
                    if (urlPatterns[i].test(beforeSlash)) {
                        isUrlPattern = true;
                        break;
                    }
                }
            }
            
            // 如果检测到非英文字符，不视为网址格式
            if (isUrlPattern && /[^\x00-\x7F]/.test(inputText)) {
                var protocolIndex = inputText.indexOf('://');
                if (protocolIndex !== -1) {
                    var afterProtocol = inputText.substring(protocolIndex + 3);
                    var firstSlashIndex = afterProtocol.indexOf('/');
                    if (firstSlashIndex !== -1) {
                        var domainPart = afterProtocol.substring(0, firstSlashIndex);
                        if (/[^\x00-\x7F]/.test(domainPart)) isUrlPattern = false;
                    } else {
                        if (/[^\x00-\x7F]/.test(afterProtocol)) isUrlPattern = false;
                    }
                } else {
                    var slashIdx = inputText.indexOf('/');
                    if (slashIdx !== -1) {
                        var beforeSlashUrl = inputText.substring(0, slashIdx);
                        if (/[^\x00-\x7F]/.test(beforeSlashUrl)) isUrlPattern = false;
                    } else {
                        if (/[^\x00-\x7F]/.test(inputText)) isUrlPattern = false;
                    }
                }
            }
            
            // 保存历史记录
            if (inputText) {
                var searchHistoryCheckbox = document.getElementById('searchHistoryCheckbox');
                if (searchHistoryCheckbox && searchHistoryCheckbox.checked) {
                    try {
                        var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                        if (inputText !== 'https://' && inputText !== 'http://') {
                            var filteredHistory = [];
                            for (var h = 0; h < history.length; h++) {
                                if (history[h].text !== inputText) {
                                    filteredHistory.push(history[h]);
                                }
                            }
                            filteredHistory.unshift({ text: inputText });
                            var limitedHistory = filteredHistory.slice(0, 10);
                            localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
                            if (typeof updateSearchHistory === 'function') updateSearchHistory();
                        }
                    } catch(err) {}
                }
            }
            
            // 如果符合网址格式且不包含://，则直接跳转
            if (isUrlPattern && inputText.indexOf('://') === -1 && inputText.indexOf('/') !== 0) {
                var finalUrl = inputText;
                var hasProtocol = finalUrl.indexOf('://') !== -1;
                var isRelativePath = finalUrl.indexOf('/') === 0;
                
                if (!hasProtocol && !isRelativePath) {
                    if (engine === 'autofillHttp1') {
                        finalUrl = 'http://' + finalUrl;
                    } else if (engine === 'autofillHttps') {
                        finalUrl = 'https://' + finalUrl;
                    } else if (engine === 'iFrameFree') {
                        finalUrl = 'https://' + finalUrl;
                        var webFrame = document.getElementById('webFrame');
                        if (webFrame) webFrame.src = finalUrl;
                        var iframeContainer = document.getElementById('iframeContainer');
                        if (iframeContainer) iframeContainer.style.display = 'block';
                        return;
                    } else if (engine === 'iFramePlus') {
                        finalUrl = 'https://' + finalUrl;
                        if (typeof createIframePlusWindow === 'function') {
                            createIframePlusWindow(finalUrl);
                        }
                        var engineSelectDom = document.getElementById('engineSelect');
                        if (engineSelectDom) {
                            engineSelectDom.value = 'iFramePlus';
                        }
                        try { localStorage.setItem('selectedEngine', 'iFramePlus'); } catch(err) {}
                        return;
                    } else {
                        finalUrl = 'https://' + finalUrl;
                    }
                }
                
                // 搜索后清空输入功能
                var clearOnSearchCheckbox = document.getElementById('clearOnSearchCheckbox');
                if (clearOnSearchCheckbox && clearOnSearchCheckbox.checked && engine !== 'iFrameFree') {
                    setTimeout(function() {
                        if (urlInput) urlInput.value = '';
                        var saveInputCheckbox = document.getElementById('saveInputCheckbox');
                        if (saveInputCheckbox && saveInputCheckbox.checked) {
                            try { localStorage.removeItem('savedInputText'); } catch(err) {}
                        }
                    }, 0);
                }
                
                var autoNewTabCheckbox = document.getElementById('autoNewTabCheckbox');
                var isAutoNewTabChecked = autoNewTabCheckbox ? autoNewTabCheckbox.checked : false;
                var excludedEngines = ['autofillHttp1', 'autofillHttps', 'newtabpageHttp1', 'newtabpageHttps', 'httpsAutoFill', 'iFrameFree', 'showCheckbox'];
                var shouldOpenNewTab = isAutoNewTabChecked && excludedEngines.indexOf(engine) === -1;
                
                if (shouldOpenNewTab) {
                    window.open(finalUrl, '_blank');
                } else if (engine === 'httpsAutoFill' && finalUrl) {
                    try {
                        var form = document.createElement('form');
                        form.action = finalUrl;
                        form.target = '_self';
                        form.method = 'post';
                        form.style.display = 'none';
                        var submitButton = document.createElement('button');
                        submitButton.type = 'submit';
                        form.appendChild(submitButton);
                        document.body.appendChild(form);
                        form.submit();
                        document.body.removeChild(form);
                    } catch(err) {
                        window.location.href = finalUrl;
                    }
                    return;
                } else {
                    window.location.href = finalUrl;
                }
                return;
            }
        }
        
        // 搜索后清空输入功能
        var clearOnSearchCheckbox = document.getElementById('clearOnSearchCheckbox');
        if (clearOnSearchCheckbox && clearOnSearchCheckbox.checked && engine !== 'iFrameFree') {
            setTimeout(function() {
                if (urlInput) urlInput.value = '';
                var saveInputCheckbox = document.getElementById('saveInputCheckbox');
                if (saveInputCheckbox && saveInputCheckbox.checked) {
                    try { localStorage.removeItem('savedInputText'); } catch(err) {}
                }
            }, 0);
        }
        
        // 如果选择iFrameFree且输入了完整URL，直接在iframe中加载
        if (engine === 'iFrameFree' && url.indexOf('://') !== -1) {
            var webFrame = document.getElementById('webFrame');
            if (webFrame) webFrame.src = url;
            var iframeContainer = document.getElementById('iframeContainer');
            if (iframeContainer) iframeContainer.style.display = 'block';
            return;
        }
        
        if (engine === 'iFramePlus') {
            var urlToLoad = url;
            if (urlToLoad && (urlToLoad.indexOf('http://') === 0 || urlToLoad.indexOf('https://') === 0)) {
                if (typeof createIframePlusWindow === 'function') {
                    createIframePlusWindow(urlToLoad);
                }
                return;
            }
        }
        
        var searchText = url;
        if (searchText) {
            var searchHistoryCheckbox = document.getElementById('searchHistoryCheckbox');
            if (searchHistoryCheckbox && searchHistoryCheckbox.checked) {
                try {
                    var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                    if (searchText !== 'https://' && searchText !== 'http://') {
                        var filteredHistory = [];
                        for (var h = 0; h < history.length; h++) {
                            if (history[h].text !== searchText) {
                                filteredHistory.push(history[h]);
                            }
                        }
                        filteredHistory.unshift({ text: searchText });
                        var limitedHistory = filteredHistory.slice(0, 10);
                        localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
                        if (typeof updateSearchHistory === 'function') updateSearchHistory();
                    }
                } catch(err) {}
            }
        }
        
        // 如果保存输入文本复选框被勾选，保存当前输入
        var saveInputCheckbox = document.getElementById('saveInputCheckbox');
        if (saveInputCheckbox && saveInputCheckbox.checked) {
            try {
                localStorage.setItem('savedInputText', url);
            } catch(err) {}
        }
        
        // 构建搜索URL
        var searchUrl = url;
        if (searchUrl && searchUrl.indexOf('://') === -1) {
            // 根据选择的搜索引擎构建搜索URL
            switch (engine) {
                case 'baidu':
                    searchUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchUrl);
                    break;
                case 'google':
                    searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'bing':
                    searchUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'sogou':
                    searchUrl = 'https://www.sogou.com/web?query=' + encodeURIComponent(searchUrl);
                    break;
                case 'so':
                    searchUrl = 'https://www.so.com/s?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'yandex':
                    searchUrl = 'https://yandex.com/search/?text=' + encodeURIComponent(searchUrl);
                    break;
                case 'braveSearch':
                    searchUrl = 'https://search.brave.com/search?q=' + encodeURIComponent(searchUrl) + '&source=web';
                    break;
                case 'yahooSearch':
                    searchUrl = 'https://sg.search.yahoo.com/search?p=' + encodeURIComponent(searchUrl);
                    break;
                case 'autofillHttp1':
                    searchUrl = 'http://' + searchUrl;
                    break;
                case 'autofillHttps':
                    searchUrl = 'https://' + searchUrl;
                    break;
                case 'newtabpageHttp1':
                    if (searchUrl) {
                        if (searchUrl.indexOf('://') === -1) searchUrl = 'http://' + searchUrl;
                        window.open(searchUrl, '_blank');
                        return;
                    }
                    break;
                case 'newtabpageHttps':
                    if (searchUrl) {
                        if (searchUrl.indexOf('://') === -1) searchUrl = 'https://' + searchUrl;
                        window.open(searchUrl, '_blank');
                        return;
                    }
                    break;
                case 'httpsAutoFill':
                    try {
                        var form = document.createElement('form');
                        form.action = searchUrl.indexOf('https://') === 0 ? searchUrl : 'https://' + searchUrl;
                        form.target = '_self';
                        form.method = 'post';
                        form.style.display = 'none';
                        var submitButton = document.createElement('button');
                        submitButton.type = 'submit';
                        form.appendChild(submitButton);
                        document.body.appendChild(form);
                        form.submit();
                        document.body.removeChild(form);
                    } catch(err) {
                        window.location.href = searchUrl;
                    }
                    return;
                case 'duckduckgo':
                    searchUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'sodouyinM':
                    searchUrl = 'https://so.douyin.com/s?keyword=' + encodeURIComponent(searchUrl);
                    break;
                case 'yzmsmM':
                    searchUrl = 'https://yz.m.sm.cn/s?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'sotoutiaoM':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://so.toutiao.com/search?keyword=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://so.toutiao.com/search?dvpf=pc&source=input&keyword=' + encodeURIComponent(searchUrl) + '&lang=en2zh';
                    }
                    break;
                case 'qksmSearch':
                    searchUrl = 'https://quark.sm.cn/s?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'baiduMEasy':
                    searchUrl = 'https://m.baidu.com/from=1030335w/pu=sz%401321_1001/s?word=' + encodeURIComponent(searchUrl);
                    break;
                case 'metasosuoAI':
                    searchUrl = 'https://metaso.cn/?s=nyzav&referrer_s=nyzav&q=' + encodeURIComponent(searchUrl);
                    break;
                case 'baiduAI':
                    searchUrl = 'https://chat.baidu.com/search?word=' + encodeURIComponent(searchUrl);
                    break;
                case '360namisoAI':
                    searchUrl = 'https://www.n.cn/?src=360ai_so&s_type=l&q=' + encodeURIComponent(searchUrl);
                    break;
                case 'zhihuZhiDaAI':
                    searchUrl = 'https://zhida.zhihu.com/search?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'quarkpcAI':
                    searchUrl = 'https://ai.quark.cn/s?ch=pcquark%40homepage_quarkweb&q=' + encodeURIComponent(searchUrl) + '&frame_scene=deep_think_light_r1lite&by=deepthink_light';
                    break;
                case 'googleTranslate':
                    searchUrl = 'https://translate.google.com/?sl=auto&tl=zh-CN&text=' + encodeURIComponent(searchUrl);
                    break;
                case 'mcTranslator':
                    searchUrl = 'https://cn.bing.com/translator?text=' + encodeURIComponent(searchUrl) + '&from=en&to=zh-Hans';
                    break;
                case 'yandexTranslate':
                    searchUrl = 'https://translate.yandex.com/?source_lang=en&target_lang=zh&text=' + encodeURIComponent(searchUrl);
                    break;
                case 'sogouFanyi':
                    searchUrl = 'https://fanyi.sogou.com/text?fr=default&keyword=' + encodeURIComponent(searchUrl);
                    break;
                case 'oldBaiduFanyi':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://fanyi.baidu.com/translate#auto/zh/' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://fanyi.baidu.com/mtpe-individual/transText?query=' + encodeURIComponent(searchUrl) + '&lang=en2zh';
                    }
                    break;
                case 'fanyiSo':
                    searchUrl = 'https://fanyi.so.com/#' + encodeURIComponent(searchUrl);
                    break;
                case 'quarkTranslateTools':
                    searchUrl = 'https://vt.quark.cn/blm/translation-486/translate?query=' + encodeURIComponent(searchUrl) + '&source_language=detect&target_language=zh&from=douyin';
                    break;
                case 'transmartQQTs':
                    searchUrl = 'https://transmart.qq.com/zh-CN/index?sourcelang=auto&targetlang=zh&source=' + encodeURIComponent(searchUrl);
                    break;
                case 'taobaoWeb':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://main.m.taobao.com/search/index.html?q=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://s.taobao.com/search?q=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'jdWebPage':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://so.m.jd.com/ware/search.action?keyword=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://search.jd.com/Search?keyword=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'pddWebPage':
                    searchUrl = 'https://mobile.yangkeduo.com/search_result.html?search_key=' + encodeURIComponent(searchUrl) + '&search_type=goods&options=1&search_met_track=manual&refer_page_name=search_result';
                    break;
                case 'githubCode':
                    searchUrl = 'https://github.com/search?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'gitCodeRepo':
                    searchUrl = 'https://gitcode.com/search?q=' + encodeURIComponent(searchUrl) + '&type=repo';
                    break;
                case 'giteeCode':
                    searchUrl = 'https://so.gitee.com/?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'baiduTw':
                    searchUrl = 'https://www.baidu.com/s?cl=3&tn=baidubig5&ie=utf8&wd=' + encodeURIComponent(searchUrl);
                    break;
                case 'biliTv':
                    searchUrl = 'http://search.bilibili.com/all?keyword=' + encodeURIComponent(searchUrl);
                    break;
                case 'dyIsWindows':
                    searchUrl = 'https://www.douyin.com/root/search/' + encodeURIComponent(searchUrl);
                    break;
                case 'haokanVideo':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://haokan.baidu.com/videoui/page/search/result?searchword=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://haokan.baidu.com/web/search/page?query=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'fastHandVideo':
                    searchUrl = 'https://www.kuaishou.com/search/' + encodeURIComponent(searchUrl);
                    break;
                case 'hongshuVideo':
                    searchUrl = 'https://www.xiaohongshu.com/search_result?keyword=' + encodeURIComponent(searchUrl);
                    break;
                case 'enUsYoutubeVideo':
                    searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(searchUrl);
                    break;
                case 'soHuVideo':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://m.tv.sohu.com/upload/h5/m/mso.html?key=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://tv.sohu.com/mts/?key=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'tencentTv':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://m.v.qq.com/hippysearch/index.html#/result?query=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://v.qq.com/x/search/?q=' + encodeURIComponent(searchUrl) + '&lang=en2zh';
                    }
                    break;
                case 'zhihuFriends':
                    searchUrl = 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(searchUrl);
                    break;
                case 'csdnWebPage':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://so.csdn.net/so/search?q=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://so.csdn.net/so/search?spm=0&q=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'weiboFriends':
                    searchUrl = 'https://s.weibo.com/weibo?q=' + encodeURIComponent(searchUrl);
                    break;
                case 'bdZhidao':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://zhidao.baidu.com/index?word=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://zhidao.baidu.com/search?word=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'showCheckbox':
                    searchUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchUrl);
                    break;
                case 'kfBaidu':
                    searchUrl = 'https://kaifa.baidu.com/searchPage?wd=' + encodeURIComponent(searchUrl);
                    break;
                case 'weixinSogou':
                    if (typeof isMobileAndroidApple === 'function' && isMobileAndroidApple()) {
                        searchUrl = 'https://weixin.sogou.com/weixinwap?type=2&query=' + encodeURIComponent(searchUrl);
                    } else {
                        searchUrl = 'https://weixin.sogou.com/weixin?type=2&query=' + encodeURIComponent(searchUrl);
                    }
                    break;
                case 'baidu_0':
                    searchUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchUrl);
                    break;
                case 'customSearch':
                    var customSearchUrl = null;
                    try { customSearchUrl = localStorage.getItem('customSearchUrl'); } catch(err) {}
                    if (customSearchUrl) {
                        searchUrl = customSearchUrl.replace('{keywords}', encodeURIComponent(searchUrl));
                    } else {
                        searchUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchUrl);
                    }
                    break;
                default:
                    if (engine.indexOf('customSearch_') === 0) {
                        var order = parseInt(engine.split('_')[1]);
                        var customSearches = [];
                        try { customSearches = JSON.parse(localStorage.getItem('customSearches') || '[]'); } catch(err) {}
                        var customSearch = null;
                        for (var i = 0; i < customSearches.length; i++) {
                            if (customSearches[i].order === order) {
                                customSearch = customSearches[i];
                                break;
                            }
                        }
                        if (customSearch) {
                            searchUrl = customSearch.url.replace('{keywords}', encodeURIComponent(searchUrl));
                        } else {
                            searchUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchUrl);
                        }
                    }
                    break;
                case 'iFrameFree':
                    if (searchUrl && searchUrl.indexOf('://') === -1) {
                        searchUrl = 'https://' + searchUrl;
                    }
                    if (searchUrl) {
                        var webFrame = document.getElementById('webFrame');
                        if (webFrame) webFrame.src = searchUrl;
                        var iframeContainer = document.getElementById('iframeContainer');
                        if (iframeContainer) iframeContainer.style.display = 'block';
                        var sizeBtn = document.getElementById('iframePlusSizeBtn');
                        if (sizeBtn) sizeBtn.style.display = 'block';
                    }
                    return;
                case 'iFramePlus':
                    if (searchUrl && (searchUrl.indexOf('http://') === 0 || searchUrl.indexOf('https://') === 0)) {
                        if (typeof createIframePlusWindow === 'function') createIframePlusWindow(searchUrl);
                    } else if (searchUrl && searchUrl.indexOf('://') === -1) {
                        searchUrl = 'https://' + searchUrl;
                        if (typeof createIframePlusWindow === 'function') createIframePlusWindow(searchUrl);
                    } else if (searchUrl) {
                        if (typeof createIframePlusWindow === 'function') createIframePlusWindow(searchUrl);
                    }
                    return;
            }
        }
        
        // 最终跳转
        if (searchUrl) {
            var autoNewTabCheckbox = document.getElementById('autoNewTabCheckbox');
            var isAutoNewTabChecked = autoNewTabCheckbox ? autoNewTabCheckbox.checked : false;
            var excludedEngines = ['autofillHttp1', 'autofillHttps', 'newtabpageHttp1', 'newtabpageHttps', 'httpsAutoFill', 'iFrameFree', 'showCheckbox'];
            var shouldOpenNewTab = isAutoNewTabChecked && excludedEngines.indexOf(engine) === -1;
            
            if (shouldOpenNewTab) {
                window.open(searchUrl, '_blank');
                return;
            } else if (engine === 'httpsAutoFill' && searchUrl) {
                try {
                    var form = document.createElement('form');
                    form.action = searchUrl;
                    form.target = '_self';
                    form.method = 'post';
                    form.style.display = 'none';
                    var submitButton = document.createElement('button');
                    submitButton.type = 'submit';
                    form.appendChild(submitButton);
                    document.body.appendChild(form);
                    form.submit();
                    document.body.removeChild(form);
                } catch(err) {
                    window.location.href = searchUrl;
                }
                return;
            } else {
                try {
                    window.location.href = searchUrl;
                } catch(err) {
                    window.location = searchUrl;
                }
            }
        }
    };
}

// 在 DOM 加载完成后绑定事件
if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function() {
        bindSubmitEvent();
    });
} else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', function() {
        if (document.readyState === 'complete') {
            bindSubmitEvent();
        }
    });
}

// 确保 engineSelect 变化时也能正确保存（IE 兼容）
var engineSelect = document.getElementById('engineSelect');
if (engineSelect) {
    if (engineSelect.addEventListener) {
        engineSelect.addEventListener('change', function() {
            var selectedValue = getSelectedEngineValue();
            try { localStorage.setItem('selectedEngine', selectedValue); } catch(err) {}
        });
    } else if (engineSelect.attachEvent) {
        engineSelect.attachEvent('onchange', function() {
            var selectedValue = getSelectedEngineValue();
            try { localStorage.setItem('selectedEngine', selectedValue); } catch(err) {}
        });
    }
}
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

// iFramePlus 多窗口管理
// 将变量挂载到 window 对象，确保全局可访问
window.iframePlusWindows = window.iframePlusWindows || [];
var iframePlusWindows = window.iframePlusWindows;
var iframePlusNextId = 1;

// 修改容器创建函数，确保容器引用全局可用
function createIframePlusContainer() {
    var container = document.getElementById('iframePlusContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'iframePlusContainer';
        container.style.cssText = 'display:none;width:100%;margin-top:10px;text-align:center;';
        
        // 兼容所有浏览器的 flex 回退
        container.style.display = '-webkit-box';
        container.style.display = '-moz-box';
        container.style.display = '-ms-flexbox';
        container.style.display = '-webkit-flex';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.webkitFlexWrap = 'wrap';
        container.style.msFlexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.webkitJustifyContent = 'center';
        container.style.msFlexPack = 'center';
        
        // 插入到 iframeContainer 后面
        var iframeContainer = document.getElementById('iframeContainer');
        if (iframeContainer && iframeContainer.parentNode) {
            iframeContainer.parentNode.insertBefore(container, iframeContainer.nextSibling);
        } else {
            document.body.appendChild(container);
        }
    }
    return container;
}

// 创建新窗口时确保容器显示
// iFramePlus 多窗口管理（修复内存泄漏）
window.iframePlusWindows = window.iframePlusWindows || [];
var iframePlusWindows = window.iframePlusWindows;
var iframePlusNextId = 1;

function createIframePlusContainer() {
    var container = document.getElementById('iframePlusContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'iframePlusContainer';
        container.style.cssText = 'display:none;width:100%;margin-top:10px;text-align:center;';
        container.style.display = '-webkit-box';
        container.style.display = '-moz-box';
        container.style.display = '-ms-flexbox';
        container.style.display = '-webkit-flex';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.webkitFlexWrap = 'wrap';
        container.style.msFlexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.webkitJustifyContent = 'center';
        container.style.msFlexPack = 'center';
        
        var iframeContainer = document.getElementById('iframeContainer');
        if (iframeContainer && iframeContainer.parentNode) {
            iframeContainer.parentNode.insertBefore(container, iframeContainer.nextSibling);
        } else {
            document.body.appendChild(container);
        }
    }
    return container;
}

function createIframePlusWindow(url) {
    var container = createIframePlusContainer();
    container.style.display = 'block';
    
    var windowId = 'iframePlus_' + (iframePlusNextId++);
    var isMobile = typeof isMobileAndroidApple === 'function' ? isMobileAndroidApple() : false;
    
    var wrapper = document.createElement('div');
    wrapper.id = windowId;
    wrapper.className = 'iframe-plus-wrapper';
    
    var savedWidth = null;
    try { savedWidth = localStorage.getItem('iframePlusWidth'); } catch(e) {}
    var defaultWidth = isMobile ? '98%' : '390px';
    wrapper.style.width = savedWidth ? savedWidth : defaultWidth;
    wrapper.style.maxWidth = isMobile ? '100%' : '960px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.marginRight = '7px';
    wrapper.style.display = 'inline-block';
    wrapper.style.verticalAlign = 'top';
    wrapper.style.margin = '5px auto';
    
    var iframe = document.createElement('iframe');
    iframe.src = url || 'about:blank';
    iframe.style.cssText = 'width:100%;height:500px;border:1px solid #ccc;background:#fff;';
    iframe.style.width = '100%';
    var savedHeight = null;
    try { savedHeight = localStorage.getItem('iframePlusHeight'); } catch(e) {}
    var defaultHeight = isMobile ? '500px' : '500px';
    iframe.style.height = savedHeight ? savedHeight : defaultHeight;
    
    var closeContainer = document.createElement('div');
    closeContainer.style.cssText = 'text-align:right;margin-top:7px;margin-bottom:5px;';
    
    var refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '<i class="fa fa-repeat" style="font-size: 18px;"></i>';
    refreshBtn.style.cssText = 'cursor:pointer;margin-right:5px;-webkit-tap-highlight-color: transparent;';
    refreshBtn.onclick = function() {
        var currentSrc = iframe.src;
        iframe.src = currentSrc;
    };
    
    var editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fa fa-pencil" style="font-size: 18px;"></i>';
    editBtn.style.cssText = 'cursor:pointer;margin-right:5px;-webkit-tap-highlight-color: transparent;';
    editBtn.onclick = function() {
        var currentUrl = iframe.src;
        if (typeof showCustomModal === 'function') {
            showCustomModal('编辑窗口网址：', currentUrl, function(newUrl) {
                if (newUrl !== null && newUrl.trim() !== '') {
                    iframe.src = newUrl;
                    for (var i = 0; i < window.iframePlusWindows.length; i++) {
                        if (window.iframePlusWindows[i].id === windowId) {
                            window.iframePlusWindows[i].url = newUrl;
                            break;
                        }
                    }
                }
            });
        }
    };
    
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa fa-close" style="font-size: 18px;"></i>';
    closeBtn.style.cssText = 'cursor:pointer;margin-right:5px;-webkit-tap-highlight-color: transparent;';
    closeBtn.onclick = function() {
        closeIframePlusWindow(windowId);
    };
    
    closeContainer.appendChild(refreshBtn);
    closeContainer.appendChild(editBtn);
    closeContainer.appendChild(closeBtn);
    wrapper.appendChild(iframe);
    wrapper.appendChild(closeContainer);
    container.appendChild(wrapper);
    
    // 注册动态元素以便清理
    ResourceManager.registerElement(wrapper);
    
    window.iframePlusWindows.push({
        id: windowId,
        wrapper: wrapper,
        iframe: iframe,
        url: url
    });
    
    var hitokoto = document.getElementById('hitokotoDisplay');
    if (hitokoto) {
        hitokoto.style.marginTop = '40px';
    }
    
    return windowId;
}

function closeIframePlusWindow(windowId) {
    var container = document.getElementById('iframePlusContainer');
    if (!container) return;
    
    var wrapper = document.getElementById(windowId);
    if (wrapper) {
        // 清理 iframe 内容以防止内存泄漏
        var iframe = wrapper.querySelector('iframe');
        if (iframe) {
            iframe.src = 'about:blank';
            iframe.onload = null;
            iframe.onerror = null;
        }
        // 清理所有按钮引用
        var buttons = wrapper.getElementsByTagName('button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onclick = null;
        }
        if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
    }
    
    for (var i = window.iframePlusWindows.length - 1; i >= 0; i--) {
        if (window.iframePlusWindows[i].id === windowId) {
            window.iframePlusWindows.splice(i, 1);
            break;
        }
    }
    
    if (window.iframePlusWindows.length === 0) {
        container.style.display = 'none';
        var hitokoto = document.getElementById('hitokotoDisplay');
        if (hitokoto) {
            hitokoto.style.marginTop = '10px';
        }
    }
}

function closeAllIframePlusWindows() {
    var container = document.getElementById('iframePlusContainer');
    if (container) {
        var wrappers = container.getElementsByClassName('iframe-plus-wrapper');
        for (var i = wrappers.length - 1; i >= 0; i--) {
            var iframe = wrappers[i].querySelector('iframe');
            if (iframe) {
                iframe.src = 'about:blank';
                iframe.onload = null;
                iframe.onerror = null;
            }
        }
        container.innerHTML = '';
        container.style.display = 'none';
    }
    window.iframePlusWindows = [];
    var hitokoto = document.getElementById('hitokotoDisplay');
    if (hitokoto) {
        hitokoto.style.marginTop = '10px';
    }
}

// 关闭窗口，当没有窗口时隐藏容器
function closeIframePlusWindow(windowId) {
    var container = document.getElementById('iframePlusContainer');
    if (!container) return;
    
    var wrapper = document.getElementById(windowId);
    if (wrapper && wrapper.parentNode === container) {
        container.removeChild(wrapper);
    }
    
    for (var i = window.iframePlusWindows.length - 1; i >= 0; i--) {
        if (window.iframePlusWindows[i].id === windowId) {
            window.iframePlusWindows.splice(i, 1);
            break;
        }
    }
    
    // 当没有窗口时隐藏容器
    if (window.iframePlusWindows.length === 0) {
        container.style.display = 'none';
        var hitokoto = document.getElementById('hitokotoDisplay');
        if (hitokoto) {
            hitokoto.style.marginTop = '10px';
        }
    }
}

// 关闭所有窗口时隐藏容器
function closeAllIframePlusWindows() {
    var container = document.getElementById('iframePlusContainer');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
    window.iframePlusWindows = [];
    var hitokoto = document.getElementById('hitokotoDisplay');
    if (hitokoto) {
        hitokoto.style.marginTop = '10px';
    }
}

// 保存和加载clearOnSearchCheckbox状态（修复：支持所有浏览器版本）
var savedClearOnSearchState = localStorage.getItem('clearOnSearchChecked');
var clearOnSearchCheckbox = document.getElementById('clearOnSearchCheckbox');
if (clearOnSearchCheckbox) {
    if (savedClearOnSearchState === 'true') {
        clearOnSearchCheckbox.checked = true;
    } else if (savedClearOnSearchState === 'false') {
        clearOnSearchCheckbox.checked = false;
    }
    // 添加change事件监听保存状态
    if (clearOnSearchCheckbox.addEventListener) {
        clearOnSearchCheckbox.addEventListener('change', function() {
            localStorage.setItem('clearOnSearchChecked', this.checked ? 'true' : 'false');
        });
    } else if (clearOnSearchCheckbox.attachEvent) {
        clearOnSearchCheckbox.attachEvent('onchange', function() {
            localStorage.setItem('clearOnSearchChecked', this.checked ? 'true' : 'false');
        });
    }
}

// 加载保存的clearOnBlurCheckbox状态
var savedClearOnBlurState = localStorage.getItem('clearOnBlurChecked');
if (savedClearOnBlurState === 'true') {
    document.getElementById('clearOnBlurCheckbox').checked = true;
} else if (savedClearOnBlurState === 'false') {
    document.getElementById('clearOnBlurCheckbox').checked = false;
}

// 监听clearOnBlurCheckbox变化
document.getElementById('clearOnBlurCheckbox').addEventListener('change', function() {
    localStorage.setItem('clearOnBlurChecked', this.checked);
});

// 监听 clearOnBlurCheckbox 的 blur 事件处理
document.getElementById('urlInput').addEventListener('blur', function(e) {
    if (document.getElementById('focusCheckbox').checked && document.getElementById('clearOnBlurCheckbox').checked) {
        // 检查相关目标是否是快捷输入按钮区域内的元素
        var relatedTarget = e.relatedTarget;
        var isQuickInputBtnTarget = false;
        
        if (relatedTarget) {
            // 向上遍历检查是否属于快捷输入按钮区域
            var target = relatedTarget;
            while (target && target !== document.body) {
                if (target.id === 'quickInputBtn' || 
                    target.id === 'quickInputBtn1Head' || 
                    target.id === 'quickInputBtn2' || 
                    target.id === 'quickInputBtn3' ||
                    (target.parentNode && (target.parentNode.id === 'quickInputBtn' || 
                                           target.parentNode.id === 'quickInputBtn1Head' ||
                                           target.parentNode.id === 'quickInputBtn2' ||
                                           target.parentNode.id === 'quickInputBtn3'))) {
                    isQuickInputBtnTarget = true;
                    break;
                }
                target = target.parentNode;
            }
        }
        
        // 如果不是点击快捷输入按钮，才执行清空操作
        if (!isQuickInputBtnTarget) {
            setTimeout(function() {
                var urlInput = document.getElementById('urlInput');
                if (urlInput.value !== '') {
                    urlInput.value = '';
                    if (document.getElementById('saveInputCheckbox').checked) {
                        localStorage.removeItem('savedInputText');
                    }
                }
            }, 100);
        }
    }
    if (document.getElementById('focusCheckbox').checked && document.getElementById('clearOnBlurCheckbox').checked && document.getElementById('customCheckbox').checked) {
        // 同样需要检查快捷输入按钮
        var relatedTarget = e.relatedTarget;
        var isQuickInputBtnTarget = false;
        
        if (relatedTarget) {
            var target = relatedTarget;
            while (target && target !== document.body) {
                if (target.id === 'quickInputBtn' || 
                    target.id === 'quickInputBtn1Head' || 
                    target.id === 'quickInputBtn2' || 
                    target.id === 'quickInputBtn3' ||
                    (target.parentNode && (target.parentNode.id === 'quickInputBtn' || 
                                           target.parentNode.id === 'quickInputBtn1Head' ||
                                           target.parentNode.id === 'quickInputBtn2' ||
                                           target.parentNode.id === 'quickInputBtn3'))) {
                    isQuickInputBtnTarget = true;
                    break;
                }
                target = target.parentNode;
            }
        }
        
        if (!isQuickInputBtnTarget) {
            setTimeout(function() {
                var urlInput = document.getElementById('urlInput');
                urlInput.value = 'https://';
            }, 100);
        }
    }
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
    for (var i = 0; i < customSearches.length; i++) {
    var item = customSearches[i];
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
    }
}

// 在页面加载时更新自定义搜索选项
document.addEventListener('DOMContentLoaded', function() {
    updateCustomSearchOptions();
    // 加载order0自定义搜索隐藏状态
    var isOrder0Hidden = localStorage.getItem('hideOrder0Search') === 'true';
    if (isOrder0Hidden) {
        var customSearchOption = document.getElementById('customSearchOption');
        if (customSearchOption) {
            customSearchOption.style.display = 'none';
        }
        // 如果当前选中的是自定义搜索且被隐藏，切换到百度
        var savedEngine = localStorage.getItem('selectedEngine');
        if (savedEngine === 'customSearch') {
            document.getElementById('engineSelect').value = 'baidu';
            localStorage.setItem('selectedEngine', 'baidu');
        }
    }
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
        // showCustomSearchButton();
    }
});

// 监听选择变化并保存
document.getElementById('engineSelect').addEventListener('change', function() {
    localStorage.setItem('selectedEngine', this.value);
    // 检查order0自定义搜索是否被隐藏
    var isOrder0Hidden = localStorage.getItem('hideOrder0Search') === 'true';
    if (isOrder0Hidden && this.value === 'customSearch') {
        var customSearchOption = document.getElementById('customSearchOption');
        if (customSearchOption) {
            customSearchOption.style.display = 'none';
        }
    }
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
    // 切换到 iFrameFree、iFramePlus 或 showCheckbox 时隐藏搜索建议
    if (this.value === 'iFrameFree' || this.value === 'iFramePlus' || this.value === 'showCheckbox') {
        if (document.getElementById('searchSuggestions') || document.getElementById('searchSuggestionsCheckbox').checked) {
            document.getElementById('searchSuggestions').style.display = 'none';
        }
    } else {
        // 检查输入框是否获得焦点
        var isInputFocused = (document.activeElement === document.getElementById('urlInput'));
        if (isInputFocused) {
            fetchSearchSuggestions(document.getElementById('urlInput').value);
        } else {
            var searchSuggestionsElem = document.getElementById('searchSuggestions');
            if (searchSuggestionsElem) {
                searchSuggestionsElem.style.display = 'none';
            }
        }
    }
    // ========== 切换搜索引擎后，如果输入框未聚焦，隐藏搜索建议 ==========
    var urlInputElement = document.getElementById('urlInput');
    var searchSuggestions = document.getElementById('searchSuggestions');
    if (urlInputElement && searchSuggestions) {
        var isInputFocused = (document.activeElement === urlInputElement);
        if (!isInputFocused) {
            searchSuggestions.style.display = 'none';
        }
    }
    // 控制iframe显示
    if (this.value === 'iFrameFree') {
        document.getElementById('iframeContainer').style.display = 'block';
        document.getElementById('hitokotoDisplay').style.marginTop = '40px';
        document.getElementById('iframeControls').style.display = 'block';
        document.getElementById('iframePlusSizeBtn').style.display = 'none';
        // 隐藏 iFramePlus 容器
        var plusContainer = document.getElementById('iframePlusContainer');
        if (plusContainer) plusContainer.style.display = 'none';
    // 修复 iFramePlus 选项切换时的显示/隐藏逻辑
    } else if (this.value === 'iFramePlus') {
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('iframeControls').style.display = 'none';
        var sizeBtn = document.getElementById('iframePlusSizeBtn');
        if (sizeBtn) sizeBtn.style.display = 'block';
        var refreshAllBtn = document.getElementById('refreshAllIframePlusBtn');
        if (refreshAllBtn && refreshAllBtn.parentNode) {
            refreshAllBtn.parentNode.style.display = 'block';
        }
        // 确保刷新按钮和关闭按钮容器显示
        var btnContainer = document.getElementById('iframePlusSizeBtn');
        if (btnContainer) btnContainer.style.display = 'block';
        var plusContainer = document.getElementById('iframePlusContainer');
        if (plusContainer) {
            if (window.iframePlusWindows && window.iframePlusWindows.length > 0) {
                plusContainer.style.display = 'block';
            } else {
                plusContainer.style.display = 'none';
            }
        }
    } else {
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('hitokotoDisplay').style.marginTop = '10px';
        document.getElementById('iframeControls').style.display = 'none';
        var sizeBtn = document.getElementById('iframePlusSizeBtn');
        if (sizeBtn) sizeBtn.style.display = 'none';
        var refreshAllBtn = document.getElementById('refreshAllIframePlusBtn');
        if (refreshAllBtn && refreshAllBtn.parentNode) {
            refreshAllBtn.parentNode.style.display = 'none';
        }
        // 隐藏按钮容器（包含编辑、刷新、关闭所有按钮）
        var btnContainer = document.getElementById('iframePlusSizeBtn');
        if (btnContainer) btnContainer.style.display = 'none';
        var plusContainer = document.getElementById('iframePlusContainer');
        if (plusContainer) plusContainer.style.display = 'none';
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
            this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || savedEngine === 'fastHandVideo' || savedEngine === 'hongshuVideo' || this.value === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        } else {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('urlInput').disabled = false;
        }
    }
    if (isDesktop()) {
        if (this.value === 'yzmsmM' ||
            this.value === 'qksmSearch' || this.value === 'baiduMEasy' || savedEngine === 'pddWebPage' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('urlInput').disabled = true;
        } else {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('urlInput').disabled = false;
        }
    }
    if (savedEngine === 'iFramePlus') {
        createIframePlusContainer();
        // 如果有之前保存的窗口，可以在这里恢复（可选）
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
                var savedEngine = localStorage.getItem('selectedEngine');
                if (savedEngine === 'iFramePlus') {
                    var plusContainer = document.getElementById('iframePlusContainer');
                    if (plusContainer && window.iframePlusWindows && window.iframePlusWindows.length > 0) {
                        plusContainer.style.display = 'block';
                        for (var i = 0; i < window.iframePlusWindows.length; i++) {
                            if (window.iframePlusWindows[i].wrapper) {
                                window.iframePlusWindows[i].wrapper.style.display = 'inline-block';
                            }
                        }
                    }
                    var sizeBtn = document.getElementById('iframePlusSizeBtn');
                    if (sizeBtn) sizeBtn.style.display = 'block';
                }
                if (isMobileAndroidApple()) {
                    if (this.value === 'baiduTw' ||
                        this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || savedEngine === 'fastHandVideo' || savedEngine === 'hongshuVideo' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                if (isDesktop()) {
                    if (this.value === 'yzmsmM' ||
                        this.value === 'qksmSearch' || this.value === 'baiduMEasy' || savedEngine === 'pddWebPage' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
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
              //  showCustomSearchButton();
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
                        this.value === 'quarkpcAI' || this.value === 'transmartQQTs' || this.value === 'dyIsWindows' || savedEngine === 'fastHandVideo' || savedEngine === 'hongshuVideo' || this.value === 'showCheckbox') {
                        document.getElementById('submitBtn').disabled = true;
                        document.getElementById('urlInput').disabled = true;
                    } else {
                        document.getElementById('submitBtn').disabled = false;
                        document.getElementById('urlInput').disabled = false;
                    }
                }
                if (isDesktop()) {
                    if (this.value === 'yzmsmM' ||
                        this.value === 'qksmSearch' || this.value === 'baiduMEasy' || savedEngine === 'pddWebPage' || this.value === 'quarkTranslateTools' || this.value === 'showCheckbox') {
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
            // showCustomSearchButton();
        }
    } else {
        // 保存当前选择作为previousEngine，用于customSearch取消时恢复
        localStorage.setItem('previousEngine', currentValue);
        // hideCustomSearchButton();
    }
});

// 添加刷新所有 iFramePlus 窗口功能
(function() {
    var refreshBtn = document.getElementById('refreshAllIframePlusBtn');
    if (!refreshBtn) return;
    
    function refreshAllIframePlusWindows() {
        var windows = window.iframePlusWindows || [];
        for (var i = 0; i < windows.length; i++) {
            var iframe = windows[i].iframe;
            if (iframe && iframe.src) {
                var currentSrc = iframe.src;
                iframe.src = currentSrc;
            }
        }
    }
    
    if (refreshBtn.addEventListener) {
        refreshBtn.addEventListener('click', refreshAllIframePlusWindows);
    } else if (refreshBtn.attachEvent) {
        refreshBtn.attachEvent('onclick', refreshAllIframePlusWindows);
    }
})();

// 添加关闭所有 iFramePlus 窗口功能（带二次确认，移除所有窗口元素）
(function() {
    var closeAllBtn = document.getElementById('closeAllIframePlusBtn');
    if (!closeAllBtn) return;
    
    function removeAllIframePlusWindows() {
        var windows = window.iframePlusWindows || [];
        
        for (var i = 0; i < windows.length; i++) {
            if (windows[i].iframe) {
                windows[i].iframe.src = 'about:blank';
            }
            if (windows[i].wrapper && windows[i].wrapper.parentNode) {
                windows[i].wrapper.parentNode.removeChild(windows[i].wrapper);
            }
        }
        
        window.iframePlusWindows = [];
        
        var container = document.getElementById('iframePlusContainer');
        if (container) {
            container.style.display = 'none';
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        
        var hitokoto = document.getElementById('hitokotoDisplay');
        if (hitokoto) {
            hitokoto.style.marginTop = '10px';
        }
    }
    
    function closeAllIframePlusWindowsWithConfirm() {
        var windows = window.iframePlusWindows || [];
        showCustomConfirm('确定要关闭所有iFrame窗口吗？', function(result) {
            if (result) {
                removeAllIframePlusWindows();
            }
        });
    }
    
    if (closeAllBtn.addEventListener) {
        closeAllBtn.addEventListener('click', closeAllIframePlusWindowsWithConfirm);
    } else if (closeAllBtn.attachEvent) {
        closeAllBtn.attachEvent('onclick', closeAllIframePlusWindowsWithConfirm);
    }
})();

// ========== 右键/长按操作功能（兼容所有浏览器版本）==========
(function() {
    // 弹窗是否打开的标志
    window._isModalOpen = false;
    
    // 获取操作类型
    function getRightClickAction() {
        var select = document.getElementById('rightClickActionSelect');
        if (select) {
            return select.value;
        }
        return localStorage.getItem('rightClickAction') || 'disabled';
    }
    
    // 保存操作类型
    function saveRightClickAction(value) {
        localStorage.setItem('rightClickAction', value);
        var select = document.getElementById('rightClickActionSelect');
        if (select && select.value !== value) {
            select.value = value;
        }
    }
    
    // 执行聚焦操作
    function performFocusAction() {
        // 弹窗打开时不执行聚焦
        if (window._isModalOpen) return;
        var urlInput = document.getElementById('urlInput');
        if (urlInput) {
            urlInput.focus();
            setTimeout(function() {
                try {
                    if (urlInput.setSelectionRange) {
                        urlInput.setSelectionRange(urlInput.value.length, urlInput.value.length);
                    }
                } catch(e) {}
            }, 10);
        }
    }
    
    // 监听下拉框变化
    var actionSelect = document.getElementById('rightClickActionSelect');
    if (actionSelect) {
        var savedAction = localStorage.getItem('rightClickAction');
        if (savedAction && (savedAction === 'disabled' || savedAction === 'focusInput')) {
            actionSelect.value = savedAction;
        } else {
            actionSelect.value = 'disabled';
            localStorage.setItem('rightClickAction', 'disabled');
        }
        
        if (actionSelect.addEventListener) {
            actionSelect.addEventListener('change', function() {
                saveRightClickAction(this.value);
            });
        } else if (actionSelect.attachEvent) {
            actionSelect.attachEvent('onchange', function() {
                saveRightClickAction(this.value);
            });
        }
    }
    
    // 检查目标是否为超链接元素的辅助函数
    function isAnchorElement(target) {
        if (!target) return false;
        var tagName = target.tagName ? target.tagName.toLowerCase() : '';
        // 检查当前元素是否为超链接
        if (tagName === 'a') return true;
        // 检查父元素是否为超链接（兼容点击子元素的情况）
        var parent = target.parentNode;
        while (parent && parent !== document.body) {
            if (parent.tagName && parent.tagName.toLowerCase() === 'a') {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }
    
    // 全局右键/长按处理函数
    function handleContextMenu(e) {
        // 兼容低版本浏览器获取事件对象
        e = e || window.event;
        
        // 弹窗打开时不处理
        if (window._isModalOpen) return true;
        
        var action = getRightClickAction();
        if (action !== 'focusInput') {
            return true;
        }
        
        var target = e.target || e.srcElement;
        
        // 检查目标是否为超链接，如果是则禁止自动聚焦
        if (isAnchorElement(target)) {
            return true;
        }
        
        // 检查目标是否为 hitokotoDisplay 或其子元素
        var isHitokoto = false;
        var checkElem = target;
        while (checkElem && checkElem !== document.body) {
            if (checkElem.id === 'hitokotoDisplay') {
                isHitokoto = true;
                break;
            }
            checkElem = checkElem.parentNode;
        }
        if (isHitokoto) return true;
        
        var tagName = target.tagName ? target.tagName.toLowerCase() : '';
        
        var excludeTags = ['input', 'select', 'button', 'textarea'];
        var isExcluded = false;
        for (var i = 0; i < excludeTags.length; i++) {
            if (tagName === excludeTags[i]) {
                isExcluded = true;
                break;
            }
        }
        var isSearchContainer = target.id === 'searchContainer' || 
                               (target.parentNode && target.parentNode.id === 'searchContainer');
        
        if (!isExcluded || isSearchContainer) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
            performFocusAction();
            return false;
        }
        return true;
    }
    
    // 移动端长按处理
    var isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        var touchTimer = null;
        var touchTarget = null;
        
        document.addEventListener('touchstart', function(e) {
            e = e || window.event;
            
            if (window._isModalOpen) return;
            
            var action = getRightClickAction();
            if (action !== 'focusInput') return;
            
            var urlInput = document.getElementById('urlInput');
            if (urlInput && document.activeElement === urlInput) {
                return;
            }
            
            var target = e.target || e.srcElement;
            
            // 检查目标是否为超链接，如果是则禁止长按聚焦
            if (isAnchorElement(target)) {
                return;
            }
            
            // 检查目标是否为 hitokotoDisplay 或其子元素
            var isHitokoto = false;
            var checkElem = target;
            while (checkElem && checkElem !== document.body) {
                if (checkElem.id === 'hitokotoDisplay') {
                    isHitokoto = true;
                    break;
                }
                checkElem = checkElem.parentNode;
            }
            if (isHitokoto) return;
            
            var tagName = target.tagName ? target.tagName.toLowerCase() : '';
            var excludeTags = ['input', 'select', 'button', 'textarea'];
            var isExcluded = false;
            for (var i = 0; i < excludeTags.length; i++) {
                if (tagName === excludeTags[i]) {
                    isExcluded = true;
                    break;
                }
            }
            
            if (!isExcluded) {
                touchTarget = target;
                if (touchTimer) {
                    clearTimeout(touchTimer);
                }
                touchTimer = setTimeout(function() {
                    if (touchTarget && !window._isModalOpen) {
                        // 再次检查目标是否为超链接
                        if (isAnchorElement(touchTarget)) {
                            touchTimer = null;
                            touchTarget = null;
                            return;
                        }
                        var stillNotFocused = (document.activeElement !== document.getElementById('urlInput'));
                        if (stillNotFocused) {
                            if (e.preventDefault) {
                                e.preventDefault();
                            } else {
                                e.returnValue = false;
                            }
                            performFocusAction();
                        }
                    }
                    touchTimer = null;
                    touchTarget = null;
                }, 500);
            }
        });
        
        document.addEventListener('touchend', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            touchTarget = null;
        });
        
        document.addEventListener('touchmove', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            touchTarget = null;
        });
    } else {
        if (document.addEventListener) {
            document.addEventListener('contextmenu', handleContextMenu);
        } else if (document.attachEvent) {
            document.attachEvent('oncontextmenu', handleContextMenu);
        }
    }
    
    // 重写弹窗函数，设置弹窗状态
    var originalShowCustomModal = window.showCustomModal;
    if (originalShowCustomModal) {
        window.showCustomModal = function(title, currentValue, callback) {
            window._isModalOpen = true;
            originalShowCustomModal(title, currentValue, function(value) {
                window._isModalOpen = false;
                if (callback) callback(value);
            });
        };
    }
    
    var originalShowCustomConfirm = window.showCustomConfirm;
    if (originalShowCustomConfirm) {
        window.showCustomConfirm = function(title, callback) {
            window._isModalOpen = true;
            originalShowCustomConfirm(title, function(result) {
                window._isModalOpen = false;
                if (callback) callback(result);
            });
        };
    }
    
    var originalShowCustomAlert = window.showCustomAlert;
    if (originalShowCustomAlert) {
        window.showCustomAlert = function(title, prompts) {
            window._isModalOpen = true;
            originalShowCustomAlert(title, prompts);
            var checkInterval = setInterval(function() {
                var modals = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
                if (modals.length === 0) {
                    window._isModalOpen = false;
                    clearInterval(checkInterval);
                }
            }, 200);
        };
    }
    
    var originalShowCustomCodeModal = window.showCustomCodeModal;
    if (originalShowCustomCodeModal) {
        window.showCustomCodeModal = function(title, currentCode, callback, placeholder) {
            window._isModalOpen = true;
            originalShowCustomCodeModal(title, currentCode, function(code) {
                window._isModalOpen = false;
                if (callback) callback(code);
            }, placeholder);
        };
    }
    
    var originalShowCustomDoubleInput = window.showCustomDoubleInput;
    if (originalShowCustomDoubleInput) {
        window.showCustomDoubleInput = function(title, label1, label2, currentValue1, currentValue2, callback) {
            window._isModalOpen = true;
            originalShowCustomDoubleInput(title, label1, label2, currentValue1, currentValue2, function(v1, v2) {
                window._isModalOpen = false;
                if (callback) callback(v1, v2);
            });
        };
    }
})();

// ========== 移动端左右滑动切换搜索引擎功能（兼容所有浏览器版本）==========
(function() {
    // 检测是否为移动端
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 如果不是移动端，不初始化滑动功能
    if (!isMobileDevice()) {
        var swipeCheckbox = document.getElementById('swipeSwitchCheckbox');
        if (swipeCheckbox) {
            swipeCheckbox.disabled = true;
            var swipeLabel = document.querySelector('label[for="swipeSwitchCheckbox"]');
            if (swipeLabel) {
                swipeLabel.style.opacity = '0.7';
                swipeLabel.style.cursor = 'not-allowed';
            }
        }
        return;
    }
    
    var swipeCheckbox = document.getElementById('swipeSwitchCheckbox');
    if (!swipeCheckbox) return;
    
    // 加载保存的状态
    var savedSwipeState = localStorage.getItem('swipeSwitchChecked');
    if (savedSwipeState === 'true') {
        swipeCheckbox.checked = true;
    }
    
    // 保存状态变化
    if (swipeCheckbox.addEventListener) {
        swipeCheckbox.addEventListener('change', function() {
            localStorage.setItem('swipeSwitchChecked', this.checked);
        });
    } else if (swipeCheckbox.attachEvent) {
        swipeCheckbox.attachEvent('onchange', function() {
            localStorage.setItem('swipeSwitchChecked', this.checked);
        });
    }
    
    // 检查输入框是否聚焦
    function isUrlInputFocused() {
        if (!document.getElementById('focusCheckbox').checked) return;
        var urlInput = document.getElementById('urlInput');
        if (!urlInput) return false;
        return document.activeElement === urlInput;
    }
    
    // 检查是否有模态框/弹窗处于打开状态
    function isModalOpen() {
        // 检查是否有模态框元素存在且可见
        var modals = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
        for (var i = 0; i < modals.length; i++) {
            if (modals[i].style.display !== 'none' && modals[i].parentNode) {
                return true;
            }
        }
        // 检查是否有 alert/confirm/prompt 原生弹窗（无法直接检测，通过页面滚动状态辅助判断）
        // 当原生弹窗打开时，代码执行会被阻塞，此处主要通过模态框检测
        return false;
    }
    
    // 滑动切换搜索引擎函数
    function switchToPrevEngine() {
        if (document.getElementById('hideSearchContainerCheckbox') && 
            document.getElementById('hideSearchContainerCheckbox').checked) {
            return;
        }
        var engineSelect = document.getElementById('engineSelect');
        if (!engineSelect) return;
        
        var options = engineSelect.options;
        var currentIndex = engineSelect.selectedIndex;
        var prevIndex = currentIndex - 1;
        
        while (prevIndex >= 0) {
            var opt = options[prevIndex];
            var isHidden = opt.style.display === 'none';
            var isDisabled = opt.disabled === true;
            if (!isHidden && !isDisabled) {
                engineSelect.selectedIndex = prevIndex;
                if (document.createEvent) {
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, false);
                    engineSelect.dispatchEvent(evt);
                } else if (engineSelect.fireEvent) {
                    engineSelect.fireEvent('onchange');
                }
                break;
            }
            prevIndex--;
        }
    }
    
    function switchToNextEngine() {
        if (document.getElementById('hideSearchContainerCheckbox') && 
            document.getElementById('hideSearchContainerCheckbox').checked) {
            return;
        }
        var engineSelect = document.getElementById('engineSelect');
        if (!engineSelect) return;
        
        var options = engineSelect.options;
        var currentIndex = engineSelect.selectedIndex;
        var nextIndex = currentIndex + 1;
        
        while (nextIndex < options.length) {
            var opt = options[nextIndex];
            var isHidden = opt.style.display === 'none';
            var isDisabled = opt.disabled === true;
            if (!isHidden && !isDisabled) {
                engineSelect.selectedIndex = nextIndex;
                if (document.createEvent) {
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, false);
                    engineSelect.dispatchEvent(evt);
                } else if (engineSelect.fireEvent) {
                    engineSelect.fireEvent('onchange');
                }
                break;
            }
            nextIndex++;
        }
    }
    
    // 触摸滑动变量
    var touchStartX = 0;
    var touchEndX = 0;
    var minSwipeDistance = 80;
    
    // 触摸开始
    document.addEventListener('touchstart', function(e) {
        var isEnabled = swipeCheckbox && swipeCheckbox.checked;
        if (!isEnabled) return;
        
        // 输入框聚焦时禁止滑动切换
        if (isUrlInputFocused()) {
            touchStartX = 0;
            return;
        }
        
        // 弹窗打开时禁止滑动切换
        if (isModalOpen()) {
            touchStartX = 0;
            return;
        }
        
        var target = e.target || e.srcElement;
        var tagName = target.tagName ? target.tagName.toLowerCase() : '';
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            return;
        }
        
        // 兼容低版本浏览器获取触摸点
        var touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : null);
        if (touch) {
            touchStartX = touch.clientX;
        } else {
            touchStartX = 0;
        }
    });
    
    // 触摸结束
    document.addEventListener('touchend', function(e) {
        var isEnabled = swipeCheckbox && swipeCheckbox.checked;
        if (!isEnabled) return;
        
        // 输入框聚焦时禁止滑动切换
        if (isUrlInputFocused()) {
            touchStartX = 0;
            return;
        }
        
        // 弹窗打开时禁止滑动切换
        if (isModalOpen()) {
            touchStartX = 0;
            return;
        }
        
        var target = e.target || e.srcElement;
        var tagName = target.tagName ? target.tagName.toLowerCase() : '';
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            touchStartX = 0;
            return;
        }
        
        if (touchStartX === 0) return;
        
        // 兼容低版本浏览器获取触摸点
        var changedTouch = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : null);
        if (changedTouch) {
            touchEndX = changedTouch.clientX;
        } else {
            touchEndX = 0;
        }
        
        if (touchEndX === 0) {
            touchStartX = 0;
            return;
        }
        
        var deltaX = touchEndX - touchStartX;
        
        if (deltaX > minSwipeDistance) {
            switchToPrevEngine();
        }
        else if (deltaX < -minSwipeDistance) {
            switchToNextEngine();
        }
        
        touchStartX = 0;
        touchEndX = 0;
    });
    
    // 触摸移动
    document.addEventListener('touchmove', function(e) {
        var isEnabled = swipeCheckbox && swipeCheckbox.checked;
        if (!isEnabled) return;
        
        // 输入框聚焦时禁止滑动切换
        if (isUrlInputFocused()) {
            if (touchStartX !== 0) {
                touchStartX = 0;
            }
            return;
        }
        
        // 弹窗打开时禁止滑动切换
        if (isModalOpen()) {
            if (touchStartX !== 0) {
                touchStartX = 0;
            }
            return;
        }
        
        if (touchStartX !== 0) {
            // 兼容低版本浏览器获取触摸点
            var touch = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : null);
            if (touch) {
                var currentX = touch.clientX;
                var deltaX = currentX - touchStartX;
                // 不调用preventDefault以保持页面可滚动
            }
        }
    });
})();

// 一言字体颜色控制功能（带颜色预览）
document.querySelector('label[id="hitokotoColorBtn"]').addEventListener('click', function() {
    var currentColor = localStorage.getItem('hitokotoColor') || '#000000';
    // 添加颜色预览和调色盘/图片链接
    showCustomModal('请输入一言字体颜色值（如 #000000 或 black）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newColor) {
        if (newColor === null) {
            return;
        }
        if (newColor === '') {
            // 输入为空时恢复默认颜色
            var defaultColor = '#000000';
            var hitokotoDisplay = document.getElementById('hitokotoDisplay');
            if (hitokotoDisplay) {
                hitokotoDisplay.style.color = defaultColor;
            }
            document.getElementById('hitokotoColorValue').textContent = defaultColor;
            localStorage.setItem('hitokotoColor', defaultColor);
        } else if (/^#([0-9A-F]{3,6})$/i.test(newColor) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor) || /^[a-z]+$/i.test(newColor) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor)) {
            var hitokotoDisplay = document.getElementById('hitokotoDisplay');
            if (hitokotoDisplay) {
                hitokotoDisplay.style.color = newColor;
            }
            document.getElementById('hitokotoColorValue').textContent = newColor;
            localStorage.setItem('hitokotoColor', newColor);
            truncateText('hitokotoColorValue', newColor, 80);
        }
    });
});

// 一言字体样式控制功能
var hitokotoStyleBtn = document.getElementById('hitokotoStyleBtn');
if (hitokotoStyleBtn) {
    hitokotoStyleBtn.addEventListener('click', function() {
        var currentStyle = localStorage.getItem('hitokotoFontStyle') || 'italic';
        showCustomModal('请输入一言字体样式：', currentStyle, function(newStyle) {
            if (newStyle === null) {
                return;
            }
            if (newStyle === '') {
                // 输入为空时恢复默认样式
                var defaultStyle = 'italic';
                var hitokotoDisplay = document.getElementById('hitokotoDisplay');
                if (hitokotoDisplay) {
                    hitokotoDisplay.style.fontStyle = defaultStyle;
                }
                document.getElementById('hitokotoStyleValue').textContent = defaultStyle;
                localStorage.setItem('hitokotoFontStyle', defaultStyle);
            } else if (/^(normal|italic|oblique)$/i.test(newStyle)) {
                var hitokotoDisplay = document.getElementById('hitokotoDisplay');
                if (hitokotoDisplay) {
                    hitokotoDisplay.style.fontStyle = newStyle.toLowerCase();
                }
                document.getElementById('hitokotoStyleValue').textContent = newStyle.toLowerCase();
                localStorage.setItem('hitokotoFontStyle', newStyle.toLowerCase());
                truncateText('hitokotoStyleValue', newStyle.toLowerCase(), 80);
            }
        });
    });
}

// 加载保存的一言字体样式
var savedHitokotoFontStyle = localStorage.getItem('hitokotoFontStyle');
if (savedHitokotoFontStyle) {
    var hitokotoDisplay = document.getElementById('hitokotoDisplay');
    if (hitokotoDisplay) {
        hitokotoDisplay.style.fontStyle = savedHitokotoFontStyle;
    }
    document.getElementById('hitokotoStyleValue').textContent = savedHitokotoFontStyle;
}

// 加载保存的一言字体颜色
var savedHitokotoColor = localStorage.getItem('hitokotoColor');
if (savedHitokotoColor) {
    var hitokotoDisplay = document.getElementById('hitokotoDisplay');
    if (hitokotoDisplay) {
        hitokotoDisplay.style.color = savedHitokotoColor;
    }
    document.getElementById('hitokotoColorValue').textContent = savedHitokotoColor;
}

// 一言字体大小调整功能
var hitokotoSizeLabel = document.querySelector('label[for="hitokotoSizePicker"]');
if (hitokotoSizeLabel) {
    hitokotoSizeLabel.addEventListener('click', function() {
        var currentSize = localStorage.getItem('hitokotoFontSize') || '14px';
        showCustomModal('请输入一言字体大小（如 14px，输入为空时恢复默认）：', currentSize, function(newSize) {
            if (newSize === null) return;
            var hitokotoDisplay = document.getElementById('hitokotoDisplay');
            if (newSize === '') {
                var defaultSize = '14px';
                if (hitokotoDisplay) hitokotoDisplay.style.fontSize = defaultSize;
                document.getElementById('hitokotoSizeValue').textContent = defaultSize;
                localStorage.setItem('hitokotoFontSize', defaultSize);
            } else if (/^\d+(\.\d+)?(px|in|mm|pt|em|rem|%)$/.test(newSize)) {
                if (hitokotoDisplay) hitokotoDisplay.style.fontSize = newSize;
                document.getElementById('hitokotoSizeValue').textContent = newSize;
                localStorage.setItem('hitokotoFontSize', newSize);
            }
        });
    });
}

// 加载保存的一言字体大小
var savedHitokotoFontSize = localStorage.getItem('hitokotoFontSize');
if (savedHitokotoFontSize) {
    var hitokotoDisplay = document.getElementById('hitokotoDisplay');
    if (hitokotoDisplay) hitokotoDisplay.style.fontSize = savedHitokotoFontSize;
    document.getElementById('hitokotoSizeValue').textContent = savedHitokotoFontSize;
} else {
    var hitokotoDisplay = document.getElementById('hitokotoDisplay');
    if (hitokotoDisplay) hitokotoDisplay.style.fontSize = '14px';
    document.getElementById('hitokotoSizeValue').textContent = '14px';
    localStorage.setItem('hitokotoFontSize', '14px');
}

// 保存和加载focusCheckbox状态
var savedFocusCheckboxState = localStorage.getItem('focusCheckboxChecked');
if (savedFocusCheckboxState === 'true') {
    document.getElementById('focusCheckbox').checked = true;
    document.getElementById('quickInputCheckbox').disabled = false;
    document.getElementById('clearOnBlurCheckbox').disabled = false;
    // 监听输入框聚焦时的高度变化，调整quickInputUi位置
    document.getElementById('urlInput').addEventListener('focus', function() {
        document.body.classList.add('focused');
        document.querySelector('.search-container').classList.add('focused');
        document.getElementById('quickInputBtn').style.display = 'block';
        document.getElementById('iframeContainer').style.display = 'none';
        document.getElementById('centerBoxDisplay').style.display = 'none';
        document.getElementById('searchContainer').style.marginTop = '0';
        
        // 添加classList兼容性修复函数
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        element.className += ' ' + className;
    }
}

function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

// 使用示例
addClass(document.body, 'focused');
addClass(document.querySelector('.search-container'), 'focused');
        
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
    document.getElementById('clearOnBlurCheckbox').disabled = !this.checked;
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
    showCustomModal('请输入快捷链接颜色值（如 #0000ee 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a>。或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){input.value=\'image url\';var labels=document.querySelectorAll(\'label[onclick*=\\\'modalCallback_\\\']\');if(labels.length>0){labels[labels.length-1].click();}}}return false;">图片</a> <span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-left: 5px;margin-bottom: 1px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentLinkValue, function(newValue) {
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
    var currentName = linkElement.innerHTML;
    showCustomModal('请输入链接名称：', currentName, function(newName) {
        if (newName === null) {
            return;
        }
        if (newName === '') {
            // 输入为空时恢复默认名称
            var defaultName = 'Baidu.com';
            linkElement.innerHTML = defaultName;
            document.getElementById('linkNameValue').innerHTML = defaultName;
            localStorage.setItem('linkName', defaultName);
        } else if (newName.trim() !== '') {
            linkElement.innerHTML = newName;
            document.getElementById('linkNameValue').innerHTML = newName;
            localStorage.setItem('linkName', newName);
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
    linkElement.innerHTML = savedLinkName;
    document.getElementById('linkNameValue').innerHTML = savedLinkName;
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
    var currentName = document.getElementById('submitBtn').innerHTML;
    showCustomModal('请输入搜索按钮名称（输入为空时恢复默认）：', currentName, function(newName) {
        // 当点击取消时，newName 为 null，不执行任何操作
        if (newName === null) {
            return;
        }
        if (newName === '') {
            // 输入为空时恢复默认名称
            var defaultName = '跳转';
            document.getElementById('submitBtn').innerHTML = defaultName;
            document.getElementById('submitBtnNameValue').innerHTML = defaultName;
            localStorage.setItem('submitBtnName', defaultName);
        } else {
            document.getElementById('submitBtn').innerHTML = newName;
            document.getElementById('submitBtnNameValue').innerHTML = newName;
            localStorage.setItem('submitBtnName', newName);
        }
    });
});

// 加载保存的submitBtn名称
var savedSubmitBtnName = localStorage.getItem('submitBtnName');
if (savedSubmitBtnName) {
    document.getElementById('submitBtn').innerHTML = savedSubmitBtnName;
    document.getElementById('submitBtnNameValue').innerHTML = savedSubmitBtnName;
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
        showCustomConfirm('警告：启用此功能后，保存的JavaScript脚本将在每次页面加载时自动运行，在启用此功能后请勿运行危险代码！', function(result) {
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
    
    // 兼容低版本浏览器的定时器轮询检测弹窗大小变化并重新居中
    var modalContent = modal.firstChild;
    if (modalContent) {
        var lastWidth = 0;
        var lastHeight = 0;
        var checkInterval = setInterval(function() {
            if (modalContent && modal.parentNode) {
                var currentWidth = modalContent.offsetWidth;
                var currentHeight = modalContent.offsetHeight;
                if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
                    lastWidth = currentWidth;
                    lastHeight = currentHeight;
                    centerModalElement(modal);
                }
            } else {
                clearInterval(checkInterval);
            }
        }, 100);
        
        // 保存interval以便清理
        modal._checkInterval = checkInterval;
    }
    
    // 在移除modal时清理事件监听
    var originalCallback = window[callbackName];
    window[callbackName] = function(code) {
        if (modal._checkInterval) {
            clearInterval(modal._checkInterval);
        }
        originalCallback(code);
    };
    
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
        '<p style="user-select: none; margin-bottom: 0px; margin-left: 5px; font-size: 15px; margin-top: -2px;">' + (prompts || '') + '</p>',
        '</div>',
        '<div style="text-align: right; margin-top: 15px;">',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="window.' + callbackName + '()">' + (isDesktop() ? '关闭(Esc)' : '确定') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 添加键盘事件处理函数（支持所有浏览器版本的Esc键关闭）
    modal._keyHandler = function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        // 按Esc键关闭提示（keyCode 27）
        if (keyCode === 27) {
            window[callbackName]();
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        }
    };
    
    // 兼容所有浏览器版本的事件监听
    if (document.addEventListener) {
        document.addEventListener('keydown', modal._keyHandler);
    } else if (document.attachEvent) {
        document.attachEvent('onkeydown', modal._keyHandler);
    }
    
    document.body.appendChild(modal);
    
    // 兼容低版本浏览器的定时器轮询检测弹窗大小变化并重新居中
    var modalContent = modal.firstChild;
    if (modalContent) {
        var lastWidth = 0;
        var lastHeight = 0;
        var checkInterval = setInterval(function() {
            if (modalContent && modal.parentNode) {
                var currentWidth = modalContent.offsetWidth;
                var currentHeight = modalContent.offsetHeight;
                if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
                    lastWidth = currentWidth;
                    lastHeight = currentHeight;
                    centerModalElement(modal);
                }
            } else {
                clearInterval(checkInterval);
            }
        }, 100);
        
        // 保存interval以便清理
        modal._checkInterval = checkInterval;
    }
    
    // 在移除modal时清理事件监听
    var originalCallback = window[callbackName];
    window[callbackName] = function() {
        if (modal._checkInterval) {
            clearInterval(modal._checkInterval);
        }
        document.removeEventListener('keydown', modal._keyHandler);
        // 移除键盘事件监听（兼容所有浏览器版本）
        if (document.removeEventListener) {
            document.removeEventListener('keydown', modal._keyHandler);
        } else if (document.detachEvent) {
            document.detachEvent('onkeydown', modal._keyHandler);
        }
        originalCallback();
    };
    
    // 兼容低版本浏览器的内容变化监听并重新居中
    var modalContent = modal.firstChild;
    if (modalContent) {
        // 保存原始innerHTML方法
        var originalSetInnerHTML = modalContent.innerHTML;
        Object.defineProperty(modalContent, 'innerHTML', {
            get: function() {
                return originalSetInnerHTML;
            },
            set: function(value) {
                originalSetInnerHTML = value;
                var div = document.createElement('div');
                div.innerHTML = value;
                while (modalContent.firstChild) {
                    modalContent.removeChild(modalContent.firstChild);
                }
                while (div.firstChild) {
                    modalContent.appendChild(div.firstChild);
                }
                setTimeout(function() {
                    centerModalElement(modal);
                }, 0);
            },
            configurable: true
        });
        
        // 兼容低版本浏览器的DOMNodeInserted事件
        if (modalContent.addEventListener) {
            modalContent.addEventListener('DOMNodeInserted', function() {
                setTimeout(function() {
                    centerModalElement(modal);
                }, 0);
            }, false);
            modalContent.addEventListener('DOMNodeRemoved', function() {
                setTimeout(function() {
                    centerModalElement(modal);
                }, 0);
            }, false);
        } else if (modalContent.attachEvent) {
            modalContent.attachEvent('onpropertychange', function() {
                if (event.propertyName === 'innerHTML') {
                    setTimeout(function() {
                        centerModalElement(modal);
                    }, 0);
                }
            });
        }
    }
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
var historyLinksSizeLabel = document.querySelector('label[for="historyLinksSizePicker"]');
if (savedSearchHistoryState === 'true') {
    document.getElementById('searchHistoryCheckbox').checked = true;
    document.getElementById('searchHistory').style.display = 'block';
    updateSearchHistory();
    if (historyLinksSizeLabel) {
        historyLinksSizeLabel.style.opacity = '1';
        historyLinksSizeLabel.style.cursor = 'pointer';
        historyLinksSizeLabel.style.pointerEvents = 'auto';
    }
} else {
    if (historyLinksSizeLabel) {
        historyLinksSizeLabel.style.opacity = '0.7';
        historyLinksSizeLabel.style.cursor = 'not-allowed';
        historyLinksSizeLabel.style.pointerEvents = 'none';
    }
}

// 修改位置：找到 searchHistoryCheckbox 的 change 事件监听器，修改用户取消时的处理

document.getElementById('searchHistoryCheckbox').addEventListener('change', function() {
    var historyLinksSizeLabel = document.querySelector('label[for="historyLinksSizePicker"]');
    var historyLinksColorLabel = document.querySelector('label[for="historyLinksColorPicker"]');
    var historyInSuggestCheckbox = document.getElementById('searchHistoryInSuggestCheckbox');
    
    if (this.checked) {
        localStorage.setItem('searchHistoryChecked', this.checked);
        document.getElementById('searchHistory').style.display = 'block';
        updateSearchHistory();
        if (historyLinksSizeLabel) {
            historyLinksSizeLabel.style.opacity = '1';
            historyLinksSizeLabel.style.cursor = 'pointer';
            historyLinksSizeLabel.style.pointerEvents = 'auto';
        }
        if (historyLinksColorLabel) {
            historyLinksColorLabel.style.opacity = '1';
            historyLinksColorLabel.style.cursor = 'pointer';
            historyLinksColorLabel.style.pointerEvents = 'auto';
        }
        updateHistoryInSuggestDisabled();
    } else {
        var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (history.length > 0) {
            showCustomConfirm('确定要清除搜索历史记录并关闭此功能吗？', function(result) {
                if (result) {
                    localStorage.removeItem('searchHistory');
                    document.getElementById('searchHistory').style.display = 'none';
                    document.getElementById('clearHistoryBtn').style.display = 'none';
                    localStorage.setItem('searchHistoryChecked', false);
                    updateHistoryInSuggestDisabled();
                    if (historyInSuggestCheckbox && historyInSuggestCheckbox.checked) {
                        historyInSuggestCheckbox.checked = false;
                        localStorage.setItem('searchHistoryInSuggestChecked', 'false');
                        var searchHistoryDiv = document.getElementById('searchHistory');
                        var clearHistoryBtn = document.getElementById('clearHistoryBtn');
                        if (searchHistoryDiv) {
                            searchHistoryDiv.style.display = 'none';
                        }
                        if (clearHistoryBtn) {
                            clearHistoryBtn.style.display = 'none';
                        }
                    }
                } else {
                    // === 修复：用户点击取消时，恢复复选框为勾选状态 ===
                    document.getElementById('searchHistoryCheckbox').checked = true;
                    localStorage.setItem('searchHistoryChecked', 'true');
                    // 恢复历史记录显示
                    document.getElementById('searchHistory').style.display = 'block';
                    updateSearchHistory();
                    if (historyLinksSizeLabel) {
                        historyLinksSizeLabel.style.opacity = '1';
                        historyLinksSizeLabel.style.cursor = 'pointer';
                        historyLinksSizeLabel.style.pointerEvents = 'auto';
                    }
                    if (historyLinksColorLabel) {
                        historyLinksColorLabel.style.opacity = '1';
                        historyLinksColorLabel.style.cursor = 'pointer';
                        historyLinksColorLabel.style.pointerEvents = 'auto';
                    }
                    // === 恢复 searchHistoryInSuggestCheckbox 的禁用状态 ===
                    // 检查 suggestionsChecked 状态，重新启用或禁用 historyInSuggestCheckbox
                    var suggestionsChecked = document.getElementById('searchSuggestionsCheckbox').checked;
                    if (historyInSuggestCheckbox) {
                        if (suggestionsChecked) {
                            historyInSuggestCheckbox.disabled = false;
                        } else {
                            historyInSuggestCheckbox.disabled = true;
                        }
                    }
                    // 更新所有相关禁用状态
                    updateHistoryInSuggestDisabled();
                    // === 修复代码结束 ===
                }
            });
        } else {
            // 没有搜索记录时直接取消选择
            localStorage.setItem('searchHistoryChecked', this.checked);
            document.getElementById('searchHistory').style.display = 'none';
            document.getElementById('clearHistoryBtn').style.display = 'none';
            updateHistoryInSuggestDisabled();
            if (historyInSuggestCheckbox && historyInSuggestCheckbox.checked) {
                historyInSuggestCheckbox.checked = false;
                localStorage.setItem('searchHistoryInSuggestChecked', 'false');
            }
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

// 历史记录链接字体大小调整功能
var historyLinksSizeLabel = document.querySelector('label[for="historyLinksSizePicker"]');
if (historyLinksSizeLabel) {
    historyLinksSizeLabel.addEventListener('click', function() {
        var currentSize = localStorage.getItem('historyLinksFontSize') || 'Default';
        showCustomModal('请输入历史记录链接字体大小（如 14px，输入为空时恢复默认）：',
            currentSize === 'Default' ? '' : currentSize,
            function(newSize) {
                if (newSize === '') {
                    localStorage.removeItem('historyLinksFontSize');
                    document.getElementById('historyLinksSizeValue').textContent = 'Default';
                    applyHistoryLinksFontSize();
                } else if (/^\d+(\.\d+)?(px|in|mm|pt|em|rem)$/.test(newSize)) {
                    localStorage.setItem('historyLinksFontSize', newSize);
                    document.getElementById('historyLinksSizeValue').textContent = newSize;
                    applyHistoryLinksFontSize();
                }
            });
    });
}

// 应用历史记录链接字体大小
function applyHistoryLinksFontSize() {
    var savedSize = localStorage.getItem('historyLinksFontSize');
    var historyLinks = document.querySelectorAll('#searchHistory a');
    for (var i = 0; i < historyLinks.length; i++) {
        if (savedSize) {
            historyLinks[i].style.fontSize = savedSize;
        } else {
            historyLinks[i].style.fontSize = '';
        }
    }
}

// 加载保存的历史记录字体大小设置
var savedHistoryLinksFontSize = localStorage.getItem('historyLinksFontSize');
if (savedHistoryLinksFontSize) {
    document.getElementById('historyLinksSizeValue').textContent = savedHistoryLinksFontSize;
    setTimeout(applyHistoryLinksFontSize, 100);
}

// 监听搜索历史更新，重新应用字体大小
var originalUpdateSearchHistory = window.updateSearchHistory;
if (originalUpdateSearchHistory) {
    window.updateSearchHistory = function() {
        originalUpdateSearchHistory();
        setTimeout(applyHistoryLinksFontSize, 50);
    };
}

// 修改位置：在 updateSearchHistory 函数中，找到创建 linkElement 的代码

function updateSearchHistory() {
    // 添加IE兼容性检测
    var isIE = false;
    try {
        isIE = /*@cc_on!@*/false || !!document.documentMode;
    } catch(e) { isIE = false; }
    
    // 如果启用了历史记录在建议中显示，则不显示超链接历史记录
    var showHistoryInSuggest = localStorage.getItem('searchHistoryInSuggestChecked') === 'true';
    if (showHistoryInSuggest) {
        var searchHistoryDiv = document.getElementById('searchHistory');
        if (searchHistoryDiv) {
            searchHistoryDiv.innerHTML = '';
            searchHistoryDiv.style.display = 'none';
            document.getElementById('clearHistoryBtn').style.display = 'none';
        }
        return;
    }
    // 如果启用了历史记录在建议中显示，则不显示超链接历史记录
    var showHistoryInSuggest = localStorage.getItem('searchHistoryInSuggestChecked') === 'true';
    if (showHistoryInSuggest) {
        var searchHistoryDiv = document.getElementById('searchHistory');
        if (searchHistoryDiv) {
            searchHistoryDiv.innerHTML = '';
            searchHistoryDiv.style.display = 'none';
            document.getElementById('clearHistoryBtn').style.display = 'none';
        }
        return;
    }
    
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
    
    // === 获取保存的历史记录链接颜色 ===
    var savedHistoryLinkColor = localStorage.getItem('historyLinksColor');
    var defaultHistoryColor = savedHistoryLinkColor ? savedHistoryLinkColor : '#0000ee';
    
    history.forEach(function(item, index) {
        var linkElement = document.createElement('a');
        linkElement.href = 'javascript:void(0)';
        
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
        linkElement.title = item.text;
        
        // === 设置历史记录链接颜色 ===
        linkElement.style.color = defaultHistoryColor;
        
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
    
    // === 添加 active 状态样式（红色）===
    var styleId = 'historyLinksActiveStyle';
    var existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
        var styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = '#searchHistory a:active { color: #ff0000 !important; }';
        document.head.appendChild(styleElement);
    }
}

// 保存和加载一言显示checkbox状态
var savedHitokotoState = localStorage.getItem('hitokotoChecked');
if (savedHitokotoState === 'true') {
    document.getElementById('hitokotoCheckbox').checked = true;
    document.getElementById('hitokotoDisplay').style.display = 'block';
    fetchHitokoto();
}

// 添加页面右键/长按恢复搜索框功能
document.addEventListener('contextmenu', function(e) {
    if (document.getElementById('hideSearchContainerCheckbox').checked) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        
        var confirmResult = confirm('是否恢复搜索框？');
        if (confirmResult) {
            document.getElementById('hideSearchContainerCheckbox').checked = false;
            localStorage.setItem('hideSearchContainerChecked', 'false');
            document.getElementById('searchContainer').style.display = 'flex';
            document.getElementById('showLinkCheckbox').checked = true;
            localStorage.setItem('showLinkChecked', 'true');
            location.reload();
        }
        return false;
    } else {
        var target = e.target || e.srcElement;
        var tagName = target.tagName.toLowerCase();
        if (tagName === 'head' || tagName === 'p' || tagName === 'span' || tagName === 'label' || tagName === 'div' || tagName === 'select' || tagName === 'button' || tagName === 'body' || tagName === 'html' || target.id === 'quickLinks' || target.id === 'autoFillhttps' || target.className === 'search-container') {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        }
    }
});

// 添加一言复制功能（支持电脑右键和手机长按）
document.getElementById('hitokotoDisplay').addEventListener('contextmenu', function(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    
    var hitokotoText = this.getAttribute('data-hitokoto') || this.textContent;
    if (hitokotoText && hitokotoText !== 'Network Error') {
        var confirmResult = confirm('是否复制此一言？');
        if (confirmResult) {
            var textArea = document.createElement('textarea');
            textArea.value = hitokotoText;
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    alert('复制成功');
                } else {
                    prompt('Copy Text', hitokotoText);
                }
            } catch (err) {
                prompt('Copy Text', hitokotoText);
            }
            document.body.removeChild(textArea);
        }
    }
    return false;
});

// 监听一言显示checkbox变化
document.getElementById('hitokotoCheckbox').addEventListener('change', function() {
    var hitokotoSizeLabel = document.querySelector('label[for="hitokotoSizePicker"]');
    if (this.checked) {
        showCustomConfirm('启用后，会加载一个额外接口，在下方显示随机生成一条一言，生成的一言内容与本网站无关', function(result) {
            if (result) {
                localStorage.setItem('hitokotoChecked', 'true');
                document.getElementById('hitokotoDisplay').style.display = 'block';
                fetchHitokoto();
                // 启用一言相关按钮
                var hitokotoColorBtn = document.getElementById('hitokotoColorBtn');
                var hitokotoStyleBtn = document.getElementById('hitokotoStyleBtn');
                if (hitokotoColorBtn) {
                    hitokotoColorBtn.style.opacity = '1';
                    hitokotoColorBtn.style.cursor = 'pointer';
                    hitokotoColorBtn.style.pointerEvents = 'auto';
                }
                if (hitokotoStyleBtn) {
                    hitokotoStyleBtn.style.opacity = '1';
                    hitokotoStyleBtn.style.cursor = 'pointer';
                    hitokotoStyleBtn.style.pointerEvents = 'auto';
                }
                if (hitokotoSizeLabel) {
                    hitokotoSizeLabel.style.opacity = '1';
                    hitokotoSizeLabel.style.cursor = 'pointer';
                    hitokotoSizeLabel.style.pointerEvents = 'auto';
                }
            } else {
                document.getElementById('hitokotoCheckbox').checked = false;
            }
        });
    } else {
        localStorage.setItem('hitokotoChecked', 'false');
        document.getElementById('hitokotoDisplay').style.display = 'none';
        // 禁用一言相关按钮
        var hitokotoColorBtn = document.getElementById('hitokotoColorBtn');
        var hitokotoStyleBtn = document.getElementById('hitokotoStyleBtn');
        if (hitokotoColorBtn) {
            hitokotoColorBtn.style.opacity = '0.7';
            hitokotoColorBtn.style.cursor = 'not-allowed';
            hitokotoColorBtn.style.pointerEvents = 'none';
        }
        if (hitokotoStyleBtn) {
            hitokotoStyleBtn.style.opacity = '0.7';
            hitokotoStyleBtn.style.cursor = 'not-allowed';
            hitokotoStyleBtn.style.pointerEvents = 'none';
        }
        if (hitokotoSizeLabel) {
            hitokotoSizeLabel.style.opacity = '0.7';
            hitokotoSizeLabel.style.cursor = 'not-allowed';
            hitokotoSizeLabel.style.pointerEvents = 'none';
        }
    }
});

// 获取一言数据
function fetchHitokoto() {
    var hitokotoDisplay = document.getElementById('hitokotoDisplay');
    if (!hitokotoDisplay) return;
    
    var xhr = null;
    try {
        xhr = new XMLHttpRequest();
    } catch(e) {
        hitokotoDisplay.textContent = 'Network Error';
        return;
    }
    
    xhr.open('GET', 'https://v1.hitokoto.cn/', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var hitokotoText = '「' + data.hitokoto + '」—— ' + data.from;
                    hitokotoDisplay.textContent = hitokotoText;
                    hitokotoDisplay.setAttribute('data-hitokoto', hitokotoText);
                } catch (e) {
                    hitokotoDisplay.textContent = 'Network Error';
                }
            } else {
                hitokotoDisplay.textContent = 'Network Error';
            }
        }
    };
    xhr.onerror = function() {
        hitokotoDisplay.textContent = 'Network Error';
    };
    xhr.ontimeout = function() {
        hitokotoDisplay.textContent = 'Network Error';
    };
    try {
        xhr.send();
    } catch(e) {
        hitokotoDisplay.textContent = 'Network Error';
    }
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
    var optionsToHide = ['yahooSearch', 'braveSearch',
        'sodouyinM', 'yzmsmM', 'sotoutiaoM', 'qksmSearch', 'baiduMEasy',
        'metasosuoAI', 'baiduAI', '360namisoAI', 'zhihuZhiDaAI', 'quarkpcAI',
        'googleTranslate', 'mcTranslator', 'yandexTranslate', 'sogouFanyi', 'oldBaiduFanyi', 'quarkTranslateTools', 'fanyiSo', 'transmartQQTs',
        'taobaoWeb', 'jdWebPage', 'pddWebPage',
        'biliTv', 'dyIsWindows', 'haokanVideo', 'fastHandVideo', 'hongshuVideo', 'soHuVideo', 'tencentTv', 'enUsYoutubeVideo',
        'githubCode', 'giteeCode', 'zhihuFriends', 'csdnWebPage', 'weiboFriends', 'bdZhidao',
        'kfBaidu', 'weixinSogou', 'baiduTw', 'iFrameFree', 'iFramePlus', 'httpsAutoFill'];
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
        if (engineSelect.options[i].value === 'transmartQQTs' || engineSelect.options[i].value === 'fastHandVideo' || engineSelect.options[i].value === 'hongshuVideo') {
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
        // 添加classList兼容性修复函数
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        element.className += ' ' + className;
    }
}

function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

// 使用示例
addClass(document.body, 'focused');
addClass(document.querySelector('.search-container'), 'focused');
        var engineSelect = document.getElementById('engineSelect');
        if (engineSelect && engineSelect.value === 'iFramePlus') {
            var iframePlusSizeBtn = document.getElementById('iframePlusSizeBtn');
            if (iframePlusSizeBtn) iframePlusSizeBtn.style.display = 'none';
            var iframePlusContainer = document.getElementById('iframePlusContainer');
            if (iframePlusContainer) iframePlusContainer.style.display = 'none';
        }
    });
    
    // 添加延迟恢复
    document.getElementById('urlInput').addEventListener('blur', function(e) {
        var relatedTarget = e.relatedTarget;
        var isQuickInputBtnTarget = relatedTarget &&
            (relatedTarget.parentNode &&
                (relatedTarget.parentNode.id === 'quickInputBtn' ||
                    relatedTarget.parentNode.id === 'quickInputBtn1Head' ||
                    relatedTarget.parentNode.id === 'quickInputBtn2' ||
                    relatedTarget.parentNode.id === 'quickInputBtn3' ||
                    relatedTarget.parentNode.id === 'quickInputBtn4'));
        
        if (!isQuickInputBtnTarget) {
            setTimeout(function() {
                document.body.classList.remove('focused');
                document.querySelector('.search-container').classList.remove('focused');
                document.getElementById('quickInputBtn').style.display = 'none';
                document.getElementById('hitokotoDisplay').style.display = 'block';
                document.getElementById('searchContainer').style.marginTop = savedSearchContainerMargin;
                
                if (document.getElementById('engineSelect').value === 'iFrameFree') {
                    document.getElementById('iframeContainer').style.display = 'block';
                }
                
                // 恢复 iFramePlus 相关元素的显示
                var engineSelect = document.getElementById('engineSelect');
                if (engineSelect && engineSelect.value === 'iFramePlus') {
                    var iframePlusSizeBtn = document.getElementById('iframePlusSizeBtn');
                    if (iframePlusSizeBtn) iframePlusSizeBtn.style.display = 'block';
                    var iframePlusContainer = document.getElementById('iframePlusContainer');
                    if (iframePlusContainer && window.iframePlusWindows && window.iframePlusWindows.length > 0) {
                        iframePlusContainer.style.display = 'block';
                    }
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
            // 使用保存的高度值而不是固定值
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
// 【修复】兼容 IE 等旧浏览器中 dataset 属性可能为 undefined 的问题
var urlInputFocusElement = document.getElementById('urlInput');
if (urlInputFocusElement) {
    urlInputFocusElement.addEventListener('focus', function() {
        // 检查是否启用了自动选择https文本功能
        var isSelectHttpsTextChecked = localStorage.getItem('selectHttpsTextChecked') === 'true';
        var isAutoFillHttpsChecked = localStorage.getItem('autoFillHttpsChecked') === 'true';
        
        // 兼容性获取 dataset.userInput 的值
        var userInputFlag = '';
        if (this.dataset) {
            userInputFlag = this.dataset.userInput;
        } else {
            userInputFlag = this.getAttribute('data-user-input') || '';
        }
        
        // 只有当所有条件满足且用户没有手动输入时才自动选择
        if (isSelectHttpsTextChecked && isAutoFillHttpsChecked &&
            this.value === 'https://' && !userInputFlag) {
            this.select(); // 自动选择所有文本
        }
    });
}

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
// 【修复】兼容 IE 等旧浏览器中 dataset 属性可能为 undefined 的问题
var manualHttpsInput = document.getElementById('urlInput');
if (manualHttpsInput) {
    manualHttpsInput.addEventListener('keydown', function(e) {
        e = e || window.event;
        var key = e.key;
        // 兼容 IE 等旧浏览器中 e.key 可能为 undefined 的情况
        if (!key) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 8) key = 'Backspace';
            else if (keyCode === 46) key = 'Delete';
            else if (keyCode >= 32 && keyCode <= 126) key = String.fromCharCode(keyCode);
        }
        if (key && (key.length === 1 || key === 'Backspace' || key === 'Delete')) {
            // 兼容性处理：检查 dataset 是否存在
            if (this.dataset) {
                this.dataset.manualHttps = 'true';
            } else {
                this.setAttribute('data-manual-https', 'true');
            }
        }
    });
}

// 监听urlInput的focus事件，重置manualHttps标记
// 【修复】兼容 IE 等旧浏览器中 dataset 属性可能为 undefined 的问题
var urlInputElement = document.getElementById('urlInput');
if (urlInputElement) {
    urlInputElement.addEventListener('focus', function() {
        // 兼容性处理：检查 dataset 是否存在，不存在则手动创建
        if (this.dataset) {
            this.dataset.manualHttps = '';
        } else {
            // 对于不支持 dataset 的浏览器（如 IE10 以下），使用 setAttribute
            this.setAttribute('data-manual-https', '');
        }
    });
}

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
                if (existingStyle && existingStyle.parentNode) {
    existingStyle.parentNode.removeChild(existingStyle);
}
            }
            localStorage.removeItem('customCss');
        } else {
            // 移除现有自定义样式
            var existingStyle = document.getElementById('customCssStyle');
            if (existingStyle) {
                if (existingStyle && existingStyle.parentNode) {
    existingStyle.parentNode.removeChild(existingStyle);
}
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
// 【修复】兼容 IE 等旧浏览器中 dataset 属性可能为 undefined 的问题
var inputEventElement = document.getElementById('urlInput');
if (inputEventElement) {
    inputEventElement.addEventListener('input', function() {
        // 兼容性获取 manualHttps 标记
        var manualHttpsFlag = '';
        if (this.dataset) {
            manualHttpsFlag = this.dataset.manualHttps;
        } else {
            manualHttpsFlag = this.getAttribute('data-manual-https') || '';
        }
        
        // 记录用户已经开始输入，禁用自动选择
        if (this.value !== 'https://') {
            if (this.dataset) {
                this.dataset.userInput = 'true';
            } else {
                this.setAttribute('data-user-input', 'true');
            }
        } else {
            // 当值恢复为https://时，重置用户输入状态（除非是手动输入的）
            if (!manualHttpsFlag) {
                if (this.dataset) {
                    this.dataset.userInput = '';
                } else {
                    this.setAttribute('data-user-input', '');
                }
            }
        }
        
        if (document.getElementById('saveInputCheckbox') && document.getElementById('saveInputCheckbox').checked) {
            localStorage.setItem('savedInputText', this.value);
        }
    });
}

var savedEngine = localStorage.getItem('selectedEngine');
// ========== 【修复】localStorage安全访问辅助函数 ==========
function safeLocalStorageGet(key, defaultValue) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
            var value = localStorage.getItem(key);
            return value !== null && value !== undefined ? value : defaultValue;
        }
    } catch(e) {}
    return defaultValue;
}

function safeLocalStorageSet(key, value) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
            localStorage.setItem(key, value);
            return true;
        }
    } catch(e) {}
    return false;
}

function safeLocalStorageRemove(key) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.removeItem === 'function') {
            localStorage.removeItem(key);
            return true;
        }
    } catch(e) {}
    return false;
}
// ========== localStorage安全访问辅助函数结束 ==========

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
        
        // 禁用相关控件
        document.getElementById('showSecondsCheckbox').disabled = true;
        document.getElementById('colonBlinkCheckbox').disabled = true;
        document.getElementById('timeFormatSelect').disabled = true;
    } else if (this.checked && showTimeChecked) {
        // 重新显示链接且时间链接已勾选时，显示时间
        timeLinkElement.style.display = 'inline-block';
        showTimeLink();
        
        // 启用相关控件
        document.getElementById('showSecondsCheckbox').disabled = false;
        document.getElementById('colonBlinkCheckbox').disabled = false;
        document.getElementById('timeFormatSelect').disabled = false;
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

// 加载保存的隐藏搜索框状态
var savedHideSearchContainerState = localStorage.getItem('hideSearchContainerChecked');
if (savedHideSearchContainerState === 'true') {
    document.getElementById('hideSearchContainerCheckbox').checked = true;
    document.getElementById('searchContainer').style.display = 'none';
    document.title = '导航页';
} else {
    document.getElementById('hideSearchContainerCheckbox').checked = false;
    document.getElementById('searchContainer').style.display = 'flex';
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

// 监听hideSearchContainerCheckbox变化
document.getElementById('hideSearchContainerCheckbox').addEventListener('change', function() {
    if (this.checked) {
        var confirmResult = confirm('提示：你确定要停用搜索框吗？停用后，你仍然可以鼠标右键启用搜索框');
            if (confirmResult) {
                localStorage.setItem('hideSearchContainerChecked', 'true');
                document.getElementById('searchContainer').style.display = 'none';
                document.getElementById('engineSelect').value = 'baidu';
                localStorage.setItem('selectedEngine', 'baidu');
                // 取消勾选showLinkCheckbox
                document.getElementById('showLinkCheckbox').checked = false;
                localStorage.setItem('showLinkChecked', 'false');
                toggleLinkDisplay(false);
                // 取消勾选hitokotoCheckbox
                document.getElementById('hitokotoCheckbox').checked = false;
                localStorage.setItem('hitokotoChecked', 'false');
                document.getElementById('hitokotoDisplay').style.display = 'none';
                // 取消勾选autoFocusCheckbox
                var autoFocusCheckbox = document.getElementById('autoFocusCheckbox');
                if (autoFocusCheckbox) {
                    autoFocusCheckbox.checked = false;
                    localStorage.setItem('autoFocusChecked', 'false');
                }
                // 清空搜索历史记录
                localStorage.removeItem('searchHistory');
                document.getElementById('searchHistory').innerHTML = '';
                document.getElementById('searchHistory').style.display = 'none';
                document.getElementById('clearHistoryBtn').style.display = 'none';
                
                location.reload();
            } else {
                document.getElementById('hideSearchContainerCheckbox').checked = false;
            }
        
    } else {
        localStorage.setItem('hideSearchContainerChecked', 'false');
        document.getElementById('searchContainer').style.display = 'flex';
    }
});

// 加载保存的背景图片（优先检查图片）
var savedBackgroundImage = localStorage.getItem('backgroundImage');
if (savedBackgroundImage) {
    setTimeout(function() {
        document.body.style.backgroundColor = '';
        document.body.style.backgroundImage = 'url("' + savedBackgroundImage + '")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
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
                document.body.style.backgroundPosition = 'center';
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
    showCustomModal('请输入颜色值（如 #ffffff 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a>。或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){input.value=\'image url\';var labels=document.querySelectorAll(\'label[onclick*=\\\'modalCallback_\\\']\');if(labels.length>0){labels[labels.length-1].click();}}}return false;">图片</a> <span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-left: 5px;margin-bottom: 1px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentBgValue, function(newValue) {
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
                    document.body.style.backgroundPosition = 'center';
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
    showCustomModal('请输入字体颜色值（如 #000000 或 black）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newColor) {
        if (newColor === null) {
            return;
        }
        if (newColor === '') {
            // 输入为空时恢复默认颜色
            var defaultColor = '#000000';
            document.getElementById('autoFillhttps').style.color = defaultColor;
            document.getElementById('iframeContainer').style.color = defaultColor;
            document.getElementById('iframePlusSizeBtn').style.color = defaultColor;
            document.getElementById('clearHistoryBtn').style.color = defaultColor;
            document.getElementById('fontColorValue').textContent = defaultColor;
            localStorage.setItem('fontColor', defaultColor);
        } else if (/^#([0-9A-F]{3,6})$/i.test(newColor) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor) || /^[a-z]+$/i.test(newColor) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newColor)) {
            document.getElementById('autoFillhttps').style.color = newColor;
            document.getElementById('iframeContainer').style.color = newColor;
            document.getElementById('iframePlusSizeBtn').style.color = newColor;
            document.getElementById('clearHistoryBtn').style.color = newColor;
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
    document.getElementById('iframePlusSizeBtn').style.color = savedFontColor;
    document.getElementById('clearHistoryBtn').style.color = savedFontColor;
    document.getElementById('fontColorValue').textContent = savedFontColor;
}

// 超链接快捷跳转功能
document.querySelector('label[for="linkCreatorBtn0"]').addEventListener('click', function() {
    showCustomDoubleInput(
        '创建快捷链接',
        '输入链接显示文本',
        '输入URL地址（必须以 https://、http:// 开头）',
        '百度',
        'https://baidu.com',
        function(text, url) {
            if (text && url) {
                // 验证格式
                if (url.indexOf('https://') !== 0 && url.indexOf('http://') !== 0 && url.indexOf('#') !== 0) {
                    return;
                }
                
                // 保存链接（支持HTML内容）
                var links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                links.push({ url: url, text: text, isHtml: true });
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
                { url: 'https://www.google.com.hk', text: '谷歌' },
                { url: 'https://www.bilibili.com', text: 'B站' },
                { url: 'https://github.com', text: 'GitHub' },
                { url: 'https://zhihu.com', text: '知乎' },
                { url: 'https://weibo.com', text: '微博' },
                { url: 'https://music.163.com', text: '网易云音乐' },
                { url: 'https://doubao.com/chat', text: '豆包' },
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
    showCustomModal('请输入搜索按钮宽度值（如 50px，输入空值恢复默认）：', currentWidth === 'Default' ? '' : currentWidth, function(newWidth) {
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
    // ========== 新增：IE 兼容性检测 ==========
    var isIE = false;
    var ieVersion = 0;
    try {
        var ua = navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            isIE = true;
            ieVersion = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            isIE = true;
            var rv = ua.indexOf('rv:');
            if (rv > 0) {
                ieVersion = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }
        }
    } catch(e) {
        isIE = false;
    }
    // ========== 新增结束 ==========
    
    var settings = {
        autoFillHttpsChecked: localStorage.getItem('autoFillHttpsChecked') || 'false',
        focusCheckboxChecked: localStorage.getItem('focusCheckboxChecked') || 'false',
        layoutChecked: localStorage.getItem('layoutChecked') || 'false',
        showLinkChecked: localStorage.getItem('showLinkChecked') || 'true',
        showSendCheckboxChecked: localStorage.getItem('showSendCheckboxChecked') || 'true',
        hideSearchContainerChecked: localStorage.getItem('hideSearchContainerChecked') || 'false',
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
        quickLinksAlign: localStorage.getItem('quickLinksAlign') || 'center',
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
        clearOnBlurChecked: localStorage.getItem('clearOnBlurChecked') || 'true',
        showTimeChecked: localStorage.getItem('showTimeChecked') || 'false',
        timeLinkOriginalImage: localStorage.getItem('timeLinkOriginalImage'),
        timeFormat: localStorage.getItem('timeFormat') || '24hours',
        colonBlinkChecked: localStorage.getItem('colonBlinkChecked') || 'false',
        showSecondsChecked: localStorage.getItem('showSecondsChecked') || 'false',
        '36156798756549916136': localStorage.getItem('36156798756549916136') || 'false',
        hideOrder0Search: localStorage.getItem('hideOrder0Search') || 'false',
        searchHistoryInSuggestChecked: localStorage.getItem('searchHistoryInSuggestChecked') || 'false',
        historyLinksFontSize: localStorage.getItem('historyLinksFontSize'),
        historyLinksColor: localStorage.getItem('historyLinksColor') || '#0000ee',
        iframePlusWidth: localStorage.getItem('iframePlusWidth'),
        iframePlusHeight: localStorage.getItem('iframePlusHeight'),
        rightClickAction: localStorage.getItem('rightClickAction') || 'disabled',
        swipeSwitchChecked: localStorage.getItem('swipeSwitchChecked') || 'false',
        hitokotoColor: localStorage.getItem('hitokotoColor') || '#000000',
        hitokotoFontStyle: localStorage.getItem('hitokotoFontStyle') || 'italic',
        hitokotoFontSize: localStorage.getItem('hitokotoFontSize') || '14px',
        moreSettingsExpanded: localStorage.getItem('moreSettingsExpanded') || 'false'
    };
    
    // ========== 新增：动态遍历 localStorage 捕获遗漏项 ==========
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && !settings.hasOwnProperty(key)) {
                if (key.indexOf('_temp') === -1 && 
                    key.indexOf('modalCallback_') === -1 &&
                    key.indexOf('doubleInputCallback_') === -1 &&
                    key.indexOf('alertCallback_') === -1 &&
                    key.indexOf('codeCallback_') === -1 &&
                    key.indexOf('confirmCallback_') === -1) {
                    var value = localStorage.getItem(key);
                    if (value !== null && value !== undefined) {
                        settings[key] = value;
                    }
                }
            }
        }
    } catch(e) {
        // IE 兼容：遍历失败时手动添加已知遗漏项
        var knownMissingKeys = [
            'iframePlusWidth', 'iframePlusHeight',
            'rightClickAction', 'swipeSwitchChecked',
            'hitokotoColor', 'hitokotoFontStyle', 'hitokotoFontSize',
            'moreSettingsExpanded', 'previousEngine',
            'searchHistoryInSuggestChecked', 'historyLinksFontSize', 'historyLinksColor'
        ];
        for (var k = 0; k < knownMissingKeys.length; k++) {
            var key = knownMissingKeys[k];
            if (!settings.hasOwnProperty(key)) {
                var value = localStorage.getItem(key);
                if (value !== null && value !== undefined) {
                    settings[key] = value;
                }
            }
        }
    }
    // ========== 新增结束 ==========
    
    var jsonContent = JSON.stringify(settings, null, 2);
    
    // ========== 修改：IE9+ 兼容的文件导出逻辑 ==========
    // ========== 新增：生成带日期时间的文件名（兼容 IE9+）==========
    function getFormattedDateTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        
        // 补零函数（兼容 IE9）
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        // 格式：20250115_143052
        var dateTimeStr = year + 
                          padZero(month) + 
                          padZero(day) + 
                          '_' + 
                          padZero(hours) + 
                          padZero(minutes) + 
                          padZero(seconds);
        
        return dateTimeStr;
    }
    
    // 生成带日期时间的文件名
    var dateTimeStr = getFormattedDateTime();
    var fileName = 'search_settings_' + dateTimeStr + '.json';
    // ========== 新增结束 ==========
    
    // 方法1：尝试使用 Blob（IE10+ 支持）
    var blobSupported = false;
    try {
        blobSupported = typeof Blob !== 'undefined' && typeof URL !== 'undefined';
    } catch(e) {
        blobSupported = false;
    }
    
    if (blobSupported) {
        // IE10+ 和其他现代浏览器使用 Blob + URL.createObjectURL
        try {
            var blob = new Blob([jsonContent], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            
            if (a.click) {
                a.click();
            } else if (a.fireEvent) {
                a.fireEvent('onclick');
            }
            
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            return;
        } catch(e) {
            // Blob 方式失败，继续使用备用方案
        }
    }
    
    // 方法2：IE9 及以下使用 msSaveBlob（IE10+ 也支持）
    if (typeof navigator !== 'undefined' && navigator.msSaveBlob) {
        try {
            var blob = new Blob([jsonContent], { type: 'application/json' });
            navigator.msSaveBlob(blob, fileName);
            return;
        } catch(e) {
            // msSaveBlob 失败，继续使用备用方案
        }
    }
    
    // 方法3：使用 data URL（所有浏览器通用，但 IE 有 URL 长度限制）
    try {
        var base64Content = '';
        // 尝试 base64 编码
        try {
            if (typeof btoa === 'function') {
                base64Content = btoa(unescape(encodeURIComponent(jsonContent)));
            } else {
                // IE9 不支持 btoa 时的降级方案
                base64Content = encodeURIComponent(jsonContent);
            }
        } catch(e) {
            base64Content = encodeURIComponent(jsonContent);
        }
        
        var dataUrl = 'data:application/json;charset=utf-8,' + base64Content;
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        if (a.click) {
            a.click();
        } else if (a.fireEvent) {
            a.fireEvent('onclick');
        }
        
        setTimeout(function() {
            document.body.removeChild(a);
        }, 100);
    } catch(e) {
        // 方法4：最后的降级方案 - 使用 prompt 显示 JSON 内容让用户手动保存
        try {
            var fallbackMsg = '无法自动下载文件，请手动复制以下内容并保存为 ' + fileName + '：\n\n';
            if (confirm(fallbackMsg + '确定后显示文件内容')) {
                prompt('请复制以下内容并保存为 ' + fileName, jsonContent);
            }
        } catch(e2) {
            alert('导出失败：' + e2.message);
        }
    }
    // ========== 修改结束 ==========
}

// 导入设置功能
document.querySelector('label[for="importSettingsBtn"]').addEventListener('click', function() {
    document.getElementById('importSettingsInput').click();
});

// 兼容 IE 所有版本及旧版浏览器正常导入文件
var importSettingsInput = document.getElementById('importSettingsInput');
if (importSettingsInput) {
    if (importSettingsInput.addEventListener) {
        importSettingsInput.addEventListener('change', handleImportFile);
    } else if (importSettingsInput.attachEvent) {
        importSettingsInput.attachEvent('onchange', handleImportFile);
    }
    
    function handleImportFile(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var file = target.files && target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(event) {
            try {
                var content = event.target.result;
                var settings = JSON.parse(content);
                
                // 弹出二次确认对话框
                showCustomConfirm('确定要导入该配置文件吗？导入后将覆盖当前所有设置并刷新页面。', function(result) {
                    if (result) {
                        // 恢复所有设置到localStorage
                        var settingsKeys = Object.keys(settings);
                        for (var k = 0; k < settingsKeys.length; k++) {
                            var key = settingsKeys[k];
                            if (settings[key] !== null) {
                                try {
                                    localStorage.setItem(key, settings[key]);
                                } catch(e) {}
                            }
                        }
                        // 重新加载页面应用设置
                        try {
                            window.location.reload();
                        } catch(e) {
                            window.location.href = window.location.href;
                        }
                    }
                });
            } catch (error) {
                // JSON解析失败，静默处理
            }
            if (target) target.value = '';
        };
        reader.onerror = function() {
            if (target) target.value = '';
        };
        try {
            reader.readAsText(file);
        } catch(e) {}
    }
}

// 为导入设置按钮添加拖放支持
var importSettingsLabel = document.querySelector('label[for="importSettingsBtn"]');
setupDragDrop(importSettingsLabel, function(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var content = event.target.result;
            var settings = JSON.parse(content);
            
            // 弹出二次确认对话框
            showCustomConfirm('确定要导入该配置文件吗？导入后将覆盖当前所有设置并刷新页面。', function(result) {
                if (result) {
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
                }
            });
        } catch (error) {
            // JSON解析失败
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

// ========== 显示搜索建议（完全兼容 IE9/10，保持原有布局和高度控制） ==========
function showSearchSuggestions(suggestions) {
    var searchSuggestionsCheckbox = document.getElementById('searchSuggestionsCheckbox');
    var engineSelect = document.getElementById('engineSelect');
    
    if (!searchSuggestionsCheckbox || !engineSelect) return;
    if (!searchSuggestionsCheckbox.checked || engineSelect.value === 'httpsAutoFill') return;
    
    var urlInput = document.getElementById('urlInput');
    var searchSuggestions = document.getElementById('searchSuggestions');
    if (!urlInput || !searchSuggestions) return;
    
    var inputText = urlInput.value.trim();
    
    // ========== 输入为空时，判断是否需要显示历史记录 ==========
    if (inputText === '') {
        // 检查是否启用历史记录在建议中显示
        var showHistoryInSuggest = false;
        var searchHistoryChecked = false;
        var hasHistory = false;
        try {
            showHistoryInSuggest = localStorage.getItem('searchHistoryInSuggestChecked') === 'true';
            var historyCheckboxElem = document.getElementById('searchHistoryCheckbox');
            searchHistoryChecked = historyCheckboxElem && historyCheckboxElem.checked;
            if (showHistoryInSuggest && searchHistoryChecked) {
                var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                hasHistory = history.length > 0;
            }
        } catch(e) {}
        
        // 如果启用了历史记录建议且有历史记录，则显示历史记录（不隐藏）
        if (showHistoryInSuggest && searchHistoryChecked && hasHistory) {
            // 继续执行后续代码显示历史记录
        } else {
            searchSuggestions.style.display = 'none';
            return;
        }
    }
    
    // 预先计算 isDesktop 结果，避免重复调用（IE9 兼容）
    var isDesktopFlag = false;
    try {
        isDesktopFlag = typeof isDesktop === 'function' ? isDesktop() : false;
    } catch(e) {
        isDesktopFlag = !/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 设置搜索建议框的最大高度（保持原有逻辑）
    if (isDesktopFlag) {
        searchSuggestions.style.maxHeight = '800px';
    } else {
        searchSuggestions.style.maxHeight = '200px';
    }
    searchSuggestions.style.overflowY = 'auto';
    searchSuggestions.style.overflowX = 'hidden';
    
    // 检查是否为空且启用了历史记录在建议中显示
    var showHistoryInSuggest = false;
    var searchHistoryChecked = false;
    try {
        showHistoryInSuggest = localStorage.getItem('searchHistoryInSuggestChecked') === 'true';
        var historyCheckbox = document.getElementById('searchHistoryCheckbox');
        searchHistoryChecked = historyCheckbox && historyCheckbox.checked;
    } catch(e) {}
    
    var isInputEmpty = inputText === '';
    
    // ========== 检查输入框是否获得焦点 ==========
    var isInputFocused = false;
    var urlInputElement = document.getElementById('urlInput');
    if (urlInputElement) {
        isInputFocused = (document.activeElement === urlInputElement);
    }
    
    // 清空建议框（IE9 兼容：使用 while 循环而非 innerHTML）
        // 清空建议框（IE9 兼容：使用 while 循环而非 innerHTML）
    while (searchSuggestions.firstChild) {
        searchSuggestions.removeChild(searchSuggestions.firstChild);
    }
    
    // 重置滚动位置到顶部（兼容所有浏览器）
    searchSuggestions.scrollTop = 0;
    
    // ========== 显示历史记录（输入为空时） ==========
    if (isInputEmpty && showHistoryInSuggest && searchHistoryChecked && isInputFocused) {
        var history = [];
        try {
            history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch(e) {}
        var displayHistory = history.slice(0, 9);
        
        if (displayHistory.length > 0) {
            // ========== 添加清空历史记录列 ==========
            var clearDiv = document.createElement('div');
            clearDiv.id = 'suggestion_clear_history';
            
            // 使用 innerHTML 添加图标和文字（兼容 IE9）
            clearDiv.innerHTML = '<i class="fa fa-trash-o" style="margin-left: -2px; margin-right: 5px;"></i>清空历史记录';
            
            // 应用样式（保持原有布局）
            clearDiv.style.padding = isDesktopFlag ? '6px 10px' : '5px 10px';
            clearDiv.style.cursor = 'pointer';
            clearDiv.style.borderBottom = '1px solid #eee';
            clearDiv.style.fontWeight = 'bold';
            clearDiv.style.backgroundColor = '#F8F8F8';
            clearDiv.style.fontSize = isDesktopFlag ? '11px' : '13px';
            clearDiv.style.textAlign = 'left';
            clearDiv.style.userSelect = 'none';
            
            // 清空历史记录点击事件（兼容 IE9）
            clearDiv.onclick = function() {
                try {
                    localStorage.removeItem('searchHistory');
                    if (typeof updateSearchHistory === 'function') {
                        updateSearchHistory();
                    }
                } catch(e) {}
                
                // 刷新建议列表
                var currentValue = urlInput.value;
                if (currentValue === '') {
                    searchSuggestions.style.display = 'none';
                } else if (typeof fetchSearchSuggestions === 'function') {
                    fetchSearchSuggestions(currentValue);
                }
            };
            
            clearDiv.onmouseover = function() { this.style.backgroundColor = '#e0e0e0'; };
            clearDiv.onmouseout = function() { this.style.backgroundColor = '#F8F8F8'; };
            searchSuggestions.appendChild(clearDiv);
            
            // ========== 显示历史记录列表 ==========
            for (var i = 0; i < displayHistory.length; i++) {
                var historyDiv = document.createElement('div');
                historyDiv.id = 'suggestion_history_' + i;
                var historyText = displayHistory[i].text;
                
                // 应用原有样式
                historyDiv.style.padding = isDesktopFlag ? '7px 10px' : '6px 10px';
                historyDiv.style.fontSize = isDesktopFlag ? '12.4px' : '';
                historyDiv.style.cursor = 'pointer';
                historyDiv.style.borderBottom = '1px solid #eee';
                historyDiv.style.overflow = 'hidden';
                historyDiv.style.textOverflow = 'ellipsis';
                historyDiv.style.whiteSpace = 'nowrap';
                
                // 截断过长文本（兼容 IE9）
                var maxDisplayLength = 50;
                var displayText = historyText;
                if (historyText.length > maxDisplayLength) {
                    displayText = historyText.substring(0, maxDisplayLength) + '...';
                }
                historyDiv.textContent = displayText;
                historyDiv.setAttribute('data-fulltext', historyText);
                historyDiv.title = historyText;
                
                // 点击历史记录项（兼容 IE9）
                (function(fullText) {
                    historyDiv.onclick = function() {
                        var autoFillAndJump = false;
                        try {
                            autoFillAndJump = document.getElementById('autoFillAndJumpCheckbox') && 
                                              document.getElementById('autoFillAndJumpCheckbox').checked;
                        } catch(e) {}
                        
                        if (autoFillAndJump) {
                            urlInput.value = fullText;
                            try {
                                if (document.getElementById('saveInputCheckbox') && 
                                    document.getElementById('saveInputCheckbox').checked) {
                                    localStorage.setItem('savedInputText', fullText);
                                }
                            } catch(e) {}
                            var submitBtn = document.getElementById('submitBtn');
                            if (submitBtn && submitBtn.click) submitBtn.click();
                            urlInput.blur();
                            searchSuggestions.style.display = 'none';
                        } else {
                            urlInput.value = fullText;
                            try {
                                if (document.getElementById('saveInputCheckbox') && 
                                    document.getElementById('saveInputCheckbox').checked) {
                                    localStorage.setItem('savedInputText', fullText);
                                }
                            } catch(e) {}
                            urlInput.focus();
                            setTimeout(function() {
                                if (searchSuggestionsCheckbox && searchSuggestionsCheckbox.checked && 
                                    typeof fetchSearchSuggestions === 'function') {
                                    fetchSearchSuggestions(fullText);
                                }
                            }, 10);
                        }
                    };
                })(historyText);
                
                historyDiv.onmouseover = function() { this.style.backgroundColor = '#f0f0f0'; };
                historyDiv.onmouseout = function() { this.style.backgroundColor = ''; };
                searchSuggestions.appendChild(historyDiv);
            }
            
            // 定位建议框
            var inputRect = urlInput.getBoundingClientRect();
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
            searchSuggestions.style.top = (inputRect.bottom + scrollTop) + 'px';
            searchSuggestions.style.left = (inputRect.left + scrollLeft) + 'px';
            searchSuggestions.style.width = (inputRect.width - 2) + 'px';
            searchSuggestions.style.display = 'block';
            return;
        }
    }
    
    // ========== 检测输入内容是否包含网址格式 ==========
    var isUrlPattern = false;
    var isNumberPattern = /^[+-]?\d+(\.\d+)?$/;
    if (!isNumberPattern.test(inputText) && inputText.length > 0) {
        var urlPatterns = [
            /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/|$)/,
            /^https?:\/\//,
            /^www\.[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/,
            /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}\.[a-zA-Z]{2,}/,
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?(?:\/|$)/
        ];
        for (var p = 0; p < urlPatterns.length; p++) {
            if (urlPatterns[p].test(inputText)) {
                isUrlPattern = true;
                break;
            }
        }
    }
    
    // 额外检测包含斜杠的网址格式
    if (!isUrlPattern && inputText.indexOf('/') !== -1) {
        var slashIndex = inputText.indexOf('/');
        var beforeSlash = inputText.substring(0, slashIndex);
        for (var p = 0; p < urlPatterns.length; p++) {
            if (urlPatterns[p].test(beforeSlash)) {
                isUrlPattern = true;
                break;
            }
        }
    }
    
    // 如果检测到非英文字符，不视为网址格式
    if (isUrlPattern && /[^\x00-\x7F]/.test(inputText)) {
        var protocolIndex = inputText.indexOf('://');
        if (protocolIndex !== -1) {
            var afterProtocol = inputText.substring(protocolIndex + 3);
            var firstSlashIndex = afterProtocol.indexOf('/');
            if (firstSlashIndex !== -1) {
                var domainPart = afterProtocol.substring(0, firstSlashIndex);
                if (/[^\x00-\x7F]/.test(domainPart)) isUrlPattern = false;
            } else {
                if (/[^\x00-\x7F]/.test(afterProtocol)) isUrlPattern = false;
            }
        } else {
            var slashIdx = inputText.indexOf('/');
            if (slashIdx !== -1) {
                var beforeSlashUrl = inputText.substring(0, slashIdx);
                if (/[^\x00-\x7F]/.test(beforeSlashUrl)) isUrlPattern = false;
            } else {
                if (/[^\x00-\x7F]/.test(inputText)) isUrlPattern = false;
            }
        }
    }
    
    // ========== 添加访问网站建议 ==========
    var showVisitWebsite = false;
    try {
        showVisitWebsite = document.getElementById('showVisitWebsiteCheckbox') && 
                           document.getElementById('showVisitWebsiteCheckbox').checked;
    } catch(e) {}
    
    if (isUrlPattern && inputText.length > 0 && showVisitWebsite) {
        var visitDiv = document.createElement('div');
        visitDiv.id = 'suggestion_visit_website';
        
        // 创建文本内容
        var visitText = document.createElement('span');
        visitText.textContent = '访问: ' + inputText;
        
        // 电脑端时添加Alt+Enter提示（保持原有逻辑）
        var altEnterText = null;
        if (isDesktopFlag) {
            altEnterText = document.createElement('span');
            altEnterText.textContent = 'Alt+Enter';
            altEnterText.style.color = '#666';
            altEnterText.style.fontSize = '10px';
            altEnterText.style.float = 'right';
            altEnterText.style.marginTop = '2px';
        }
        
        visitDiv.appendChild(visitText);
        if (altEnterText) {
            visitDiv.appendChild(altEnterText);
        }
        
        // 应用原有样式
        visitDiv.style.padding = isDesktopFlag ? '6px 10px' : '5px 10px';
        visitDiv.style.cursor = 'pointer';
        visitDiv.style.borderBottom = '1px solid #eee';
        visitDiv.style.fontWeight = 'bold';
        visitDiv.style.fontSize = isDesktopFlag ? '11px' : '13px';
        visitDiv.style.backgroundColor = '#f8f8f8';
        visitDiv.style.display = 'block';
        visitDiv.style.overflow = 'hidden';
        visitDiv.style.position = 'relative';
        visitDiv.style.whiteSpace = 'nowrap';
        visitDiv.style.textOverflow = 'ellipsis';
        
        visitText.style.overflow = 'hidden';
        visitText.style.textOverflow = 'ellipsis';
        visitText.style.whiteSpace = 'nowrap';
        visitText.style.display = 'inline-block';
        visitText.style.verticalAlign = 'middle';
        visitText.style.float = 'left';
        visitText.style.maxWidth = '70%';
        
        visitDiv.onclick = function() {
            var finalUrl = inputText;
            if (finalUrl.indexOf('://') === -1 && finalUrl.indexOf('/') !== 0) {
                finalUrl = 'https://' + finalUrl;
            }
            
            // 保存历史记录
            if (inputText) {
                try {
                    var searchHistoryCheckbox = document.getElementById('searchHistoryCheckbox');
                    if (searchHistoryCheckbox && searchHistoryCheckbox.checked) {
                        var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                        if (inputText !== 'https://' && inputText !== 'http://') {
                            var filteredHistory = [];
                            for (var h = 0; h < history.length; h++) {
                                if (history[h].text !== inputText) {
                                    filteredHistory.push(history[h]);
                                }
                            }
                            filteredHistory.unshift({ text: inputText });
                            var limitedHistory = filteredHistory.slice(0, 10);
                            localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
                            if (typeof updateSearchHistory === 'function') updateSearchHistory();
                        }
                    }
                } catch(e) {}
            }
            
            window.open(finalUrl, '_blank');
            urlInput.blur();
        };
        
        visitDiv.onmouseover = function() { this.style.backgroundColor = '#e0e0e0'; };
        visitDiv.onmouseout = function() { this.style.backgroundColor = '#f8f8f8'; };
        searchSuggestions.appendChild(visitDiv);
    }
    
    // ========== 显示搜索建议 ==========
    if (suggestions && suggestions.length > 0) {
        for (var i = 0; i < suggestions.length; i++) {
            var sugDiv = document.createElement('div');
            sugDiv.id = 'suggestion_normal_' + i;
            sugDiv.textContent = suggestions[i];
            
            // 应用原有样式
            sugDiv.style.padding = isDesktopFlag ? '7px 10px' : '6px 10px';
            sugDiv.style.fontSize = isDesktopFlag ? '12.4px' : '';
            sugDiv.style.cursor = 'pointer';
            sugDiv.style.borderBottom = '1px solid #eee';
            sugDiv.style.overflow = 'hidden';
            sugDiv.style.textOverflow = 'ellipsis';
            sugDiv.style.whiteSpace = 'nowrap';
            
            (function(suggestion) {
                sugDiv.onclick = function() {
                    var autoFillAndJump = false;
                    try {
                        autoFillAndJump = document.getElementById('autoFillAndJumpCheckbox') && 
                                          document.getElementById('autoFillAndJumpCheckbox').checked;
                    } catch(e) {}
                    
                    if (autoFillAndJump) {
                        urlInput.value = suggestion;
                        try {
                            if (document.getElementById('saveInputCheckbox') && 
                                document.getElementById('saveInputCheckbox').checked) {
                                localStorage.setItem('savedInputText', suggestion);
                            }
                        } catch(e) {}
                        var submitBtn = document.getElementById('submitBtn');
                        if (submitBtn && submitBtn.click) submitBtn.click();
                        urlInput.blur();
                        searchSuggestions.style.display = 'none';
                    } else {
                        urlInput.value = suggestion;
                        try {
                            if (document.getElementById('saveInputCheckbox') && 
                                document.getElementById('saveInputCheckbox').checked) {
                                localStorage.setItem('savedInputText', suggestion);
                            }
                        } catch(e) {}
                        setTimeout(function() {
                            if (searchSuggestionsCheckbox && searchSuggestionsCheckbox.checked && 
                                typeof fetchSearchSuggestions === 'function') {
                                fetchSearchSuggestions(suggestion);
                            }
                        }, 10);
                        urlInput.focus();
                    }
                };
            })(suggestions[i]);
            
            sugDiv.onmouseover = function() { this.style.backgroundColor = '#f0f0f0'; };
            sugDiv.onmouseout = function() { this.style.backgroundColor = ''; };
            searchSuggestions.appendChild(sugDiv);
        }
    }
    
    // ========== 显示或隐藏建议框 ==========
    if (searchSuggestions.children.length > 0) {
        var inputRect = urlInput.getBoundingClientRect();
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        searchSuggestions.style.top = (inputRect.bottom + scrollTop) + 'px';
        searchSuggestions.style.left = (inputRect.left + scrollLeft) + 'px';
        searchSuggestions.style.width = (inputRect.width - 2) + 'px';
        searchSuggestions.style.display = 'block';
    } else {
        searchSuggestions.style.display = 'none';
    }
}
// ========== 显示搜索建议函数结束 ==========

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

// ========== 获取搜索建议（兼容 IE9/10） ==========
function fetchSearchSuggestions(query) {
    var searchSuggestionsCheckbox = document.getElementById('searchSuggestionsCheckbox');
    var engineSelect = document.getElementById('engineSelect');
    
    if (!searchSuggestionsCheckbox || !engineSelect) return;
    if (!searchSuggestionsCheckbox.checked || engineSelect.value === 'iFrameFree' || engineSelect.value === 'iFramePlus') return;
    
    var searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) return;
    
    // 检查输入框是否获得焦点
    var urlInputElement = document.getElementById('urlInput');
    var isInputFocused = false;
    if (urlInputElement) {
        isInputFocused = (document.activeElement === urlInputElement);
    }
    
    if (!isInputFocused) {
        searchSuggestions.style.display = 'none';
        return;
    }
    
    // ========== 输入为空时，判断是否需要显示历史记录 ==========
    if (!query || query.trim() === '') {
        // 检查是否启用历史记录在建议中显示
        var showHistoryInSuggest = false;
        var searchHistoryChecked = false;
        var hasHistory = false;
        try {
            showHistoryInSuggest = localStorage.getItem('searchHistoryInSuggestChecked') === 'true';
            var historyCheckboxElem = document.getElementById('searchHistoryCheckbox');
            searchHistoryChecked = historyCheckboxElem && historyCheckboxElem.checked;
            if (showHistoryInSuggest && searchHistoryChecked) {
                var history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
                hasHistory = history.length > 0;
            }
        } catch(e) {}
        
        // 如果启用了历史记录建议且有历史记录，则调用 showSearchSuggestions 显示历史记录
        if (showHistoryInSuggest && searchHistoryChecked && hasHistory) {
            if (typeof showSearchSuggestions === 'function') {
                showSearchSuggestions([]);
            }
            return;
        } else {
            searchSuggestions.style.display = 'none';
            return;
        }
    }
    
    if (!query || query.trim() === '') {
        var showHistoryInSuggest = false;
        var searchHistoryChecked = false;
        try {
            showHistoryInSuggest = getHistoryInSuggestState() === 'true';
            var historyCheckboxElem = document.getElementById('searchHistoryCheckbox');
            searchHistoryChecked = historyCheckboxElem && historyCheckboxElem.checked;
        } catch(e) {}
        
        if (showHistoryInSuggest && searchHistoryChecked) {
            if (typeof showSearchSuggestions === 'function') {
                showSearchSuggestions([]);
            }
            return;
        }
        searchSuggestions.style.display = 'none';
        return;
    }
    
    var apiSelect = document.getElementById('searchApiSelect');
    var apiType = apiSelect ? apiSelect.value : 'baidu_sugrec';
    var apiUrl = '';
    
    if (apiType === 'baidu_sugrec') {
        apiUrl = 'https://www.baidu.com/sugrec?prod=pc&wd=' + encodeURIComponent(query) + '&cb=window.handleSuggestion';
    } else if (apiType === 'baidu_su') {
        apiUrl = 'https://suggestion.baidu.com/su?wd=' + encodeURIComponent(query) + '&cb=window.handleSuggestion&t=' + new Date().getTime();
    } else if (apiType === 'so_sug') {
        apiUrl = 'https://sug.so.360.cn/suggest?word=' + encodeURIComponent(query) + '&callback=window.handleSuggestion&_=' + new Date().getTime();
    } else if (apiType === 'google_sug') {
        apiUrl = 'https://www.google.com/complete/search?q=' + encodeURIComponent(query) + '&client=chrome&callback=window.handleSuggestion';
    }
    
    // 移除旧的 script 标签
    var oldScripts = document.head.getElementsByTagName('script');
    for (var i = oldScripts.length - 1; i >= 0; i--) {
        if (oldScripts[i].src && oldScripts[i].src.indexOf('sug') !== -1) {
            try {
                if (oldScripts[i].parentNode) {
                    oldScripts[i].parentNode.removeChild(oldScripts[i]);
                }
            } catch(e) {}
        }
    }
    
    var script = document.createElement('script');
    script.src = apiUrl;
    script.onerror = function() {
        if (typeof showSearchSuggestions === 'function') {
            showSearchSuggestions([query]);
        }
        // 清理自身
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
        script.onerror = null;
        script.onload = null;
    };
    script.onload = function() {
        // 加载完成后清理 script 标签
        setTimeout(function() {
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            script.onerror = null;
            script.onload = null;
        }, 100);
    };
    document.head.appendChild(script);
    
    // 设置超时清理
    ResourceManager.setTimeout(function() {
        try {
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            script.onerror = null;
            script.onload = null;
        } catch(e) {}
    }, 5000);
}
// ========== 获取搜索建议函数结束 ==========

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
        if (scripts[i].src.indexOf('sugrec') > -1 || scripts[i].src.indexOf('suggestion.baidu.com') > -1 || scripts[i].src.indexOf('sug.so.360.cn') > -1) {
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
    } else if (apiType === 'so_sug') {
        try {
            // 360搜索返回格式: { result: [{word: "关键词"}, ...] } 或直接数组
            if (data && data.result && data.result.length > 0) {
                for (var k = 0; k < data.result.length; k++) {
                    if (data.result[k].word) {
                        suggestions.push(data.result[k].word);
                    }
                }
            } else if (data && Array.isArray(data)) {
                suggestions = data;
            } else if (data && data.s && data.s.length > 0) {
                suggestions = data.s;
            }
        } catch (e) {
            // 解析失败
        }
    } else if (apiType === 'google_sug') {
        // 解析谷歌搜索建议格式
        try {
            // 谷歌返回格式: 数组 [原始查询词, [建议列表], ...]
            if (data && Array.isArray(data) && data[1] && data[1].length > 0) {
                for (var k = 0; k < data[1].length; k++) {
                    if (data[1][k]) {
                        suggestions.push(data[1][k]);
                    }
                }
            }
            // 处理可能的JSONP字符串格式
            else if (typeof data === 'string') {
                var match = data.match(/window\.handleSuggestion\((.+)\)/);
                if (match && match[1]) {
                    var parsedData = JSON.parse(match[1]);
                    if (parsedData && Array.isArray(parsedData) && parsedData[1] && parsedData[1].length > 0) {
                        for (var k = 0; k < parsedData[1].length; k++) {
                            if (parsedData[1][k]) {
                                suggestions.push(parsedData[1][k]);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            // 解析失败
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
            resetQuickInputPosition();
            setTimeout(function() {
                resetQuickInputPosition();
            }, 100);
            setTimeout(function() {
                resetQuickInputPosition();
            }, 150);
        }
    }, 10);
});

// 输入框失焦事件
document.getElementById('urlInput').addEventListener('blur', function() {
    // ========== 【修改位置】如果正在跳转导航中，不隐藏搜索建议（让切换引擎时能正常显示） ==========
    if (window._isNavigating) {
        // 正在跳转中，不做任何处理，让切换引擎时能恢复
        return;
    }
    // ========== 【修改结束】 ==========
    
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
    document.getElementById('searchApiSelect').disabled = !document.getElementById('searchSuggestionsCheckbox').checked;
    document.getElementById('autoFillAndJumpCheckbox').disabled = !document.getElementById('searchSuggestionsCheckbox').checked;
}

// 输入框焦点事件
document.getElementById('urlInput').addEventListener('focus', function() {
    // ========== 【修改位置】聚焦时清除导航标记 ==========
    if (window._clearNavigationFlagTimer) {
        clearTimeout(window._clearNavigationFlagTimer);
    }
    window._isNavigating = false;
    // ========== 【修改结束】 ==========
    
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
    document.getElementById('searchApiSelect').disabled = !this.checked;
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
    var alignValue = localStorage.getItem('quickLinksAlign') || 'center';
    if (alignValue === 'left') {
        container.style.textAlign = 'left';
    } else if (alignValue === 'right') {
        container.style.textAlign = 'right';
    } else {
        container.style.textAlign = 'center';
    }
    container.style.display = 'block';
    container.style.width = '100%';
    container.style.margin = '0';
    container.style.padding = '0';
        
    links.forEach(function(link, index) {
        var linkElement = document.createElement('a');
        linkElement.href = link.url.indexOf('http') === 0 ? link.url : '#';
        // 支持innerHTML插入，同时兼容旧数据
        if (link.isHtml === true) {
            linkElement.innerHTML = link.text;
        } else {
            linkElement.textContent = link.text;
        }
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
                    '编辑快捷链接-<a href="' + link.url + '" target="_blank" onclick="setTimeout(function(){var cancelBtn=document.querySelector(\'label[onclick*=\\\'doubleInputCallback_\\\']\');if(cancelBtn)cancelBtn.click();},100)">跳转该链接</a>',
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
                            
                            // 更新链接（保留isHtml标记）
                            var updatedLinks = JSON.parse(localStorage.getItem('quickLinks') || '[]');
                            updatedLinks[index] = { url: url, text: text, isHtml: true };
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
            deleteBtn.innerHTML = '<i class="fa fa-close" style="margin-left: -3px;"><i>';
            deleteBtn.style.marginLeft = '5px';
            deleteBtn.style.width = '100%';
            deleteBtn.style.maxWidth = '21px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.WebkitTapHighlightColor = 'transparent';
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
        '设置快捷链接间距',
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

function applyLinkSpacing() {
    try {
        var horizontalSpacing = localStorage.getItem('linkHorizontalSpacing') || '0';
        var verticalSpacing = localStorage.getItem('linkVerticalSpacing') || '0';
        
        var quickLinks = document.getElementById('quickLinks');
        if (!quickLinks) return;
        
        var linkContainers = [];
        try {
            linkContainers = quickLinks.querySelectorAll('span');
        } catch(e) {
            // IE8及以下不支持querySelectorAll
            var allSpans = quickLinks.getElementsByTagName('span');
            for (var i = 0; i < allSpans.length; i++) {
                linkContainers.push(allSpans[i]);
            }
        }
        
        var links = quickLinks.getElementsByTagName('a');
        
        // 设置每个链接容器的间距
        for (var i = 0; i < linkContainers.length; i++) {
            if (linkContainers[i]) {
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
        }
        
        // 设置每个链接的间距
        for (var j = 0; j < links.length; j++) {
            if (links[j]) {
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
    } catch(e) {
        // 静默处理错误，不影响主要功能
    }
}
document.querySelector('label[for="quickLinksColorPicker"]').addEventListener('click', function() {
    var currentColor = localStorage.getItem('quickLinksColor') || '#0000ee';
    showCustomModal('请输入快捷链接颜色值（如 #0000ee 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newValue) {
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

// 修改位置：找到历史记录链接颜色调整功能的 click 事件监听器

var historyLinksColorLabel = document.querySelector('label[for="historyLinksColorPicker"]');
if (historyLinksColorLabel) {
    historyLinksColorLabel.addEventListener('click', function() {
        var currentColor = localStorage.getItem('historyLinksColor') || '#0000ee';
        showCustomModal('请输入历史记录链接颜色值（如 #0000ee 或 red）或者rgba(255,255,255,1.0)，hsl(0,100%,50%) 或使用<a href="javascript:void(0)" onclick="var modalKeys=[];for(var key in window){if(window.hasOwnProperty(key)&&key.indexOf(\'modalCallback_\')===0){modalKeys.push(key);}}if(modalKeys.length>0){var input=document.getElementById(\'modalInput_\'+modalKeys[0]);if(input){var colorPicker=document.createElement(\'input\');colorPicker.type=\'color\';var currentColor=input.value;if(currentColor&&/^#([0-9A-F]{3,6})$/i.test(currentColor)){colorPicker.value=currentColor;}var btnRect=this.getBoundingClientRect();colorPicker.style.position=\'fixed\';colorPicker.style.left=btnRect.left+\'px\';colorPicker.style.top=(btnRect.bottom+5)+\'px\';colorPicker.style.width=\'0px\';colorPicker.style.height=\'0px\';colorPicker.style.opacity=\'0\';colorPicker.style.zIndex=\'10002\';colorPicker.onchange=function(){if(input){input.value=this.value;var colorPreview=document.getElementById(\'colorPreview\');if(colorPreview){colorPreview.style.background=this.value;}}setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};colorPicker.onblur=function(){setTimeout(function(){if(colorPicker&&colorPicker.parentNode){colorPicker.parentNode.removeChild(colorPicker);}},100);};document.body.appendChild(colorPicker);setTimeout(function(){if(colorPicker.focus)colorPicker.focus();if(colorPicker.click)colorPicker.click();},50);}}return false;">调色盘</a><span id="colorPreview" style="display:inline-block;width:17px;height:17px;background:' + currentColor + ';margin-bottom: 1px;margin-left:2px;border:0.5px solid #000;vertical-align:middle;"></span> ：', currentColor, function(newValue) {
            if (newValue !== null) {
                if (newValue === '') {
                    var defaultColor = '#0000ee';
                    updateHistoryLinksColor(defaultColor);
                    localStorage.setItem('historyLinksColor', defaultColor);
                    // === 修复：更新 span 颜色值显示 ===
                    var historyLinksColorValueSpan = document.getElementById('historyLinksColorValue');
                    if (historyLinksColorValueSpan) {
                        historyLinksColorValueSpan.textContent = defaultColor;
                        truncateText('historyLinksColorValue', defaultColor, 80);
                    }
                    // === 修复代码结束 ===
                } else if (/^#([0-9A-F]{3,6})$/i.test(newValue) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue) || /^[a-z]+$/i.test(newValue) || /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(newValue)) {
                    updateHistoryLinksColor(newValue);
                    localStorage.setItem('historyLinksColor', newValue);
                    // === 修复：更新 span 颜色值显示 ===
                    var historyLinksColorValueSpan = document.getElementById('historyLinksColorValue');
                    if (historyLinksColorValueSpan) {
                        historyLinksColorValueSpan.textContent = newValue;
                        truncateText('historyLinksColorValue', newValue, 80);
                    }
                    // === 修复代码结束 ===
                }
            }
        });
    });
}

// 更新历史记录链接颜色的函数
function updateHistoryLinksColor(color) {
    var historyLinks = document.querySelectorAll('#searchHistory a');
    for (var i = 0; i < historyLinks.length; i++) {
        historyLinks[i].style.color = color;
    }
}

// 加载保存的历史记录链接颜色
// ========== 【IE8修复】添加localStorage存在性检查 ==========
if (typeof localStorage !== 'undefined' && localStorage !== null) {
    var savedHistoryLinksColor = localStorage.getItem('historyLinksColor');
    if (savedHistoryLinksColor) {
        var historyLinksColorValueSpan = document.getElementById('historyLinksColorValue');
        if (historyLinksColorValueSpan) {
            historyLinksColorValueSpan.textContent = savedHistoryLinksColor;
            truncateText('historyLinksColorValue', savedHistoryLinksColor, 80);
        }
        setTimeout(function() {
            updateHistoryLinksColor(savedHistoryLinksColor);
        }, 100);
    } else {
        // === 修复：如果没有保存的颜色，确保显示默认颜色 ===
        var historyLinksColorValueSpan = document.getElementById('historyLinksColorValue');
        if (historyLinksColorValueSpan) {
            historyLinksColorValueSpan.textContent = '#0000ee';
        }
        // === 修复代码结束 ===
    }
} else {
    // localStorage不可用时，显示默认颜色
    var historyLinksColorValueSpan = document.getElementById('historyLinksColorValue');
    if (historyLinksColorValueSpan) {
        historyLinksColorValueSpan.textContent = '#0000ee';
    }
}
// ========== 【IE8修复结束】 ==========

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

// 加载保存的快捷链接对齐方式
var savedQuickLinksAlign = localStorage.getItem('quickLinksAlign');
if (savedQuickLinksAlign) {
    document.getElementById('quickLinksAlignSelect').value = savedQuickLinksAlign;
} else {
    document.getElementById('quickLinksAlignSelect').value = 'center';
}

// 监听快捷链接对齐方式变化
document.getElementById('quickLinksAlignSelect').addEventListener('change', function() {
    localStorage.setItem('quickLinksAlign', this.value);
    updateQuickLinks();
});

// 通用弹窗函数（兼容所有浏览器版本）
function showCustomModal(title, currentValue, callback) {
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        text = String(text);
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    
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
        '<input type="search" id="modalInput_' + callbackName + '" placeholder="请输入" value="' + escapeHtml(currentValue || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(null)">取消</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="var input=document.getElementById(\'modalInput_' + callbackName + '\');window.' + callbackName + '(input?input.value:null)">' + (isDesktop() ? '确定(Y)' : '确定') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 电脑端添加快捷键支持
    if (isDesktop()) {
        modal._keyHandler = function(e) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            // Esc键取消
            if (keyCode === 27) {
                window[callbackName](null);
                e.preventDefault();
                return false;
            }
            // Alt+Y 确定（Y键码89，需同时按Alt）
            if (keyCode === 89 && e.altKey) {
                var input = document.getElementById('modalInput_' + callbackName);
                window[callbackName](input ? input.value : null);
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('keydown', modal._keyHandler);
    }
    
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
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(false)">取消' + (isDesktop() ? '(N)' : '') + '</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="window.' + callbackName + '(true)">确定' + (isDesktop() ? '(Y)' : '') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 添加键盘事件处理函数
    // 【修复】兼容 IE 浏览器，确保回调函数存在后再调用
    modal._keyHandler = function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        // 按Esc键 (keyCode 27) 关闭
        if (keyCode === 27) {
            if (typeof window[callbackName] === 'function') {
                window[callbackName](false);
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        }
        
        // 按N键 (keyCode 78) 或 n键 (keyCode 110) 为取消
        if (keyCode === 78 || keyCode === 110) {
            if (typeof window[callbackName] === 'function') {
                window[callbackName](false);
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        }
        
        // 按Y键 (keyCode 89) 或 y键 (keyCode 121) 为确定
        if (keyCode === 89 || keyCode === 121) {
            if (typeof window[callbackName] === 'function') {
                window[callbackName](true);
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        }
    };
    
    // 添加键盘事件监听
    if (document.addEventListener) {
        document.addEventListener('keydown', modal._keyHandler);
    } else if (document.attachEvent) {
        document.attachEvent('onkeydown', modal._keyHandler);
    }
    
    document.body.appendChild(modal);
}

// 双输入框通用弹窗函数（兼容所有浏览器版本）
function showCustomDoubleInput(title, label1, label2, currentValue1, currentValue2, callback) {
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        text = String(text);
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
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
        '<p style="margin-top: 0; user-select: none; text-align: left; font-weight: 500;">' + title + '</p>',
        '<div style="text-align: left; margin-bottom: 10px;">',
        '<div style="font-size: 12px; user-select: none; color: #666; margin-bottom: 5px;">' + label1 + '</div>',
        '<input type="text" id="doubleInput1_' + callbackName + '" placeholder="请输入" value="' + escapeHtml(currentValue1 || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '</div>',
        '<div style="text-align: left; margin-bottom: 15px;">',
        '<div style="font-size: 12px; user-select: none; color: #666; margin-bottom: 5px;">' + label2 + '</div>',
        '<input type="text" id="doubleInput2_' + callbackName + '" placeholder="请输入" value="' + escapeHtml(currentValue2 || '') + '" style="width: 100%; border: 1px solid #ccc; height: 24px; padding: 0 5px; box-sizing: border-box;">',
        '</div>',
        '<div style="margin-top: 15px; text-align: right;">',
        '<label style="vertical-align: middle; cursor: pointer; margin-right: 15px; user-select: none;" onclick="window.' + callbackName + '(null, null)">取消</label>',
        '<label style="vertical-align: middle; cursor: pointer; user-select: none;" onclick="var input1=document.getElementById(\'doubleInput1_' + callbackName + '\'),input2=document.getElementById(\'doubleInput2_' + callbackName + '\');window.' + callbackName + '(input1?input1.value:null,input2?input2.value:null)">' + (isDesktop() ? '确定(Y)' : '确定') + '</label>',
        '</div>',
        '</div>'
    ].join('');
    
    // 电脑端添加快捷键支持
    if (isDesktop()) {
        modal._keyHandler = function(e) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            // Shift+Esc 取消
            if (keyCode === 27 && e.shiftKey) {
                window[callbackName](null, null);
                e.preventDefault();
                return false;
            }
            // Alt+Y 确定
            if (keyCode === 89 && e.altKey) {
                var input1 = document.getElementById('doubleInput1_' + callbackName);
                var input2 = document.getElementById('doubleInput2_' + callbackName);
                window[callbackName](input1 ? input1.value : null, input2 ? input2.value : null);
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('keydown', modal._keyHandler);
    }
    
    // 添加输入框键盘事件支持
    setTimeout(function() {
        var input1 = document.getElementById('doubleInput1_' + callbackName);
        var input2 = document.getElementById('doubleInput2_' + callbackName);
        
        if (input1) {
            input1.addEventListener('keydown', function(e) {
                e = e || window.event;
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) {
                    if (input2) {
                        input2.focus();
                        if (input2.value !== undefined) {
                            var len = input2.value.length;
                            if (input2.setSelectionRange) {
                                input2.setSelectionRange(len, len);
                            }
                        }
                    }
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    return false;
                }
            });
        }
        
        if (input2) {
            input2.addEventListener('keydown', function(e) {
                e = e || window.event;
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) {
                    if (input1) {
                        input1.focus();
                        if (input1.value !== undefined) {
                            var len = input1.value.length;
                            if (input1.setSelectionRange) {
                                input1.setSelectionRange(len, len);
                            }
                        }
                    }
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    return false;
                }
            });
        }
    }, 10);
    
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

document.querySelector('label[for="customSearchListBtn"]').addEventListener('click', function() {
    var customSearches = JSON.parse(localStorage.getItem('customSearches') || '[]');
    var html = '<div style="font-size: 14px;">';
    
    // 在 setTimeout 中添加按钮事件监听（在 setTimeout 函数内部，hideCheckbox 事件监听之后添加）
    setTimeout(function() {
        var hideCheckbox = document.getElementById('hideOrder0Checkbox');
        if (hideCheckbox) {
            hideCheckbox.onclick = function() {
                localStorage.setItem('hideOrder0Search', this.checked);
                var customSearchOption = document.getElementById('customSearchOption');
                if (customSearchOption) {
                    customSearchOption.style.display = this.checked ? 'none' : '';
                }
                if (this.checked && document.getElementById('engineSelect').value === 'customSearch') {
                    document.getElementById('engineSelect').value = 'baidu';
                    localStorage.setItem('selectedEngine', 'baidu');
                }
            };
        }
        
        // 添加一键清空按钮事件
        var clearAllBtn = document.getElementById('clearAllCustomSearchesBtn');
        if (clearAllBtn) {
            clearAllBtn.onclick = function() {
                if (confirm('确定要清空所有自定义搜索吗？')) {
                    localStorage.removeItem('customSearches');
                    localStorage.removeItem('customSearchUrl');
                    localStorage.removeItem('customSearchName');
                    localStorage.removeItem('selectedCustomSearch');
                    localStorage.removeItem('hideOrder0Search');
                    var customSearchOption = document.getElementById('customSearchOption');
                    if (customSearchOption) {
                        customSearchOption.textContent = '自定义';
                        customSearchOption.style.display = '';
                    }
                    updateCustomSearchOptions();
                    // 关闭当前弹窗并重新打开
                    var closeBtn = document.querySelector('label[onclick*="alertCallback_"]');
                    if (closeBtn) closeBtn.click();
                    setTimeout(function() {
                        document.querySelector('label[for="customSearchListBtn"]').click();
                    }, 100);
                }
            };
        }
    }, 10);
    
    // 添加默认order0自定义搜索项
    var defaultOrder0Item = null;
    for (var i = 0; i < customSearches.length; i++) {
        if (customSearches[i].order === 0) {
            defaultOrder0Item = customSearches[i];
            break;
        }
    }
    if (!defaultOrder0Item) {
        var savedName = localStorage.getItem('customSearchName') || '自定义';
        var savedUrl = localStorage.getItem('customSearchUrl') || 'https://www.baidu.com/s?wd={keywords}';
        defaultOrder0Item = { name: savedName, url: savedUrl, order: 0 };
    }
    var isOrder0Hidden = localStorage.getItem('hideOrder0Search') === 'true';
    html += '<div style="display: table; width: 100%; padding: 8px 0; border-bottom: 1px solid #eee;">';
    html += '<span style="display: table-cell; vertical-align: middle; text-align: left;"><strong>0.</strong> ' + defaultOrder0Item.name + '</span>';
    html += '<span style="display: table-cell; vertical-align: middle; text-align: right; white-space: nowrap;">';
    html += '<input type="checkbox" id="hideOrder0Checkbox" ' + (isOrder0Hidden ? 'checked' : '') + ' style="margin-right: 5px;">';
    html += '<label for="hideOrder0Checkbox" style="margin-right: 8px; position: relative; bottom: 2px; user-select: none;">隐藏此项</label>';
    html += '<button id="clearAllCustomSearchesBtn" style="background: #ffffff; float: right; border: 1px solid #ccc; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#ffffff\'">一键清空<i class="fa fa-trash-o" style="margin-left: 3px;"></i></button>';
    html += '</span>';
    html += '</div>';
    
    // 添加checkbox事件监听（在showCustomAlert调用后执行）
    setTimeout(function() {
        var hideCheckbox = document.getElementById('hideOrder0Checkbox');
        if (hideCheckbox) {
            hideCheckbox.onclick = function() {
                localStorage.setItem('hideOrder0Search', this.checked);
                var customSearchOption = document.getElementById('customSearchOption');
                if (customSearchOption) {
                    customSearchOption.style.display = this.checked ? 'none' : '';
                }
                // 如果当前选中的是自定义搜索且被隐藏，切换到百度
                if (this.checked && document.getElementById('engineSelect').value === 'customSearch') {
                    document.getElementById('engineSelect').value = 'baidu';
                    localStorage.setItem('selectedEngine', 'baidu');
                }
            };
        }
    }, 10);
    
    if (customSearches.length === 0) {
    } else {
        // 按order排序
        customSearches.sort(function(a, b) {
            return a.order - b.order;
        });
        
        for (var i = 0; i < customSearches.length; i++) {
            var item = customSearches[i];
            var order = item.order;
            var name = item.name;
            var url = item.url;
            
            html += '<div style="display: table; width: 100%; padding: 8px 0; border-bottom: 1px solid #eee;">';
            html += '<span style="display: table-cell; vertical-align: middle; text-align: left;"><strong>' + order + '.</strong> ' + name + '</span>';
            html += '<span style="display: table-cell; vertical-align: middle; text-align: right; white-space: nowrap;">';

            // 修改order按钮
            html += '<button onclick="var btn=this; var newOrder=prompt(\'修改排序ID\', this.getAttribute(\'data-order\')); if(newOrder!==null && !isNaN(newOrder) && parseInt(newOrder)>0){var searches=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); var targetOrder=parseInt(newOrder); var currentOrder=' + order + '; var targetIndex=-1; var currentIndex=-1; for(var j=0;j<searches.length;j++){if(searches[j].order===targetOrder){targetIndex=j;} if(searches[j].order===currentOrder){currentIndex=j;}} if(targetIndex!==-1 && targetIndex!==currentIndex){if(confirm(\'排序ID \'+targetOrder+\' 已存在，是否替换？\')){var tempOrder=searches[currentIndex].order; searches[currentIndex].order=searches[targetIndex].order; searches[targetIndex].order=tempOrder; searches.sort(function(a,b){return a.order-b.order;}); localStorage.setItem(\'customSearches\', JSON.stringify(searches)); updateCustomSearchOptions(); location.reload(true); }}else if(targetIndex===-1){searches[currentIndex].order=targetOrder; searches.sort(function(a,b){return a.order-b.order;}); localStorage.setItem(\'customSearches\', JSON.stringify(searches)); updateCustomSearchOptions(); btn.setAttribute(\'data-order\', targetOrder); var parentRow=this.parentNode.parentNode; var leftSpan=null; for(var m=0;m<parentRow.childNodes.length;m++){if(parentRow.childNodes[m].nodeType===1&&parentRow.childNodes[m].tagName===\'SPAN\'){leftSpan=parentRow.childNodes[m];break;}} if(leftSpan){var nameText=\'\'; for(var n=0;n<leftSpan.childNodes.length;n++){if(leftSpan.childNodes[n].nodeType===3){nameText=leftSpan.childNodes[n].nodeValue;break;}} if(!nameText){nameText=leftSpan.innerHTML.replace(/<[^>]+>/g,\'\');} leftSpan.innerHTML=\'<strong>\'+targetOrder+\'.</strong> \'+nameText;} btn.onclick = function(){var btn2=this; var newOrder2=prompt(\'修改排序ID\', this.getAttribute(\'data-order\')); if(newOrder2!==null && !isNaN(newOrder2) && parseInt(newOrder2)>0){var searches2=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); var targetOrder2=parseInt(newOrder2); var currentOrder2=parseInt(btn2.getAttribute(\'data-order\')); var targetIndex2=-1; var currentIndex2=-1; for(var p=0;p<searches2.length;p++){if(searches2[p].order===targetOrder2){targetIndex2=p;} if(searches2[p].order===currentOrder2){currentIndex2=p;}} if(targetIndex2!==-1 && targetIndex2!==currentIndex2){if(confirm(\'排序ID \'+targetOrder2+\' 已存在，是否替换？\')){var tempOrder2=searches2[currentIndex2].order; searches2[currentIndex2].order=searches2[targetIndex2].order; searches2[targetIndex2].order=tempOrder2; searches2.sort(function(a,b){return a.order-b.order;}); localStorage.setItem(\'customSearches\', JSON.stringify(searches2)); updateCustomSearchOptions(); location.reload(true); }}else if(targetIndex2===-1){searches2[currentIndex2].order=targetOrder2; searches2.sort(function(a,b){return a.order-b.order;}); localStorage.setItem(\'customSearches\', JSON.stringify(searches2)); updateCustomSearchOptions(); btn2.setAttribute(\'data-order\', targetOrder2); var parentRow2=btn2.parentNode.parentNode; var leftSpan2=null; for(var r=0;r<parentRow2.childNodes.length;r++){if(parentRow2.childNodes[r].nodeType===1&&parentRow2.childNodes[r].tagName===\'SPAN\'){leftSpan2=parentRow2.childNodes[r];break;}} if(leftSpan2){var nameText2=\'\'; for(var s=0;s<leftSpan2.childNodes.length;s++){if(leftSpan2.childNodes[s].nodeType===3){nameText2=leftSpan2.childNodes[s].nodeValue;break;}} if(!nameText2){nameText2=leftSpan2.innerHTML.replace(/<[^>]+>/g,\'\');} leftSpan2.innerHTML=\'<strong>\'+targetOrder2+\'.</strong> \'+nameText2;} btn2.onclick = arguments.callee; }}}; } }" style="background: #ffffff; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px; margin-right: 5px; cursor: pointer; font-size: 12px;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#ffffff\'" data-order="' + order + '"><i class="fa fa-th-list"></i></button>';
            
            // 修改名称按钮
            html += '<button onclick="var btn=this; var newName=prompt(\'修改搜索引擎名称\', this.getAttribute(\'data-name\')); if(newName!==null){var searches=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); for(var j=0;j<searches.length;j++){if(searches[j].order===' + order + '){searches[j].name=newName;break;}} localStorage.setItem(\'customSearches\', JSON.stringify(searches)); updateCustomSearchOptions(); btn.setAttribute(\'data-name\', newName); var parentSpan=this.parentNode.parentNode; var leftSpan=null; for(var k=0;k<parentSpan.childNodes.length;k++){if(parentSpan.childNodes[k].nodeType===1&&parentSpan.childNodes[k].tagName===\'SPAN\'){leftSpan=parentSpan.childNodes[k];break;}} if(leftSpan){leftSpan.innerHTML=\'<strong>' + order + '.</strong> \'+newName;} btn.onclick = function(){var btn2=this; var newName2=prompt(\'修改搜索引擎名称\', this.getAttribute(\'data-name\')); if(newName2!==null){var searches2=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); for(var m=0;m<searches2.length;m++){if(searches2[m].order===' + order + '){searches2[m].name=newName2;break;}} localStorage.setItem(\'customSearches\', JSON.stringify(searches2)); updateCustomSearchOptions(); btn2.setAttribute(\'data-name\', newName2); var parentSpan2=btn2.parentNode.parentNode; var leftSpan2=null; for(var n=0;n<parentSpan2.childNodes.length;n++){if(parentSpan2.childNodes[n].nodeType===1&&parentSpan2.childNodes[n].tagName===\'SPAN\'){leftSpan2=parentSpan2.childNodes[n];break;}} if(leftSpan2){leftSpan2.innerHTML=\'<strong>' + order + '.</strong> \'+newName2;} btn2.onclick = arguments.callee; }}; }" style="background: #ffffff; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px; margin-right: 5px; cursor: pointer; font-size: 12px;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#ffffff\'" data-name="' + name.replace(/"/g, '&quot;') + '"><i class="fa fa-tags"></i></button>';
            
            // 修改网址按钮
            html += '<button onclick="var btn=this; var newUrl=prompt(\'修改搜索引擎网址 (使用{keywords}作为占位符)\', \'' + url.replace(/'/g, "\\'") + '\'); if(newUrl!==null && newUrl.indexOf(\'{keywords}\')!==-1){var searches=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); for(var j=0;j<searches.length;j++){if(searches[j].order===' + order + '){searches[j].url=newUrl;break;}} localStorage.setItem(\'customSearches\', JSON.stringify(searches)); updateCustomSearchOptions(); btn.setAttribute(\'data-url\', newUrl); btn.onclick = function(){var btn2=this; var newUrl2=prompt(\'修改搜索引擎网址 (使用{keywords}作为占位符)\', this.getAttribute(\'data-url\')); if(newUrl2!==null && newUrl2.indexOf(\'{keywords}\')!==-1){var searches2=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); for(var k=0;k<searches2.length;k++){if(searches2[k].order===' + order + '){searches2[k].url=newUrl2;break;}} localStorage.setItem(\'customSearches\', JSON.stringify(searches2)); updateCustomSearchOptions(); btn2.setAttribute(\'data-url\', newUrl2); btn2.onclick = arguments.callee; }}; }" style="background: #ffffff; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px; margin-right: 5px; cursor: pointer; font-size: 12px;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#ffffff\'" data-url="' + url.replace(/"/g, '&quot;') + '"><i class="fa fa-pencil"></i></button>';
            
            // 删除按钮
            html += '<button onclick="var searches=JSON.parse(localStorage.getItem(\'customSearches\')||\'[]\'); var filtered=[]; for(var j=0;j<searches.length;j++){if(searches[j].order!==' + order + '){filtered.push(searches[j]);}} localStorage.setItem(\'customSearches\', JSON.stringify(filtered)); updateCustomSearchOptions(); this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);" style="background: #ffffff; border: 1px solid #ccc; border-radius: 3px; padding: 3px 8px; cursor: pointer; font-size: 12px;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'#ffffff\'"><i class="fa fa-remove"></i></button>';
            
            html += '</span>';
            html += '</div>';
        }
    }
    
    html += '</div>';
    showCustomAlert('自定义搜索列表', html);
});

// 更多设置折叠/展开功能（兼容所有浏览器）
(function() {
    // 获取需要控制的元素集合
    var container = document.getElementById('autoFillhttps');
    if (!container) return;
    
    // 收集所有需要隐藏/显示的元素
    var checkboxBlocks = [];
    var labelBtns = [];
    var textSelectWrappers = [];
    
    // 兼容低版本浏览器的获取元素方式
    var allElements = container.getElementsByTagName('*');
    for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        if (el.id === 'showMoreCheckboxBlock') {
            checkboxBlocks.push(el);
        } else if (el.id === 'showMoreLabelBtns') {
            labelBtns.push(el);
        } else if (el.className === 'text-select-wrapper') {
            textSelectWrappers.push(el);
        }
    }
    
    // 合并所有需要控制的元素
    var moreSettingsItems = checkboxBlocks.concat(labelBtns).concat(textSelectWrappers);
    
    // 展开/收起函数
    function toggleMoreSettings(show) {
        for (var i = 0; i < moreSettingsItems.length; i++) {
            moreSettingsItems[i].style.display = show ? 'inline-block' : 'none';
        }
        // 处理特殊的内联块元素显示
        if (show) {
            for (var i = 0; i < labelBtns.length; i++) {
                // 某些label可能需要特殊处理
                if (labelBtns[i].style.display === 'none') {
                    labelBtns[i].style.display = 'inline-block';
                }
            }
        }
    }
    
    // 获取按钮元素
    var toggleBtn = document.getElementById('showMoreSettingsBtn');
    if (!toggleBtn) return;
    
    // 从localStorage读取保存的状态
    var isExpanded = false;
    try {
        var savedState = localStorage.getItem('moreSettingsExpanded');
        if (savedState === 'true') {
            isExpanded = true;
        } else if (savedState === 'false') {
            isExpanded = false;
        } else if (savedState === null) {
            // 首次使用，默认收起
            isExpanded = false;
            localStorage.setItem('moreSettingsExpanded', 'false');
        }
    } catch(e) {
        // 兼容不支持localStorage的情况
        isExpanded = false;
    }
    
    // 根据保存的状态初始化显示
    if (isExpanded) {
        toggleMoreSettings(true);
        toggleBtn.textContent = '收起更多设置';
    } else {
        toggleMoreSettings(false);
        toggleBtn.textContent = '展开更多设置';
    }
    
    // 绑定点击事件（兼容所有浏览器）
    if (toggleBtn.addEventListener) {
        toggleBtn.addEventListener('click', function() {
            var currentState = localStorage.getItem('moreSettingsExpanded') === 'true';
            var newState = !currentState;
            
            if (newState) {
                toggleMoreSettings(true);
                this.textContent = '收起更多设置';
            } else {
                toggleMoreSettings(false);
                this.textContent = '展开更多设置';
            }
            
            try {
                localStorage.setItem('moreSettingsExpanded', newState ? 'true' : 'false');
            } catch(e) {}
        });
    } else if (toggleBtn.attachEvent) {
        toggleBtn.attachEvent('onclick', function() {
            var currentState = localStorage.getItem('moreSettingsExpanded') === 'true';
            var newState = !currentState;
            
            if (newState) {
                toggleMoreSettings(true);
                toggleBtn.textContent = '收起更多设置';
            } else {
                toggleMoreSettings(false);
                toggleBtn.textContent = '展开更多设置';
            }
            
            try {
                localStorage.setItem('moreSettingsExpanded', newState ? 'true' : 'false');
            } catch(e) {}
        });
    }
})();

// 清除所有设置功能
document.querySelector('label[for="clearAllSettingsBtn"]').addEventListener('click', function() {
    showCustomConfirm('确定要重置设置吗？此操作将清除所有已保存设置，并清除所有快捷链接和自定义搜索，请在进行此操作前备份本地数据。', function(result) {
        if (result) {
            // 生成6位随机数字
            var randomCode = '';
            for (var i = 0; i < 6; i++) {
                randomCode += Math.floor(Math.random() * 10);
            }
            
            var timeoutId = null;
            var originalTitle = null;
            
            // 存储原始的 showCustomModal 函数
            var originalShowCustomModal = window.showCustomModal;
            
            // 临时包装 showCustomModal 以实现延迟更新标题
            window.showCustomModal = function(title, currentValue, callback) {
                originalTitle = title;
                // 调用原始函数，标题先显示占位符
                originalShowCustomModal('请输入 ... 继续操作：', currentValue, function(inputText) {
                    // 恢复原始函数
                    window.showCustomModal = originalShowCustomModal;
                    if (timeoutId) clearTimeout(timeoutId);
                    if (callback) callback(inputText);
                });
                
                // 3秒后更新标题显示随机数字
                timeoutId = setTimeout(function() {
                    var modalP = document.querySelector('#userSelectModalDisabled p');
                    if (modalP && modalP.innerHTML.indexOf('...') !== -1) {
                        modalP.innerHTML = '请输入 <span style="color: #ff0000; font-weight: bold;">' + randomCode + '</span> 继续操作：';
                    }
                }, 3000);
            };
            
            // 调用修改后的 showCustomModal
            window.showCustomModal('请输入 ... 继续操作：', '', function(inputText) {
                // 恢复原始函数
                window.showCustomModal = originalShowCustomModal;
                if (timeoutId) clearTimeout(timeoutId);
                if (inputText && inputText === randomCode) {
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
    // IE中reload(true)可能有问题，使用标准reload
    try {
        window.location.reload();
    } catch(e) {
        window.location.href = window.location.href;
    }
}, 200);
        }
    });
}

// 导出链接功能
// 兼容 IE 所有版本及旧版浏览器正常导出文件
document.querySelector('label[for="exportLinksBtn"]').addEventListener('click', function() {
    var links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
    if (links.length === 0) {
        return;
    }
    
    var jsonContent = JSON.stringify(links, null, 2);
    
    // 生成带日期时间的文件名
    function getFormattedDateTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = (now.getMonth() + 1);
        var day = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        return year + padZero(month) + padZero(day) + '_' + padZero(hours) + padZero(minutes) + padZero(seconds);
    }
    
    var fileName = 'quick_links_' + getFormattedDateTime() + '.json';
    
    // 方法1：尝试使用 Blob（IE10+ 支持）
    var blobSupported = false;
    try {
        blobSupported = typeof Blob !== 'undefined' && typeof URL !== 'undefined';
    } catch(e) {
        blobSupported = false;
    }
    
    if (blobSupported) {
        try {
            var blob = new Blob([jsonContent], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            if (a.click) {
                a.click();
            } else if (a.fireEvent) {
                a.fireEvent('onclick');
            }
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            return;
        } catch(e) {}
    }
    
    // 方法2：IE9 及以下使用 msSaveBlob
    if (typeof navigator !== 'undefined' && navigator.msSaveBlob) {
        try {
            var blob = new Blob([jsonContent], { type: 'application/json' });
            navigator.msSaveBlob(blob, fileName);
            return;
        } catch(e) {}
    }
    
    // 方法3：使用 prompt 降级方案（所有浏览器通用）
    try {
        var fallbackMsg = '无法自动下载文件，请手动复制以下内容并保存为 ' + fileName + '：';
        if (confirm(fallbackMsg)) {
            prompt('请复制以下内容并保存为 ' + fileName, jsonContent);
        }
    } catch(e) {
        alert('导出失败：' + e.message);
    }
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

// ========== 时间链接功能（修复内存泄漏） ==========
var timeLinkElement = document.getElementById('85727544071588039023');
var timeLinkImage = null;
var timeLinkInterval = null;
var colonBlinkInterval = null;  // 【修复】冒号闪烁定时器变量提升到全局
var colonVisible = true;

// ========== 更新时间显示函数（修复内存泄漏） ==========
function updateTimeDisplay() {
    // 【修复】添加安全检测，防止定时器在元素不存在时继续运行
    if (!timeLinkElement) {
        // 重新获取元素
        timeLinkElement = document.getElementById('85727544071588039023');
        if (!timeLinkElement) {
            // 如果仍然不存在，停止定时器
            if (timeLinkInterval) {
                clearInterval(timeLinkInterval);
                timeLinkInterval = null;
            }
            return;
        }
    }
    
    // 检查是否启用了冒号闪烁
    var colonBlinkCheckbox = document.getElementById('colonBlinkCheckbox');
    var isColonBlinkEnabled = colonBlinkCheckbox ? colonBlinkCheckbox.checked : false;
    
    if (isColonBlinkEnabled) {
        updateTimeDisplayWithBlink();
    } else {
        if (!timeLinkElement) return;
        
        var now = new Date();
        var timeFormat = '24hours';
        try {
            timeFormat = localStorage.getItem('timeFormat') || '24hours';
        } catch(e) {}
        var timeStr;
        
        var showSecondsCheckbox = document.getElementById('showSecondsCheckbox');
        var showSeconds = showSecondsCheckbox ? showSecondsCheckbox.checked : false;
        
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        if (timeFormat === '24hours') {
            var hours = now.getHours();
            var minutes = now.getMinutes();
            timeStr = padZero(hours) + ':' + padZero(minutes);
            if (showSeconds) {
                var seconds = now.getSeconds();
                timeStr += ':' + padZero(seconds);
            }
        } else {
            var hours = now.getHours();
            hours = hours % 12;
            hours = hours ? hours : 12;
            var minutes = now.getMinutes();
            timeStr = hours + ':' + padZero(minutes);
            if (showSeconds) {
                var seconds = now.getSeconds();
                timeStr += ':' + padZero(seconds);
            }
        }
        
        timeLinkElement.textContent = timeStr;
        var linkSize = '30px';
        try {
            linkSize = localStorage.getItem('linkSize') || '30px';
        } catch(e) {}
        timeLinkElement.style.fontSize = linkSize;
    }
}

// ========== 启动和停止时间更新（修复内存泄漏） ==========
function startTimeUpdate() {
    // 停止已有的定时器
    if (timeLinkInterval) {
        clearInterval(timeLinkInterval);
        timeLinkInterval = null;
    }
    // 启动新的定时器
    timeLinkInterval = setInterval(function() {
        updateTimeDisplay();
    }, 1000);
}

function stopTimeUpdate() {
    if (timeLinkInterval) {
        clearInterval(timeLinkInterval);
        timeLinkInterval = null;
    }
}

var savedShowTimeState = localStorage.getItem('showTimeChecked');
if (savedShowTimeState === 'true') {
    document.getElementById('showTimeCheckbox').checked = true;
    // 启用相关控件
    document.getElementById('showSecondsCheckbox').disabled = false;
    document.getElementById('colonBlinkCheckbox').disabled = false;
    document.getElementById('timeFormatSelect').disabled = false;
    
    // Safari 5 兼容：延迟执行时间链接显示，确保 DOM 完全加载
    setTimeout(function() {
        updateTimeDisplay();
        if (document.getElementById('showTimeCheckbox') && document.getElementById('showTimeCheckbox').checked) {
            // 保存原始图片链接（如果有）
            var savedLinkImage = localStorage.getItem('linkImage');
            if (savedLinkImage) {
                localStorage.setItem('timeLinkOriginalImage', savedLinkImage);
                localStorage.removeItem('linkImage');
            }
            // 显示时间链接
            var timeLinkElement = document.getElementById('85727544071588039023');
            if (timeLinkElement) {
                timeLinkElement.innerHTML = '';
                // 开始更新时间
                function updateTimeDisplay() {
                    if (!timeLinkElement) return;
                    var now = new Date();
                    var timeFormat = localStorage.getItem('timeFormat') || '24hours';
                    var showSeconds = document.getElementById('showSecondsCheckbox') && document.getElementById('showSecondsCheckbox').checked;
                    var hours = now.getHours();
                    var minutes = now.getMinutes();
                    function pad(n) { return (n < 10 ? '0' : '') + n; }
                    var timeStr = '';
                    if (timeFormat === '24hours') {
                        timeStr = pad(hours) + ':' + pad(minutes);
                        if (showSeconds) timeStr += ':' + pad(now.getSeconds());
                    } else {
                        var h = hours % 12;
                        h = h ? h : 12;
                        timeStr = h + ':' + pad(minutes);
                        if (showSeconds) timeStr += ':' + pad(now.getSeconds());
                    }
                    timeLinkElement.textContent = timeStr;
                    var linkSize = localStorage.getItem('linkSize') || '30px';
                    timeLinkElement.style.fontSize = linkSize;
                }
                updateTimeDisplay();
                if (window.timeLinkInterval) clearInterval(window.timeLinkInterval);
                window.timeLinkInterval = setInterval(updateTimeDisplay, 1000);
            }
        }
        
        var savedColonBlinkState = localStorage.getItem('colonBlinkChecked');
        if (savedColonBlinkState === 'true') {
            document.getElementById('colonBlinkCheckbox').checked = true;
            // 如果时间链接已启用，启动闪烁效果
            if (document.getElementById('showTimeCheckbox').checked) {
                startColonBlink();
            }
        }
        
        var savedShowSecondsState = localStorage.getItem('showSecondsChecked');
        if (savedShowSecondsState === 'true') {
            document.getElementById('showSecondsCheckbox').checked = true;
            // 如果时间链接已启用且勾选显示秒数，立即显示秒数
            if (document.getElementById('showTimeCheckbox').checked) {
                updateTimeDisplay(); // 立即更新时间显示
            }
        }
    }, 0);
}

// ========== 冒号闪烁效果（修复内存泄漏） ==========
function startColonBlink() {
    // 【修复】停止已有的定时器
    if (colonBlinkInterval) {
        clearInterval(colonBlinkInterval);
        colonBlinkInterval = null;
    }
    
    colonVisible = true;
    // 【修复】使用安全的定时器，添加 try-catch
    colonBlinkInterval = setInterval(function() {
        try {
            colonVisible = !colonVisible;
            updateTimeDisplayWithBlink();
        } catch(e) {
            // 出错时停止闪烁
            if (colonBlinkInterval) {
                clearInterval(colonBlinkInterval);
                colonBlinkInterval = null;
            }
        }
    }, 1000);
}

function stopColonBlink() {
    if (colonBlinkInterval) {
        clearInterval(colonBlinkInterval);
        colonBlinkInterval = null;
    }
    colonVisible = true;
    // 【修复】添加安全检测，避免在元素不存在时调用
    if (typeof updateTimeDisplayWithBlink === 'function') {
        updateTimeDisplayWithBlink();
    }
}

// 带闪烁效果的时间显示函数
function updateTimeDisplayWithBlink() {
    if (!timeLinkElement) return;
    
    var now = new Date();
    var timeFormat = localStorage.getItem('timeFormat') || '24hours';
    var timeStr;
    
    // 检查是否显示秒数
    var showSeconds = document.getElementById('showSecondsCheckbox').checked;
    
    // 创建带透明度的冒号
    var colonOpacity = colonVisible ? '1' : '0';
    
    if (timeFormat === '24hours') {
        // 24小时制
        var hours = now.getHours();
        var minutes = now.getMinutes();
        
        // 兼容低版本浏览器的补零函数
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        if (showSeconds) {
            var seconds = now.getSeconds();
            // 使用HTML包含带样式的冒号（两个冒号都闪烁）
            timeStr = padZero(hours) + '<span style="opacity:' + colonOpacity + ';">:</span>' + 
                     padZero(minutes) + '<span style="opacity:' + colonOpacity + ';">:</span>' + 
                     padZero(seconds);
        } else {
            // 使用HTML包含带样式的冒号
            timeStr = padZero(hours) + '<span style="opacity:' + colonOpacity + ';">:</span>' + padZero(minutes);
        }
    } else {
        // 12小时制（删除 AM/PM）
        var hours = now.getHours();
        hours = hours % 12;
        hours = hours ? hours : 12; // 0点显示为12
        var minutes = now.getMinutes();
        
        // 兼容低版本浏览器的补零函数
        function padZero(num) {
            return (num < 10 ? '0' : '') + num;
        }
        
        if (showSeconds) {
            var seconds = now.getSeconds();
            // 使用HTML包含带样式的冒号（两个冒号都闪烁）
            timeStr = hours + '<span style="opacity:' + colonOpacity + ';">:</span>' + 
                     padZero(minutes) + '<span style="opacity:' + colonOpacity + ';">:</span>' + 
                     padZero(seconds);
        } else {
            // 使用HTML包含带样式的冒号
            timeStr = hours + '<span style="opacity:' + colonOpacity + ';">:</span>' + padZero(minutes);
        }
    }
    
    timeLinkElement.innerHTML = timeStr;
    timeLinkElement.style.fontSize = localStorage.getItem('linkSize') || '30px';
}

// ========== 显示时间链接（修复内存泄漏） ==========
function showTimeLink() {
    if (!timeLinkElement) {
        timeLinkElement = document.getElementById('85727544071588039023');
        if (!timeLinkElement) return;
    }
    
    // 【修复】先停止所有已有的定时器
    if (timeLinkInterval) {
        clearInterval(timeLinkInterval);
        timeLinkInterval = null;
    }
    if (colonBlinkInterval) {
        clearInterval(colonBlinkInterval);
        colonBlinkInterval = null;
    }
    
    // 保存当前图片链接（如果有）
    try {
        var savedLinkImage = localStorage.getItem('linkImage');
        if (savedLinkImage) {
            localStorage.setItem('timeLinkOriginalImage', savedLinkImage);
            localStorage.removeItem('linkImage');
        }
    } catch(e) {}
    
    // 清除图片显示
    timeLinkElement.innerHTML = '';
    
    // 开始更新时间
    updateTimeDisplay();
    
    // 检查是否启用了冒号闪烁
    var colonBlinkCheckbox = document.getElementById('colonBlinkCheckbox');
    var isColonBlinkEnabled = colonBlinkCheckbox ? colonBlinkCheckbox.checked : false;
    if (isColonBlinkEnabled) {
        startColonBlink();
    }
    
    // 【修复】使用安全的定时器
    timeLinkInterval = setInterval(function() {
        try {
            updateTimeDisplay();
        } catch (e) {
            // 出错时停止定时器
            if (timeLinkInterval) {
                clearInterval(timeLinkInterval);
                timeLinkInterval = null;
            }
        }
    }, 1000);
}

// ========== 隐藏时间链接（修复内存泄漏） ==========
function hideTimeLink() {
    if (!timeLinkElement) {
        timeLinkElement = document.getElementById('85727544071588039023');
        if (!timeLinkElement) return;
    }
    
    // 【修复】停止所有定时器
    if (timeLinkInterval) {
        clearInterval(timeLinkInterval);
        timeLinkInterval = null;
    }
    
    stopColonBlink();
    
    // 恢复图片或文字
    try {
        var savedOriginalImage = localStorage.getItem('timeLinkOriginalImage');
        if (savedOriginalImage) {
            var linkSize = '30px';
            try {
                linkSize = localStorage.getItem('linkSize') || '30px';
            } catch(e) {}
            timeLinkElement.innerHTML = '<img src="' + savedOriginalImage + '" style="width: auto; height: auto; max-width: ' + linkSize + '; max-height: ' + linkSize + '; display: block; left: 0; right: 0; margin: 0 auto;">';
            localStorage.setItem('linkImage', savedOriginalImage);
            localStorage.removeItem('timeLinkOriginalImage');
            var linkColorValueSpan = document.getElementById('linkColorValue');
            if (linkColorValueSpan) linkColorValueSpan.textContent = 'Image';
        } else {
            var savedLinkName = 'Baidu.com';
            try {
                savedLinkName = localStorage.getItem('linkName') || 'Baidu.com';
            } catch(e) {}
            timeLinkElement.textContent = savedLinkName;
            var linkColor = '#0000ee';
            try {
                linkColor = localStorage.getItem('linkColor') || '#0000ee';
            } catch(e) {}
            timeLinkElement.style.color = linkColor;
            var linkSize = '30px';
            try {
                linkSize = localStorage.getItem('linkSize') || '30px';
            } catch(e) {}
            timeLinkElement.style.fontSize = linkSize;
        }
    } catch(e) {}
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
        // 检查是否启用了冒号闪烁
        var isColonBlinkEnabled = document.getElementById('colonBlinkCheckbox').checked;
        if (isColonBlinkEnabled) {
            updateTimeDisplayWithBlink();
        } else {
            updateTimeDisplay();
        }
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
    
    // 根据时间链接状态控制相关控件的disabled状态
    document.getElementById('showSecondsCheckbox').disabled = !this.checked;
    document.getElementById('colonBlinkCheckbox').disabled = !this.checked;
    document.getElementById('timeFormatSelect').disabled = !this.checked;
    
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

// 监听colonBlinkCheckbox变化
document.getElementById('colonBlinkCheckbox').addEventListener('change', function() {
    localStorage.setItem('colonBlinkChecked', this.checked);
    
    // 检查时间链接是否启用
    var isTimeLinkEnabled = document.getElementById('showTimeCheckbox').checked;
    
    if (this.checked && isTimeLinkEnabled) {
        startColonBlink();
    } else {
        stopColonBlink();
        // 更新显示以确保冒号可见
        updateTimeDisplay();
    }
});

// 监听showSecondsCheckbox变化
document.getElementById('showSecondsCheckbox').addEventListener('change', function() {
    localStorage.setItem('showSecondsChecked', this.checked);
    
    // 如果时间链接已启用，立即更新时间显示
    if (document.getElementById('showTimeCheckbox').checked) {
        updateTimeDisplay();
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

// iFramePlus 编辑所有窗口尺寸功能
var iframePlusSizeBtn = document.getElementById('iframePlusSizeBtn');
if (iframePlusSizeBtn) {
    var sizeLabel = iframePlusSizeBtn.querySelector('label');
    if (sizeLabel) {
        sizeLabel.onclick = function() {
            // 修复窗口检测逻辑，使用 window.iframePlusWindows
            var currentWindows = window.iframePlusWindows || [];
            var currentWidth = localStorage.getItem('iframePlusWidth') || '390px';
            var currentHeight = localStorage.getItem('iframePlusHeight') || '500px';
            showCustomDoubleInput(
                '设置所有iFrame窗口尺寸',
                '输入窗口宽度（如 390px 或 800px）',
                '输入窗口高度（如 400px 或 500px）',
                currentWidth,
                currentHeight,
                function(width, height) {
                    if (width !== null && height !== null) {
                        var isMobile = typeof isMobileAndroidApple === 'function' ? isMobileAndroidApple() : false;
                        var defaultWidth = isMobile ? '98%' : '390px';
                        var defaultHeight = isMobile ? '500px' : '500px';
                        
                        if (width === '') {
                            width = defaultWidth;
                        }
                        if (height === '') {
                            height = defaultHeight;
                        }
                        
                        // 更新所有现有窗口的尺寸
                        for (var i = 0; i < currentWindows.length; i++) {
                            var wrapper = currentWindows[i].wrapper;
                            var iframe = currentWindows[i].iframe;
                            if (wrapper) {
                                wrapper.style.width = width;
                            }
                            if (iframe) {
                                iframe.style.height = height;
                            }
                        }
                        
                        // 保存尺寸到 localStorage
                        localStorage.setItem('iframePlusWidth', width);
                        localStorage.setItem('iframePlusHeight', height);
                    }
                }
            );
        };
    }
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
    
    // 提取设备版本号（保留）
    var deviceVersion = "Unknown";
    
    if (/Android/.test(userAgent)) {
        deviceVersion = userAgent.match(/Android\s([0-9\.]+)/) ? "Android " + userAgent.match(/Android\s([0-9\.]+)/)[1] : "Android";
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        deviceVersion = userAgent.match(/OS\s([0-9_]+)/) ? "iOS " + userAgent.match(/OS\s([0-9_]+)/)[1].replace(/_/g, '.') : "iOS";
    } else if (/Windows/.test(userAgent)) {
        var winMatch = userAgent.match(/Windows\s+(NT\s+[0-9\.]+)(?:\s*;\s*([^;)]+))?/);
        deviceVersion = winMatch ? "Windows " + winMatch[1].replace('NT ', '') : "Windows";
    } else if (/Macintosh/.test(userAgent)) {
        deviceVersion = userAgent.match(/Mac\sOS\sX\s([0-9_]+)/) ? "macOS " + userAgent.match(/Mac\sOS\sX\s([0-9_]+)/)[1].replace(/_/g, '.') : "macOS";
    } else if (/Linux/.test(userAgent)) {
        var distroMatch = userAgent.match(/Linux\s+(?:x86_64|i686|arm|aarch64|ppc64le|s390x)?(?:\s*;\s*([^;)]+))?/);
        if (distroMatch && distroMatch[1]) {
            deviceVersion = "Linux (" + distroMatch[1] + ")";
        } else {
            deviceVersion = "Linux";
        }
    }
    
    return {
        name: browserName,
        version: version,
        deviceVersion: deviceVersion
    };
}

var engineType = 'Unknown', engineVersion = 'Unknown';
var ua = navigator.userAgent;
// 检测 WebKit 内核 (Chrome, Safari, Edge, 旧版 Opera 等)
var webkitMatch = ua.match(/AppleWebKit\/([\d.]+)/);
if (webkitMatch) {
    engineType = 'WebKit';
    engineVersion = webkitMatch[1];
}
// 检测 Gecko 内核 (Firefox)
var geckoMatch = ua.match(/Gecko\/([\d.]+)/);
if (geckoMatch && ua.indexOf('KHTML') === -1) {
    engineType = 'Gecko';
    engineVersion = geckoMatch[1];
}
// 检测 Trident 内核 (IE)
var tridentMatch = ua.match(/Trident\/([\d.]+)/);
if (tridentMatch) {
    engineType = 'Trident';
    engineVersion = tridentMatch[1];
}
// 检测 Presto 内核 (旧版 Opera)
if (ua.indexOf('Presto') !== -1) {
    var prestoMatch = ua.match(/Presto\/([\d.]+)/);
    engineType = 'Presto';
    engineVersion = prestoMatch ? prestoMatch[1] : 'Unknown';
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
        
        // 显示关于信息的函数
        var showBrowserAlert = function() {
            var browserInfo = getBrowserInfo();
            var tips = [
                '如果你电脑点击浏览器信息没有弹出这个弹窗，你换鼠标右键点击试试',
                '如果你的是移动设备不能鼠标右键的话，可以在鼠标右键的地方长按就可以了',
                '如果想用快捷键关闭双输入框弹窗的话，按 Shift + Esc 可以关闭',
                '你可以按 Alt + N 可以快速切换下一个搜索引擎，向反按 Alt + P 可以切换上一个搜索引擎',
                '如果你想复制一言的话，鼠标右键一言即可复制',
                '如果要停用搜索框的话，请在停用输入框弹出弹窗认真阅读此提示，你会知道怎么恢复搜索框的',
                '你可以自定义设置你喜欢的搜索主页',
                '有些搜索引擎搜索后会记录你的搜索历史记录，如果你不是无痕浏览模式又只是删除浏览器搜索浏览记录或本站历史搜索历史，请检查你使用过的搜索引擎并删除搜索引擎记录的搜索历史记录。如果不想留搜索浏览历史记录建议使用无痕模式搜索(也有部分浏览器写为隐身模式、隐私浏览等)',
                '有些搜索引擎并不适应手机或电脑，这就是为什么禁用部分搜索引擎的原因了',
                '部分外国网站在中国大陆可能无法访问，所以需要代理网络'
             ];
            if (!window._lastTipIndex) window._lastTipIndex = -1;
            var newIndex;
            do { newIndex = Math.floor(Math.random() * 10); } while (newIndex === window._lastTipIndex && tips.length > 1);
            window._lastTipIndex = newIndex;
            var randomTip = tips[newIndex];
            showCustomAlert('关于', '<div style="font-size: 15px; margin-top: 12px;">搜索Easy<br>' + '<p>网页版本号: v7.3<br></p>' + '<p>浏览器: ' + browserInfo.name + '<br></p>' + '<p>浏览器版本: ' + browserInfo.version + '<br></p>' + '<p>内核: ' + engineType + ' ' + engineVersion + '<br></p>' + '<p>系统版本: ' + browserInfo.deviceVersion + '<br></p>' + '<span style="font-weight: bold;">User-Agent: </span>' + navigator.userAgent + '<p><b>小提示: </b>' + randomTip + '<div>Github源码: <button onclick="window.open(&#39;https://github.com/wugdu27376/setsearchbox/&#39;, &#39;_blank&#39;);" style="float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">点击跳转</button></div><div style="margin-top: 20px;">扩展下载: <div style="display: inline-block; width: 100%; max-width: 150px; float: right;"><button onclick="window.location.href=&#39;https://wugdu27376.github.io/setsearchbox/plugin/soSuoEasy126071_Beta.zip&#39;" style="margin-left: 4px; float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">Beta</button><button onclick="window.location.href=&#39;https://wugdu27376.github.io/setsearchbox/plugin/soSuoEasy126069.zip&#39;" style="margin-left: 4px; float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">ZIP</button><button onclick="window.location.href=&#39;https://wugdu27376.github.io/setsearchbox/plugin/soSuoEasy126070.crx&#39;" style="margin-left: 4px; float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">CRX</button><button onclick="window.location.href=&#39;https://wugdu27376.github.io/setsearchbox/plugin/soSuoEasy126072.zip&#39;" style="margin-left: 4px; margin-top: 4px; float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">CRX-ZIP</button></div><!-- <div style="display: inline-block; margin-top: 20px; width: 100%;">Github源码: <button onclick="window.location.href=&#39;https://github.com/wugdu27376/setsearchbox/&#39;" style="float: right; cursor: pointer; -webkit-tap-highlight-color: transparent;">点击跳转</button></div> --></div>' + '</div>');
        };
        
        // 判断是否为移动端
        if (isMobileAndroidApple()) {
            // 移动端：点击显示
            displayElement.addEventListener('click', function() {
                showBrowserAlert();
            });
        } else {
            // 电脑端：右键显示
            displayElement.addEventListener('contextmenu', function(e) {
                e = e || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                showBrowserAlert();
                return false;
            });
        }
    }
};

// ========== Enter 键提交（兼容所有 IE 版本） ==========
(function() {
    var urlInput = document.getElementById('urlInput');
    var submitBtn = document.getElementById('submitBtn');
    
    if (!urlInput || !submitBtn) return;
    
    // 检测 IE 浏览器
    var isIE = false;
    var ieVersion = 0;
    var ua = navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        isIE = true;
        ieVersion = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        isIE = true;
        var rv = ua.indexOf('rv:');
        if (rv > 0) {
            ieVersion = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
    }
    
    // Enter 键处理函数
    function handleEnterKey(e) {
        // 获取事件对象（兼容 IE）
        e = e || window.event;
        
        // 获取按键码（兼容 IE）
        var keyCode = e.keyCode || e.which || e.charCode;
        
        // 检查是否按下了 Enter 键（13）
        if (keyCode === 13) {
            // 阻止默认行为（如表单提交）
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            
            // 获取输入框值
            var inputValue = urlInput.value;
            
            // 如果输入为空，不执行跳转
            if (inputValue === '' || inputValue === 'https://') {
                return false;
            }
            
            // 触发跳转按钮点击
            if (submitBtn.click) {
                submitBtn.click();
            } else if (submitBtn.fireEvent) {
                // IE 兼容：使用 fireEvent 触发点击
                submitBtn.fireEvent('onclick');
            }
            
            // 可选：失焦（IE 兼容）
            try {
                urlInput.blur();
            } catch(err) {}
            
            return false;
        }
        return true;
    }
    
    // 为不同 IE 版本添加事件监听
    if (urlInput.addEventListener) {
        // 现代浏览器（包括 IE9+）
        // 使用 keydown 而非 keypress，因为 IE8 及以下不支持 keypress
        urlInput.addEventListener('keydown', handleEnterKey);
    } else if (urlInput.attachEvent) {
        // IE8 及以下
        urlInput.attachEvent('onkeydown', handleEnterKey);
    } else {
        // 极旧浏览器回退方案
        urlInput.onkeydown = handleEnterKey;
    }
    
    // 额外修复：对于 IE 低版本，确保 input 框不会触发表单提交
    if (isIE && ieVersion <= 9) {
        // 阻止任何可能的表单自动提交
        var parentForm = urlInput.parentNode;
        while (parentForm && parentForm.tagName !== 'FORM') {
            parentForm = parentForm.parentNode;
        }
        if (parentForm && parentForm.tagName === 'FORM') {
            addEvent(parentForm, 'submit', function(e) {
                e = e || window.event;
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                return false;
            });
        }
    }
})();

// 添加快捷键切换搜索引擎（仅电脑端）
if (isDesktop()) {
    // 获取搜索引擎下拉框的可见选项（兼容所有浏览器）
    function getVisibleEngineOptions() {
        var engineSelect = document.getElementById('engineSelect');
        if (!engineSelect) return [];
        var options = engineSelect.options;
        var visibleOptions = [];
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            // 检查选项是否可见（非隐藏、非禁用、非空选项）
            var isHidden = false;
            try {
                isHidden = (opt.style.display === 'none') || 
                           (opt.parentNode && opt.parentNode.style.display === 'none') ||
                           (opt.disabled === true);
            } catch(e) {
                isHidden = opt.disabled === true;
            }
            if (!isHidden && opt.value && opt.value !== '') {
                visibleOptions.push({ index: i, value: opt.value });
            }
        }
        return visibleOptions;
    }
    
    document.addEventListener('keydown', function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        // 判断 Alt 键是否按下
        var altPressed = e.altKey === true;
        if (!altPressed) return;
        
        // 检查是否有模态框打开
        var modals = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
        var modalOpen = false;
        for (var i = 0; i < modals.length; i++) {
            if (modals[i].style.display !== 'none' && modals[i].parentNode) {
                modalOpen = true;
                break;
            }
        }
        if (modalOpen) return;
        
        // 搜索框隐藏时不处理
        var hideSearchCheckbox = document.getElementById('hideSearchContainerCheckbox');
        if (hideSearchCheckbox && hideSearchCheckbox.checked) return;
        
        var engineSelect = document.getElementById('engineSelect');
        if (!engineSelect) return;
        
        var visibleOptions = getVisibleEngineOptions();
        if (visibleOptions.length === 0) return;
        
        var currentValue = engineSelect.value;
        var currentIndex = -1;
        for (var i = 0; i < visibleOptions.length; i++) {
            if (visibleOptions[i].value === currentValue) {
                currentIndex = i;
                break;
            }
        }
        
        // 执行切换
        function performSwitch(step) {
            var newIndex = currentIndex + step;
            if (newIndex < 0) newIndex = visibleOptions.length - 1;
            if (newIndex >= visibleOptions.length) newIndex = 0;
            if (newIndex !== currentIndex && visibleOptions[newIndex]) {
                engineSelect.selectedIndex = visibleOptions[newIndex].index;
                // 触发 change 事件（兼容所有浏览器）
                if (document.createEvent) {
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', true, false);
                    engineSelect.dispatchEvent(evt);
                } else if (engineSelect.fireEvent) {
                    engineSelect.fireEvent('onchange');
                }
            }
        }
        
        // Alt+P (keyCode 80) 或 Alt+↑ (keyCode 38) 切换上一个搜索引擎
        if (keyCode === 80 || keyCode === 38) {
            e.preventDefault();
            performSwitch(-1);
            return false;
        }
        
        // Alt+N (keyCode 78) 或 Alt+↓ (keyCode 40) 切换下一个搜索引擎
        if (keyCode === 78 || keyCode === 40) {
            e.preventDefault();
            performSwitch(1);
            return false;
        }
        
        return true;
    });
}

// 添加localStorage检测函数
function isLocalStorageAvailable() {
    try {
        var test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// 全局错误处理（防止IE下个别错误导致页面功能失效）
window.onerror = function(msg, url, line, col, error) {
    // 只记录错误，不中断执行
    if (window.console && console.error) {
        console.error('捕获到错误: ' + msg + ' at ' + url + ':' + line);
    }
    // 返回true表示已处理，不触发浏览器默认错误处理
    return true;
};

// 在使用localStorage前检查
if (isLocalStorageAvailable()) {
    localStorage.setItem('key', 'value');
}

// 搜索建议键盘导航（仅电脑端）
if (isDesktop()) {
    var suggestionIndex = -1;
    var originalInputValue = '';

    function updateSuggestionSelection(index) {
        var items = searchSuggestions.getElementsByTagName('div');
        // 过滤掉清空历史记录列 ===
        var selectableItems = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].id !== 'suggestion_clear_history') {
                selectableItems.push(items[i]);
            }
        }
        for (var i = 0; i < items.length; i++) {
            items[i].style.backgroundColor = '';
            items[i].style.color = '';
            // === 通过 id 判断是否为访问建议 ===
            if (items[i].id === 'suggestion_visit_website') {
                items[i].style.backgroundColor = '#f8f8f8';
            }
            if (items[i].id === 'suggestion_clear_history') {
                items[i].style.backgroundColor = '#f8f8f8';
            }
        }
        // === 使用 selectableItems 计算索引 ===
        if (index >= 0 && index < selectableItems.length) {
            var selectedItem = selectableItems[index];
            selectedItem.style.backgroundColor = '#e0e0e0';
            selectedItem.style.color = '';
            var selectedText = selectedItem.textContent;
            if (selectedItem.id === 'suggestion_visit_website') {
                var urlPart = selectedText.replace(/^访问:\s*/, '');
                var altEnterIndex = urlPart.indexOf('Alt+Enter');
                if (altEnterIndex !== -1) {
                    urlPart = urlPart.substring(0, altEnterIndex).trim();
                }
                selectedText = urlPart;
            }
            document.getElementById('urlInput').value = selectedText;
        } else if (index === -1) {
            document.getElementById('urlInput').value = originalInputValue;
        }
    }
    
    document.getElementById('urlInput').addEventListener('keydown', function(e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        
        if (!document.getElementById('searchSuggestionsCheckbox').checked) return;
        if (searchSuggestions.style.display !== 'block') return;
        
        var items = searchSuggestions.getElementsByTagName('div');
        // === 过滤掉清空历史记录列 ===
        var selectableItems = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].id !== 'suggestion_clear_history') {
                selectableItems.push(items[i]);
            }
        }
        var selectableCount = selectableItems.length;
        
        if (selectableCount === 0) return;
        
        // 下箭头
        if (keyCode === 40) {
            e.preventDefault();
            if (suggestionIndex === -1) {
                originalInputValue = this.value;
            }
            // === 使用 selectableCount ===
            if (suggestionIndex < selectableCount - 1) {
                suggestionIndex++;
            } else {
                suggestionIndex = -1;
            }
            updateSuggestionSelection(suggestionIndex);
            return false;
        }
        
        // 上箭头
        if (keyCode === 38) {
            e.preventDefault();
            if (suggestionIndex === -1) {
                originalInputValue = this.value;
                // 未选择时按上键，直接选择到最后一项
                // === 使用 selectableCount ===
                suggestionIndex = selectableCount - 1;
            } else if (suggestionIndex > 0) {
                suggestionIndex--;
            } else {
                suggestionIndex = -1;
            }
            updateSuggestionSelection(suggestionIndex);
            return false;
        }
        
        // Enter 键确认选择
        if (keyCode === 13 && suggestionIndex !== -1) {
            e.preventDefault();
            // === 获取可选项中的选中项 ===
            if (suggestionIndex >= 0 && suggestionIndex < selectableCount) {
                var selectedItem = selectableItems[suggestionIndex];
                if (selectedItem) {
                    if (typeof selectedItem.click === 'function') {
                        selectedItem.click();
                    } else {
                        var clickEvent = document.createEvent('MouseEvents');
                        clickEvent.initEvent('click', true, true);
                        selectedItem.dispatchEvent(clickEvent);
                    }
                }
            }
            suggestionIndex = -1;
            searchSuggestions.style.display = 'none';
            return false;
        }
    });
    
    // 建议列表消失时重置索引
    var originalHideSuggestions = function() {
        suggestionIndex = -1;
        originalInputValue = '';
    };
    
    document.getElementById('urlInput').addEventListener('blur', function() {
        setTimeout(function() {
            if (searchSuggestions.style.display !== 'block') {
                suggestionIndex = -1;
                originalInputValue = '';
            }
        }, 150);
    });
    
    document.addEventListener('click', function(e) {
        var target = e.target || e.srcElement;
        if (target !== searchSuggestions && !searchSuggestions.contains(target) && target !== document.getElementById('urlInput')) {
            suggestionIndex = -1;
            originalInputValue = '';
        }
    });
}