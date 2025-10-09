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
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import HelpIcon from '@mui/icons-material/Help';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import HttpsIcon from '@mui/icons-material/Https';
import CommentIcon from '@mui/icons-material/Comment';

const addParticipantValidationSchema = Yup.object().shape({
    participant_email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
});

const addCommentValidationSchema = Yup.object().shape({
    message: Yup.string()
        .required('Message is required'),
});

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
  secret: boolean;
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

interface Comment {
  id: string;
  message: string;
  since: string;
  author: User;
}

interface Comments {
  comments: Comment[];
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
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };


  const {eventID} = useParams()
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gifts | null>(null);
  const [giftID, setGiftID] = useState("")
  const [giftStatus, setGiftStatus] = useState(0)
  const [participants, setParticipants] = useState<Participants | null>(null);
  const [comments, setComments] = useState<Comments | null>(null);

  const [openBuyModal, setOpenBuyModal] = React.useState(false);
  const handleOpenBuyModal = (id: string) => {
    setGiftID(id)
    setOpenBuyModal(true);
  }
  const handleCloseBuyModal = () => setOpenBuyModal(false);

  const [openDeleteGiftDialog, setOpenDeleteGiftDialog] = React.useState(false);

  const handleClickOpenDeleteGift = (id: string) => {
    setGiftID(id)
    setOpenDeleteGiftDialog(true);
  };

  const handleCloseDeleteGift = () => {
     setOpenDeleteGiftDialog(false);
  };

  const handleDeleteGift = async () => {
    try {
        await axios.post('/api/events/'+eventID+ '/gifts/' + giftID+ '/delete', {})
        fetchGifts();
        handleCloseBuyModal();
    } catch (error: any) {
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "Failed to update",
            text: error.response.data
        });
    }

    setOpenDeleteGiftDialog(false);
  }

  const [openCommentsModal, setOpenCommentsModal] = React.useState(false);
  const handleOpenCommentsModal = (id: string) => {
    setGiftID(id);
    fetchComments(id);
    setOpenCommentsModal(true);
  }
  const handleCloseCommentsModal = () => setOpenCommentsModal(false);

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

    const fetchComments = async (id: string) => {
    try {
      const res = await fetch("/api/events/"+eventID+"/gifts/" + id + "/comments" , {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      const commentsData = await res.json();
      if (commentsData.comments == null) {
        commentsData.comments = []
      }
      setComments(commentsData);
      
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  async function handleNewParticipant(values: any){
        try {
            await axios.post('/api/events/'+eventID+ '/participants/create', values)
            fetchParticipants()
        } catch (error: any) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to add participant",
                text: error.response.data
            });
        }
  }

  async function handleAddComment(values: any){
        try {
            await axios.post('/api/events/'+eventID+ '/gifts/' + giftID + '/comments/create', values)
            handleCloseCommentsModal();
        } catch (error: any) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to add comment",
                text: error.response.data
            });
        }
  }

  async function handleGiftStatusUpdate(e: any){
        e.preventDefault()
        try {
            var requestBody: any = {};
            requestBody.status = Number(giftStatus)
            await axios.post('/api/events/'+eventID+ '/gifts/' + giftID+ '/update', requestBody)
            fetchGifts();
            handleCloseBuyModal();
        } catch (error: any) {
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
                                  {gift.secret ? 
                                  <HttpsIcon/> : <></>}
                                  {gift.name == "" ?  <></> : 
                                    <Tooltip title={"idea from " + gift.creator_name}>
                                      
                                        <Chip label={gift.name} />
                                    </Tooltip>
                                  }
                                </TableCell>
                                <TableCell align="right"><Chip label={gift.to_name}/></TableCell>
                                <TableCell align="right">
                                  {
                                    {
                                      0: <Chip label="New" />,
                                      1: <Tooltip title={"by " + gift.from_name}><Chip label="About to be bought" /></Tooltip>,
                                      2: <Tooltip title={"by " + gift.from_name}><Chip label="Bought" /></Tooltip>,
                                      4: <Tooltip title="Tin tiiinnnn"><HelpIcon /></Tooltip>,
                                    }[gift.status]
                                  }
                                </TableCell>
                                <TableCell align="right"><Chip label={new Date(gift.created_at).toDateString()}/></TableCell>
                                <TableCell align="right">
                                  <List>
                                    {gift.urls != null ? gift.urls.map((url, idx) => (
                                      <ListItem key={idx}>
                                        <Link href={url}  target="_blank" rel="noreferrer">Link</Link>
                                      </ListItem>
                                    )):<></>}
                                  </List>
                                </TableCell>
                                <TableCell>
                                  {!gift.status_frozen ? (
                                    <Box>
                                    <Tooltip title="Buy">
                                    <Button variant="outlined" onClick={() => handleOpenBuyModal(gift.id)}><CreditCardIcon /></Button>
                                    </Tooltip>
                                    <Modal
                                      open={openBuyModal}
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
                                    </Modal>
                                    <Button variant="outlined" onClick={() => handleClickOpenDeleteGift(gift.id)}><DeleteIcon/></Button>
                                    <Dialog
                                      open={openDeleteGiftDialog}
                                      onClose={handleCloseDeleteGift}
                                      aria-labelledby="alert-dialog-title"
                                      aria-describedby="alert-dialog-description"
                                    >
                                      <DialogTitle id="alert-dialog-title">
                                        {"Confirm gift deletion?"}
                                      </DialogTitle>
                                      <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                          Are you sure you want to delete this gift? This cannot be undone.
                                        </DialogContentText>
                                      </DialogContent>
                                      <DialogActions>
                                        <Button onClick={handleCloseDeleteGift}>Cancel</Button>
                                        <Button onClick={handleDeleteGift} autoFocus>
                                          Delete
                                        </Button>
                                      </DialogActions>
                                    </Dialog>
                                    <Tooltip title="Comment">
                                      <Button variant="outlined" onClick={() => handleOpenCommentsModal(gift.id)}><CommentIcon /></Button>
                                    </Tooltip>
                                  </Box>
                                  ): (
                                  <Box>
                                    <Tooltip title="Comment">
                                      <Button variant="outlined" onClick={() => handleOpenCommentsModal(gift.id)}><CommentIcon /></Button>
                                    </Tooltip>
                                  </Box>)}
                                    <Modal
                                      open={openCommentsModal}
                                      onClose={handleCloseCommentsModal}
                                      aria-labelledby="modal-modal-title"
                                      aria-describedby="modal-modal-description"
                                    >
                                      {comments ? ( 
                                        <Box sx={style}>
                                          <List style={{maxHeight: '250px', overflow:'auto'}}>
                                            {comments.comments.map((comment) => (
                                              <ListItemButton key={comment.id}>
                                                <ListItemIcon>
                                                  <IconButton sx={{ p: 0 }}>
                                                      <Avatar alt={comment.author.email} src={comment.author.picture} />
                                                  </IconButton>
                                                </ListItemIcon>
                                                <ListItemText primary={comment.message} secondary={comment.since + ' ago'} />
                                              </ListItemButton>
                                            ))}
                                          </List>
                                          <Formik
                                                initialValues={{message: ''}}
                                                validationSchema={addCommentValidationSchema}
                                                onSubmit={handleAddComment}
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
                                                            label="Comment"
                                                            variant="outlined"
                                                            name="message"
                                                            required
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={Boolean(touched.message && errors.message)}
                                                            helperText={touched.message && errors.message}
                                                            sx={{mr: 2}}
                                                        />
                                                        <Button type="submit" variant="contained" color="primary">
                                                            Add
                                                        </Button>
                                                    </Form>
                                                )}
                                            </Formik>
                                        </Box>
                                      ) : (
                                        <Card>
                                          Loading...
                                        </Card>
                                      )}
                                    </Modal>
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
                  <ListItemButton key={user.email}>
                    <ListItemIcon>
                      <IconButton sx={{ p: 0 }}>
                          <Avatar alt={user.email} src={user.picture} />
                      </IconButton>
                    </ListItemIcon>
                    <ListItemText primary={user.name} />
                  </ListItemButton>
                ))}
              </List>
              <Formik
                  initialValues={{participant_email: ''}}
                  validationSchema={addParticipantValidationSchema}
                  onSubmit={handleNewParticipant}
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
                              name="participant_email"
                              required
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={Boolean(touched.participant_email && errors.participant_email)}
                              helperText={touched.participant_email && errors.participant_email}
                              sx={{mr: 2}}
                          />
                          <Button type="submit" variant="contained" color="primary">
                              Add participant
                          </Button>
                      </Form>
                  )}
                </Formik>
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
