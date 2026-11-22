import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import MainEvents from "./components/MainEvents";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/events/*" element={<MainEvents />} />
      </Routes>
    </Router>
  );
}

export default App;
