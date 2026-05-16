// ===============================
// 🚀 CTA
// ===============================
function ctaClick() {
  alert("Welcome to BlueBottleCap 🚀");
}

// ===============================
// 🧩 TOOL MODAL CONTROL
// ===============================
function openTool(type) {
  document.getElementById("toolModal").style.display = "flex";

  document.querySelectorAll(".tool").forEach(t => {
    t.style.display = "none";
  });

  if (type === "notes") document.getElementById("notesTool").style.display = "block";
  if (type === "todo") document.getElementById("todoTool").style.display = "block";
  if (type === "calc") document.getElementById("calcTool").style.display = "block";
}

function closeTool() {
  document.getElementById("toolModal").style.display = "none";
}

// ===============================
// 🧠 🔥 SMART AI-LIKE SUMMARIZER
// ===============================
function summarize() {
  const input = document.getElementById("notesInput").value;
  const outputDiv = document.getElementById("notesOutput");

  if (!input) {
    outputDiv.innerHTML = "⚠️ Enter text!";
    return;
  }

  outputDiv.innerHTML = "⚡ Generating AI-level notes...";

  setTimeout(() => {

    // 🔹 Step 1: Clean text
    let sentences = input
      .replace(/\n/g, " ")
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 25);

    // 🔹 Step 2: Stopwords
    const stopwords = [
      "the","is","in","at","of","a","and","to","it","was","for",
      "on","that","with","as","by","an","this","which","are"
    ];

    // 🔹 Step 3: Word frequency
    let freq = {};
    sentences.forEach(s => {
      s.toLowerCase().split(/\W+/).forEach(w => {
        if (!stopwords.includes(w) && w.length > 3) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
    });

    // 🔹 Step 4: Score sentences
    let scored = sentences.map(s => {
      let score = 0;

      s.toLowerCase().split(/\W+/).forEach(w => {
        if (freq[w]) score += freq[w];
      });

      if (s.includes("because") || s.includes("therefore")) score += 3;
      if (s.length > 80) score += 2;

      return { text: s, score };
    });

    // 🔹 Step 5: Sort
    scored.sort((a, b) => b.score - a.score);

    // 🔹 Step 6: Remove duplicates
    let selected = [];
    let seen = new Set();

    for (let s of scored) {
      let key = s.text.split(" ").slice(0, 6).join(" ");
      if (!seen.has(key)) {
        selected.push(s.text);
        seen.add(key);
      }
      if (selected.length >= 6) break;
    }

    // 🔹 Step 7: Sections
    let overview = sentences[0] || "";

    let keyPoints = selected.slice(0, 4);

    let concepts = selected.slice(4, 6).map(s =>
      "This highlights that " + s.charAt(0).toLowerCase() + s.slice(1)
    );

    let revision = keyPoints.map(s =>
      s.split(" ").slice(0, 6).join(" ") + "..."
    );

    // 🔹 Step 8: Build UI (ChatGPT style)
    let html = `<div class="ai-output">`;

    if (overview) {
      html += `
        <h3>📌 Topic Overview</h3>
        <p>${overview}</p>
      `;
    }

    if (keyPoints.length) {
      html += `<h3>🔑 Key Points</h3><ul>`;
      keyPoints.forEach(p => {
        html += `<li>${p}</li>`;
      });
      html += `</ul>`;
    }

    if (concepts.length) {
      html += `<h3>⚡ Important Concepts</h3><ul>`;
      concepts.forEach(c => {
        html += `<li>${c}</li>`;
      });
      html += `</ul>`;
    }

    if (revision.length) {
      html += `<h3>🧠 Quick Revision</h3><ul>`;
      revision.forEach(r => {
        html += `<li>${r}</li>`;
      });
      html += `</ul>`;
    }

    html += `</div>`;

    outputDiv.innerHTML = html;

  }, 600);
}

// ===============================
// 📋 COPY
// ===============================
function copyText() {
  const text = document.getElementById("notesOutput").innerText;

  if (!text) {
    alert("Nothing to copy!");
    return;
  }

  navigator.clipboard.writeText(text);
  alert("Copied ✅");
}

// ===============================
// 📄 PDF DOWNLOAD (UI SAME AS SCREEN)
// ===============================
async function downloadPDF() {
  const element = document.getElementById("notesOutput");

  if (!element.innerText) {
    alert("Nothing to download!");
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("BlueBottleCap_Notes.pdf");
}

// ===============================
// ✅ TODO LIST
// ===============================
function addTask() {
  let task = document.getElementById("taskInput").value;

  if (!task) return;

  let li = document.createElement("li");
  li.innerText = "✔ " + task;

  document.getElementById("taskList").appendChild(li);
  document.getElementById("taskInput").value = "";
}

// ===============================
// 🧮 SAFE CALCULATOR
// ===============================
function calculate() {
  let input = document.getElementById("calcInput").value;

  try {
    if (!/^[0-9+\-*/(). ]+$/.test(input)) throw "Invalid";
    document.getElementById("calcOutput").innerText = eval(input);
  } catch {
    document.getElementById("calcOutput").innerText = "Invalid";
  }
}