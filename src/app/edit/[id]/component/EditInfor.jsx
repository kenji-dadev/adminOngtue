
// "use client";
// import { useState, useEffect } from 'react';

// function EditInfor({ userData, onBack }) {
//   const [formData, setFormData] = useState({
//     preceptorName: '',
//     preceptorSurname: '',
//     templeName: '',
//     ordinationDate: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [preceptorId, setPreceptorId] = useState(null);
  
//   // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
//   useEffect(() => {
//     if (userData && userData.memberId) {
//       loadPreceptorData(userData.memberId);
//     } else {
//       setIsLoadingData(false);
//     }
//   }, [userData]);
  
//   // ฟังก์ชันโหลดข้อมูลจาก Firebase
//   const loadPreceptorData = async (memberId) => {
//     try {
//       const preceptorData = await getSubCollectionData(memberId, 'preceptor');
//       if (preceptorData && preceptorData.length > 0) {
//         const mostRecentData = preceptorData[0]; // สมมติว่าข้อมูลล่าสุดอยู่ในตำแหน่งแรก
//         setFormData({
//           preceptorName: mostRecentData.preceptorName || '',
//           preceptorSurname: mostRecentData.preceptorSurname || '',
//           templeName: mostRecentData.templeName || '',
//           ordinationDate: mostRecentData.ordinationDate || ''
//         });
//         setPreceptorId(mostRecentData.id); // เก็บ ID ไว้สำหรับการอัปเดต
//       }
//     } catch (error) {
//       console.error("Error loading preceptor data:", error);
//     } finally {
//       setIsLoadingData(false);
//     }
//   };
  
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       console.log("Preceptor form submit with userData:", userData);
      
//       if (!userData || !userData.memberId) {
//         throw new Error("ไม่พบข้อมูลผู้ใช้จากขั้นตอนก่อนหน้า");
//       }
      
//       const preceptorData = {
//         preceptorName: formData.preceptorName,
//         preceptorSurname: formData.preceptorSurname,
//         templeName: formData.templeName,
//         ordinationDate: formData.ordinationDate
//       };
      
//       // ตรวจสอบว่าต้องอัปเดตข้อมูลเดิมหรือเพิ่มข้อมูลใหม่
//       if (preceptorId) {
//         console.log("Updating existing preceptor data...");
//         await updateSubCollectionData(
//           userData.memberId,
//           'preceptor',
//           preceptorId,
//           preceptorData
//         );
//       } else {
//         console.log("Creating new preceptor data...");
//         await addToSubCollection(
//           userData.memberId,
//           'preceptor',
//           preceptorData
//         );
//       }
      
//       console.log("Preceptor data saved successfully");
//       console.log("User Data from Step 1:", userData);
//       console.log("Form Data from Step 3:", formData);
      
//       // แสดงข้อความสำเร็จ
//       alert("ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ");
      
//       // สามารถเพิ่มการ redirect ไปหน้าอื่นหลังจากบันทึกสำเร็จ
//       // router.push('/success');
//     } catch (error) {
//       console.error("Error saving preceptor data:", error);
//       alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   if (isLoadingData) {
//     return (
//       <div className="max-w-md mx-auto p-4 text-center">
//         <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-md mx-auto p-4">
//       <h1 className="text-xl font-medium text-center mb-6">ຂໍ້ມູນພຣະອຸປັດຊາ</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block mb-1">
//             ຊື່ <span className="text-red-500">*</span>
//           </label>
//           <input 
//             type="text" 
//             name="preceptorName" 
//             placeholder="ກະລຸນາໃສ່ຊື່ຂອງພຣະອຸປັດຊາ ....." 
//             className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
//             required
//             value={formData.preceptorName}
//             onChange={handleInputChange}
//           />
//         </div>
        
//         <div>
//           <label className="block mb-1">
//             ນາມສະກຸນ <span className="text-red-500">*</span>
//           </label>
//           <input 
//             type="text" 
//             name="preceptorSurname" 
//             placeholder="ກະລຸນາໃສ່ນາມສະກຸນ ....." 
//             className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
//             required
//             value={formData.preceptorSurname}
//             onChange={handleInputChange}
//           />
//         </div>
        
//         <div>
//           <label className="block mb-1">
//             ທີ່ວັດ<span className="text-red-500">*</span>
//           </label>
//           <input 
//             type="text" 
//             name="templeName" 
//             placeholder="ກະລຸນາໃສ່ຊື່ວັດທີ່ບວດ ....." 
//             className="w-full px-4 py-3 bg-gray-700 text-white rounded" 
//             required
//             value={formData.templeName}
//             onChange={handleInputChange}
//           />
//         </div>
        
