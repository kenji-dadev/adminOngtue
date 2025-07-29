
import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config'; 

function PrintForm({ memberId }) {
  const formRef = useRef(null);
  const [moveOutData, setMoveOutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันดึงข้อมูล moveOut จาก Firebase
  const fetchMoveOutData = async () => {
    try {
      setLoading(true);
      if (!memberId) {
        throw new Error('Member ID is required');
      }

      // ดึงข้อมูลจาก subcollection moveOut
      const moveOutCollectionRef = collection(db, 'member', memberId, 'moveOut');
      const querySnapshot = await getDocs(moveOutCollectionRef);
      
      if (!querySnapshot.empty) {
        // เอาข้อมูลล่าสุด (หรือข้อมูลแรกถ้ามีหลายรายการ)
        const latestDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const data = latestDoc.data();
        setMoveOutData(data);
      } else {
        setMoveOutData(null);
      }
    } catch (err) {
      console.error('Error fetching moveOut data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component mount หรือเมื่อ memberId เปลี่ยน
  useEffect(() => {
    if (memberId) {
      fetchMoveOutData();
    }
  }, [memberId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window with just the form content for better PDF generation
    const printWindow = window.open('', '_blank');
    const formHTML = formRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ໃບຢ້າຍສຳມັກ</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Noto Sans Lao', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              line-height: 2;
              width: 210mm;
              min-height: 297mm;
              box-sizing: border-box;
            }
            .text-red-500 { color: #ef4444; }
            .text-center { text-align: center; }
            .text-2xl { font-size: 1.5rem; }
            .font-bold { font-weight: bold; }
            .mb-4 { margin-bottom: 1rem; }
            .my-10 { margin: 2.5rem 0; }
            .my-20 { margin: 5rem 0; }
            .mt-2 { margin-top: 0.5rem; }
            .border { border: 1px solid #000; }
            .p-2 { padding: 0.5rem; }
            .h-24 { height: 6rem; }
            .h-52 { height: 13rem; }
            /* Form field styles */
            .form-field {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 200px;
              margin: 0 5px;
              padding-bottom: 2px;
            }
            .form-field-long {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 400px;
              margin: 0 5px;
              padding-bottom: 2px;
            }
            .form-field-short {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 150px;
              margin: 0 5px;
              padding-bottom: 2px;
            }
            .form-field-date {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 80px;
              margin: 0 5px;
              text-align: center;
              padding-bottom: 2px;
            }
            .description-box {
              border: 1px solid #000;
              padding: 10px;
              min-height: 200px;
              margin: 20px 0;
              font-size: 1.2rem;
              line-height: 1.6;
            }
            @media print {
              body { 
                margin: 0;
                padding: 20px;
                width: 210mm;
                min-height: 297mm;
              }
            }
          </style>
        </head>
        <body>
          ${formHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบ วัน/เดือน/ปี
  const formatDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() + 543).toString(); // แปลงเป็น พ.ศ.
    
    return { day, month, year };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">ເກີດຂໍ້ຜິດພາດ: {error}</div>
      </div>
    );
  }

  if (!moveOutData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນການຍ້າຍ</div>
      </div>
    );
  }

  const dateInfo = formatDate(moveOutData.moveDate);

  return (
    <div className="flex flex-col items-center p-6 min-h-screen">
      {/* Action buttons */}
      <div className="no-print mb-6 flex gap-4 justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer size={20} />
          ພິມ (Print)
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          ດາວໂຫຼດ (Download)
        </button>
      </div>

      <div ref={formRef} className="bg-white p-8 w-[210mm] shadow-md text-[16px] leading-8 min-h-[297mm] mx-auto">
        <h2 className="text-center text-4xl font-bold mb-4">ໃບຍ້າຍສຳນັກ</h2>

        <p className='my-10 text-2xl'>
          ຍ້າຍຈາກສຳນັກວັດ <span className="text-red-500">*</span>
......<span className="form-field-long font-bold">{moveOutData.moveToTemple || ''}</span>.....
         
        </p>

        <p className='my-10 text-2xl'>
          ບ້ານ<span className="text-red-500 ">*</span>...<span className="form-field-short font-bold ">{moveOutData.village || ''}</span>...
          ເມືອງ<span className="text-red-500">*</span>...<span className="form-field-short font-bold mx-2.5">{moveOutData.district || ''}</span>...
          ແຂວງ<span className="text-red-500">*</span>...<span className="form-field-short font-bold ">{moveOutData.province || ''}</span>.....
        </p>

        <p className='my-10 text-2xl'>
          ວັນທີ<span className="text-red-500">*</span>...<span className="form-field-date font-bold mx-7">{dateInfo.day}</span>.....
          ເດືອນ<span className="text-red-500 font-bold">*</span>...<span className="form-field-date font-bold mx-7">{dateInfo.month}</span>....
          ປີ<span className="text-red-500">*</span>...<span className="form-field-date font-bold mx-7">{dateInfo.year}</span>....
        </p>

        <p className='my-10 text-2xl'>ໝາຍເຫດ <span className="text-red-500">*</span></p>
        <div className="description-box font-bold">
          {moveOutData.description || ''}
        </div>

        <p className='my-20 text-2xl'>
          ຄະນະປົກຄອງວັດ <span className="text-red-500">*</span>.................... 
          <span className="form-field-long">&nbsp;</span>
        </p>
        <p className='my-20 text-2xl'>
          ເຊັນ <span className="text-red-500">*</span>........................................ 
          <span className="form-field">&nbsp;</span>
        </p>
        <p className='my-10 text-2xl'>
          ລົງຊື່ <span className="text-red-500">*</span>........................................ 
          <span className="form-field">&nbsp;</span>
        </p>
      </div>

      <style jsx>{`
        @page {
          size: A4;
          margin: 20mm;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            width: 210mm;
            min-height: 297mm;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintForm;