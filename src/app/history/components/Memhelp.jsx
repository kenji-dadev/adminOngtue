// components/Memhelp.js

// ฟังก์ชันแสดงสถานะ
export const getStatusDisplay = (status) => {
  if (status === "monks" || status === "ພຣະ") {
    return "ພຣະ";
  } else if (status === "novices" || status === "ສາມະເນນ") {
    return "ສາມະເນນ";
  }
  return status || "-";
};

// ฟังก์ชันแสดงชื่อเต็ม
export const getFullName = (firstName, lastName) => {
  const first = firstName || '';
  const last = lastName || '';
  return `${first} ${last}`.trim() || '-';
};

// ฟังก์ชันสีสำหรับสถานะ
export const getStatusColor = (status) => {
  if (status === "monks" || status === "ພຣະ") {
    return "bg-orange-100 text-orange-800";
  } else if (status === "novices" || status === "ສາມະເນນ") {
    return "bg-blue-100 text-blue-800";
  }
  return "bg-gray-100 text-gray-800";
};