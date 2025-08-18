import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import FileViewer from "../components/FileViewer";
import html2pdf from "html2pdf.js";
import htmlDocx from "html-docx-js/dist/html-docx";

const DocumentDetails = () => {
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pdfRef = useRef();

  // compare state
  const [compare, setCompare] = useState({
    open: false,
    askHighlight: false,
    mode: "side-by-side",     // "side-by-side" | "diff"
    perspective: "from-to",   // "from-to" (green=added in To) | "to-from" (green=added in From)
    left: null,
    right: null,
    leftHtml: "",
    rightHtml: "",
    leftMeta: null,
    rightMeta: null,
    diffHtml: "",
    metrics: null,
  });

  const safe = (v) => (v == null ? "" : String(v));

  const fetchDocument = async () => {
    setError("");
    try {
      const res = await axios.get(`/docs/${id}`);
      setDocData(res.data);
    } catch (err) {
      console.error("Error fetching document", err);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- fetch a version by its _id (ensure backend GET /docs/version/:versionId exists) ----
  const fetchVersion = async (versionId) => {
    const { data } = await axios.get(`/docs/version/${versionId}`);
    return data;
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!docData) return <div className="text-center mt-10">Document not found</div>;

  const {
    title,
    documentType,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
    project,
    content,
    activeVersion,            // shown in the header; backend should provide this
    attachments,
    versions = [],
  } = docData;

  const uiContent = (content || "")
    .replace(/<mark(.*?)>/g, "<span class='highlight'>")
    .replace(/<\/mark>/g, "</span>");

  // ===================== Downloads =====================
  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;

    const opt = {
      margin: [20, 10],
      filename: `${safe(title).replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(pdfRef.current)
      .toContainer()
      .toCanvas()
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.text(`SMH Global Services - '${safe(title)}'`, 10, 290);
          pdf.text(`Page ${i}`, 200, 290, null, null, "right");
        }
      })
      .save();
  };

  const buildWordHtml = () => {
    const css = `
      body { font-family: Arial, sans-serif; color:#000; }
      h1,h2,h3,h4,h5,h6 { margin:12px 0 8px; }
      p { margin:8px 0; line-height:1.6; white-space: pre-wrap; }
      .highlight { background-color:#fff3a6; padding:0 2px; }
      ul,ol { padding-left:1.2rem; margin:8px 0 12px; }
      li { margin:4px 0; }
      table { border-collapse:collapse; width:100%; margin:8px 0 16px; }
      th,td { border:1px solid #ccc; padding:6px; vertical-align:top; }
      .info td:first-child { width:30%; background:#f7f7f7; }
      .page-break { page-break-before: always; }
      .section-title { margin-top:16px; }
      ins.diff-add { background:#e6ffed; text-decoration:none; }
      del.diff-del { background:#ffe9e9; color:#8b0000; text-decoration:line-through; }
    `;

    const infoTable = `
      <table class="info">
        <tbody>
          <tr><td><strong>Document Type:</strong></td><td>${safe(documentType)}</td></tr>
          <tr><td><strong>Project:</strong></td><td>${safe(project?.name)}</td></tr>
          <tr><td><strong>Created By:</strong></td><td>${safe(createdBy?.name)}</td></tr>
          <tr><td><strong>Updated By:</strong></td><td>${safe(updatedBy?.name)}</td></tr>
          <tr><td><strong>Created At:</strong></td><td>${new Date(createdAt).toLocaleString()}</td></tr>
          <tr><td><strong>Updated At:</strong></td><td>${new Date(updatedAt).toLocaleString()}</td></tr>
          <tr><td><strong>Active Version:</strong></td><td>${safe(activeVersion?.versionNumber)}</td></tr>
          <tr><td><strong>Baseline:</strong></td><td>${activeVersion?.isBaselined ? "Yes" : "No"}</td></tr>
        </tbody>
      </table>
    `;

    const attachmentList = attachments?.length
      ? `<ul>${attachments.map((f) => `<li>${safe(f.originalName || f.filename)}</li>`).join("")}</ul>`
      : "<p>None</p>";

    const versionsTable = `
      <table class="list">
        <thead>
          <tr>
            <th>Version</th>
            <th>Updated By</th>
            <th>Updated At</th>
            <th>Baseline</th>
            <th>Attachments</th>
          </tr>
        </thead>
        <tbody>
          ${versions
            .map(
              (v) => `
              <tr>
                <td>${safe(v.versionNumber)}</td>
                <td>${safe(v.updatedBy?.name || "-")}</td>
                <td>${new Date(v.updatedAt).toLocaleString()}</td>
                <td>${v.isBaselined ? "Yes" : "No"}</td>
                <td>${v.attachments?.length || "-"}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${safe(title)}</title>
          <style>${css}</style>
        </head>
        <body>
          <h2 class="section-title">Document Information</h2>
          ${infoTable}
          <div class="page-break"></div>
          <h2 class="section-title">Document Content</h2>
          <div>${uiContent}</div>
          <div class="page-break"></div>
          <h2 class="section-title">Attachments</h2>
          ${attachmentList}
          <div class="page-break"></div>
          <h2 class="section-title">Version History</h2>
          ${versionsTable}
        </body>
      </html>
    `;
  };

  const handleDownloadDOCX = () => {
    const html = buildWordHtml();
    const toBlob =
      (htmlDocx && htmlDocx.asBlob)
        ? htmlDocx.asBlob
        : (window.htmlDocx && window.htmlDocx.asBlob);
    if (!toBlob) {
      console.error("html-docx-js not available. Ensure it is installed and imported correctly.");
      return;
    }
    const blob = toBlob(html);
    const filename = `${safe(title).replace(/\s+/g, "_")}.docx`;

    const link = window.document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  // ===================== Diff helpers =====================

  const isTag = (t) => /^<[^>]+>$/.test(t);
  const isWhitespace = (t) => /^\s+$/.test(t);

  // Tokenize HTML into tags, entities, whitespace, and text chunks
  const tokenizeHTML = (html) => {
    if (!html) return [];
    const norm = html.replace(/<br\s*\/?>/gi, "<br/>");
    const parts = norm.split(/(\s+|&[a-z#0-9]+;|<[^>]+>)/gi).filter(Boolean);
    return parts;
  };

  // LCS-based diff on token arrays
  const diffTokens = (a, b) => {
    const n = a.length, m = b.length;
    const dp = Array(n + 1);
    for (let i = 0; i <= n; i++) dp[i] = Array(m + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ops = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        const buf = [a[i]];
        i++; j++;
        while (i < n && j < m && a[i] === b[j]) { buf.push(a[i]); i++; j++; }
        ops.push({ type: "equal", tokens: buf });
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        const buf = [a[i]];
        i++;
        while (i < n && dp[i + 1]?.[j] >= dp[i]?.[j + 1]) { buf.push(a[i]); i++; }
        ops.push({ type: "del", tokens: buf });
      } else {
        const buf = [b[j]];
        j++;
        while (j < m && dp[i + 1]?.[j] < dp[i]?.[j + 1]) { buf.push(b[j]); j++; }
        ops.push({ type: "add", tokens: buf });
      }
    }
    if (i < n) ops.push({ type: "del", tokens: a.slice(i) });
    if (j < m) ops.push({ type: "add", tokens: b.slice(j) });
    return ops;
  };

  const stripTagsToText = (html) => {
    if (!html) return "";
    let s = html;
    // turn block-level ends into newlines
    s = s.replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n");
    s = s.replace(/<br\s*\/?>/gi, "\n");
    // remove tags
    s = s.replace(/<[^>]*>/g, "");
    // decode a couple of common entities
    s = s.replace(/&nbsp;/g, " ");
    return s;
  };

  // line-level LCS counts (text only)
  const countLinesDiff = (textA, textB) => {
    const A = textA.split(/\r?\n/);
    const B = textB.split(/\r?\n/);
    const n = A.length, m = B.length;
    const dp = Array(n + 1);
    for (let i = 0; i <= n; i++) dp[i] = Array(m + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    let i = 0, j = 0, add = 0, del = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { del++; i++; }
      else { add++; j++; }
    }
    del += (n - i);
    add += (m - j);
    return { linesAdded: add, linesDeleted: del };
  };

  // multiset diff for headings (h1..h6) by "hN|text" signature
  const headingMultiset = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || "", "text/html");
      const nodes = doc.querySelectorAll("h1,h2,h3,h4,h5,h6");
      const map = new Map();
      nodes.forEach((h) => {
        const lvl = h.tagName.toLowerCase();
        const txt = (h.textContent || "").replace(/\s+/g, " ").trim();
        const key = `${lvl}|${txt}`;
        map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
    } catch {
      // fallback rough count
      const matches = html?.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
      const map = new Map();
      matches.forEach((m) => {
        const lvl = (m.match(/<h([1-6])/i) || [,"?"])[1];
        const txt = m.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        const key = `h${lvl}|${txt}`;
        map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
    }
  };

  const headingDelta = (htmlA, htmlB) => {
    const A = headingMultiset(htmlA);
    const B = headingMultiset(htmlB);
    let added = 0, deleted = 0;
    const keys = new Set([...A.keys(), ...B.keys()]);
    keys.forEach((k) => {
      const a = A.get(k) || 0;
      const b = B.get(k) || 0;
      if (b > a) added += (b - a);
      else if (a > b) deleted += (a - b);
    });
    return { headingsAdded: added, headingsDeleted: deleted };
  };

  // Build merged diff from FROM (A) → TO (B)
  const buildDiffView = (htmlA, htmlB) => {
    const tokensA = tokenizeHTML(htmlA);
    const tokensB = tokenizeHTML(htmlB);
    const ops = diffTokens(tokensA, tokensB);

    let addedChars = 0, deletedChars = 0;

    // emit a sequence wrapping only TEXT runs (tags rendered as-is)
    const renderWrapped = (arr, wrapperOpen, wrapperClose, countTarget) => {
      let out = "";
      let textBuf = "";

      const flushText = () => {
        if (!textBuf) return;
        countTarget.value += textBuf.length;
        out += `${wrapperOpen}${textBuf}${wrapperClose}`;
        textBuf = "";
      };

      for (const t of arr) {
        if (isTag(t)) {
          // close any text run before emitting a tag
          flushText();
          out += t;
        } else {
          // include whitespace and entities as part of text run
          textBuf += t;
        }
      }
      flushText();
      return out;
    };

    const countAdd = { value: 0 };
    const countDel = { value: 0 };

    const merged = ops.map(op => {
      if (op.type === "equal") return op.tokens.join("");
      if (op.type === "add")  return renderWrapped(op.tokens, '<ins class="diff-add">', '</ins>', countAdd); // present only in TO
      if (op.type === "del")  return renderWrapped(op.tokens, '<del class="diff-del">', '</del>', countDel); // present only in FROM
      return "";
    }).join("");

    const textA = stripTagsToText(htmlA);
    const textB = stripTagsToText(htmlB);
    const { linesAdded, linesDeleted } = countLinesDiff(textA, textB);
    const { headingsAdded, headingsDeleted } = headingDelta(htmlA, htmlB);

    return {
      html: merged,
      metrics: {
        charsAdded: countAdd.value,
        charsDeleted: countDel.value,
        linesAdded,
        linesDeleted,
        headingsAdded,
        headingsDeleted,
      }
    };
  };

  // ===================== Actions =====================

  const handleSetBaseline = async (versionId) => {
    try {
      await axios.put(`/docs/version/${versionId}/baseline`);
      await fetchDocument();
      alert("Baseline version set successfully.");
    } catch (err) {
      console.error("Failed to set baseline", err);
      alert("Failed to set baseline");
    }
  };

  const handleRestore = async (versionId) => {
    try {
      await axios.post(`/docs/${id}/restore/${versionId}`);
      alert("Version restored successfully.");
      await fetchDocument();
    } catch (err) {
      console.error("Restore failed", err);
      alert(err?.response?.data?.message || "Restore failed");
    }
  };

  const openCompare = async () => {
    if (!compare.left || !compare.right) return alert("Select two versions to compare.");
    try {
      const [leftData, rightData] = await Promise.all([
        fetchVersion(compare.left),
        fetchVersion(compare.right),
      ]);
      const leftHtml = (leftData?.content || "").replace(/<mark(.*?)>/g, "<span class='highlight'>").replace(/<\/mark>/g, "</span>");
      const rightHtml = (rightData?.content || "").replace(/<mark(.*?)>/g, "<span class='highlight'>").replace(/<\/mark>/g, "</span>");
      setCompare((c) => ({
        ...c,
        leftHtml,
        rightHtml,
        leftMeta: leftData,
        rightMeta: rightData,
        open: true,
        askHighlight: true,
        mode: "side-by-side",
        perspective: "from-to",   // default: green = added in Right (To)
        diffHtml: "",
        metrics: null,
      }));
    } catch (err) {
      console.error("Compare failed", err);
      alert("Failed to load versions for compare");
    }
  };

  const runDiffForPerspective = (perspective, current = compare) => {
    // "from-to": additions in RIGHT (To), deletions in LEFT (From)
    // "to-from": additions in LEFT (From), deletions in RIGHT (To)
    const fromHtml = perspective === "from-to" ? current.leftHtml  : current.rightHtml;
    const toHtml   = perspective === "from-to" ? current.rightHtml : current.leftHtml;
    const { html, metrics } = buildDiffView(fromHtml, toHtml);
    setCompare((c) => ({ ...c, diffHtml: html, metrics, perspective, mode: "diff", askHighlight: false }));
  };

  const confirmHighlight = (yes) => {
    if (!yes) {
      setCompare((c) => ({ ...c, askHighlight: false, mode: "side-by-side" }));
      return;
    }
    runDiffForPerspective("from-to");
  };

  const flipPerspective = () => {
    const next = compare.perspective === "from-to" ? "to-from" : "from-to";
    runDiffForPerspective(next);
  };

  // ===================== Render =====================
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={handleDownloadDOCX}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download as Word
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Download as PDF
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><strong>Document Type:</strong> {documentType}</div>
        <div><strong>Project:</strong> {project?.name}</div>
        <div><strong>Created By:</strong> {createdBy?.name}</div>
        <div><strong>Updated By:</strong> {updatedBy?.name}</div>
        <div><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</div>
        <div><strong>Updated At:</strong> {new Date(updatedAt).toLocaleString()}</div>
        <div><strong>Active Version:</strong> {activeVersion?.versionNumber ?? "-"}</div>
        <div><strong>Baseline:</strong> {activeVersion?.isBaselined ? "Yes ✅" : "No ❌"}</div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Active Content</h2>
        <style>
          {`
            .prose ul, .prose ol { padding-left: 1.2rem; margin-bottom: 1rem; }
            .prose li { margin-bottom: 6px; }
            .prose table { width: 100%; border-collapse: collapse; }
            .prose table, .prose th, .prose td { border: 1px solid #ccc; padding: 6px; }
            .prose .highlight { background-color: #fff3a6; padding: 0 2px; }

            /* diff styles (global for modal too) */
            ins.diff-add { background: #e6ffed; text-decoration: none; border-radius: 2px; }
            del.diff-del { background: #ffe9e9; color: #8b0000; text-decoration: line-through; border-radius: 2px; }
          `}
        </style>
        <div
          className="prose max-w-full bg-white p-4 rounded border"
          dangerouslySetInnerHTML={{ __html: uiContent }}
        />
      </div>

      {attachments?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Attachments</h2>
          <FileViewer attachments={attachments} />
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold">Version History</h2>
          <button
            onClick={openCompare}
            className="px-3 py-1 bg-gray-900 text-white rounded"
            title="Compare the two selected versions"
          >
            Compare Selected
          </button>
          <span className="text-xs text-gray-600">
            Left: {compare.left ? "✓" : "–"} | Right: {compare.right ? "✓" : "–"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-2">Version</th>
                <th className="border px-2 py-2">Updated By</th>
                <th className="border px-2 py-2">Updated At</th>
                <th className="border px-2 py-2">Baseline</th>
                <th className="border px-2 py-2">Attachments</th>
                <th className="border px-2 py-2">Actions</th>
                <th className="border px-2 py-2">Compare</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v._id}>
                  <td className="border px-2 py-2 text-center">
                    {v.versionNumber} {activeVersion?._id === v._id ? <span className="ml-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Active</span> : null}
                  </td>
                  <td className="border px-2 py-2">{v.updatedBy?.name || "-"}</td>
                  <td className="border px-2 py-2">{new Date(v.updatedAt).toLocaleString()}</td>
                  <td className="border px-2 py-2 text-center">{v.isBaselined ? "✅" : "❌"}</td>
                  <td className="border px-2 py-2 text-center">{v.attachments?.length || "-"}</td>
                  <td className="border px-2 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleSetBaseline(v._id)}
                      className="text-blue-600 hover:underline text-xs"
                      disabled={v.isBaselined}
                    >
                      Set Baseline
                    </button>
                    <button
                      onClick={() => handleRestore(v._id)}
                      className="text-green-600 hover:underline text-xs"
                    >
                      Restore
                    </button>
                  </td>
                  <td className="border px-2 py-2 text-center space-x-2">
                    <button
                      className={`text-indigo-600 hover:underline text-xs ${compare.left === v._id ? "font-bold" : ""}`}
                      onClick={() => setCompare((c) => ({ ...c, left: v._id }))}
                    >
                      Set Left
                    </button>
                    <button
                      className={`text-purple-600 hover:underline text-xs ${compare.right === v._id ? "font-bold" : ""}`}
                      onClick={() => setCompare((c) => ({ ...c, right: v._id }))}
                    >
                      Set Right
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HIDDEN PDF CONTENT */}
      <div style={{ display: "none" }}>
        <div
          ref={pdfRef}
          style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#000", padding: "10px" }}
        >
        {/* COVER PAGE */}
          <div style={{ 
            minHeight: "30vh", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            backgroundColor: "#f8f9fa", 
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            // padding: "20px",
            pageBreakAfter: "always"
          }}>
            <h1 style={{ 
              fontSize: "36px", 
              fontWeight: "bold", 
              marginBottom: "20px",
              color: "#333",
              lineHeight: "1.2",
              maxWidth: "80%",
              wordWrap: "break-word"
            }}>
              {title}
            </h1>
            <p style={{ 
              fontSize: "20px", 
              color: "#666",
              marginBottom: "40px"
            }}>
              {project?.name || 'Project Name Not Available'}
            </p>
            <div style={{ 
              fontSize: "16px", 
              color: "#888",
              borderTop: "1px solid #ddd",
              paddingTop: "5px",
              width: "300px"
            }}>
              <p style={{ margin: "5px 0" }}>Document Type: {documentType}</p>
              <p style={{ margin: "5px 0" }}>Version: {activeVersion?.versionNumber || 'N/A'}</p>
              <p style={{ margin: "5px 0" }}>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>  
          <style>
            {`
              .highlight { background-color: #fff3a6; padding: 0 2px; display: inline; }
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid #ccc; padding: 6px; }
              ul, ol { padding-left: 20px; margin-bottom: 10px; }
              li { margin-bottom: 6px; }
              p { margin: 6px 0; line-height: 2.0; white-space: pre-wrap; }
              .break { page-break-after: always; }
              ins.diff-add { background:#e6ffed; text-decoration:none; }
              del.diff-del { background:#ffe9e9; color:#8b0000; text-decoration:line-through; }
            `}
          </style>

          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Information</h2>
          <table>
            <tbody>
              <tr><td><strong>Document Type:</strong></td><td>{documentType}</td></tr>
              <tr><td><strong>Project:</strong></td><td>{project?.name}</td></tr>
              <tr><td><strong>Created By:</strong></td><td>{createdBy?.name}</td></tr>
              <tr><td><strong>Updated By:</strong></td><td>{updatedBy?.name}</td></tr>
              <tr><td><strong>Created At:</strong></td><td>{new Date(createdAt).toLocaleString()}</td></tr>
              <tr><td><strong>Updated At:</strong></td><td>{new Date(updatedAt).toLocaleString()}</td></tr>
              <tr><td><strong>Active Version:</strong></td><td>{activeVersion?.versionNumber}</td></tr>
              <tr><td><strong>Baseline:</strong></td><td>{activeVersion?.isBaselined ? "Yes" : "No"}</td></tr>
            </tbody>
          </table>

          <div className="break" />
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Content</h2>
          <div dangerouslySetInnerHTML={{ __html: uiContent }} />

          <div className="break" />
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Attachments</h2>
          <ul>
            {attachments?.length
              ? attachments.map((file, idx) => <li key={idx}>{file.originalName || file.filename}</li>)
              : <li>None</li>}
          </ul>

          <div className="break" />
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Version History</h2>
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Updated By</th>
                <th>Updated At</th>
                <th>Baseline</th>
                <th>Attachments</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v, i) => (
                <tr key={i}>
                  <td>{v.versionNumber}</td>
                  <td>{v.updatedBy?.name || "-"}</td>
                  <td>{new Date(v.updatedAt).toLocaleString()}</td>
                  <td>{v.isBaselined ? "✅" : "❌"}</td>
                  <td>{v.attachments?.length || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== COMPARE LAYER ===================== */}
      {compare.open && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex">
          {/* Confirm dialog */}
          {compare.askHighlight && (
            <div className="m-auto bg-white rounded-lg shadow-lg p-6 w-[440px] pointer-events-auto">
              <h4 className="text-lg font-semibold mb-2">Show highlighted changes?</h4>
              <p className="text-sm text-gray-600 mb-4">
                We’ll merge both versions and highlight additions in{" "}
                <span className="px-1 rounded" style={{ background: "#e6ffed" }}>green</span> and deletions in{" "}
                <span className="px-1 rounded" style={{ background: "#ffe9e9" }}>red</span>.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCompare(c => ({ ...c, askHighlight: false, mode: "side-by-side" }))}
                  className="px-3 py-1 rounded border"
                >
                  No, side-by-side
                </button>
                <button
                  onClick={() => confirmHighlight(true)}
                  className="px-3 py-1 rounded bg-gray-900 text-white"
                >
                  Yes, highlight
                </button>
              </div>
            </div>
          )}

          {/* Main compare container */}
          {!compare.askHighlight && (
            <div className="bg-white w-full max-w-7xl mx-auto rounded-lg shadow-lg flex flex-col max-h-[92vh] pointer-events-auto overflow-hidden">
              {/* Sticky top bar */}
              <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  {/* Header is always Left = From, Right = To */}
                  <span className="font-semibold">From</span> v{compare.leftMeta?.versionNumber} →{" "}
                  <span className="font-semibold">To</span> v{compare.rightMeta?.versionNumber}
                </div>

                {compare.mode === "diff" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Highlight:</span>
                    <button
                      onClick={flipPerspective}
                      className="px-2 py-1 text-xs rounded border"
                      title={
                        compare.perspective === "from-to"
                          ? "Green = added in To, Red = removed from From. Click to invert."
                          : "Green = added in From, Red = removed from To. Click to invert."
                      }
                    >
                      {compare.perspective === "from-to" ? "From → To" : "To → From"}
                    </button>
                  </div>
                )}

                <button
                  onClick={() =>
                    setCompare({
                      open: false, mode: "side-by-side",
                      left: null, right: null,
                      leftHtml: "", rightHtml: "",
                      leftMeta: null, rightMeta: null,
                      askHighlight: false, diffHtml: "", metrics: null,
                      perspective: "from-to",
                    })
                  }
                  className="px-3 py-1 rounded border text-sm"
                >
                  Close
                </button>
              </div>

              {/* Sticky metrics (diff mode only) */}
              {compare.mode === "diff" && compare.metrics && (
                <div className="sticky top-[42px] z-10 bg-white border-b px-4 py-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Chars +{compare.metrics.charsAdded}</span>
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Chars −{compare.metrics.charsDeleted}</span>
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Lines +{compare.metrics.linesAdded}</span>
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Lines −{compare.metrics.linesDeleted}</span>
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Headings +{compare.metrics.headingsAdded}</span>
                    <span className="px-2 py-1 rounded-full border bg-gray-50">Headings −{compare.metrics.headingsDeleted}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {compare.perspective === "from-to"
                      ? "Legend: green = present only in To • red = present only in From"
                      : "Legend: green = present only in From • red = present only in To"}
                  </div>
                </div>
              )}

              {/* Content area */}
              <div className="flex-1 px-4 py-3 overflow-hidden">
                {/* Side-by-side with independent scroll panes */}
                {compare.mode === "side-by-side" && (
                  <div className="grid grid-cols-2 gap-4 h-[calc(92vh-120px)]">
                    <div className="border rounded p-3 overflow-y-auto">
                      <h4 className="font-semibold mb-1">Left (From)</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        v{compare.leftMeta?.versionNumber} • {new Date(compare.leftMeta?.updatedAt).toLocaleString()} • {compare.leftMeta?.updatedBy?.name || "-"}
                      </p>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: compare.leftHtml }} />
                    </div>

                    <div className="border rounded p-3 overflow-y-auto">
                      <h4 className="font-semibold mb-1">Right (To)</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        v{compare.rightMeta?.versionNumber} • {new Date(compare.rightMeta?.updatedAt).toLocaleString()} • {compare.rightMeta?.updatedBy?.name || "-"}
                      </p>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: compare.rightHtml }} />
                    </div>
                  </div>
                )}

                {/* Single merged diff */}
                {compare.mode === "diff" && (
                  <div
                    className="prose max-w-none overflow-y-auto max-h-[calc(92vh-120px)] pr-2"
                    dangerouslySetInnerHTML={{ __html: compare.diffHtml }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;
