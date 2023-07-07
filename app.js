//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const { MongoClient } = require("mongodb");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-sven:admin@cluster0.tsvqkuv.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name:{
    reqired: true,
    type: String
  }
})
const Item = mongoose.model("Item", itemSchema );


const listSchema = {
  name:String,
  items:[itemSchema]
}
const List = mongoose.model("list", listSchema);

const clean = new Item({
  name:"Clean the house"
})

const shopping = new Item ({
  name:"Go shopping"
})
const cook = new Item ({
  name:"Cook some food "
})

const startingItems= [clean, shopping, cook];





const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
  

app.get("/", function(req, res) {

  Item.find({})
  .then(findItems=>{

    if (findItems.length === 0) {
      Item.insertMany(startingItems)
      .then(()=>{
      console.log("items was added succesfully ");
      res.redirect("/");
})
    }else{
      res.render("list", {listTitle: "Today",newListItems: findItems});

    }

  });

});

app.post("/", function(req, res){

  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName})
    .then((result)=>{
      result.items.push(item);
      result.save();
      res.redirect("/"+listName);
    })
  }
  

 
  
  
});

app.post("/delete", (req,res)=>{

  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  const checkedItemID= checkedItem.substring(1)

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemID)
  .then(()=>{
    console.log("Item was succesfuly deleted");
  })
  res.redirect("/");
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id: checkedItemID}}})
      .then(()=>{
        res.redirect("/"+listName);
      })
  }

  
})


app.get("/:customListName", (req,res)=>{
  const customListName = _.capitalize(req.params.customListName);


List.findOne({name:customListName})
.then(result => {
  // Handle the resolved value (result)
  if (!result) {

    const list = new List({
      name: customListName,
      items: startingItems
    })
    list.save();
    res.redirect("/"+ customListName );
   } else {


    res.render("list", {listTitle: result.name, newListItems: result.items});

    // Your code for the else block here
  }
})
})
// app.post("/:customListName", function(req, res){

//   const param = req.params.customListName;
//   const itemName = req.body.newItem;
//   const listName = req.body.button

//   console.log(listName);

//   List.findOne({name:param})
//   .then((result)=>{
//     result.items.push(itemName);
//     res.redirect("/"+param);
//   })
  
// });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
