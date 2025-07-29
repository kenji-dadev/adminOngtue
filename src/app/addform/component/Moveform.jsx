'use client'

import { useState, useEffect } from 'react';
import { addToSubCollection } from '../../firebase/firebaseUtilsInput'; // Check the path to ensure it's correct

function Moveform({ onSkip, onContinue, onBack, userData }) {
  const [formData, setFormData] = useState({
    moveFrom: '',
    moveDate: '',
  });
  const [skipForm, setSkipForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // When skipForm changes to true, notify parent component
  useEffect(() => {
    if (skipForm) {
      onSkip && onSkip(true);
    }
  }, [skipForm, onSkip]);

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
      console.log("Movement form submit with userData:", userData);
      
      if (!skipForm && userData && userData.memberId) {
        console.log("Saving movement data...");
        // Save movement data to Firestore
        await addToSubCollection(
          userData.memberId,
          'MoveIn',
          {
            moveFrom: formData.moveFrom,
            moveDate: formData.moveDate,
            skipped: false
          }
        );
        console.log("Movement data saved successfully");
      } else if (skipForm && userData && userData.memberId) {
        console.log("Skipping movement form, marking as skipped");
        // Save that this section was skipped
        await addToSubCollection(
          userData.memberId,
          'MoveIn',
          {
            skipped: true
          }
        );
        console.log("Skipped status saved successfully");
      }

      // Go to next step
      onContinue && onContinue();
    } catch (error) {
      console.error("Error saving movement data:", error);
      alert("An error occurred while saving data. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipChange = (e) => {
    const isChecked = e.target.checked;
    setSkipForm(isChecked);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">ຂໍ້ມູນການຍົກຍ້າຍເຂົ້າ</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ຍົກຍ້າຍມາຈາກ*
          </label>
          <input
            type="text"
            name="moveFrom"
            value={formData.moveFrom}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            required={!skipForm}
            disabled={skipForm}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ວັນ/ເດືອນ/ປີ
          </label>
          <input
            type="date"
            name="moveDate"
            value={formData.moveDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            style={{ backgroundColor: 'white', color: 'black' }}
            disabled={skipForm}
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-5 ">
            <input
              type="checkbox"
              checked={skipForm}
              onChange={handleSkipChange}
              className="rounded"
            />
            <span className="text-md text-red-600">ສາມາດກົດຂ້າມໄປກ່ອນ</span>
          </label>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-white text-red-500 border-2 px-6 py-2 rounded cursor-pointer"
            disabled={isLoading}
          >
            ຍ້ອນກັບ
          </button>
          <button
            type="submit"
            className="bg-blue-400 text-white px-6 py-2 rounded cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "ກຳລັງປະມວນຜົນ..." : "ຕໍ່ໄປ"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Moveform;