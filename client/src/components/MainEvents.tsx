import { Routes, Route } from 'react-router-dom'
import React from "react";
import Container from '@mui/material/Container';
import AppBar from './AppBar';
import Events from './Events';
import Gifts from './Gifts';
import NewGift from './NewGift';
import NewEvent from "./NewEvent";

const Secure: React.FC = () => {
  return (
    <Container>
      <AppBar /> 
      <Container
        maxWidth="lg"
        component="main"
        sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
      >
        <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/new" element={<NewEvent />} />
            <Route path="/:eventID/gifts" element={<Gifts />} />
            <Route path="/:eventID/gifts/create" element={<NewGift />} />
        </Routes>
      </Container>
    </Container>
  );
};

export default Secure;
