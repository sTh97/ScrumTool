// import React, { useEffect, useState, useRef } from "react";
// import axios from "../api/axiosInstance";
// import { useParams } from "react-router-dom";
// import FileViewer from "../components/FileViewer";
// import html2pdf from "html2pdf.js";

// const DocumentDetails = () => {
//   const { id } = useParams();
//   const [document, setDocument] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const pdfRef = useRef();

//   useEffect(() => {
//     const fetchDocument = async () => {
//       try {
//         const res = await axios.get(`/docs/${id}`);
//         setDocument(res.data);
//       } catch (err) {
//         console.error("Error fetching document", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDocument();
//   }, [id]);

//   if (loading) return <div className="text-center mt-10">Loading...</div>;
//   if (!document) return <div className="text-center mt-10">Document not found</div>;

//   const {
//     title,
//     documentType,
//     createdBy,
//     updatedBy,
//     createdAt,
//     updatedAt,
//     project,
//     content,
//     latestVersion,
//     attachments,
//     versions,
//   } = document;

//   const handleDownloadPDF = () => {
//     if (!pdfRef.current) return;

//     const opt = {
//       margin: [20, 10],
//       filename: `${title.replace(/\s+/g, "_")}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//       pagebreak: { mode: ["css", "legacy"] },
//     };

//     html2pdf()
//       .set(opt)
//       .from(pdfRef.current)
//       .toContainer()
//       .toCanvas()
//       .toPdf()
//       .get("pdf")
//       .then((pdf) => {
//         const pageCount = pdf.internal.getNumberOfPages();
//         for (let i = 1; i <= pageCount; i++) {
//           pdf.setPage(i);
//           pdf.setFontSize(8);
//           pdf.text(`SMH Global Services - '${title}'`, 10, 290);
//           pdf.text(`Page ${i}`, 200, 290, null, null, "right");
//         }
//       })
//       .save();
//   };

//   // Clean highlight handling
//   // const parsedContent = content?.replaceAll("<mark", "<span class='highlight'").replaceAll("</mark>", "</span>");

//       const parsedContent = content
//       ?.replace(/<mark(.*?)>/g, "<span class='highlight'>")  // Replace <mark> with <span>
//       .replace(/<\/mark>/g, "</span>")
//       .replace(/(?:^|(?<=\n))(?=[^<])/g, "<p>")              // Wrap orphan lines in <p>
//       .replace(/([^\n>])(?=\n|$)/g, "$1</p>");               // Close orphan lines with </p>


//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={handleDownloadPDF}
//           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//         >
//           Download as PDF
//         </button>
//       </div>

//       <h1 className="text-2xl font-bold mb-4">{title}</h1>

//       <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
//         <div><strong>Document Type:</strong> {documentType}</div>
//         <div><strong>Project:</strong> {project?.name}</div>
//         <div><strong>Created By:</strong> {createdBy?.name}</div>
//         <div><strong>Updated By:</strong> {updatedBy?.name}</div>
//         <div><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</div>
//         <div><strong>Updated At:</strong> {new Date(updatedAt).toLocaleString()}</div>
//         <div><strong>Version:</strong> {latestVersion?.versionNumber}</div>
//         <div><strong>Baseline:</strong> {latestVersion?.isBaselined ? "Yes ✅" : "No ❌"}</div>
//       </div>

//       <div className="mb-6">
//         <h2 className="text-lg font-semibold mb-2">Latest Content</h2>
//         <style>
//           {`
//             .prose ul, .prose ol { padding-left: 1.2rem; margin-bottom: 1rem; }
//             .prose li { margin-bottom: 6px; }
//             .prose table { width: 100%; border-collapse: collapse; }
//             .prose table, .prose th, .prose td { border: 1px solid #ccc; padding: 6px; }
//             .prose .highlight { background-color: #fff3a6; padding: 0 2px; }
//           `}
//         </style>
//         <div
//           className="prose max-w-full bg-white p-4 rounded border"
//           dangerouslySetInnerHTML={{ __html: parsedContent }}
//         />
//       </div>

//       {attachments?.length > 0 && (
//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-2">Attachments</h2>
//           <FileViewer attachments={attachments} />
//         </div>
//       )}

//       <div className="mt-10">
//         <h2 className="text-lg font-semibold mb-3">Version History</h2>
//         <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-4 py-2">Version</th>
//               <th className="border px-4 py-2">Updated By</th>
//               <th className="border px-4 py-2">Updated At</th>
//               <th className="border px-4 py-2">Baseline</th>
//               <th className="border px-4 py-2">Attachments</th>
//             </tr>
//           </thead>
//           <tbody>
//             {versions.map((v) => (
//               <tr key={v.versionNumber}>
//                 <td className="border px-4 py-2 text-center">{v.versionNumber}</td>
//                 <td className="border px-4 py-2">{v.updatedBy?.name || "-"}</td>
//                 <td className="border px-4 py-2">{new Date(v.updatedAt).toLocaleString()}</td>
//                 <td className="border px-4 py-2 text-center">{v.isBaselined ? "✅" : "❌"}</td>
//                 <td className="border px-4 py-2 text-center">{v.attachments?.length || "-"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* PDF CONTENT */}
//       <div style={{ display: "none" }}>
//         <div ref={pdfRef} style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#000", padding: "20px" }}>
//           <style>
//             {`
//               .highlight { background-color: #fff3a6; padding: 0 2px; display: inline;}
//               table { border-collapse: collapse; width: 100%; }
//               table, th, td { border: 1px solid #ccc; padding: 6px; }
//               ul, ol { padding-left: 20px; margin-bottom: 10px; }
//               li { margin-bottom: 6px; }
//               p { margin: 6px 0; line-height: 2.0;}
//             `}
//           </style>

