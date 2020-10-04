const express = require('express');
const app = express();
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/basicapp",{useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true},(err)=>{
  if(!err){
    console.log("Success mongod");
  }else{
    console.log("error mongod");
  }
});

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



//Remove the cors(cross site resources sharing)error (Remember)
app.use((req,res,next)=>{
  res.header('Allow-Control-Allow-Origin','*');
  res.header('Allow-Control-Allow-Headers','Origin,Accept,X-Requested-With,Authorization,Content-Type');
  if(req.method === 'OPTIONS'){
    req.hearder('Allow-Control-Allow-Methods','*');
    return req.status(200).json({});
  }
  next();
})

app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user', userRoutes);

//Error Handling (Remember)
app.use((req,res,next)=>{
  const error = new Error('Opps! Not found...');
  error.status = 404;
  next(error);
})

app.use((error,req,res,next)=>{
  res.status(error.status || 401);
  res.json({
    error:{
      message:error.message
    }
  });
})
module.exports = app;
