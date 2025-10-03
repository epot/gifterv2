import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

interface Gift {
  id: string;
  name: string;
  creator_name: string;
  to_name: string;
  status: number;
  from_name: string;
  created_at: Date;
  urls: string[];
}

interface Gifts {
  gifts: Gift[];
}

const Secure: React.FC = () => {
  const {eventID} = useParams()
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gifts | null>(null);

  const fetchGifts = async () => {
    try {
      const res = await fetch("/api/events/" + eventID + "/gifts", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch gifts");
      }

      const giftsData = await res.json();
      if (giftsData.gifts == null) {
        giftsData.gifts = []
      }
      setGifts(giftsData);
    } catch (err) {
      console.error("Error fetching gifts:", err);
      navigate("/"); // Redirect to login if unauthorized or error occurs
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [navigate]);

  return (
    <>
      {gifts ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Container>
            <Card>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Button variant="contained" href={`/events/${eventID}/gifts/create`} >Add new gift</Button>
                </Grid>
                <Grid size={12}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">To</TableCell>
                          <TableCell align="right">Status</TableCell>
                          <TableCell align="right">Idea from</TableCell>
                          <TableCell align="right">Date</TableCell>
                          <TableCell align="right">Links</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gifts.gifts.map((gift) => (
                          <TableRow
                            key={gift.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {gift.name}
                            </TableCell>
                            <TableCell align="right">{gift.to_name}</TableCell>
                            <TableCell align="right">
                              {
                                {
                                  0: "New",
                                  1: "About to be bought by "+ gift.from_name,
                                  2: "Bought by "+ gift.from_name
                                }[gift.status]
                              }
                            </TableCell>
                            <TableCell align="right">{gift.creator_name}</TableCell>
                            <TableCell align="right">{new Date(gift.created_at).toDateString()}</TableCell>
                            <TableCell align="right">
                              <List>
                                {gift.urls.map((url) => (
                                  <ListItem>
                                    <Link href={url}  target="_blank" rel="noreferrer">Link</Link>
                                  </ListItem>
                                ))}
                              </List>
                            </TableCell>
                            <TableCell></TableCell>
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
