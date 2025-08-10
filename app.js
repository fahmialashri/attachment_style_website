const firebaseConfig = {
  apiKey: "AIzaSyACXLfSHMLeLpc7ZsbJq8sxmEWRA0hHURo",
  authDomain: "webkepribadian.firebaseapp.com",
  projectId: "webkepribadian",
  storageBucket: "webkepribadian.firebasestorage.app",
  messagingSenderId: "936452292631",
  appId: "1:936452292631:web:66db5dbcb211561dee5c52",
  measurementId: "G-C42P8PNPT1",
};

console.log("Firebase config:", firebaseConfig);

// import modular SDK with error handling
let app, db;
try {
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"
  );
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"
  );

  console.log("Firebase modules imported successfully");

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  console.log("Firebase initialized successfully");
  console.log("App:", app);
  console.log("Database:", db);

  // Make these available globally for debugging
  window.firebaseApp = app;
  window.firebaseDb = db;
  window.firestoreUtils = { collection, addDoc, serverTimestamp };
} catch (error) {
  console.error("Firebase initialization error:", error);
  showAlert({
    title: "Gagal Memuat Firebase",
    message:
      "Tidak dapat memuat Firebase. Periksa koneksi internet Anda lalu coba lagi.",
    icon: "⚠️",
    okText: "Mengerti",
  });
}

/* ---- UI helpers: toast, alert, confirm ---- */
function ensureUIRoot() {
  if (!document.getElementById("ui-toast-container")) {
    const t = document.createElement("div");
    t.id = "ui-toast-container";
    t.className = "ui-toast-container";
    document.body.appendChild(t);
  }
}

function showToast(message, { type = "info", duration = 2600 } = {}) {
  ensureUIRoot();
  const container = document.getElementById("ui-toast-container");
  const el = document.createElement("div");
  el.className = `ui-toast ${type}`;
  el.innerHTML = `<span>${message}</span>`;
  container.appendChild(el);
  const remove = () => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 220);
  };
  setTimeout(remove, duration);
  return { close: remove };
}

function showAlert({
  title = "Pemberitahuan",
  message = "",
  okText = "OK",
  icon = "ℹ️",
} = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "ui-backdrop";
    backdrop.innerHTML = `
      <div class="ui-modal" role="dialog" aria-modal="true">
        <div class="ui-modal-header">${icon} ${title}</div>
        <div class="ui-modal-body">${message}</div>
        <div class="ui-modal-actions">
          <button class="btn small btn-primary" id="ui-ok">${okText}</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const ok = backdrop.querySelector("#ui-ok");
    const close = () => {
      backdrop.remove();
      resolve(true);
    };
    ok.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", esc);
          close();
        }
      },
      { once: true }
    );
  });
}

function showConfirm({
  title = "Konfirmasi",
  message = "",
  okText = "Lanjutkan",
  cancelText = "Batal",
  icon = "❓",
} = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "ui-backdrop";
    backdrop.innerHTML = `
      <div class="ui-modal" role="dialog" aria-modal="true">
        <div class="ui-modal-header">${icon} ${title}</div>
        <div class="ui-modal-body">${message}</div>
        <div class="ui-modal-actions">
          <button class="btn small ghost" id="ui-cancel">${cancelText}</button>
          <button class="btn small btn-primary" id="ui-ok">${okText}</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const ok = backdrop.querySelector("#ui-ok");
    const cancel = backdrop.querySelector("#ui-cancel");
    const close = (val) => {
      backdrop.remove();
      resolve(val);
    };
    ok.addEventListener("click", () => close(true));
    cancel.addEventListener("click", () => close(false));
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close(false);
    });
    document.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", esc);
          close(false);
        }
      },
      { once: true }
    );
  });
}

/* --------- QUESTIONS (Attachment Styles) ---------- */
const questions = [
  // Secure (8 questions)
  {
    q: "Saya merasa nyaman ketika bergantung pada orang yang saya percaya.",
    type: "secure",
  },
  {
    q: "Saya tidak merasa cemas jika pasangan saya sibuk for a while.",
    type: "secure",
  },
  {
    q: "Saya mudah berbicara tentang perasaan saya kepada orang yang dekat.",
    type: "secure",
  },
  {
    q: "Saya merasa hubungan yang sehat itu saling mendukung dan tetap mandiri.",
    type: "secure",
  },
  {
    q: "Saya dapat memberikan dukungan kepada pasangan tanpa kehilangan identitas diri.",
    type: "secure",
  },
  {
    q: "Saya merasa percaya diri dalam menjalin hubungan jangka panjang.",
    type: "secure",
  },
  {
    q: "Saya dapat menyelesaikan konflik dengan tenang dan konstruktif.",
    type: "secure",
  },
  {
    q: "Saya merasa aman untuk menunjukkan kerentanan kepada orang terdekat.",
    type: "secure",
  },

  // Anxious (8 questions)
  {
    q: "Saya sering takut orang yang saya sayangi akan meninggalkan saya.",
    type: "anxious",
  },
  {
    q: "Saya merasa khawatir jika pesan saya tidak segera dibalas.",
    type: "anxious",
  },
  {
    q: "Saya butuh sering mendapat kepastian dari pasangan tentang perasaan mereka.",
    type: "anxious",
  },
  {
    q: "Saya mudah merasa cemas saat hubungan terasa tidak stabil.",
    type: "anxious",
  },
  {
    q: "Saya cenderung menganalisis berlebihan setiap kata dan tindakan pasangan.",
    type: "anxious",
  },
  {
    q: "Saya merasa sangat tergantung pada persetujuan orang yang saya cintai.",
    type: "anxious",
  },
  {
    q: "Saya sering merasa tidak aman dalam hubungan meskipun semuanya baik-baik saja.",
    type: "anxious",
  },
  {
    q: "Saya mudah merasa cemburu atau khawatir tentang kesetiaan pasangan.",
    type: "anxious",
  },

  // Avoidant (7 questions)
  {
    q: "Saya lebih suka menyelesaikan masalah sendiri daripada meminta bantuan.",
    type: "avoidant",
  },
  {
    q: "Saya merasa tidak nyaman jika seseorang terlalu bergantung pada saya.",
    type: "avoidant",
  },
  {
    q: "Saya menjaga jarak emosional ketika hubungan mulai terasa intens.",
    type: "avoidant",
  },
  {
    q: "Saya merasa terganggu jika hubungan mengurangi kebebasan pribadi saya.",
    type: "avoidant",
  },
  {
    q: "Saya sulit untuk membuka diri secara emosional kepada orang lain.",
    type: "avoidant",
  },
  {
    q: "Saya lebih nyaman dengan hubungan yang tidak terlalu serius atau mengikat.",
    type: "avoidant",
  },
  {
    q: "Saya cenderung menekan perasaan daripada mengekspresikannya secara terbuka.",
    type: "avoidant",
  },

  // Fearful-Avoidant (7 questions)
  {
    q: "Saya ingin dekat dengan orang lain, tapi takut disakiti jika terlalu dekat.",
    type: "fearful",
  },
  {
    q: "Saya kadang bingung antara menginginkan kedekatan atau menjauh.",
    type: "fearful",
  },
  {
    q: "Saya merasa sulit mempercayai orang lain meskipun saya menginginkan hubungan.",
    type: "fearful",
  },
  {
    q: "Saya merasa sering mengalami tarik-ulur dalam hubungan penting.",
    type: "fearful",
  },
  {
    q: "Saya takut ditolak, tetapi juga takut terlalu bergantung pada seseorang.",
    type: "fearful",
  },
  {
    q: "Saya memiliki harapan tinggi terhadap hubungan tapi sering kecewa.",
    type: "fearful",
  },
  {
    q: "Saya mudah merasa overwhelmed oleh emosi dalam hubungan yang dekat.",
    type: "fearful",
  },
];