//           {/* COVER PAGE */}
//           <div style={{ textAlign: "center", paddingTop: "40px", pageBreakAfter: "always" }}>
//             <img
//               src="/assets/smhLogo.png"
//               alt="SMH Logo"
//               style={{ width: "150px", marginBottom: "30px" }}
//               onError={(e) => { e.target.style.display = 'none'; }}
//             />
//             <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "10px" }}>{title}</h1>
//             <p style={{ fontSize: "18px" }}>{project?.name}</p>
//             <div style={{ marginTop: "30px", fontSize: "14px" }}>
//               <p>Document Type: {documentType}</p>
//               <p>Version: {latestVersion?.versionNumber}</p>
//               <p>Generated On: {new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           {/* DOCUMENT INFO */}
//           <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Information</h2>
//           <table>
//             <tbody>
//               <tr><td><strong>Document Type:</strong></td><td>{documentType}</td></tr>
//               <tr><td><strong>Project:</strong></td><td>{project?.name}</td></tr>
//               <tr><td><strong>Created By:</strong></td><td>{createdBy?.name}</td></tr>
//               <tr><td><strong>Updated By:</strong></td><td>{updatedBy?.name}</td></tr>
//               <tr><td><strong>Created At:</strong></td><td>{new Date(createdAt).toLocaleString()}</td></tr>
//               <tr><td><strong>Updated At:</strong></td><td>{new Date(updatedAt).toLocaleString()}</td></tr>
//               <tr><td><strong>Version:</strong></td><td>{latestVersion?.versionNumber}</td></tr>
//               <tr><td><strong>Baseline:</strong></td><td>{latestVersion?.isBaselined ? "Yes" : "No"}</td></tr>
//             </tbody>
//           </table>

//           <div style={{ pageBreakAfter: "always" }} />

//           {/* CONTENT SECTION */}
//           <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Content</h2>
//           <div dangerouslySetInnerHTML={{ __html: parsedContent }} />

//           <div style={{ pageBreakAfter: "always" }} />

//           {/* ATTACHMENTS */}
//           <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Attachments</h2>
//           <ul>
//             {attachments?.length ? attachments.map((file, idx) => (
//               <li key={idx}>{file.name}</li>
//             )) : <li>None</li>}
//           </ul>

//           <div style={{ pageBreakAfter: "always" }} />

//           {/* VERSION HISTORY */}
//           <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Version History</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Version</th>
//                 <th>Updated By</th>
//                 <th>Updated At</th>
//                 <th>Baseline</th>
//                 <th>Attachments</th>
//               </tr>
//             </thead>
//             <tbody>
//               {versions.map((v, i) => (
//                 <tr key={i}>
//                   <td>{v.versionNumber}</td>
//                   <td>{v.updatedBy?.name || "-"}</td>
//                   <td>{new Date(v.updatedAt).toLocaleString()}</td>
//                   <td>{v.isBaselined ? "✅" : "❌"}</td>
//                   <td>{v.attachments?.length || "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentDetails;


