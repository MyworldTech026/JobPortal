// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdP8EvozDdCtZ-ZHQPJ3DaND0xeG8YBEQ",
  authDomain: "jobportal-252e6.firebaseapp.com",
  projectId: "jobportal-252e6",
  storageBucket: "jobportal-252e6.firebasestorage.app",
  messagingSenderId: "135337800802",
  appId: "1:135337800802:web:4d80187870863988570d3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db= getFirestore(app)
export const auth=getAuth(app)