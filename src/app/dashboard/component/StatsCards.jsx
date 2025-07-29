// components/StatsCards.js
import React from 'react';

export default function StatsCards({ Members, monkCount, noviceCount }) {
  // คำนวณจำนวนสมาชิกทั้งหมด
  const totalMembers = Members ? Members.length : 0;
  
  // เพิ่มการตรวจสอบและแสดงค่าที่ชัดเจน
  const displayMonkCount = monkCount || 0;
  const displayNoviceCount = noviceCount || 0;
  
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg p-8 shadow-md">   
        <div className="text-lg text-gray-500 mb-4">ຈຳນວນສາມະຊິກທັງໝົດ</div>
        <div className="text-2xl font-semibold">
          ຈຳນວນ: <span className="text-[#3B82F6]">{totalMembers}</span> ອົງ
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-8 shadow-md">
        <div className="text-lg text-gray-500 mb-4">ຈຳນວນພຣະ-ເນນ</div>
        <div className="text-2xl font-semibold">
          ພຣະ: <span className="text-[#3B82F6]">{displayMonkCount}</span> ອົງ
          <br />
          ສາມະເນນ: <span className="text-[#3B82F6]">{displayNoviceCount}</span> ອົງ
        </div>
        
      </div>
    </div>
  );
}