/* UI elements */
const startBtn = document.getElementById("startBtn");
const navStartBtn = document.getElementById("navStartBtn");
const startSection = document.getElementById("quiz");
const questionArea = document.getElementById("questionArea");
const prog = document.getElementById("prog");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const restoreDraftBtn = document.getElementById("restoreDraft");
const inputName = document.getElementById("inputName");
const inputEmail = document.getElementById("inputEmail");
const resultSection = document.getElementById("result");
const resultSummary = document.getElementById("resultSummary");
const resultGrid = document.getElementById("resultGrid");
const saveStatus = document.getElementById("saveStatus");
const retakeBtn = document.getElementById("retakeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resultStyleImage = document.getElementById("resultStyleImage");
const resultStyleCaption = document.getElementById("resultStyleCaption");
const resultStyleFigure = document.getElementById("resultStyleFigure");

let answers = new Array(questions.length).fill(null);
let current = 0;
let chartInstance = null;
let shuffledQuestions = []; // Array untuk menyimpan urutan pertanyaan yang sudah diacak
let lastStyleImageDataUrl = null;

/* utilities */
function percentDone() {
  return Math.round(
    (answers.filter((x) => x !== null).length / questions.length) * 100
  );
}

/* Validation functions for required fields */
function validateName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  // Check if contains at least one letter (not just numbers or symbols)
  if (
    !/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F]/.test(
      trimmed
    )
  )
    return false;
  return true;
}

function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

function showValidationError(field, message) {
  // Remove existing error
  const existingError = field.parentNode.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }

  // Add error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "validation-error";
  errorDiv.style.color = "#dc2626";
  errorDiv.style.fontSize = "12px";
  errorDiv.style.marginTop = "4px";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);

  // Add error styling to field
  field.style.borderColor = "#dc2626";
  field.style.boxShadow = "0 0 0 1px #dc2626";
}

function clearValidationError(field) {
  // Remove existing error
  const existingError = field.parentNode.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }

  // Reset field styling
  field.style.borderColor = "";
  field.style.boxShadow = "";
}

/* Shuffle questions untuk randomisasi */
function shuffleQuestions() {
  shuffledQuestions = [...Array(questions.length).keys()]; // [0,1,2,3...29]
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [
      shuffledQuestions[j],
      shuffledQuestions[i],
    ];
  }
  console.log("Questions shuffled:", shuffledQuestions);
}

/* render question */
function renderQuestion(idx) {
  const questionIndex = shuffledQuestions[idx]; // Ambil index pertanyaan yang sudah diacak
  const q = questions[questionIndex];
  const total = questions.length;
  const donePercent = Math.round((idx / total) * 100);

  if (prog) {
    prog.style.width = `${donePercent}%`;
  }

  if (questionArea) {
    questionArea.innerHTML = `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>Soal ${idx + 1} / ${total}</strong></div>
          <div class="muted">${percentDone()}% terjawab</div>
        </div>
        <div class="question" style="margin-top:12px">${q.q}</div>
        <div class="muted" style="margin-bottom:10px">Pilih tingkat kesepakatan Anda (1 = Sangat Tidak Setuju ... 5 = Sangat Setuju)</div>
        <div class="options" id="opts">
          ${[1, 2, 3, 4, 5]
            .map((n) => `<div class="option" data-val="${n}">${n}</div>`)
            .join("")}
        </div>
      </div>
    `;

    const opts = questionArea.querySelectorAll(".option");
    opts.forEach((o) => {
      o.addEventListener("click", () => {
        opts.forEach((x) => x.classList.remove("selected"));
        o.classList.add("selected");
        answers[questionIndex] = parseInt(o.dataset.val); // Simpan jawaban sesuai index asli
      });
    });

    if (answers[questionIndex] !== null) {
      const pre = questionArea.querySelector(
        `.option[data-val="${answers[questionIndex]}"]`
      );
      if (pre) pre.classList.add("selected");
    }
  }

  if (prevBtn) {
    prevBtn.disabled = idx === 0;
  }
  if (nextBtn) {
    nextBtn.textContent =
      idx === questions.length - 1 ? "Selesai & Simpan" : "Berikutnya";
  }
}

function openQuiz() {
  if (inputName) {
    if (inputName.value && !validateName(inputName.value)) {
      showValidationError(
        inputName,
        "Nama wajib minimal 2 karakter dan mengandung huruf"
      );
    } else {
      clearValidationError(inputName);
    }
  }

  if (inputEmail) {
    if (inputEmail.value && !validateEmail(inputEmail.value)) {
      showValidationError(
        inputEmail,
        "Format email tidak benar (contoh: nama@domain.com)"
      );
    } else {
      clearValidationError(inputEmail);
    }
  }

  if (shuffledQuestions.length === 0) {
    shuffleQuestions();
  }

  current = 0;

  if (startSection) {
    startSection.style.display = "block";
    startSection.classList.add("active");
  }

  if (resultSection) {
    resultSection.style.display = "none";
    resultSection.classList.remove("active");
  }

  renderQuestion(current);

  if (startSection) {
    startSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Event listeners dengan null checks
if (startBtn) {
  startBtn.addEventListener("click", openQuiz);
}

if (navStartBtn) {
  navStartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openQuiz();
  });
}

document.querySelectorAll('a[href="#quiz"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openQuiz();
  });
});

// Add real-time validation for input fields
if (inputName) {
  inputName.addEventListener("input", function () {
    if (this.value.trim().length > 0) {
      if (validateName(this.value)) {
        clearValidationError(this);
      } else if (this.value.trim().length >= 2) {
        // Only show error if they've typed at least 2 characters
        showValidationError(this, "Nama harus mengandung minimal satu huruf");
      }
    } else {
      clearValidationError(this);
    }
  });

  inputName.addEventListener("blur", function () {
    if (this.value.trim().length > 0 && !validateName(this.value)) {
      showValidationError(
        this,
        "Nama wajib diisi (minimal 2 karakter dan mengandung huruf)"
      );
    }
  });
}

