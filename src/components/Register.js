import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar, SnackbarProvider } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";


let obj;
let token;


const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [userName, setUsername]=useState('');
  const [password, setPassword]=useState('');
  const [confirmP, setConfirmP]=useState('');
  const [viewLoading,setViewLoading]=useState(false);
  const history = useHistory();
  
  obj={
    'username':userName,
    'password':password,
    'confirmPassword':confirmP
  };
  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (obj) => {
    //console.log(viewLoading);
      setViewLoading(true)
       try{
          token=await axios.post(`${config.endpoint}/auth/register`,{
          username: obj.username,
          password:obj.password
        })
        console.log(token.data);
        setViewLoading(false);
         enqueueSnackbar('Registered Successfully', {
          variant: 'success'
        })}
        catch(error){ 
          console.log(error.response)
          setViewLoading(false);
          // enqueueSnackbar(error.response.data.message,{
          //   variant:'error'
          // })
          if(error.response){
          enqueueSnackbar(error.response.data.message, {
            variant: 'error'
          })}
          else{
            enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", {
              variant: 'error'
            })
          }
        }
      }
        
    
    

  

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (obj) => {
   
    if(obj.username==''){
      return enqueueSnackbar("Username is a required field",{
        variant:'warning'
      })
    }
    else if(obj.username.length<6){
      return enqueueSnackbar("Username must be at least 6 characters",{
        variant:'warning'
      })
    }
    else if(obj.password==''){
      return enqueueSnackbar("Password is a required field",{
        variant:'warning'
      })
    }
    else if(obj.password.length<6){
      return enqueueSnackbar("Password must be at least 6 characters",{
        variant:'warning'
      })
    }
    else if(obj.password!=obj.confirmPassword){
      return enqueueSnackbar("Passwords do not match",{
        variant:'warning'
      })
    }
   return true
  };
  
  if(viewLoading==false){
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      //alignItems="flex-end"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true}/>
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={(event) => {
              setConfirmP(event.target.value);
            }}
          />
           
           
           <Button className="button" variant="contained" onClick= {async ()=>{
            //await register(obj)
            if(validateInput(obj)==true){
            await register(obj);
            if(token){
              history.push("/login",{from:"Register"})
            }
          }
            else{
             validateInput(obj)
            }}
            }
          >
            Register Now
           </Button>
          
           
           
          <p className="secondary-action">
            Already have an account?{" "}
            <Link to="/login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
}

else if(viewLoading==true){
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true}/>
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={(event) => {
              setConfirmP(event.target.value);
            }}
          />
           
           <Box sx={{ display: 'flex', justifyContent:'center' }}>
             <CircularProgress />
           </Box>
           
          
          <p className="secondary-action">
            Already have an account?{" "}
             <a className="link" href="#">
              Login here
             </a>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
}
}



export default Register;

