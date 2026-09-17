// isme ham aapni data ko initilized kar rhe hai.

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
main()
  .then(() => {
    console.log("Connected to DB");
    initDB(); // DB connect hone ke baad data initialize hoga
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6aa3ab71505d7f69933c23a2",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was inisilized");
};
