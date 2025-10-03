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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import axios from "axios"
import Swal from "sweetalert2"
import Tab from '@mui/material/Tab';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PeopleIcon from '@mui/icons-material/People';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';

interface Gift {
  id: string;
  name: string;
  creator_name: string;
  to_name: string;
  status: number;
  from_name: string;
  status_frozen: boolean;
  created_at: Date;
  urls: string[];
}

interface Gifts {
  gifts: Gift[];
}

interface User {
  name: string;
  email: string;
  picture?: string;
}

interface Participants {
  users: User[];
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Secure: React.FC = () => {
  const [tabValue, setTabValue] = React.useState('1');
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };


  const {eventID} = useParams()
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gifts | null>(null);
  const [giftID, setGiftID] = useState("")
  const [newParticipantEmail, setNewParticipantEmail] = useState("")
  const [giftStatus, setGiftStatus] = useState(0)
  const [participants, setParticipants] = useState<Participants | null>(null);

  const [openBuyModel, setOpennBuyModel] = React.useState(false);
  const handleOpenBuyModal = (id: string) => {
    setGiftID(id)
    setOpennBuyModel(true);
  }
  const handleCloseBuyModal = () => setOpennBuyModel(false);

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

  async function handleNewParticipant(e){
        e.preventDefault()
        try {
            var requestBody: any = {};
            requestBody.participant_email = newParticipantEmail
            await axios.post('/api/events/'+eventID+ '/participants/create', requestBody)
            fetchParticipants()
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to add participant",
                text: error.response.data
            });
        }
  }

  async function handleGiftStatusUpdate(e){
        e.preventDefault()
        try {
            var requestBody: any = {};
            requestBody.status = Number(giftStatus)
            await axios.post('/api/events/'+eventID+ '/gifts/' + giftID+ '/update', requestBody)
            fetchGifts();
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to update",
                text: error.response.data
            });
        }
    }

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
    fetchParticipants();
  }, [navigate]);

  return (
    <Box>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange}>
            <Tab icon={<CardGiftcardIcon />} label="Gifts" value="1"/>
            <Tab icon={<PeopleIcon />} label="Participants" value="2"/>
          </TabList>
        </Box>
        <TabPanel value="1">
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
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
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
                                  <Chip label={gift.name}/>
                                </TableCell>
                                <TableCell align="right"><Chip label={gift.to_name}/></TableCell>
                                <TableCell align="right">
                                  {
                                    {
                                      0: <Chip label="New" />,
                                      1: <Tooltip title={"by " + gift.from_name}><Chip label="About to be bought" /></Tooltip>,
                                      2: <Tooltip title={"by " + gift.from_name}><Chip label="Bought" /></Tooltip>
                                    }[gift.status]
                                  }
                                </TableCell>
                                <TableCell align="right"><Chip label={gift.creator_name}/></TableCell>
                                <TableCell align="right"><Chip label={new Date(gift.created_at).toDateString()}/></TableCell>
                                <TableCell align="right">
                                  <List>
                                    {gift.urls.map((url) => (
                                      <ListItem>
                                        <Link href={url}  target="_blank" rel="noreferrer">Link</Link>
                                      </ListItem>
                                    ))}
                                  </List>
                                </TableCell>
                                <TableCell>
                                  {!gift.status_frozen ? (
                                    <Box>
                                    <Tooltip title="Buy">
                                    <Button onClick={() => handleOpenBuyModal(gift.id)}><CreditCardIcon /></Button>
                                    </Tooltip>
                                    <Modal
                                      open={openBuyModel}
                                      onClose={handleCloseBuyModal}
                                      aria-labelledby="modal-modal-title"
                                      aria-describedby="modal-modal-description"
                                    >
                                      <Box sx={style}>
                                        <FormControl required sx={{ m: 1, minWidth: 240 }}>
                                          <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                          Status
                                        </InputLabel>
                                          <Select
                                            defaultValue={gift.status}
                                            value={giftStatus}
                                            label="Status"
                                            onChange={e => {setGiftStatus(e.target.value)}}
                                          >
                                            <MenuItem value="0">New</MenuItem>
                                            <MenuItem value="1">About to be bought</MenuItem>
                                            <MenuItem value="2">Bought</MenuItem>
                                          </Select>
                                        </FormControl>
                                        <Button variant="contained" onClick = {handleGiftStatusUpdate}>Update</Button>
                                      </Box>
                                    </Modal></Box>
                                  ): (<Box></Box>)}
                                </TableCell>
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
        </TabPanel>
        <TabPanel value="2">
          {participants ? ( 
            <Box>
              <List>
                {participants.users.map((user) => (
                  <ListItemButton>
                    <ListItemIcon>
                      <IconButton sx={{ p: 0 }}>
                          <Avatar alt={user.email} src={user.picture} />
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText primary={user.name} />
                  </ListItemButton>
                ))}
              </List>
              <TextField onChange={e => {setNewParticipantEmail(e.target.value)}} id="newParticipantEmail" label="Email:" variant="standard" required />
              <Button variant="contained" onClick = {handleNewParticipant}>Add participant</Button>
            </Box>
          ): (
            <Card>
              Loading...
            </Card>
          )}
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default Secure;
