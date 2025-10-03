import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Secure from "./components/Secure";
import NewEvent from "./components/NewEvent";
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/secure" element={<Secure />} />
        <Route path="/events/new" element={<NewEvent />} />
      </Routes>
    </Router>
  );
}

export default App;
