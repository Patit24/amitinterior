import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, firebaseReady, storage } from "./firebase.js";

const ADMIN_EMAIL = "interioramit26@gmail.com";

const state = {
  editingPortfolioId: null,
  editingServiceId: null,
  portfolioItems: [],
  services: [],
};

const $ = (selector) => document.querySelector(selector);

const status = $(".admin-status");
const loginPanel = $(".admin-login");
const appPanel = $(".admin-app");
const portfolioForm = $("#portfolio-form");
const serviceForm = $("#service-form");
const portfolioList = $("#portfolio-list");
const servicesList = $("#services-list");
const portfolioPreview = $("#portfolio-preview");
const servicePreview = $("#service-preview");

const showStatus = (message, tone = "info") => {
  status.textContent = message;
  status.dataset.tone = tone;
};

const friendlyFirebaseError = (error) => {
  const code = error?.code || "";
  if (code === "auth/configuration-not-found") {
    return "Firebase Authentication is not enabled yet. In Firebase Console, open Authentication → Sign-in method → enable Email/Password, then try again.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.";
  }
  if (code === "auth/email-already-in-use") {
    return "This email already has an admin account. Untick “Create first admin account” and sign in normally.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Email or password is incorrect. Check the credentials, or create the first admin account if this is your first login.";
  }
  if (code === "storage/unauthorized" || code === "permission-denied") {
    return "Firebase rules blocked this action. Publish the Firestore and Storage rules from the project files.";
  }
  return error?.message || "Something went wrong. Please try again.";
};

const setBusy = (form, busy) => {
  form?.querySelectorAll("button, input, textarea, select").forEach((control) => {
    control.disabled = busy;
  });
};

const requireFirebase = () => {
  if (firebaseReady) return true;
  showStatus("Firebase config is missing. Add .env values from Firebase first.", "error");
  return false;
};

const uploadImage = async (file, folder) => {
  if (!file) return {};
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const storagePath = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const imageUrl = await getDownloadURL(storageRef);
  return { imageUrl, storagePath };
};

const removeStorageFile = async (path) => {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Keep deletion resilient; Firestore cleanup matters more than old optional media.
  }
};

const resetPortfolioForm = () => {
  state.editingPortfolioId = null;
  portfolioForm.reset();
  $("#portfolio-id").value = "";
  portfolioPreview.removeAttribute("src");
  portfolioPreview.hidden = true;
  $("#portfolio-submit").textContent = "Publish portfolio item";
};

const resetServiceForm = () => {
  state.editingServiceId = null;
  serviceForm.reset();
  $("#service-id").value = "";
  servicePreview.removeAttribute("src");
  servicePreview.hidden = true;
  $("#service-submit").textContent = "Publish service";
};

const renderPortfolio = () => {
  portfolioList.innerHTML = state.portfolioItems.length
    ? state.portfolioItems
        .map((item) => `
          <article class="admin-item">
            <img src="${item.imageUrl}" alt="" loading="lazy" />
            <div>
              <span>${item.category || "uncategorized"} · Order ${item.order ?? 0}</span>
              <strong>${item.title || "Untitled"}</strong>
              <p>${item.meta || item.alt || ""}</p>
            </div>
            <div class="admin-item__actions">
              <button type="button" data-edit-portfolio="${item.id}">Edit</button>
              <button type="button" data-delete-portfolio="${item.id}" class="danger">Delete</button>
            </div>
          </article>
        `)
        .join("")
    : `<p class="admin-empty">No Firebase portfolio items yet. Add your first image above.</p>`;
};

