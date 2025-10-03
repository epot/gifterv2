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

const Secure: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("")
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

  async function handleCreate(e: any){
        e.preventDefault()
        try {
            const requestBody = {name, date}
            await axios.post('/api/events/create', requestBody)
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
                <TextField onChange={e => {setName(e.target.value)}} id="name" label="Name" variant="standard" required />
              </Grid>
              <Grid size={12}>
                <DateField
                    label="Date"
                    value={date}
                    onChange={d => setDate(d)}
                  />
              </Grid>
              <Grid size={12}>
                <Button variant="contained" onClick = {handleCreate}>Create</Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </Container>
    </LocalizationProvider>
  );
};

export default Secure;
