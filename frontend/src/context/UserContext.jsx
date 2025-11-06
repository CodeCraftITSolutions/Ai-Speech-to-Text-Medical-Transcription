import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as api from "../api/client";

const UserContext = createContext();

const normalizeUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.username,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async (token) => {
    const profile = await api.getCurrentUser(token);
    const normalized = normalizeUser(profile);
    setUser(normalized);
    return normalized;
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshTask = (async () => {
      try {
        const response = await api.refreshAccessToken();
        if (response?.access_token) {
          setAccessToken(response.access_token);
          return response.access_token;
        }
        clearSession();
        return null;
      } catch (error) {
        if (error?.status === 401) {
          clearSession();
          return null;
        }
        throw error;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshTask;
    return refreshTask;
  }, [clearSession]);

  const callWithAuth = useCallback(
    async (fn, ...args) => {
      let tokenToUse = accessToken;

      if (!tokenToUse) {
        tokenToUse = await refreshAccessToken();
        if (!tokenToUse) {
          throw Object.assign(new Error("Authentication required"), { status: 401 });
        }
      }

      try {
        return await fn(tokenToUse, ...args);
      } catch (error) {
        if (error?.status === 401) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            clearSession();
            throw error;
          }
          try {
            return await fn(refreshed, ...args);
          } catch (retryError) {
            if (retryError?.status === 401) {
              clearSession();
            }
            throw retryError;
          }
        }
        throw error;
      }
    },
    [accessToken, refreshAccessToken, clearSession]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const tokenFromRefresh = await refreshAccessToken();
        if (!active || !tokenFromRefresh) {
          return;
        }
        await fetchCurrentUser(tokenFromRefresh);
      } catch (error) {
        if (!active) {
          return;
        }
        if (error?.status !== 401) {
          console.error("Failed to restore session", error);
        }
        clearSession();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshAccessToken, fetchCurrentUser, clearSession]);

  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      try {
        const authResponse = await api.login(username, password);
        if (!authResponse?.access_token) {
          throw new Error("No access token returned by server");
        }
        setAccessToken(authResponse.access_token);
        await fetchCurrentUser(authResponse.access_token);
        return authResponse;
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCurrentUser, clearSession]
  );

  const register = useCallback(
    async ({ username, password, role }) => {
      await api.register({ username, password, role });
      await login(username, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    try {
      return await callWithAuth(fetchCurrentUser);
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
      }
      throw error;
    }
  }, [callWithAuth, fetchCurrentUser, clearSession]);

  const value = useMemo(
    () => ({
      user,
      token: accessToken,
      accessToken,
      loading,
      login,
      register,
      logout,
      refreshUser,
      callWithAuth,
      isAuthenticated: Boolean(user && accessToken),
    }),
    [user, accessToken, loading, login, register, logout, refreshUser, callWithAuth]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
