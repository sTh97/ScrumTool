import { useState, useMemo } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const policyRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function ChangePassword({ onClose }) {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const isStrong = useMemo(() => policyRegex.test(form.newPassword), [form.newPassword]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");

    if (!isStrong) {
      setErr("New password must be 8+ chars and include uppercase, number, and special character.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErr("New password and confirmation do not match.");
      return;
    }

    try {
      const res = await axios.patch("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setMsg(res?.data?.message || "Password updated successfully.");
      // Force logout shortly after success
      setTimeout(() => logout(), 1000);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        )}
      </div>

      {msg && <div className="mb-3 rounded bg-green-100 px-3 py-2 text-sm">{msg}</div>}
      {err && <div className="mb-3 rounded bg-red-100 px-3 py-2 text-sm">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          <input
            type="text"
            value={user?.name || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* ⚠️ Keep this enabled to satisfy backend currentPassword check */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="At least 8 chars, uppercase, number, special"
          />
          <div className="mt-1 text-xs">
            <span className={isStrong ? "text-green-600" : "text-gray-500"}>
              Must include: uppercase, number, special character (min 8 chars).
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Re-enter new password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
          disabled={!form.currentPassword || !form.newPassword || !form.confirmPassword || !isStrong}
        >
          Update Password
        </button>
      </form>
    </div>
  );
}


// src/pages/ChangePassword.jsx
// import { useState } from "react";
// import axios from "../api/axiosInstance";
// import { useAuth } from "../context/AuthContext";

// export default function ChangePassword({ onClose }) {
//   const { user, logout } = useAuth();
//   const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const policy = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

//   const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setErr(""); setMsg("");

//     if (!policy.test(form.newPassword)) {
//       setErr("New password must be 8+ chars and include uppercase, number, and special character.");
//       return;
//     }
//     if (form.newPassword !== form.confirmPassword) {
//       setErr("New password and confirmation do not match.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const res = await axios.patch("/users/me/password", {
//         currentPassword: form.currentPassword,
//         newPassword: form.newPassword,
//         confirmPassword: form.confirmPassword,
//       });
//       setMsg(res?.data?.message || "Password updated successfully.");

//       // 🔴 CRITICAL: immediately clear the stale token and kick them to login
//       // This guarantees the next login gets a fresh JWT with the new tokenVersion.
//     //   setTimeout(() => {
//         // logout();          // removes token from localStorage & clears user state
//         // optional: if you want to close a modal first
//         // onClose?.();
//     //   }, 800);
//     // logout right away so the stale token is gone before any more API calls fire
//       logout();
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Failed to change password.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ... render (unchanged), just disable the submit when submitting
//   return (
//     <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
//       {/* ...header & messages... */}
//       <form onSubmit={onSubmit} className="space-y-4">
//         {/* username/email disabled fields ... */}
//         <div>
//           <label className="block text-sm text-gray-600 mb-1">Current Password</label>
//           <input type="password" name="currentPassword" value={form.currentPassword} onChange={onChange} required className="w-full border rounded px-3 py-2" />
//         </div>
//         <div>
//           <label className="block text-sm text-gray-600 mb-1">New Password</label>
//           <input type="password" name="newPassword" value={form.newPassword} onChange={onChange} required className="w-full border rounded px-3 py-2" placeholder="At least 8 chars, uppercase, number, special" />
//         </div>
//         <div>
//           <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
//           <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} required className="w-full border rounded px-3 py-2" />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
//           disabled={submitting}
//         >
//           {submitting ? "Updating…" : "Update Password"}
//         </button>
//       </form>
//     </div>
//   );
// }
