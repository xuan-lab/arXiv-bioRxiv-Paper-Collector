// ==UserScript==
// @name         arXiv & bioRxiv Paper Collector
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  一键收藏 arXiv 和 bioRxiv 论文 ID，查看、复制、删除和导出收藏列表
// @author       xiexuan
// @contact      xiexuan@kernel-dev.com
// @match        https://arxiv.org/abs/*
// @match        https://www.biorxiv.org/abs/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建收藏按钮
    const collectButton = document.createElement('button');
    collectButton.innerText = '收藏论文';
    collectButton.style.position = 'fixed';
    collectButton.style.top = '10px';
    collectButton.style.right = '10px';
    collectButton.style.zIndex = 9999;
    collectButton.style.padding = '10px 15px'; // 增加内边距
    collectButton.style.backgroundColor = '#4CAF50';
    collectButton.style.color = 'white';
    collectButton.style.border = 'none';
    collectButton.style.borderRadius = '5px';
    collectButton.style.cursor = 'pointer';
    collectButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    collectButton.style.transition = 'background-color 0.3s, transform 0.3s';

    collectButton.onmouseover = function() {
        collectButton.style.backgroundColor = '#45a049';
        collectButton.style.transform = 'scale(1.05)';
    };

    collectButton.onmouseout = function() {
        collectButton.style.backgroundColor = '#4CAF50';
        collectButton.style.transform = 'scale(1)';
    };

    document.body.appendChild(collectButton);

    collectButton.addEventListener('click', function() {
        let paperId = '';
        let paperTitle = document.querySelector('h1.title').innerText.trim(); // 获取论文标题
        let timestamp = new Date().toLocaleString(); // 获取当前时间

        // 移除标题中的公式和换行符
        paperTitle = paperTitle
            .replace(/(\$.*?\$|\$\$.*?\$\$)/g, '') // 移除以$或$$包围的内容
            .replace(/\r?\n/g, ' ') // 替换换行符为空格
            .trim(); // 去除首尾空格

        paperTitle = paperTitle.length > 30 ? paperTitle.substring(0, 27) + '...' : paperTitle; // 简化标题

        // 获取论文 ID
        if (window.location.hostname.includes("arxiv.org")) {
            const arxivMatch = window.location.pathname.match(/\/abs\/(.*)/);
            if (arxivMatch) {
                paperId = 'arXiv:' + arxivMatch[1];
            }
        } else if (window.location.hostname.includes("biorxiv.org")) {
            const bioRxivMatch = window.location.pathname.match(/\/abs\/(.*)/);
            if (bioRxivMatch) {
                paperId = 'bioRxiv:' + bioRxivMatch[1];
            }
        }

        // 检查并存储 ID 和标题
        if (paperId) {
            const existingPapers = localStorage.getItem('papers') || '';
            const newEntry = `${paperTitle} ${paperId} ${timestamp}\n`; // 格式化为 "论文名 ID 时间戳"
            if (!existingPapers.includes(paperId)) {
                localStorage.setItem('papers', existingPapers + newEntry);
                alert("已收藏论文: " + paperTitle);
            } else {
                alert("该论文已在收藏列表中！");
            }
        } else {
            alert("未找到有效的论文 ID！");
        }
    });

    // 创建查看收藏列表的按钮
    const viewButton = document.createElement('button');
    viewButton.innerText = '查看收藏';
    viewButton.style.position = 'fixed';
    viewButton.style.top = '50px';
    viewButton.style.right = '10px';
    viewButton.style.zIndex = 9999;
    viewButton.style.padding = '10px 15px'; // 增加内边距
    viewButton.style.backgroundColor = '#2196F3';
    viewButton.style.color = 'white';
    viewButton.style.border = 'none';
    viewButton.style.borderRadius = '5px';
    viewButton.style.cursor = 'pointer';
    viewButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    viewButton.style.transition = 'background-color 0.3s, transform 0.3s';

    viewButton.onmouseover = function() {
        viewButton.style.backgroundColor = '#1976D2';
        viewButton.style.transform = 'scale(1.05)';
    };

    viewButton.onmouseout = function() {
        viewButton.style.backgroundColor = '#2196F3';
        viewButton.style.transform = 'scale(1)';
    };

    document.body.appendChild(viewButton);

    viewButton.addEventListener('click', function() {
        const papers = localStorage.getItem('papers') || '';
        const paperList = papers.split('\n').filter(Boolean); // 过滤空行

        // 创建容器显示收藏列表
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = '#fff';
        container.style.padding = '20px';
        container.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        container.style.zIndex = 10000;
        container.style.width = '600px'; // 增加宽度
        container.style.height = '400px'; // 增加高度
        container.style.overflowY = 'scroll'; // 增加滚动条
        container.style.borderRadius = '8px'; // 增加圆角
        container.style.resize = 'both'; // 允许用户调整大小
        container.style.minWidth = '300px'; // 设置最小宽度
        container.style.minHeight = '200px'; // 设置最小高度

        // 添加标题栏以便拖动
        const titleBar = document.createElement('div');
        titleBar.innerText = '已收藏论文列表';
        titleBar.style.backgroundColor = '#2196F3';
        titleBar.style.color = 'white';
        titleBar.style.padding = '10px';
        titleBar.style.textAlign = 'center';
        titleBar.style.cursor = 'move';
        titleBar.style.borderTopLeftRadius = '8px';
        titleBar.style.borderTopRightRadius = '8px';

        container.appendChild(titleBar);

        // 添加拖动功能
        let isDragging = false;
        let offsetX, offsetY;

        titleBar.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            container.style.cursor = 'grabbing'; // 改变光标为抓手
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            container.style.cursor = 'move'; // 恢复光标
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                container.style.left = (e.clientX - offsetX) + 'px';
                container.style.top = (e.clientY - offsetY) + 'px';
            }
        });

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerText = '关闭';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '5px 10px';
        closeButton.onclick = function() {
            container.remove(); // 关闭弹窗
        };

        container.appendChild(closeButton);

        // 创建复选框列表
        if (paperList.length > 0) {
            paperList.forEach((entry, index) => {
                const entryContainer = document.createElement('div');
                entryContainer.style.display = 'flex';
                entryContainer.style.alignItems = 'center';
                entryContainer.style.marginBottom = '5px'; // 增加条目间距

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = index; // 存储索引
                checkbox.style.marginRight = '10px';

                const label = document.createElement('label');
                label.innerText = entry;
                label.style.color = '#555'; // 修改标签颜色
                label.style.wordBreak = 'break-word'; // 处理长标题
                label.style.flexGrow = '1'; // 使标签占满剩余空间

                entryContainer.appendChild(checkbox);
                entryContainer.appendChild(label);
                container.appendChild(entryContainer);
            });
        }

        // 创建按钮
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.marginTop = '10px';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';

        const deleteButton = document.createElement('button');
        deleteButton.innerText = '删除选中';
        deleteButton.style.backgroundColor = '#FF9800';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '5px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.padding = '10px 15px';
        deleteButton.onclick = function() {
            const selectedCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'));
            const indicesToRemove = selectedCheckboxes.map(checkbox => parseInt(checkbox.value)).sort((a, b) => b - a); // 降序排列以便于删除

            indicesToRemove.forEach(index => {
                paperList.splice(index, 1); // 删除选中的项
            });

            const updatedPapers = paperList.join('\n'); // 更新为新的纸张列表
            localStorage.setItem('papers', updatedPapers);
            container.remove(); // 关闭弹窗
            alert("已删除选中的论文！");
        };

        const copyButton = document.createElement('button');
        copyButton.innerText = '复制选中ID';
        copyButton.style.backgroundColor = '#4CAF50';
        copyButton.style.color = 'white';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '5px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.padding = '10px 15px';
        copyButton.onclick = function() {
            const selectedCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'));
            const idsToCopy = selectedCheckboxes.map(checkbox => {
                const entry = paperList[parseInt(checkbox.value)];
                return entry.split(' ').find(word => word.startsWith('arXiv:') || word.startsWith('bioRxiv:')); // 提取ID
            }).join('\n');
            navigator.clipboard.writeText(idsToCopy); 
            alert("已复制选中论文的ID到剪贴板");
        };

        const exportButton = document.createElement('button');
        exportButton.innerText = '导出选中';
        exportButton.style.backgroundColor = '#2196F3';
        exportButton.style.color = 'white';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '5px';
        exportButton.style.cursor = 'pointer';
        exportButton.style.padding = '10px 15px';
        exportButton.onclick = function() {
            const selectedCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'));
            const selectedPapers = selectedCheckboxes.map(checkbox => paperList[parseInt(checkbox.value)]).join('\n');

            if (selectedPapers) {
                const blob = new Blob([selectedPapers], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '选中的论文列表.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        };

        buttonsContainer.appendChild(deleteButton);
        buttonsContainer.appendChild(copyButton);
        buttonsContainer.appendChild(exportButton);
        container.appendChild(buttonsContainer);

        
        const about = document.createElement('div');
        about.style.marginTop = '20px';
        about.innerHTML = `<p style="text-align: center;">作者: xiexuan</p><p style="text-align: center;">联系方式: <a href="mailto:xiexuan@kernel-dev.com">xiexuan@kernel-dev.com</a></p>`;
        container.appendChild(about);

        document.body.appendChild(container);
    });
})();
