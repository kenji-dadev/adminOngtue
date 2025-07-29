// firebase.js
import { db, storage, auth } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc,  // Add updateDoc for document updates
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

// Submit user data to Firestore
export const submitUserData = async (userData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Create a new document in the main collection
    const memberRef = doc(collection(db, MAIN_COLLECTION));
    const memberId = memberRef.id;
    
    // ✅ Add onStatus: "active"
    const dataWithUserId = {
      ...userData,
      userId: currentUser.uid,
      onStatus: "active", 
      createdAt: serverTimestamp()
    };
    
    await setDoc(memberRef, dataWithUserId);
    return memberId;
  } catch (error) {
    console.error("Error adding user data: ", error);
    throw error;
  }
};

// Add data to a sub-collection
export const addToSubCollection = async (memberId, subCollectionName, data) => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Check if data is not undefined
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid data for ${subCollectionName}: Data must be an object`);
    }

    // Add userId and timestamp
    const dataWithUserId = {
      ...data,
      userId: currentUser.uid,
      createdAt: serverTimestamp() // Add timestamp for all subcollections
    };

    // Check if memberId is valid
    if (!memberId || typeof memberId !== 'string') {
      throw new Error(`Invalid memberId: ${memberId}`);
    }

    // Check if subCollectionName is valid
    if (!subCollectionName || typeof subCollectionName !== 'string') {
      throw new Error(`Invalid subCollectionName: ${subCollectionName}`);
    }

    // Create reference to subcollection
    const subCollectionRef = collection(db, MAIN_COLLECTION, memberId, subCollectionName);
    
    // Send dataWithUserId to addDoc
    const docRef = await addDoc(subCollectionRef, dataWithUserId);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${subCollectionName}: `, error);
    throw error;
  }
};

// Add specific function for moveOut
export const submitMoveOutData = async (memberId, moveOutData) => {
  try {
    // Check if memberId has value
    if (!memberId) {
      throw new Error("Member ID is required");
    }

    // Check if moveOutData is not null or undefined
    if (!moveOutData || typeof moveOutData !== 'object') {
      throw new Error("Invalid moveOut data: Data must be an object");
    }

    // Add data to moveOut subcollection
    const docId = await addToSubCollection(memberId, SUB_COLLECTIONS.MOVE_OUT, moveOutData);
    
    // ✅ Update main member's onStatus to "moved"
    const memberRef = doc(db, MAIN_COLLECTION, memberId);
    await updateDoc(memberRef, {
      onStatus: "moved",
      movedAt: serverTimestamp() // Add move time (optional)
    });
    
    console.log('Move out data submitted successfully with ID:', docId);
    console.log('Member status updated to "moved"');
    return docId;
  } catch (error) {
    console.error("Error submitting move out data: ", error);
    throw error;
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (file, memberId, fileName) => {
  if (!file) return null;
  
  try {

    // Create unique filename using random string instead of timestamp
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${randomId}_${fileName}.${fileExtension}`;
    
    // Change path to members/ directly without going deeper
    const storageRef = ref(storage, `members/${uniqueFileName}`);
    
    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          try {
            // Handle successful uploads
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
    console.error("File upload error: ", error);
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
    
    // Check if userData is not null or undefined
    if (!userData || typeof userData !== 'object') {
      throw new Error("Invalid userData: Data must be an object");
    }
    
    // 1. Create member document and get ID
    const memberId = await submitUserData(userData);
    
    // 2. Add movement data to sub-collection if provided
    if (movementData && Object.keys(movementData).length > 0) {
      await addToSubCollection(memberId, SUB_COLLECTIONS.MOVEMENT, movementData);
    }
    
    // 3. Process files if any
    const fileInfo = [];
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `profile_${i}`;
        
        try {
          // Upload file and get URL
          const fileUrl = await uploadFile(file, memberId, fileName);
          
          fileInfo.push({
            fileName: file.name,
            fileType: file.type,
            fileUrl: fileUrl
          });
          
          // If it's the first file, set it as profile image
          if (i === 0) {
            // Update userData with imageUrl
            const memberRef = doc(db, MAIN_COLLECTION, memberId);
            await setDoc(memberRef, { imageUrl: fileUrl }, { merge: true });
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
        }
      }
    }
    
    // 4. Add file information to documents sub-collection if needed
    if (fileInfo.length > 0) {
      await addToSubCollection(memberId, 'documents', { files: fileInfo });
    }
    
    // 5. Add additional info to sub-collection
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      await addToSubCollection(memberId, SUB_COLLECTIONS.INFOR_INPUT, additionalInfo);
    }
    
    return memberId;
  } catch (error) {
    console.error("Error submitting all data: ", error);
    throw error;
  }
};