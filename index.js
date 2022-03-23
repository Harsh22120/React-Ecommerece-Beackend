const express=require('express');
const mongoose= require('mongoose');
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({ key_id:"rzp_test_7IGHa5Igq6Gaka", key_secret:"mRoDKlM46ZbFy7pRvprHKxl8"});
const cors = require('cors'); 
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User = require('./models/user');
const Product = require('./models/Product');
const Cart = require("./models/cart");
const Order = require("./models/Order");
const Payment = require("./models/Payment");
const morgan = require("morgan");
const {auth} =require('./middlewares/auth');
//const req = require('express/lib/request');
//const { route } = require('express/lib/application');
const db=require('./config/config').get(process.env.NODE_ENV);

const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});

//create order
app.post('/api/createOrder', (req, res)=>{
  const {amount,currency,receipt, notes}  = req.body; 
  razorpayInstance.orders.create({amount, currency, receipt, notes}, 
    (err, order)=>{

      if(!err)
        res.json(order)
      else
        res.send(err);
    }
  )
});

app.post('/api/verifyorder', (req, res)=>{
  //Receive Payment Data
  const {order_id, payment_id} = req.body;     
  const razorpay_signature =  req.headers['x-razorpay-signature'];
   
   //Verification & Send Response to User
     // Creating hmac object 
    let hmac = crypto.createHmac('sha256', key_secret); 
    // Passing the data to be hashed
    hmac.update(order_id + "|" + payment_id);
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');

    if(razorpay_signature===generated_signature){
        res.json({success:true, message:"Payment has been verified"})
    }
    else
    res.json({success:false, message:"Payment verification failed"})
});


// adding new user (sign-up route)
app.post('/api/register',function(req,res){
   // taking a user
   const newuser=new User(req.body);
   console.log(newuser);

   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
   
   User.findOne({email:newuser.email},function(err,user){
       if(user) return res.status(400).json({ auth : false, message :"email exits"});
      
       newuser.save((err,doc)=>{
           if(err) {console.log(err);
               return res.status(400).json({ success : false});}
           res.status(200).json({
               succes:true,
               user : doc
           });
       });
   });
});


// login user
app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});

//product
app.get("/api/products", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

//product find by id
app.get('/api/product/:productId', async (req, res) => {
  Product.find({id: req.params.productId})
  .then((productId) => {
    if(productId) {
      console.log("productId", productId);
      res.send(productId);
    }
  })
  .catch((err) => {
    console.log("err", err);
    res.status(500).send({
      message:err.message|| "Some error for retriving a products."
    });
  });
});
//post cart
app.post("/api/carts/:id", async (req, res) => {
  const { productId, quantity, name, price } = req.body;
  const userId = req.params.id; //TODO: the logged in user id

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      //cart exists for user
      let itemIndex = cart.products.findIndex(p => p.productId == productId);

      if (itemIndex > -1) {
        //product exists in the cart, update the quantity
        let productItem = cart.products[itemIndex];
        productItem.quantity = quantity;
        cart.products[itemIndex] = productItem;
      } else {
        //product does not exists in cart, add new item
        cart.products.push({ productId, quantity, name, price });
      }
      cart = await cart.save();
      return res.status(201).send(cart);
    } else {
      //no cart for user, create new cart
      const newCart = await Cart.create({
        userId,
        products: [{ productId, quantity, name, price }]
      });
      
      /* const carts = newCart.save().then((res)=>{
        res.send(res)
      }).catch(err)({req})
      */
      return res.status(201).send(newCart);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

//GET USER CART
app.get("/find/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET ALL
app.get("/carts", async (req, res) => {
  try {
    const carts = await carts.find();
    res.message("my cart data").status(200).json( carts );
  } catch (err) {
    res.status(500).json(err);
  }
});

//Order
//Create order
/*app.post("/api/orders", async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
app.get("/find/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL ORDERS
app.get("/api/order", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
*/

//payment
app.post("/api/payment/:id", async (req, res) => {
     //console.log( "/api/payment/:id i sgetting called  ", req.body);
      
      const id = req.params.id,
      UserId = id
      const payment = new Payment ({
          productId : req.body.productId,
          cartId: req.body.cartId,
          paymentId : req.body.paymentId,
          orderId : req.body.orderId,
          UserId,
      })
      payment.save((err, data) => {

        console.log("err", err, "data", data)
        if(err) {
          res.status(500).send(err);
        }
        else{
          console.log(err);
          res.status(500).send("Sucess full");
        }
      })
 
});

//logout user
 app.get('/api/logout',auth,function(req,res){
        req.user.deleteToken(req.token,(err,user)=>{
            if(err) return res.status(400).send(err);
            res.sendStatus(200);
        });

    }); 

// get logged in user
app.get('/api/profile',auth,function(req,res){
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            name: req.user.firstname + req.user.lastname
            
        })
});


app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});