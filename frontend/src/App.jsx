import { BrowserRouter } from "react-router-dom";
// import "./App.css";
import { Routerset } from "./routes/Routerset";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <Routerset />
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
