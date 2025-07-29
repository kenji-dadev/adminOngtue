'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../Context/AuthContext'; 
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  const { login, register, user } = useAuth();
  const router = useRouter();

  // ถ้า user login แล้วให้ redirect ไปหน้าหลัก
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting...');
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Starting authentication process...', { isRegister, email });

    try {
      if (isRegister) {
        // Check if passwords match
        if (password !== confirmPassword) {
          setError('ລະຫັດຜ່ານບໍ່ຕົງກັນ');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('ລະຫັດຜ່ານຕ້ອງມີຢ່າງນ້ອຍ 6 ຕົວອັກສອນ');
          setLoading(false);
          return;
        }

        console.log('Attempting register...');
        const result = await register(email, password);
        console.log('Register successful:', result);
      } else {
        console.log('Attempting login...');
        const result = await login(email, password);
        console.log('Login successful:', result);
      }

      console.log('Authentication successful, redirecting...');
      
      // ใช้หลายวิธีในการ redirect เพื่อให้แน่ใจ
      setTimeout(() => {
        router.replace('/');
      }, 100);
      
      // Fallback ถ้า router ไม่ทำงาน
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      }, 1000);

    } catch (error) {
      console.error('Authentication error:', error);
      setError(getErrorMessage(error.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    console.log('Error code:', errorCode);
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'ບໍ່ພົບຜູ້ໃຊ້ນີ້ໃນລະບົບ';
      case 'auth/wrong-password':
        return 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ';
      case 'auth/email-already-in-use':
        return 'ອີເມວນີ້ຖືກໃຊ້ແລ້ວ';
      case 'auth/weak-password':
        return 'ລະຫັດຜ່ານອ່ອນແອເກີນໄປ (ຕ້ອງມີຢ່າງນ້ອຍ 6 ຕົວອັກສອນ)';
      case 'auth/invalid-email':
        return 'ອີເມວບໍ່ຖືກຕ້ອງ';
      case 'auth/user-disabled':
        return 'ບັນຊີຜູ້ໃຊ້ນີ້ຖືກປິດການໃຊ້ງານ';
      case 'auth/too-many-requests':
        return 'ມີການພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ';
      case 'auth/network-request-failed':
        return 'ບັນຫາການເຊື່ອມຕໍ່ເຄືອຂ່າຍ ກະລຸນາກວດສອບອິນເຕີເນັດ';
      case 'auth/invalid-credential':
        return 'ອີເມວຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ';
      default:
        return errorCode || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່';
    }
  };

  // ປ້ອງກັນການ render ຖ້າ user login ແລ້ວ
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">ກຳລັງເຂົ້າສູ່ລະບົບ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'ສ້າງບັນຊີໃໝ່' : 'ເຂົ້າສູ່ລະບົບ'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ລະບົບຈັດການຂໍ້ມູນພຣະ-ສາມະເນນ
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ອີເມວ
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="ກະລຸນາໃສ່ອີເມວ"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                ລະຫັດຜ່ານ
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="ກະລຸນາໃສ່ລະຫັດຜ່ານ"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  ຢືນຢັນລະຫັດຜ່ານ
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="ກະລຸນາຢືນຢັນລະຫັດຜ່ານ"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ກຳລັງດຳເນີນການ...
                </div>
              ) : (
                isRegister ? 'ສ້າງບັນຊີ' : 'ເຂົ້າສູ່ລະບົບ'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer transition-colors duration-200"
              disabled={loading}
            >
              {isRegister ? 'ມີບັນຊີແລ້ວ? ເຂົ້າສູ່ລະບົບ' : 'ຍັງບໍ່ມີບັນຊີ? ສ້າງບັນຊີໃໝ່'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
