import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from "axios"
import Swal from "sweetalert2"
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    link1: Yup.string(),
    link2: Yup.string(),
    link3: Yup.string(),
});

interface User {
  id: string;
  name: string;
  email: string;
}

interface Participants {
  users: User[];
}

const Secure: React.FC = () => {
  const {eventID} = useParams()
  const navigate = useNavigate();
  const [toID, setToID] = useState("")

  const [participants, setParticipants] = useState<Participants | null>(null);

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
      console.error("Error fetching user:", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/events/"+eventID+"/participants", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch participants");
      }

      const participantsData = await res.json();
      if (participantsData.users == null) {
        participantsData.users = []
      }
      setParticipants(participantsData);
    } catch (err) {
      console.error("Error fetching participants:", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  async function handleCreate(values: any){
    console.log(values)
    try {
        var urls = []
        if (values.link1 != "") {
          urls.push(values.link1);
        }
        if (values.link2 != "") {
          urls.push(values.link2);
        }
        if (values.link3 != "") {
          urls.push(values.link3);
        }
        values.urls = urls
        values.to_id = toID
        await axios.post('/api/events/' + eventID + "/gifts/create", values)
        navigate('/events/' + eventID + "/gifts")
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
    fetchParticipants();
  }, [navigate]);

  return (
    <>
      {participants ? (
        <Container>
          <Card>
            <CardActions>
              <Grid container spacing={1} >
                <Grid size={12}>
                  <Formik
                      initialValues={{name: '', link1: '', link2: '', link3: ''}}
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
                              <Select
                                defaultValue={participants.users[0].id}
                                value={toID}
                                fullWidth
                                label="For"
                                onChange={e => {setToID(e.target.value)}}
                                required
                                sx={{mb: 2}}
                              >
                                {participants.users.map((user) => (
                                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                                ))}
                              </Select>
                              <TextField
                                  label="Link"
                                  variant="outlined"
                                  name="link1"
                                  fullWidth
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  sx={{mb: 2}}
                              />
                              <TextField
                                  label="Link"
                                  variant="outlined"
                                  name="link2"
                                  fullWidth
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  sx={{mb: 2}}
                              />
                              <TextField
                                  label="Link"
                                  variant="outlined"
                                  name="link3"
                                  fullWidth
                                  onChange={handleChange}
                                  onBlur={handleBlur}
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
      ) : (
        <Card>
          Loading...
        </Card>
      )}
    </>
  );
};

export default Secure;
