import { BrowserRouter } from "react-router-dom";
// import "./App.css";
//new commit tested
//forked repo changes made
import { Routerset } from "./routes/Routerset";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext.jsx";

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
