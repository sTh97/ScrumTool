import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleManagement from "./pages/RoleManagement";
import UserManagement from "./pages/UserManagement";
import ProjectManagement from "./pages/ProjectManagement"
import EpicManagement from "./pages/EpicManagement";
import SprintManagement from "./pages/SprintManagement";
import EstimationManagement from "./pages/EstimationManagement";
import UserStoryManagement from "./pages/UserStoryManagement";
import SprintAssignment from "./pages/SprintAssignment";
import SprintDetailsView from "./pages/SprintDetailsView";
import SprintDetails from "./pages/SprintDetails";
import TaskList from "./pages/TaskList";
import Layout from "./components/Layout";

const App = () => {
  return (
    <AuthProvider>
     <Router>
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />

    <Route path="/login" element={<LoginPage />} />

    <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout><DashboardPage /></Layout>
    </ProtectedRoute>
  }
/>

    <Route
      path="/roles"
      element={
        <ProtectedRoute>
          <Layout><RoleManagement /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/users"
      element={
        <ProtectedRoute>
          <Layout><UserManagement /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects"
      element={
        <ProtectedRoute>
          <Layout><ProjectManagement /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/epics"
      element={
        <ProtectedRoute>
          <Layout><EpicManagement /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/sprints"
      element={
        <ProtectedRoute>
          <Layout><SprintManagement /></Layout>
        </ProtectedRoute>
      }
    />

     <Route
      path="/estimations"
      element={
        <ProtectedRoute>
          <Layout><EstimationManagement /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/userstories"
      element={
        <ProtectedRoute>
          <Layout><UserStoryManagement /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/sprintassignment"
      element={
        <ProtectedRoute>
          <Layout><SprintAssignment /></Layout>
        </ProtectedRoute>
      }
    />

       <Route
      path="/sprintdetailview"
      element={
        <ProtectedRoute>
          <Layout><SprintDetailsView /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/sprint/:sprintId/details"
      element={
        <ProtectedRoute>
          <Layout><SprintDetails /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/tasklist"
      element={
        <ProtectedRoute>
          <Layout><TaskList /></Layout>
        </ProtectedRoute>
      }
    />

    </Routes>
    
    </Router>

    </AuthProvider>
  );
};

export default App;
