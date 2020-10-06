import * as firebase from 'firebase';


const config = {
    apiKey: "AIzaSyDx5-yAAM-h2cQV7pmAiay-i9I6qiNLgCE",
    authDomain: "testprojectrealtors.firebaseapp.com",
    databaseURL: "https://testprojectrealtors.firebaseio.com",
    projectId: "testprojectrealtors",
    storageBucket: "testprojectrealtors.appspot.com",
    messagingSenderId: "586145413382",
    appId: "1:586145413382:web:2cd13413f33bcc71334687"
  };

const firebaseApp = firebase.initializeApp(config);
export const db = firebaseApp.firestore();