if (inputEmail) {
  inputEmail.addEventListener("input", function () {
    if (this.value.trim().length > 0) {
      if (validateEmail(this.value)) {
        clearValidationError(this);
      }
    } else {
      clearValidationError(this);
    }
  });

  inputEmail.addEventListener("blur", function () {
    if (this.value.trim().length > 0 && !validateEmail(this.value)) {
      showValidationError(
        this,
        "Format email tidak benar (contoh: nama@domain.com)"
      );
    }
  });
}

// prev/next dengan null checks
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (current > 0) {
      current--;
      renderQuestion(current);
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", async () => {
    // Check if current question is answered
    const currentQuestionIndex = shuffledQuestions[current];
    if (answers[currentQuestionIndex] === null) {
      await showAlert({
        title: "Jawaban Diperlukan",
        message: "Silakan pilih jawaban untuk melanjutkan.",
        icon: "🔔",
        okText: "OK",
      });
      return;
    }

    if (current < questions.length - 1) {
      current++;
      renderQuestion(current);
      return;
    }
    await finishAndSave();
  });
}

/* draft save/restore */
if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", () => {
    saveDraft();
    showToast("Draft disimpan ke browser (localStorage).", { type: "success" });
  });
}

if (restoreDraftBtn) {
  restoreDraftBtn.addEventListener("click", () => {
    if (restoreDraft()) {
      showToast("Draft dipulihkan.", { type: "info" });
      renderQuestion(current);
    } else {
      showToast("Tidak ada draft tersimpan.", { type: "warning" });
    }
  });
}

function saveDraft() {
  const payload = {
    answers,
    current,
    shuffledQuestions, // Simpan juga urutan yang sudah diacak
    name: inputName?.value || null,
    email: inputEmail?.value || null,
    ts: Date.now(),
  };
  localStorage.setItem("attachment_draft_v1", JSON.stringify(payload));
}

