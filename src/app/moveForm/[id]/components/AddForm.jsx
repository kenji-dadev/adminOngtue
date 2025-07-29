
"use client"
import { useState } from "react";
import { submitMoveOutData } from '../../../firebase/firebaseUtilsInput';

function AddForm({ memberId, onDataSubmitted }) {
  const [formData, setFormData] = useState({
    moveTo: '',
    village: '',
    district: '',
    province: '',
    date: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFormData({
      moveTo: '',
      village: '',
      district: '',
      province: '',
      date: '',
      description: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (!memberId) {
        alert('Member ID is required');
        return;
      }

      if (!formData.moveTo.trim() || !formData.village.trim() || 
          !formData.district.trim() || !formData.province.trim() || 
          !formData.date || !formData.description.trim()) {
        alert('ກາລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບ');
        return;
      }

      setIsSubmitting(true);

      const moveOutData = {
        moveToTemple: formData.moveTo,
        village: formData.village,
        district: formData.district,
        province: formData.province,
        moveDate: formData.date,
        description: formData.description
      };

      // ใช้ฟังก์ชัน submitMoveOutData ที่มีอยู่ในไฟล์ firebase.js
      const docId = await submitMoveOutData(memberId, moveOutData);
      
      console.log('Move out data submitted successfully with ID:', docId);
      
      handleReset();
      
      // เรียก callback function เพื่อให้ parent component รู้ว่าข้อมูลถูกบันทึกแล้ว
      if (onDataSubmitted) {
        onDataSubmitted();
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('ເກິດບັນຫາໃນການບັນທຶກຂໍ້ມູນ: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-100">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            ໃບຍົກຍ້າຍສຳນັກ
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ຍ້າຍຈາກສຳນັກວັດ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="moveTo"
                value={formData.moveTo}
                onChange={handleInputChange}
                placeholder="ປ້ອນຍ້າຍຈາກສຳນັກວັດ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ບ້ານ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                placeholder="ປ້ອນຊື່ບ້ານ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ເມືອງ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="ປ້ອນຊື່ເມືອງ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ແຂວງ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="ປ້ອນຊື່ແຂວງ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ວ/ດ/ປ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ໝາຍເຫດ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="ປ້ອນໝາຍເຫດ..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                disabled={isSubmitting}
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddForm;