import React, { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import Card from "./Card.tsx";
import Swal from "sweetalert2"
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Login: React.FC = () => {
  const navigate = useNavigate();


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  async function handleSignup(e){
        e.preventDefault()
        try {
            const requestBody = {email, password, name}
            const response = await axios.post('/auth/signup', requestBody)
            localStorage.setItem('access_token', response.data.access_token)
            navigate('/')
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to sign up",
                text: error.response.data
            });
        }
    }

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });
        if (res.ok) {
          navigate("/secure"); // Redirect to secure page if logged in
        }
      } catch (err) {
        console.error("User not logged in:", err);
      }
    };
    checkUserStatus();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <Card>
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Sign up</h1>
        <div className="flex justify-center mb-4">
          <div className="container" style={{marginTop:"10vh"}}>

            <FormControl variant="standard">
              <TextField onChange={e => {setName(e.target.value)}} id="name" label="Name" variant="standard" required />
              <TextField onChange={e => {setEmail(e.target.value)}} id="email" label="Email" type="email" variant="standard" required />
              <TextField onChange={e => {setPassword(e.target.value)}} id="password" label="Password" type="password" variant="standard" required />
              <Button variant="contained" onClick = {handleSignup}>Signup</Button>
            </FormControl>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