function restoreDraft() {
  const raw = localStorage.getItem("attachment_draft_v1");
  if (!raw) return false;
  try {
    const obj = JSON.parse(raw);
    if (Array.isArray(obj.answers) && obj.answers.length === questions.length) {
      answers = obj.answers;
      current = obj.current || 0;

      // Restore shuffled questions jika ada
      if (obj.shuffledQuestions && Array.isArray(obj.shuffledQuestions)) {
        shuffledQuestions = obj.shuffledQuestions;
      } else {
        shuffleQuestions(); // Generate new shuffle jika tidak ada
      }

      if (inputName) inputName.value = obj.name || "";
      if (inputEmail) inputEmail.value = obj.email || "";
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

/* compute scores by type */
function computeScores() {
  const sums = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    fearful: 0,
    counts: { secure: 0, anxious: 0, avoidant: 0, fearful: 0 },
  };
  questions.forEach((q, i) => {
    const v = answers[i] || 0;
    sums[q.type] += v;
    sums.counts[q.type] += 1;
  });
  const perc = {};
  ["secure", "anxious", "avoidant", "fearful"].forEach((t) => {
    const cnt = sums.counts[t] || 1;
    const min = cnt * 1;
    const max = cnt * 5;
    const raw = sums[t];
    const p = Math.round(((raw - min) / (max - min)) * 100);
    perc[t] = p;
  });
  const sorted = ["secure", "anxious", "avoidant", "fearful"].sort(
    (a, b) => perc[b] - perc[a]
  );
  const dominant = sorted[0];
  return { sums, perc, dominant };
}

/* Save to Firestore and show results - ENHANCED WITH VALIDATION */
async function finishAndSave() {
  console.log("=== Starting finishAndSave ===");

  // FINAL validation before saving - REQUIRED FIELDS CHECK
  let isValid = true;

  if (!validateName(inputName?.value)) {
    await showAlert({
      title: "Validasi Nama",
      message: "Nama wajib diisi dengan benar sebelum menyimpan hasil!",
      icon: "⚠️",
      okText: "Perbaiki",
    });
    isValid = false;
  }

  if (!validateEmail(inputEmail?.value)) {
    await showAlert({
      title: "Validasi Email",
      message:
        "Email wajib diisi dengan format yang benar sebelum menyimpan hasil!",
      icon: "⚠️",
      okText: "Perbaiki",
    });
    isValid = false;
  }

  if (!isValid) {
    // Scroll back to form fields
    if (inputName) {
      inputName.scrollIntoView({ behavior: "smooth" });
      inputName.focus();
    }
    return;
  }

  // Check if Firebase is initialized
  if (!app || !db) {
    if (saveStatus) {
      saveStatus.textContent =
        "❌ Error: Firebase tidak terinitializasi. Refresh halaman.";
      saveStatus.style.color = "#dc2626";
    }
    console.error("Firebase not initialized");
    return;
  }

  if (answers.some((a) => a === null)) {
    const ok = await showConfirm({
      title: "Sebagian Belum Terjawab",
      message:
        "Beberapa pertanyaan belum dijawab. Lanjutkan menyimpan jawaban yang sudah ada?",
      okText: "Lanjutkan",
      cancelText: "Kembali",
      icon: "❓",
    });
    if (!ok) return;
  }

  const computed = computeScores();
  console.log("Computed scores:", computed);

  // Create a simplified answer summary instead of detailed JSON
  const answerSummary = `Hasil tes attachment styles: ${capitalize(
    computed.dominant
  )} (${computed.perc[computed.dominant]}%)`;
  console.log("Answer summary:", answerSummary);

  // Show results first - FIXED: Proper section switching
  if (startSection) {
    startSection.style.display = "none";
    startSection.classList.remove("active");
  }

  if (resultSection) {
    resultSection.style.display = "block";
    resultSection.classList.add("active");
  }

  if (resultSummary) {
    resultSummary.innerHTML = `<div><strong>Nama:</strong> ${
      escape(inputName?.value) || "—"
    } &nbsp; <strong>Email:</strong> ${escape(inputEmail?.value) || "—"}</div>
      <div style="margin-top:8px;"><strong>Gaya Keterikatan Dominan:</strong> ${capitalize(
        computed.dominant
      )}</div>`;
  }

  if (resultGrid) {
    resultGrid.innerHTML = `
      <div class="result-card"><strong>Secure</strong><div class="muted" style="margin-top:6px">${computed.perc.secure}%</div></div>
      <div class="result-card"><strong>Anxious</strong><div class="muted" style="margin-top:6px">${computed.perc.anxious}%</div></div>
      <div class="result-card"><strong>Avoidant</strong><div class="muted" style="margin-top:6px">${computed.perc.avoidant}%</div></div>
      <div class="result-card"><strong>Fearful-Avoidant</strong><div class="muted" style="margin-top:6px">${computed.perc.fearful}%</div></div>
    `;
  }

  await renderResultStyle(computed.dominant);

  // Scroll to result section
  if (resultSection) {
    resultSection.scrollIntoView({ behavior: "smooth" });
  }

  renderChart(computed.perc);

  // Prepare data for Firestore - WITH REQUIRED FIELDS
  const dataToSave = {
    name: inputName.value.trim(), // Now guaranteed to be valid
    email: inputEmail.value.trim(), // Now guaranteed to be valid
    answer: answerSummary,
    score: computed.perc[computed.dominant],
    timestamp: window.firestoreUtils.serverTimestamp(),
  };

  console.log("Data to save:", dataToSave);
  console.log("Firebase app:", app);
  console.log("Firestore db:", db);

  // Save to Firestore with debugging
  try {
    if (saveStatus) {
      saveStatus.textContent = "Menyimpan hasil ke Firestore...";
      saveStatus.style.color = "#2563eb"; // Blue for loading
    }

    console.log("Attempting to save to collection 'results'...");

    // Test if we can access Firestore - gunakan nama collection yang sesuai dengan Firestore Anda
    const testCollection = window.firestoreUtils.collection(db, "results"); // Ganti "results" jika nama collection berbeda
    console.log("Collection reference:", testCollection);

    const docRef = await window.firestoreUtils.addDoc(
      testCollection,
      dataToSave
    );

    console.log("Document written with ID: ", docRef.id);
    if (saveStatus) {
      saveStatus.textContent = `✅ Hasil berhasil tersimpan! (ID: ${docRef.id})`;
      saveStatus.style.color = "#16a34a"; // Green color for success
    }

    // Clear the draft since we successfully saved
    localStorage.removeItem("attachment_draft_v1");
  } catch (err) {
    console.error("=== FIRESTORE ERROR DETAILS ===");
    console.error("Error object:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    if (saveStatus) {
      saveStatus.style.color = "#dc2626"; // Red color for error

      // More specific error messages
      if (err.code === "permission-denied") {
        saveStatus.textContent =
          "❌ Gagal: Akses ditolak. Periksa Firestore security rules.";
        console.error("PERMISSION DENIED - Check your Firestore rules!");
        console.error("Suggested rules for testing:");
        console.error(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /results/{document} {
      allow read, write: if true; // WARNING: Only for testing!
    }
  }
}`);
      } else if (err.code === "unavailable") {
        saveStatus.textContent =
          "❌ Gagal: Database tidak tersedia. Coba lagi nanti.";
      } else if (err.code === "failed-precondition") {
        saveStatus.textContent =
          "❌ Gagal: Prekondisi gagal. Periksa konfigurasi Firebase.";
      } else if (err.code === "unauthenticated") {
        saveStatus.textContent =
          "❌ Gagal: Tidak terautentikasi. Periksa Firebase Auth.";
      } else if (err.message.includes("fetch")) {
        saveStatus.textContent =
          "❌ Gagal: Masalah koneksi internet. Coba lagi.";
      } else {
        saveStatus.textContent = `❌ Gagal menyimpan: ${err.message}`;
      }
    }

    // Show error details in console for debugging
    console.error("=== DEBUGGING INFO ===");
    console.error("Project ID:", firebaseConfig.projectId);
    console.error("App:", app);
    console.error("Database:", db);
  }
}

/* chart */
function renderChart(perc) {
  const chartCanvas = document.getElementById("resultChart");
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Secure", "Anxious", "Avoidant", "Fearful-Avoidant"],
      datasets: [
        {
          label: "Persentase (%)",
          data: [perc.secure, perc.anxious, perc.avoidant, perc.fearful],
          backgroundColor: ["#16a34a", "#f97316", "#2563eb", "#7c3aed"],
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  });
}

function getStyleMeta(style) {
  switch (style) {
    case "secure":
      return { title: "Secure", emoji: "💚", colors: ["#27ae60", "#58d68d"] };
    case "anxious":
      return { title: "Anxious", emoji: "😰", colors: ["#e74c3c", "#f1948a"] };
    case "avoidant":
      return { title: "Avoidant", emoji: "🛡️", colors: ["#3498db", "#85c1e9"] };
    case "fearful":
      return {
        title: "Fearful‑Avoidant",
        emoji: "💔",
        colors: ["#f39c12", "#fdeaa7"],
      };
    default:
      return { title: "Unknown", emoji: "🧩", colors: ["#667eea", "#764ba2"] };
  }
}

function generateStyleImageDataUrl(style) {
  const { title, emoji, colors } = getStyleMeta(style);
  const w = 1040,
    h = 440;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // emoji
  ctx.font =
    "120px Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111827";
  ctx.fillText(emoji, 76, h / 2 - 6);

  // judul
  ctx.font = "bold 42px Segoe UI, Roboto, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Gaya Keterikatan: ${title}`, 220, h / 2 - 26);

  // subteks
  ctx.font = "24px Segoe UI, Roboto, sans-serif";
  ctx.fillStyle = "#f8fafc";
  const descMap = {
    secure: "Nyaman dengan keintiman dan kemandirian.",
    anxious: "Mencari kepastian, cemas soal kedekatan.",
    avoidant: "Menjaga jarak emosional, sangat mandiri.",
    fearful: "Ingin dekat tapi takut terluka; tarik‑ulur.",
  };
  const key = style === "fearful" ? "fearful" : style;
  ctx.fillText(descMap[key] || "", 220, h / 2 + 22);

  return canvas.toDataURL("image/png");
}

function getStyleFigureHTML(style) {
  switch (style) {
    case "secure":
      return `
<div class="image-placeholder secure-bg">
  <div class="secure-illustration">
    <div class="couple-figures">
      <div class="figure figure-1">
        <div class="head"></div>
        <div class="body"></div>
      </div>
      <div class="figure figure-2">
        <div class="head"></div>
        <div class="body"></div>
      </div>
      <div class="connection-heart">💚</div>
    </div>
    <div class="trust-symbols">
      <div class="symbol trust-1">🤝</div>
      <div class="symbol trust-2">💬</div>
      <div class="symbol trust-3">🌟</div>
    </div>
  </div>
</div>`;
    case "anxious":
      return `
<div class="image-placeholder anxious-bg">
  <div class="anxious-illustration">
    <div class="worried-figure">
      <div class="head anxious-head">
        <div class="worried-eyes">😰</div>
      </div>
      <div class="body anxious-body"></div>
      <div class="thought-cloud">
        <div class="cloud-shape"></div>
        <div class="worry-text">?</div>
      </div>
    </div>
    <div class="distance-figure">
      <div class="head distant-head"></div>
      <div class="body distant-body"></div>
    </div>
    <div class="reaching-hand">👋</div>
    <div class="anxiety-waves">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
  </div>
</div>`;
    case "avoidant":
      return `
<div class="image-placeholder avoidant-bg">
  <div class="avoidant-illustration">
    <div class="isolated-figure">
      <div class="head avoidant-head"></div>
      <div class="body avoidant-body"></div>
      <div class="protective-barrier"></div>
    </div>
    <div class="approaching-figure">
      <div class="head approaching-head"></div>
      <div class="body approaching-body"></div>
    </div>
    <div class="distance-indicators">
      <div class="distance-line"></div>
      <div class="distance-line"></div>
      <div class="distance-line"></div>
    </div>
    <div class="independence-symbols">
      <div class="mountain">🏔️</div>
      <div class="shield">🛡️</div>
    </div>
  </div>
</div>`;
    case "fearful":
      return `
<div class="image-placeholder fearful-bg">
  <div class="fearful-illustration">
    <div class="conflicted-figure">
      <div class="head fearful-head">
        <div class="conflicted-expression">😕</div>
      </div>
      <div class="body fearful-body"></div>
      <div class="torn-heart">💔</div>
    </div>
    <div class="partner-figure">
      <div class="head partner-head"></div>
      <div class="body partner-body"></div>
    </div>
    <div class="push-pull-arrows">
      <div class="arrow approach">→</div>
      <div class="arrow retreat">←</div>
    </div>
    <div class="emotional-waves">
      <div class="wave-pattern">≋</div>
      <div class="wave-pattern">≋</div>
      <div class="wave-pattern">≋</div>
    </div>
    <div class="balance-scale">⚖️</div>
  </div>
</div>`;
    default:
      return `<div class="image-placeholder"></div>`;
  }
}

async function renderResultStyle(style) {
  if (!resultStyleFigure) return;
  resultStyleFigure.innerHTML = getStyleFigureHTML(style);

  // set caption
  if (resultStyleCaption) {
    resultStyleCaption.textContent = `Ilustrasi: ${capitalize(style)}`;
  }

  // tunggu frame agar layout & animasi terpasang, lalu snapshot dengan html2canvas
  const placeholder =
    resultStyleFigure.querySelector(".image-placeholder") || resultStyleFigure;
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r))
  );
  if (window.html2canvas && placeholder) {
    const canvas = await window.html2canvas(placeholder, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    lastStyleImageDataUrl = canvas.toDataURL("image/png");
  }
}

/* download pdf using jsPDF */
if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    if (!chartInstance) {
      await showAlert({
        title: "Chart Tidak Tersedia",
        message: "Grafik belum siap ditampilkan.",
        icon: "📊",
        okText: "OK",
      });
      return;
    }

    const chartURL = chartInstance.toBase64Image();
    const { jsPDF } = window.jspdf;

    // Setup dokumen PDF dengan font yang lebih profesional
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Helper function untuk memastikan ruang halaman
    const ensureSpace = (needed = 60, addHeader = false) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
        if (addHeader) {
          addPageHeader();
          y += 30;
        }
      }
    };

    // Helper function untuk header halaman
    const addPageHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("LAPORAN PSIKOLOGI - ATTACHMENT STYLE ASSESSMENT", margin, 30);
      doc.line(margin, 35, pageWidth - margin, 35);
    };

    // Helper function untuk menambah garis pemisah
    const addSeparator = () => {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;
    };

    // HEADER UTAMA LAPORAN
    doc.setFillColor(41, 98, 255);
    doc.rect(0, 0, pageWidth, 100, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("LAPORAN PSIKOLOGI", margin, 45);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Attachment Style Psychological Assessment", margin, 70);

    y = 130;

    // INFORMASI KLIEN
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 80, "F");
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, y, contentWidth, 80);

    y += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INFORMASI KLIEN", margin + 15, y);

    y += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const clientInfo = [
      [`Nama`, inputName?.value || "—"],
      [`Email`, inputEmail?.value || "—"],
      [
        `Tanggal Tes`,
        new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ],
      [`Waktu Tes`, new Date().toLocaleTimeString("id-ID")],
    ];

    clientInfo.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin + 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 120, y);
      y += 15;
    });

    y += 30;

    // HASIL UTAMA ASSESSMENT
    ensureSpace(120);

    const computed = computeScores();
    const dominantStyle = computed.dominant;
    const dominantScore = computed.perc[dominantStyle];

    doc.setFillColor(16, 185, 129);
    doc.rect(margin, y, contentWidth, 100, "F");
    doc.setDrawColor(5, 150, 105);
    doc.rect(margin, y, contentWidth, 100);

    y += 25;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("HASIL UTAMA ASSESSMENT", margin + 15, y);

    y += 30;
    doc.setFontSize(14);
    const styleLabels = {
      secure: "SECURE ATTACHMENT",
      anxious: "ANXIOUS ATTACHMENT",
      avoidant: "AVOIDANT ATTACHMENT",
      fearful: "FEARFUL-AVOIDANT ATTACHMENT",
    };

    doc.text(
      `Gaya Keterikatan Dominan: ${styleLabels[dominantStyle]}`,
      margin + 15,
      y
    );
    y += 20;
    doc.setFontSize(20);
    doc.text(`Skor: ${dominantScore}%`, margin + 15, y);

    y += 50;

    // INTERPRETASI KLINIS
    ensureSpace(150, true);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("I. INTERPRETASI KLINIS", margin, y);
    y += 25;

    addSeparator();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);

    const interpretations = {
      secure:
        "Individu menunjukkan pola keterikatan yang sehat dengan kemampuan membentuk hubungan yang stabil dan saling percaya. Mampu menyeimbangkan kebutuhan akan kedekatan dengan kemandirian pribadi. Menunjukkan regulasi emosi yang baik dan komunikasi yang efektif dalam hubungan interpersonal.",

      anxious:
        "Individu menunjukkan pola keterikatan yang ditandai dengan kebutuhan tinggi akan kepastian dan validasi dari orang lain. Cenderung mengalami kecemasan terkait stabilitas hubungan dan memiliki sensitivitas tinggi terhadap tanda-tanda penolakan atau jarak emosional dari pasangan.",

      avoidant:
        "Individu menunjukkan pola keterikatan yang menekankan kemandirian dan cenderung menjaga jarak emosional. Merasa nyaman dengan self-reliance namun mungkin mengalami kesulitan dalam ekspresi emosi dan keintiman. Cenderung menekan kebutuhan akan dukungan emosional.",

      fearful:
        "Individu menunjukkan pola keterikatan ambivalen dengan konflik internal antara keinginan akan kedekatan dan ketakutan akan penolakan. Mengalami kesulitan dalam membangun kepercayaan dan konsistensi dalam hubungan, sering menunjukkan pola approach-avoidance dalam interaksi interpersonal.",
    };

    const interpretationText = interpretations[dominantStyle] || "";
    const interpretationLines = doc.splitTextToSize(
      interpretationText,
      contentWidth - 20
    );
    doc.text(interpretationLines, margin + 10, y);
    y += interpretationLines.length * 14 + 20;

    // PROFIL ATTACHMENT LENGKAP
    ensureSpace(200, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("II. PROFIL ATTACHMENT LENGKAP", margin, y);
    y += 25;

    addSeparator();

    // Tabel skor
    const tableData = [
      [
        "Secure Attachment",
        `${computed.perc.secure}%`,
        getInterpretationLevel(computed.perc.secure),
      ],
      [
        "Anxious Attachment",
        `${computed.perc.anxious}%`,
        getInterpretationLevel(computed.perc.anxious),
      ],
      [
        "Avoidant Attachment",
        `${computed.perc.avoidant}%`,
        getInterpretationLevel(computed.perc.avoidant),
      ],
      [
        "Fearful-Avoidant Attachment",
        `${computed.perc.fearful}%`,
        getInterpretationLevel(computed.perc.fearful),
      ],
    ];

    // Header tabel
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 25, "F");
    doc.setDrawColor(209, 213, 219);
    doc.rect(margin, y, contentWidth, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("DIMENSI ATTACHMENT", margin + 10, y + 16);
    doc.text("SKOR", margin + 280, y + 16);
    doc.text("INTERPRETASI", margin + 350, y + 16);

    y += 25;

    // Isi tabel
    tableData.forEach((row, index) => {
      const rowHeight = 30;

      // Warna baris bergantian
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y, contentWidth, rowHeight, "F");
      }

      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, y, contentWidth, rowHeight);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);

      doc.text(row[0], margin + 10, y + 18);

      doc.setFont("helvetica", "bold");
      doc.text(row[1], margin + 290, y + 18);

      doc.setFont("helvetica", "normal");
      doc.text(row[2], margin + 360, y + 18);

      y += rowHeight;
    });

    y += 20;

    // GRAFIK VISUAL
    ensureSpace(280, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("III. REPRESENTASI VISUAL", margin, y);
    y += 25;

    addSeparator();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Grafik berikut menunjukkan distribusi skor pada keempat dimensi attachment style:",
      margin,
      y
    );
    y += 25;

    // Masukkan chart
    doc.addImage(chartURL, "PNG", margin, y, contentWidth, 200);
    y += 220;

    // REKOMENDASI KLINIS - Halaman baru
    doc.addPage();
    addPageHeader();
    y = margin + 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("IV. REKOMENDASI KLINIS", margin, y);
    y += 25;

    addSeparator();

    // Area untuk perbaikan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("A. AREA PENGEMBANGAN:", margin, y);
    y += 20;

    const developmentAreas = getDevelopmentAreas(dominantStyle);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    developmentAreas.forEach((area, index) => {
      ensureSpace(35, true);
      doc.circle(margin + 8, y - 2, 1.5, "F");
      const areaLines = doc.splitTextToSize(area, contentWidth - 30);
      doc.text(areaLines, margin + 20, y);
      y += areaLines.length * 12 + 8;
    });

    y += 15;

    // Strategi intervensi
    ensureSpace(40, true);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("B. STRATEGI INTERVENSI:", margin, y);
    y += 20;

    const interventionStrategies = getInterventionStrategies(dominantStyle);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    interventionStrategies.forEach((strategy, index) => {
      ensureSpace(35, true);
      doc.text(`${index + 1}.`, margin + 5, y);
      const strategyLines = doc.splitTextToSize(strategy, contentWidth - 30);
      doc.text(strategyLines, margin + 20, y);
      y += strategyLines.length * 12 + 8;
    });

    y += 20;

    // KESIMPULAN
    ensureSpace(100, true);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("V. KESIMPULAN", margin, y);
    y += 25;

    addSeparator();

    const conclusion = generateProfessionalConclusion(
      dominantStyle,
      dominantScore
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    const conclusionLines = doc.splitTextToSize(conclusion, contentWidth);
    doc.text(conclusionLines, margin, y);
    y += conclusionLines.length * 14 + 30;

    // PENUTUP PROFESIONAL
    ensureSpace(80, true);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "* Laporan ini dibuat berdasarkan Attachment Style Assessment dan dimaksudkan untuk tujuan",
      margin,
      y
    );
    y += 12;
    doc.text(
      "  pemahaman diri. Untuk interpretasi klinis lebih mendalam, disarankan konsultasi dengan",
      margin,
      y
    );
    y += 12;
    doc.text("  psikolog atau konselor profesional.", margin, y);

    // Footer dengan tanggal dan ID
    y = pageHeight - 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated on: ${new Date().toLocaleString("id-ID")}`, margin, y);
    doc.text(
      `Report ID: ATT-${Date.now().toString().slice(-8)}`,
      pageWidth - margin - 100,
      y
    );

    // Simpan PDF
    const fileName = `Attachment_Report_${(
      inputName?.value || "Anonymous"
    ).replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  });
}

