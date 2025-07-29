
// // services/memberService.js
// import { db, auth } from '../../firebase/config';
// import { 
//   collection, 
//   getDocs, 
//   query, 
// } from 'firebase/firestore';

// // ฟังก์ชันจัดรูปแบบวันที่
// const formatDate = (dateValue, memberId = null) => {
//   console.log(`[formatDate] Member ${memberId}:`, {
//     dateValue,
//     type: typeof dateValue,
//     hasToDate: dateValue && typeof dateValue.toDate === 'function',
//     isDate: dateValue instanceof Date
//   });
  
//   if (!dateValue) {
//     console.log(`[formatDate] Member ${memberId}: No date value`);
//     return null;
//   }
  
//   try {
//     let date;
//     if (dateValue.toDate && typeof dateValue.toDate === 'function') {
//       // Firestore Timestamp
//       date = dateValue.toDate();
//       console.log(`[formatDate] Member ${memberId}: Converted from Timestamp:`, date);
//     } else if (dateValue instanceof Date) {
//       date = dateValue;
//       console.log(`[formatDate] Member ${memberId}: Already Date object:`, date);
//     } else if (typeof dateValue === 'string') {
//       date = new Date(dateValue);
//       console.log(`[formatDate] Member ${memberId}: Converted from string:`, date);
//     } else if (typeof dateValue === 'number') {
//       date = new Date(dateValue);
//       console.log(`[formatDate] Member ${memberId}: Converted from number:`, date);
//     } else {
//       console.log(`[formatDate] Member ${memberId}: Unknown date format:`, dateValue);
//       return null;
//     }
    
//     // ตรวจสอบว่าเป็น Date ที่ถูกต้อง
//     if (isNaN(date.getTime())) {
//       console.log(`[formatDate] Member ${memberId}: Invalid date`);
//       return null;
//     }
    
//     const formatted = date.toLocaleDateString('th-TH', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit'
//     });
    
//     console.log(`[formatDate] Member ${memberId}: Final formatted:`, formatted);
//     return formatted;
//   } catch (error) {
//     console.error(`[formatDate] Member ${memberId}: Error:`, error);
//     return null;
//   }
// };

// const countMemberStatus = (members) => {
//   let monks = 0;
//   let novices = 0;
  
//   members.forEach(member => {
//     if (member.status === "monks" || member.status === "ພຣະ") {
//       monks++;
//     } else if (member.status === "novices" || member.status === "ສາມະເນນ") {
//       novices++;
//     }
//   });
  
//   return { monks, novices };
// };

// const fetchMemberMovements = async (memberId) => {
//   try {
//     const moveRef = collection(db, 'member', memberId, 'MoveIn');
//     const moveSnapshot = await getDocs(moveRef);
    
//     if (moveSnapshot.empty) return { moveStatus: null, moveDate: null };
    
//     const moveData = [];
//     moveSnapshot.forEach(doc => {
//       const data = doc.data();
//       moveData.push(data);
//     });
    
//     if (moveData.length > 0) {
//       const latestMove = moveData[moveData.length - 1];
//       return {
//         moveStatus: latestMove.moveStatus || null,
//         moveDate: latestMove.moveDate || null
//       };
//     }
    
//     return { moveStatus: null, moveDate: null };
//   } catch (error) {
//     console.error("Error fetching movement data for member", memberId, error);
//     return { moveStatus: null, moveDate: null };
//   }
// };

// // ฟังก์ชันดึงข้อมูลสมาชิกพื้นฐาน
// const fetchBasicMembers = async (queryRef = null) => {
//   const membersRef = collection(db, 'member');
//   const q = queryRef || query(membersRef);
  
//   const querySnapshot = await getDocs(q);
//   const membersData = [];
  
//   querySnapshot.forEach((memberDoc) => {
//     const data = memberDoc.data();
//     const memberData = {
//       id: memberDoc.id,
//       ...data
//     };
//     membersData.push(memberData);
//   });
  
//   return membersData;
// };

// // ฟังก์ชันกรองสมาชิกตามสถานะ onStatus
// const filterMembersByStatus = (members) => {
//   console.log(`🔍 Filtering members by onStatus. Total before filter: ${members.length}`);
  
