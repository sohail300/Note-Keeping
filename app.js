//jshint esversion:6

// requires
require('dotenv').config();
const express = require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

// Mongoose
mongoose.connect('mongodb://localhost:27017/secretsDB',{useNewUrlParser: true});

const userSchema= new mongoose.Schema({
    email: String,
    password: String
})

const secret=process.env.SECRET;

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = new mongoose.model('User',userSchema);

// Routing
app.get('/',function(req,res){
    res.render('home');
});

app.get('/register',function(req,res){
    res.render('register');
});

app.get('/login',function(req,res){
    res.render('login');
});

app.post('/register',function(req,res){
    const newUser=new User({
        email: req.body.email,
        password: req.body.password
    })

    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.render('secrets');
        }
    })
})

app.post('/login',function(req,res){
    const email= req.body.email;
    const password= req.body.password;
    
    User.findOne({email: email},function(err,result){
        if(err){
            console.log(err);
        } else {
            if(result){
                if(result.password===password){
                    res.render('secrets');
                }
            }
        }
    })
})

// Listening
// const port=3000 || 
app.listen(3000,function(err){
    console.log('Listening at port 3000');
})