// Helper functions untuk konten profesional
function getInterpretationLevel(score) {
  if (score >= 70) return "Tinggi";
  if (score >= 50) return "Sedang";
  if (score >= 30) return "Rendah";
  return "Sangat Rendah";
}

function getDevelopmentAreas(dominantStyle) {
  const areas = {
    secure: [
      "Mempertahankan keseimbangan yang sudah baik antara kemandirian dan kedekatan",
      "Mengembangkan kemampuan membantu orang lain dengan attachment style yang berbeda",
      "Meningkatkan kesadaran akan dinamika hubungan dalam konteks yang lebih luas",
    ],
    anxious: [
      "Mengembangkan self-soothing techniques untuk mengelola kecemasan attachment",
      "Membangun kepercayaan diri dan self-worth yang tidak bergantung pada validasi eksternal",
      "Melatih toleransi terhadap ketidakpastian dalam hubungan interpersonal",
      "Mengembangkan kemampuan komunikasi assertive yang tidak demanding",
    ],
    avoidant: [
      "Mengembangkan comfort dengan emotional vulnerability dan ekspresi emosi",
      "Melatih kemampuan untuk meminta dan menerima dukungan emosional",
      "Membangun toleransi terhadap keintiman dan kedekatan emosional",
      "Mengembangkan awareness terhadap kebutuhan attachment yang ditekan",
    ],
    fearful: [
      "Membangun konsistensi dalam pola attachment dan mengurangi ambivalensi",
      "Mengembangkan self-regulation skills untuk mengelola emotional dysregulation",
      "Membangun kepercayaan secara bertahap dalam hubungan yang aman",
      "Mengelola trauma attachment masa lalu yang mungkin memengaruhi pola saat ini",
    ],
  };

  return areas[dominantStyle] || areas.secure;
}

