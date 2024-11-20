const mongoose = require("mongoose");

const connection = async () =>{
    await mongoose.connect(process.env.MONGOOSE_CONNECTION);
}
connection();