const vscode = acquireVsCodeApi();

const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");
const meta = document.getElementById("meta");
const input = document.getElementById("search");
const btnExport = document.getElementById("exportCsv");
const btnExportAll = document.getElementById("exportAll");

if (!thead || !tbody) {
  console.error("thead/tbody not found");
}

const allRows = Array.from(tbody.querySelectorAll("tr"));
const total = allRows.length;

function applyFilter() {
  const q = input.value.trim().toLowerCase();
  let visible = 0;

  if (!q) {
    for (const tr of allRows) {
      tr.style.display = "";
    }
    visible = total;
  } else {
    for (const tr of allRows) {
      const text = tr.textContent?.toLowerCase() ?? "";
      const show = text.includes(q);
      tr.style.display = show ? "" : "none";
      if (show) visible++;
    }
  }
  meta.textContent = `${visible} / ${total} rows · {{colCount}} columns`;
}

let isResizing = false;

const headerCells = Array.from(thead.querySelectorAll("th"));
const sortState = { index: -1, asc: true };

headerCells.forEach((th, index) => {
  th.classList.add("sortable", "resizable");

  const arrow = document.createElement("span");
  arrow.className = "sort-arrow";
  arrow.textContent = "";
  th.appendChild(arrow);

  th.addEventListener("click", (e) => {
    if (isResizing) {
      isResizing = false;
      return;
    }

    if (e.target.classList.contains("resize-handle")) {
      return;
    }

    if (sortState.index === index) {
      sortState.asc = !sortState.asc;
    } else {
      sortState.index = index;
      sortState.asc = true;
    }
    applySort();
    updateSortArrows();
    applyFilter();
  });

  makeResizable(th, index);
});

function updateSortArrows() {
  headerCells.forEach((th, index) => {
    const arrow = th.querySelector(".sort-arrow");
    if (!arrow) return;
    if (index !== sortState.index) {
      arrow.textContent = "";
    } else {
      arrow.textContent = sortState.asc ? "▲" : "▼";
    }
  });
}

function applySort() {
  if (sortState.index === -1) return;
  const idx = sortState.index;

  const rowsSorted = [...allRows];
  rowsSorted.sort((a, b) => {
    const aCell = a.querySelectorAll("td")[idx];
    const bCell = b.querySelectorAll("td")[idx];
    const aText = aCell?.textContent ?? "";
    const bText = bCell?.textContent ?? "";

    const na = Number(aText);
    const nb = Number(bText);
    const bothNum = !Number.isNaN(na) && !Number.isNaN(nb);

    let cmp = 0;
    if (bothNum) {
      cmp = na - nb;
    } else {
      cmp = aText.localeCompare(bText);
    }
    return sortState.asc ? cmp : -cmp;
  });

  rowsSorted.forEach((tr) => tbody.appendChild(tr));

  allRows.length = 0;
  allRows.push(...rowsSorted);
}

function makeResizable(th, index) {
  const handle = document.createElement("div");
  handle.className = "resize-handle";
  th.appendChild(handle);

  let startX = 0;
  let startWidth = 0;

  function onMouseMove(e) {
    const delta = e.pageX - startX;
    const newWidth = Math.max(60, startWidth + delta);
    th.style.width = newWidth + "px";
    const cells = tbody.querySelectorAll(`tr > td:nth-child(${index + 1})`);
    cells.forEach((td) => {
      td.style.width = newWidth + "px";
    });
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    isResizing = true;
  }

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    startX = e.pageX;
    startWidth = th.offsetWidth;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

// CSV helpers
function csvEscape(value) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
function collectHeaders() {
  return Array.from(thead.querySelectorAll("th")).map((th) => {
    const first = th.childNodes[0];
    return (first && first.textContent) || "";
  });
}
function collectRowCells(tr) {
  return Array.from(tr.querySelectorAll("td")).map(
    (td) => td.textContent ?? ""
  );
}
function collectVisibleRows() {
  return allRows.filter((tr) => tr.style.display !== "none");
}
function buildCsv(rowsToExport) {
  const headers = collectHeaders();
  const lines = [];
  lines.push(headers.map(csvEscape).join(","));
  for (const tr of rowsToExport) {
    lines.push(collectRowCells(tr).map(csvEscape).join(","));
  }
  // Add BOM for Excel compatibility
  return "\uFEFF" + lines.join("\n");
}

function requestSaveCsv(content, filename) {
  vscode.postMessage({ type: "downloadCSV", filename, content });
}

btnExport.addEventListener("click", () => {
  const rowsToExport = collectVisibleRows();
  const csv = buildCsv(rowsToExport);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  requestSaveCsv(csv, `table-${ts}.csv`);
});

btnExportAll.addEventListener("click", () => {
  const csv = buildCsv(allRows);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  requestSaveCsv(csv, `table-all-${ts}.csv`);
});

let timer;
input.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(applyFilter, 120);
});

applyFilter();
updateSortArrows();
