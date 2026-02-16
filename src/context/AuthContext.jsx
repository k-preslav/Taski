import { createContext, useContext, useState, useEffect } from "react";
import { account } from "../appwrite/config";
import { OAuthProvider } from "appwrite";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    const redirectUrl = `${window.location.origin}/oauth`;
    account.createOAuth2Token(OAuthProvider.Github, redirectUrl, redirectUrl);
  };

  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/oauth`;
    account.createOAuth2Token(OAuthProvider.Google, redirectUrl, redirectUrl);
  };

  const loginAsGuest = async () => {
    await account.createAnonymousSession();
    const currentUser = await account.get();
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginWithGitHub,
    loginWithGoogle,
    loginAsGuest,
    logout,
    checkUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
