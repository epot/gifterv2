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

const Secure: React.FC = () => {
  const {eventID} = useParams()
  const navigate = useNavigate();
  
  const [name, setName] = useState("")

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

  async function handleCreate(e){
        e.preventDefault()
        try {
            var requestBody: any = {};
            requestBody.name = name;
            requestBody.event_id = eventID
            requestBody.to_id = "1"
            requestBody.urls = ["https://www.google.fr", "https://www.lequipe.fr"]
            const response = await axios.post('/api/events/' + eventID + "/gifts/create", requestBody)
            navigate('/events')
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
  }, [navigate]);

  return (
    <Container>
      <Card>
        <CardActions>
          <Grid container spacing={1} >
            <Grid size={12}>
              <TextField onChange={e => {setName(e.target.value)}} id="name" label="Name" variant="standard" required />
            </Grid>
            <Grid size={12}>
              <Button variant="contained" onClick = {handleCreate}>Create</Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Secure;
