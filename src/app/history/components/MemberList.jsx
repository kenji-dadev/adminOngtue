'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { deleteAllMemberData } from '../../firebase/firebaseUtilsDelete'; 
import ProfileImage from './ProfileImage';
import { getFullName } from './Memhelp';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);

  // ฟังก์ชันดึงข้อมูลสมาชิกที่ย้าย
  const fetchMovedMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query สมาชิกที่มี onStatus = "moved"
      const membersRef = collection(db, 'member');
      const q = query(membersRef, where('onStatus', '==', 'moved'));
      const querySnapshot = await getDocs(q);

      const membersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        console.log(`👤 Member data for ${doc.id}:`, {
          imageUrl: data.imageUrl,
          firstName: data.firstName,
          lastName: data.lastName
        });
        
        // แปลงวันที่ให้อ่านง่าย
        let formattedMoveDate = '';
        if (data.movedAt) {
          const moveDate = data.movedAt.toDate ? data.movedAt.toDate() : new Date(data.movedAt);
          formattedMoveDate = moveDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }

        let formattedCreatedDate = '';
        if (data.createdAt) {
          const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          formattedCreatedDate = createdDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }

        membersData.push({
          id: doc.id,
          ...data,
          fullName: getFullName(data.firstName, data.lastName),
          formattedMoveDate,
          formattedCreatedDate
        });
      });

      // เรียงตามวันที่ย้าย (ล่าสุดก่อน)
      membersData.sort((a, b) => {
        if (a.movedAt && b.movedAt) {
          const dateA = a.movedAt.toDate ? a.movedAt.toDate() : new Date(a.movedAt);
          const dateB = b.movedAt.toDate ? b.movedAt.toDate() : new Date(b.movedAt);
          return dateB - dateA;
        }
        return 0;
      });

      console.log(`📊 Total moved members found: ${membersData.length}`);
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching moved members:', err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสมาชิก - แก้ไขให้เหมือนกับ MembersTable
  const handleDeleteMember = async (memberId, memberName) => {
    try {
      // ยืนยันการลบ
      const isConfirmed = window.confirm(
        `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສມາຊິກ "${memberName}" ນີ້?\n\nຂໍ້ມູນທັງໝົດລວມທັງຮູບພາບຈະຖືກລົບອອກຖາວອນ!`
      );
      
      if (!isConfirmed) {
        return;
      }

      console.log(`🗑️ Starting deletion for member: ${memberId} (${memberName})`);
      
      // เริ่มการโหลด
      setDeleteLoading(true);
      setDeletingMemberId(memberId);
      
      // เรียกใช้ฟังก์ชันลบข้อมูลสมาชิก (รวมทั้งรูปใน Storage)
      const result = await deleteAllMemberData(memberId);
      
      if (result) {
        console.log(`✅ Member ${memberId} deleted successfully`);
        
        // แจ้งเตือนความสำเร็จ
        alert(`ລົບສມາຊິກ "${memberName}" ສຳເລັດແລ້ວ!\nຂໍ້ມູນທັງໝົດລວມທັງຮູບພາບໄດ້ຖືກລົບອອກແລ້ວ`);
        
        // อัพเดทรายการโดยลบสมาชิกที่ถูกลบออก
        setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        
      } else {
        alert('ບໍ່ສາມາດລົບສມາຊິກໄດ້ (ບໍ່ພົບຂໍ້ມູນ)');
      }
      
    } catch (error) {
      console.error('❌ Error deleting member:', error);
      
      // แสดง error message ที่เป็นมิตรกับผู้ใช้
      let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການລົບສມາຊິກ';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'ບໍ່ມີສິດໃນການລົບຂໍ້ມູນ';
      } else if (error.code === 'unavailable') {
        errorMessage = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້';
      } else if (error.message) {
        errorMessage = `ເກີດຂໍ້ຜິດພາດ: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
      setDeletingMemberId(null);
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchMovedMembers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-xl text-gray-600">ກຳລັງໂຫລດຂໍ້ມູນ...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600">{error}</div>
          <button 
            onClick={fetchMovedMembers}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ລອງອີກຄັ້ງ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8 bg-gray-100 min-h-screen">
      {/* Loading Popup */}
      {deleteLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-900">
                  ກຳລັງລົບຂໍ້ມູນ...
                </div>
                <div className="text-sm text-gray-500">
                  ລວມທັງຮູບພາບໃນ Storage
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                ກະລຸນາລໍຖ້າ ຫ້າມປິດໜ້າຈໍນີ້
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center font-bold text-4xl m-5">ຂໍ້ມູນປະຫວັດການຍົກຍ້າຍອອກ</div>
      <div className="max-w-6xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-red-400 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-6 text-xl text-white font-bold">
              <div className="text-left">ຮູບ</div>
              <div className="text-center">ຊື່ ແລະ ນາມສະກຸນ</div>
              <div className="text-center">ເບີໂທ</div>
              <div className="text-center">ວັນທີຍ້າຍ</div>
              <div className="text-center">ຈັດການ</div>
            </div>
          </div>

          {/* Member List */}
          <div className="divide-y divide-gray-200">
            {members.length > 0 ? (
              members.map((member) => {
                const isDeleting = deletingMemberId === member.id;
                
                return (
                  <div 
                    key={member.id} 
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-150 ${isDeleting ? 'opacity-50' : ''}`}
                  >
                    <div className="grid grid-cols-5 gap-6 items-center min-h-[80px]">
                      {/* Photo */}
                      <div className="flex justify-start">
                        <ProfileImage
                          memberId={member.id}
                          imageUrl={member.imageUrl}
                          alt={member.fullName}
                          size="w-16 h-16"
                          className="flex-shrink-0"
                        />
                      </div>

                      {/* Member Name */}
                      <div className="text-lg font-medium text-gray-900 text-center">
                       {member.status || 'ບໍ່ມີຊື່'}: {member.fullName || 'ບໍ່ມີຊື່'}
                      </div>

                      {/* Mobile */}
                      <div className="text-lg text-gray-600 text-center">
                        {member.phoneNumber || '-'}
                      </div>

                      {/* Moved Date */}
                      <div className="text-lg font-medium text-blue-600 text-center">
                        {member.formattedMoveDate || '-'}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDeleteMember(member.id, member.fullName)}
                          className={`px-4 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDeleting 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                          disabled={deleteLoading}
                        >
                          {isDeleting ? 'ກຳລັງລົບ...' : 'ລົບ'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-xl">ບໍ່ມີຂໍ້ມູນສມາຊິກທີ່ຍ້າຍແລ້ວ</div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {members.length > 0 && (
          <div className="mt-4 text-center text-gray-600">
            <div className="text-lg">
              ມີສມາຊິກທີ່ຍ້າຍແລ້ວທັ້ງໝົດ: <span className="font-bold text-blue-600">{members.length}</span> ຄົນ
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;