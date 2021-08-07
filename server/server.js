const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 6000;
const mysql = require('mysql');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.get('/cookie', function (req, res) {
  
  console.log('Cookies: ', req.cookies.jwt);
  
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
  res.send("yeah");
})

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
let parseBody = bodyParser.urlencoded({ extended: true });

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
  });  

let connection = mysql.createPool({
  connectionLimit: 50,
  host: 'localhost',
  user: 'admin',
  password: 'asdQWE1@ ',
  database: 'Users'
});

let token1 = null;

const createToken = (email) =>{
   jwt.sign(
    {email},
    "secret",
    {
      expiresIn:"1h"
    }
  );
}

const requireAuth = (req, res,next) => {
  console.log("hi");
  const token1 = req.cookies;
  console.log('token ',token1);
  // check jwt token exist & verified 
  if (token1) {
    jwt.verify(token1, "secret",(err,decodedToken)=>{
      if(err) {
        console.log("yes");
        // bring undefinedhim back to login screen
        res.redirect("/login");
      }
      
      else {
        console.log('decoded ',decodedToken);
        next();
      }
      
    })
  }
  else{
    res.redirect("/login");
  }
}

app.post('/users/signup', parseBody, function (request, response) {
  let username = request.body.username;
  let password = request.body.password;
  let email = request.body.email;
  if (!username || !password || !email || username.length > 50 || email.length > 50) {
    console.log(request.body);
    response.status(400).send("check your input values");
    return;
  }
  connection.query("SELECT email FROM `Users` WHERE email=?", [email], function (err, array) {
    let email1 = array[0];
    if (email1) {
      response.status(402).send("email is already exists");
      return;
    }

    bcrypt.hash(password, 5, function (err, hash) {
      if (err) {
        response.status(500).send("check your password");
        return;
      }
      connection.query("INSERT INTO `Users` (username, email,password ) VALUES (?, ?, ?)", [username, email, hash], function (err) {
        if (err) {
          response.status(500).send("wrong");
          return;
        }

        response.status(201).send("sign up done");
      });
    });

  });
});


app.post('/users/signin', parseBody, function (req, res) {
  // const email = req.body.email;
  // const password = req.body.password
  // let hash = bcrypt.hashSync(password, 5);
  // const dcryptPassword = bcrypt.compareSync(password, hash);
  // console.log(dcryptPassword,email,password,hash);
  // if (email && dcryptPassword) {
  //     connection.query('SELECT email,password FROM Users WHERE email = ? password = ?', [email,dcryptPassword], 
  //     (error, results,failed) => {
  //       // let email1 = results[0];
  //       // console.log('email ',email1);
  //         if (results.length > 0 ) {
  //             res.send("Successful");
  //         }

  //         else {
  //           console.log(email,dcryptPassword,results.length,results);
  //             res.send('Incorrect Email and/or Password!');
  //         }           
  //         res.end();
  //     });
  // } else {
  //     res.send('Please enter email and Password!');
  //     res.end();
  // }

  let email = req.body.email;
  let password = req.body.password;


  if (!email || !password) {
    res.status(400).send("Please fill your Email and Password");
    return;
  }

  connection.query("SELECT email, password FROM Users WHERE email=?", [email], function (err, rows) {
    var user = rows[0];
    
    if (!user) {
      res.status(400).send("email is wrong");
      return;
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        res.status(500);
        res.send("Auth Faill");
        return;
      }
      
      if (result == true) {
        const token = createToken(user.email)
        res.cookie('jwt', token,{httpOnly: true , seconds : 30});
        res.status(200).send(token);
      }
      else{
        res.status(401).send("Wrong password");  
      }
      
    });

    
  });


});

app.get("/users/home",requireAuth, function (req, res) {
  res.render("/home")
  res.status(200).send("yes");
  console.log("no")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});