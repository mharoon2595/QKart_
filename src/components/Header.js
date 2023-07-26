import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { spacing } from '@mui/system';
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory, Link } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history=useHistory();
  if(hasHiddenAuthButtons===false && localStorage.getItem('username')!==null){
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box 
        sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        //marginX:2
      }}
      >
        <Box mx={1}>
        <img src="avatar.png" alt={localStorage.getItem('username')}></img>
        </Box>
        <Box mt={0.25}>
        <p>{localStorage.getItem('username')}</p>
        </Box>
        <Button
        variant="text"
        onClick={()=>{
          localStorage.clear();
          window.location.reload();
        }}
        >
         LOGOUT
        </Button>
        </Box>
        </Box>
  )}
  
  else if(hasHiddenAuthButtons===false && localStorage.getItem('username')===null){
    return(
      <Box className="header"
      >
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box 
        sx={{
        display: 'flex',
        justifyContent: 'flex-end'
        }}
      >
        <Box mx={1}>
        <Button
        variant="text"
        onClick={()=>{
          history.push("/login",{from:"Header"})
        }}
        >
         LOGIN
        </Button>
        </Box>
        <Button
        variant="contained"
        onClick={()=>{
          history.push("/register",{from:"Header"})
        }}
        >
         REGISTER
        </Button>
        </Box>
      </Box>
    )}

 else if(hasHiddenAuthButtons===true){
  return(
       <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=>{
            history.push("/",{from:"Header"})
          }}
        >
          Back to explore
        </Button>
        </Box>
 )}
}

export default Header;
