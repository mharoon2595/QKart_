import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  Grid,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { Fragment } from 'react';
import React from "react";
import "./ProductCard.css";


const ProductCard = ({ product, handleAddToCart }) => {
  //  //product.map({product)=>{
  //   return(
  //     //product.map({product)=>{
  //     <h1>{product.name}</h1>
  //   //
 //console.log(product)

  return (
    
       <Card className="card">
       <CardMedia style={{ height: "25rem" }} image={product.image} component="img" />
       <CardContent>
       <Typography color="primary" variant="h5">
       {product.name}
       </Typography>
       <Typography color="textSecondary" variant="subtitle2">
       <strong>${product.cost}</strong>
       </Typography>
       <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
        <Button variant="contained">ADD TO CART</Button>
     </Card>
   );
}


// else{
//   return null
// }
//}

//}

export default ProductCard;
