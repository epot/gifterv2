import React, { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Swal from "sweetalert2"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
    name: Yup.string().required('Name is required'),
    password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();

  async function handleSignup(values: any){
        try {
            const response = await axios.post('/auth/signup', values)
            localStorage.setItem('access_token', response.data.access_token)
            navigate('/')
        } catch (error: any) {
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
          navigate("/events"); // Redirect to secure page if logged in
        }
      } catch (err) {
        console.error("User not logged in:", err);
      }
    };
    checkUserStatus();
  }, [navigate]);

  return (
    <Container>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Sign up
          </Typography>
        </CardContent>
        <CardActions>
          <Formik
              initialValues={{email: '', name: '', password: ''}}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
          >
              {({
                    handleSubmit,
                    touched,
                    errors,
                    handleChange,
                    handleBlur
                }) => (
                  <Form onSubmit={handleSubmit}>
                      <TextField
                          label="Name"
                          variant="outlined"
                          name="name"
                          fullWidth
                          required
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                          sx={{mb: 2}}
                      />
                      <TextField
                          label="Email"
                          variant="outlined"
                          name="email"
                          fullWidth
                          required
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          sx={{mb: 2}}
                      />
                      <TextField
                          label="Password"
                          variant="outlined"
                          name="password"
                          type="password"
                          fullWidth
                          required
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                          sx={{mb: 2}}
                      />
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                          Sign up
                      </Button>
                  </Form>
              )}
            </Formik>
          </CardActions>
      </Card>
    </Container>
  );
};

export default Login;
