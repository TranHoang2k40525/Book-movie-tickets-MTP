import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshToken, getAccount } from "../../Api/api"; 

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Lỗi tải user:", error);
      }
    };
    loadUser();
  }, []);

  const checkSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        console.warn("No access token found");
        return false;
      }

      // Sử dụng getAccount từ api.js thay vì axios trực tiếp
      await getAccount();
      return true;
    } catch (error) {
      console.error("Lỗi kiểm tra phiên:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return false;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshTokenStored = await AsyncStorage.getItem("refreshToken");
      if (!refreshTokenStored) {
        console.warn("No refresh token found");
        return false;
      }

      // Sử dụng refreshToken từ api.js
      const response = await refreshToken(refreshTokenStored);
      const { accessToken, refreshToken: newRefreshToken } = response;

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
      return true;
    } catch (error) {
      console.error("Lỗi làm mới token:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return false;
    }
  };

  const updateUser = async (newUser) => {
    setUser(newUser);
    if (newUser) {
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, refreshAccessToken, checkSession }}>
      {children}
    </UserContext.Provider>
  );
};