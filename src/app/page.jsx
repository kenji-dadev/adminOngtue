import AdminDashboard from "./dashboard/component/admin-dashboard"

import ProtectedRoute from './protectedRoute'; 
import Sidebar from './navabr/page';

export default function MainLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
         <AdminDashboard/>
         {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}