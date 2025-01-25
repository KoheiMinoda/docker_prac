import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmaxExw9yGa23UM4_jG1ED9juwxOn5h7c",
  authDomain: "english-prac.firebaseapp.com",
  projectId: "english-prac",
  storageBucket: "english-prac.firebasestorage.app",
  messagingSenderId: "622188832105",
  appId: "1:622188832105:web:283f76a194051ce412c9f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };