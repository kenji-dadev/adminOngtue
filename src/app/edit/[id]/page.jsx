
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; 
import { getMemberData } from '../../firebase/firebaseUtilsUpdate';
import EditInfor from './component/EditInfor';
import EditUser from './component/EditUser';
import EditMove from './component/EditMove';
import ProtectedRoute from '../../protectedRoute'; 

function editpage() {
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null);
  const router = useRouter(); 
  const params = useParams();
  const searchParams = useSearchParams();

  // โหลดข้อมูลสมาชิกเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const loadMemberData = async () => {
      try {
        let currentMemberId = null;
        if (params?.id) {
          currentMemberId = params.id;
        }
        
        if (!currentMemberId && searchParams) {
          currentMemberId = searchParams.get('id');
        }
        
        if (!currentMemberId && router.query?.id) {
          currentMemberId = router.query.id;
        }
        
        if (!currentMemberId && typeof window !== 'undefined') {
          const urlParts = window.location.pathname.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart && lastPart !== 'edit') {
            currentMemberId = lastPart;
          }
        }
        
        console.log("Final Member ID:", currentMemberId);
        
        if (currentMemberId) {
          setMemberId(currentMemberId);
          
          // โหลดข้อมูลสมาชิก
          const memberData = await getMemberData(currentMemberId);
          setUserData({
            ...memberData,
            memberId: currentMemberId
          });
          console.log("Member data loaded:", memberData);
        } else {
          alert("ບໍ່ເຫັນ ID ຂອງສາມະຊີກຈາກ URL ຂອງທ່ານ");
          router.push('/');
          return;
        }
      } catch (error) {
        console.error("Error loading member data:", error);
        alert(`ບໍ່ມີສາມະຊີກ: ${error.message}`);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady || params || searchParams) {
      loadMemberData();
    }
  }, [params, searchParams, router, router.isReady]);

  const handleUserDataSubmit = (data) => {
    console.log("Received user data in parent component:", data);
    setUserData(prevData => ({
      ...prevData,
      ...data
    }));
    setStep(2);
  };

  const handleSkip = (shouldSkip) => {
    if (shouldSkip) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSuccess = () => {
    console.log("Data saved successfully, redirecting to home...");
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="flex">
        <main className="flex-1 p-8 bg-[#E5E7EB]">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
            {step === 1 && (
              <EditUser 
                onSubmitData={handleUserDataSubmit}
                initialData={userData}
                memberId={memberId}
              />
            )}
            {step === 2 && (
              <EditMove 
                onSkip={handleSkip}
                onBack={handleBack}
                onContinue={() => setStep(3)}
                userData={userData}
                memberId={memberId}
              />
            )}
            {step === 3 && (
              <EditInfor 
                userData={userData}
                onBack={handleBack}
                onSuccess={handleSuccess}
                memberId={memberId}
              />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default editpage;