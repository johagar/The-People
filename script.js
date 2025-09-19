// ===== Get elements =====
let pass = document.getElementById("password");
let save = document.getElementById("save");
let enter = document.getElementById("enter");
let description = document.getElementById("descrip");
let profileName = document.getElementById("profileName");
let profileNick = document.getElementById("profileNick");

let isUnlocked = false;

// Hide inputs/buttons initially
pass.style.display = "none";
save.style.display = "none";
enter.style.display = "none";

// ===== Get the profile ID from the page =====
const profileId = document.body.dataset.profile || "finn";

// ===== Load profile data from Firestore =====
async function loadProfileData() {
  try {
    const ref = window.doc(window.db, "profiles", profileId);
    const snapshot = await window.getDoc(ref);
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

// ===== Unlock editing =====
description.addEventListener("click", showLogin);
profileName.addEventListener("click", showLogin);
profileNick.addEventListener("click", showLogin);

function showLogin() {
  if (!isUnlocked) {
    pass.style.display = "block";
    enter.style.display = "block";
  }
}

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

// ===== Save to Firestore =====
save.addEventListener("click", async () => {
  description.contentEditable = false;
  profileName.contentEditable = false;
  profileNick.contentEditable = false;
  save.style.display = "none";

  try {
    const ref = window.doc(window.db, "profiles", profileId);
    await window.setDoc(ref, {
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