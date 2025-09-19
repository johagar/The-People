// ===== Get elements =====
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
const pass = document.getElementById("password");
const save = document.getElementById("save");
const enter = document.getElementById("enter");
const description = document.getElementById("descrip");
const profileName = document.getElementById("profileName");
const profileNick = document.getElementById("profileNick");

let isUnlocked = false;

// Hide login inputs/buttons initially
[pass, save, enter].forEach(el => el && (el.style.display = "none"));

// ===== Show login when fields clicked =====
function showLogin() {
  if (!isUnlocked && pass && enter) {
    pass.style.display = "block";
    enter.style.display = "block";
  }
}
[description, profileName, profileNick].forEach(el => el && el.addEventListener("click", showLogin));

// ===== Load profile data =====
async function loadProfileData() {
  if (!window.db) {
    console.error("Firestore not initialized.");
    return;
  }

  const profileId = document.body.dataset.profile || "william";

  try {
    const ref = doc(window.db, "profiles", profileId);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.profileName && profileName) profileName.innerHTML = data.profileName;
      if (data.profileNick && profileNick) profileNick.innerHTML = data.profileNick;
      if (data.text && description) description.innerHTML = data.text;
    }
  } catch (e) {
    console.error("Failed to load profile data:", e);
  }
}
loadProfileData();

// ===== Unlock editing =====
enter && enter.addEventListener("click", () => {
  if (pass.value === "67MANGO") {  // 🔑 Password for William
    [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "true"));
    if (save && enter && pass) {
      save.style.display = "block";
      enter.style.display = "none";
      pass.style.display = "none";
    }
    isUnlocked = true;
  } else {
    alert("Incorrect Password");
  }
});

// ===== Show save button when editing =====
[description, profileName, profileNick].forEach(el => {
  if (el) {
    el.addEventListener("input", () => {
      if (el.isContentEditable && save) save.style.display = "block";
    });
  }
});

// ===== Save data =====
save && save.addEventListener("click", async () => {
  [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "false"));
  if (save) save.style.display = "none";

  if (!window.db) {
    alert("Cannot save: Firestore not initialized.");
    return;
  }

  const profileId = document.body.dataset.profile || "william";

  try {
    const ref = doc(window.db, "profiles", profileId);
    await setDoc(ref, {
      text: description ? description.innerHTML : "",
      profileName: profileName ? profileName.innerHTML : "",
      profileNick: profileNick ? profileNick.innerHTML : ""
    });
    alert("Changes saved for everyone!");
  } catch (e) {
    console.error("Failed to save profile:", e);
    alert("Failed to save changes.");
  }
});