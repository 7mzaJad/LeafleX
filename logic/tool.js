document.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
    if (event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key === "I") || 
        (event.ctrlKey && event.key === "u")) {
        event.preventDefault();
    }
});

 /* ====================== HELPER & GLOBALS ====================== */
 function escapeXML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  function stripFontTags(html) {
    return html
      .replace(/<font[^>]*>/gi, "")
      .replace(/<\/font>/gi, "");
  }
  function openValidationPortal() {
    window.open("https://leaflet.healthcare/portal/debug/", "_blank");
  }

  /* ====================== SIZES ====================== */
  function addSizeInput() {
    const sizesContainer = document.getElementById("sizesContainer");
    const div = document.createElement("div");
    div.className = "size-container";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "size-input";
    input.placeholder = "500mg";
    input.required = true;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "X";
    removeBtn.onclick = () => div.remove();

    div.appendChild(input);
    div.appendChild(removeBtn);
    sizesContainer.appendChild(div);
  }
  function removeSizeInput(btn) {
    btn.parentNode.remove();
  }

  /* ====================== MINI EDITOR (Paragraph/Bullet) ====================== */
  function addEditorBlock(containerId, isBullet) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const block = document.createElement("div");
    block.className = "editor-block";
    block.dataset.bullet = isBullet ? "true" : "false";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "X";
    removeBtn.onclick = () => block.remove();
    block.appendChild(removeBtn);

    // toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";

    const btnB = document.createElement("button");
    btnB.type = "button";
    btnB.innerText = "B";
    btnB.onclick = () => {
      document.execCommand("bold");
      updateToolbarBtns(toolbar, editorDiv);
    };

    const btnI = document.createElement("button");
    btnI.type = "button";
    btnI.innerText = "I";
    btnI.onclick = () => {
      document.execCommand("italic");
      updateToolbarBtns(toolbar, editorDiv);
    };

    const btnU = document.createElement("button");
    btnU.type = "button";
    btnU.innerText = "U";
    btnU.onclick = () => {
      document.execCommand("underline");
      updateToolbarBtns(toolbar, editorDiv);
    };

    toolbar.appendChild(btnB);
    toolbar.appendChild(btnI);
    toolbar.appendChild(btnU);
    block.appendChild(toolbar);

    // content
    const editorDiv = document.createElement("div");
    editorDiv.className = "editor-content";
    editorDiv.contentEditable = "true";
    editorDiv.onkeyup = () => updateToolbarBtns(toolbar, editorDiv);
    editorDiv.onmouseup = () => updateToolbarBtns(toolbar, editorDiv);
    block.appendChild(editorDiv);

    container.appendChild(block);
  }
  function updateToolbarBtns(toolbar, editorDiv) {
    const isBold = document.queryCommandState("bold");
    const isItalic = document.queryCommandState("italic");
    const isUnder = document.queryCommandState("underline");
    const [bBtn,iBtn,uBtn] = toolbar.querySelectorAll("button");

    bBtn.classList.toggle("active", isBold);
    iBtn.classList.toggle("active", isItalic);
    uBtn.classList.toggle("active", isUnder);
  }

  // collect paragraphs & bullets
  function collectEditorSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return "";

    const blocks = container.querySelectorAll(".editor-block");
    let paragraphs = [];
    let bullets = [];
    blocks.forEach((b) => {
      let html = b.querySelector(".editor-content").innerHTML.trim();
      if (!html) return;
      html = stripFontTags(html);
      if (b.dataset.bullet === "true") bullets.push(html);
      else paragraphs.push(html);
    });

    // also gather any "box-block"
    const boxBlocks = container.querySelectorAll(".box-block");
    let boxHTML = "";
    boxBlocks.forEach((bx) => {
      let contentDiv = bx.querySelector(".box-content");
      if (contentDiv) {
        let text = contentDiv.innerHTML.trim();
        text = stripFontTags(text);
        if (text) {
          boxHTML += `<div style="border:1px solid #000; padding:8px; border-radius:6px;">${text}</div>`;
        }
      }
    });

    // also gather photos from "photo-block"
    const photoBlocks = container.querySelectorAll(".photo-block");
    let photoHTML = "";
    photoBlocks.forEach((ph) => {
      const base64 = ph.dataset.photoBase64 || "";
      const desc = ph.querySelector(".photo-desc")?.value?.trim() || "";
      if (base64) {
        let phId = "photo-" + Math.floor(Math.random()*100000);
        photoHTML += `<figure>
<p><img option-width="200" src="#${phId}"/></p>
<figcaption>${escapeXML(desc)}</figcaption>
</figure>`;
      } else if (desc) {
        photoHTML += `<p><b>Image Desc:</b> ${escapeXML(desc)}</p>`;
      }
    });

    let out = "";
    paragraphs.forEach(p => out += `<p>${p}</p>`);
    if (bullets.length > 0) {
      out += "<ul>";
      bullets.forEach(li => out += `<li>${li}</li>`);
      out += "</ul>";
    }
    if (boxHTML) out += boxHTML;
    if (photoHTML) out += photoHTML;

    return out;
  }

  /* ====================== BOX FEATURE ====================== */
  function addBoxBlock(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const box = document.createElement("div");
    box.className = "box-block";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "X";
    removeBtn.onclick = () => box.remove();
    box.appendChild(removeBtn);

    const heading = document.createElement("h4");
    heading.innerText = "Important Information Box:";
    box.appendChild(heading);

    const contentDiv = document.createElement("div");
    contentDiv.className = "box-content";
    contentDiv.contentEditable = "true";
    contentDiv.style.minHeight = "40px";
    box.appendChild(contentDiv);

    container.appendChild(box);
  }

  /* ====================== PHOTO FEATURE ====================== */
  function addPhotoBlock(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const photoDiv = document.createElement("div");
    photoDiv.className = "photo-block editor-block";
    photoDiv.dataset.photoBase64 = "";

    // remove btn
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "X";
    removeBtn.onclick = () => photoDiv.remove();
    photoDiv.appendChild(removeBtn);

    // label
    const label = document.createElement("label");
    label.innerText = "Select an image:";
    label.style.fontWeight = "normal";
    label.style.marginBottom = "5px";
    photoDiv.appendChild(label);

    // file input
    const fileInp = document.createElement("input");
    fileInp.type = "file";
    fileInp.accept = "image/*";
    fileInp.style.marginLeft = "10px";
    fileInp.onchange = function(e) {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const base64 = ev.target.result.split(",")[1];
        photoDiv.dataset.photoBase64 = base64;
      };
      reader.readAsDataURL(f);
    };
    photoDiv.appendChild(fileInp);

    // desc label
    const descLabel = document.createElement("label");
    descLabel.innerText = "Description (optional):";
    descLabel.style.display = "block";
    descLabel.style.marginTop = "8px";
    photoDiv.appendChild(descLabel);

    // desc input
    const descInp = document.createElement("input");
    descInp.type = "text";
    descInp.className = "photo-desc";
    descInp.placeholder = "e.g. Illustration of injection step";
    descInp.style.marginTop = "4px";
    descInp.style.width = "90%";
    photoDiv.appendChild(descInp);

    container.appendChild(photoDiv);
  }

  /* ====================== TABLE FEATURE (MERGE/UNMERGE) ====================== */
  let tableModalCurrentContainer = "";
  let tableIdCount = 0;
  let allTables = []; // array of {tableId, rows, cols, data, merges? ...}

  function openTableEditor(containerId) {
    tableModalCurrentContainer = containerId;
    const overlay = document.getElementById("tableModalOverlay");
    overlay.style.display = "flex";
  }
  function closeTableEditor() {
    tableModalCurrentContainer = "";
    document.getElementById("tableModalOverlay").style.display = "none";
  }
  function createNewTable() {
    const rows = parseInt(document.getElementById("rowsInput").value, 10)||3;
    const cols = parseInt(document.getElementById("colsInput").value, 10)||5;
    closeTableEditor();
    if (!tableModalCurrentContainer) return;

    const container = document.getElementById(tableModalCurrentContainer);
    if (!container) return;

    tableIdCount++;
    const tableId = "table-" + tableIdCount;
    // create a 2D array data
    let data = [];
    for (let r=0; r<rows; r++){
      let row = [];
      for (let c=0; c<cols; c++){
        row.push("");
      }
      data.push(row);
    }
    allTables.push({ tableId, rows, cols, data });

    // build an actual editor block
    renderTableEditor(container, tableId, rows, cols, data);
  }
  function renderTableEditor(parentContainer, tableId, rows, cols, data) {
    const tableDiv = document.createElement("div");
    tableDiv.className = "table-editor";
    tableDiv.dataset.tableId = tableId;

    // toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "table-toolbar";

    // Merge button
    const mergeBtn = document.createElement("button");
    mergeBtn.innerText = "Merge";
    mergeBtn.onclick = () => doMerge(tableDiv);
    toolbar.appendChild(mergeBtn);

    // Unmerge button
    const unmergeBtn = document.createElement("button");
    unmergeBtn.innerText = "Unmerge";
    unmergeBtn.onclick = () => doUnmerge(tableDiv);
    toolbar.appendChild(unmergeBtn);

    // Remove entire table
    const removeBtn = document.createElement("button");
    removeBtn.innerText = "Remove Table";
    removeBtn.onclick = () => {
      // remove from allTables
      allTables = allTables.filter(t => t.tableId !== tableId);
      tableDiv.remove();
    };
    toolbar.appendChild(removeBtn);

    tableDiv.appendChild(toolbar);

    const heading = document.createElement("h3");
    heading.textContent = "Table Editor:";
    tableDiv.appendChild(heading);

    // build rows
    for (let r=0; r<rows; r++){
      const rowDiv = document.createElement("div");
      rowDiv.className = "table-row";
      for (let c=0; c<cols; c++){
        const cellDiv = document.createElement("div");
        cellDiv.className = "table-cell";
        const inp = document.createElement("input");
        inp.type = "text";
        inp.value = data[r][c] || "";
        inp.onclick = (e) => handleCellClick(e, tableDiv);
        inp.oninput = (e) => {
          data[r][c] = e.target.value;
        };
        cellDiv.appendChild(inp);
        rowDiv.appendChild(cellDiv);
      }
      tableDiv.appendChild(rowDiv);
    }

    parentContainer.appendChild(tableDiv);
  }
  function handleCellClick(e, tableDiv) {
    const inp = e.target;
    if (inp.classList.contains("sel-cell")) {
      inp.classList.remove("sel-cell");
    } else {
      inp.classList.add("sel-cell");
    }
  }
  function doMerge(tableDiv) {
    const selected = tableDiv.querySelectorAll(".sel-cell");
    if (!selected || selected.length < 2) {
      alert("Select at least 2 cells to merge!");
      return;
    }
    let combined = "";
    selected.forEach((i) => { combined += i.value + " "; });
    combined = combined.trim();
    const first = selected[0];
    first.value = combined;
    for (let i=1; i<selected.length; i++) {
      selected[i].parentNode.innerHTML = "";
    }
    selected.forEach((i) => i.classList.remove("sel-cell"));
  }
  function doUnmerge(tableDiv) {
    const rowDivs = tableDiv.querySelectorAll(".table-row");
    rowDivs.forEach((rd) => {
      const cellDivs = rd.querySelectorAll(".table-cell");
      cellDivs.forEach((cd) => {
        if (!cd.querySelector("input")) {
          const newInp = document.createElement("input");
          newInp.type = "text";
          newInp.onclick = (e) => handleCellClick(e, tableDiv);
          cd.appendChild(newInp);
        }
      });
    });
  }

  // turn allTables => final HTML
  function buildTableHTML(tableObj) {
    let html = `<table option-width="120" option-scroll="yes" option-preset="strips-rows">\n  <tbody>\n`;
    for (let r=0; r<tableObj.rows; r++){
      html += "    <tr>\n";
      for (let c=0; c<tableObj.cols; c++){
        const val = escapeXML(tableObj.data[r][c]||"");
        html += `      <td>${val}</td>\n`;
      }
      html += "    </tr>\n";
    }
    html += "  </tbody>\n</table>\n";
    return html;
  }

  /* ============== INSTRUCTIONS STEPS (images) ============== */
  let instructionsSteps = [];
  function addInstructionStep() {
    const container = document.getElementById("instructionsForUseContainer");
    const idx = instructionsSteps.length;
    instructionsSteps.push({ textHTML:"", imageBase64:"" });

    const block = document.createElement("div");
    block.className = "editor-block";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.innerText = "X";
    removeBtn.onclick = () => {
      instructionsSteps[idx] = null;
      block.remove();
    };
    block.appendChild(removeBtn);

    // mini toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "editor-toolbar";
    const btnB = document.createElement("button");
    btnB.type = "button";
    btnB.innerText = "B";
    btnB.onclick = () => {
      document.execCommand("bold");
      updateInstrToolbar(toolbar, editorDiv);
      instructionsSteps[idx].textHTML = stripFontTags(editorDiv.innerHTML);
    };
    const btnI = document.createElement("button");
    btnI.type = "button";
    btnI.innerText = "I";
    btnI.onclick = () => {
      document.execCommand("italic");
      updateInstrToolbar(toolbar, editorDiv);
      instructionsSteps[idx].textHTML = stripFontTags(editorDiv.innerHTML);
    };
    const btnU = document.createElement("button");
    btnU.type = "button";
    btnU.innerText = "U";
    btnU.onclick = () => {
      document.execCommand("underline");
      updateInstrToolbar(toolbar, editorDiv);
      instructionsSteps[idx].textHTML = stripFontTags(editorDiv.innerHTML);
    };
    toolbar.appendChild(btnB);
    toolbar.appendChild(btnI);
    toolbar.appendChild(btnU);
    block.appendChild(toolbar);

    const editorDiv = document.createElement("div");
    editorDiv.className = "editor-content";
    editorDiv.contentEditable = "true";
    editorDiv.onkeyup = () => {
      instructionsSteps[idx].textHTML = stripFontTags(editorDiv.innerHTML);
      updateInstrToolbar(toolbar, editorDiv);
    };
    editorDiv.onmouseup = () => updateInstrToolbar(toolbar, editorDiv);
    block.appendChild(editorDiv);

    // file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.marginTop = "6px";
    fileInput.onchange = function(e) {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        instructionsSteps[idx].imageBase64 = ev.target.result.split(",")[1];
      };
      reader.readAsDataURL(f);
    };
    block.appendChild(fileInput);

    container.appendChild(block);
  }
  function updateInstrToolbar(toolbar, editorDiv) {
    const isBold = document.queryCommandState("bold");
    const isItalic = document.queryCommandState("italic");
    const isUnder = document.queryCommandState("underline");
    const [bBtn, iBtn, uBtn] = toolbar.querySelectorAll("button");
    bBtn.classList.toggle("active", isBold);
    iBtn.classList.toggle("active", isItalic);
    uBtn.classList.toggle("active", isUnder);
  }

  /* ============== GENERATE & DOWNLOAD ============== */
  function generateXML() {
    // Collect basic inputs
    const medicineName = document.getElementById("medicineName").value.trim();
    const type = document.getElementById("type").value.trim();
    const subName = document.getElementById("subName").value.trim();

    /*===================================== the new date case =====================================*/

    const revisionDate = document.getElementById("revisionDate").value.trim();
    
    // Validate date format matches ISO 8601
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
    if (!iso8601Regex.test(revisionDate)) {
      alert("Please enter date in ISO 8601 format (e.g. 2025-07-18T08:30:00+02:00)");
      return;
    }


  /*===============================================================================================*/
    // Collect sections
    const whatIsHTML = collectEditorSection("whatIsContainer");
    const usageHTML = collectEditorSection("usageContainer");
    const warningsHTML = collectEditorSection("warningsContainer");
    const howToTakeHTML = collectEditorSection("howToTakeContainer");
    const doNotTakeHTML = collectEditorSection("doNotTakeContainer");
    const sideEffectsHTML = collectEditorSection("sideEffectsContainer");
    const veryCommonHTML = collectEditorSection("veryCommonContainer");
    const commonHTML = collectEditorSection("commonContainer");
    const veryRareHTML = collectEditorSection("veryRareContainer");
    const pregnancyHTML = collectEditorSection("pregnancyBreastfeedingFertilityContainer");
    const storageHTML = collectEditorSection("storageContainer");
    const contentsHTML = collectEditorSection("contentsContainer");

    // Build combined table HTML from allTables
    let tableHTML = "";
    allTables.forEach((tbl) => {
      tableHTML += buildTableHTML(tbl);
    });

    // We'll simply append the entire tableHTML to "howToTakeHTML" or can do it to any place user wants
    // But for demonstration, let's just append to "howToTakeHTML"
    let finalHowToTake = howToTakeHTML + tableHTML;

    // Gather sizes
    const sizeInputs = document.querySelectorAll(".size-input");
    let sizesHTML = "";
    sizeInputs.forEach((inp) => {
      const val = inp.value.trim();
      if (val) {
        sizesHTML += `<p>${escapeXML(val)}</p>`;
      }
    });

    // instructions
    let instructionsBinaryXML = "";
    let instructionsXHTML = "<ol>";
    instructionsSteps.forEach((step, idx) => {
      if (!step) return;
      const stepText = (step.textHTML || "").trim();
      const stepImg = (step.imageBase64 || "").trim();
      if (!stepText && !stepImg) return;
      let binId = `binary-inst-${idx+1}`;
      instructionsXHTML += "<li>";
      if (stepText) {
        instructionsXHTML += `<p>${escapeXML(stepText)}</p>`;
      }
      if (stepImg) {
        instructionsBinaryXML += `
<entry>
  <fullUrl value="Binary/${binId}"/>
  <resource>
    <Binary>
      <id value="${binId}"/>
      <contentType value="image/jpeg"/>
      <data value="${stepImg}"/>
    </Binary>
  </resource>
</entry>`;
        instructionsXHTML += `<p><img option-width="200" src="#${binId}"/></p>`;
      }
      instructionsXHTML += "</li>";
    });
    instructionsXHTML += "</ol>";

    let instructionsSectionXML = "";
    if (!/^<ol><\/ol>$/.test(instructionsXHTML)) {
      instructionsSectionXML = `
        <section>
          <title value="7. Instructions For Use"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="59845-8"/>
              <display value="INSTRUCTIONS FOR USE"/>
            </coding>
            <text value="INSTRUCTIONS FOR USE"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              <h3>Instructions For Use</h3>
              ${instructionsXHTML}
            </div>
          </text>
        </section>`;
    }

    // Build final HL7 ePI
    let xml = buildFinalEpi({
      medicineName, type, subName, revisionDate,
      whatIsHTML,
      usageHTML,
      warningsHTML,
      howToTakeHTML: finalHowToTake,
      doNotTakeHTML,
      sideEffectsHTML,
      veryCommonHTML,
      commonHTML,
      veryRareHTML,
      pregnancyHTML,
      storageHTML,
      contentsHTML,
      sizesHTML,
      instructionsSectionXML,
      instructionsBinaryXML
    });

    document.getElementById("xmlOutput").textContent = xml.trim();
    document.getElementById("downloadBtn").style.display = "inline-block";
  }

  function buildFinalEpi(opt) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Bundle xmlns="http://hl7.org/fhir">