const renderServices = () => {
  servicesList.innerHTML = state.services.length
    ? state.services
        .map((item) => `
          <article class="admin-item">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="" loading="lazy" />` : `<div class="admin-item__placeholder">AI</div>`}
            <div>
              <span>${item.slug || item.id} · Order ${item.order ?? 0}</span>
              <strong>${item.title || "Untitled service"}</strong>
              <p>${item.description || ""}</p>
            </div>
            <div class="admin-item__actions">
              <button type="button" data-edit-service="${item.id}">Edit</button>
              <button type="button" data-delete-service="${item.id}" class="danger">Delete</button>
            </div>
          </article>
        `)
        .join("")
    : `<p class="admin-empty">No Firebase services yet. Add your first service above.</p>`;
};

const loadPortfolio = async () => {
  const snapshot = await getDocs(query(collection(db, "portfolioItems"), orderBy("order", "asc")));
  state.portfolioItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderPortfolio();
};

const loadServices = async () => {
  const snapshot = await getDocs(query(collection(db, "services"), orderBy("order", "asc")));
  state.services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderServices();
};

const loadAll = async () => {
  await Promise.all([loadPortfolio(), loadServices()]);
};

$("#login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireFirebase()) return;
  const email = $("#admin-email").value.trim().toLowerCase();
  const password = $("#admin-password").value;
  const createAccount = $("#create-account").checked;
  if (email !== ADMIN_EMAIL) {
    showStatus(`Only ${ADMIN_EMAIL} can use this admin panel.`, "error");
    return;
  }
  setBusy(event.currentTarget, true);
  try {
    if (createAccount) {
      await createUserWithEmailAndPassword(auth, email, password);
      $("#create-account").checked = false;
      showStatus(`Admin account created for ${ADMIN_EMAIL}.`, "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showStatus("Signed in.", "success");
    }
  } catch (error) {
    showStatus(friendlyFirebaseError(error), "error");
  } finally {
    setBusy(event.currentTarget, false);
  }
});

$("#logout")?.addEventListener("click", () => signOut(auth));

$("#portfolio-image")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  portfolioPreview.src = URL.createObjectURL(file);
  portfolioPreview.hidden = false;
});

$("#service-image")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  servicePreview.src = URL.createObjectURL(file);
  servicePreview.hidden = false;
});

portfolioForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireFirebase()) return;
  const file = $("#portfolio-image").files?.[0];
  if (!state.editingPortfolioId && !file) {
    showStatus("Choose an image for the portfolio item.", "error");
    return;
  }
  setBusy(portfolioForm, true);
  try {
    const existing = state.portfolioItems.find((item) => item.id === state.editingPortfolioId);
    const uploaded = await uploadImage(file, "portfolio");
    if (file && existing?.storagePath) await removeStorageFile(existing.storagePath);
    const payload = {
      title: $("#portfolio-title-input").value.trim(),
      meta: $("#portfolio-meta").value.trim(),
      alt: $("#portfolio-alt").value.trim(),
      category: $("#portfolio-category").value.trim() || "living",
      layout: $("#portfolio-layout").value,
      order: Number($("#portfolio-order").value || 0),
      active: $("#portfolio-active").checked,
      updatedAt: serverTimestamp(),
      ...uploaded,
    };
    if (state.editingPortfolioId) {
      await updateDoc(doc(db, "portfolioItems", state.editingPortfolioId), payload);
      showStatus("Portfolio item updated.", "success");
    } else {
      await addDoc(collection(db, "portfolioItems"), { ...payload, createdAt: serverTimestamp() });
      showStatus("Portfolio item published.", "success");
    }
    resetPortfolioForm();
    await loadPortfolio();
  } catch (error) {
    showStatus(friendlyFirebaseError(error), "error");
  } finally {
    setBusy(portfolioForm, false);
  }
});

serviceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireFirebase()) return;
  setBusy(serviceForm, true);
  try {
    const file = $("#service-image").files?.[0];
    const existing = state.services.find((item) => item.id === state.editingServiceId);
    const uploaded = await uploadImage(file, "services");
    if (file && existing?.storagePath) await removeStorageFile(existing.storagePath);
    const slug = $("#service-slug").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const payload = {
      slug,
      label: $("#service-label").value.trim(),
      title: $("#service-title-input").value.trim(),
      description: $("#service-description").value.trim(),
      bullets: $("#service-bullets").value.split("\n").map((item) => item.trim()).filter(Boolean),
      order: Number($("#service-order").value || 0),
      active: $("#service-active").checked,
      updatedAt: serverTimestamp(),
      ...uploaded,
    };
    if (state.editingServiceId) {
      await updateDoc(doc(db, "services", state.editingServiceId), payload);
      showStatus("Service updated.", "success");
    } else {
      await addDoc(collection(db, "services"), { ...payload, createdAt: serverTimestamp() });
      showStatus("Service published.", "success");
    }
    resetServiceForm();
    await loadServices();
  } catch (error) {
    showStatus(friendlyFirebaseError(error), "error");
  } finally {
    setBusy(serviceForm, false);
  }
});

document.addEventListener("click", async (event) => {
  const portfolioId = event.target.dataset.editPortfolio;
  const deletePortfolioId = event.target.dataset.deletePortfolio;
  const serviceId = event.target.dataset.editService;
  const deleteServiceId = event.target.dataset.deleteService;

  if (portfolioId) {
    const item = state.portfolioItems.find((entry) => entry.id === portfolioId);
    if (!item) return;
    state.editingPortfolioId = portfolioId;
    $("#portfolio-id").value = portfolioId;
    $("#portfolio-title-input").value = item.title || "";
    $("#portfolio-meta").value = item.meta || "";
    $("#portfolio-alt").value = item.alt || "";
    $("#portfolio-category").value = item.category || "";
    $("#portfolio-layout").value = item.layout || "";
    $("#portfolio-order").value = item.order ?? 0;
    $("#portfolio-active").checked = item.active !== false;
    portfolioPreview.src = item.imageUrl;
    portfolioPreview.hidden = false;
    $("#portfolio-submit").textContent = "Update portfolio item";
    portfolioForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (deletePortfolioId) {
    if (!confirm("Delete this portfolio item?")) return;
    const item = state.portfolioItems.find((entry) => entry.id === deletePortfolioId);
    await deleteDoc(doc(db, "portfolioItems", deletePortfolioId));
    await removeStorageFile(item?.storagePath);
    await loadPortfolio();
    showStatus("Portfolio item deleted.", "success");
  }

  if (serviceId) {
    const item = state.services.find((entry) => entry.id === serviceId);
    if (!item) return;
    state.editingServiceId = serviceId;
    $("#service-id").value = serviceId;
    $("#service-slug").value = item.slug || "";
    $("#service-label").value = item.label || "";
    $("#service-title-input").value = item.title || "";
    $("#service-description").value = item.description || "";
    $("#service-bullets").value = (item.bullets || []).join("\n");
    $("#service-order").value = item.order ?? 0;
    $("#service-active").checked = item.active !== false;
    if (item.imageUrl) {
      servicePreview.src = item.imageUrl;
      servicePreview.hidden = false;
    }
    $("#service-submit").textContent = "Update service";
    serviceForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (deleteServiceId) {
    if (!confirm("Delete this service?")) return;
    const item = state.services.find((entry) => entry.id === deleteServiceId);
    await deleteDoc(doc(db, "services", deleteServiceId));
    await removeStorageFile(item?.storagePath);
    await loadServices();
    showStatus("Service deleted.", "success");
  }
});

$("#portfolio-cancel")?.addEventListener("click", resetPortfolioForm);
$("#service-cancel")?.addEventListener("click", resetServiceForm);

if (!firebaseReady) {
  showStatus("Add Firebase environment values, then rebuild/deploy to activate admin features.", "error");
} else {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      loginPanel.hidden = false;
      appPanel.hidden = true;
      showStatus("Sign in to manage portfolio and services.");
      return;
    }
    const signedInEmail = user.email?.toLowerCase();
    if (signedInEmail !== ADMIN_EMAIL) {
      await signOut(auth);
      loginPanel.hidden = false;
      appPanel.hidden = true;
      showStatus(`Access denied. Only ${ADMIN_EMAIL} can use this admin panel.`, "error");
      return;
    }
    loginPanel.hidden = true;
    appPanel.hidden = false;
    showStatus(`Signed in as ${user.email}.`, "success");
    await loadAll();
  });
}
