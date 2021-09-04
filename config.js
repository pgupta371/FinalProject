import firebase from 'firebase';
//require('@firebase/firestore');
const firebaseConfig = {
  apiKey: 'AIzaSyBEjR34n_Ncy_3e7h52DgfN-hUwXbtWTCA',
  authDomain: 'booksanta-477c0.firebaseapp.com',
  databaseURL: 'https://booksanta-477c0-default-rtdb.firebaseio.com',
  projectId: 'booksanta-477c0',
  storageBucket: 'booksanta-477c0.appspot.com',
  messagingSenderId: '670104019397',
  appId: '1:670104019397:web:96a77cb9a98e379e23abac',
};

// Initialize Firebase
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}
export default  firebase.firestore()
