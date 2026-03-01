import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { account } from "../appwrite/config";

function OAuthCallback() {
  const navigate = useNavigate();
  const { checkUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const secret = urlParams.get("secret");

        if (!userId || !secret) {
          throw new Error("Missing OAuth credentials");
        }

        // Create session from OAuth token
        await account.createSession(userId, secret);

        // Check user and update context
        await checkUser();

        // Redirect to home
        navigate("/projects");
      } catch {}
    };

    handleOAuthCallback();
  }, [navigate, checkUser]);

  if (error) {
    return;
  }

  return;
}

export default OAuthCallback;
