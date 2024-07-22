import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getDatabase,
  set,
  ref,
  update,
  remove,
  onValue,
  endAt,
  startAt,
  orderByChild,
  query,
} from "firebase/database";
import {
  addDoc,
  collection,
  getFirestore,
  query as storeQuery,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  uploadBytes,
  ref as storageRef,
  getStorage,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqy_WHSS95ZQC_liBpUXodSCT9bYZll98",
  authDomain: "pet-app-d6d34.firebaseapp.com",
  projectId: "pet-app-d6d34",
  storageBucket: "pet-app-d6d34.appspot.com",
  messagingSenderId: "337727918488",
  appId: "1:337727918488:web:a57cb30210c0966ddc5bed",
  databaseURL: "https://pet-app-d6d34-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const FirebaseContext = createContext(null);
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export const useFirebase = () => useContext(FirebaseContext);

export default function FirebaseProvider(props) {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      user ? setUser(user) : setUser(null);
      user ? setIsLogin(true) : setIsLogin(false);
    });
  }, []);

  const signupUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinUserWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinWithGoogle = () => {
    signInWithPopup(firebaseAuth, googleProvider);
  };

  const writeUserData = async (name, title, description, profileImage) => {
    const imageRef = storageRef(
      storage,
      `users/profile/${Date.now()}-${profileImage.name}`
    );
    const uploadResult = await uploadBytes(imageRef, profileImage);
    return set(ref(db, "users/" + user.uid), {
      username: name,
      title: title,
      description: description,
      profileImage: uploadResult.ref.fullPath,
    });
  };
  const updateProfileDetails = async (name, title, description) => {
    const updates = {};
    updates["/users/" + user.uid + "/username"] = name;
    updates["/users/" + user.uid + "/title"] = title;
    updates["/users/" + user.uid + "/description"] = description;

    try {
      await update(ref(db), updates);
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  };

  const getImageURL = (path) => {
    return getDownloadURL(storageRef(storage, path));
  };

  const getUserData = () => {
    if (user) return ref(db, "users/" + user.uid);
  };

  const addUser = async (email, uid) => {
    return await addDoc(collection(firestore, "users"), {
      uid,
      email,
    });
  };

  const isLoggedIn = () => {
    return user ? true : false;
  };

  const updateProfileImage = async (image) => {
    const imageRef = storageRef(
      storage,
      `users/profile/${Date.now()}-${image.name}`
    );
    const uploadResult = await uploadBytes(imageRef, image);
    const updates = {};
    updates["/users/" + user.uid + "/profileImage"] = uploadResult.ref.fullPath;

    try {
      await update(ref(db), updates);
      console.log("Image updated successfully");
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  };
  const updatePets = async (pet) => {
    const date = Date.now();
    const imageRef = storageRef(
      storage,
      `users/pets/${date}-${pet.image.name}`
    );
    const uploadResult = await uploadBytes(imageRef, pet.image);
    const petId = `${pet.name}_${date}`;

    const updates = {
      [`/users/${user.uid}/pets/${petId}/name`]: pet.name,
      [`/users/${user.uid}/pets/${petId}/uid`]: petId,
      [`/users/${user.uid}/pets/${petId}/category`]: pet.category,
      [`/users/${user.uid}/pets/${petId}/breed`]: pet.breed,
      [`/users/${user.uid}/pets/${petId}/description`]: pet.description,
      [`/users/${user.uid}/pets/${petId}/image`]: uploadResult.ref.fullPath,
    };

    try {
      await update(ref(db), updates);
      console.log("Pet Info updated successfully");
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  };

  const updateEvents = async (event) => {
    const date = Date.now();
    const imageRef = storageRef(
      storage,
      `users/events/${date}-${event.image.name}`
    );
    const uploadResult = await uploadBytes(imageRef, event.image);
    const eventId = `${event.name}_${date}`;

    const updates = {
      [`/users/${user.uid}/events/${eventId}/name`]: event.name,
      [`/users/${user.uid}/events/${eventId}/uid`]: eventId,
      [`/users/${user.uid}/events/${eventId}/category`]: event.category,
      [`/users/${user.uid}/events/${eventId}/breed`]: event.breed,
      [`/users/${user.uid}/events/${eventId}/description`]: event.description,
      [`/users/${user.uid}/events/${eventId}/image`]: uploadResult.ref.fullPath,
    };

    try {
      await update(ref(db), updates);
      await addDoc(collection(firestore, "events"), {
        uid: eventId,
        userid: user.uid,
        name: event.name,
        category: event.category,
        breed: event.breed,
        description: event.description,
        image: uploadResult.ref.fullPath,
      });
      console.log("Event Info updated successfully");
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  };

  const fetchPets = async () => {
    return ref(db, "users/" + user.uid + "/pets");
  };
  const fetchEvents = async () => {
    return ref(db, "users/" + user.uid + "/events");
  };

  const deletePet = async (uid) => {
    const petRef = ref(db, `users/${user.uid}/pets/${uid}`);
    try {
      await remove(petRef);
      console.log(`Pet with UID ${uid} has been deleted.`);
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };
  const deleteEvent = async (uid) => {
    const eventRef = ref(db, `users/${user.uid}/events/${uid}`);
    const q = storeQuery(
      collection(firestore, "events"),
      where("uid", "==", uid)
    );

    try {
      await remove(eventRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (documentSnapshot) => {
        await deleteDoc(documentSnapshot.ref);
      });
      console.log(`Event with UID ${uid} has been deleted.`);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const logout = () => {
    return signOut(firebaseAuth);
  };
  const searchUsers = (querygiven) => {
    return new Promise((resolve, reject) => {
      const userRef = ref(db, "users");
      const userQuery = query(
        userRef,
        orderByChild("username"),
        startAt(querygiven),
        endAt(querygiven + "\uf8ff")
      );

      onValue(
        userQuery,
        (snapshot) => {
          const data = snapshot.val();
          const users = [];
          for (let key in data) {
            users.push({
              id: key,
              ...data[key],
            });
          }
          resolve(users);
        },
        reject
      );
    });
  };

  const fetchPosts = async () => {
    return ref(db, "users/" + user.uid + "/posts");
  };

  const getUserByID = async (id) => {
    try {
      return ref(db, "users/" + id);
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }
  };

  const updatePosts = async (image, caption) => {
    const date = Date.now();
    const imageRef = storageRef(storage, `users/posts/${date}-${image.name}`);
    const uploadResult = await uploadBytes(imageRef, image);
    const postId = `post_${date}`;

    const updates = {
      [`/users/${user.uid}/posts/${postId}/caption`]: caption,
      [`/users/${user.uid}/posts/${postId}/image`]: uploadResult.ref.fullPath,
      [`/users/${user.uid}/posts/${postId}/uid`]: postId,
      [`/users/${user.uid}/posts/${postId}/likes`]: 0,
      [`/users/${user.uid}/posts/${postId}/usersLike`]: {},
      [`/users/${user.uid}/posts/${postId}/createdAt`]: date,
    };

    try {
      await update(ref(db), updates);
      await addDoc(collection(firestore, "posts"), {
        uid: postId,
        caption,
        image: uploadResult.ref.fullPath,
        userid: user.uid,
        createdAt: date,
        likes: 0,
        usersLike: {},
      });
      console.log("Post Info updated successfully");
    } catch (error) {
      console.error("Error posting data: ", error);
    }
  };
  const deletePost = async (uid) => {
    const postRef = ref(db, `users/${user.uid}/posts/${uid}`);
    const q = storeQuery(
      collection(firestore, "posts"),
      where("uid", "==", uid)
    );
    try {
      await remove(postRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (documentSnapshot) => {
        await deleteDoc(documentSnapshot.ref);
      });
      console.log(`Post with UID ${uid} has been deleted.`);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPassword,
        signinWithGoogle,
        isLoggedIn,
        logout,
        addUser,
        writeUserData,
        getUserData,
        getImageURL,
        isLogin,
        updateProfileDetails,
        updateProfileImage,
        updatePets,
        fetchPets,
        deletePet,
        searchUsers,
        getUserByID,
        deleteEvent,
        fetchEvents,
        updateEvents,
        fetchPosts,
        updatePosts,
        deletePost,
        firestore,
        db,
        firebaseAuth,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
}
