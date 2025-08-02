// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";
// import { useParams } from "react-router-dom";
// import Modal from "../components/Modal";
// import FileViewer from "../components/FileViewer";

// const DocumentDetails = () => {
//   const { id } = useParams();
//   const [document, setDocument] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [baselineSetting, setBaselineSetting] = useState(false);

//   const fetchDocument = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`/docs/${id}`);
//       setDocument(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching document", err);
//       setLoading(false);
//     }
//   };

//   const handleSetBaseline = async (versionId) => {
//     try {
//       setBaselineSetting(true);
//     //   await axios.put(`/docs/baseline/${versionId}`);
//     await axios.put(`/docs/version/${versionId}/baseline`);

//       await fetchDocument();
//     } catch (err) {
//       console.error("Failed to set baseline", err);
//     } finally {
//       setBaselineSetting(false);
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

//   return (
//     <div className="max-w-6xl mx-auto p-6">
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
//               <th className="border px-4 py-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {versions.map((v) => (
//               <tr key={v.versionNumber}>
//                 <td className="border px-4 py-2 text-center">{v.versionNumber}</td>
//                 <td className="border px-4 py-2">{v.updatedBy?.name || "-"}</td>
//                 <td className="border px-4 py-2">
//                   {new Date(v.updatedAt).toLocaleString()}
//                 </td>
//                 <td className="border px-4 py-2 text-center">
//                   {v.isBaselined ? "✅" : "❌"}
//                 </td>
//                 <td className="border px-4 py-2 text-center">
//                   {v.attachments?.length > 0 ? v.attachments.length : "-"}
//                 </td>
//                 <td className="border px-4 py-2 text-center">
//                   {!v.isBaselined && (
//                     <button
//                       disabled={baselineSetting}
//                       onClick={() => handleSetBaseline(v._id)}
//                       className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
//                     >
//                       Set as Baseline
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DocumentDetails;


import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import FileViewer from "../components/FileViewer";

const DocumentDetails = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
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
    </div>
  );
};

export default DocumentDetails;
