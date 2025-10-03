import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import dayjs, { Dayjs } from 'dayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import axios from "axios"
import Swal from "sweetalert2"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
   // date: Yup.date().required('Date is required'),
});

const Secure: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = React.useState<Dayjs | null>(dayjs('2025-12-25'));

  const fetchUserDetails = async () => {
    try {
      const res = await fetch("/api/user", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      await res.json();
    } catch (err) {
      console.error("Error fetching user:src/components/NewGift.tsx:76", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  async function handleCreate(values: any){
    try {
        values.date = date
        await axios.post('/api/events/create', values)
        navigate('/events')
    } catch (error: any) {
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "Failed to create event",
            text: error.response.data
        });
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, [navigate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Card>
          <CardActions>
            <Grid container spacing={1} >
              <Grid size={12}>
                <Formik
                    initialValues={{name: '', date:''}}
                    validationSchema={validationSchema}
                    onSubmit={handleCreate}
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
                            <DateField
                              label="Date"
                              fullWidth
                              value={date}
                              onChange={d => setDate(d)}
                              sx={{mb: 2}}
                            />
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Create
                            </Button>
                        </Form>
                    )}
                  </Formik>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </Container>
    </LocalizationProvider>
  );
};

export default Secure;
