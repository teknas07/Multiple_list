
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const day = date.getDate();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true});

const itemSchema = {
  name:String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});

const item2 = new Item({
  name: "Hit the + button to start your todoList!"
});

const item3 = new Item({
  name: "Hello welcome to your todoList!"
});

const defalutItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defalutItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items");
        }
      
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });


 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
  const founditemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(founditemId,function(err){
      if(!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: founditemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
});

app.get("/:listName",function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName},function(err,foundList){
    if(!err){
      if(!foundList){
        // new list
        const list = new List({
          name: listName,
          items: defalutItems
        });
        list.save();
        res.redirect("/" + listName);
      }
    else{
      // display the existing list


      res.render("list", {listTitle: listName , newListItems: foundList.items});
    }
  }
  });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
