import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize UI components
    initializeFilters();
    await loadUsers();
    setupEventHandlers();
});

async function loadUsers() {
    try {
        const filterName = document.getElementById('filterCustomerName').value;
        const filterStatus = document.getElementById('filterCustomerStatus').value;
        
        const tableBody = document.getElementById('customersTableBody');
        const data = await api.getAllUsers(filterName, filterStatus);
        
        tableBody.innerHTML = data.users.map(user => `
            <tr>
                <td>${user.FullName}</td>
                <td>${user.PhoneNumber}</td>
                <td>${user.Email}</td>
                <td>
                    <span class="status-badge status-${user.Status.toLowerCase()}">
                        ${getStatusText(user.Status)}
                    </span>
                </td>
                <td>${user.TotalTickets || 0}</td>
                <td>${formatCurrency(user.TotalSpending || 0)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-view" onclick="viewUserDetails('${user.CustomerID}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-edit" onclick="editUser('${user.CustomerID}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-delete" onclick="deleteUser('${user.CustomerID}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Không thể tải danh sách người dùng');
    }
}

function initializeFilters() {
    const filterCustomerName = document.getElementById('filterCustomerName');
    const filterCustomerStatus = document.getElementById('filterCustomerStatus');
    
    filterCustomerName.addEventListener('input', debounce(() => loadUsers(), 500));
    filterCustomerStatus.addEventListener('change', () => loadUsers());
}

function setupEventHandlers() {
    // Add Customer Button
    document.getElementById('addCustomerBtn').addEventListener('click', () => {
        const modal = document.getElementById('addCustomerModal');
        document.getElementById('customerModalTitle').textContent = 'Thêm khách hàng mới';
        document.getElementById('customerId').value = '';
        document.getElementById('addCustomerForm').reset();
        modal.style.display = 'block';
    });

    // Close Modal Button
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('addCustomerModal').style.display = 'none';
    });

    // Cancel Button
    document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
        document.getElementById('addCustomerModal').style.display = 'none';
    });

    // Form Submit
    document.getElementById('addCustomerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerId = document.getElementById('customerId').value;
        const formData = {
            fullName: document.getElementById('customerName').value,
            phoneNumber: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            status: document.getElementById('customerStatus').value
        };

        try {
            if (customerId) {
                await api.updateUser(customerId, formData);
            } else {
                await api.createUser(formData);
            }
            
            document.getElementById('addCustomerModal').style.display = 'none';
            await loadUsers();
            showSuccess('Lưu thông tin khách hàng thành công!');
        } catch (error) {
            console.error('Error saving user:', error);
            showError('Không thể lưu thông tin khách hàng');
        }
    });
}

// User Actions
async function viewUserDetails(customerId) {
    try {
        const data = await api.getUserDetails(customerId);
        // TODO: Show user details modal with booking history
        console.log('User details:', data);
    } catch (error) {
        console.error('Error loading user details:', error);
        showError('Không thể tải thông tin chi tiết người dùng');
    }
}

async function editUser(customerId) {
    try {
        const data = await api.getUserDetails(customerId);
        const modal = document.getElementById('addCustomerModal');
        document.getElementById('customerModalTitle').textContent = 'Chỉnh sửa thông tin khách hàng';
        
        // Fill form with user data
        document.getElementById('customerId').value = customerId;
        document.getElementById('customerName').value = data.FullName;
        document.getElementById('customerPhone').value = data.PhoneNumber;
        document.getElementById('customerEmail').value = data.Email;
        document.getElementById('customerStatus').value = data.Status;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showError('Không thể tải thông tin người dùng');
    }
}

async function deleteUser(customerId) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        try {
            await api.deleteUser(customerId);
            await loadUsers();
            showSuccess('Xóa khách hàng thành công!');
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Không thể xóa khách hàng');
        }
    }
}

// Utility Functions
function getStatusText(status) {
    const statusMap = {
        'ACTIVE': 'Đang hoạt động',
        'INACTIVE': 'Ngưng hoạt động',
        'BLOCKED': 'Đã khóa'
    };
    return statusMap[status] || status;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showSuccess(message) {
    alert(message); // TODO: Replace with better notification system
}

function showError(message) {
    alert(message); // TODO: Replace with better notification system
}