// //***********Added Word Download*****************************/


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
  const pdfRef = useRef();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await axios.get(`/docs/${id}`);
        setDocData(res.data);
      } catch (err) {
        console.error("Error fetching document", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

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
    latestVersion,
    attachments,
    versions,
  } = docData;

  // --- UI content: keep your original look & feel (no restructuring) ---
  const uiContent =
    (content || "")
      .replace(/<mark(.*?)>/g, "<span class='highlight'>")
      .replace(/<\/mark>/g, "</span>");

  // --- Export content: same HTML, but export-only CSS will ensure no collapse ---
  const exportContent = uiContent;

  const safe = (v) => (v == null ? "" : String(v));

  // ---------- PDF Download (unchanged visual layout for your hidden area) ----------
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

  // ---------- Word Download (.docx) ----------
  const buildWordHtml = () => {
    const css = `
      body { font-family: Arial, sans-serif; color:#000; }
      h1,h2,h3,h4,h5,h6 { margin:12px 0 8px; }
      /* Prevent collapse and keep user line breaks in exports only */
      p { margin:8px 0; line-height:1.6; white-space: pre-wrap; }
      .highlight { background-color:#fff3a6; padding:0 2px; }
      ul,ol { padding-left:1.2rem; margin:8px 0 12px; }
      li { margin:4px 0; }
      table { border-collapse:collapse; width:100%; margin:8px 0 16px; }
      th,td { border:1px solid #ccc; padding:6px; vertical-align:top; }
      .info td:first-child { width:30%; background:#f7f7f7; }
      .cover { text-align:center; padding-top:40px; }
      .cover img { width:150px; margin-bottom:30px; }
      .meta { margin-top:20px; }
      .muted { color:#555; }
      .page-break { page-break-before: always; }
      .section-title { margin-top:16px; }
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
          <tr><td><strong>Version:</strong></td><td>${safe(latestVersion?.versionNumber)}</td></tr>
          <tr><td><strong>Baseline:</strong></td><td>${latestVersion?.isBaselined ? "Yes" : "No"}</td></tr>
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
          

          <div class="page-break"></div>

          <h2 class="section-title">Document Information</h2>
          ${infoTable}

          <div class="page-break"></div>

          <h2 class="section-title">Document Content</h2>
          <div>${exportContent}</div>

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
        <div><strong>Version:</strong> {latestVersion?.versionNumber}</div>
        <div><strong>Baseline:</strong> {latestVersion?.isBaselined ? "Yes ✅" : "No ❌"}</div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Latest Content</h2>
        {/* UI styles only (keep as before) */}
        <style>
          {`
            .prose ul, .prose ol { padding-left: 1.2rem; margin-bottom: 1rem; }
            .prose li { margin-bottom: 6px; }
            .prose table { width: 100%; border-collapse: collapse; }
            .prose table, .prose th, .prose td { border: 1px solid #ccc; padding: 6px; }
            .prose .highlight { background-color: #fff3a6; padding: 0 2px; }
            /* NOTE: No white-space: pre-wrap here to avoid changing your on-screen layout */
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
        <h2 className="text-lg font-semibold mb-3">Version History</h2>
        <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Version</th>
              <th className="border px-4 py-2">Updated By</th>
              <th className="border px-4 py-2">Updated At</th>
              <th className="border px-4 py-2">Baseline</th>
              <th className="border px-4 py-2">Attachments</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.versionNumber}>
                <td className="border px-4 py-2 text-center">{v.versionNumber}</td>
                <td className="border px-4 py-2">{v.updatedBy?.name || "-"}</td>
                <td className="border px-4 py-2">{new Date(v.updatedAt).toLocaleString()}</td>
                <td className="border px-4 py-2 text-center">{v.isBaselined ? "✅" : "❌"}</td>
                <td className="border px-4 py-2 text-center">{v.attachments?.length || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HIDDEN PDF LAYOUT (export-only CSS includes pre-wrap to keep line breaks) */}
      <div style={{ display: "none" }}>
        <div
          ref={pdfRef}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            color: "#000",
            padding: "20px",
          }}
        >
          <style>
            {`
              .highlight { background-color: #fff3a6; padding: 0 2px; display: inline; }
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid #ccc; padding: 6px; }
              ul, ol { padding-left: 20px; margin-bottom: 10px; }
              li { margin-bottom: 6px; }
              p { margin: 6px 0; line-height: 2.0; white-space: pre-wrap; } /* export only */
              .break { page-break-after: always; }
            `}
          </style>

          {/* COVER PAGE */}
          <div style={{ textAlign: "center", paddingTop: "40px", pageBreakAfter: "always" }}>
            <img
              src="/assets/smhLogo.png"
              alt="SMH Logo"
              style={{ width: "150px", marginBottom: "30px" }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "10px" }}>{title}</h1>
            <p style={{ fontSize: "18px" }}>{project?.name}</p>
            <div style={{ marginTop: "30px", fontSize: "14px" }}>
              <p>Document Type: {documentType}</p>
              <p>Version: {latestVersion?.versionNumber}</p>
              <p>Generated On: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* DOCUMENT INFO */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Information</h2>
          <table>
            <tbody>
              <tr><td><strong>Document Type:</strong></td><td>{documentType}</td></tr>
              <tr><td><strong>Project:</strong></td><td>{project?.name}</td></tr>
              <tr><td><strong>Created By:</strong></td><td>{createdBy?.name}</td></tr>
              <tr><td><strong>Updated By:</strong></td><td>{updatedBy?.name}</td></tr>
              <tr><td><strong>Created At:</strong></td><td>{new Date(createdAt).toLocaleString()}</td></tr>
              <tr><td><strong>Updated At:</strong></td><td>{new Date(updatedAt).toLocaleString()}</td></tr>
              <tr><td><strong>Version:</strong></td><td>{latestVersion?.versionNumber}</td></tr>
              <tr><td><strong>Baseline:</strong></td><td>{latestVersion?.isBaselined ? "Yes" : "No"}</td></tr>
            </tbody>
          </table>

          <div className="break" />

          {/* CONTENT SECTION */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Content</h2>
          <div dangerouslySetInnerHTML={{ __html: exportContent }} />

          <div className="break" />

          {/* ATTACHMENTS */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Attachments</h2>
          <ul>
            {attachments?.length
              ? attachments.map((file, idx) => <li key={idx}>{file.originalName || file.filename}</li>)
              : <li>None</li>}
          </ul>

          <div className="break" />

          {/* VERSION HISTORY */}
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
    </div>
  );
};

export default DocumentDetails;
