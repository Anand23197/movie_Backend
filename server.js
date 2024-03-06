const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });


process.on('uncaughtException', (err)=>{
  console.log(err.name, err.message);
  console.log("Uncaught exception occured shutting down...!")
    process.exit(1)
})

const app = require("./app");
const { default: mongoose } = require("mongoose");

console.log(process.env);

mongoose
  .connect(process.env.LOCAL_CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("DB connection successfull");
  })
  // .catch((err) => {
  //   console.log("some error occured while connecting");
  // });

// const testMovie = new Movie({
//     name : "Dark Knight",
//     description : "Action packed movie staring when ghoosling in this thrilling adventures",
//     duration: 140,
// })

// testMovie.save().then(doc =>{
//     console.log(doc);
// }).catch((err)=>{
//     console.log("Error occured: " + err);
// })
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log("server has started");
});

process.on('unhandledRejection', (err)=>{
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured shutting down...")
  server.close(()=>{
    process.exit(1)
  })
 
})