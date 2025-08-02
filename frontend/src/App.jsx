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
import PhaseStageMaster from "./pages/LessonLearnedMasters/PhaseStageMaster"
import ImpactMaster from "./pages/LessonLearnedMasters/ImpactMaster"
import LessonsLearnedMaster from "./pages/LessonLearnedMasters/LessonsLearnedMaster"
import RecommendationsMaster from "./pages/LessonLearnedMasters/RecommendationsMaster"
import PrioritySeverityMaster from "./pages/LessonLearnedMasters/PrioritySeverityMaster"
import FrequencyMaster from "./pages/LessonLearnedMasters/FrequencyMaster"
import LessonLearnedForm from "./pages/LessonLearnedRegister"
import LessonLearnedList from "./pages/LessonLearnedList"
import LessonEditPage from "./pages/LessonEditPage"
import LandingPage from "./pages/LandingPage"
import CreateDocument from "./pages/CreateDocument"
import DocumentsList from "./pages/DocumentsList"
import DocumentDetails from "./pages/DocumentDetails"
import DocumentEdit from "./pages/DocumentEditForm"
import Layout from "./components/Layout";

const App = () => {
  return (
    <AuthProvider>
     <Router>
  <Routes>
     <Route path="/" element={<LandingPage />} />
    {/* <Route path="/login" element={<Navigate to="/login" />} /> */}

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

      <Route
      path="/PhaseStageMaster"
      element={
        <ProtectedRoute>
          <Layout><PhaseStageMaster /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/ImpactMaster"
      element={
        <ProtectedRoute>
          <Layout><ImpactMaster /></Layout>
        </ProtectedRoute>
      }
    />

      <Route
      path="/LessonsLearnedMaster"
      element={
        <ProtectedRoute>
          <Layout><LessonsLearnedMaster /></Layout>
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/RecommendationsMaster"
      element={
        <ProtectedRoute>
          <Layout><RecommendationsMaster /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/PrioritySeverityMaster"
      element={
        <ProtectedRoute>
          <Layout><PrioritySeverityMaster /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/FrequencyMaster"
      element={
        <ProtectedRoute>
          <Layout><FrequencyMaster /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/LessonLearnedForm"
      element={
        <ProtectedRoute>
          <Layout><LessonLearnedForm /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/LessonLearnedList"
      element={
        <ProtectedRoute>
          <Layout><LessonLearnedList /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/LessonEditPage/edit/:id"
      element={
        <ProtectedRoute>
          <Layout><LessonEditPage /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/CreateDocument"
      element={
        <ProtectedRoute>
          <Layout><CreateDocument /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/DocumentsList"
      element={
        <ProtectedRoute>
          <Layout><DocumentsList /></Layout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/DocumentDetails/:id"
      element={
        <ProtectedRoute>
          <Layout><DocumentDetails /></Layout>
        </ProtectedRoute>
      }
    />  

    <Route
      path="/DocumentEdit/:id"
      element={
        <ProtectedRoute>
          <Layout><DocumentEdit /></Layout>
        </ProtectedRoute>
      }
    />  

    </Routes>
    
    </Router>

    </AuthProvider>
  );
};

export default App;
