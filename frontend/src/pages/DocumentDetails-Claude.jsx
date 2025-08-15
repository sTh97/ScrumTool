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
      margin: [15, 15, 20, 15], // top, left, bottom, right in mm
      filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, "_")}.pdf`,
      image: { 
        type: "jpeg", 
        quality: 0.95 
      },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait",
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['tr', '.avoid-break']
      },
      enableLinks: false
    };

    html2pdf()
      .set(opt)
      .from(pdfRef.current)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        
        // Add page numbers to all pages except the first (cover page)
        for (let i = 2; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`Page ${i}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
          pdf.text(`SMH Global Services - ${title}`, 15, pdf.internal.pageSize.getHeight() - 10);
        }
      })
      .save();
  };

  // Function to sanitize HTML content for better PDF rendering
  const sanitizeContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Remove problematic styles and attributes
    let sanitized = htmlContent
      .replace(/style\s*=\s*"[^"]*"/gi, '') // Remove inline styles
      .replace(/class\s*=\s*"[^"]*"/gi, '') // Remove classes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // Remove iframes
    
    return sanitized;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          disabled={loading}
        >
          Download as PDF
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><strong>Document Type:</strong> {documentType}</div>
        <div><strong>Project:</strong> {project?.name || 'N/A'}</div>
        <div><strong>Created By:</strong> {createdBy?.name || 'Unknown'}</div>
        <div><strong>Updated By:</strong> {updatedBy?.name || 'Unknown'}</div>
        <div><strong>Created At:</strong> {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}</div>
        <div><strong>Updated At:</strong> {updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}</div>
        <div><strong>Version:</strong> {latestVersion?.versionNumber || 'N/A'}</div>
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
            {versions?.map((v, index) => (
              <tr key={v.versionNumber || index} className="avoid-break">
                <td className="border px-4 py-2 text-center">{v.versionNumber}</td>
                <td className="border px-4 py-2">{v.updatedBy?.name || "-"}</td>
                <td className="border px-4 py-2">{v.updatedAt ? new Date(v.updatedAt).toLocaleString() : '-'}</td>
                <td className="border px-4 py-2 text-center">{v.isBaselined ? "✅" : "❌"}</td>
                <td className="border px-4 py-2 text-center">{v.attachments?.length || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden PDF Content */}
      <div style={{ display: "none" }}>
        <div ref={pdfRef} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
          {/* COVER PAGE */}
          <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            backgroundColor: "#f8f9fa", 
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            padding: "40px",
            pageBreakAfter: "always"
          }}>
            <div style={{ marginBottom: "30px" }}>
              <img 
                src="/smhLogo.png" 
                alt="SMH Logo" 
                style={{ 
                  width: "150px", 
                  height: "auto", 
                  maxWidth: "100%"
                }} 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
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
              paddingTop: "20px",
              width: "300px"
            }}>
              <p style={{ margin: "5px 0" }}>Document Type: {documentType}</p>
              <p style={{ margin: "5px 0" }}>Version: {latestVersion?.versionNumber || 'N/A'}</p>
              <p style={{ margin: "5px 0" }}>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* DOCUMENT DETAILS PAGE */}
          <div style={{ 
            padding: "30px", 
            fontFamily: "Arial, sans-serif", 
            fontSize: "12px",
            lineHeight: "1.4",
            color: "#333"
          }}>
            <h2 style={{ 
              fontSize: "18px", 
              fontWeight: "bold", 
              marginBottom: "20px",
              borderBottom: "2px solid #333",
              paddingBottom: "5px"
            }}>
              Document Information
            </h2>

            <table style={{ 
              width: "100%", 
              marginBottom: "30px",
              borderCollapse: "collapse"
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold", 
                    width: "30%",
                    borderBottom: "1px solid #eee"
                  }}>Document Type:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{documentType}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Project:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{project?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Created By:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{createdBy?.name || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Updated By:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{updatedBy?.name || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Created At:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Updated At:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee"
                  }}>Version:</td>
                  <td style={{ 
                    padding: "8px",
                    borderBottom: "1px solid #eee"
                  }}>{latestVersion?.versionNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    padding: "8px", 
                    fontWeight: "bold"
                  }}>Baseline:</td>
                  <td style={{ 
                    padding: "8px"
                  }}>{latestVersion?.isBaselined ? "Yes" : "No"}</td>
                </tr>
              </tbody>
            </table>

            <div className="page-break-before">
              <h2 style={{ 
                fontSize: "18px", 
                fontWeight: "bold", 
                marginBottom: "15px",
                borderBottom: "2px solid #333",
                paddingBottom: "5px"
              }}>
                Document Content
              </h2>
              <div 
                style={{ 
                  marginBottom: "30px", 
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "11px",
                  lineHeight: "1.6"
                }}
                dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }} 
              />
            </div>

            <div className="page-break-before">
              <h2 style={{ 
                fontSize: "18px", 
                fontWeight: "bold", 
                marginBottom: "15px",
                borderBottom: "2px solid #333",
                paddingBottom: "5px"
              }}>
                Attachments
              </h2>
              {attachments?.length > 0 ? (
                <ul style={{ 
                  marginBottom: "30px",
                  paddingLeft: "20px"
                }}>
                  {attachments.map((file, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: "5px",
                      fontSize: "11px"
                    }}>
                      {file.name} {file.size && `(${(file.size / 1024).toFixed(1)} KB)`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ 
                  fontStyle: "italic", 
                  color: "#666",
                  marginBottom: "30px"
                }}>
                  No attachments available
                </p>
              )}
            </div>

            <div className="page-break-before">
              <h2 style={{ 
                fontSize: "18px", 
                fontWeight: "bold", 
                marginBottom: "15px",
                borderBottom: "2px solid #333",
                paddingBottom: "5px"
              }}>
                Version History
              </h2>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "10px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ 
                      border: "1px solid #333", 
                      padding: "8px", 
                      textAlign: "center",
                      fontWeight: "bold"
                    }}>Version</th>
                    <th style={{ 
                      border: "1px solid #333", 
                      padding: "8px",
                      fontWeight: "bold"
                    }}>Updated By</th>
                    <th style={{ 
                      border: "1px solid #333", 
                      padding: "8px",
                      fontWeight: "bold"
                    }}>Updated At</th>
                    <th style={{ 
                      border: "1px solid #333", 
                      padding: "8px", 
                      textAlign: "center",
                      fontWeight: "bold"
                    }}>Baseline</th>
                    <th style={{ 
                      border: "1px solid #333", 
                      padding: "8px", 
                      textAlign: "center",
                      fontWeight: "bold"
                    }}>Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {versions?.map((v, i) => (
                    <tr key={i} className="avoid-break">
                      <td style={{ 
                        border: "1px solid #333", 
                        padding: "6px", 
                        textAlign: "center"
                      }}>{v.versionNumber}</td>
                      <td style={{ 
                        border: "1px solid #333", 
                        padding: "6px"
                      }}>{v.updatedBy?.name || "-"}</td>
                      <td style={{ 
                        border: "1px solid #333", 
                        padding: "6px"
                      }}>{v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : '-'}</td>
                      <td style={{ 
                        border: "1px solid #333", 
                        padding: "6px", 
                        textAlign: "center"
                      }}>{v.isBaselined ? "Yes" : "No"}</td>
                      <td style={{ 
                        border: "1px solid #333", 
                        padding: "6px", 
                        textAlign: "center"
                      }}>{v.attachments?.length || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;