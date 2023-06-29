const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");
const axios = require('axios');
var request = require("request");
const app = express();
const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;


var request = require("request");
let token = null
var options = { method: 'POST',
  url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"qUdhoqD4lyHTh3U10em7MR6Biji1C4Nk","client_secret":"8bnJD9P25UGRnuGeWpits5Vn2scHHhpHqv3r-GoXNUUUEs5CDGiFOwM24NfCO7ZL","audience":"https://dev-zwmgj06ga0j7dtc5.us.auth0.com/api/v2/","grant_type":"client_credentials"}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  
  token = JSON.parse(body).access_token
});

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.get("/api/v2/clients", checkJwt, (req, res) => {
  
  let config = {
    method: 'get',
    url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/api/v2/clients',
    headers: { 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${token}`
    }
  };

  axios(config)
  .then((response) => {
    res.json({ message: 'called get clients API successfully', result: response.data });
  })
  .catch((error) => {
    console.log(error);
    res.send({
      msg: "failed to call get clients API", 
      error: error
    });
  });

});

app.post("/api/user/permission", checkJwt, (req, res) => {

  const user_id = req.body[0]
  let config = {
    method: 'get',
    url: `https://dev-zwmgj06ga0j7dtc5.us.auth0.com/api/v2/users/${user_id}/permissions`,
    headers: { 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${token}`
    }
  };

  axios(config)
  .then((response) => {
    res.json({ message: 'called get user permission API successfully', result: response.data });
  })
  .catch((error) => {
    console.log(error);
    res.send({
      msg: "failed to call get user permission API", 
      error: error
    });
  });

});

app.get("/api/v2/actions/actions", checkJwt, (req, res) => {
  
  let config = {
    method: 'get',
    url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/api/v2/actions/actions?deployed=true',
    headers: { 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${token}`
    }
  };
  
  axios(config)
  .then((response) => {
    res.json({ message: 'called get Actions API successfully', result: response.data });
  })
  .catch((error) => {
    console.log(error);
    res.send({
      msg: "failed to call get Actions API", 
      error: error
    });
  });

});

app.get('/get-report-api-token', function (req, res) {

  var options = { method: 'POST',
  url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"T0tO4mQPnnN9xn6TrUYgrnh3adtSDW1n","client_secret":"7-PP2SZVMAMsVvWhnM9OwzkLHUVyBGhoFHfJlCD2znREF2c0KIPjQDvKIwV8sGsq","audience":"http://localhost:8080/api/v2/","grant_type":"client_credentials"}' };

  request(options, function (error, response, body) {
  if (error) throw new Error(error);
      res.json(response.body);
  });

});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
