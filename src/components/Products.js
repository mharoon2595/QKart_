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
import ProductCard from "./ProductCard";
import { Search } from "@mui/icons-material";
import { Fragment } from "react";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

//const Products = () => {
// let product={
// "name":"Tan Leatherette Weekender Duffle",
// "category":"Fashion",
// "cost":150,
// "rating":4,
// "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
// "_id":"PmInA797xJhMIPti"
// };

// TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
/* @property {string} productId - Unique ID for the product
 */

const Products = () => {
  let token;
  let array;
  const [productList, setProductList] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [allProducts, setAllProducts] = useState(0);
  const [viewLoading, setViewLoading] = useState(true);
  const [readSearch, setReadSearch] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [checkoutList, setCheckoutList] = useState([]);
  const [cartClick, setCartClick] = useState([]);
  const [cartPost, setCartPost] = useState([]);

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

  useEffect(() => {
    // console.log("useEffect that repeats when cartData changes", cartData);
    if (cartData) {
      let y = generateCartItemsFrom(cartData, productList);
      // console.log(y);
      setCheckoutList(y);
    }
  }, [cartData]);

  useEffect(() => {
     if(Object.keys(cartPost).length!=0){
      if (localStorage.getItem("token")) {
        //console.log(localStorage.getItem("token"))
        let tok = localStorage.getItem("token");
        // console.log(tok);
        // console.log(cartPost);
        (async function () {
          try {
            let resp = await axios.post(`${config.endpoint}/cart`, cartPost, {
              headers: {
                Authorization: `Bearer ${tok}`,
              },
            });
            // console.log(resp, "YOYO");
          } catch (error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              // console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              // console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              // console.log("Error", error.message);
            }
          }
        })();
      }
    }
  }, [cartPost]);

  useEffect(() => {
    if (checkoutList) {
      // // console.log(
      //   "useffect that repeats when checkoutlist changes",
      //   checkoutList
      // );
    }
  }, [checkoutList]);

  useEffect(() => {
    // console.log(cartClick);
    if (cartClick.length !== 0) {
      if (!localStorage.getItem("token")) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
      } else if (isItemInCart(cartData, cartClick._id)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "warning",
          }
        );
      } else if (!isItemInCart(cartData, cartClick._id)) {
        (async function () {
          let token = localStorage.getItem("token");
          let items = "";
          let products = "";
          let productId = cartClick._id;
          let qty = 1;
          let options = true;
          await addToCart(token, items, products, productId, qty, options);
        })();
      }
    } else if (cartClick.length == 0) {
      // console.log("cartClick's empty boss");
    }
  }, [cartClick]);

  useEffect(() => {
    // console.log("useEffect ONLY ONCE");
    const performAPICall = async () => {
      try {
        token = await axios.get(`${config.endpoint}/products`);
        //console.log(token.data);
        setAllProducts([...token.data]);
        setProductList([...token.data]);
        //console.log(allProducts)
        setViewLoading(false);
      } catch (error) {
        setViewLoading(false);
        enqueueSnackbar("Check if backend is up and running and try again", {
          variant: "error",
        });
        // console.log(allProducts);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          // console.log("Error", error.message);
        }
      }
    };
    performAPICall();

    (async function () {
      if (localStorage.getItem("token") != false) {
        let token = localStorage.getItem("token");
        let x = await fetchCart(token);
        console.log(x);
        setCartData(x);
      }
    })();
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
    try {
      let list = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setViewLoading(false);
      // console.log(list);
      array = list.data;
      setAllProducts(array);
    } catch (error) {
      setViewLoading(false);
      setAllProducts(false);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.log("Error", error.message);
      }
    }
  };

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
    // console.log("hello", debounceTimeout);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeoutId = setTimeout(async () => {
      await handleChange(event);
    }, 1000);
    setDebounceTimeout(timeoutId);
  };

  async function handleChange(e) {
    // console.log("inside handle change");
    setViewLoading(true);
    setReadSearch(e.target.value);
    await performSearch(e.target.value);
  }

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
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
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(res.data);
      return res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].productId == productId) {
        return true;
      }
    }
    return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options
  ) => {
    if (options === true) {
      // let response = await axios.post(
      //   `${config.endpoint}/cart`,
      //   {
      //     productId: productId,
      //     qty: qty,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // console.log("cartData", cartData);

      // let x = await fetchCart(token);
      // console.log("from addtocart-fetchCart bruv", x);
      // setCartData(x);
      console.log(cartData)
      setCartData((prevItems) =>
      [...prevItems, {productId: productId, qty: qty}]
      )
      await setCartPost({
        productId: productId, 
        qty: qty
      })
    }
    else if (options == false) {
      //console.log("addTocart false options mann", qty, items)
      let id = items[0].productId;
      let newQty = items[0].qty;
      // console.log(id, newQty);
      if (newQty == 0) {
        //setCheckoutList([]);
        setCartData((prevItems) =>
          prevItems.filter((item) => item.productId !== id)
        );
        setCartPost({
          productId: id,
          qty: newQty,
        });
      } else {
        //setCheckoutList([]);
        setCartData((prevItems) =>
          prevItems.map((item) =>
            item.productId === id ? { ...item, qty: newQty } : item
          )
        );
        setCartPost({
          productId: id,
          qty: newQty,
        });
      }
    }
  };

  if (viewLoading == true) {
    return (
      <div>
        <Header hasHiddenAuthButtons={false} hideSearch={false}>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50rem",
          }}
        >
          <CircularProgress />
          <h2>Loading Products</h2>
        </Box>
        <Footer />
      </div>
    );
  } else if (viewLoading == false && allProducts) {
    // if(localStorage.getItem("token")!=false){
    //   let token=localStorage.getItem("token");
    //   fetchCart(token);
    // }
    // console.log("from render", cartData);
    return (
      <div>
        <Header
          hasHiddenAuthButtons={false}
          children={true}
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
          hideSearch={false}
        >
          {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        </Header>

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
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
        />
        <Grid container>
          <Grid item className="product-grid" xs={12} md={9}>
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
            <Box
              sx={{
                padding: "20px",
              }}
            >
              {/* {console.log(product)} */}
              <Grid container spacing={2}>
                {allProducts.map((item) => (
                  <Fragment key={item._id}>
                    <Grid item xs={6} md={3}>
                      <ProductCard
                        product={item}
                        onAddtoCart={() => {
                          setCartClick(item);
                        }}
                      />
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={3} className="cartGreen">
            <Cart
              items={checkoutList}
              products={productList}
              handleQuantity={addToCart}
            />
          </Grid>
        </Grid>
        <Footer />
      </div>
    );
  } else if (viewLoading == false && !allProducts) {
    // if(cartData){
    //   generateCartItemsFrom(cartData, productList);
    //   console.log(cartList)
    // }
    return (
      <div>
        <Header
          hasHiddenAuthButtons={false}
          children={true}
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
          hideSearch={false}
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
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
        />
        <Grid container>
          <Grid item className="product-grid" xs={12} md={9}>
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
            <Box
              sx={{
                height: "40rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <SentimentDissatisfiedIcon />
              <p>No products found</p>
            </Box>
            {/* <Box
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
    </Box> */}
          </Grid>
          <Grid item xs={12} md={3} className="cartGreen">
            <Cart items={checkoutList} />
          </Grid>
        </Grid>
        <Footer />
      </div>
    );
  }
};

export default Products;
