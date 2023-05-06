const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Coordinates = require('./model');
const intersection = require('./intersection');
app.use(bodyParser.json());

const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));

const DB = "mongodb+srv://hubballisiddaraj:08310831@realestate-nft.ysnhfup.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB)
  .then(() => console.log("database connection successfull."))
  .catch((err) => console.log(err));

app.post('/coordinates', async (req, res) => {
    // Extract the coordinates data from the request body
    let coords ={coordinates:req.body};

    // Create a new Mongoose model instance using the extracted data
    let newCoordinates = new Coordinates(coords);

    // Check if it intersects with already existing polygons
    let node1 = []; // new node

    //fetch all coordinates from the mongodb
    let allCoordinates = await Coordinates.find({});

    for(let i=0;i<newCoordinates.coordinates.length;i++) {
        node1.push({x:newCoordinates.coordinates[i].lat, y:newCoordinates.coordinates[i].lng});
    }

    let valid = true;

    for(let i=0;i<allCoordinates.length;i++) {
      let polyLength = allCoordinates[i].coordinates.length;
      let node2 = []; // all nodes one by one
      for(let j=0;j<polyLength;j++) {
        node2.push({x:allCoordinates[i].coordinates[j].lat, y:allCoordinates[i].coordinates[j].lng});
      }
      let ans = await intersection.intersect(node1, node2);
      if(ans.length != 0) {
        valid = false;
        break;
      }
    }

    let ack = {
      verified: false
    }

    if(valid == true) {
      console.log("valid polygon");
      //Save the new model instance to the database
      try {
          const savedCoordinates = await newCoordinates.save();
          ack.verified = true;
          res.status(200).json(ack);
      }catch (error) {
          res.status(500).json(ack);
      }
    }
    else {
      console.log("invalid polygon");
      res.status(200).json(ack);
    }

});


app.listen(4000, () => {
  console.log("app listening at port 4000...");
});