function getInterventionStrategies(dominantStyle) {
  const strategies = {
    secure: [
      "Praktik mindfulness untuk mempertahankan emotional regulation yang baik",
      "Engagement dalam peer support atau mentoring untuk berbagi pengalaman positif",
      "Kontinuitas dalam membangun dan mempertahankan hubungan yang sehat",
    ],
    anxious: [
      "Cognitive Behavioral Therapy (CBT) untuk mengatasi anxious thoughts dan catastrophizing",
      "Mindfulness-based interventions untuk meningkatkan present-moment awareness",
      "Gradual exposure therapy untuk membangun toleransi terhadap uncertainty",
      "Self-compassion practices untuk mengurangi self-criticism",
      "Journaling untuk tracking emotional patterns dan triggers",
    ],
    avoidant: [
      "Emotionally Focused Therapy (EFT) untuk mengembangkan emotional awareness",
      "Gradual exposure to vulnerability dalam safe therapeutic relationship",
      "Attachment-based therapy untuk mengeksplorasi early attachment experiences",
      "Somatic approaches untuk meningkatkan body awareness dan emotional attunement",
      "Communication skills training untuk ekspression of needs dan emotions",
    ],
    fearful: [
      "Trauma-informed therapy untuk mengeksploras past attachment injuries",
      "Dialectical Behavior Therapy (DBT) skills untuk emotional regulation",
      "Internal Family Systems (IFS) therapy untuk integrasi conflicting internal parts",
      "EMDR therapy jika ada trauma attachment yang signifikan",
      "Consistent therapeutic relationship untuk membangun secure base",
    ],
  };

  return strategies[dominantStyle] || strategies.secure;
}

