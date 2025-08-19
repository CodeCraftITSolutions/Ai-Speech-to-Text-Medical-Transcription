import { createContext, useContext, useState } from "react";

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Rifab Ahamed",
    role: "doctor", // doctor | transcriptionist | admin
    specialty: "Cardiology", // optional for doctors
  });

  // You can update user anywhere in app with setUser
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useUser = () => {
  return useContext(UserContext);
};
