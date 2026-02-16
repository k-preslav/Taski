import { Routes, Route } from "react-router-dom";
import Project from "./Pages/Project";
import Login from "./Pages/Login";
import OAuthCallback from "./Pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import Projects from "./Pages/Projects";
import HomePage from "./Pages/Homepage";
import AccountSettings from "./Pages/AccountSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/oauth" element={<OAuthCallback />} />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        }
      />
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
