const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coordinatesSchema = new Schema({
   coordinates : 
        [{
        lat : {type:Number, required:true},
        lng : {type:Number, required:true}
    }]
});


module.exports = mongoose.model('Coordinates', coordinatesSchema, 'Coordinates');