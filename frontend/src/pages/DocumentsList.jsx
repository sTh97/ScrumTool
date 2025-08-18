// // src/pages/DocumentsList.jsx
// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";
// import { Link } from "react-router-dom";

// const DocumentsList = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         const res = await axios.get("/docs", {
//           params: { page, search, sortBy, sortOrder },
//         });
//         setDocuments(res.data.documents || []);
//         setTotalPages(res.data.totalPages || 1);
//       } catch (err) {
//         console.error("Failed to fetch documents", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDocuments();
//   }, [page, search, sortBy, sortOrder]);

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortBy(field);
//       setSortOrder("asc");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Documents</h2>
//       <input
//         type="text"
//         placeholder="Search by title, type, or project"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="border px-3 py-2 rounded w-full mb-4"
//       />

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full table-auto border border-gray-300">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   ["Title", "title"],
//                   ["Type", "documentType"],
//                   ["Project", "projectId.name"],
//                   ["Created By", "createdBy.name"],
//                   ["Updated By", "latestVersion.updatedBy.name"],
//                   ["Updated Date", "latestVersion.updatedAt"],
//                   ["Created Date", "createdAt"],
//                 ].map(([label, field]) => (
//                   <th
//                     key={field}
//                     className="px-3 py-2 cursor-pointer"
//                     onClick={() => handleSort(field)}
//                   >
//                     {label} {sortBy === field ? (sortOrder === "asc" ? "▲" : "▼") : ""}
//                   </th>
//                 ))}
//                 <th className="px-3 py-2">Is Baselined</th>
//                 <th className="px-3 py-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {documents?.length > 0 ? (
//                 documents.map((doc) => (
//                   <tr key={doc._id} className="border-t">
//                     <td className="px-3 py-2">{doc.title}</td>
//                     <td className="px-3 py-2">{doc.documentType}</td>
//                     <td className="px-3 py-2">{doc.projectId?.name}</td>
//                     <td className="px-3 py-2">{doc.createdBy?.name}</td>
//                     <td className="px-3 py-2">{doc.latestVersion?.updatedBy?.name}</td>
//                     <td className="px-3 py-2">
//                       {doc.latestVersion?.updatedAt ? new Date(doc.latestVersion.updatedAt).toLocaleString() : "-"}
//                     </td>
//                     <td className="px-3 py-2">
//                       {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "-"}
//                     </td>
//                     <td className="px-3 py-2 text-center">
//                       {doc.latestVersion?.isBaselined ? (
//                         <span className="text-green-600 font-semibold">Yes</span>
//                       ) : (
//                         <span className="text-gray-500">No</span>
//                       )}
//                     </td>
//                     <td className="px-3 py-2 text-sm">
//                       <Link
//                         to={`/DocumentDetails/${doc._id}`}
//                         className="text-blue-600 hover:underline"
//                       >
//                         View |
//                       </Link>
//                       <Link
//                         to={`/DocumentEdit/${doc._id}`}
//                         className="text-green-600 hover:underline"
//                       >
//                         | Update
//                       </Link>
//                       {/* <button
//                         onClick={() => handleDelete(doc._id)}
//                         className="text-red-600 hover:underline"
//                       >
//                         Delete
//                       </button> */}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center py-4">
//                     No documents found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="flex justify-between mt-4">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Prev
//             </button>
//             <span className="px-4">Page {page} of {totalPages}</span>
//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentsList;

//***********************Undo Below************************* */


// import React, { useEffect, useState } from "react";
// import axios from "../api/axiosInstance";
// import { Link } from "react-router-dom";

// const DocumentsList = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [error, setError] = useState("");

//   const fetchDocuments = async () => {
//     setError("");
//     try {
//       const res = await axios.get("/docs", {
//         params: { page, search, sortBy, sortOrder },
//       });
//       setDocuments(res.data.documents || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch (err) {
//       console.error("Failed to fetch documents", err);
//       setError("Failed to fetch documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocuments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, search, sortBy, sortOrder]);

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortBy(field);
//       setSortOrder("asc");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Documents</h2>

