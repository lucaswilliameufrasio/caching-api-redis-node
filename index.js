"use strict";
const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 4000;
const PORT_REDIS = process.env.PORT || 6379;

const app = express();
const redisClient = redis.createClient(PORT_REDIS);

const setValuesWithExpiration = (key, ttl = 86400, value) => {
  redisClient.setex(key, ttl, JSON.stringify(value));
};

const getCache = (req, res, next) => {
  let key = req.route.path;
  redisClient.get(key, (error, data) => {
    if (error) res.status(400).send(err);
    if (data !== null) res.status(200).send(JSON.parse(data));
    else next();
  });
};

app.get("/spacex/launches", getCache, (req, res) => {
  fetch("https://api.spacexdata.com/v3/launches/latest")
    .then((res) => res.json())
    .then((json) => {
      setValuesWithExpiration(req.route.path, 86400, json);
      res.status(200).send(json);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error);
    });
});
app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));
