import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/TopBar/TopBar";
import Button from "../../components/Button/Button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import GithubIcon from "../../components/GithubIcon";
import Spinner from "../../components/Spinner/Spinner";
import "./Login.css";

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
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed");
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      await loginWithGitHub();
    } catch (err) {
      setError(err.message || "GitHub login failed");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      await loginAsGuest();
      navigate("/projects");
    } catch (err) {
      setError(err.message || "Guest login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <TopBar showProjectMenu={false} showAccountIcon={false} />

      <div className="login-content">
        <p className="login-header">
          Let's get <span className="login-header-taski">Taski</span>
        </p>

        <div className="login-card">
          {isLoading ? (
            <div className="login-spinner-wrapper">
              <Spinner size={32} color="var(--text-muted)" />
            </div>
          ) : (
            <>
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

              <div className="login-or">
                <div className="login-divider"></div>
                <p className="login-or-text">or</p>
                <div className="login-divider"></div>
              </div>

              <p className="login-guest-btn" onClick={handleGuestLogin}>
                Continue as guest
              </p>
            </>
          )}
        </div>

        {error && <p className="login-error-text">{error}</p>}

        <p className="login-tos">
          By using Taski, you agree to our{" "}
          <span className="login-tos-button">Terms of Service</span> and{" "}
          <span className="login-tos-button">Privacy Policy</span>.
        </p>
      </div>

      <GithubIcon />
    </div>
  );
}

export default Login;