//   const filteredMembers = members.filter(member => {
//     const onStatus = member.onStatus;
//     console.log(`[Filter] Member ${member.id} - onStatus: ${onStatus}`);

//     if (onStatus === "active" || !onStatus) {
//       return true;
//     }

//     if (onStatus === "moved") {
//       console.log(`[Filter] Member ${member.id} excluded - status is moved`);
//       return false;
//     }
    
//     // สำหรับสถานะอื่นๆ ให้แสดง (ถ้าไม่ใช่ moved)
//     return true;
//   });
  
//   console.log(`✅ Filtered members: ${filteredMembers.length} active members`);
//   return filteredMembers;
// };

// // แก้ไขฟังก์ชัน addImagesToMembers ให้ใช้ imageUrl ที่มีอยู่แล้วใน Firestore
// const addImagesToMembers = async (members) => {
//   console.log(`🖼️ Processing images for ${members.length} members...`);
  
//   try {
//     members.forEach(member => {
//       // ตรวจสอบว่ามี imageUrl ใน Firestore หรือไม่
//       if (member.imageUrl) {
//         console.log(`✅ Member ${member.id} has imageUrl: ${member.imageUrl}`);
//       } else {
//         console.log(`⚠️ Member ${member.id} has no imageUrl`);
//         member.imageUrl = null; // ตั้งค่าเป็น null ถ้าไม่มี
//       }
//     });
    
//     const membersWithImages = members.filter(m => m.imageUrl).length;
//     console.log(`📊 Members with images: ${membersWithImages}/${members.length}`);
    
//   } catch (error) {
//     console.error(`❌ Error in addImagesToMembers:`, error);
//   }
  
//   return members;
// };

// export const fetchAllMembers = async () => {
//   try {
//     console.log('🚀 Starting fetchAllMembers...');
    
//     // ดึงข้อมูลสมาชิกทั้งหมด
//     const allMembersData = await fetchBasicMembers();
//     console.log(`📋 Found ${allMembersData.length} total members`);
    
//     // กรองสมาชิกตามสถานะ onStatus (เฉพาะ active)
//     const activeMembersData = filterMembersByStatus(allMembersData);
    
//     // ดึงข้อมูลการเคลื่อนไหวสำหรับสมาชิกที่ active เท่านั้น
//     for (const member of activeMembersData) {
//       const movementData = await fetchMemberMovements(member.id);
//       member.moveStatus = movementData.moveStatus;
//       const dateToFormat = movementData.moveDate || member.createdAt;
//       member.formattedDate = formatDate(dateToFormat, member.id);
//     }

//     // ประมวลผลรูปภาพสำหรับสมาชิกที่ active
//     await addImagesToMembers(activeMembersData);
    
//     // นับจำนวนสมาชิกตามประเภท
//     const { monks, novices } = countMemberStatus(activeMembersData);
    
//     console.log(`✅ Final result: ${activeMembersData.length} active members (${monks} monks, ${novices} novices)`);
    
//     return { 
//       members: activeMembersData, 
//       stats: {
//         total: activeMembersData.length,
//         monks,
//         novices
//       }
//     };
//   } catch (error) {
//     console.error("❌ Error fetching data:", error);
//     throw error;
//   }
// };

// export const searchMembers = async (searchTerm) => {
//   try {
//     console.log(`🔍 Searching members with term: "${searchTerm}"`);
    
//     const q = query(collection(db, 'member'));
//     const allMembers = await fetchBasicMembers(q);
    
//     // กรองสมาชิกตามสถานะ onStatus ก่อน
//     const activeMembers = filterMembersByStatus(allMembers);
    
//     // ค้นหาในสมาชิกที่ active เท่านั้น
//     const searchResults = activeMembers.filter(data => {
//       const nameMatch = (data.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
//       const surnameMatch = (data.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
//       const phoneMatch = (data.phoneNumber || '').includes(searchTerm);
      
//       return nameMatch || surnameMatch || phoneMatch;
//     });

//     for (const member of searchResults) {
//       const movementData = await fetchMemberMovements(member.id);
//       member.moveStatus = movementData.moveStatus;
//       const dateToFormat = movementData.moveDate || member.createdAt;
//       member.formattedDate = formatDate(dateToFormat, member.id);
      
//       console.log(`[searchMembers] Member ${member.id} final formattedDate:`, member.formattedDate);
//     }

