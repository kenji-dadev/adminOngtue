"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { submitUserData, uploadFile } from "../../firebase/firebaseUtilsInput.js"; 
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../../firebase/config.js";

export default function Userinput({ onSubmitData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    years:"", 
    status: "ພຣະ",
    idNumber: "",
    imageUrl: ""
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Starting submission process...");
      
      // Create member document first
      const memberId = await submitUserData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber, 
      years: formData.years, // Add this line
      status: formData.status, 
      idNumber: formData.idNumber,
    });
      
      let imageUrl = null;
      
      if (image) {
        console.log("Uploading image...");
        const fileName = `profile_${Date.now()}_${image.name}`;
        const uploadResult = await uploadFile(image, memberId, fileName);
        
        // Check if uploadResult is an object or string
        if (typeof uploadResult === 'object') {
          imageUrl = uploadResult.url;
        } else {
          // If it's a string (old version)
          imageUrl = uploadResult;
        }
        
        // Update member document with image URL and path
        const memberRef = doc(db, 'member', memberId);
        await setDoc(memberRef, { 
          imageUrl: imageUrl,
        }, { merge: true });
        
   
      }
      
      const combinedData = {
        ...formData,
        memberId: memberId,
        imageUrl: imageUrl,
        imagePreview: imagePreview,
      };

      console.log("Form data submitted successfully:", combinedData);
 
      if (onSubmitData) {
        onSubmitData(combinedData);
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while saving data. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        className="flex items-center mb-6 cursor-pointer bg-transparent border-0 p-0"
        onClick={() => router.push("/")}
      >
        <IoMdArrowRoundBack size={30} color="green" />
        <h1 className="text-lg font-medium">ເພີ່ມຜູ້ໃຊ້ງານ</h1>
      </button>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-center mb-2">ອັບໂຫຼດຮູບ</p>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-gray-700 text-white cursor-pointer overflow-hidden">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
            </div>
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded ml-4"
              onClick={() =>
                document.querySelector('input[type="file"]').click()
              }
            >
              ອັບໂຫຼດ
            </button>
          </div>
        </div>

        <div className="space-y-4">
          
            <div>
            <label className="block mb-1">
              ສະຖານະ <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ພຣະ">ພຣະ</option>
              <option value="ສາມະເນນ">ສາມະເນນ</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">
              ຊື່ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="ກະລຸນາໃສ່ຊື່ ....."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block mb-1">
              ນາມສະກຸນ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="ກະລຸນາໃສ່ນາມສະກຸນ ....."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block mb-1">
              ເບີໂທ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="ກະລຸນາໃສ່ເບີໂທນິລະສັບ ....."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <div>
              <label className="block mb-1">
                ພັນສາ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="years"  // Changed from "phoneNumber" to "years"
                placeholder="ກະລຸນາໃສ່ອາຍຸພັນສາ ....."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                required
                value={formData.years}
                onChange={handleInputChange}
              />
          </div>

        

          <div>
            <label className="block mb-1">
              ເລກສຸດທິ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="idNumber"
              placeholder="ກະລຸນາໃສ່ເລກສຸດທິ ....."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.idNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-gray-700 text-white px-6 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ຕໍ່ໄປ"}
          </button>
        </div>
      </form>
    </div>
  );
}