import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import MainEvents from "./components/MainEvents";
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events/*" element={<MainEvents />} />
      </Routes>
    </Router>
  );
}

export default App;
