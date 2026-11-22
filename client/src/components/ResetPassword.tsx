import React, { useEffect } from "react";
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
});

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  async function handleResetPassword(values: any){
        try {
            await axios.post('/auth/reset-password', values)
            Swal.fire({
                icon: "info",
                title: "Email sent",
                text: "If there is an email account associated to this account, an email has been sent. Check your inbox and follow the intructions."
            });
            navigate('/')
        } catch (error: any) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to reset password",
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
            Reset your password
          </Typography>
        </CardContent>
        <CardActions>
          <Formik
              initialValues={{email: '', name: '', password: ''}}
              validationSchema={validationSchema}
              onSubmit={handleResetPassword}
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
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                          Send email
                      </Button>
                  </Form>
              )}
            </Formik>
          </CardActions>
      </Card>
    </Container>
  );
};

export default ResetPassword;
