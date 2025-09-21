// script_Logan.js
// Firestore helpers imported here (we already exposed window.db from the HTML)
// This module handles loading/saving and Base64 image selection.

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const pass = document.getElementById("password");
const save = document.getElementById("save");
const enter = document.getElementById("enter");
const description = document.getElementById("descrip");
const profileName = document.getElementById("profileName");
const profileNick = document.getElementById("profileNick");
const profileImg = document.getElementById("profileImg");
const imgInput = document.getElementById("imgInput");

if (!pass || !save || !enter || !description || !profileName || !profileNick || !profileImg || !imgInput) {
  console.error("Missing required DOM elements on page_Logan.html");
}

let isUnlocked = false;

// hide inputs initially (JS-controlled)
[pass, save, enter, imgInput].forEach(el => el && (el.style.display = "none"));

// show password inputs when user clicks editable areas
function showLogin() {
  if (!isUnlocked && pass && enter) {
    pass.style.display = "block";
    enter.style.display = "block";
  }
}
[description, profileName, profileNick, profileImg].forEach(el => el && el.addEventListener("click", showLogin));

// Load profile doc from Firestore
async function loadProfileData() {
  if (!window.db) {
    console.error("Firestore not initialised (window.db missing).");
    return;
  }

  const profileId = document.body.dataset.profile || "logan";
  try {
    const ref = doc(window.db, "profiles", profileId);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.profileName) profileName.innerHTML = data.profileName;
      if (data.profileNick) profileNick.innerHTML = data.profileNick;
      if (data.text) description.innerHTML = data.text;
      // imgUrl may be a URL or a data:base64 string — either works
      if (data.imgUrl) profileImg.src = data.imgUrl;
    }
  } catch (e) {
    console.error("Failed to load profile data:", e);
  }
}
loadProfileData();

// Enter button — unlock editing
enter && enter.addEventListener("click", () => {
  // Logan's password (you gave me): "mancity"
  if (pass.value === "mancity") {
    [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "true"));
    // show save and file picker
    if (save && enter && pass && imgInput) {
      save.style.display = "block";
      enter.style.display = "none";
      pass.style.display = "none";
      imgInput.style.display = "block";
    }
    isUnlocked = true;
  } else {
    alert("Incorrect Password");
  }
});

// show save button when user edits text
[description, profileName, profileNick].forEach(el => {
  if (el) {
    el.addEventListener("input", () => {
      if (el.isContentEditable && save) save.style.display = "block";
    });
  }
});

// When a file is chosen — convert to Base64 DataURL and preview immediately
imgInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    const dataUrl = ev.target.result; // data:image/...;base64,...
    profileImg.src = dataUrl;         // immediately change the <img>
    // store it in dataset for saving
    profileImg.dataset.base64 = dataUrl;
    if (save) save.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Save button — write to Firestore (imgUrl saved as data: base64 string if user picked one)
save && save.addEventListener("click", async () => {
  [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "false"));
  imgInput.style.display = "none";
  save.style.display = "none";

  if (!window.db) {
    alert("Cannot save: Firestore not initialised.");
    return;
  }

  const profileId = document.body.dataset.profile || "logan";
  try {
    const ref = doc(window.db, "profiles", profileId);
    await setDoc(ref, {
      text: description ? description.innerHTML : "",
      profileName: profileName ? profileName.innerHTML : "",
      profileNick: profileNick ? profileNick.innerHTML : "",
      // prefer stored base64 (if user changed image) otherwise fallback to current src
      imgUrl: profileImg.dataset.base64 || profileImg.src
    });
    alert("Changes saved for everyone!");
  } catch (e) {
    console.error("Failed to save profile:", e);
    alert("Failed to save changes.");
  }
});