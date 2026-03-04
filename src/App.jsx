import { Routes, Route } from "react-router-dom";
import Project from "./Pages/Project";
import Login from "./Pages/Login/Login";
import OAuthCallback from "./Pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import Projects from "./Pages/Projects/Projects";
import LandingPage from "./Pages/LandingPage/LandingPage";
import AccountSettings from "./Pages/AccountSettings";
import TermsOfService from "./Pages/TermsOfService";
import PrivacyPolicy from "./Pages/PrivacyPolicy";

import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/oauth" element={<OAuthCallback />} />
      <Route path="/tos" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/project/:id" element={<Project />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accountSettings"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
