
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './Context/AuthContext'; 

export default function ProtectedRoute({ children }) {
  const { user, loading, checkSession } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
       
        router.push('/login');
      } else {
       
        if (checkSession()) {
          setIsAuthorized(true);
        } else {
        
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, checkSession]);

  // แสดง loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ກຳລັງກວດສອບສິດການເຂົ້າໃຊ້...</p>
        </div>
      </div>
    );
  }

  return children;
}