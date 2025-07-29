import React from 'react';
import MemberList from "./components/MemberList";
import Sidebar from '../navabr/page';
import ProtectedRoute from '../protectedRoute'; 

function Page() {
  return (
  <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <MemberList />
        </main>
      </div>
</ProtectedRoute>
  );
}

export default Page;