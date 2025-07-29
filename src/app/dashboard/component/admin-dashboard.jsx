"use client"

import { useRouter } from "next/navigation";
import StatsCards from './StatsCards';
import SearchBar from './SearchBar';
import MembersTable from './MembersTable';
import useMemberData from './dataHook'; 
export default function AdminDashboard() {
  const router = useRouter();
  const { 
    members,
    monkCount,
    noviceCount,
    searchTerm,
    setSearchTerm,
    loading,
    handleSearch 
  } = useMemberData();

  return (
    <div>
      <div className="bg-[#E5E7EB] w-full">
        <div className="p-8">
          <h1 className="text-2xl font-medium mb-8">ລະບົບຈັດການຂໍ້ມູນພຣະ-ສາມະເນນ ວັດອົງຕື້</h1>
          
          <StatsCards 
            Members={members}  
            monkCount={monkCount}
            noviceCount={noviceCount}
          />
          
          {/* Search and Add */}
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            onAddClick={() => router.push("/addform")}
          />
          
          {/* Table */}
          <div className="bg-white rounded-lg overflow-hidden">
            <MembersTable 
              members={members}
              loading={loading}
              onEdit={(id) => router.push(`/edit/${id}`)}
              onMove={(id) => router.push(`/moveForm/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
