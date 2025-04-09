// 视频生成API调用函数
async function generateVideo(imageFile, sourceFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('source', sourceFile);
    
    try {
        const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        return result.videoUrl;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// 页面初始化函数
function initializePage() {
    // 确保只有一个页面是活动的
    const pages = document.querySelectorAll('.page');
    if (pages.length > 0 && !document.querySelector('.page.active')) {
        pages[0].classList.add('active');
    }

    setupSidebar();
    setupNavigation();
    setupFileUploads();
    setupTextInput();
    setupLoginButton();
}

// 侧边栏相关功能
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const navContainer = document.querySelector('.nav-container');
    const existingToggle = document.querySelector('.navbar .sidebar-toggle');

    // 初始化侧边栏切换按钮
    const { sidebarToggle, toggleIcon } = initializeSidebarToggle(existingToggle, navContainer);

    // 设置侧边栏交互
    setupSidebarInteractions(sidebar, sidebarToggle, toggleIcon);
}

function initializeSidebarToggle(existingToggle, navContainer) {
    let sidebarToggle, toggleIcon;
    
    if (existingToggle) {
        sidebarToggle = existingToggle;
        toggleIcon = existingToggle.querySelector('i');
    } else {
        sidebarToggle = document.createElement('div');
        sidebarToggle.className = 'sidebar-toggle';
        toggleIcon = document.createElement('i');
        toggleIcon.className = 'fas fa-bars';
        sidebarToggle.appendChild(toggleIcon);
        navContainer.prepend(sidebarToggle);
    }
    
    return { sidebarToggle, toggleIcon };
}

function setupSidebarInteractions(sidebar, sidebarToggle, toggleIcon) {
    // 侧边栏切换功能
    sidebarToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
        toggleIcon.classList.replace(
            sidebar.classList.contains('active') ? 'fa-bars' : 'fa-times',
            sidebar.classList.contains('active') ? 'fa-times' : 'fa-bars'
        );
    });

    // 点击外部关闭侧边栏（仅移动端）
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 991 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            toggleIcon.classList.replace('fa-times', 'fa-bars');
        }
    });

    // 窗口大小变化处理
    function handleResize() {
        if (window.innerWidth > 991) {
            sidebar.classList.add('active');
            toggleIcon.classList.replace('fa-bars', 'fa-times');
        } else {
            const isActive = sidebar.classList.contains('active');
            toggleIcon.classList.replace(isActive ? 'fa-bars' : 'fa-times', 
                                       isActive ? 'fa-times' : 'fa-bars');
        }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
}

// 导航相关功能
function setupNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const homeLink = document.querySelector('.nav-links li a[data-page="page1"]');

    // 设置默认活动菜单项
    menuItems.forEach(item => {
        if (item.getAttribute('data-page') === 'page1' && !document.querySelector('.sidebar-menu li.active')) {
            item.classList.add('active');
        }
    });

    // 侧边栏菜单点击事件
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            switchPage(this.getAttribute('data-page'), this);
        });
    });

    // 导航栏Home链接点击事件
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            const correspondingMenuItem = document.querySelector('.sidebar-menu li[data-page="page1"]');
            if (correspondingMenuItem) {
                switchPage('page1', correspondingMenuItem);
            }
        });
    }
}

// 页面切换功能
function switchPage(pageId, menuItem) {
    // 更新活动菜单项样式
    if (menuItem) {
        document.querySelectorAll('.sidebar-menu li').forEach(i => i.classList.remove('active'));
        menuItem.classList.add('active');
    }
    
    // 切换页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // 如果是移动设备，点击后自动关闭侧边栏
    if (window.innerWidth <= 991) {
        const sidebar = document.querySelector('.sidebar');
        const toggleIcon = document.querySelector('.sidebar-toggle i');
        sidebar.classList.remove('active');
        toggleIcon.classList.replace('fa-times', 'fa-bars');
    }
}

// 文件上传功能
function setupFileUploads() {
    document.querySelectorAll('.upload-box').forEach(box => {
        const input = box.querySelector('input[type="file"]');
        const textElement = box.querySelector('p:not(.formats)') || box.querySelector('div');
        
        box.addEventListener('click', () => input.click());
        
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                textElement.textContent = e.target.files[0].name;
                box.style.borderColor = '#2ecc71';
                box.style.backgroundColor = '#e8f8f0';
            }
        });
    });
}

// 文本输入功能
function setupTextInput() {
    const presetItems = document.querySelectorAll('.preset-list li');
    const textarea = document.getElementById('action-description');
    const charCount = document.getElementById('char-count');
    const clearBtn = document.querySelector('.clear-btn');
    
    if (!textarea) return;

    // 清除按钮点击事件
    clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        textarea.value = '';
        updateCharCount();
        
        // 移除所有预设项的高亮
        presetItems.forEach(item => {
            item.style.backgroundColor = '#e8f4fd';
            item.style.color = '#3498db';
        });
    });

    // 点击预设项填充文本
    presetItems.forEach(item => {
        item.addEventListener('click', function() {
            const presetText = this.getAttribute('data-text');
            
            // 检查预设文本是否超50字
            if (presetText.length > 50) {
                alert('预设文本超过50字限制，已自动截断');
                textarea.value = presetText.substring(0, 50);
            } else {
                textarea.value = presetText;
            }
            
            updateCharCount();
            highlightPresetItem(this, presetItems);
        });
    });
    
    // 文本区域样式交互
    textarea.addEventListener('focus', () => {
        document.querySelector('.text-input-box').style.borderColor = '#3498db';
        document.querySelector('.text-input-box').style.backgroundColor = '#f8fafc';
    });
    
    textarea.addEventListener('blur', () => {
        document.querySelector('.text-input-box').style.borderColor = '#bdc3c7';
        document.querySelector('.text-input-box').style.backgroundColor = 'transparent';
    });
    
    // 实时字数统计和限制
    textarea.addEventListener('input', function() {
        updateCharCount();
        
        // 硬性限制50字（防止粘贴超长文本）
        if (this.value.length > 50) {
            this.value = this.value.substring(0, 50);
        }
    });
    
    // 更新字数统计
    function updateCharCount() {
        const currentLength = textarea.value.length;
        charCount.textContent = currentLength;
        
        // 接近限制时改变颜色
        if (currentLength >= 48) {
            charCount.style.color = '#e74c3c';
            charCount.classList.add('warning');
        } else {
            charCount.style.color = '#3498db';
            charCount.classList.remove('warning');
        }
    }
    
    // 高亮选中的预设项
    function highlightPresetItem(selectedItem, allItems) {
        selectedItem.style.backgroundColor = '#3498db';
        selectedItem.style.color = 'white';
        
        allItems.forEach(i => {
            if (i !== selectedItem) {
                i.style.backgroundColor = '#e8f4fd';
                i.style.color = '#3498db';
            }
        });
    }
    
    // 初始化显示
    updateCharCount();
}

// 登录按钮功能
function setupLoginButton() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            alert('登录功能将在后续版本开放');
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);