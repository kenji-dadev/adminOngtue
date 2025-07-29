"use client";
import { useState } from 'react';
import { addToSubCollection } from '../../firebase/firebaseUtilsInput'; // Check the path to ensure it's correct

export default function Inforinput({ userData, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    preceptorName: '',
    preceptorSurname: '',
    templeName: '',
    ordinationDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
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
      console.log("Preceptor form submit with userData:", userData);
      
      if (userData && userData.memberId) {
        console.log("Saving preceptor data...");
        // Save preceptor data to Firestore
        await addToSubCollection(
          userData.memberId,
          'preceptor',
          {
            preceptorName: formData.preceptorName,
            preceptorSurname: formData.preceptorSurname,
            templeName: formData.templeName,
            ordinationDate: formData.ordinationDate
          }
        );
        
        // Show success message
        alert("Data saved successfully");
        
        // Call callback function to redirect
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("User data from previous step not found");
      }
    } catch (error) {
      console.error("Error saving preceptor data:", error);
      alert("An error occurred while saving data. Please try again");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-medium text-center mb-6">ຂໍ້ມູນພຣະອຸປັດຊາ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">
            ຊື່ <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="preceptorName" 
            placeholder="ກະລຸນາໃສ່ຊື່ຂອງພຣະອຸປັດຊາ ....." 
            className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
            required
            value={formData.preceptorName}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block mb-1">
            ນາມສະກຸນ <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="preceptorSurname" 
            placeholder="ກະລຸນາໃສ່ນາມສະກຸນ ....." 
            className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
            required
            value={formData.preceptorSurname}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block mb-1">
            ທີ່ວັດ<span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="templeName" 
            placeholder="ກະລຸນາໃສ່ຊື່ວັດທີ່ບວດ ....." 
            className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
            required
            value={formData.templeName}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block mb-1">
            ວັນ/ເດືອນ/ປີ ມື້ບວດ<span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            name="ordinationDate" 
            className="w-full px-4 py-2 bg-white text-gray-800 rounded border border-gray-300" 
            value={formData.ordinationDate}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="flex justify-between mt-6">
         <button
            type="button"
            onClick={onBack}
            className="bg-white text-red-500 border-2 px-6 py-2 rounded cursor-pointer"
            disabled={isLoading}
          >
            ຍ້ອນກັບ
          </button>
          <button 
            type="submit" 
            className="bg-blue-400 text-white px-6 py-2 rounded cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ບັນທຶກ"}
          </button>
        </div>
      </form>
    </div>
  );
}