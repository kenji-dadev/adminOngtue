// components/ProfileImage.js
import React, { useState, useEffect } from 'react';
import Image from "next/image";

// ฟังก์ชันสำหรับจัดการ Image URL
const getImageUrl = async (memberId, imageUrl) => {
  try {
    console.log(`🔍 Checking image URL for member ${memberId}:`, imageUrl);
    
    // ถ้า imageUrl เป็น full URL แล้ว (Firebase Storage URL)
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      console.log(`✅ Valid URL format detected: ${imageUrl}`);
      return imageUrl;
    }
    
    // ถ้าไม่มี imageUrl หรือไม่ถูกต้อง
    console.log(`❌ Invalid or missing imageUrl for member ${memberId}`);
    return null;
  } catch (error) {
    console.error('Error validating image URL:', error);
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
      console.log(`🔄 Loading image for member: ${memberId}, imageUrl: ${imageUrl}`);
      
      // Reset states
      setHasError(false);
      setIsLoading(true);
      setImgSrc(null);

      if (!memberId || memberId.trim() === '') {
        console.log('❌ No memberId provided');
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const finalImageUrl = await getImageUrl(memberId, imageUrl);

        if (finalImageUrl) {
          console.log(`✅ Setting image URL: ${finalImageUrl}`);
          setImgSrc(finalImageUrl);
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
    console.error(`❌ Image load error for member ${memberId}:`, e.target?.src);
    setHasError(true);
    setImgSrc(null);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log(`✅ Image loaded successfully for member ${memberId}`);
    setIsLoading(false);
    setHasError(false);
  };

  // สร้าง fallback name สำหรับ avatar
  const getFallbackName = () => {
    if (alt && alt !== '-') return alt;
    if (memberId) return memberId;
    return 'User';
  };

  // Fallback Avatar Component
  const FallbackAvatar = () => (
    <div className={`${size} bg-gradient-to-br from-gray-300 to-gray-400 rounded-md flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="w-full h-full flex items-center justify-center bg-gray-500 rounded-md">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading && imgSrc) {
    return (
      <div className={`relative ${size} bg-gray-200 rounded-md overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md flex items-center justify-center z-10">
          <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  // Error state หรือไม่มีรูป
  if (!imgSrc || hasError) {
    return <FallbackAvatar />;
  }

  // แสดงรูปปกติ
  return (
    <div className={`relative ${size} bg-gray-200 rounded-md overflow-hidden ${className}`}>
      <Image
        src={imgSrc}
        alt={alt || `Profile image for ${memberId || 'user'}`}
        fill
        className="rounded-md object-cover"
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={true}
        sizes="64px"
        priority={false}
      />
    </div>
  );
}