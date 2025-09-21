// script_home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/* --------- Firebase config - replace with your project's config if different --------- */
const firebaseConfig = {
  apiKey: "AIzaSyBIwjTjqf56ord-11IqFc4jxGg7o-yNXDs",
  authDomain: "the-people-project-b80ff.firebaseapp.com",
  projectId: "the-people-project-b80ff",
  storageBucket: "the-people-project-b80ff.firebasestorage.app",
  messagingSenderId: "804463901240",
  appId: "1:804463901240:web:d85bddbb5c99c7c3b044cd",
  measurementId: "G-2RM0HEX746"
};

/* Initialize app and Firestore */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Utility: set image and caption for one figure */
async function populateFigure(figureEl) {
  const profileId = figureEl.dataset.profile;
  if (!profileId) return;

  const imgEl = figureEl.querySelector("img");
  const capEl = figureEl.querySelector("figcaption");

  // keep what is already present as fallback
  const fallbackSrc = imgEl ? imgEl.src : "";
  const fallbackCaption = capEl ? capEl.textContent : profileId;

  try {
    const docRef = doc(db, "profiles", profileId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.info(`No Firestore document for profiles/${profileId}. Using fallback.`);
      if (capEl) capEl.textContent = fallbackCaption;
      return;
    }

    const data = snap.data();

    // Choose image source — support both stored URL or stored Base64 string
    // (field names: imgUrl or imageBase64 or image)
    const candidate =
      data.imgUrl ||
      data.imageBase64 ||
      data.image ||
      data.profileImage ||
      null;

    if (candidate && imgEl) {
      imgEl.src = candidate;
    } else if (imgEl) {
      // keep fallback
      imgEl.src = fallbackSrc;
    }

    if (data.profileName && capEl) {
      capEl.textContent = data.profileName;
    } else if (capEl) {
      capEl.textContent = fallbackCaption;
    }

    console.log(`Loaded profile ${profileId}`);
  } catch (err) {
    console.error(`Failed to load profiles/${profileId}:`, err);
    // restore fallback values
    if (imgEl) imgEl.src = fallbackSrc;
    if (capEl) capEl.textContent = fallbackCaption;
  }
}

/* Main: find all <figure data-profile> and populate them */
async function loadAllProfiles() {
  const figures = Array.from(document.querySelectorAll("figure[data-profile]"));
  if (!figures.length) {
    console.warn("No profile <figure> elements found on page.");
    return;
  }

  // populate in parallel, but catch/log per-profile errors
  await Promise.all(figures.map(f => populateFigure(f)));
}

loadAllProfiles();