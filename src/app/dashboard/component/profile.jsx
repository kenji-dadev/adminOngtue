// components/ProfileImage.js
import React, { useState, useEffect } from 'react';
import Image from "next/image";

// ฟังก์ชันสำหรับดึงรูปภาพ
const getImageUrl = async (memberId, imageUrl) => {
  try {
    console.log(`🔍 Getting image URL for member ${memberId}, imageUrl: ${imageUrl}`);
    
    // ถ้ามี imageUrl ที่เป็น Firebase Storage URL แล้ว
    if (imageUrl && (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('storage.googleapis.com'))) {
      console.log(`✅ Using provided Firebase Storage URL: ${imageUrl}`);
      return imageUrl;
    }
    
    // ถ้ามี imageUrl ที่เป็น HTTP URL อื่นๆ
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      console.log(`✅ Using provided HTTP URL: ${imageUrl}`);
      return imageUrl;
    }
    
    // ถ้าไม่มี imageUrl หรือเป็นไฟล์ชื่อ ให้ลอง construct Firebase Storage URL
    // (ในกรณีนี้อาจต้องใช้ imageService ถ้ามี)
    console.log(`⚠️ No valid image URL found for member ${memberId}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error getting image URL for member ${memberId}:`, error);
    return null;
  }
};

export default function ProfileImage({
  memberId,
  imageUrl,
  alt,
  size = "w-16 h-16",
  className = ""
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Reset states
      setHasError(false);
      setIsLoading(true);
      setImgSrc(null);

      if (!memberId || memberId.trim() === '') {
        console.log('No memberId provided');
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔍 Loading image for member ${memberId} with imageUrl: ${imageUrl}`);
        
        // ใช้ getImageUrl ที่จัดการทั้ง Firebase Storage URL และ filename
        const finalImageUrl = await getImageUrl(memberId, imageUrl);

        if (finalImageUrl) {
          setImgSrc(finalImageUrl);
          console.log(`✅ Final image URL set: ${finalImageUrl}`);
        } else {
          console.log(`❌ No valid image found for member ${memberId}`);
          setHasError(true);
        }
        
      } catch (error) {
        console.error(`❌ Error loading image for member ${memberId}:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [memberId, imageUrl]);

  const handleError = (e) => {
    console.error(`❌ Image load error for member ${memberId}:`, e);
    if (!hasError) {
      setHasError(true);
      setImgSrc(null);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log(`✅ Image loaded successfully for member ${memberId}`);
    setIsLoading(false);
    setHasError(false);
  };

  // แสดง placeholder ถ้าไม่มีรูป หรือ error
  if (!imgSrc || hasError) {
    return (
      <div className={`${size} bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center ${className}`}>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-blue-300 rounded-full opacity-50 animate-bounce"></div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-6 h-6 text-blue-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-blue-500 font-medium">No Image</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${size} bg-gray-200 rounded-md overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-blue-100 animate-pulse rounded-md flex items-center justify-center z-10">
          <div className="w-6 h-6 bg-blue-300 rounded-full opacity-50 animate-bounce"></div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt || `Profile image for ${memberId || 'user'}`}
        fill
        className="rounded-md object-cover"
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={true} // ใช้ unoptimized สำหรับ Firebase Storage
        sizes="(max-width: 768px) 100vw, 64px"
        priority={false}
      />
    </div>
  );
}