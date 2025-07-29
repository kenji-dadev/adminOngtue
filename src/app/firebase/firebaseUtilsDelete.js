import { 
  collection,
  doc,
  getDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

import { deleteObject, ref } from 'firebase/storage';

import { db, storage } from './config'; 

const getStoragePathFromURL = (imageUrl) => {
  try {
    if (!imageUrl) return null;
    
    const urlParts = imageUrl.split('?')[0]; // ຕັດ query parameters ອອກ
    const pathPart = urlParts.split('/o/')[1]; // ດຶງສ່ວນ path ຫຼັງ /o/
    
    if (!pathPart) return null;
    
    // ແປງ URL encoding ກັບຄືນເປັນ path ປົກກະຕິ
    const decodedPath = decodeURIComponent(pathPart);
    
    console.log('Original URL:', imageUrl);
    console.log('Extracted path:', decodedPath);
    
    return decodedPath;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
};

// ຟັງຊັນລົບຮູບຈາກ Firebase Storage
const deleteImageFromStorage = async (memberId, imageUrl) => {
  try {
    if (!imageUrl) {
      console.log(`ℹ️ No image URL provided for member: ${memberId}`);
      return;
    }

    // ດຶງ path ຈາກ URL
    const storagePath = getStoragePathFromURL(imageUrl);
    
    if (!storagePath) {
      console.log(`ℹ️ Could not extract storage path from URL for member: ${memberId}`);
      return;
    }

    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
    console.log(`✅ Image deleted from storage: ${storagePath}`);
    
  } catch (error) {
    // ຖ້າບໍ່ມີຮູບຢູ່ໃນ storage ກໍບໍ່ເປັນຫຍັງ
    if (error.code === 'storage/object-not-found') {
      console.log(`ℹ️ No image found in storage for member: ${memberId}`);
    } else {
      console.error('❌ Error deleting image from storage:', error);
      // ບໍ່ throw error ເພື່ອໃຫ້ລົບຂໍ້ມູນອື່ນໆ ຕໍ່ໄປ
    }
  }
};

// ຟັງຊັນລົບຂໍ້ມູນທັງໝົດຂອງສະມາຊິກ
export const deleteAllMemberData = async (memberId) => {
  try {
    if (!memberId) {
      throw new Error("Member ID is required");
    }

    console.log(`🗑️ Starting deletion process for member: ${memberId}`);

    // ດຶງຂໍ້ມູນສະມາຊິກກ່ອນເພື່ອເອົາ imageUrl
    const memberRef = doc(db, 'member', memberId);
    const memberDoc = await getDoc(memberRef);
    
    let imageUrl = null;
    if (memberDoc.exists()) {
      const memberData = memberDoc.data();
      imageUrl = memberData.imageUrl;
      console.log(`📸 Found image URL: ${imageUrl}`);
    } else {
      console.log(`⚠️ Member document not found: ${memberId}`);
      // ຖ້າບໍ່ມີ document ກໍບໍ່ຕ້ອງລົບຫຍັງເພີ່ມ
      return false;
    }

    // ລົບຮູບຈາກ Firebase Storage ກ່ອນ (ໃຊ້ imageUrl ທີ່ດຶງມາ)
    await deleteImageFromStorage(memberId, imageUrl);

    // ລາຍການ sub-collections ທີ່ຕ້ອງລົບ
    const subCollections = [
      'User',        // USER_INPUT
      'MoveIn',      // MOVEMENT
      'moveOut',     // MOVE_OUT
      'preceptor',   // INFOR_INPUT
      'documents'    // documents collection
    ];

    // ລົບ sub-collections ທັງໝົດກ່ອນ
    for (const subCollectionName of subCollections) {
      try {
        const subCollectionRef = collection(db, 'member', memberId, subCollectionName);
        const subDocs = await getDocs(subCollectionRef);

        if (!subDocs.empty) {
          console.log(`📄 Deleting ${subDocs.size} documents from ${subCollectionName}`);

          // ລົບເອກະສານທັງໝົດໃນ sub-collection
          const deletePromises = subDocs.docs.map(docSnapshot => 
            deleteDoc(docSnapshot.ref)
          );

          await Promise.all(deletePromises);
          console.log(`✅ Successfully deleted all documents from ${subCollectionName}`);
        } else {
          console.log(`📭 No documents found in ${subCollectionName}`);
        }
      } catch (subError) {
        console.error(`❌ Error deleting ${subCollectionName}:`, subError);
        // ບໍ່ throw error ທີ່ນີ້ ເພື່ອໃຫ້ລົບ sub-collection ອື່ນໆ ຕໍ່ໄປ
      }
    }

    // ລົບເອກະສານຫຼັກ (member document) ໃນຂັ້ນສຸດທ້າຍ
    await deleteDoc(memberRef);

    console.log(`✅ Successfully deleted member document: ${memberId}`);
    console.log(`🎉 Complete deletion process finished for member: ${memberId}`);

    return true;
  } catch (error) {
    console.error("❌ Error in deleteAllMemberData:", error);
    throw error;
  }
};