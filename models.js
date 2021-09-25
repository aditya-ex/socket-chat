const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  socket_id: {
    type: String,
  },
  username: {
    type: String,
  },
  room: {
    type: String,
  },
});

module.exports = Users = mongoose.model("Users", userSchema);