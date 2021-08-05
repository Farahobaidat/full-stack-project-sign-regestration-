const express = require('express');
const app = express();
const  bodyParser  =  require('body-parser');
const port = 6000; 
const mysql = require('mysql');
const bcrypt = require("bcrypt");


app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
let parseBody = bodyParser.urlencoded({ extended: true });

// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
//   next();
//   });  

  let connection = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'farah',
    password: 'Farah98* ',
    database: 'users'
});


app.post('/users/signup',parseBody,function(request, response){
  let username = request.body.username;
  let password = request.body.password;
  let email = request.body.email;
  if (!username || !password ||!email|| username.length > 50||email.length > 50) {
    console.log(request.body);
    response.status(400).send("check your input values");
    return;
  }
    connection.query("SELECT email FROM `Users` WHERE email=?",[email],function(err,array){
      let email1=array[0];
      if (email1) {
        response.status(402).send("email is already exists");
        return;
    }
  
       bcrypt.hash(password,5,function(err, hash) {
         if (err) {
      response.status(500).send("check your password");
      return;
         }
          connection.query("INSERT INTO `Users` (username, email,password ) VALUES (?, ?, ?)", [username,email,hash], function(err) {
            if (err) {
                response.status(500).send("wrong");
                return;
            }

            response.status(201).send("sign up done");
        });
    });

  });
  });


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});