
'use client'
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, collectionGroup, documentId } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

function Memberin() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันจัดรูปแบบวันที่เป็น DD/MM/YYYY
  const formatDateToDDMMYYYY = (date) => {
    if (!date) return 'ไม่ระบุ';
    
    try {
      let dateObj;
      
      // ถ้าเป็น Firestore Timestamp
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } 
      // ถ้าเป็น string
      else if (typeof date === 'string') {
        dateObj = new Date(date);
      }
      // ถ้าเป็น Date object แล้ว
      else if (date instanceof Date) {
        dateObj = date;
      }
      else {
        return 'ไม่ระบุ';
      }

      // ตรวจสอบว่า date ถูกต้องหรือไม่
      if (isNaN(dateObj.getTime())) {
        return 'ไม่ระบุ';
      }

      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'ไม่ระบุ';
    }
  };

  // ฟังก์ชันดึงข้อมูลจาก Firestore
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null); // รีเซ็ต error state
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      // วิธีใหม่: ดึงทุก MoveIn แล้วกรองใน JavaScript
      const moveInRef = collectionGroup(db, 'MoveIn');
      const moveInSnapshot = await getDocs(moveInRef);
      const memberIds = [];
      const moveInData = {};

      // เก็บ memberId และข้อมูล MoveIn โดยกรองเฉพาะ skipped = false
      moveInSnapshot.forEach((doc) => {
        const memberId = doc.ref.parent.parent.id;
        const data = doc.data();
        console.log('MoveIn document:', memberId, 'skipped:', data.skipped);
        
        // กรองเฉพาะ skipped = false
        if (data.skipped === false) {
          if (!memberIds.includes(memberId)) {
            memberIds.push(memberId);
          }
          moveInData[memberId] = data;
        }
      });

      console.log('Filtered Member IDs (skipped=false):', memberIds);

      if (memberIds.length === 0) {
        setMembers([]);
        setError(null);
        setLoading(false);
        return;
      }

      // ดึงข้อมูลสมาชิกจาก member collection ตาม memberIds ที่ได้
      const membersData = [];
      
      // แบ่งการ query เป็นชุดๆ เพราะ Firestore มีข้อจำกัดใน whereIn (สูงสุด 10 รายการ)
      const batchSize = 10;
      for (let i = 0; i < memberIds.length; i += batchSize) {
        const batch = memberIds.slice(i, i + batchSize);
        
        try {
          const membersRef = collection(db, 'member');
          const membersQuery = query(
            membersRef,
            where(documentId(), 'in', batch) // ใช้ documentId() แทน '__name__'
          );

          const membersSnapshot = await getDocs(membersQuery);
          
          membersSnapshot.forEach((doc) => {
            const data = doc.data();
            
            // ใช้ข้อมูล moveDate จาก MoveIn
            const moveInInfo = moveInData[doc.id];
            const formattedDate = formatDateToDDMMYYYY(moveInInfo?.moveDate);

            membersData.push({
              id: doc.id,
              firstName: data.firstName || 'ไม่ระบุ',
              lastName: data.lastName || '',
              phoneNumber: data.phoneNumber || 'ไม่ระบุ',
              imageUrl: data.imageUrl || '/placeholder-image.jpg', // เพิ่ม fallback image
              moveDate: formattedDate,
              onStatus: data.onStatus,
              status: data.status, // เพิ่ม status field
              moveDateTimestamp: moveInInfo?.moveDate, // ใช้ moveDate สำหรับการเรียงลำดับ
              moveInData: moveInInfo, // เพิ่มข้อมูล MoveIn
              ...data
            });
          });
        } catch (batchError) {
          console.error('Error fetching batch:', batch, batchError);
          // ถ้า batch นี้ error ให้ข้ามไปทำ batch ถัดไป
          continue;
        }
      }

      // เรียงลำดับใน JavaScript ตาม moveDate
      membersData.sort((a, b) => {
        // ถ้ามี moveDateTimestamp ให้เรียงตามนั้น
        if (a.moveDateTimestamp && b.moveDateTimestamp) {
          try {
            // ถ้าเป็น Timestamp
            if (a.moveDateTimestamp.toDate && b.moveDateTimestamp.toDate) {
              return b.moveDateTimestamp.toDate() - a.moveDateTimestamp.toDate();
            }
            // ถ้าเป็น string
            return new Date(b.moveDateTimestamp) - new Date(a.moveDateTimestamp);
          } catch (error) {
            console.error('Error sorting timestamps:', error);
            return 0;
          }
        }
        // ถ้าไม่มี ให้เรียงตาม id
        return b.id.localeCompare(a.id);
      });

      setMembers(membersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    // เช็คว่า auth พร้อมใช้งานแล้วหรือยัง
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMembers();
      } else {
        setError('กรุณาเข้าสู่ระบบ');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="text-center font-bold text-4xl m-5">ຂໍ້ມູນການຍົກຍ້າຍເຂົ້າ</div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="text-xl text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // แสดง error ถ้ามี
  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="text-center font-bold text-4xl m-5">ຂໍ້ມູນການຍົກຍ້າຍເຂົ້າ</div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button 
              onClick={fetchMembers}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ລອງໃໝ່
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === "monks" || status === "ພຣະ") {
      return "bg-orange-100 text-orange-800";
    } else if (status === "novices" || status === "ສາມະເນນ") {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = (status) => {
    if (status === "monks") {
      return "ພຣະ";
    } else if (status === "novices") {
      return "ສາມະເນນ";
    } else if (status === "ພຣະ") {
      return "ພຣະ";
    } else if (status === "ສາມະເນນ") {
      return "ສາມະເນນ";
    }
    return status || "ບໍ່ລະບຸ";
  };

  // ฟังก์ชัน handle image error
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg'; // หรือใช้ default image
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="text-center font-bold text-4xl m-5">ຂໍ້ມູນການຍົກຍ້າຍເຂົ້າ</div>
      <div className="max-w-6xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-300 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-6 text-xl text-gray-600 font-bold">
              <div className="text-left">ຮູບ</div>
              <div className="text-center">ສະຖານະ</div>
              <div className="text-center">ຊື່ ແລະ ນາມສະກຸນ</div>
              <div className="text-center">ເບີໂທ</div>
              <div className="text-center">ວັນທີຍ້າຍເຂົ້າ</div>
            </div>
          </div>
          
          {/* Member List */}
          <div className="divide-y divide-gray-200">
            {members.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <div className="text-xl">ບໍ່ມີຂໍ້ມູນສະມາຊິກທີ່ມີການຍ້າຍເຂົ້າ</div>
                <button 
                  onClick={fetchMembers}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  ໂຫຼດຂໍ້ມູນໃໝ່
                </button>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="grid grid-cols-5 gap-6 items-center min-h-[60px]">
                    {/* Photo */}
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0">
                        <img
                          src={member.imageUrl || '/placeholder-image.jpg'}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                    </div>

                     {/* Status */}
                    <div className="text-lg font-medium">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                          {getStatusDisplay(member.status)}
                      </span>
                    </div>
                    
                    {/* Member Name */}
                    <div className="text-xl font-medium text-gray-900 truncate">
                      {member.firstName} {member.lastName}
                    </div>
                    
                    {/* Mobile */}
                    <div className="text-xl text-gray-600 truncate">
                      {member.phoneNumber}
                    </div>
                    
                    {/* Move Date - แสดงวันที่แบบ DD/MM/YYYY */}
                    <div className="text-xl font-medium text-gray-900 truncate mx-5">
                      {member.moveDate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Memberin;