
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { auth } from "../../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { 
  getMemberData, 
  updateMemberData, 
  updateProfileImage 
} from "../../../firebase/firebaseUtilsUpdate";

function EditUser({ memberId, onSubmitData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "", 
    phoneNumber: "",
    status: "ພຣະ",
    idNumber: "",
    years:""
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [oldImageUrl, setOldImageUrl] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        alert("กรุณาเข้าสู่ระบบก่อน");
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // โหลดข้อมูลสมาชิกเมื่อมี memberId
  useEffect(() => {
    if (memberId && authUser) {
      loadMemberData(memberId);
    }
  }, [memberId, authUser]);

  // Load member data
  const loadMemberData = async (id) => {
    try {
      setIsLoadingData(true);
      const memberData = await getMemberData(id);
      
      if (memberData) {
        setFormData({
          firstName: memberData.firstName || "",
          lastName: memberData.lastName || "", 
          phoneNumber: memberData.phoneNumber || "",
          years: memberData.years || "",
          status: memberData.status || "ພຣະ",
          idNumber: memberData.idNumber || "",
        });

        if (memberData.imageUrl) {
          setOldImageUrl(memberData.imageUrl);
          setImagePreview(memberData.imageUrl);
        }
      }
    } catch (error) {
      console.error("Error loading member data:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ: " + error.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update member data - แก้ไขให้ตรงกับ field names
      await updateMemberData(memberId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber, 
          years: formData.years, 
          status: formData.status, 
          idNumber: formData.idNumber,
      });
      
      // Upload new image if selected
      if (image) {
        await updateProfileImage(memberId, image, oldImageUrl);
      }
      
      if (onSubmitData) {
        onSubmitData({
          memberId: memberId,
          ...formData
        });
      }
      
    } catch (error) {
      console.error("Error updating member data:", error);
      alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    document.querySelector('input[type="file"]').click();
  };

  if (isLoadingData) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        className="flex items-center mb-6 cursor-pointer bg-transparent border-0 p-0"
        onClick={() => router.push("/")}
        type="button"
      >
        <IoMdArrowRoundBack size={30} color="green" />
        <h1 className="text-lg font-medium ml-2">ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ</h1>
      </button>

      <form onSubmit={handleSubmit}>
        {/* Image Upload Section */}
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
              onClick={handleUploadClick}
            >
              ອັບໂຫຼດ
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          
           <div>
            <label className="block mb-1">ສະຖານະ <span className="text-red-500">*</span></label>
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
            <label className="block mb-1">ຊື່ <span className="text-red-500">*</span></label>
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
            <label className="block mb-1">ນາມສະກຸນ <span className="text-red-500">*</span></label>
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
            <label className="block mb-1">ເບີໂທ <span className="text-red-500">*</span></label>
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
              name="years"  
              placeholder="ກະລຸນາໃສ່ອາຍຸພັນສາ ....."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              required
              value={formData.years}
              onChange={handleInputChange}
            />
          </div>

         

          <div>
            <label className="block mb-1">ເລກສຸດທິ <span className="text-red-500">*</span></label>
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

        {/* Submit Button */}
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

export default EditUser;