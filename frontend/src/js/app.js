const API_BASE_URL = 'http://localhost:8080/api/contacts';

class ContactManager {
    constructor() {
        this.contacts = [];
        this.isEditing = false;
        this.currentEditId = null;
        this.filteredContacts = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkSystemStatus();
        this.loadContacts();
    }

    bindEvents() {
        // 表单提交事件
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // 取消按钮事件
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // 搜索事件
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // 清除搜索
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            this.handleSearch('');
        });

        // 刷新按钮
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadContacts();
        });

        // 实时验证
        document.getElementById('phone').addEventListener('blur', (e) => {
            this.validatePhone(e.target.value);
        });

        document.getElementById('email').addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });
    }

    async checkSystemStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                this.updateSystemStatus(true, '系统连接正常');
            } else {
                this.updateSystemStatus(false, '系统连接异常');
            }
        } catch (error) {
            this.updateSystemStatus(false, '系统连接失败');
        }
    }

    updateSystemStatus(connected, message) {
        const statusElement = document.getElementById('system-status');
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('span:last-child');

        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = `系统状态: ${message}`;
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = `系统状态: ${message}`;
        }
    }

    async loadContacts() {
        try {
            this.showLoading();
            const response = await fetch(API_BASE_URL);
            if (response.ok) {
                this.contacts = await response.json();
                this.filteredContacts = [...this.contacts];
                this.renderContacts();
                this.updateContactCount();
                this.showNotification('联系人列表已刷新', 'success');
            } else {
                throw new Error('获取联系人失败');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('获取联系人失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleFormSubmit() {
        const contactData = this.getFormData();

        if (!this.validateForm(contactData)) {
            return;
        }

        try {
            this.showLoading();
            if (this.isEditing) {
                await this.updateContact(this.currentEditId, contactData);
            } else {
                await this.addContact(contactData);
            }
            this.resetForm();
            await this.loadContacts();
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('操作失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    validateForm(data) {
        this.clearErrors();

        let isValid = true;

        // 验证姓名
        if (!data.name.trim()) {
            this.showError('name', '姓名不能为空');
            isValid = false;
        } else if (data.name.trim().length < 2) {
            this.showError('name', '姓名至少需要2个字符');
            isValid = false;
        }

        // 验证电话
        if (!data.phone.trim()) {
            this.showError('phone', '电话号码不能为空');
            isValid = false;
        } else if (!/^1[3-9]\d{9}$/.test(data.phone)) {
            this.showError('phone', '请输入有效的手机号码');
            isValid = false;
        }

        // 验证邮箱
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            this.showError('email', '请输入有效的邮箱地址');
            isValid = false;
        }

        return isValid;
    }

    async validatePhone(phone) {
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/check-phone?phone=${encodeURIComponent(phone)}`);
            if (response.ok) {
                const result = await response.json();
                if (result.exists && (!this.isEditing || phone !== this.getCurrentContactPhone())) {
                    this.showError('phone', '该电话号码已存在');
                }
            }
        } catch (error) {
            console.error('Phone validation error:', error);
        }
    }

    getCurrentContactPhone() {
        if (!this.isEditing) return null;
        const contact = this.contacts.find(c => c.id === this.currentEditId);
        return contact ? contact.phone : null;
    }

    validateEmail(email) {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showError('email', '请输入有效的邮箱地址');
            return false;
        }
        return true;
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    async handleSearch(keyword) {
        if (!keyword.trim()) {
            this.filteredContacts = [...this.contacts];
            this.renderContacts();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`);
            if (response.ok) {
                this.filteredContacts = await response.json();
                this.renderContacts();
            }
        } catch (error) {
            console.error('Search error:', error);
            // 本地搜索作为备用方案
            this.filteredContacts = this.contacts.filter(contact =>
                contact.name.toLowerCase().includes(keyword.toLowerCase()) ||
                contact.phone.includes(keyword) ||
                (contact.email && contact.email.toLowerCase().includes(keyword.toLowerCase())) ||
                (contact.address && contact.address.toLowerCase().includes(keyword.toLowerCase()))
            );
            this.renderContacts();
        }
    }

    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim() || null,
            address: document.getElementById('address').value.trim() || null
        };
    }

    setFormData(contact) {
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('name').value = contact.name;
        document.getElementById('phone').value = contact.phone;
        document.getElementById('email').value = contact.email || '';
        document.getElementById('address').value = contact.address || '';
    }

    async addContact(contactData) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        const result = await response.json();

        if (response.ok) {
            this.showNotification('联系人添加成功！', 'success');
            return result;
        } else {
            throw new Error(result.error || '添加联系人失败');
        }
    }

    async updateContact(id, contactData) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        const result = await response.json();

        if (response.ok) {
            this.showNotification('联系人更新成功！', 'success');
            return result;
        } else {
            throw new Error(result.error || '更新联系人失败');
        }
    }

    async deleteContact(id) {
        if (!confirm('确定要删除这个联系人吗？此操作不可撤销。')) {
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('联系人删除成功！', 'success');
                await this.loadContacts();
            } else {
                throw new Error(result.error || '删除联系人失败');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('删除失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    startEditContact(contact) {
        this.isEditing = true;
        this.currentEditId = contact.id;

        document.getElementById('form-title-text').textContent = '编辑联系人';
        document.getElementById('submit-btn-text').textContent = '更新联系人';
        document.getElementById('cancel-btn').style.display = 'flex';

        this.setFormData(contact);

        // 滚动到表单区域
        document.querySelector('.form-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    cancelEdit() {
        this.isEditing = false;
        this.currentEditId = null;

        document.getElementById('form-title-text').textContent = '添加联系人';
        document.getElementById('submit-btn-text').textContent = '添加联系人';
        document.getElementById('cancel-btn').style.display = 'none';

        this.resetForm();
        this.clearErrors();
    }

    resetForm() {
        document.getElementById('contact-form').reset();
        document.getElementById('contact-id').value = '';
    }

    renderContacts() {
        const contactsList = document.getElementById('contacts-list');

        if (this.filteredContacts.length === 0) {
            contactsList.innerHTML = `
                <div class="no-contacts">
                    <h3>📭 暂无联系人</h3>
                    <p>点击上方的表单添加第一个联系人</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = this.filteredContacts.map(contact => `
            <div class="contact-item" data-contact-id="${contact.id}">
                <div class="contact-info">
                    <h3>${this.escapeHtml(contact.name)}</h3>
                    <div class="contact-details">
                        <div class="contact-detail">
                            <span>📱</span>
                            <span>${this.escapeHtml(contact.phone)}</span>
                        </div>
                        ${contact.email ? `
                        <div class="contact-detail">
                            <span>📧</span>
                            <span>${this.escapeHtml(contact.email)}</span>
                        </div>
                        ` : ''}
                        ${contact.address ? `
                        <div class="contact-detail">
                            <span>📍</span>
                            <span>${this.escapeHtml(contact.address)}</span>
                        </div>
                        ` : ''}
                        <div class="contact-detail">
                            <span>🕒</span>
                            <span>创建: ${this.formatDate(contact.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="contact-actions">
                    <button class="edit-btn" onclick="contactManager.startEditContact(${this.escapeHtml(JSON.stringify(contact))})">
                        <span>✏️</span>
                        编辑
                    </button>
                    <button class="delete-btn" onclick="contactManager.deleteContact(${contact.id})">
                        <span>🗑️</span>
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateContactCount() {
        document.getElementById('total-contacts').textContent = this.contacts.length;
    }

    formatDate(dateString) {
        if (!dateString) return '未知';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        if (typeof unsafe !== 'string') return unsafe.toString();
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showLoading() {
        document.getElementById('loading-indicator').style.display = 'flex';
        document.getElementById('submit-btn').disabled = true;
    }

    hideLoading() {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('submit-btn').disabled = false;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
}

// 初始化通讯录管理器
const contactManager = new ContactManager();

// 添加全局错误处理
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    contactManager.showNotification('发生未知错误，请刷新页面重试', 'error');
});