//       <div className="flex items-center gap-3 mb-4">
//         <input
//           type="text"
//           placeholder="Search by title or type"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border px-3 py-2 rounded w-full"
//         />
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="text-red-600">{error}</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full table-auto border border-gray-300">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   ["Title", "title"],
//                   ["Type", "documentType"],
//                   ["Project", "projectId.name"],
//                   ["Created By", "createdBy.name"],
//                   ["Updated By", "latestVersion.updatedBy.name"],
//                   ["Updated Date", "latestVersion.updatedAt"],
//                   ["Created Date", "createdAt"],
//                 ].map(([label, field]) => (
//                   <th
//                     key={field}
//                     className="px-3 py-2 cursor-pointer"
//                     onClick={() => handleSort(field)}
//                   >
//                     {label} {sortBy === field ? (sortOrder === "asc" ? "▲" : "▼") : ""}
//                   </th>
//                 ))}
//                 <th className="px-3 py-2">Is Baselined</th>
//                 <th className="px-3 py-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {documents?.length > 0 ? (
//                 documents.map((doc) => (
//                   <tr key={doc._id} className="border-t">
//                     <td className="px-3 py-2">{doc.title}</td>
//                     <td className="px-3 py-2">{doc.documentType}</td>
//                     <td className="px-3 py-2">{doc.projectId?.name}</td>
//                     <td className="px-3 py-2">{doc.createdBy?.name}</td>
//                     <td className="px-3 py-2">{doc.latestVersion?.updatedBy?.name}</td>
//                     <td className="px-3 py-2">
//                       {doc.latestVersion?.updatedAt ? new Date(doc.latestVersion.updatedAt).toLocaleString() : "-"}
//                     </td>
//                     <td className="px-3 py-2">
//                       {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "-"}
//                     </td>
//                     <td className="px-3 py-2 text-center">
//                       {doc.latestVersion?.isBaselined ? (
//                         <span className="text-green-600 font-semibold">Yes</span>
//                       ) : (
//                         <span className="text-gray-500">No</span>
//                       )}
//                     </td>
//                     <td className="px-3 py-2 text-sm">
//                       <Link
//                         to={`/DocumentDetails/${doc._id}`}
//                         className="text-blue-600 hover:underline"
//                       >
//                         View
//                       </Link>
//                       <span className="px-1">|</span>
//                       <Link
//                         to={`/DocumentEdit/${doc._id}`}
//                         className="text-green-600 hover:underline"
//                       >
//                         Update
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center py-4">
//                     No documents found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           <div className="flex justify-between mt-4">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Prev
//             </button>
//             <span className="px-4">Page {page} of {totalPages}</span>
//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentsList;

//***********************Undo from line 162************************* */


import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Link } from "react-router-dom";

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    setError("");
    try {
      const res = await axios.get("/docs", {
        params: { page, search, sortBy, sortOrder },
      });
      setDocuments(res.data.documents || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      setError("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <input
        type="text"
        placeholder="Search by title or type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                {[
                  ["Title", "title"],
                  ["Type", "documentType"],
                  ["Project", "projectId.name"],
                  ["Created By", "createdBy.name"],
                  ["Active By", "updatedBy.name"], // who last changed active snapshot
                  ["Active Updated", "updatedAt"],  // when doc snapshot changed
                  ["Created Date", "createdAt"],
                ].map(([label, field]) => (
                  <th
                    key={field}
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    {label} {sortBy === field ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
                <th className="px-3 py-2">Active Baselined</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents?.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc._id} className="border-t">
                    <td className="px-3 py-2">{doc.title}</td>
                    <td className="px-3 py-2">{doc.documentType}</td>
                    <td className="px-3 py-2">{doc.projectId?.name}</td>
                    <td className="px-3 py-2">{doc.createdBy?.name}</td>
                    <td className="px-3 py-2">{doc.updatedBy?.name}</td>
                    <td className="px-3 py-2">{doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2">{doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2 text-center">
                      {doc.activeVersion?.isBaselined ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <Link to={`/DocumentDetails/${doc._id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                      <span className="px-1">|</span>
                      <Link to={`/DocumentEdit/${doc._id}`} className="text-green-600 hover:underline">
                        Update
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
