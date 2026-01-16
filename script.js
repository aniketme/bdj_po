// ===============================
// BDJ PO CREATOR - FINAL SCRIPT
// ===============================

function formatINR(number) {
  return Number(number).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("poDate").valueAsDate = new Date();
  addRow();
});

// Add first row on load
document.addEventListener("DOMContentLoaded", () => {
  addRow();
});

// -------------------------------
// ADD ROW
// -------------------------------
function addRow() {
  const tbody = document.querySelector("#entryTable tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>Rashmi</td>
    <td><input type="text" placeholder="Size"></td>
    <td><input type="number" step="0.01" class="w" placeholder="Weight (MT)"></td>
    <td><input type="number" step="0.01" class="r" placeholder="Rate"></td>
    <td class="a">0.00</td>
    <td><button onclick="removeRow(this)">X</button></td>
  `;

  tbody.appendChild(tr);

  tr.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", calculate);
  });
}

// -------------------------------
// REMOVE ROW
// -------------------------------
function removeRow(btn) {
  btn.closest("tr").remove();
  calculate();
}

// -------------------------------
// CALCULATE TOTAL
// -------------------------------
function calculate() {
  let total = 0;

  document.querySelectorAll("#entryTable tbody tr").forEach(row => {
    const weight = parseFloat(row.querySelector(".w")?.value) || 0;
    const rate = parseFloat(row.querySelector(".r")?.value) || 0;
    const amount = weight * rate;

    row.querySelector(".a").innerText = formatINR(amount);
    total += amount;

  });

  document.getElementById("total").innerText = formatINR(total);
}

// -------------------------------
// GENERATE PDF
// -------------------------------
function generatePDF() {
  // Clear previous print rows
  const printBody = document.getElementById("printItems");
  printBody.innerHTML = "";

  // Copy data from entry table
  document.querySelectorAll("#entryTable tbody tr").forEach((row, index) => {
    const size = row.children[1].querySelector("input").value;
    const weight = row.querySelector(".w").value;
    const rate = formatINR(row.querySelector(".r").value || 0);
    const amount = row.querySelector(".a").innerText;



    printBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>Rashmi</td>
        <td>${size}</td>
        <td>${weight}</td>
        <td>${rate}</td>
        <td>${amount}</td>
      </tr>
    `;
  });

  // Set total
  document.getElementById("printTotal").innerText =
  formatINR(
    document.getElementById("total").innerText.replace(/,/g, "")
  );


  // Set date
  const selectedDate = document.getElementById("poDate").value;

document.getElementById("pDate").innerText = selectedDate
  ? new Date(selectedDate).toLocaleDateString("en-GB")
  : new Date().toLocaleDateString("en-GB");


  // Wait for images to load
  const printDiv = document.getElementById("printPO");
  const images = printDiv.getElementsByTagName("img");
  let loaded = 0;

  if (images.length === 0) {
    renderPDF();
  } else {
    for (let img of images) {
      if (img.complete) {
        imageLoaded();
      } else {
        img.onload = imageLoaded;
        img.onerror = () => alert("Image failed to load: " + img.src);
      }
    }
  }

  function imageLoaded() {
    loaded++;
    if (loaded === images.length) {
      renderPDF();
    }
  }

  function renderPDF() {
    const { jsPDF } = window.jspdf;

    html2canvas(printDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    }).then(canvas => {
      const pdf = new jsPDF("p", "mm", "a4");

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("BDJ_PO.pdf");
    });
  }
}
