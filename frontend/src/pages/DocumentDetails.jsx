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

//   const fetchDocument = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`/docs/${id}`);
//       setDocument(res.data);
//     } catch (err) {
//       console.error("Error fetching document", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
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

//   const footer = `
//     <div style="font-size:10px; border-top:0px solid #ccc; margin-top:30px; padding-top:6px; text-align:center">
     
//     </div>
//   `;

//   const handleDownloadPDF = () => {
//       if (!pdfRef.current) return;

//       const opt = {
//         margin: [20, 10], // [topBottom, leftRight]
//         filename: `${title.replace(/\s+/g, "_")}.pdf`,
//         image: { type: "jpeg", quality: 0.98 },
//         html2canvas: { scale: 2 },
//         jsPDF: {
//           unit: "mm",
//           format: "a4",
//           orientation: "portrait",
//         },
//         pagebreak: { mode: ["css", "legacy"] },
//       };

//       html2pdf()
//         .set(opt)
//         .from(pdfRef.current)
//         .toContainer()
//         .toCanvas()
//         .toPdf()
//         .get("pdf")
//         .then((pdf) => {
//           const pageCount = pdf.internal.getNumberOfPages();
//           for (let i = 1; i <= pageCount; i++) {
//             pdf.setPage(i);
//             pdf.setFontSize(8);
//             pdf.text(`SMH Global Services - '${title}'`, 10, 290);
//             pdf.text(`Page ${i}`, 200, 290, null, null, "right");
//           }
//         })
//         .save();
//     };



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
//         <div
//           className="prose max-w-full bg-white p-4 rounded border"
//           dangerouslySetInnerHTML={{ __html: content }}
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

//       {/* Hidden Printable PDF Block */}
//       <div style={{ display: "none" }}>
//         <div ref={pdfRef} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
//           <div style={{ padding: 40, fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
//             {/* <h1 style={{ 
//               textAlign: "center", 
//               fontSize: "40px", 
//               marginBottom: 20 
//               }}>
//               {title}
//               </h1>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
//               <p><strong>Document Type:</strong> {documentType}</p>
//               <p><strong>Project:</strong> {project?.name}</p>
//               <p><strong>Created By:</strong> {createdBy?.name}</p>
//               <p><strong>Updated By:</strong> {updatedBy?.name}</p>
//               <p><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</p>
//               <p><strong>Updated At:</strong> {new Date(updatedAt).toLocaleString()}</p>
//               <p><strong>Version:</strong> {latestVersion?.versionNumber}</p>
//               <p><strong>Baseline:</strong> {latestVersion?.isBaselined ? "Yes ✅" : "No ❌"}</p>
//             </div> */}

//             <div style={{ 
//             minHeight: "100vh", 
//             display: "flex", 
//             flexDirection: "column", 
//             justifyContent: "center", 
//             alignItems: "center", 
//             backgroundColor: "#f8f9fa", 
//             fontFamily: "Arial, sans-serif",
//             textAlign: "center",
//             padding: "40px",
//             pageBreakAfter: "always"
//           }}>
//             <div style={{ marginBottom: "30px" }}>
//               <img 
//                 src="/assets/smhLogo.png" 
//                 alt="SMH Logo" 
//                 style={{ 
//                   width: "150px", 
//                   height: "auto", 
//                   maxWidth: "100%"
//                 }} 
//                 onError={(e) => { e.target.style.display = 'none'; }}
//               />
//             </div>
//             <h1 style={{ 
//               fontSize: "36px", 
//               fontWeight: "bold", 
//               marginBottom: "20px",
//               color: "#333",
//               lineHeight: "1.2",
//               maxWidth: "80%",
//               wordWrap: "break-word"
//             }}>
//               {title}
//             </h1>
//             <p style={{ 
//               fontSize: "20px", 
//               color: "#666",
//               marginBottom: "40px"
//             }}>
//               {project?.name || 'Project Name Not Available'}
//             </p>
//             <div style={{ 
//               fontSize: "16px", 
//               color: "#888",
//               borderTop: "1px solid #ddd",
//               paddingTop: "20px",
//               width: "300px"
//             }}>
//               <p style={{ margin: "5px 0" }}>Document Type: {documentType}</p>
//               <p style={{ margin: "5px 0" }}>Version: {latestVersion?.versionNumber || 'N/A'}</p>
//               <p style={{ margin: "5px 0" }}>Generated: {new Date().toLocaleDateString()}</p>
//             </div>
//             </div>

//             <div dangerouslySetInnerHTML={{ __html: footer }} />

//             <div style={{ pageBreakAfter: "always" }} />

//             <h2 style={{ 
//               fontSize: "18px", 
//               fontWeight: "bold", 
//               marginBottom: "20px",
//               borderBottom: "2px solid #333",
//               paddingBottom: "5px"
//             }}>
//               Document Information
//             </h2>

//             <table style={{ 
//               width: "100%", 
//               marginBottom: "30px",
//               borderCollapse: "collapse"
//             }}>
//               <tbody>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold", 
//                     width: "30%",
//                     borderBottom: "1px solid #eee"
//                   }}>Document Type:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{documentType}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Project:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{project?.name || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Created By:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{createdBy?.name || 'Unknown'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Updated By:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{updatedBy?.name || 'Unknown'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Created At:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Updated At:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold",
//                     borderBottom: "1px solid #eee"
//                   }}>Version:</td>
//                   <td style={{ 
//                     padding: "8px",
//                     borderBottom: "1px solid #eee"
//                   }}>{latestVersion?.versionNumber || 'N/A'}</td>
//                 </tr>
//                 <tr>
//                   <td style={{ 
//                     padding: "8px", 
//                     fontWeight: "bold"
//                   }}>Baseline:</td>
//                   <td style={{ 
//                     padding: "8px"
//                   }}>{latestVersion?.isBaselined ? "Yes" : "No"}</td>
//                 </tr>
//               </tbody>
//             </table>

