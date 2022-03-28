const express = require('express');
const router = express.Router();
const {User} = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


//getting all users
router.get(`/`,async(req,res)=>{
    const user = await User.find().select('-passwordHash');

    if (!user){
      return  res.status(500).json({ success: false });
  }
  res.send(user);

})

//getting a user by using id
router.get(`/:id`,async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user){
      return  res.status(500).json({ success: false });
  }
  res.send(user);

})

//creating a user
router.post(`/register`, async(req, res) => {
  
    let user = new User({
      name: req.body.name,
      passwordHash: bcrypt.hashSync(req.body.password,10),
      email: req.body.email,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country
    })
  
    user = await user.save();
    if (!user) {
      res.status(500).json({ 
        success: false,
        message:"User cannont be created.." });
    }
    res.status(201).send(user);
  });

  //logging in 
  router.post(`/login`,async(req,res)=>{
      const secret = process.env.secret;
      const user = await User.findOne({
          email:req.body.email
      })
      if(!user){
          return res.status(400).send("User not found..")
      }
      if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign({
            userId:user.id,
            isAdmin:user.isAdmin
        },
        secret,
        {expiresIn:'1d'}
        )  
        res.status(200).send({
            user:user.email,
            token:token
        })
      }
      else{
          res.status(400).send("password is wrong..")
      }
  })

//getting user counts
router.get(`/get/count`, async (req, res) => {

    const userCount = await User.countDocuments();
    if (!userCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      userCount: userCount
    });
  });

//deleting a user by using id
router.delete(`/:id`,(req,res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({
                success:true,
                message:" user is deleted.."
            })
        }
        else{
            return res.status(404).json({
                success:false,
                message:"user not found.."
  
            })
        }
    }).catch(err=>{
        return res.status(400).json({
            success:false,
            error:err
        })
    })
  })

  module.exports = router;
