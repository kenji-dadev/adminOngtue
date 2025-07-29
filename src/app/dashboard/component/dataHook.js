// hooks/useMemberData.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAllMembers, searchMembers, checkAuth } from './service';

export default function useMemberData() {
  const router = useRouter();
  
  // State declarations
  const [members, setMembers] = useState([]);
  const [monkCount, setMonkCount] = useState(0);
  const [noviceCount, setNoviceCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลสมาชิกทั้งหมด
  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const result = await fetchAllMembers();
      
      setMembers(result.members);
      setMonkCount(result.stats?.monks || 0);
      setNoviceCount(result.stats?.novices || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันค้นหาสมาชิก
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      if (!searchTerm.trim()) {
        await fetchMembers();
        return;
      }

      const result = await searchMembers(searchTerm);
      
      setMembers(result.members);
      setMonkCount(result.stats?.monks || 0);
      setNoviceCount(result.stats?.novices || 0);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchMembers();
  }, [router]);

  // Return values
  return {
    members,
    monkCount,
    noviceCount,
    searchTerm,
    setSearchTerm,
    loading,
    handleSearch,
    fetchMembers
  };
}