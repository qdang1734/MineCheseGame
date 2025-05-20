import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { saveAuthToken } from '../lib/auth';

/**
 * Trang xử lý đăng nhập qua Telegram
 * Nhận token từ URL và lưu vào localStorage
 */
const Telegram = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực...');
  const navigate = (path: string) => window.location.href = path;
  const [location] = useLocation();
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Trích xuất token từ query string
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Không tìm thấy token xác thực.');
          return;
        }
        
        // Xác thực token với server
        const response = await fetch('/api/validate-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.valid) {
          // Lưu token vào localStorage để sử dụng sau này
          saveAuthToken(token);
          
          setStatus('success');
          setMessage(`Xin chào ${data.user.username}! Đăng nhập thành công.`);
          
          // Chuyển hướng về trang chính sau 2 giây
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Token không hợp lệ hoặc đã hết hạn.');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setStatus('error');
        setMessage('Đã có lỗi xảy ra khi xác thực. Vui lòng thử lại.');
      }
    };
    
    handleAuth();
  }, [navigate, location]);
  
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium mb-2">Đang xác thực...</h2>
          <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Đăng nhập thành công!</h2>
          <p className="text-gray-400 mb-4">{message}</p>
          <p className="text-sm text-gray-400">Bạn sẽ được chuyển hướng về trang chính...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Đăng nhập thất bại</h2>
          <p className="text-gray-400 mb-6">{message}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary/90 hover:bg-primary px-6 py-2 rounded-lg text-white font-medium"
          >
            Về trang chính
          </button>
        </>
      )}
    </div>
  );
};

export default Telegram;