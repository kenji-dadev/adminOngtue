
// firebase.js - Enhanced version with better error handling
import { db, storage, auth } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';

// Main collection name
const MAIN_COLLECTION = 'member';
// Sub-collection names
const SUB_COLLECTIONS = {
  USER_INPUT: 'User',
  MOVEMENT: 'MoveIn',
  MOVE_OUT: 'moveOut', 
  INFOR_INPUT: 'preceptor'
};

// Helper function to check authentication
const checkAuth = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated. Please sign in first.");
  }
  return currentUser;
};

// Submit user data to Firestore
export const submitUserData = async (userData) => {
  try {
    const currentUser = checkAuth();
    
    if (!userData || typeof userData !== 'object') {
      throw new Error("Invalid userData: Data must be an object");
    }

    // Create a new document in the main collection
    const memberRef = doc(collection(db, MAIN_COLLECTION));
    const memberId = memberRef.id;
    
    const dataWithUserId = {
      ...userData,
      userId: currentUser.uid,
      onStatus: "active", 
      createdAt: serverTimestamp()
    };
    
    console.log('Attempting to create member document:', memberId);
    await setDoc(memberRef, dataWithUserId);
    console.log('Member document created successfully:', memberId);
    
    return memberId;
  } catch (error) {
    console.error("Error adding user data:", error);
    
    // More specific error handling
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied. Check your Firestore security rules.");
    } else if (error.code === 'unauthenticated') {
      throw new Error("User not authenticated. Please sign in.");
    }
    
    throw error;
  }
};

// Add data to a sub-collection
export const addToSubCollection = async (memberId, subCollectionName, data) => {
  try {
    const currentUser = checkAuth();

    // Validate inputs
    if (!memberId || typeof memberId !== 'string') {
      throw new Error(`Invalid memberId: ${memberId}`);
    }
    
    if (!subCollectionName || typeof subCollectionName !== 'string') {
      throw new Error(`Invalid subCollectionName: ${subCollectionName}`);
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid data for ${subCollectionName}: Data must be an object`);
    }

    const dataWithUserId = {
      ...data,
      userId: currentUser.uid,
      createdAt: serverTimestamp()
    };

    const subCollectionRef = collection(db, MAIN_COLLECTION, memberId, subCollectionName);
    
    console.log(`Adding to subcollection: ${subCollectionName} for member: ${memberId}`);
    const docRef = await addDoc(subCollectionRef, dataWithUserId);
    console.log(`Document added to ${subCollectionName} with ID:`, docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${subCollectionName}:`, error);
    
    if (error.code === 'permission-denied') {
      throw new Error(`Permission denied for ${subCollectionName}. Check your Firestore security rules.`);
    }
    
    throw error;
  }
};

// Add specific function for moveOut
export const submitMoveOutData = async (memberId, moveOutData) => {
  try {
    checkAuth();
    
    if (!memberId) {
      throw new Error("Member ID is required");
    }

    if (!moveOutData || typeof moveOutData !== 'object') {
      throw new Error("Invalid moveOut data: Data must be an object");
    }

    // Add data to moveOut subcollection
    const docId = await addToSubCollection(memberId, SUB_COLLECTIONS.MOVE_OUT, moveOutData);
    
    // Update main member's onStatus to "moved"
    const memberRef = doc(db, MAIN_COLLECTION, memberId);
    console.log('Updating member status to "moved"');
    await updateDoc(memberRef, {
      onStatus: "moved",
      movedAt: serverTimestamp()
    });
    
    console.log('Move out data submitted successfully with ID:', docId);
    console.log('Member status updated to "moved"');
    return docId;
  } catch (error) {
    console.error("Error submitting move out data:", error);
    
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied. Cannot update member status. Check your Firestore security rules.");
    }
    
    throw error;
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (file, memberId, fileName) => {
  if (!file) return null;
  
  try {
    checkAuth();
    
    // Create unique filename
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${randomId}_${fileName}.${fileExtension}`;
    
    const storageRef = ref(storage, `members/${uniqueFileName}`);
    
    console.log('Starting file upload:', uniqueFileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error("Upload error:", error);
          if (error.code === 'storage/unauthorized') {
            reject(new Error("Permission denied for file upload. Check your Storage security rules."));
          } else {
            reject(error);
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Upload successful, URL:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

// Validate image URL
export const validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
  }
};

// Submit all form data including files
export const submitAllData = async (userData, movementData, additionalInfo, files) => {
  try {
    checkAuth();
    
    if (!userData || typeof userData !== 'object') {
      throw new Error("Invalid userData: Data must be an object");
    }
    
    console.log('Starting data submission process...');
    
    // 1. Create member document and get ID
    const memberId = await submitUserData(userData);
    console.log('Member created with ID:', memberId);
    
    // 2. Add movement data to sub-collection if provided
    if (movementData && Object.keys(movementData).length > 0) {
      await addToSubCollection(memberId, SUB_COLLECTIONS.MOVEMENT, movementData);
      console.log('Movement data added successfully');
    }
    
    // 3. Process files if any
    const fileInfo = [];
    
    if (files && files.length > 0) {
      console.log(`Processing ${files.length} files...`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `profile_${i}`;
        
        try {
          const fileUrl = await uploadFile(file, memberId, fileName);
          
          fileInfo.push({
            fileName: file.name,
            fileType: file.type,
            fileUrl: fileUrl
          });
          
          // If it's the first file, set it as profile image
          if (i === 0) {
            const memberRef = doc(db, MAIN_COLLECTION, memberId);
            await setDoc(memberRef, { imageUrl: fileUrl }, { merge: true });
            console.log('Profile image URL updated');
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          // Continue with other files even if one fails
        }
      }
    }
    
    // 4. Add file information to documents sub-collection if needed
    if (fileInfo.length > 0) {
      await addToSubCollection(memberId, 'documents', { files: fileInfo });
      console.log('File information saved to documents collection');
    }
    
    // 5. Add additional info to sub-collection
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      await addToSubCollection(memberId, SUB_COLLECTIONS.INFOR_INPUT, additionalInfo);
      console.log('Additional info added successfully');
    }
    
    console.log('All data submitted successfully');
    return memberId;
  } catch (error) {
    console.error("Error submitting all data:", error);
    
    // Provide more helpful error messages
    if (error.message.includes('permission') || error.code === 'permission-denied') {
      throw new Error("Permission denied. Please check your Firestore and Storage security rules, and ensure you're properly authenticated.");
    }
    
    throw error;
  }
};