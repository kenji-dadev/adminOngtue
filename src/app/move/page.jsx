import Memberin from "./components/Memberin"
import Sidebar from '../navabr/page';
import ProtectedRoute from '../protectedRoute'; 
function page() {
  return (
   
    <ProtectedRoute>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
             <Memberin/>
            </main>
          </div>
        </ProtectedRoute>
    
  )
}
export default page