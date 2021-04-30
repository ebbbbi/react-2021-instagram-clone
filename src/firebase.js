import firebase from 'firebase';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = firebase.initializeApp({
    apiKey: "",
    authDomain: "instagram-clone-react-be867.firebaseapp.com",
    projectId: "instagram-clone-react-be867",
    storageBucket: "instagram-clone-react-be867.appspot.com",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  });

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();


export {db, auth, storage};