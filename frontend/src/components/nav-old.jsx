<nav className="space-y-2">
          <Link to="/dashboard" className={linkClass(location.pathname === "/dashboard")}>Dashboard</Link>
          {hasPermission("manage_roles") && (
            <Link to="/roles" className={linkClass(location.pathname === "/roles")}>Role Management</Link>
          )}
          {hasPermission("manage_users") && (
            <Link to="/users" className={linkClass(location.pathname === "/users")}>User Management</Link>
          )}
          {hasPermission("manage_projects") && (
            <Link to="/projects" className={linkClass(location.pathname === "/projects")}>Project Management</Link>
          )}
          {hasPermission("manage_epics") && (
            <Link to="/epics" className={linkClass(location.pathname === "/epics")}>
              Epic Management
            </Link>
          )}
          {hasPermission("manage_sprints") && (
            <Link to="/sprints" className={linkClass(location.pathname === "/sprints")}>Sprint Management</Link>
          )}
          {hasPermission("manage_estimations") && (
            <Link to="/estimations" className={linkClass(location.pathname === "/estimations")}>T-Shirt Sizing</Link>
          )}
          {hasPermission("manage_userStories") && (
            <Link to="/userstories" className={linkClass(location.pathname === "/userstories")}>User Stories</Link>
          )}
           {hasPermission("manage_sprintassignment") && (
            <Link to="/sprintassignment" className={linkClass(location.pathname === "/sprintassignment")}>Sprint Assignment</Link>
          )}
          {hasPermission("manage_sprintdetailview") && (
            <Link to="/sprintdetailview" className={linkClass(location.pathname === "/sprintdetailview")}>Sprint Detail View</Link>
          )}
           {hasPermission("manage_tasks") && (
            <Link to="/tasklist" className={linkClass(location.pathname === "/tasklist")}>Tasks List View</Link>
          )}
          {(hasPermission("phase_stage_master") 
          || hasPermission("impact_master")
          || hasPermission("lessons_learned_master")
          || hasPermission("recommendations_master")
          || hasPermission("priority_severity_master")
          || hasPermission("frequency_master")          
        ) 
          && (
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
          
          {/* Collapsible Content with Animation */}
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
        {hasPermission("lesson_learned") && (
            <Link to="/LessonLearnedForm" className={linkClass(location.pathname === "/LessonLearnedForm")}>Lesson Learn Register</Link>
        )}
        {hasPermission("lesson_learned_List") && (
            <Link to="/LessonLearnedList" className={linkClass(location.pathname === "/LessonLearnedList")}>Lesson Learn List</Link>
        )}

        </nav>