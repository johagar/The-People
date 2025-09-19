// ===== Import Firebase modules =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
//=====import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";=====

// ===== Initialize Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyBIwjTjqf56ord-11IqFc4jxGg7o-yNXDs",
  authDomain: "the-people-project-b80ff.firebaseapp.com",
  projectId: "the-people-project-b80ff",
  storageBucket: "the-people-project-b80ff.firebasestorage.app",
  messagingSenderId: "804463901240",
  appId: "1:804463901240:web:d85bddbb5c99c7c3b044cd",
  measurementId: "G-2RM0HEX746"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// ===== Get elements =====
const pass = document.getElementById("password");
const save = document.getElementById("save");
const enter = document.getElementById("enter");
const description = document.getElementById("descrip");
const profileName = document.getElementById("profileName");
const profileNick = document.getElementById("profileNick");

let isUnlocked = false;

// Hide inputs/buttons initially
pass.style.display = "none";
save.style.display = "none";
enter.style.display = "none";

// ===== Get profile ID from body =====
const profileId = document.body.dataset.profile || "finn";

// ===== Load profile data from Firestore =====
async function loadProfileData() {
  try {
    const ref = doc(db, "profiles", profileId);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.profileName) profileName.innerHTML = data.profileName;
      if (data.profileNick) profileNick.innerHTML = data.profileNick;
      if (data.text) description.innerHTML = data.text;
    }
  } catch (e) {
    console.error("Failed to load profile data:", e);
  }
}
loadProfileData();

// ===== Show login for editing =====
function showLogin() {
  if (!isUnlocked) {
    pass.style.display = "block";
    enter.style.display = "block";
  }
}
description.addEventListener("click", showLogin);
profileName.addEventListener("click", showLogin);
profileNick.addEventListener("click", showLogin);

// ===== Check password =====
enter.addEventListener("click", () => {
  if (pass.value === "MildBobbySauce") {
    description.contentEditable = true;
    profileName.contentEditable = true;
    profileNick.contentEditable = true;

    save.style.display = "block";
    enter.style.display = "none";
    pass.style.display = "none";
    isUnlocked = true;
  } else {
    alert("Incorrect Password");
  }
});

// ===== Show save button on input =====
[description, profileName, profileNick].forEach(el => {
  el.addEventListener("input", () => {
    if (el.isContentEditable) save.style.display = "block";
  });
});

// ===== Save profile to Firestore =====
save.addEventListener("click", async () => {
  description.contentEditable = false;
  profileName.contentEditable = false;
  profileNick.contentEditable = false;
  save.style.display = "none";

  try {
    const ref = doc(db, "profiles", profileId);
    await setDoc(ref, {
      text: description.innerHTML,
      profileName: profileName.innerHTML,
      profileNick: profileNick.innerHTML
    });
    alert("Changes saved for everyone!");
  } catch (e) {
    console.error("Failed to save profile:", e);
    alert("Failed to save changes.");
  }
});