//         <div>
//           <label className="block mb-1">
//             ວັນ/ເດືອນ/ປີ ມື້ບວດ<span className="text-red-500">*</span>
//           </label>
//           <input 
//             type="date" 
//             name="ordinationDate" 
//             className="w-full px-4 py-2 bg-white text-gray-800 rounded border border-gray-300" 
//             value={formData.ordinationDate}
//             onChange={handleInputChange}
//           />
//         </div>
        
//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={onBack}
//             className="bg-white text-red-500 border-2 px-6 py-2 rounded cursor-pointer"
//             disabled={isLoading}
//           >
//             ຍ້ອນກັບ
//           </button>
//           <button 
//             type="submit" 
//             className="bg-blue-400 text-white px-6 py-2 rounded cursor-pointer"
//             disabled={isLoading}
//           >
//             {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ບັນທຶກ"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default EditInfor;


"use client";
import { useState, useEffect } from 'react';
import { getSubCollectionData, updateSubCollectionData, addToSubCollection } from "../../../firebase/firebaseUtilsUpdate";

function EditInfor({ userData, onBack, onSuccess, memberId }) {
  const [formData, setFormData] = useState({
    preceptorName: '',
    preceptorSurname: '',
    templeName: '',
    ordinationDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [preceptorId, setPreceptorId] = useState(null);
  
  // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const currentMemberId = memberId || (userData && userData.memberId);
    if (currentMemberId) {
      loadPreceptorData(currentMemberId);
    } else {
      setIsLoadingData(false);
    }
  }, [userData, memberId]);
  
  // ฟังก์ชันโหลดข้อมูลจาก Firebase
  const loadPreceptorData = async (currentMemberId) => {
    try {
      const preceptorData = await getSubCollectionData(currentMemberId, 'preceptor');
      if (preceptorData && preceptorData.length > 0) {
        // เรียงลำดับตามวันที่อัปเดตล่าสุด
        const sortedData = preceptorData.sort((a, b) => {
          if (a.updatedAt && b.updatedAt) {
            return b.updatedAt.toDate() - a.updatedAt.toDate();
          }
          return 0;
        });
        
        const mostRecentData = sortedData[0];
        setFormData({
          preceptorName: mostRecentData.preceptorName || '',
          preceptorSurname: mostRecentData.preceptorSurname || '',
          templeName: mostRecentData.templeName || '',
          ordinationDate: mostRecentData.ordinationDate || ''
        });
        setPreceptorId(mostRecentData.id);
      }
    } catch (error) {
      console.error("Error loading preceptor data:", error);
      alert("ไม่สามารถโหลดข้อมูลพระอุปัดชาได้");
    } finally {
      setIsLoadingData(false);
    }
  };
  
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
      const currentMemberId = memberId || (userData && userData.memberId);
      
      if (!currentMemberId) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      
      const preceptorData = {
        preceptorName: formData.preceptorName.trim(),
        preceptorSurname: formData.preceptorSurname.trim(),
        templeName: formData.templeName.trim(),
        ordinationDate: formData.ordinationDate
      };
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!preceptorData.preceptorName || !preceptorData.preceptorSurname || 
          !preceptorData.templeName || !preceptorData.ordinationDate) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
      }
      
      let result;
      if (preceptorId) {
        console.log("Updating existing preceptor data...");
        result = await updateSubCollectionData(
          currentMemberId,
          'preceptor',
          preceptorId,
          preceptorData
        );
      } else {
        console.log("Creating new preceptor data...");
        result = await addToSubCollection(
          currentMemberId,
          'preceptor',
          preceptorData
        );
      }
      
      if (result.success) {
        console.log("Preceptor data saved successfully");
        alert("ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ");
        
        // เรียก callback function หากมี
        if (onSuccess) {
          onSuccess();
        }
      }
      
    } catch (error) {
      console.error("Error saving preceptor data:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            required
            value={formData.ordinationDate}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-white text-red-500 border-2 border-red-500 px-6 py-2 rounded cursor-pointer hover:bg-red-50 transition-colors"
            disabled={isLoading}
          >
            ຍ້ອນກັບ
          </button>
          <button 
            type="submit" 
            className="bg-blue-400 text-white px-6 py-2 rounded cursor-pointer hover:bg-blue-500 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ບັນທຶກ"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditInfor;