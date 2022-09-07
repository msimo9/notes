import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";

import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userID = ""; 

const firebaseConfig = {
    apiKey: "AIzaSyCw6GUUtFi5VMJdbZZAgVPFPSZBv1rRR8I",
    authDomain: "notes-edebe.firebaseapp.com",
    projectId: "notes-edebe",
    storageBucket: "notes-edebe.appspot.com",
    messagingSenderId: "1064361787618",
    appId: "1:1064361787618:web:d3301077006448e766debb"
};  

const app = initializeApp(firebaseConfig);
const auth = getAuth();
    auth.useDeviceLanguage();
const db = getFirestore();
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        userID = uid;
        renderNotes();
    } else {
        renderLoginForm();
    }
});

const handleUserSignup = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        userID = user.uid;
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
    });
}

const handleSignOut = () => {
    signOut(auth).then(() => {
    }).catch((error) => {
    });
}

const renderNotes = () => {
    document.body.innerHTML = "";
    const header = document.createElement("header");
    const textAreaWrapper = document.createElement("div");
    textAreaWrapper.setAttribute("id", "textarea-wrapper");
    const textArea = document.createElement("textarea");
    textArea.setAttribute("id", "note-text-input");
    textArea.setAttribute("placeholder", "Insert note here...");
    textArea.addEventListener("focus", ()=>{
        textArea.style.height = "100px";
    });
    textArea.addEventListener("focusout", ()=>{
        textArea.style.height = "50px";
    });
    textAreaWrapper.appendChild(textArea);
    header.appendChild(textAreaWrapper);
    document.body.appendChild(header);

    const footer = document.createElement("footer");
    const signOutButton = document.createElement("div");
    signOutButton.innerText = "Sign Out";
    signOutButton.addEventListener("click", ()=>{
        handleSignOut();
    });
    footer.appendChild(signOutButton);
    document.body.appendChild(footer);
}

const renderLoginForm = () => {
    document.body.innerHTML = "";
    const loginWrapper = document.createElement("div");
    loginWrapper.setAttribute("id", "login-wrapper");
    const googleLogin = document.createElement("div");
    googleLogin.setAttribute("id", "google-login-button");
    googleLogin.innerHTML = `
        <ion-icon name="logo-google"></ion-icon>
        <span>Sign in with Google</span>
    `;
    googleLogin.addEventListener("click", ()=>{
        handleUserSignup();
    });
    loginWrapper.appendChild(googleLogin);
    document.body.appendChild(loginWrapper);
}


