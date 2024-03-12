// Import the express module
const express = require('express');

// Import the fs module
const fs = require('fs');

// Create an express app
const app = express();

// Use the express.static middleware to serve static files from the public folder
app.use(express.static('public'));

// Use the body-parser middleware to parse the request body as JSON
app.use(express.json());

// Define a route for the home page
app.get('/', (req, res) => {
  // Send the HTML file as a response
  res.sendFile(__dirname + '/public/elo_page.html');
});

function logTime(extraText){
  let currentTime = new Date();
  let currentMonth = currentTime.getMonth() + 1;
  let currentDate = currentTime.getDate();
  let currentHour = currentTime.getHours();
  let currentMinute = currentTime.getMinutes();
  let currentSecond = currentTime.getSeconds();
  console.log(currentMonth+"-"+currentDate+" "+
                currentHour+":"+currentMinute+":"+currentSecond, extraText);
}

// Define a route for the JSON file
app.get('/data', (req, res) => {
  logTime("app.get");
  // Send the JSON file as a response
  res.sendFile(__dirname + '/data.json');
});

app.get('/elo', (req, res) => {
  logTime('app.elo');
  res.sendFile(__dirname + '/elo_data.json');
});

app.post('/sendEloData', (req, res) => {
  logTime("app.sendEloData");

  const receivedData = req.body;
  fs.writeFile(__dirname + '/elo_data.json', JSON.stringify(receivedData), 'utf8', (err) => {
    if (err) {
      // Handle any errors
      console.error(err); // Log the error to the console
      res.status(500).send('Server error'); // Send an error response
    } else {
    // Send a success response
      res.status(200).send('Data saved');
    }
  });
});

// Define a route for the POST request
app.post('/sendSuggestion', (req, res) => {
  // Get the new data from the request body
  logTime("app.post");
  
  const receivedData = req.body; // comes as dictionary/array
  // Read the existing data from the file
  fs.readFile(__dirname + '/data.json', 'utf8', (err, existingDataString) => { // comes as string
    if (err) {
      // Handle any errors
      console.error(err); // Log the error to the console
      res.status(500).send('Server error'); // Send an error response
    } else {
      // Parse the data as JSON
      const existingData = JSON.parse(existingDataString);
      // Push the new data into the array
      //jsonData.push(newData);
      // Stringify the data back to JSON
      const receivedDataString = JSON.stringify(receivedData);
      // console.log("existingData", existingDataString);
      // console.log("existingData", existingData);
      // console.log("updatedData", receivedDataString);
      // console.log("updatedData", receivedData);
      // Write the updated data to the file
      // fs.writeFile(__dirname + '/data.json', updatedData, 'utf8', (err) => {
      //   if (err) {
      //     // Handle any errors
      //     console.error(err); // Log the error to the console
      //     res.status(500).send('Server error'); // Send an error response
      //   } else {
      //     // Send a success response
      //     res.status(200).send('Data saved');
      //   }
      // });
    }
  });
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

