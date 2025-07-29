
'use client'

import { useState, useEffect } from 'react';
import { 
  getSubCollectionData, 
  updateSubCollectionData, 
  addToSubCollection 
} from "../../../firebase/firebaseUtilsUpdate";

function EditMove({ memberId, userData, onContinue, onBack, onSkip }) {
  const [formData, setFormData] = useState({
    moveFrom: '',
    moveDate: '',
  });
  const [skipForm, setSkipForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [moveInId, setMoveInId] = useState(null);
  
  // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    if (memberId) {
      loadMoveInData(memberId);
    } else {
      setIsLoadingData(false);
    }
  }, [memberId]);
  
  // ฟังก์ชันโหลดข้อมูลจาก Firebase
  const loadMoveInData = async (id) => {
    try {
      setIsLoadingData(true);
      const moveInData = await getSubCollectionData(id, 'MoveIn');
      
      if (moveInData && moveInData.length > 0) {
        // เรียงข้อมูลตามวันที่อัปเดตล่าสุด
        const sortedData = moveInData.sort((a, b) => {
          if (a.updatedAt && b.updatedAt) {
            return b.updatedAt.toDate() - a.updatedAt.toDate();
          }
          return 0;
        });
        
        const mostRecentData = sortedData[0];
        setFormData({
          moveFrom: mostRecentData.moveFrom || '',
          moveDate: mostRecentData.moveDate || '',
        });
        setSkipForm(mostRecentData.skipped || false);
        setMoveInId(mostRecentData.id);
      }
    } catch (error) {
      console.error("Error loading move-in data:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลการย้าย");
    } finally {
      setIsLoadingData(false);
    }
  };

  // เมื่อ skipForm เปลี่ยนเป็น true ให้แจ้ง parent component
  useEffect(() => {
    if (skipForm && onSkip) {
      onSkip(true);
    }
  }, [skipForm, onSkip]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Movement form submit with memberId:", memberId);
      
      if (!memberId) {
        throw new Error("ไม่พบ ID สมาชิก");
      }
      
      const moveInData = {
        moveFrom: skipForm ? '' : formData.moveFrom,
        moveDate: skipForm ? '' : formData.moveDate,
        skipped: skipForm
      };

      // ตรวจสอบว่าต้องอัปเดตข้อมูลเดิมหรือเพิ่มข้อมูลใหม่
      if (moveInId) {
        console.log("Updating existing movement data...");
        await updateSubCollectionData(
          memberId,
          'MoveIn',
          moveInId,
          moveInData
        );
      } else {
        console.log("Creating new movement data...");
        await addToSubCollection(
          memberId,
          'MoveIn',
          moveInData
        );
      }
      
      console.log("Movement data saved successfully");
      
      // ไปยังขั้นตอนถัดไป
      if (onContinue) {
        onContinue();
      }
    } catch (error) {
      console.error("Error saving movement data:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipChange = (e) => {
    const isChecked = e.target.checked;
    setSkipForm(isChecked);
    
    // ถ้า skip ให้ clear ข้อมูลในฟอร์ม
    if (isChecked) {
      setFormData({
        moveFrom: '',
        moveDate: '',
      });
    }
  };

  if (isLoadingData) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center">
        <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນການຍົກຍ້າຍເຂົ້າ</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ຍົກຍ້າຍມາຈາກ{!skipForm && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="moveFrom"
            value={formData.moveFrom}
            onChange={handleInputChange}
            placeholder="ກະລຸນາໃສ່ສະຖານທີ່ທີ່ຍົກຍ້າຍມາ"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required={!skipForm}
            disabled={skipForm}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ວັນ/ເດືອນ/ປີ{!skipForm && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            name="moveDate"
            value={formData.moveDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            style={{ backgroundColor: 'white', color: 'black' }}
            required={!skipForm}
            disabled={skipForm}
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-5">
            <input
              type="checkbox"
              checked={skipForm}
              onChange={handleSkipChange}
              className="rounded"
            />
            <span className="text-md text-red-600">ສາມາດກົດຂ້າມໄປກ່ອນ</span>
          </label>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-white text-red-500 border-2 border-red-500 px-6 py-2 rounded cursor-pointer hover:bg-red-50"
            disabled={isLoading}
          >
            ຍ້ອນກັບ
          </button>
          <button
            type="submit"
            className="bg-blue-400 text-white px-6 py-2 rounded cursor-pointer hover:bg-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ຕໍ່ໄປ"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMove;