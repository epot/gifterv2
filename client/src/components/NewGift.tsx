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
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

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
  
  const [name, setName] = useState("")
  const [toID, setToID] = useState("")
  const [participants, setParticipants] = useState<Participants | null>(null);
  const [link1, setLink1] = useState("")
  const [link2, setLink2] = useState("")
  const [link3, setLink3] = useState("")

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

  async function handleSubmit(e){
        e.preventDefault();
        if (!e.target.checkValidity()) {
          Swal.fire({
                icon: "error",
                title: "Error",
                text: "Form is invalid! Please fill everything..."
            });
          return
        }
        try {
            var requestBody: any = {};
            requestBody.name = name;
            requestBody.event_id = eventID
            requestBody.to_id = toID
            var urls = []
            if (link1 != "") {
              urls.push(link1);
            }
            if (link2 != "") {
              urls.push(link2);
            }
            if (link3 != "") {
              urls.push(link3);
            }
            requestBody.urls = urls
            await axios.post('/api/events/' + eventID + "/gifts/create", requestBody)
            navigate('/events/' + eventID + "/gifts")
        } catch (error) {
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
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={1} >
                  <Grid size={12}>
                    <TextField onChange={e => {setName(e.target.value)}} id="name" label="Name" variant="standard" required />
                  </Grid>
                  <Grid size={12}>
                    <FormControl required sx={{ m: 1, minWidth: 240 }}>
                      <InputLabel variant="standard" htmlFor="uncontrolled-native">
                      For
                    </InputLabel>
                      <Select
                        defaultValue={participants.users[0].id}
                        value={toID}
                        label="For"
                        onChange={e => {setToID(e.target.value)}}
                        required
                      >
                        {participants.users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <TextField onChange={e => {setLink1(e.target.value)}} id="link1" label="Link" variant="standard" />
                  </Grid>
                  <Grid size={12}>
                    <TextField onChange={e => {setLink2(e.target.value)}} id="link2" label="Link" variant="standard" />
                  </Grid>
                  <Grid size={12}>
                    <TextField onChange={e => {setLink3(e.target.value)}} id="link3" label="Link" variant="standard" />
                  </Grid>
                  <Grid size={12}>
                    <Button variant="contained" type="submit">Create</Button>
                  </Grid>
                </Grid>
              </Box>
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
