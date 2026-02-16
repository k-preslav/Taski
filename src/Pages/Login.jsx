import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar/TopBar";
import Button from "../components/Button/Button";
import { SiGithub, SiGoogle, SiReact } from "@icons-pack/react-simple-icons";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, loading, loginWithGitHub, loginWithGoogle, loginAsGuest } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/projects");
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    if (isLoading) return;

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed");
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError("");
    setIsLoading(true);
    if (isLoading) return;

    try {
      await loginWithGitHub();
    } catch (err) {
      setError(err.message || "GitHub login failed");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setIsLoading(true);
    if (isLoading) return;

    try {
      await loginAsGuest();
      navigate("/");
    } catch (err) {
      setError(err.message || "Guest login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <TopBar showProjectMenu={false} showAccountIcon={false} />

      <div style={styles.content}>
        <p style={styles.header}>
          Let's get <span style={styles.headerTaski}>Taski</span>
        </p>

        <div style={styles.loginCard}>
          <Button
            textAlign={"left"}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <SiGoogle size={21} />
            <p style={{ fontSize: "1.05rem", transform: "translateY(0.5px)" }}>
              Sign in with Google
            </p>
          </Button>

          <Button
            textAlign={"left"}
            onClick={handleGitHubLogin}
            disabled={isLoading}
          >
            <SiGithub size={21} />
            <p style={{ fontSize: "1.05rem", transform: "translateY(0.5px)" }}>
              Continue with Github
            </p>
          </Button>

          <div style={styles.or}>
            <div style={styles.divider}></div>
            <p style={styles.orText}>or</p>
            <div style={styles.divider}></div>
          </div>

          <p style={styles.guest} onClick={handleGuestLogin}>
            Continue as guest
          </p>
        </div>

        <p style={styles.tos}>
          By using Taski, you agree to our{" "}
          <span style={styles.tosButton}>Terms of Service</span> and{" "}
          <span style={styles.tosButton}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

export default Login;

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#222",
  },
  content: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },

  header: {
    fontSize: "3.5rem",
    fontWeight: "400",
    marginBottom: "6rem",
    color: "#fff",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    userSelect: "none",
  },

  headerTaski: {
    color: "#fff",
    fontWeight: "500",
    fontStyle: "italic",
  },

  loginCard: {
    width: "425px",
    height: "210px",
    padding: "10px",
    borderRadius: "12px",
    backgroundColor: "#282828",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
    textAlign: "center",

    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  or: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    marginTop: "8px",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    userSelect: "none",
  },
  orText: {
    color: "#585858",
  },
  divider: {
    width: "30%",
    height: "1px",
    backgroundColor: "#585858",
  },

  guest: {
    color: "#DADADA",
    fontSize: "14px",
    transform: "translateY(-5px)",
    cursor: "pointer",
    userSelect: "none",
  },

  tos: {
    color: "#686868",
    fontSize: "14px",
    marginTop: "36px",
    width: "240px",
    textAlign: "center",
    lineHeight: "1.5",
  },

  tosButton: {
    color: "#A3A3A3",
    fontSize: "14px",
    textDecoration: "underline",
    cursor: "pointer",
  },
};
