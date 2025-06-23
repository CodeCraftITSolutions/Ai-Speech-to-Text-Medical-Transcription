import { BrowserRouter } from "react-router";
import "./App.css";
import { Routerset } from "./routes/Routerset";

function App() {
  return (
    <BrowserRouter>
      <Routerset />
    </BrowserRouter>
  );
}

export default App;
