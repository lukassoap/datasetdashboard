import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyB0k1agAjm6HVhqdx0uTs5j4fxDieSDdaM',
  authDomain: 'dashboardtest-681fb.firebaseapp.com',
  databaseURL: 'https://dashboardtest-681fb-default-rtdb.firebaseio.com',
  projectId: 'dashboardtest-681fb',
  storageBucket: 'dashboardtest-681fb.firebasestorage.app',
  messagingSenderId: '904186649969',
  appId: '1:904186649969:web:bce4c39de343ad4940ead0',
  measurementId: 'G-C1VF4346B7',
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
