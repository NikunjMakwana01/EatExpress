import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_FAIL":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
      localStorage.setItem("token", state.token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [state.token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const res = await api.get("/auth/me");
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: res.data.data,
              token: state.token,
            },
          });
        } catch (error) {
          dispatch({
            type: "AUTH_FAIL",
            payload: error.response?.data?.error || "Authentication failed",
          });
        }
      } else {
        dispatch({ type: "AUTH_FAIL", payload: null });
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    dispatch({ type: "AUTH_START" });

    try {
      const res = await api.post("/auth/register", userData);

      // dispatch({
      //   type: "AUTH_SUCCESS",
      //   payload: {
      //     user: res.data.user,
      //     token: res.data.token,
      //   },
      // });
      // console.log("Registration response:", res.data);
      // toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      dispatch({ type: "AUTH_FAIL", payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (email, password) => {
    dispatch({ type: "AUTH_START" });

    try {
      const res = await api.post("/auth/login", { email, password });

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: res.data.user,
          token: res.data.token,
        },
      });

      return { success: true, user: res.data.user };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      dispatch({ type: "AUTH_FAIL", payload: message });
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: "LOGOUT" });
    toast.info("Logged out successfully");
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await api.put("/auth/updatedetails", userData);
      dispatch({ type: "UPDATE_USER", payload: res.data.data });
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Profile update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