<id value="bundle-leaflex-prime"/>
<meta>
  <versionId value="1"/>
  <lastUpdated value="2025-02-15T00:00:00+02:00"/>
  <profile value="http://hl7.org/fhir/uv/emedicinal-product-info/StructureDefinition/Bundle-uv-epi"/>
</meta>
<language value="en"/>
<identifier>
  <system value="https://leaflet.healthcare/sid/doc"/>
  <value value="L000"/>
</identifier>
<type value="document"/>
<timestamp value="2025-02-15T00:00:00+02:00"/>

<!-- Composition -->
<entry>
  <fullUrl value="Composition/composition-leaflex"/>
  <resource>
    <Composition>
      <id value="composition-leaflex"/>
      <meta>
        <profile value="http://hl7.org/fhir/uv/emedicinal-product-info/StructureDefinition/Composition-uv-epi"/>
      </meta>
      <language value="en"/>
      <identifier>
        <system value="https://leaflet.healthcare/sid/composition"/>
        <value value="C000"/>
      </identifier>
      <version value="1"/>
      <status value="final"/>
      <type>
        <coding>
          <system value="http://loinc.org"/>
          <code value="42230-3"/>
          <display value="SPL patient package insert section"/>
        </coding>
        <text value="SPL patient package insert section"/>
      </type>
      <subject>
        <reference value="MedicinalProductDefinition/medicinalproductdefinition-leaflex"/>
      </subject>
      <author>
        <reference value="Organization/organization-leaflex"/>
      </author>
      <title value="${escapeXML(opt.medicineName)} ${escapeXML(opt.type)}"/>
      <date value="${escapeXML(opt.revisionDate)}"/>

      <section>
        <title value="Package leaflet: information for the patient"/>
        <text>
          <status value="additional"/>
          <div xmlns="http://www.w3.org/1999/xhtml">
            <p><b>Package leaflet: information for the patient</b></p>
            <h2><b>${escapeXML(opt.medicineName)}®</b></h2>
            ${opt.sizesHTML}
            <p><b>${escapeXML(opt.subName)}</b></p>
          </div>
        </text>

        <section>
          <title value="1. What ${escapeXML(opt.medicineName)} is and what it is used for"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="34067-9"/>
              <display value="INDICATIONS & USAGE"/>
            </coding>
            <text value="INDICATIONS & USAGE"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.whatIsHTML}
              ${opt.usageHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="Warnings And Precautions"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="34070-3"/>
              <display value="CONTRAINDICATIONS"/>
            </coding>
            <text value="CONTRAINDICATIONS"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.warningsHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="3. How to take ${escapeXML(opt.medicineName)}"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="34068-7"/>
              <display value="DOSAGE & ADMINISTRATION"/>
            </coding>
            <text value="DOSAGE & ADMINISTRATION"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.howToTakeHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="Do not take ${escapeXML(opt.medicineName)} if:"/>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.doNotTakeHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="4. Possible side effects"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="34084-4"/>
              <display value="ADVERSE REACTIONS"/>
            </coding>
            <text value="ADVERSE REACTIONS"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.sideEffectsHTML}
              <p><b>Very Common Side Effects:</b></p>
              ${opt.veryCommonHTML}
              <p><b>Common Side Effects:</b></p>
              ${opt.commonHTML}
              <p><b>Very Rare Side Effects:</b></p>
              ${opt.veryRareHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="5. How to store ${escapeXML(opt.medicineName)}"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="44425-7"/>
              <display value="STORAGE AND HANDLING"/>
            </coding>
            <text value="STORAGE AND HANDLING"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.storageHTML}
            </div>
          </text>
        </section>

        <section>
          <title value="6. Contents of the pack and other information"/>
          <code>
            <coding>
              <system value="http://loinc.org"/>
              <code value="43678-2"/>
              <display value="DOSAGE FORMS & STRENGTHS"/>
            </coding>
            <text value="DOSAGE FORMS & STRENGTHS"/>
          </code>
          <text>
            <status value="additional"/>
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${opt.contentsHTML}
            </div>
          </text>
        </section>

        ${opt.instructionsSectionXML||""}

      </section>
    </Composition>
  </resource>
