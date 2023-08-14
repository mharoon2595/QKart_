import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { spacing } from '@mui/system';
import { Avatar, Button, Stack, TextField, InputAdornment } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory, Link } from "react-router-dom";
import "./Header.css";
import { Search, SentimentDissatisfied } from "@mui/icons-material";
//import {username} from "./Login";

const Header = ({ children, hasHiddenAuthButtons, value, onChange, hideSearch}) => {
  const history=useHistory();
  if(hasHiddenAuthButtons===false && localStorage.getItem('username')!==null && hideSearch==false){
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width:'30rem'
          //marginX:2
        }}>
          <TextField className="search-desktop"  variant="outlined" id="outlined-basic" fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          //value={value}
          onChange={onChange}
          //onChange={(event)=>{/>
          />
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
  

  else if(hasHiddenAuthButtons===false && localStorage.getItem('username')===null && hideSearch==false){
    return( 
      <Box className="header"
      >
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width:'30rem'
          //marginX:2
        }}>
          <TextField className="search-desktop" id="outlined-basic" variant="outlined" fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          value={value}
          onChange={onChange}
          />
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

else if(hasHiddenAuthButtons===false && hideSearch && localStorage.getItem('username')!==null){
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
  )
}

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
 else{
  return null;
 }
}

export default Header;
