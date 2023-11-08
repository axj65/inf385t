const express = require("express");
const path = require('path');
const session = require('express-session');
const nodemailer=require('nodemailer');

// The router will be added as a middleware and will take control of requests starting with path /record.
const appRouter = express.Router();

appRouter.use(express.json());

appRouter.use(session({secret: "Your secret key", resave: false, saveUninitialized: false}));

//var session;

const dbo = require("../database/conn");

//Serve static files from the "public" directory

appRouter.route('/').get(function (req, res) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'public', 'index_home.html'));
});

// Serve static files from the "public" directory
// MAKE SURE THIS GOES UNDER THE '/' ROUTE
appRouter.use(express.static(path.join(__dirname, '..', '..', 'client', 'public')));


//try
// POST route to handle search query from Form.js
appRouter.post('/api/query', async (req, res) => {
   console.log("Received request on /api/query");
   let db_connect = dbo.getDb();
   const { event, weapon, number } = req.body;
 
   // Construct a query object based on the supplied form data
   let query = {};
   if (event) query.event = event;
   if (weapon) query.weapon = weapon;
   if (number) query.numberToTrain = parseInt(number);

   console.log('Constructed query:', query); // Log the constructed query
 
   try {
     // Perform the search in the appropriate collection
     const results = await db_connect.collection("individualQualifications").find(query).toArray();
     console.log('Query results:', results); // Log the results

     // If the results are needed on the client side, send them back
     res.status(200).json(results);
   } catch (error) {
     // Handle errors that may occur during the search
     console.error('Error during database query:', error); // Log any errors
     res.status(500).json({ message: "Error retrieving training records", error: error.message });
   }
 });
 
appRouter.use('/app', express.static(path.join(__dirname, '..', '..', 'client', 'build')));

appRouter.get('/app/*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'build', 'index.html'));
});

// This section will help you get a list of all the records.
appRouter.route("/table").get(async function (req, res) {
  let db_connect = dbo.getDb("ammoForecastTool");

  // Initialize query object
  let query = {};

  // Check if eventType parameter is provided and use a regex to match the pattern
  if (req.query.eventType) {
    query.eventType = new RegExp(req.query.eventType, 'i'); // 'i' for case-insensitive
  }

  // You can add other query parameters checks here if necessary

  // Clean the query object to remove undefined or empty keys
  Object.keys(query).forEach(key => {
    if (query[key] === undefined || query[key] === '') {
      delete query[key];
    }
  });

  // Fetch the data from the database using the constructed query
  try {
    const results = await db_connect.collection("individualQualifications")
      .find(query)
      .toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error });
  }
});


// Route for user to register.

appRouter.route("/register").post(function (req, response) {
   let db_connect = dbo.getDb();
   let newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      address: req.body.address,
   };

   db_connect.collection("customers").insertOne(newUser, function (err, res) {
      if (err) throw err;
      response.json(res);
   });
});

// Route for user to login.
appRouter.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'build', 'index.html'));
});

appRouter.route("/login").post(async function (req, response) {
  try {
    let db_connect = dbo.getDb();
    let loginCredentials = {
      email: req.body.email,
      password: req.body.password,
    };

    const user = await db_connect.collection("customers").findOne({ email: loginCredentials.email });

    if (user) {
      if (user.password === loginCredentials.password) {
        req.session.user = loginCredentials.email;
        response.send("logged in!");
      } else {
        response.status(401).send("email or/and password is incorrect!"); // Unauthorized
      }
    }   else {
        response.status(401).send("email or/and password is incorrect!"); // Unauthorized
    }
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).send("Internal server error occurred while trying to log in."); // Internal Server Error
  }
});


//sending email from contact form
appRouter.post('/send-email', (req, res) => {
   let transporter = nodemailer.createTransport({
     service:'gmail',
     auth:{
      user:'jessica.ts.weng@gmail.com',
      pass:'uenrocernzqhyveg'
     } 
   });


   let mailOptions = {
     from: req.body.email,
     to: 'jessica.ts.weng@gmail.com',
     subject: `New Contact Message from ${req.body.name} | Ammo Forecast Tool`,
     text: `Name: ${req.body.name}\n\nEmail: ${req.body.message}\n\nMessage: ${req.body.message}`
   };

   transporter.sendMail(mailOptions, (error, info) => {
     if (error) {
       res.status(500).send({ error: "Error occurred while trying to send email" });
     } else {
       res.send({ success: "Email sent successfully" });
     }
   });
});
  

module.exports = appRouter;