</entry>

<!-- Organization -->
<entry>
  <fullUrl value="Organization/organization-leaflex"/>
  <resource>
    <Organization>
      <id value="organization-leaflex"/>
      <meta>
        <profile value="http://hl7.org/fhir/uv/emedicinal-product-info/StructureDefinition/Organization-uv-epi"/>
      </meta>
      <language value="en"/>
      <identifier>
        <use value="official"/>
        <system value="https://spor.ema.europa.eu/omswi"/>
        <value value="ORG-100001111"/>
      </identifier>
      <active value="true"/>
      <type>
        <coding>
          <system value="https://spor.ema.europa.eu/rmswi"/>
          <code value="220000000034"/>
          <display value="Marketing authorisation holder"/>
        </coding>
        <text value="Marketing authorisation holder"/>
      </type>
      <name value="My Pharma Company"/>
      <contact>
        <address>
          <use value="work"/>
          <type value="physical"/>
          <line value="Ramsgate Road, Sandwich, Kent, CT13 9NJ"/>
          <city value="Sandwich"/>
          <country value="UK"/>
        </address>
      </contact>
    </Organization>
  </resource>
</entry>

<!-- MedicinalProductDefinition -->
<entry>
  <fullUrl value="MedicinalProductDefinition/medicinalproductdefinition-leaflex"/>
  <resource>
    <MedicinalProductDefinition>
      <id value="medicinalproductdefinition-leaflex"/>
      <meta>
        <profile value="http://hl7.org/fhir/uv/emedicinal-product-info/StructureDefinition/MedicinalProductDefinition-uv-epi"/>
      </meta>
      <language value="en"/>
      <identifier>
        <system value="https://jfda.jo"/>
        <value value="placeholder"/>
      </identifier>
      <type>
        <coding>
          <system value="http://hl7.org/fhir/medicinal-product-type"/>
          <code value="MedicinalProduct"/>
          <display value="Medicinal Product"/>
        </coding>
      </type>
      <domain>
        <coding>
          <system value="http://hl7.org/fhir/medicinal-product-domain"/>
          <code value="Human"/>
          <display value="Human use"/>
        </coding>
      </domain>
      <status>
        <coding>
          <system value="http://hl7.org/fhir/publication-status"/>
          <code value="active"/>
          <display value="active"/>
        </coding>
      </status>
      <statusDate value="2025-02-15T00:00:00+02:00"/>
      <legalStatusOfSupply>
        <coding>
          <system value="http://hl7.org/fhir/legal-status-of-supply"/>
          <code value="100000072084"/>
          <display value="Medicinal product subject to medical prescription"/>
        </coding>
      </legalStatusOfSupply>
      <classification>
        <coding>
          <system value="http://hl7.org/fhir/ValueSet/medicinal-product-classification"/>
          <code value="J01FA10"/>
          <display value="Example Classification"/>
        </coding>
      </classification>
      <route>
        <coding>
          <system value="http://hl7.org/fhir/uv/emedicinal-product-info/ValueSet/routeOfAdministration"/>
          <code value="26643006"/>
          <display value="Oral route"/>
        </coding>
      </route>
      <combinedPharmaceuticalDoseForm>
        <coding>
          <system value="http://hl7.org/fhir/uv/emedicinal-product-info/ValueSet/doseForm"/>
          <code value="100000074064"/>
          <display value="Tablet and powder for oral solution"/>
        </coding>
      </combinedPharmaceuticalDoseForm>
      <name>
        <productName value="${escapeXML(opt.medicineName)}"/>
        <type>
          <coding>
            <system value="http://hl7.org/fhir/ValueSet/medicinal-product-name-type"/>
            <code value="INN"/>
            <display value="International Non-Proprietary Name"/>
          </coding>
          <text value="International Non-Proprietary Name"/>
        </type>
        <part>
          <part value="${escapeXML(opt.medicineName)}"/>
          <type>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/medicinal-product-name-part-type"/>
              <code value="InventedNamePart"/>
              <display value="Invented name part"/>
            </coding>
            <text value="Invented name part"/>
          </type>
        </part>
        <part>
          <part value="Your-Active-Ingredient"/>
          <type>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/medicinal-product-name-part-type"/>
              <code value="ScientificNamePart"/>
              <display value="Scientific name part"/>
            </coding>
            <text value="Scientific name part"/>
          </type>
        </part>
        <part>
          <part value="(example strength)"/>
          <type>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/medicinal-product-name-part-type"/>
              <code value="StrengthPart"/>
              <display value="Strength part"/>
            </coding>
            <text value="Strength part"/>
          </type>
        </part>
        <part>
          <part value="${escapeXML(opt.type)}"/>
          <type>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/medicinal-product-name-part-type"/>
              <code value="DoseFormPart"/>
              <display value="Pharmaceutical dose form part"/>
            </coding>
            <text value="Pharmaceutical dose form part"/>
          </type>
        </part>
        <usage>
          <country>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/country"/>
              <code value="JO"/>
              <display value="Jordan"/>
            </coding>
          </country>
          <jurisdiction>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/jurisdiction"/>
              <code value="JO"/>
              <display value="Jordan"/>
            </coding>
          </jurisdiction>
          <language>
            <coding>
              <system value="http://hl7.org/fhir/ValueSet/all-languages"/>
              <code value="en"/>
              <display value="English"/>
            </coding>
          </language>
        </usage>
      </name>
    </MedicinalProductDefinition>
  </resource>
</entry>

${opt.instructionsBinaryXML}
</Bundle>`;
  }

  function downloadXML() {
    const xmlContent = document.getElementById("xmlOutput").textContent;
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leaflet.xml";
    link.click();
    URL.revokeObjectURL(url);
  }