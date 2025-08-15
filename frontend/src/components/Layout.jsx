// File: src/components/Layout.jsx

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangePassword from "../pages/ChangePassword"; //added


const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMasterConfigOpen, setIsMasterConfigOpen] = useState(true);
  const [isLessonLearnedOpen, setIsLessonLearnedOpen] = useState(true);
  const [showChangePwd, setShowChangePwd] = useState(false); //added
  const location = useLocation();
  const timestamp = new Date().toLocaleString();

  const hasPermission = (perm) => {
    // console.log(perm, user)
    return user?.roles?.some((role) => role.permissions.includes("*") || role.permissions.includes(perm));
  };

  const isAdmin = user?.roles?.some(
    (r) => ["Admin", "System Administrator"].includes(r?.name)
  );

  if (!user) return null;
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">ActionLoop</h2>
      <nav className="space-y-2">
        {hasPermission("view_dashboard") && (
                    <Link to="/dashboard" className={linkClass(location.pathname === "/dashboard")}>
                      Dashboard
                    </Link>
        )}
        {/* Master Configuration Collapsible Section */}
        {(hasPermission("manage_roles") || 
          hasPermission("manage_users") || 
          hasPermission("manage_projects") || 
          hasPermission("manage_estimations")|| 
          hasPermission("other_tasks_type") ) && (
          <div className="pt-4">
            <button
              onClick={() => setIsMasterConfigOpen(!isMasterConfigOpen)}
              className="flex items-center justify-between w-full text-left px-2 py-1 text-sm font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <span>Master Configuration</span>
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${
                  isMasterConfigOpen ? 'rotate-90' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isMasterConfigOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-1 ml-6 mt-2">
                {hasPermission("manage_roles") && (
                  <Link to="/roles" className={linkClass(location.pathname === "/roles")}>
                    Role Management
                  </Link>
                )}
                {hasPermission("manage_users") && (
                  <Link to="/users" className={linkClass(location.pathname === "/users")}>
                    User Management
                  </Link>
                )}
                {hasPermission("manage_projects") && (
                  <Link to="/projects" className={linkClass(location.pathname === "/projects")}>
                    Project Management
                  </Link>
                )}
                {hasPermission("manage_estimations") && (
                  <Link to="/estimations" className={linkClass(location.pathname === "/estimations")}>
                    T-Shirt Sizing
                  </Link>
                )}
                {hasPermission("other_tasks_type") && (
                    <Link to="/OtherTaskTypes" className={linkClass(location.pathname === "/OtherTaskTypes")}>
                      Other Task Types
                    </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Learned Masters Collapsible Section */}
        {(hasPermission("phase_stage_master") || 
          hasPermission("impact_master") ||
          hasPermission("lessons_learned_master") ||
          hasPermission("recommendations_master") ||
          hasPermission("priority_severity_master") ||
          hasPermission("frequency_master")) && (
          <div className="pt-4">
            <button
              onClick={() => setIsLessonLearnedOpen(!isLessonLearnedOpen)}
              className="flex items-center justify-between w-full text-left px-2 py-1 text-sm font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <span>Lesson Learned Masters</span>
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${
                  isLessonLearnedOpen ? 'rotate-90' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isLessonLearnedOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-1 ml-6 mt-2">
                {hasPermission("phase_stage_master") && (
                  <Link 
                    to="/phaseStageMaster" 
                    className={linkClass(location.pathname === "/phaseStageMaster")}
                  >
                    Phase Stage List
                  </Link>
                )}
                {hasPermission("impact_master") && (
                  <Link 
                    to="/ImpactMaster" 
                    className={linkClass(location.pathname === "/ImpactMaster")}
                  >
                    Risk Impact List
                  </Link>
                )}
                {hasPermission("lessons_learned_master") && (
                  <Link 
                    to="/LessonsLearnedMaster" 
                    className={linkClass(location.pathname === "/LessonsLearnedMaster")}
                  >
                    Lessons Learned List
                  </Link>
                )}
                {hasPermission("recommendations_master") && (
                  <Link 
                    to="/RecommendationsMaster" 
                    className={linkClass(location.pathname === "/RecommendationsMaster")}
                  >
                    Recommendations List
                  </Link>
                )}
                {hasPermission("priority_severity_master") && (
                  <Link 
                    to="/PrioritySeverityMaster" 
                    className={linkClass(location.pathname === "/PrioritySeverityMaster")}
                  >
                    Priority/Severity List
                  </Link>
                )}
                {hasPermission("frequency_master") && (
                  <Link 
                    to="/FrequencyMaster" 
                    className={linkClass(location.pathname === "/FrequencyMaster")}
                  >
                    Frequency List
                  </Link>
                )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regular Non-Collapsible Items */}
                  {hasPermission("create_document") && (
                    <Link to="/CreateDocument" className={linkClass(location.pathname === "/CreateDocument")}>
                      Create Document
                    </Link>
                  )}
                  {hasPermission("document_list") && (
                    <Link to="/DocumentsList" className={linkClass(location.pathname === "/DocumentsList")}>
                      Documents List
                    </Link>
                  )}
                  
                  {hasPermission("manage_epics") && (
                    <Link to="/epics" className={linkClass(location.pathname === "/epics")}>
                      Epic Management
                    </Link>
                  )}
                  {hasPermission("manage_sprints") && (
                    <Link to="/sprints" className={linkClass(location.pathname === "/sprints")}>
                      Sprint Management
                    </Link>
                  )}
                  {hasPermission("manage_userStories") && (
                    <Link to="/userstories" className={linkClass(location.pathname === "/userstories")}>
                      User Stories
                    </Link>
                  )}
                  {hasPermission("manage_sprintassignment") && (
                    <Link to="/sprintassignment" className={linkClass(location.pathname === "/sprintassignment")}>
                      Sprint Assignment
                    </Link>
                  )}
                  {hasPermission("manage_sprintdetailview") && (
                    <Link to="/sprintdetailview" className={linkClass(location.pathname === "/sprintdetailview")}>
                      Sprint Detail View
                    </Link>
                  )}
                  {hasPermission("manage_tasks") && (
                    <Link to="/tasklist" className={linkClass(location.pathname === "/tasklist")}>
                      Tasks List View
                    </Link>
                  )}
                  {hasPermission("lesson_learned") && (
                    <Link to="/LessonLearnedForm" className={linkClass(location.pathname === "/LessonLearnedForm")}>
                      Lesson Learn Register
                    </Link>
                  )}
                  {hasPermission("lesson_learned_List") && (
                    <Link to="/LessonLearnedList" className={linkClass(location.pathname === "/LessonLearnedList")}>
                      Lesson Learn List
                    </Link>
                  )}
                  {hasPermission("other_tasks_list") && (
                    <Link to="/OtherTasksList" className={linkClass(location.pathname === "/OtherTasksList")}>
                      Other Tasks List
                    </Link>
                  )}
      </nav>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <span className="text-xl font-semibold">Welcome, {user?.name}</span>
          <div className="flex items-center gap-2">
            {/* Show Change Password for non-admins (optional; backend already enforces) */}
            {!isAdmin && (
              <button
                onClick={() => setShowChangePwd(true)}
                className="bg-gray-900 text-white px-4 py-1 rounded"
              >
                Change Password
              </button>
            )}
            <button onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
          </div>  
        </header>

        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>

        <footer className="bg-white p-4 text-center border-t text-sm text-gray-500">
          Last updated: {timestamp}
        </footer>
      </div>
       {/* Modal */}
      {showChangePwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowChangePwd(false)}
          />
          {/* content */}
          <div className="relative z-10">
            <ChangePassword onClose={() => setShowChangePwd(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const linkClass = (active) =>
  `block px-3 py-2 rounded hover:bg-gray-700 ${active ? "bg-gray-700 font-semibold" : ""}`;

export default Layout;