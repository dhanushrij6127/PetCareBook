/* ============================================
   PetCareBook – Pet Vaccination Reminder System
   Vanilla JavaScript Application
   ============================================ */

/* ---------- API Configuration ---------- */
const API_BASE_URL = "http://localhost:8080";

/* ---------- API Helpers ---------- */
async function apiGet(endpoint) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`);
  } catch (err) {
    throw new Error("Unable to connect to the PetCareBook server. Please make sure Spring Boot is running on port 8080.");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(parseErrorMessage(response, text));
  }
  return safeJson(response);
}

async function apiPost(endpoint, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error("Unable to connect to the PetCareBook server. Please make sure Spring Boot is running on port 8080.");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(parseErrorMessage(response, text));
  }
  return safeJson(response);
}

async function apiPut(endpoint, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error("Unable to connect to the PetCareBook server. Please make sure Spring Boot is running on port 8080.");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(parseErrorMessage(response, text));
  }
  return safeJson(response);
}

async function apiDelete(endpoint) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "DELETE" });
  } catch (err) {
    throw new Error("Unable to connect to the PetCareBook server. Please make sure Spring Boot is running on port 8080.");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(parseErrorMessage(response, text));
  }
  return safeText(response);
}

/* Parse error messages from backend responses */
function parseErrorMessage(response, text) {
  if (response.status === 400) {
    return text || "Please check the information you entered.";
  }
  if (response.status === 404) {
    return text || "Requested record was not found.";
  }
  if (response.status >= 500) {
    return text || "The PetCareBook server encountered an error. Please try again later.";
  }
  return text || `Request failed (HTTP ${response.status}).`;
}

/* Safely parse JSON or return text */
async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function safeText(response) {
  const text = await response.text();
  return text || "OK";
}

/* ---------- Toast Notification ---------- */
let toastTimer = null;
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 4000);
}

/* ---------- Auth ---------- */
function isLoggedIn() {
  return localStorage.getItem("petcarebook_login") === "true";
}

function login() {
  localStorage.setItem("petcarebook_login", "true");
}

function logout() {
  localStorage.removeItem("petcarebook_login");
  showSection("loginSection");
  document.getElementById("appShell").classList.add("hidden");
}

/* ---------- SPA Navigation ---------- */
const SECTION_TITLES = {
  dashboardSection: "Dashboard",
  ownersSection: "Owners",
  petsSection: "Pets",
  vaccinesSection: "Vaccines",
  vaccinationsSection: "Vaccinations",
  dueSoonSection: "Due Soon",
};

const SECTION_LOADERS = {
  dashboardSection: loadDashboard,
  ownersSection: loadOwners,
  petsSection: loadPets,
  vaccinesSection: loadVaccines,
  vaccinationsSection: loadVaccinationPage,
  dueSoonSection: loadDueSoon,
};

function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
  const section = document.getElementById(sectionId);
  if (section) section.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add("active");

  document.getElementById("pageTitle").textContent = SECTION_TITLES[sectionId] || "Dashboard";

  if (SECTION_LOADERS[sectionId]) {
    SECTION_LOADERS[sectionId]();
  }

  closeSidebar();
}

/* ---------- Sidebar (mobile) ---------- */
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarOverlay").classList.remove("hidden");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.add("hidden");
}

/* ---------- Modal Helpers ---------- */
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

/* ---------- Utility ---------- */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return escapeHtml(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatInterval(days) {
  if (days == null) return "—";
  days = Number(days);
  if (days >= 365 && days % 365 === 0) {
    const years = days / 365;
    return years === 1 ? "Every 1 year" : `Every ${years} years`;
  }
  if (days >= 30 && days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "Every 1 month" : `Every ${months} months`;
  }
  return days === 1 ? "Every 1 day" : `Every ${days} days`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/* ---------- Confirm Delete ---------- */
let pendingDelete = null;
function confirmDelete(message, callback) {
  document.getElementById("confirmMessage").textContent = message;
  pendingDelete = callback;
  openModal("confirmModal");
}

/* ============================================
   DASHBOARD
   ============================================ */
async function loadDashboard() {
  const statOwners = document.getElementById("statOwners");
  const statPets = document.getElementById("statPets");
  const statVaccines = document.getElementById("statVaccines");
  const statDueSoon = document.getElementById("statDueSoon");
  const dueSoonPanel = document.getElementById("dashboardDueSoon");

  statOwners.textContent = "—";
  statPets.textContent = "—";
  statVaccines.textContent = "—";
  statDueSoon.textContent = "—";
  dueSoonPanel.innerHTML = '<p class="loading-text">Loading...</p>';

  const fetches = [
    apiGet("/api/owners").catch(() => null),
    apiGet("/api/pets").catch(() => null),
    apiGet("/api/vaccines").catch(() => null),
    apiGet("/api/vaccinations/due-soon").catch(() => null),
  ];

  const [owners, pets, vaccines, dueSoon] = await Promise.all(fetches);

  statOwners.textContent = Array.isArray(owners) ? owners.length : "0";
  statPets.textContent = Array.isArray(pets) ? pets.length : "0";
  statVaccines.textContent = Array.isArray(vaccines) ? vaccines.length : "0";
  statDueSoon.textContent = Array.isArray(dueSoon) ? dueSoon.length : "0";

  if (Array.isArray(dueSoon) && dueSoon.length > 0) {
    dueSoonPanel.innerHTML = dueSoon.map(p => `
      <div class="due-soon-item">
        <div class="due-soon-item-info">
          <span class="due-soon-item-name">${escapeHtml(p.name)}</span>
          <span class="due-soon-item-meta">${escapeHtml(p.species || "—")} &middot; ${escapeHtml(p.breed || "—")}</span>
        </div>
        <span class="badge badge-warning"><span class="badge-dot"></span>Due Soon</span>
      </div>
    `).join("");
  } else {
    dueSoonPanel.innerHTML = '<p class="hint-text">No vaccinations due in the next 7 days.</p>';
  }
}

/* ============================================
   OWNERS
   ============================================ */
let allOwners = [];

async function loadOwners() {
  const tbody = document.getElementById("ownersTableBody");
  tbody.innerHTML = '<tr><td colspan="4" class="loading-text">Loading...</td></tr>';
  try {
    allOwners = await apiGet("/api/owners");
    renderOwnersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="loading-text">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderOwnersTable() {
  const tbody = document.getElementById("ownersTableBody");
  const searchTerm = (document.getElementById("ownerSearch").value || "").toLowerCase();
  const filtered = allOwners.filter(o =>
    (o.name || "").toLowerCase().includes(searchTerm)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No owners found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><strong>${escapeHtml(o.name)}</strong></td>
      <td>${escapeHtml(o.phone)}</td>
      <td>${escapeHtml(o.email)}</td>
      <td class="col-actions">
        <button class="row-action-btn" onclick="editOwner(${o.id})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="row-action-btn danger" onclick="deleteOwner(${o.id}, '${escapeHtml(o.name)}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join("");
}

function openOwnerModal(owner = null) {
  document.getElementById("ownerModalTitle").textContent = owner ? "Edit Owner" : "Add Owner";
  document.getElementById("ownerId").value = owner ? owner.id : "";
  document.getElementById("ownerName").value = owner ? owner.name : "";
  document.getElementById("ownerPhone").value = owner ? owner.phone : "";
  document.getElementById("ownerEmail").value = owner ? owner.email : "";
  ["ownerNameError", "ownerPhoneError", "ownerEmailError"].forEach(id =>
    document.getElementById(id).classList.add("hidden")
  );
  openModal("ownerModal");
}

function editOwner(id) {
  const owner = allOwners.find(o => o.id === id);
  if (owner) openOwnerModal(owner);
}

function deleteOwner(id, name) {
  confirmDelete(`Are you sure you want to delete owner "${name}"?`, async () => {
    try {
      await apiDelete(`/api/owners/${id}`);
      showToast("Owner deleted successfully.", "success");
      loadOwners();
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

function validateOwnerForm() {
  let valid = true;
  const name = document.getElementById("ownerName").value.trim();
  const phone = document.getElementById("ownerPhone").value.trim();
  const email = document.getElementById("ownerEmail").value.trim();

  const nameError = document.getElementById("ownerNameError");
  const phoneError = document.getElementById("ownerPhoneError");
  const emailError = document.getElementById("ownerEmailError");
  nameError.classList.add("hidden");
  phoneError.classList.add("hidden");
  emailError.classList.add("hidden");

  if (!name) {
    nameError.textContent = "Name is required.";
    nameError.classList.remove("hidden");
    valid = false;
  }
  if (!phone) {
    phoneError.textContent = "Phone is required.";
    phoneError.classList.remove("hidden");
    valid = false;
  }
  if (!email) {
    emailError.textContent = "Email is required.";
    emailError.classList.remove("hidden");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Please enter a valid email address.";
    emailError.classList.remove("hidden");
    valid = false;
  }
  return valid;
}

async function submitOwnerForm(e) {
  e.preventDefault();
  if (!validateOwnerForm()) return;

  const id = document.getElementById("ownerId").value;
  const data = {
    name: document.getElementById("ownerName").value.trim(),
    phone: document.getElementById("ownerPhone").value.trim(),
    email: document.getElementById("ownerEmail").value.trim(),
  };

  const btn = document.getElementById("ownerSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    if (id) {
      await apiPut(`/api/owners/${id}`, data);
      showToast("Owner updated successfully.", "success");
    } else {
      await apiPost("/api/owners", data);
      showToast("Owner added successfully.", "success");
    }
    closeModal("ownerModal");
    loadOwners();
    loadDashboard();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save";
  }
}

/* ============================================
   PETS
   ============================================ */
let allPets = [];
let allPetsOwners = [];

async function loadPets() {
  const tbody = document.getElementById("petsTableBody");
  tbody.innerHTML = '<tr><td colspan="6" class="loading-text">Loading...</td></tr>';
  try {
    allPets = await apiGet("/api/pets");
    renderPetsTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-text">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderPetsTable() {
  const tbody = document.getElementById("petsTableBody");
  if (allPets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No pets registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allPets.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${escapeHtml(p.species)}</td>
      <td>${escapeHtml(p.breed || "—")}</td>
      <td>${formatDate(p.dateOfBirth)}</td>
      <td>${p.owner ? `#${p.owner.id} ${escapeHtml(p.owner.name || "")}` : "—"}</td>
      <td class="col-actions">
        <button class="row-action-btn info" onclick="viewPetHistory(${p.id}, '${escapeHtml(p.name)}')" title="View History">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
        <button class="row-action-btn" onclick="editPet(${p.id})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="row-action-btn danger" onclick="deletePet(${p.id}, '${escapeHtml(p.name)}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join("");
}

