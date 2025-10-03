import React, { useEffect, useState } from "react";
import Container from '@mui/material/Container';
import AppBar from './AppBar';
import Events from './Events';



const Secure: React.FC = () => {
  return (
    <Container>
      <AppBar /> 
      <Events/>
    </Container>
  );
};

export default Secure;
