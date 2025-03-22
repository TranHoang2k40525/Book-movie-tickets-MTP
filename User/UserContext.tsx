import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext({
  user: null,
  login: () => {
    console.error("Hàm login không được cung cấp. Đảm bảo rằng bạn đang sử dụng UserProvider.");
  },
  logout: () => {
    console.error("Hàm logout không được cung cấp. Đảm bảo rằng bạn đang sử dụng UserProvider.");
  },
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Lỗi khi tải thông tin người dùng:", e);
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};