import React, { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import Card from "./Card.tsx";
import Swal from "sweetalert2"
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

const Login: React.FC = () => {
  const navigate = useNavigate();


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e){
        e.preventDefault()
        try {
            const requestBody = {email, password}
            const response = await axios.post('/auth/login', requestBody)
            localStorage.setItem('access_token', response.data.access_token)
            navigate('/')
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to login",
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
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Welcome to this awesome application</h1>
        <p className="text-gray-600 text-center mb-6">
          Log in please. It's quick and easy!
        </p>
        <div className="flex justify-center mb-4">
          <div className="container" style={{marginTop:"10vh"}}>
            <FormControl variant="standard">
              <TextField onChange={e => {setEmail(e.target.value)}} id="email" label="Email" type="email" variant="standard" required />
              <TextField onChange={e => {setPassword(e.target.value)}} id="password" label="Password" type="password" variant="standard" required />
              <Button variant="contained" onClick = {handleLogin}>Login</Button>
              <p style={{marginTop:"2vh"}}>Don't have an account? <Link href={'/signup'}>Create an account</Link></p>
            </FormControl>
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <a
            href="/auth?provider=google"
            className="flex items-center gap-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            <span className="text-sm font-semibold">Sign in with Google</span>
          </a>
        </div>
        <div className="text-center mt-auto">
          <p className="text-sm text-gray-500">
            By logging in, you agree to our{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
