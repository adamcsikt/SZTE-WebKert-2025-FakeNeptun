import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
   selector: 'app-root',
   imports: [RouterOutlet, FooterComponent, HeaderComponent],
   templateUrl: './app.component.html',
   styleUrl: './app.component.css',
})
export class AppComponent {}

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBEkZX5NfdkSxtvQTXwK_5vq5mSZCva1ww",
//   authDomain: "szte-webkert-2025-fakeneptun.firebaseapp.com",
//   projectId: "szte-webkert-2025-fakeneptun",
//   storageBucket: "szte-webkert-2025-fakeneptun.firebasestorage.app",
//   messagingSenderId: "62247029771",
//   appId: "1:62247029771:web:1163180ff784e1f6ec8b0e",
//   measurementId: "G-086740435Q"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
