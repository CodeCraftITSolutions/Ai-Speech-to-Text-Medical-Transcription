import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as api from "../api/client";

const UserContext = createContext();
const TOKEN_STORAGE_KEY = "medtranscribe_access_token";

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
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
  const skipAutoFetch = useRef(false);

  const loadUser = useCallback(
    async (authToken) => {
      const profile = await api.getCurrentUser(authToken);
      const normalized = normalizeUser(profile);
      setUser(normalized);
      return normalized;
    },
    []
  );

  useEffect(() => {
    let active = true;

    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    if (skipAutoFetch.current) {
      skipAutoFetch.current = false;
      return undefined;
    }

    if (user) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    (async () => {
      try {
        await loadUser(token);
      } catch (error) {
        if (!active) {
          return;
        }
        console.error("Failed to load current user", error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token, user, loadUser]);

  const login = useCallback(
    async (username, password) => {
      setLoading(true);
      try {
        const authResponse = await api.login(username, password);
        skipAutoFetch.current = true;
        localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.access_token);
        setToken(authResponse.access_token);
        await loadUser(authResponse.access_token);
        return authResponse;
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadUser]
  );

  const register = useCallback(
    async ({ username, password, role }) => {
      await api.register({ username, password, role });
      await login(username, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }
    const profile = await loadUser(token);
    return profile;
  }, [token, loadUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