async function openPetModal(pet = null) {
  document.getElementById("petModalTitle").textContent = pet ? "Edit Pet" : "Register Pet";
  document.getElementById("petId").value = pet ? pet.id : "";
  document.getElementById("petName").value = pet ? pet.name : "";
  document.getElementById("petSpecies").value = pet ? pet.species : "";
  document.getElementById("petBreed").value = pet ? pet.breed : "";
  document.getElementById("petDob").value = pet ? (pet.dateOfBirth || "") : "";
  ["petNameError", "petSpeciesError", "petDobError", "petOwnerError"].forEach(id =>
    document.getElementById(id).classList.add("hidden")
  );

  const ownerSelect = document.getElementById("petOwnerSelect");
  ownerSelect.innerHTML = '<option value="">Loading owners...</option>';

  try {
    allPetsOwners = await apiGet("/api/owners");
    if (allPetsOwners.length === 0) {
      ownerSelect.innerHTML = '<option value="">No owners available</option>';
    } else {
      ownerSelect.innerHTML = '<option value="">Select an owner</option>' +
        allPetsOwners.map(o => `<option value="${o.id}">#${o.id} ${escapeHtml(o.name)}</option>`).join("");
      if (pet && pet.owner) ownerSelect.value = pet.owner.id;
    }
  } catch (err) {
    ownerSelect.innerHTML = '<option value="">Failed to load owners</option>';
  }

  openModal("petModal");
}