function generateProfessionalConclusion(dominantStyle, score) {
  const conclusions = {
    secure: `Berdasarkan hasil assessment, individu menunjukkan pola attachment yang secure dengan skor ${score}%. Ini mengindikasikan kemampuan yang baik dalam membangun dan mempertahankan hubungan interpersonal yang sehat. Individu menunjukkan keseimbangan yang optimal antara kemandirian dan kemampuan untuk bergantung pada orang lain ketika diperlukan. Prognosis untuk kesejahteraan relasional sangat baik, dengan rekomendasi untuk mempertahankan pola yang sudah adaptif.`,

    anxious: `Hasil assessment menunjukkan dominasi anxious attachment style dengan skor ${score}%. Individu mengalami elevated anxiety terkait stabilitas dan ketersediaan figur attachment. Pola ini dapat memengaruhi kualitas hubungan interpersonal dan kesejahteraan emosional. Intervensi terapeutik yang fokus pada anxiety management, self-regulation, dan building secure internal working models sangat direkomendasikan untuk meningkatkan attachment security.`,

    avoidant: `Assessment mengidentifikasi avoidant attachment sebagai pola dominan dengan skor ${score}%. Individu menunjukkan kecenderungan untuk maintain emotional distance dan mengandalkan self-sufficiency sebagai protective mechanism. Meskipun pola ini memiliki adaptive value dalam beberapa konteks, dapat membatasi kedalaman hubungan interpersonal. Therapeutic work yang fokus pada emotional accessibility dan vulnerability tolerance akan beneficial.`,

    fearful: `Hasil assessment menunjukkan fearful-avoidant attachment pattern dengan skor ${score}%. Individu mengalami internal conflict antara kebutuhan akan closeness dan fear of rejection/hurt. Pola ini often stems dari inconsistent atau traumatic early attachment experiences. Approach terapeutik yang comprehensive, including trauma processing dan attachment repair work, sangat direkomendasikan untuk membangun internal sense of security.`,
  };

  return conclusions[dominantStyle] || conclusions.secure;
}

/* interpretations text */
function generateInterpretations(computed) {
  const out = [];
  out.push(
    `Dominan: ${capitalize(
      computed.dominant
    )} — berarti hasil tes menunjukkan kecenderungan terbesar pada gaya tersebut.`
  );
  out.push(
    `Secure (${computed.perc.secure}%): Orang dengan skor tinggi pada Secure umumnya nyaman dengan keintiman, dapat bertumpu pada orang lain, dan menjaga kemandirian.`
  );
  out.push(
    `Anxious (${computed.perc.anxious}%): Skor tinggi pada Anxious menunjukkan kecenderungan membutuhkan kepastian, mudah cemas tentang hubungan, dan mencari konfirmasi emosional.`
  );
  out.push(
    `Avoidant (${computed.perc.avoidant}%): Skor tinggi pada Avoidant menunjukkan preferensi menjaga jarak emosional, mandiri, dan sulit membuka diri secara emosional.`
  );
  out.push(
    `Fearful-Avoidant (${computed.perc.fearful}%): Skor tinggi pada Fearful-Avoidant adalah campuran — ingin kedekatan namun takut terluka, sering mengalami tarik-ulur.`
  );
  out.push(
    `Saran singkat: Perhatikan pola reaksi Anda dalam hubungan; jika ingin mengubah gaya, pertimbangkan praktik kecil seperti berlatih kerentanan bertahap, komunikasi asertif, dan jika perlu mencari dukungan terapis.`
  );
  return out;
}

/* helper */
function labelFromValue(v) {
  switch (v) {
    case 1:
      return "Sangat Tidak Setuju";
    case 2:
      return "Tidak Setuju";
    case 3:
      return "Netral";
    case 4:
      return "Setuju";
    case 5:
      return "Sangat Setuju";
    default:
      return null;
  }
}

