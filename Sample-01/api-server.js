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
  
  const token = req.auth.token

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

app.get("/api/v2/users/{id}/roles", checkJwt, (req, res) => {
  
  const token = req.auth.token

  let config = {
    method: 'get',
    url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/api/v2/users/{id}/roles',
    headers: { 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${token}`
    }
  };

  axios(config)
  .then((response) => {
    res.json({ message: 'called get user role API successfully', result: response.data });
  })
  .catch((error) => {
    console.log(error);
    res.send({
      msg: "failed to call get user role API", 
      error: error
    });
  });

});

app.get("/api/v2/actions/actions", checkJwt, (req, res) => {
  
  const token = req.auth.token

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
