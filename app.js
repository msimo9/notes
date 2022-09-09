import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";

import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

import { getFirestore, doc, getDoc, setDoc, collection, addDoc, arrayUnion, arrayRemove, updateDoc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

let userID = ""; 
let allNotes = [];
let opened = false;

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
        checkIfDBexist(user.uid);
    } else {
        renderLoginForm();
    }
});

const checkIfDBexist = async(uid) => {
    const docRef = doc(db, "notes", uid.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        allNotes = docSnap.data().allNotes;
    } else {
        await setDoc(doc(db, "notes", uid), {allNotes: []});
        allNotes = [];
    }
    renderNotes();
}

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

const handleUploadNote = async(value) => {
    const date = new Date();
    const uploadNoteRef = doc(db, "notes", userID);
    await updateDoc(uploadNoteRef, {
        allNotes: arrayUnion({text: value, id: date.getTime()})
    });
    checkIfDBexist(userID);
}

const handleRemoveNote = async(noteID) => {
    allNotes = allNotes.filter( el => {
        return el.id !== noteID
    });
    const removeNoteRef = doc(db, "notes", userID);
    await updateDoc(removeNoteRef, {
        allNotes: allNotes.reverse()
    });
    checkIfDBexist(userID);
}

const updateNoteValue = async() => {
    const updateRef = doc(db, "notes", userID);
    await updateDoc(updateRef, {
        allNotes: allNotes
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
        if(textArea.value !== "" && textArea.value.length !== 0){
            handleUploadNote(textArea.value);
            textArea.value = "";
        }
    });
    const submitButton = document.createElement("div");
    submitButton.setAttribute("id", "submit-button");
    submitButton.innerHTML = "<ion-icon name='send-outline'></ion-icon>";
    submitButton.addEventListener("click", ()=>{
        if(textArea.value !== "" && textArea.value.length !== 0){
            handleUploadNote(textArea.value);
            textArea.value = "";
        }
    });
    textAreaWrapper.appendChild(submitButton);

    textAreaWrapper.appendChild(textArea);
    header.appendChild(textAreaWrapper);
    document.body.appendChild(header);

    const notesWrapper = document.createElement("div");
    notesWrapper.setAttribute("id", "notes-wrapper");
    allNotes.reverse().forEach((note, index) => {
        //note container
        const noteContainer = document.createElement("div");
        noteContainer.setAttribute("id", "note-container");
        noteContainer.innerText = note.text;
        //edit buttons
        const editButtons = document.createElement("div");
        editButtons.setAttribute("id", "edit-buttons");
        const removeButton = document.createElement("div");
        removeButton.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`;
        removeButton.addEventListener("click", ()=>{handleRemoveNote(note.id)});
        editButtons.appendChild(removeButton);
        noteContainer.addEventListener("mouseenter", ()=>{
            console.log(123);
            editButtons.style.display = "flex";
        });
        noteContainer.addEventListener("mouseleave", ()=>{
            editButtons.style.display = "none";
        });

        noteContainer.addEventListener("click",()=>{
            if(!opened){
                console.log("clicked!");
                opened = true;
                if(document.getElementById("focused-note-container") !== null){
                    document.getElementById("focused-note-container").remove();
                }
                const focusedNoteContainer = document.createElement("div");
                focusedNoteContainer.setAttribute("id", "focused-note-container");
                focusedNoteContainer.innerHTML = "";
                const editTextArea = document.createElement("textarea");
                editTextArea.setAttribute("id", "edit-text-area");
                editTextArea.value = note.text;
                editTextArea.focus();
                focusedNoteContainer.appendChild(editTextArea);
                const closeFocusedNote = document.createElement("div");
                closeFocusedNote.setAttribute("id", "close-focused-note");
                closeFocusedNote.innerHTML = "<ion-icon name='close-outline'></ion-icon>";
                closeFocusedNote.addEventListener("click", ()=>{
                    allNotes[index].text = editTextArea.value;
                    noteContainer.innerText = editTextArea.value;
                    noteContainer.appendChild(editButtons);
                    opened = false;
                    updateNoteValue();
                    focusedNoteContainer.remove();
                });
                focusedNoteContainer.appendChild(closeFocusedNote);
                document.body.appendChild(focusedNoteContainer);
            }
        });
        //append child
        noteContainer.appendChild(editButtons);
        notesWrapper.appendChild(noteContainer);
    });
    document.body.appendChild(notesWrapper);

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


