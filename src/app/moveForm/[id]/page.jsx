"use client"
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AddForm from '../[id]/components/AddForm';
import PrintForm from './components/PrintForm';
import ProtectedRoute from '../../protectedRoute'; 

export default function MoveFormPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id;
  const [currentStep, setCurrentStep] = useState('form'); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataSubmitted = () => {
    // เพิ่มค่า refreshTrigger และเปลี่ยนไปหน้า print
    setRefreshTrigger(prev => prev + 1);
    setCurrentStep('print');
  };

  const handleBackToForm = () => {
    // กลับไปหน้าฟอร์มเพื่อแก้ไขข้อมูล
    setCurrentStep('form');
  };

  const handleNewForm = () => {
    // เริ่มฟอร์มใหม่
    setCurrentStep('form');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackHome = () => {
    // กลับไปหน้าแรก
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Step Indicator */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="font-medium">ຂັ້ນຕອນບັນທຶກຂໍ້ມູນ</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep === 'print' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'print' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'print' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="font-medium">ຂັ້ນຕອນປິນເອກະສານ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-4">
          {currentStep === 'form' && (
            <div>
              {/* Back Home Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackHome}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  <span>ກັບໜ້າຫຼັກ</span>
                </button>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ຂໍ້ມູນການຍ້າຍສຳນັກ</h2>
                <p className="text-gray-600">ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບຖ້ວນ</p>
              </div>
              <AddForm memberId={memberId} onDataSubmitted={handleDataSubmitted} />
            </div>
          )}

          {currentStep === 'print' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ເອກະສານການຍ້າຍສຳນັກ</h2>
                <p className="text-gray-600">ທ່ານສາມາດພິມ ຫຼື ດາວໂຫຼດເອກະສານໄດ້</p>
                
                {/* Action buttons */}
                <div className="flex gap-4 justify-center mt-4 mb-6">
                  <button
                    onClick={handleBackToForm}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ສ້າງຟອມໃໝ່
                  </button>
                  <button
                    onClick={handleBackHome}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ກັບໜ້າຫຼັກ
                  </button>
                </div>
              </div>
              <PrintForm memberId={memberId} key={refreshTrigger} />
            </div>
          )}
        </div>

        {/* Success Message - Show briefly after form submission */}
        {currentStep === 'print' && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}