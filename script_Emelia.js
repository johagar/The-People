import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const pass = document.getElementById("password");
const save = document.getElementById("save");
const enter = document.getElementById("enter");
const description = document.getElementById("descrip");
const profileName = document.getElementById("profileName");
const profileNick = document.getElementById("profileNick");
const profileImg = document.getElementById("profileImg");
const imgInput = document.getElementById("imgInput");

let isUnlocked = false;

// Hide inputs/buttons initially
[pass, save, enter, imgInput].forEach(el => el && (el.style.display = "none"));

// ===== Show login for editing =====
function showLogin() {
  if (!isUnlocked && pass && enter) {
    pass.style.display = "block";
    enter.style.display = "block";
  }
}
[description, profileName, profileNick, profileImg].forEach(el => el && el.addEventListener("click", showLogin));

// ===== Load profile data from Firestore =====
async function loadProfileData() {
  if (!window.db) return console.error("Firestore not initialized");

  const profileId = document.body.dataset.profile || "emelia";
  try {
    const refDoc = doc(window.db, "profiles", profileId);
    const snapshot = await getDoc(refDoc);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.profileName) profileName.innerHTML = data.profileName;
      if (data.profileNick) profileNick.innerHTML = data.profileNick;
      if (data.text) description.innerHTML = data.text;
      if (data.imgUrl) profileImg.src = data.imgUrl; // supports Base64
    }
  } catch(e) { console.error("Failed to load profile:", e); }
}
loadProfileData();

// ===== Check password =====
enter.addEventListener("click", () => {
  if (pass.value === "Magic1234567") {
    [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "true"));
    save.style.display = "block";
    enter.style.display = "none";
    pass.style.display = "none";
    imgInput.style.display = "block";
    isUnlocked = true;
  } else {
    alert("Incorrect Password");
  }
});

// ===== Show save button on input =====
[description, profileName, profileNick].forEach(el => {
  el.addEventListener("input", () => { if (el.isContentEditable) save.style.display = "block"; });
});

// ===== Handle image selection (Base64) =====
imgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const base64String = event.target.result;
    profileImg.src = base64String;
    profileImg.dataset.base64 = base64String;
    save.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ===== Save profile to Firestore =====
save.addEventListener("click", async () => {
  [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "false"));
  imgInput.style.display = "none";
  save.style.display = "none";

  if (!window.db) return alert("Cannot save: Firestore not initialized");

  const profileId = document.body.dataset.profile || "emelia";
  try {
    const refDoc = doc(window.db, "profiles", profileId);
    await setDoc(refDoc, {
      text: description.innerHTML,
      profileName: profileName.innerHTML,
      profileNick: profileNick.innerHTML,
      imgUrl: profileImg.dataset.base64 || profileImg.src
    });
    alert("Changes saved for everyone!");
  } catch(e) {
    console.error("Failed to save profile:", e);
    alert("Failed to save changes.");
  }
});