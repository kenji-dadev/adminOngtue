import { NextResponse } from 'next/server';

export function middleware(request) {
  // เส้นทางที่ไม่ต้องการ Authentication
  const publicPaths = ['/login', '/register'];
  
  // ตรวจสอบว่าเส้นทางปัจจุบันเป็น public path หรือไม่
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // ถ้าเป็น public path ให้ผ่านไปได้
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // สำหรับเส้นทางอื่นๆ ให้ Component ProtectedRoute จัดการ
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};