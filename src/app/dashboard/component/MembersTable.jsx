
// components/MembersTable.js
import React, { useState } from 'react';
import ProfileImage from './profile'; 
import { getStatusDisplay, getFullName, getStatusColor } from '../component/utils/memhelper';
import { deleteAllMemberData } from '../../firebase/firebaseUtilsDelete'; 

export default function MembersTable({ members, loading, onEdit, onMove, onRefresh }) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);

  const handleDelete = async (memberId, memberName) => {
    try {
      const isConfirmed = window.confirm(
        `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສມາຊິກ "${memberName}" ນີ້?\n\nຂໍ້ມູນທັງໝົດລວມທັງຮູບພາບຈະຖືກລົບອອກຖາວອນ!`
      );
      
      if (!isConfirmed) {
        return;
      }

      console.log(`🗑️ Starting deletion for member: ${memberId} (${memberName})`);
      
      setDeleteLoading(true);
      setDeletingMemberId(memberId);
      
      // เรียกใช้ฟังก์ชันลบข้อมูลสมาชิก (รวมทั้งรูปใน Storage)
      const result = await deleteAllMemberData(memberId);
      
      if (result) {
        console.log(`✅ Member ${memberId} deleted successfully`);
        
        // แจ้งเตือนความสำเร็จ
        alert(`ລົບສມາຊິກ "${memberName}" ສຳເລັດແລ້ວ!\nຂໍ້ມູນທັງໝົດລວມທັງຮູບພາບໄດ້ຖືກລົບອອກແລ້ວ`);
        
        // เรียกใช้ฟังก์ชัน refresh ถ้ามี
        if (onRefresh) {
          await onRefresh();
        } else {
          // ถ้าไม่มีฟังก์ชัน refresh ให้ reload หน้า
          window.location.reload();
        }
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

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>ກຳລັງໂຫລດຂໍ້ມູນ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Popup */}
      {deleteLoading && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#D1D5DB]">
            <tr>
              <th className="py-4 px-4 text-center font-medium">ຮູບ</th>
              <th className="py-4 px-4 text-center font-medium">ສະຖານະ</th>
              <th className="py-4 px-4 text-center font-medium">ຊື່ ແລະ ນາມສະກຸນ</th>
              <th className="py-4 px-4 text-center font-medium">ເບີໂທ</th>
              <th className="py-4 px-4 text-center font-medium">ວ/ດ/ປ</th>
              <th className="py-4 px-4 text-center font-medium">ພັນສາ</th>
              
              <th className="py-4 px-4 text-center font-medium">ການຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => {
                const memberName = getFullName(member.firstName, member.lastName);
                const isDeleting = deletingMemberId === member.id;
                
                console.log(`Member ${member.id} data:`, {
                  id: member.id,
                  imageUrl: member.imageUrl,
                  name: memberName
                });

                return (
                  <tr 
                    key={member.id} 
                    className={`border-t border-gray-200 hover:bg-gray-50 ${isDeleting ? 'opacity-50' : ''}`}
                  >
                    <td className="py-4 px-4 flex justify-center">
                      <ProfileImage
                        memberId={member.id}
                        imageUrl={member.imageUrl}
                        alt={memberName}
                        size="w-12 h-12"
                      />
                    </td>
                      <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                        {getStatusDisplay(member.status)}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {memberName}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {member.phoneNumber || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {member.formattedDate || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {member.years || '-'}
                    </td>
                  
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onEdit(member.id)}
                          disabled={deleteLoading}
                        >
                          ແກ້ໄຂ
                        </button>
                        <button
                          className="px-6 py-2 bg-yellow-400 text-gray-800 rounded-md hover:bg-yellow-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onMove(member.id)}
                          disabled={deleteLoading}
                        >
                          ຍົກຍ້າຍ
                        </button>
                        <button
                          className={`px-6 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDeleting 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                          onClick={() => handleDelete(member.id, memberName)}
                          disabled={deleteLoading}
                        >
                          {isDeleting ? 'ກຳລັງລົບ...' : 'ລົບ'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  ບໍ່ພົບຂໍ້ມູນສມາຊິກ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}