javascript
const express=require("express");

const router=express.Router();


const sellerController=require("../controllers/sellerController");


router.post(

"/property",

sellerController.addProperty

);


module.exports=router;