//             <div dangerouslySetInnerHTML={{ __html: footer }} />

//             <div style={{ pageBreakAfter: "always" }} />

//             <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Content</h2>
//             <hr/>
//             <div style={{ fontSize: "12px", marginBottom: 30 }}>
//               <div
//                 dangerouslySetInnerHTML={{
//                   __html: `
//                     <style>
//                       table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin: 20px 0;
//                         font-size: 12px;
//                       }
//                       th, td {
//                         border: 1px solid #ccc;
//                         padding: 8px;
//                         text-align: left;
//                         vertical-align: top;
//                       }
//                       th {
//                         background-color: #f9f9f9;
//                       }
//                       tr {
//                         page-break-inside: avoid;
//                         break-inside: avoid;
//                       }
//                       p { margin: 8px 0; }
//                     </style>
//                     ${content}
//                     ${footer}
//                   `,
//                 }}
//               />
//             </div>

//             <div style={{ pageBreakAfter: "always" }} />

//             <h2>Attachments</h2>
//             <ul>
//               {attachments?.length
//                 ? attachments.map((file, idx) => <li key={idx}>{file.name}</li>)
//                 : <li>None</li>}
//             </ul>

//             <div dangerouslySetInnerHTML={{ __html: footer }} />

//             <div style={{ marginTop: 20 }}>
//               <h3>Version History</h3>
//               <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
//                 <thead>
//                   <tr>
//                     <th>Version</th>
//                     <th>Updated By</th>
//                     <th>Updated At</th>
//                     <th>Baseline</th>
//                     <th>Attachments</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {versions.map((v, i) => (
//                     <tr key={i}>
//                       <td>{v.versionNumber}</td>
//                       <td>{v.updatedBy?.name || "-"}</td>
//                       <td>{new Date(v.updatedAt).toLocaleString()}</td>
//                       <td>{v.isBaselined ? "✅" : "❌"}</td>
//                       <td>{v.attachments?.length || "-"}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div dangerouslySetInnerHTML={{ __html: footer }} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentDetails;

import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import FileViewer from "../components/FileViewer";
import html2pdf from "html2pdf.js";

const DocumentDetails = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef();

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/docs/${id}`);
      setDocument(res.data);
    } catch (err) {
      console.error("Error fetching document", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!document) return <div className="text-center mt-10">Document not found</div>;

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
  } = document;

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;

    const opt = {
      margin: [20, 10],
      filename: `${title.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
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
          pdf.text(`SMH Global Services - '${title}'`, 10, 290);
          pdf.text(`Page ${i}`, 200, 290, null, null, "right");
        }
      })
      .save();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-end mb-4">
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
        <div
          className="prose max-w-full bg-white p-4 rounded border"
          dangerouslySetInnerHTML={{ __html: content }}
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

      {/* Hidden printable content */}
      <div style={{ display: "none" }}>
        <div ref={pdfRef} style={{ backgroundColor: "#fff", fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#000" }}>

          {/* COVER PAGE */}
          <div style={{
            padding: "60px 40px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            color: "#333"
          }}>
            <img
              src="/assets/smhLogo.png"
              alt="SMH Logo"
              style={{ width: "150px", height: "auto", marginBottom: "30px" }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "20px" }}>{title}</h1>
            <p style={{ fontSize: "20px", marginBottom: "40px" }}>{project?.name || 'Project Name Not Available'}</p>
            <div style={{ fontSize: "16px", borderTop: "1px solid #ddd", paddingTop: "20px", width: "300px", margin: "0 auto" }}>
              <p>Document Type: {documentType}</p>
              <p>Version: {latestVersion?.versionNumber || 'N/A'}</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ pageBreakAfter: "always" }} />

          {/* DOCUMENT INFORMATION */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Information</h2>
          <table style={{ width: "100%", marginBottom: "30px", borderCollapse: "collapse" }}>
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

          <div style={{ pageBreakAfter: "always" }} />

          {/* CONTENT */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Document Content</h2>
          <hr />
          <div style={{ fontSize: "12px", marginBottom: 30 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <style>
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 20px 0;
                      font-size: 12px;
                    }
                    th, td {
                      border: 1px solid #ccc;
                      padding: 8px;
                      text-align: left;
                      vertical-align: top;
                    }
                    th {
                      background-color: #f9f9f9;
                    }
                    tr {
                      page-break-inside: avoid;
                      break-inside: avoid;
                    }
                    p { margin: 8px 0; }
                  </style>
                  ${content}
                `,
              }}
            />
          </div>

          <div style={{ pageBreakAfter: "always" }} />

          {/* ATTACHMENTS */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Attachments</h2>
          <ul>
            {attachments?.length
              ? attachments.map((file, idx) => <li key={idx}>{file.name}</li>)
              : <li>None</li>}
          </ul>

          <div style={{ pageBreakAfter: "always" }} />

          {/* VERSION HISTORY */}
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Version History</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} border="1" cellPadding="8" cellSpacing="0">
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
