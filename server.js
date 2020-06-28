const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
require("express-async-errors");

const MONGODB_URI = `mongodb://127.0.0.1:27017/job`;
const mongoClient = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
const app = express();
const connectDB = async function () {
  await mongoClient.connect();
  console.info("DB Connected");
};
const getDB = async function () {
  return mongoClient.db("job");
};

app.use(bodyParser.json());

app.use(async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  //   res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/", async function (req, res) {
  const db = await getDB();
  let { platform = "job", jobs = [] } = req.body;

  let results = await Promise.all(
    jobs.map(async (job) => {
      let {
        company,
        jobSalary,
        jobTitle,
        jobLimit,
        publisher,
        companyInfo,
      } = job;

      let existOne = await db
        .collection(platform)
        .findOne({ company, jobSalary, jobTitle });
      if (existOne) {
        let result = await db
          .collection(platform)
          .updateOne(
            { company, jobSalary, jobTitle },
            { $set: { ...job, updatedAt: new Date() } }
          );
        return result;
      } else {
        let result = await db
          .collection(platform)
          .insertOne({ ...job, updatedAt: new Date(), createdAt: new Date() });
        return result;
      }
    })
  );
  //

  res.send(results);
});

app.use(async function (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  res.send(err);
});

app.listen(3000, async function () {
  connectDB();
  console.info("Listen on 3000");
});
