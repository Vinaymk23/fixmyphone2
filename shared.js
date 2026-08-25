/**
 * shared.js — Shared utilities for fixmyPhone website
 * Contains: Firebase config, form submission, validation, mobile menu, modal logic
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAPwUjYPD5CzGIfT_6KqkpdLKnUNURSIs8",
  authDomain: "fixmyphone-website-889b5.firebaseapp.com",
  projectId: "fixmyphone-website-889b5",
  storageBucket: "fixmyphone-website-889b5.appspot.com",
  messagingSenderId: "619306240303",
  appId: "1:619306240303:web:f1e2445eec7bba1a09b9da",
};

export const APP_ID = "fixmyphone-website-889b5";
export let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
  db = null;
}

// --- Validation ---

/**
 * Validates a 10-digit Indian phone number
 */
export function validatePhone(value) {
  return /^\d{10}$/.test(value);
}

/**
 * Validates an email address
 */
export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// --- Form Submission ---

/**
 * Submits form data to Firestore quoteRequests collection
 * @param {Object} data - Form data to submit
 * @param {Object} options - { redirectUrl, errorElement, submitButton, submitText, submitSpinner }
 */
export async function submitQuoteRequest(data, options) {
  const { redirectUrl, errorElement, submitButton, submitTextEl, submitSpinner } = options;

  if (!db) {
    showFormError(errorElement, "Database connection failed. Please try again later.");
    resetSubmitButton(submitButton, submitTextEl, submitSpinner);
    return;
  }

  const formData = {
    ...data,
    submittedAt: serverTimestamp(),
    status: "New",
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out after 10 seconds.")), 10000)
  );

  try {
    const collectionRef = collection(db, "artifacts", APP_ID, "public", "data", "quoteRequests");
    const addDocPromise = addDoc(collectionRef, formData);
    const docRef = await Promise.race([addDocPromise, timeoutPromise]);

    if (!docRef || !docRef.id) {
      throw new Error("Database returned an invalid response.");
    }

    window.location.href = `${redirectUrl}?id=${docRef.id}`;
  } catch (error) {
    console.error("Error submitting quote:", error);
    if (error.message && error.message.includes("timed out")) {
      showFormError(errorElement, "Request timed out. Please check your network and try again.");
    } else {
      showFormError(errorElement, "Could not submit request. Please try again." + (error.message ? ` (${error.message})` : ""));
    }
    resetSubmitButton(submitButton, submitTextEl, submitSpinner);
  }
}

/**
 * Submits a contact form message to Firestore
 * @param {Object} data - Form data to submit
 * @param {Object} options - { errorElement, successElement, submitButton, submitTextEl, submitSpinner, form }
 */
export async function submitContactForm(data, options) {
  const { errorElement, successElement, submitButton, submitTextEl, submitSpinner, form } = options;

  if (!db) {
    showFormError(errorElement, "Database is not configured correctly. Cannot submit.");
    resetSubmitButton(submitButton, submitTextEl, submitSpinner);
    return;
  }

  const formData = {
    ...data,
    submittedAt: serverTimestamp(),
    status: "New",
  };

  try {
    const collectionRef = collection(db, "artifacts", APP_ID, "public", "data", "quoteRequests");
    await addDoc(collectionRef, formData);
    successElement.classList.remove("hidden");
    if (form) form.reset();
  } catch (error) {
    console.error("Error submitting contact form:", error);
    showFormError(errorElement, "Could not send message. Please try again later.");
  } finally {
    resetSubmitButton(submitButton, submitTextEl, submitSpinner);
  }
}

// --- UI Helpers ---

export function showFormError(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove("hidden");
  }
}

export function hideFormError(element) {
  if (element) {
    element.classList.add("hidden");
  }
}

export function resetSubmitButton(button, textEl, spinnerEl) {
  if (button) button.disabled = false;
  if (textEl) textEl.textContent = "Submit Request";
  if (spinnerEl) spinnerEl.classList.add("hidden");
}

// --- Mobile Menu ---

/**
 * Initializes mobile menu toggle. Call on DOMContentLoaded.
 */
export function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.toggle("active"));
  }
}

// --- Modal ---

/**
 * Shows a modal element
 * @param {HTMLElement} modal - The modal backdrop element
 * @param {HTMLElement} content - The modal content element (optional)
 */
export function showModal(modal, content) {
  if (!modal) return;
  modal.classList.remove("invisible", "opacity-0");
  if (content) content.classList.remove("scale-95");
  document.body.style.overflow = "hidden";
}

/**
 * Hides a modal element
 * @param {HTMLElement} modal - The modal backdrop element
 * @param {HTMLElement} content - The modal content element (optional)
 * @param {HTMLElement} errorElement - Error element to hide (optional)
 */
export function hideModal(modal, content, errorElement) {
  if (!modal) return;
  modal.classList.add("invisible", "opacity-0");
  if (content) content.classList.add("scale-95");
  document.body.style.overflow = "";
  if (errorElement) errorElement.classList.add("hidden");
}

/**
 * Sets up modal close behavior (close button + backdrop click)
 * @param {HTMLElement} modal - The modal backdrop element
 * @param {HTMLElement} content - The modal content element
 * @param {HTMLElement} closeBtn - The close button element
 * @param {HTMLElement} errorElement - Error element to hide on close (optional)
 */
export function initModal(modal, content, closeBtn, errorElement) {
  if (!modal || !closeBtn) return;

  const hide = () => hideModal(modal, content, errorElement);
  closeBtn.addEventListener("click", hide);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hide();
  });

  return { show: () => showModal(modal, content), hide };
}
