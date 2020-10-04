const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrderSchema = require('../model/orders');

router.get('/',(req,res,next)=>{
  OrderSchema.find()
    .select("quantity product _id")
    .populate('product',"name price _id")
    .exec()
    .then(result=>{
      res.status(200).json({
        count : result.length,
        orders : result.map(data=>{
          return {
            productID: data.product,
            quantity: data.quantity,
            _id: data._id,
          }
        })
      });
    })
    .catch(err=>{
      res.status(500).json({
        message: err
      });
    })
})

router.post('/',(req,res,next)=>{
  const order = new OrderSchema({
    _id: new mongoose.Types.ObjectId(),
    quantity: req.body.quantity,
    product: req.body.productID
  });
  order.save()
    .then(result=>{
      res.status(201).json({
        message: 'Order Created Successfully',
        order: {
          productID : result.product,
          quantitiy : result.quantity,
          _id : result._id,
        }
      });
    })
    .catch(err=>{
      message: "Error occured in posting the order"
    });
})

router.get('/:orderID',(req,res,next)=>{
  const id = req.params.orderID;
  OrderSchema.findById(id)
  .select("quantity product _id")
  .exec()
  .then(data=>{
    res.status(200).json({
      orders :{
          productID: data.product,
          quantity: data.quantity,
          _id: id,
        }
      })
    })
  .catch(err=>{
    res.status(500).json({
      message: err
    });
  });
})

router.delete('/:orderID',(req,res,next)=>{
  const id = req.params.orderID;
  OrderSchema.remove({_id:id})
    .exec()
    .then(result=>{
      res.status(200).json({
        message: 'Orders DELETE request'+id+" deleted",
      });
    })
    .catch(err=>{
      res.status(500).json({
        message: err
      });
    });

})
module.exports = router;