//     await addImagesToMembers(searchResults);
//     const { monks, novices } = countMemberStatus(searchResults);
    
//     return { 
//       members: searchResults, 
//       stats: {
//         total: searchResults.length,
//         monks,
//         novices
//       }
//     };
//   } catch (error) {
//     console.error("❌ Error searching:", error);
//     throw error;
//   }
// };

// export const checkAuth = () => {
//   return auth.currentUser;
// };


// services/memberService.js
import { db, auth } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
} from 'firebase/firestore';

// ฟังก์ชันจัดรูปแบบวันที่เป็น DD/MM/YYYY
const formatDate = (dateValue, memberId = null) => {
  console.log(`[formatDate] Member ${memberId}:`, {
    dateValue,
    type: typeof dateValue,
    hasToDate: dateValue && typeof dateValue.toDate === 'function',
    isDate: dateValue instanceof Date
  });
  
  if (!dateValue) {
    console.log(`[formatDate] Member ${memberId}: No date value`);
    return null;
  }
  
  try {
    let date;
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      // Firestore Timestamp
      date = dateValue.toDate();
      console.log(`[formatDate] Member ${memberId}: Converted from Timestamp:`, date);
    } else if (dateValue instanceof Date) {
      date = dateValue;
      console.log(`[formatDate] Member ${memberId}: Already Date object:`, date);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
      console.log(`[formatDate] Member ${memberId}: Converted from string:`, date);
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
      console.log(`[formatDate] Member ${memberId}: Converted from number:`, date);
    } else {
      console.log(`[formatDate] Member ${memberId}: Unknown date format:`, dateValue);
      return null;
    }
    
    // ตรวจสอบว่าเป็น Date ที่ถูกต้อง
    if (isNaN(date.getTime())) {
      console.log(`[formatDate] Member ${memberId}: Invalid date`);
      return null;
    }
    
    // จัดรูปแบบเป็น DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}/${month}/${year}`;
    
    console.log(`[formatDate] Member ${memberId}: Final formatted:`, formatted);
    return formatted;
  } catch (error) {
    console.error(`[formatDate] Member ${memberId}: Error:`, error);
    return null;
  }
};

const countMemberStatus = (members) => {
  let monks = 0;
  let novices = 0;
  
  members.forEach(member => {
    if (member.status === "monks" || member.status === "ພຣະ") {
      monks++;
    } else if (member.status === "novices" || member.status === "ສາມະເນນ") {
      novices++;
    }
  });
  
  return { monks, novices };
};

const fetchMemberMovements = async (memberId) => {
  try {
    const moveRef = collection(db, 'member', memberId, 'MoveIn');
    const moveSnapshot = await getDocs(moveRef);
    
    if (moveSnapshot.empty) return { moveStatus: null, moveDate: null };
    
    const moveData = [];
    moveSnapshot.forEach(doc => {
      const data = doc.data();
      moveData.push(data);
    });
    
    if (moveData.length > 0) {
      const latestMove = moveData[moveData.length - 1];
      return {
        moveStatus: latestMove.moveStatus || null,
        moveDate: latestMove.moveDate || null
      };
    }
    
    return { moveStatus: null, moveDate: null };
  } catch (error) {
    console.error("Error fetching movement data for member", memberId, error);
    return { moveStatus: null, moveDate: null };
  }
};

// ฟังก์ชันดึงข้อมูลสมาชิกพื้นฐาน
const fetchBasicMembers = async (queryRef = null) => {
  const membersRef = collection(db, 'member');
  const q = queryRef || query(membersRef);
  
  const querySnapshot = await getDocs(q);
  const membersData = [];
  
  querySnapshot.forEach((memberDoc) => {
    const data = memberDoc.data();
    const memberData = {
      id: memberDoc.id,
      ...data
    };
    membersData.push(memberData);
  });
  
  return membersData;
};

