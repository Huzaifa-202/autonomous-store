// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCU1d3Gh1M61Yoa_bvOS-LZrE_JCC06XoM',
  authDomain: 'fbis-19de1.firebaseapp.com',
  projectId: 'fbis-19de1',
  storageBucket: 'fbis-19de1.appspot.com',
  messagingSenderId: '1078752837165',
  appId: '1:1078752837165:android:01bb623de5b315507882a4',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
