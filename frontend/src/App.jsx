import { BrowserRouter } from "react-router";
// import "./App.css";
import { Routerset } from "./routes/Routerset";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routerset />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