// ฟังก์ชันกรองสมาชิกตามสถานะ onStatus
const filterMembersByStatus = (members) => {
  console.log(`🔍 Filtering members by onStatus. Total before filter: ${members.length}`);
  
  const filteredMembers = members.filter(member => {
    const onStatus = member.onStatus;
    console.log(`[Filter] Member ${member.id} - onStatus: ${onStatus}`);

    if (onStatus === "active" || !onStatus) {
      return true;
    }

    if (onStatus === "moved") {
      console.log(`[Filter] Member ${member.id} excluded - status is moved`);
      return false;
    }
    
    // สำหรับสถานะอื่นๆ ให้แสดง (ถ้าไม่ใช่ moved)
    return true;
  });
  
  console.log(`✅ Filtered members: ${filteredMembers.length} active members`);
  return filteredMembers;
};

// แก้ไขฟังก์ชัน addImagesToMembers ให้ใช้ imageUrl ที่มีอยู่แล้วใน Firestore
const addImagesToMembers = async (members) => {
  console.log(`🖼️ Processing images for ${members.length} members...`);
  
  try {
    members.forEach(member => {
      // ตรวจสอบว่ามี imageUrl ใน Firestore หรือไม่
      if (member.imageUrl) {
        console.log(`✅ Member ${member.id} has imageUrl: ${member.imageUrl}`);
      } else {
        console.log(`⚠️ Member ${member.id} has no imageUrl`);
        member.imageUrl = null; // ตั้งค่าเป็น null ถ้าไม่มี
      }
    });
    
    const membersWithImages = members.filter(m => m.imageUrl).length;
    console.log(`📊 Members with images: ${membersWithImages}/${members.length}`);
    
  } catch (error) {
    console.error(`❌ Error in addImagesToMembers:`, error);
  }
  
  return members;
};

export const fetchAllMembers = async () => {
  try {
    console.log('🚀 Starting fetchAllMembers...');
    
    // ดึงข้อมูลสมาชิกทั้งหมด
    const allMembersData = await fetchBasicMembers();
    console.log(`📋 Found ${allMembersData.length} total members`);
    
    // กรองสมาชิกตามสถานะ onStatus (เฉพาะ active)
    const activeMembersData = filterMembersByStatus(allMembersData);
    
    // ดึงข้อมูลการเคลื่อนไหวสำหรับสมาชิกที่ active เท่านั้น
    for (const member of activeMembersData) {
      const movementData = await fetchMemberMovements(member.id);
      member.moveStatus = movementData.moveStatus;
      const dateToFormat = movementData.moveDate || member.createdAt;
      member.formattedDate = formatDate(dateToFormat, member.id);
    }

    // ประมวลผลรูปภาพสำหรับสมาชิกที่ active
    await addImagesToMembers(activeMembersData);
    
    // นับจำนวนสมาชิกตามประเภท
    const { monks, novices } = countMemberStatus(activeMembersData);
    
    console.log(`✅ Final result: ${activeMembersData.length} active members (${monks} monks, ${novices} novices)`);
    
    return { 
      members: activeMembersData, 
      stats: {
        total: activeMembersData.length,
        monks,
        novices
      }
    };
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    throw error;
  }
};

export const searchMembers = async (searchTerm) => {
  try {
    console.log(`🔍 Searching members with term: "${searchTerm}"`);
    
    const q = query(collection(db, 'member'));
    const allMembers = await fetchBasicMembers(q);
    
    // กรองสมาชิกตามสถานะ onStatus ก่อน
    const activeMembers = filterMembersByStatus(allMembers);
    
    // ค้นหาในสมาชิกที่ active เท่านั้น
    const searchResults = activeMembers.filter(data => {
      const nameMatch = (data.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const surnameMatch = (data.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = (data.phoneNumber || '').includes(searchTerm);
      
      return nameMatch || surnameMatch || phoneMatch;
    });

    for (const member of searchResults) {
      const movementData = await fetchMemberMovements(member.id);
      member.moveStatus = movementData.moveStatus;
      const dateToFormat = movementData.moveDate || member.createdAt;
      member.formattedDate = formatDate(dateToFormat, member.id);
      
      console.log(`[searchMembers] Member ${member.id} final formattedDate:`, member.formattedDate);
    }

    await addImagesToMembers(searchResults);
    const { monks, novices } = countMemberStatus(searchResults);
    
    return { 
      members: searchResults, 
      stats: {
        total: searchResults.length,
        monks,
        novices
      }
    };
  } catch (error) {
    console.error("❌ Error searching:", error);
    throw error;
  }
};

export const checkAuth = () => {
  return auth.currentUser;
};