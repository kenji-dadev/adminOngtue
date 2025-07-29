
// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { 
//   onAuthStateChanged, 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   signOut, 
//   sendPasswordResetEmail 
// } from 'firebase/auth';
// import { auth } from '../firebase/config';

// const AuthContext = createContext({});

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   const SESSION_LIMIT_MS = 10 * 60 * 60 * 1000; // 10 ชั่วโมง

//   // ฟังก์ชันตรวจสอบ session
//   const checkSession = () => {
//     const loginTime = localStorage.getItem('loginTime');
//     if (!loginTime) return false;
    
//     const now = Date.now();
//     const sessionAge = now - parseInt(loginTime, 10);
    
//     if (sessionAge > SESSION_LIMIT_MS) {
//       // Session หมดอายุ
//       logout();
//       return false;
//     }
//     return true;
//   };

//   // ฟังก์ชัน login
//   const login = async (email, password) => {
//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password);
//       localStorage.setItem('loginTime', Date.now().toString());
//       return result.user;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // ฟังก์ชัน register
//   const register = async (email, password) => {
//     try {
//       const result = await createUserWithEmailAndPassword(auth, email, password);
//       localStorage.setItem('loginTime', Date.now().toString());
//       return result.user;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // ฟังก์ชัน logout
//   const logout = async () => {
//     try {
//       await signOut(auth);
//       localStorage.removeItem('loginTime');
//       setUser(null);
//     } catch (error) {
//       console.error('Logout error:', error);
//       // ลบข้อมูล local storage แม้จะ logout ไม่สำเร็จ
//       localStorage.removeItem('loginTime');
//       setUser(null);
//     }
//   };

//   // ฟังก์ชัน reset password
//   const resetPassword = async (email) => {
//     try {
//       await sendPasswordResetEmail(auth, email);
//     } catch (error) {
//       throw error;
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         // ตรวจสอบ session เมื่อมี user
//         if (checkSession()) {
//           setUser(firebaseUser);
//         }
//       } else {
//         setUser(null);
//         localStorage.removeItem('loginTime');
//       }
//       setLoading(false);
//     });

//     // ตั้งค่า interval เพื่อตรวจสอบ session ทุก 5 นาที
//     const sessionCheckInterval = setInterval(() => {
//       if (user) {
//         checkSession();
//       }
//     }, 5 * 60 * 1000); // 5 นาที

//     return () => {
//       unsubscribe();
//       clearInterval(sessionCheckInterval);
//     };
//   }, [user]);

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     resetPassword,
//     checkSession
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const SESSION_LIMIT_MS = 10 * 60 * 60 * 1000; // 10 ชั่วโมง

  // ฟังก์ชันตรวจสอบ session
  const checkSession = () => {
    try {
      // ตรวจสอบว่า localStorage พร้อมใช้งานหรือไม่
      if (typeof window === 'undefined' || !window.localStorage) {
        return true; // ถ้าไม่มี localStorage ให้ผ่านไป (สำหรับ SSR)
      }

      const loginTime = localStorage.getItem('loginTime');
      if (!loginTime) return false;
      
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime, 10);
      
      if (sessionAge > SESSION_LIMIT_MS) {
        // Session หมดอายุ
        logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return true; // ถ้าเกิด error ให้ผ่านไป
    }
  };

  // ฟังก์ชัน login
  const login = async (email, password) => {
    try {
      console.log('Attempting Firebase login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful:', result.user.uid);
      
      // บันทึกเวลา login
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('loginTime', Date.now().toString());
        }
      } catch (storageError) {
        console.warn('Cannot save login time to localStorage:', storageError);
      }
      
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // ฟังก์ชัน register
  const register = async (email, password) => {
    try {
      console.log('Attempting Firebase registration...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase registration successful:', result.user.uid);
      
      // บันทึกเวลา login
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('loginTime', Date.now().toString());
        }
      } catch (storageError) {
        console.warn('Cannot save login time to localStorage:', storageError);
      }
      
      return result.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // ฟังก์ชัน logout
  const logout = async () => {
    try {
      console.log('Attempting logout...');
      await signOut(auth);
      
      // ลบข้อมูล localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('loginTime');
        }
      } catch (storageError) {
        console.warn('Cannot remove login time from localStorage:', storageError);
      }
      
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      
      // ลบข้อมูล local storage แม้จะ logout ไม่สำเร็จ
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('loginTime');
        }
      } catch (storageError) {
        console.warn('Cannot remove login time from localStorage:', storageError);
      }
      
      setUser(null);
    }
  };

  // ฟังก์ชัน reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        // ตรวจสอบ session เมื่อมี user
        if (checkSession()) {
          console.log('Session valid, setting user');
          setUser(firebaseUser);
        } else {
          console.log('Session invalid, clearing user');
          setUser(null);
        }
      } else {
        console.log('No Firebase user, clearing local state');
        setUser(null);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('loginTime');
          }
        } catch (storageError) {
          console.warn('Cannot remove login time from localStorage:', storageError);
        }
      }
      setLoading(false);
    });

    // ตั้งค่า interval เพื่อตรวจสอบ session ทุก 5 นาที
    const sessionCheckInterval = setInterval(() => {
      if (user) {
        console.log('Checking session validity...');
        checkSession();
      }
    }, 5 * 60 * 1000); // 5 นาที

    return () => {
      console.log('Cleaning up auth listeners...');
      unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};