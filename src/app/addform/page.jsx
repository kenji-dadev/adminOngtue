"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Inforinput from './component/Inforinput';
import Userinput from './component/Userinput';
import Moveform from './component/Moveform';
import ProtectedRoute from '../protectedRoute'; 
function Page() {
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const handleUserDataSubmit = (data) => {
    console.log("Received user data in parent component:", data);
    setUserData(data);
    setStep(2);
  };

  // Function to handle skip from Moveform
  const handleSkip = (shouldSkip) => {
    if (shouldSkip) {
      setStep(3);
    }
  };

  // Function to handle back button
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  // Function to handle success and redirect to home
  const handleSuccess = () => {
    console.log("Data saved successfully, redirecting to home...");
    router.push('/');
  };

  let activePage = "members";

  return (
    <div className="flex">
      <main className="flex-1 p-8 bg-[#E5E7EB]">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-xl">กำลังโหลด...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
              <ProtectedRoute>
                <Userinput onSubmitData={handleUserDataSubmit} />
              </ProtectedRoute>
            )}
            {step === 2 && (
              <ProtectedRoute>
                <Moveform 
                  onSkip={handleSkip}
                  onBack={handleBack}
                  onContinue={() => setStep(3)}
                  userData={userData}
                />
              </ProtectedRoute>
            )}
            {step === 3 && (
              <ProtectedRoute>
                <Inforinput 
                  userData={userData}
                  onBack={handleBack}
                  onSuccess={handleSuccess} 
                />
              </ProtectedRoute>
            )}
                        </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Page;