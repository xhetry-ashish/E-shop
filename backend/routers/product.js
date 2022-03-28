const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const {Product} = require("../models/product");
const mongoose = require('mongoose');
const multer = require('multer');

//storing the files(image)
const FILE_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpeg',
  'image/jpg' : 'jpg'
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid Image type..")

    if(isValid){
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(' ','-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

//getting all products implementing filtering also
router.get(`/`, async (req, res) => {
  let filter = {};
  if(req.query.categories){
    filter = {category: req.query.categories.split(',')}
  }
  const productList = await Product.find(filter).populate('category')
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});


//getting a product using id
router.get(`/:id`, async (req, res) => {

  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send("Invalid Product Id..")
  }

  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

//creating a product
router.post(`/`,uploadOptions.single('image'), async(req, res) => {
  const category = await Category.findById(req.body.category);
  if(!category)
  return res.status(400).send("Invalid Category..")

  const file = req.file;
  if(!file)
  return res.status(400).send("No image uploaded...")

  const fileName = req.file.filename;
  const filePath = `${req.protocol}://${req.get('host')}/public/uploads/`

  var product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${filePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
    countInStock: req.body.countInStock,
  })

  product = await product.save();
  if (!product) {
    res.status(500).json({ 
      success: false,
      message:"Product cannont be created.." });
  }
  res.status(201).send(product);
});

//updating a product using id 
router.put(`/:id`, async (req, res) => {

  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send("Invalid Product Id..")
  }

  const category = await Category.findById(req.body.category);
  if(!category)
  return res.status(400).send("Invalid Category..")

  const product = await Product.findByIdAndUpdate(
     req.params.id, 
     {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      countInStock: req.body.countInStock,
     },
     {new:true}
  )
 if(!product)
 return res.status(400).send("The product cannot be updated..")

 res.status(200).send(product);
 
});


//updating a product by adding gallery of images
router.put(`/gallery-images/:id`,uploadOptions.array('images',10), async(req, res) => {

  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send("Invalid Product Id..")
  }

  const files= req.files;
  const imagePaths = []
  const filePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  if(files){
    files.map(file=>{
      imagePaths.push(`${filePath}${file.filename}`)
    })
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    {
     images: imagePaths
    },
    {new:true}
 )
if(!product)
return res.status(400).send("The product cannot be updated..")

res.status(200).send(product);
})


//deleting a product by using id
router.delete(`/:id`,(req,res)=>{
  Product.findByIdAndRemove(req.params.id).then(product =>{
      if(product){
          return res.status(200).json({
              success:true,
              message:" product is deleted.."
          })
      }
      else{
          return res.status(404).json({
              success:false,
              message:"product not found.."

          })
      }
  }).catch(err=>{
      return res.status(400).json({
          success:false,
          error:err
      })
  })
})

//getting product counts
router.get(`/get/count`, async (req, res) => {

  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount
  });
});

//getting featured products
router.get(`/get/featured`, async (req, res) => {

  const productList = await Product.find({isFeatured:true})
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});


module.exports = router;
