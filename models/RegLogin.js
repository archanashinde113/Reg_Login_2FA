const mongoose = require('mongoose');

const RegLoginSchema = new mongoose.Schema({
    Firstname: {
        type:String,
        
    },

    Lastname: {
        type:String,
        
    },

    email: {
        type:String
    },
    phone:{
        type:Number
    },
    
    Password: {
        type : String
    },
   
    otp: {
        type : String
    },

    token:{
        type:String
    },

    authyId: {
        type: String,
       
    },
    countryCode:{
        type:Number
    }
},
{timestamps:true}
) 

module.exports = mongoose.model('reglogin', RegLoginSchema)

