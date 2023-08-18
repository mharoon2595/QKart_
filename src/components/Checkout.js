import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom, getTotalItems } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
  changeBtnValue
}) => {
  const {enqueueSnackbar}=useSnackbar();

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e)=>{
          // if(debounceTimeout){
          //   clearTimeout(debounceTimeout)
          // }

          // let timeout=setTimeout(()=>{
          //   handleNewAddress({'value':e.target.value})
          // },5000)

          // setDebounceTimeout(timeout)
          handleNewAddress({...newAddress,'value':e.target.value})
        }}/>
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={async()=>{
            if(newAddress.value){
              await addAddress(token, newAddress.value)
            }
            else{
              enqueueSnackbar("Please enter an address", {
                variant: 'warning'
              })
            }
          }
        }
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={()=>{
            handleNewAddress({'isAddingNewAddress':false})
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });
  const [selected,setSelected]=useState(null)
  const [addressBtn, setAddressBtn]=useState(true);
  



  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      //console.log(response.data)
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const addAddress = async (token, newAddress) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Add new address to the backend and display the latest list of addresses
      if(!(addresses.all.find((place)=>place.address==newAddress))){
      let response=await axios.post(`${config.endpoint}/user/addresses`, {
        //"_id": "",
        "address":newAddress
      },
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }) 
      //setAddressBtn(true)
      setAddresses({ ...addresses, all: response.data });
      setNewAddress({...newAddress, isAddingNewAddress:false})
    } 
    else{
      enqueueSnackbar("Address already exists", { variant: "warning" });
    }
  }
    catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const deleteAddress = async (token, addressId) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Delete selected address from the backend and display the latest list of addresses
       let res= await axios.delete(`${config.endpoint}/user/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the authorization token in the headers
        },
      });
      
      //console.log(addresses, "addressid-->",addressId)
      
      let x=addresses.all.filter((address)=>address._id!=addressId)

      if(addresses.selected==addressId){
        setAddresses({...addresses,all:x, selected:''})
      }
      else{
        setAddresses({...addresses,all: x})
      }
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   *  1. Not enough balance available to checkout cart items
   *    "You do not have enough balance in your wallet for this purchase"
   *
   *  2. No addresses added for user
   *    "Please add a new address before proceeding."
   *
   *  3. No address selected for checkout
   *    "Please select one shipping address to proceed."
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses) => {
    let balance=localStorage.getItem('balance')
    let totalAmt=getTotalCartValue(items);
    if(balance<totalAmt){
      enqueueSnackbar("You do not have enough balance in your wallet for this purchase", { variant: "error" });
      return false
    }
    else if(!addresses.all){
      enqueueSnackbar("Please add a new address before proceeding.", { variant: "error" });
      return false
    }
    else if(items.length==0){
      enqueueSnackbar("Please add something to the cart", { variant: "error" });
      return false
    }
    else if(!addresses.selected){
      enqueueSnackbar("Please select one shipping address to proceed.", { variant: "error" });
      return false
    }
    return true
  }

  // TODO: CRIO_TASK_MODULE_CHECKOUT
  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *  "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *  "success": false,
   *  "message": "Wallet balance not sufficient to place order"
   * }
   *
   */
  const performCheckout = async (token, items, addresses) => {
    if(validateRequest(items, addresses)){
    try{
      localStorage.setItem('balance',(localStorage.getItem('balance')-getTotalCartValue(items)))
       await axios.post(`${config.endpoint}/cart/checkout`,
      {"addressId": addresses.selected},
    {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }) 
  console.log("thanks page")
  enqueueSnackbar("Order placed successfully", { variant: "success" });
   history.push("/thanks")
  }
  catch(e){
    if (e.response && e.response.status === 500) {
      enqueueSnackbar(e.response.data.message, { variant: "error" });
      return null;
    }
    else{
      enqueueSnackbar("Wallet balance not sufficient to place order",{variant: "error"});
      return null
    }
  }
  };
  }
 
  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page


  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
      else{
        history.push("/login",{from:"Header"})
        enqueueSnackbar("You must be logged in to access checkout page", {
          variant: 'warning'
        })
      }
    };
    onLoadHandler();
    getAddresses(token)
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(()=>{
  //   //console.log("selected address", addresses)
  // },[addresses])

  // useEffect(()=>{
  //   //console.log("here's your NEW addresses", newAddress)
  // },[newAddress])


  if(addresses.all.length!=0){
      
  return (
    <>
      <Header hasHiddenAuthButtons={false} hideSearch/>
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              {addresses.all.map((place)=>(
                <Stack direction="column" key={place._id}>
                <Typography size="large" variant="outlined" 
                sx={{
                  display:'flex',
                  justifyContent: 'space-between',
                  height: '70px',
                  margin: '10px',
                  cursor: 'pointer',
                  alignItems: 'center'
                }}
                onClick={()=>{
                  setSelected(place._id)
                  setAddresses({...addresses, selected:place._id})
                }}
                className={`not-selected ${selected==place._id?'selected':''}`}>
                <Typography className="custom-typography" mx="1rem"
                // onClick={()=>
                // }
                >
                 {place.address}
                </Typography>
                <Button variant="text" startIcon={<Delete/>} onClick={()=>{
                  deleteAddress(token, place._id)
                  
                }}
                >Delete</Button>
                 </Typography>
                 </Stack>
              ))}
               {/* <Typography my="1rem">
                 No addresses found for this account. Please add one to proceed.
               </Typography> */}
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            {newAddress.isAddingNewAddress
            ?<AddNewAddressView
            token={token}
            newAddress={newAddress}
            handleNewAddress={setNewAddress}
            addAddress={addAddress}
            />
            :<Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
            </Button>
             }
            

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={()=>{
                performCheckout(token, items, addresses)
              }}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
          <Box sx={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              margin: '0.5rem'
          }}>
            <Box
            pt={1}
            pb={2}
            px={2}
            sx={{
              fontSize: '25px'
            }}
            ><strong>Order Details</strong></Box>
            <Box
            py={1.5}
            px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Products</Box>
             <Box>{getTotalItems(items)}</Box>
           </Box>
           <Box
           py={1.5}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Subtotal</Box>
             <Box>${getTotalCartValue(items)}</Box>
           </Box>
           <Box
           py={1.5}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Shipping charges</Box>
             <Box>$0</Box>
           </Box>
           <Box
           pt={2}
           pb={3}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '25px'
            }}
            >
             <Box><strong>Total</strong></Box>
             <Box><strong>${getTotalCartValue(items)}</strong></Box>
           </Box>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}
else{
  return (
    <>
      <Header hasHiddenAuthButtons={false} hideSearch/>
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              {/* {addresses.map((place)=>(
                <Stack direction="column" spacing={2}>
                <Button variant="outlined" endIcon={<Delete />}>
                 {place.address}
                 </Button>
                 </Stack>
              ))} */}
               <Typography my="1rem">
                 No addresses found for this account. Please add one to proceed.
               </Typography>
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                  (()=>{
                    setAddressBtn(!addressBtn)
                  })();
                }}
                className={`${addressBtn?'addNewAddressBtnView':'addNewAddressBtnNone'}`}
              >
                Add new address
            </Button>

            {addressBtn
            ?''
            :<AddNewAddressView
            token={token}
            newAddress={newAddress}
            handleNewAddress={setNewAddress}
            addAddress={addAddress}
            changeBtnValue={()=>{
              setAddressBtn(true);
            }}
        />
             }

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
          <Box sx={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              margin: '0.5rem'
          }}>
            <Box
            pt={1}
            pb={2}
            px={2}
            sx={{
              fontSize: '25px'
            }}
            ><strong>Order Details</strong></Box>
            <Box
            py={1.5}
            px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Products</Box>
             <Box>{getTotalItems(items)}</Box>
           </Box>
           <Box
           py={1.5}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Subtotal</Box>
             <Box>${getTotalCartValue(items)}</Box>
           </Box>
           <Box
           py={1.5}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '20px'
            }}
            >
             <Box>Shipping charges</Box>
             <Box>$0</Box>
           </Box>
           <Box
           pt={2}
           pb={3}
           px={2}
            sx={{
              display:'flex',
              justifyContent:'space-between',
              fontSize: '25px'
            }}
            >
             <Box><strong>Total</strong></Box>
             <Box><strong>${getTotalCartValue(items)}</strong></Box>
           </Box>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}
}




export default Checkout;
