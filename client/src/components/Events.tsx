import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

interface Event {
  id: string;
  name: string;
  creator_name: string;
  date: Date;
}

interface Events {
  events: Event[];
}

const Secure: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Events | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      const eventsData = await res.json();
      if (eventsData.events == null) {
        eventsData.events = []
      }
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  return (
    <>
      {events ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Container>
            <Card>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Button variant="contained" href={'/events/new'}>Create new event</Button>
                </Grid>
                <Grid size={12}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Creator</TableCell>
                          <TableCell align="right">Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {events.events.map((event) => (
                          <TableRow
                            key={event.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              <Link href={`/events/${event.id}/gifts`} underline="none">{event.name}</Link>
                            </TableCell>
                            <TableCell align="right">{event.creator_name}</TableCell>
                            <TableCell align="right">{new Date(event.date).toDateString()}</TableCell>
                          </TableRow>
                    ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Card>
          </Container>
        </Box>
      ) : (
        <Card>
          Loading...
        </Card>
      )}
    </>
  );
};

export default Secure;
