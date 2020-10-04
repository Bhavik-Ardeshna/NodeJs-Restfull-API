const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ProductSchema = require('../model/products');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const storage = multer.diskStorage({
  destination:function (req,file,cb){
      //cb is callback function
      cb(null,'./uploads/');
      //here null means handle error
  },
  filename:function (req,file,cb) {
    // const suffix = Date.now() + '-' + Math.round(Math.random * 1E9);
    cb(null,file.originalname);
  }
});

const fileFilter = (req,file,cb)=>{
  if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null,true);//it will save after passing thriugh fileFilter
  }
  else{
    cb(null,false);
  }
};

const upload = multer({
  storage:storage,
  limits:{
    fileSize:1024*1024*5
  },
  fileFilter:fileFilter
});

router.get('/',(req,res,next)=>{
  ProductSchema.find()
  .select("name price _id productImage")
  .exec()
  .then(result=>{
    const response = {
      count : result.length,
      products : result.map(data=>{
        return {
          name : data.name,
          price : data.price,
          productImage : data.productImage,
          _id : data._id,
          request : {
            type : "GET",
            url : "http://localhost:3000/products/"+data._id
          }
        }
      })
    }
    res.status(200).json({
      response
    });
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  });
})

router.post('/',upload.single('productImage'),checkAuth,(req,res,next)=>{
  console.log(req.file);
  const product = new ProductSchema({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product.save()
    .then(result=>{
      res.status(201).json({
        message: 'Products Created Successfully',
        product: {
          name : result.name,
          price : result.price,
          _id : result._id,
          request : {
            type : "GET",
            url : "http://localhost:3000/products/"+result._id
          }
        }
      });
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error : err
      })
    });
})

router.get('/:productID',(req,res,next)=>{
  const id = req.params.productID;
  ProductSchema.findById(id)
  .select("name price _id productImage")
  .exec()
  .then(result=>{
    res.status(200).json({
      message: 'Here is the product with _id :'+result.id,
      product: {
        name : result.name,
        price : result.price,
        productImage: result.productImage,
        _id : result._id,
        request : {
          type : "GET",
          url : "http://localhost:3000/products/"+result._id
        }
      }
    });
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json({
      err:err
    });
  });
})

router.patch('/:productID',(req,res,next)=>{
  const id = req.params.productID;
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propertyName] = ops.value;
  }
  ProductSchema.update({_id:id},{$set: updateOps})
  .exec()
  .then(result=>{
    res.status(400).json({
      message: 'product with _id :'+ id+ ' is update',
      product: {
        request : {
          type : "GET",
          url : "http://localhost:3000/products/"+id
        }
      }
    });
  })
  .catch(err=>{
    res.status(500).json({
      error: err
    });
  });

})

router.delete('/:productID',(req,res,next)=>{
  const id = req.params.productID;
  ProductSchema.remove({_id:id})
  .exec()
  .then(result=>{
    res.status(200).json({
      message: "product with id :"+ id + " deleted",
      request : {
        type : "POST",
        url : "http://localhost:3000/products",
        body : {
          name : "String",
          price : "Number"
        }
      }
    });
  })
  .catch(err=>{
    res.status(500).json({
      error : err
    })
  });
})

module.exports = router;
