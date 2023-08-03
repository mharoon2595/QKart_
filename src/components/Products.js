import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import { Search} from "@mui/icons-material";
import { Fragment } from 'react';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

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


const Products = () => {
  // let product={
  // "name":"Tan Leatherette Weekender Duffle",
  // "category":"Fashion",
  // "cost":150,
  // "rating":4,
  // "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  // "_id":"PmInA797xJhMIPti"
  // };
  let token;
  let array;
  const [allProducts, setAllProducts]= useState(0)
  const [viewLoading,setViewLoading]=useState(true);
  const [readSearch, setReadSearch]=useState('')
  const [ debounceTimeout, setDebounceTimeout]=useState(null);
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  useEffect( ()=>{
  const performAPICall = async () => {
    try{
    token=await axios.get(`${config.endpoint}/products`);
    //console.log(token.data);
    setAllProducts([...token.data])
    //console.log(allProducts)
    setViewLoading(false)
    }
    catch(error){
      setViewLoading(false)
      console.log(allProducts)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
  }
  performAPICall();
  }, []);
  
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
    let list=await axios.get(`${config.endpoint}/products/search?value=${text}`);
    setViewLoading(false)
    console.log(list);
    array=list.data;
    setAllProducts(array)
   }
   catch(error){
    setViewLoading(false);
    setAllProducts(false)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
   }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {

    //let value=event.target.value;
    console.log("hello", debounceTimeout);
    if(debounceTimeout){
      clearTimeout(debounceTimeout)
    }
    const timeoutId=setTimeout(async()=>{
      await handleChange(event);
    }, 1000)
    setDebounceTimeout(timeoutId)
  }
  

 async function handleChange(e){
  console.log('inside handle change')
  setViewLoading(true)
  setReadSearch(e.target.value);
  await performSearch(e.target.value);
 }



if(viewLoading==true){
  return (
    <div>
      <Header hasHiddenAuthButtons={false}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        // value={readSearch}
        //onChange={(e)=>debounceSearch(e,debounceTimeout)}
      />
       <Grid container>
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
       </Grid>
       <Box sx={{ display: 'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center', height:'50rem'}}>
             <CircularProgress />
             <h2>Loading Products</h2>
           </Box>
      <Footer />
    </div>
  )
}

 else if(viewLoading==false && allProducts){
  return (
    <div>
      <Header hasHiddenAuthButtons={false} children={true}
      onChange={(e)=>{
        debounceSearch(e,debounceTimeout)
      }
      } 
      >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        // value={readSearch}
        onChange={(e)=>{
          debounceSearch(e,debounceTimeout)
        }
      }
      />
       <Grid container>
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
       </Grid>
       <Box
    sx={{
      padding:'20px',
    }}
    >
    {/* {console.log(product)} */}
   <Grid container spacing={2}>
   {allProducts.map((item)=>(
   <Fragment key={item._id}>
   <Grid item xs={6} md={3}>
       <ProductCard product={item} />
   </Grid>
    </Fragment>
    ))}
    </Grid>
    </Box>
      <Footer />
    </div>
  )
}

else if(viewLoading==false && !allProducts){
  return (
    <div>
      <Header hasHiddenAuthButtons={false} children={true}
      onChange={(e)=>{
        debounceSearch(e,debounceTimeout)
      }
      } 
      >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        // value={readSearch}
        onChange={(e)=>{
          debounceSearch(e,debounceTimeout)
        }
      }
      />
       <Grid container>
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
       </Grid>
       <Box
    sx={{
      height: '40rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection:'column'
    }}
    >
     <SentimentDissatisfiedIcon/>
     <p>No products found</p>
    </Box>
    </div>
   )
  }
}

export default Products;
