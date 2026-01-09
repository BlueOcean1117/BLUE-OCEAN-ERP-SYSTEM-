const mongoose = require('mongoose');
uri = "mongodb+srv://developer_db_user:Rp286c6UI2eDTi9j@cluster0.smkwprl.mongodb.net/developer_db_user?appName=Cluster0";

const connectDB = async () => { 
    return mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true,}); 

};
module.exports = connectDB;