// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodos();
    }

    bindEvents() {
        // Form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });

        // Clear inputs when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.todo-item.editing')) {
                this.cancelAllEdits();
            }
        });
    }

    async loadTodos() {
        try {
            this.showLoading();
            const response = await fetch('/api/todos');
            
            if (!response.ok) {
                throw new Error('Failed to load todos');
            }
            
            this.todos = await response.json();
            this.renderTodos();
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showError('Failed to load todos. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async addTodo() {
        const titleInput = document.getElementById('todo-title');
        const descriptionInput = document.getElementById('todo-description');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title) {
            this.showError('Please enter a todo title');
            titleInput.focus();
            return;
        }

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create todo');
            }

            // Clear form
            titleInput.value = '';
            descriptionInput.value = '';
            
            // Reload todos to get updated list
            await this.loadTodos();
            
            this.showSuccess('Todo added successfully!');
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showError('Failed to add todo. Please try again.');
        }
    }

    async updateTodo(id, updates) {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            // Reload todos to get updated list
            await this.loadTodos();
            
            this.showSuccess('Todo updated successfully!');
        } catch (error) {
            console.error('Error updating todo:', error);
            this.showError('Failed to update todo. Please try again.');
        }
    }

    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this todo?')) {
            return;
        }

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            // Reload todos to get updated list
            await this.loadTodos();
            
            this.showSuccess('Todo deleted successfully!');
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showError('Failed to delete todo. Please try again.');
        }
    }

    async toggleTodo(id, done) {
        await this.updateTodo(id, { done });
    }

    async editTodo(id, title, description) {
        await this.updateTodo(id, { title, description });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.done);
            case 'completed':
                return this.todos.filter(todo => todo.done);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.done ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-header">
                    <div class="todo-checkbox ${todo.done ? 'checked' : ''}" 
                         onclick="app.toggleTodo('${todo.id}', ${!todo.done})">
                    </div>
                    <div class="todo-content">
                        <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                        ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="edit-btn" onclick="app.startEdit('${todo.id}')">
                            Edit
                        </button>
                        <button class="delete-btn" onclick="app.deleteTodo('${todo.id}')">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="todo-edit-form">
                    <div style="flex: 1;">
                        <input type="text" class="edit-title" value="${this.escapeHtml(todo.title)}" 
                               placeholder="Todo title">
                        <textarea class="edit-description" placeholder="Description (optional)" 
                                  style="margin-top: 10px; width: 100%;">${this.escapeHtml(todo.description || '')}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                        <button class="btn btn-primary" onclick="app.saveEdit('${todo.id}')">
                            Save
                        </button>
                        <button class="btn btn-secondary" onclick="app.cancelEdit('${todo.id}')">
                            Cancel
                        </button>
                    </div>
                </div>
            </li>
        `).join('');
    }

    startEdit(id) {
        this.cancelAllEdits();
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        todoItem.classList.add('editing');
        
        const titleInput = todoItem.querySelector('.edit-title');
        titleInput.focus();
        titleInput.select();
    }

    cancelEdit(id) {
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        todoItem.classList.remove('editing');
    }

    cancelAllEdits() {
        document.querySelectorAll('.todo-item.editing').forEach(item => {
            item.classList.remove('editing');
        });
    }

    async saveEdit(id) {
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        const title = todoItem.querySelector('.edit-title').value.trim();
        const description = todoItem.querySelector('.edit-description').value.trim();

        if (!title) {
            this.showError('Please enter a todo title');
            return;
        }

        todoItem.classList.remove('editing');
        await this.editTodo(id, title, description);
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('todo-list').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('todo-list').style.display = 'block';
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        if (type === 'error') {
            toast.style.background = '#e53e3e';
        } else if (type === 'success') {
            toast.style.background = '#38a169';
        } else {
            toast.style.background = '#3182ce';
        }
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key cancels all edits
    if (e.key === 'Escape') {
        if (window.app) {
            window.app.cancelAllEdits();
        }
    }
    
    // Enter key in title input submits form
    if (e.key === 'Enter' && e.target.id === 'todo-title') {
        e.preventDefault();
        document.getElementById('todo-form').dispatchEvent(new Event('submit'));
    }
});

// Add service worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // You can add a service worker here for offline functionality
    });
}