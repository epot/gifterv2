import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import dayjs, { Dayjs } from 'dayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import axios from "axios"
import Swal from "sweetalert2"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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

      const userData = await res.json();
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  async function handleCreate(e){
        e.preventDefault()
        try {
            const requestBody = {name, date}
            const response = await axios.post('/api/events/create', requestBody)
            navigate('/secure')
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              Create a new event
            </Typography>
          </CardContent>
          <CardActions>
            <Box sx={{ flexGrow: 1 }}></Box>
              <Grid container spacing={3}>
                <Grid size="grow">
                </Grid>
                <Grid size={6}>
                  <FormControl variant="standard">
                    <TextField onChange={e => {setName(e.target.value)}} id="name" label="Name" variant="standard" required />
                    <DateField
                      label="Date"
                      value={date}
                      onChange={d => setDate(d)}
                    />
                    <Button variant="contained" onClick = {handleCreate}>Create</Button>
                  </FormControl>
                </Grid>
              </Grid>
            </CardActions>
        </Card>
      </Container>
    </LocalizationProvider>
  );
};

export default Secure;
