import { createContext, useContext, useState, useEffect } from "react";
import { account, tablesDB } from "../appwrite/config"; 
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

  const syncUserProfile = async (currentUser) => {
    if (!currentUser) return;

    try {
      await tablesDB.getRow({
        databaseId: "taski",
        tableId: "accounts",
        rowId: currentUser.$id,
      });
    } catch (error) {
      if (error.code === 404) {
        try {
          await tablesDB.createRow({
            databaseId: "taski", 
            tableId: "accounts",
            rowId: currentUser.$id, 
            data: {
              name: currentUser.name || "Guest User",
              isAnon: currentUser.name == '' ? true : false,
            }
          });
        } catch (createError) {
          if (createError.code !== 409) {
            console.error(createError);
          }
        }
      } else {
        console.error(error);
      }
    }
  };

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      
      await syncUserProfile(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    const redirectUrl = `${window.location.origin}/oauth`;
    account.createOAuth2Token({provider: OAuthProvider.Github, success: redirectUrl, failure: redirectUrl});
  };

  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/oauth`;
    account.createOAuth2Token({provider: OAuthProvider.Google, success: redirectUrl, failure: redirectUrl});
  };

  const loginAsGuest = async () => {
    await account.createAnonymousSession();
    const currentUser = await account.get();
    setUser(currentUser);
    
    await syncUserProfile(currentUser);
    return currentUser;
  };

  const logout = async () => {
    await account.deleteSession({ sessionId: "current" });
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