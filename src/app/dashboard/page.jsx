import AdminDashboard from "./component/admin-dashboard"
import ProtectedRoute from '../protectedRoute'; 

function page() {
  return (
    <div>
      <ProtectedRoute>
        <AdminDashboard/>
      </ProtectedRoute>
      </div>
  )
}
export default page