import React, { createContext, useState } from "react";

export const LanguageContext = createContext({
  language: "vi",
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi");
  const toggleLanguage = () => setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
