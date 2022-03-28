const express = require('express');
const router = express.Router();
const {Category} = require("../models/category");

//getting all category lists
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

//getting category by id
router.get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id );
    if (!category ) {
      res.status(500).json({ 
          success: false,
          message:"category with given id is not found.."
         });
    }
    res.status(200).send(category);
    
    
  });

//creating a category 
router.post(`/`, async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    image: req.body.image 
  });

   categorySaved = await category.save();
  if(!categorySaved)
  return res.status(400).send("The category cannot be created..")

  res.status(200).send(categorySaved);
  
});

//updating a category 
router.put(`/:id`, async (req, res) => {
     const category = await Category.findByIdAndUpdate(
        req.params.id, 
        {
            name: req.body.name,
            icon:req.body.icon,
            color: req.body.color,
            image: req.body.image
        },
        {new:true}
     )
    if(!category)
    return res.status(400).send("The category cannot be updated..")
  
    res.status(200).send(category);
    
  });

//deleting a category by id
router.delete(`/:id`,(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({
                success:true,
                message:" category is deleted.."
            })
        }
        else{
            return res.status(404).json({
                success:false,
                message:"category not found.."

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