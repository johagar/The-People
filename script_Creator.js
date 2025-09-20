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
  const profileId = document.body.dataset.profile || "creator";
  try {
    const refDoc = doc(window.db, "profiles", profileId);
    const snapshot = await getDoc(refDoc);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.profileName) profileName.innerHTML = data.profileName;
      if (data.profileNick) profileNick.innerHTML = data.profileNick;
      if (data.text) description.innerHTML = data.text;
      if (data.imgUrl) profileImg.src = data.imgUrl; // Base64 string
    }
  } catch (e) {
    console.error("Failed to load profile data:", e);
  }
}
loadProfileData();

// ===== Check password =====
enter.addEventListener("click", () => {
  if (pass.value === "8May*Cat!") {
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
  el.addEventListener("input", () => {
    if (el.isContentEditable) save.style.display = "block";
  });
});

// ===== Resize + convert image to Base64 =====
function resizeImage(file, maxWidth = 300, maxHeight = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        // Keep aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG ~0.8 quality
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== Handle image selection =====
imgInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const base64String = await resizeImage(file);
    profileImg.src = base64String; // Show immediately
    profileImg.dataset.base64 = base64String; // Save for later
    save.style.display = "block";
  } catch (err) {
    console.error("Image processing failed:", err);
    alert("Image processing failed.");
  }
});

// ===== Save profile to Firestore =====
save.addEventListener("click", async () => {
  [description, profileName, profileNick].forEach(el => el && (el.contentEditable = "false"));
  imgInput.style.display = "none";
  save.style.display = "none";

  const profileId = document.body.dataset.profile || "creator";
  try {
    const refDoc = doc(window.db, "profiles", profileId);
    await setDoc(refDoc, {
      text: description.innerHTML,
      profileName: profileName.innerHTML,
      profileNick: profileNick.innerHTML,
      imgUrl: profileImg.dataset.base64 || profileImg.src
    });
    alert("Changes saved for everyone!");
  } catch (e) {
    console.error("Failed to save profile:", e);
    alert("Failed to save changes.");
  }
});