function escape(s) {
  if (!s) return "";
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* retake */
if (retakeBtn) {
  retakeBtn.addEventListener("click", () => {
    answers = new Array(questions.length).fill(null);
    current = 0;
    shuffledQuestions = []; // Reset shuffle
    if (inputName) {
      inputName.value = "";
      clearValidationError(inputName);
    }
    if (inputEmail) {
      inputEmail.value = "";
      clearValidationError(inputEmail);
    }
    if (saveStatus) {
      saveStatus.textContent = "";
      saveStatus.style.color = ""; // Reset color
    }

    // Proper section switching
    if (resultSection) {
      resultSection.style.display = "none";
      resultSection.classList.remove("active");
    }
    if (startSection) {
      startSection.style.display = "block";
      startSection.classList.add("active");
    }

    // Initialize and render first question
    shuffleQuestions();
    renderQuestion(0);

    // Scroll to quiz
    if (startSection) {
      startSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* Initialize on page load */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize shuffle and render first question
  if (shuffledQuestions.length === 0) {
    shuffleQuestions();
  }
  renderQuestion(0);

  // Try to restore draft
  try {
    restoreDraft();
    if (current > 0) {
      renderQuestion(current);
    }
  } catch (e) {
    console.log("No draft to restore or error restoring:", e);
  }
});

/* keyboard quick select 1-5 */
document.addEventListener("keydown", (e) => {
  if (startSection?.style.display === "block") {
    if (["1", "2", "3", "4", "5"].includes(e.key)) {
      const currentQuestionIndex = shuffledQuestions[current];
      answers[currentQuestionIndex] = parseInt(e.key);
      renderQuestion(current);
    } else if (e.key === "ArrowRight" && nextBtn) {
      nextBtn.click();
    } else if (e.key === "ArrowLeft" && prevBtn) {
      prevBtn.click();
    }
  }
});

/* Smooth scrolling untuk anchor lain */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#quiz") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* Reveal observer: tambahkan kedua kelas (in & active) */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in", "active");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

// Warna & ikon konsisten dengan chart
const STYLE_META_PDF = {
  secure: { label: "Secure", color: "#16a34a", icon: "💚" },
  anxious: { label: "Anxious", color: "#f97316", icon: "😰" },
  avoidant: { label: "Avoidant", color: "#2563eb", icon: "🛡️" },
  fearful: { label: "Fearful‑Avoidant", color: "#7c3aed", icon: "💔" },
};

function getShortMeaning(style) {
  switch (style) {
    case "secure":
      return "Nyaman dengan keintiman dan kemandirian; mampu membangun kepercayaan dan komunikasi terbuka.";
    case "anxious":
      return "Mudah cemas soal hubungan; cenderung mencari kepastian dan validasi emosional.";
    case "avoidant":
      return "Menjaga jarak emosional; sangat menghargai kemandirian dan kurang nyaman membuka diri.";
    case "fearful":
      return "Mengalami tarik‑ulur: ingin dekat namun takut terluka; kepercayaan dan konsistensi menjadi tantangan.";
    default:
      return "";
  }
}

function getStyleDescriptions() {
  return {
    secure:
      "Individu dengan gaya Secure cenderung merasa aman dalam keintiman sekaligus mandiri. Mereka nyaman mengekspresikan kebutuhan dan mampu membangun kepercayaan dua arah. Konflik biasanya dihadapi secara terbuka dan solutif.",
    anxious:
      "Pada gaya Anxious, perhatian besar diberikan pada penerimaan dan kepastian dari pasangan. Kekhawatiran akan penolakan membuat sensitivitas emosi meningkat. Regulasi emosi dan komunikasi asertif sangat membantu stabilitas hubungan.",
    avoidant:
      "Gaya Avoidant ditandai preferensi menjaga jarak emosional dan mengandalkan diri. Kedekatan intens dapat menimbulkan rasa tidak nyaman. Membangun toleransi pada kelekatan dan latihan kerentanan bertahap dapat menyeimbangkan kebutuhan kemandirian.",
    fearful:
      "Gaya Fearful‑Avoidant menghadirkan ambivalensi: kebutuhan akan kedekatan bertemu kekhawatiran tersakiti. Dinamika ini dapat memunculkan pola tarik‑ulur. Kejelasan batasan, keamanan emosional, dan ritme komunikasi yang konsisten berperan penting.",
  };
}

function getActionTips(dominant) {
  // 4 tips kontekstual, netral, aplikatif
  const umum = [
    "Luangkan 10–15 menit tiap hari untuk self‑reflection: catat pemicu emosi dan respons yang muncul.",
    'Latih komunikasi asertif: ungkapkan kebutuhan dengan I‑Statement (contoh: "Saya merasa…, saya butuh…").',
    "Praktik mindfulness sederhana 5–10 menit (napas diafragma atau body scan) untuk menurunkan reaktivitas.",
    "Bangun rutinitas 'check‑in' mingguan dengan pasangan/teman dekat untuk menyelaraskan harapan.",
  ];
  const khusus = {
    secure: [
      "Pertahankan keseimbangan kedekatan–kemandirian; jaga konsistensi suportif saat konflik.",
    ],
    anxious: [
      "Tunda impuls mencari kepastian cepat; gunakan 'delay 10 menit' sebelum mengirim pesan emosional.",
    ],
    avoidant: [
      "Uji 'kerentanan mikro': bagikan 1 hal personal kecil tiap minggu kepada orang tepercaya.",
    ],
    fearful: [
      "Tetapkan batasan jelas dan ritme komunikasi yang disepakati; evaluasi bersama tiap 1–2 minggu.",
    ],
  };
  return [...(khusus[dominant] || []), ...umum].slice(0, 5);
}

(function () {
  const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let buffer = [];

  function makeConfetti(count = 80) {
    const emojis = ["🎉", "✨", "🎊", "💫", "🌟", "🧡", "💚", "💙", "💜", "🧠"];
    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.className = "confetti";
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = Math.random() * 100 + "vw";
      span.style.fontSize = 14 + Math.random() * 16 + "px";
      span.style.animationDelay = Math.random() * 0.8 + "s";
      span.style.setProperty("--rx", Math.random() * 720 - 360 + "deg");
      span.style.setProperty("--ry", Math.random() * 720 - 360 + "deg");
      document.body.appendChild(span);
      setTimeout(() => span.remove(), 4000);
    }
  }

  function triggerEasterEgg() {
    if (sessionStorage.getItem("ee_unlocked")) return;
    sessionStorage.setItem("ee_unlocked", "1");
    try {
      showToast("Easter Egg: Mode Santai aktif 🎉", { type: "success" });
    } catch {}
    try {
      showAlert({
        title: "🎉 Surprise!",
        message:
          "Kamu menemukan Easter Egg. Tetap semangat eksplorasi yang sehat ya! ✨",
        icon: "🥚",
        okText: "Nice!",
      });
    } catch {}
    document.body.classList.add("ee");
    makeConfetti(90);
    setTimeout(() => document.body.classList.remove("ee"), 6000);
  }

  // Konami detector
  document.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    buffer.push(k);
    if (buffer.length > KONAMI.length) buffer.shift();
    if (buffer.join(",") === KONAMI.join(",")) {
      triggerEasterEgg();
      buffer = [];
    }
  });

  // Shortcut manual untuk tes: panggil di console -> window.ee()
  window.ee = triggerEasterEgg;

  // Trigger easter egg via triple‑click pada judul hero (lebih robust)
  (function () {
    let clicks = 0,
      timer;
    document.addEventListener(
      "pointerup",
      (e) => {
        const h1 = e.target.closest("#hero h1");
        if (!h1) return;
        clicks++;
        clearTimeout(timer);
        if (clicks >= 3) {
          try {
            (window.ee || function () {})();
          } catch {}
          clicks = 0;
          return;
        }
        // window klik diperpanjang agar lebih mudah (900ms)
        timer = setTimeout(() => (clicks = 0), 900);
      },
      true
    );
  })();
})();