function editPet(id) {
  const pet = allPets.find(p => p.id === id);
  if (pet) openPetModal(pet);
}

function deletePet(id, name) {
  confirmDelete(`Are you sure you want to delete pet "${name}"?`, async () => {
    try {
      await apiDelete(`/api/pets/${id}`);
      showToast("Pet deleted successfully.", "success");
      loadPets();
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

function validatePetForm() {
  let valid = true;
  const name = document.getElementById("petName").value.trim();
  const species = document.getElementById("petSpecies").value.trim();
  const dob = document.getElementById("petDob").value;
  const ownerId = document.getElementById("petOwnerSelect").value;

  const nameError = document.getElementById("petNameError");
  const speciesError = document.getElementById("petSpeciesError");
  const dobError = document.getElementById("petDobError");
  const ownerError = document.getElementById("petOwnerError");
  [nameError, speciesError, dobError, ownerError].forEach(e => e.classList.add("hidden"));

  if (!name) { nameError.textContent = "Pet name is required."; nameError.classList.remove("hidden"); valid = false; }
  if (!species) { speciesError.textContent = "Species is required."; speciesError.classList.remove("hidden"); valid = false; }
  if (!dob) {
    dobError.textContent = "Date of birth is required.";
    dobError.classList.remove("hidden");
    valid = false;
  } else if (dob > todayStr()) {
    dobError.textContent = "Date of birth cannot be in the future.";
    dobError.classList.remove("hidden");
    valid = false;
  }
  if (!ownerId) { ownerError.textContent = "Please select an owner."; ownerError.classList.remove("hidden"); valid = false; }
  return valid;
}

async function submitPetForm(e) {
  e.preventDefault();
  if (!validatePetForm()) return;

  const id = document.getElementById("petId").value;
  const data = {
    name: document.getElementById("petName").value.trim(),
    species: document.getElementById("petSpecies").value.trim(),
    breed: document.getElementById("petBreed").value.trim(),
    dateOfBirth: document.getElementById("petDob").value,
    owner: { id: parseInt(document.getElementById("petOwnerSelect").value, 10) },
  };

  const btn = document.getElementById("petSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    if (id) {
      await apiPut(`/api/pets/${id}`, data);
      showToast("Pet updated successfully.", "success");
    } else {
      await apiPost("/api/pets", data);
      showToast("Pet registered successfully.", "success");
    }
    closeModal("petModal");
    loadPets();
    loadDashboard();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save";
  }
}

/* ============================================
   VACCINATION HISTORY
   ============================================ */
async function viewPetHistory(petId, petName) {
  document.getElementById("historyModalTitle").textContent = `Vaccination History – ${petName}`;
  document.getElementById("historyModalBody").innerHTML = '<p class="loading-text">Loading...</p>';
  openModal("historyModal");

  try {
    const history = await apiGet(`/api/pets/${petId}/vaccinations`);
    const body = document.getElementById("historyModalBody");

    if (!Array.isArray(history) || history.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6l-4 4v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8l-4-4V2"/><line x1="9" y1="2" x2="15" y2="2"/></svg>
          <p>No vaccination records found for this pet yet.</p>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Date Given</th>
              <th>Next Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(v => `
              <tr>
                <td><strong>${escapeHtml(v.vaccineType ? v.vaccineType.name : "—")}</strong></td>
                <td>${formatDate(v.dateGiven)}</td>
                <td>${formatDate(v.nextDueDate)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    body.innerHTML = `<p class="loading-text" style="color:var(--color-error)">${escapeHtml(err.message)}</p>`;
  }
}

/* ============================================
   VACCINES
   ============================================ */
let allVaccines = [];

async function loadVaccines() {
  const tbody = document.getElementById("vaccinesTableBody");
  tbody.innerHTML = '<tr><td colspan="3" class="loading-text">Loading...</td></tr>';
  try {
    allVaccines = await apiGet("/api/vaccines");
    renderVaccinesTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" class="loading-text">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderVaccinesTable() {
  const tbody = document.getElementById("vaccinesTableBody");
  if (allVaccines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No vaccine types added yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allVaccines.map(v => `
    <tr>
      <td><strong>${escapeHtml(v.name)}</strong></td>
      <td>${formatInterval(v.intervalDays)} <span style="color:var(--color-text-muted);font-size:0.78rem">(${v.intervalDays} days)</span></td>
      <td class="col-actions">
        <button class="row-action-btn" onclick="editVaccine(${v.id})" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="row-action-btn danger" onclick="deleteVaccine(${v.id}, '${escapeHtml(v.name)}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join("");
}

function openVaccineModal(vaccine = null) {
  document.getElementById("vaccineModalTitle").textContent = vaccine ? "Edit Vaccine" : "Add Vaccine";
  document.getElementById("vaccineId").value = vaccine ? vaccine.id : "";
  document.getElementById("vaccineName").value = vaccine ? vaccine.name : "";
  document.getElementById("vaccineInterval").value = vaccine ? vaccine.intervalDays : "";
  ["vaccineNameError", "vaccineIntervalError"].forEach(id =>
    document.getElementById(id).classList.add("hidden")
  );
  openModal("vaccineModal");
}

function editVaccine(id) {
  const vaccine = allVaccines.find(v => v.id === id);
  if (vaccine) openVaccineModal(vaccine);
}

function deleteVaccine(id, name) {
  confirmDelete(`Are you sure you want to delete vaccine "${name}"?`, async () => {
    try {
      await apiDelete(`/api/vaccines/${id}`);
      showToast("Vaccine deleted successfully.", "success");
      loadVaccines();
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

function validateVaccineForm() {
  let valid = true;
  const name = document.getElementById("vaccineName").value.trim();
  const interval = parseInt(document.getElementById("vaccineInterval").value, 10);

  const nameError = document.getElementById("vaccineNameError");
  const intervalError = document.getElementById("vaccineIntervalError");
  [nameError, intervalError].forEach(e => e.classList.add("hidden"));

  if (!name) { nameError.textContent = "Vaccine name is required."; nameError.classList.remove("hidden"); valid = false; }
  if (!interval || isNaN(interval) || interval <= 0) {
    intervalError.textContent = "Interval must be a number greater than 0.";
    intervalError.classList.remove("hidden");
    valid = false;
  }
  return valid;
}

async function submitVaccineForm(e) {
  e.preventDefault();
  if (!validateVaccineForm()) return;

  const id = document.getElementById("vaccineId").value;
  const data = {
    name: document.getElementById("vaccineName").value.trim(),
    intervalDays: parseInt(document.getElementById("vaccineInterval").value, 10),
  };

  const btn = document.getElementById("vaccineSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    if (id) {
      await apiPut(`/api/vaccines/${id}`, data);
      showToast("Vaccine updated successfully.", "success");
    } else {
      await apiPost("/api/vaccines", data);
      showToast("Vaccine added successfully.", "success");
    }
    closeModal("vaccineModal");
    loadVaccines();
    loadDashboard();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save";
  }
}

/* ============================================
   VACCINATIONS
   ============================================ */
async function loadVaccinationPage() {
  const petSelect = document.getElementById("vaccPetSelect");
  const vaccineSelect = document.getElementById("vaccVaccineSelect");
  petSelect.innerHTML = '<option value="">Loading pets...</option>';
  vaccineSelect.innerHTML = '<option value="">Loading vaccines...</option>';

  try {
    const [pets, vaccines] = await Promise.all([
      apiGet("/api/pets").catch(() => []),
      apiGet("/api/vaccines").catch(() => []),
    ]);

    if (Array.isArray(pets) && pets.length > 0) {
      petSelect.innerHTML = '<option value="">Select a pet</option>' +
        pets.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.species || "—")})</option>`).join("");
    } else {
      petSelect.innerHTML = '<option value="">No pets available</option>';
    }

    if (Array.isArray(vaccines) && vaccines.length > 0) {
      vaccineSelect.innerHTML = '<option value="">Select a vaccine</option>' +
        vaccines.map(v => `<option value="${v.id}">${escapeHtml(v.name)}</option>`).join("");
    } else {
      vaccineSelect.innerHTML = '<option value="">No vaccines available</option>';
    }
  } catch (err) {
    petSelect.innerHTML = '<option value="">Failed to load pets</option>';
    vaccineSelect.innerHTML = '<option value="">Failed to load vaccines</option>';
  }
}

function validateVaccinationForm() {
  let valid = true;
  const petId = document.getElementById("vaccPetSelect").value;
  const vaccineId = document.getElementById("vaccVaccineSelect").value;
  const dateGiven = document.getElementById("vaccDateGiven").value;
  const errorEl = document.getElementById("vaccFormError");
  errorEl.classList.add("hidden");

  if (!petId || !vaccineId) {
    errorEl.textContent = "Please select both a pet and a vaccine.";
    errorEl.classList.remove("hidden");
    valid = false;
  } else if (!dateGiven) {
    errorEl.textContent = "Date given is required.";
    errorEl.classList.remove("hidden");
    valid = false;
  } else if (dateGiven > todayStr()) {
    errorEl.textContent = "Date given cannot be in the future.";
    errorEl.classList.remove("hidden");
    valid = false;
  }
  return valid;
}

async function submitVaccinationForm(e) {
  e.preventDefault();
  if (!validateVaccinationForm()) return;

  const data = {
    pet: { id: parseInt(document.getElementById("vaccPetSelect").value, 10) },
    vaccineType: { id: parseInt(document.getElementById("vaccVaccineSelect").value, 10) },
    dateGiven: document.getElementById("vaccDateGiven").value,
  };

  const btn = document.getElementById("vaccSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Recording...";

  try {
    const result = await apiPost("/api/vaccinations", data);
    showToast("Vaccination recorded successfully.", "success");
    displayVaccinationResult(result);
    document.getElementById("vaccinationForm").reset();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Record Vaccination";
  }
}

function displayVaccinationResult(result) {
  const resultEl = document.getElementById("vaccResult");
  const grid = document.getElementById("vaccResultGrid");
  if (!result) {
    resultEl.classList.remove("hidden");
    grid.innerHTML = '<p style="font-size:0.875rem">Vaccination recorded.</p>';
    return;
  }

  const petName = result.pet ? result.pet.name : "—";
  const vaccineName = result.vaccineType ? result.vaccineType.name : "—";

  grid.innerHTML = `
    <div class="vacc-result-item">
      <div class="vacc-result-item-label">Pet</div>
      <div class="vacc-result-item-value">${escapeHtml(petName)}</div>
    </div>
    <div class="vacc-result-item">
      <div class="vacc-result-item-label">Vaccine</div>
      <div class="vacc-result-item-value">${escapeHtml(vaccineName)}</div>
    </div>
    <div class="vacc-result-item">
      <div class="vacc-result-item-label">Date Given</div>
      <div class="vacc-result-item-value">${formatDate(result.dateGiven)}</div>
    </div>
    <div class="vacc-result-item">
      <div class="vacc-result-item-label">Next Due Date</div>
      <div class="vacc-result-item-value">${formatDate(result.nextDueDate)}</div>
    </div>
  `;
  resultEl.classList.remove("hidden");
}

/* ============================================
   DUE SOON PAGE
   ============================================ */
async function loadDueSoon() {
  const content = document.getElementById("dueSoonContent");
  content.innerHTML = '<p class="loading-text">Loading...</p>';

  try {
    const dueSoon = await apiGet("/api/vaccinations/due-soon");

    if (!Array.isArray(dueSoon) || dueSoon.length === 0) {
      content.innerHTML = `
        <div class="due-soon-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p>Great! No vaccinations are due in the next 7 days.</p>
        </div>`;
      return;
    }

    content.innerHTML = `
      <div class="due-soon-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>Vaccinations due within the next 7 days</span>
      </div>
      <div class="due-soon-grid">
        ${dueSoon.map(p => `
          <div class="due-soon-card">
            <div class="due-soon-card-header">
              <div>
                <div class="due-soon-card-name">${escapeHtml(p.name)}</div>
                <div class="due-soon-card-meta">${escapeHtml(p.species || "—")} &middot; ${escapeHtml(p.breed || "—")}</div>
              </div>
              <span class="badge badge-warning"><span class="badge-dot"></span>Due Soon</span>
            </div>
            <div class="due-soon-card-dob">Date of Birth: ${formatDate(p.dateOfBirth)}</div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p class="loading-text" style="color:var(--color-error)">${escapeHtml(err.message)}</p>`;
  }
}

/* ============================================
   EVENT LISTENERS & INIT
   ============================================ */
function initEvents() {
  /* Login form */
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorEl = document.getElementById("loginError");

    if (!email || !password) {
      errorEl.textContent = "Please enter both email and password.";
      errorEl.classList.remove("hidden");
      return;
    }
    errorEl.classList.add("hidden");
    login();
    enterApp();
  });

  /* Logout */
  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  /* Navigation */
  document.querySelectorAll(".nav-item[data-section]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(item.dataset.section);
    });
  });

  /* Sidebar toggle */
  document.getElementById("menuToggle").addEventListener("click", openSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);

  /* Modal close buttons */
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  /* Click outside modal to close */
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  /* Owner search */
  document.getElementById("ownerSearch").addEventListener("input", renderOwnersTable);

  /* Forms */
  document.getElementById("ownerForm").addEventListener("submit", submitOwnerForm);
  document.getElementById("petForm").addEventListener("submit", submitPetForm);
  document.getElementById("vaccineForm").addEventListener("submit", submitVaccineForm);
  document.getElementById("vaccinationForm").addEventListener("submit", submitVaccinationForm);

  /* Confirm delete */
  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    closeModal("confirmModal");
    if (pendingDelete) pendingDelete();
    pendingDelete = null;
  });

  /* Quick action buttons (delegated) */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    switch (action) {
      case "addOwner": showSection("ownersSection"); openOwnerModal(); break;
      case "registerPet": showSection("petsSection"); openPetModal(); break;
      case "addVaccine": showSection("vaccinesSection"); openVaccineModal(); break;
      case "recordVaccination": showSection("vaccinationsSection"); break;
    }
  });
}

function enterApp() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  showSection("dashboardSection");
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  if (isLoggedIn()) {
    enterApp();
  } else {
    document.getElementById("loginSection").classList.remove("hidden");
    document.getElementById("appShell").classList.add("hidden");
  }
});
