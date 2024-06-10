//jshint esversion:6

// requires
// require('dotenv').config();
const express = require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require('mongoose');
// const encrypt=require('mongoose-encryption');           // Used for encryption key protection
// const mb5=require('mb5');       // Used for mb5 protection
// const bcrypt=require('bcrypt');     // Used for bcrypt protection
// const saltRounds=10;     // Used for bcrypt protection
const session=require('express-session');       // Used for Passport Encryption
const passport=require('passport');             // Used for Passport Encryption         
const passportLocalMongoose=require('passport-local-mongoose');     // Used for Passport Encryption

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

app.use(session({           // Used for Passport Encryption
    secret: 'Our little secret.',
    resave: false,
    saveUninitialzed: false
}));

app.use(passport.initialize());         // Used for Passport Encryption
app.use(passport.session());            // Used for Passport Encryption

// Mongoose
mongoose.connect('mongodb://localhost:27017/secretsDB',{useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

const userSchema= new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);       // Used for Passport Encryption

// const secret=process.env.SECRET;     // Used as Environment Variable

// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});     // Used for encryption key protection

const User = new mongoose.model('User',userSchema);

// Used for Passport Encryption
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

// app.post('/register',function(req,res){
//     bcrypt.hash(req.body.password, saltRounds, function
//         (err,hash){         // Used for bcrypt encryption
            
//     const newUser=new User({
//         email: req.body.email,
//         password: hash          // Used for bcrypt encryption
//         // password: md5(req.body.password)        // Used for md5 protection
//     })

//     newUser.save(function(err){
//         if(err){
//             console.log(err);
//         } else {
//             res.render('secrets');
//         }
//     })
//     })
// })

app.post('/login',function(req,res){
    const email= req.body.email;
    const password= req.body.password;
    // const password= md5(req.body.password);     // Used for md5 protection
    
    User.findOne({email: email},function(err,foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                bcrypt.compare(password,foundUser.password, function(err,result){
                    if(result===true){
                        res.render('secrets');
                    }
                })
            }
        }
    })
})

// Used for Passport Encryption
app.get('/secrets',function(req,res){
    if(req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.post('/register',function(req,res){
        User.register({email:req.body.email}, req.body.password, function(err,user){
            if(err){
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req,res,function(){
                    res.redirect('/secrets');
                });
            }
        });
})

// app.post('/login',function(req,res){
//     const user=new User({
//         email: req.body.email,
//         password: req.body.password,
//     })

//     req.login(user,function(err){
//         if(err){
//             console.log(err);
//         } else {
//             passport.authenticate('local')(req,res,function(){
//                 res.redirect('/secrets');
//             });
//         }
//     })
// })

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

// Listening
const port=(process.env.PORT || 3000);
app.listen(port,function(err){
    console.log(`Listening at port ${port}`);
})