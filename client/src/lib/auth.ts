/**
 * File quản lý xác thực trong ứng dụng
 */

// Lưu token xác thực từ Telegram
export const saveAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  
  // Thêm token vào tất cả các yêu cầu API
  configureApiRequests();
};

// Lấy token xác thực từ localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Xóa token xác thực (đăng xuất)
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Cài đặt mặc định cho tất cả các yêu cầu API để bao gồm token
export const configureApiRequests = () => {
  const token = getAuthToken();
  
  if (token) {
    // Cấu hình fetch API global (nếu cần)
    
    // Trong ứng dụng này, chúng ta chủ động thêm token khi cần thiết
    console.log('Auth token configured for API requests');
  }
};

// Kiểm tra nếu người dùng đã đăng nhập
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Gắn token vào headers cho các yêu cầu API
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  return {};
};