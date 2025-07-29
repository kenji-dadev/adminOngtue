
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ArrowRight, ArrowLeft, User, LogOut } from 'lucide-react';
import { useAuth } from '../Context/AuthContext'; 
export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'ຂໍ້ມູນພຣະ-ເນນ',
      icon: <User className="w-5 h-5" />,
      href: '/',
      isHome: true
    },
    {
      name: 'ປະຫວັດການຍົກຍ້າຍເຂົ້າ',
      icon: <ArrowRight className="w-5 h-5" />,
      href: '/move'
    },
    {
      name: 'ປະຫວັດການຍົກຍ້າຍອອກ',
      icon: <ArrowLeft className="w-5 h-5" />,
      href: '/history'
    }
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-900">
          <div className="flex items-center">
            <User className="w-8 h-8 text-white mr-3" />
            <span className="text-white text-lg font-bold">ລະບົບຂໍ້ມູນ</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 bg-blue-700 border-b border-blue-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">
                  {user.email}
                </p>
                <p className="text-xs text-blue-200">ຜູ້ໃຊ້ງານ</p>
              </div>
            </div>
          </div>
        )}

        <nav className="mt-8 flex-1">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-blue-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}