const express = require('express');
const app = express();
const cors = require("cors");
const { auth } = require('express-oauth2-jwt-bearer');
var request = require("request");

const port = process.env.PORT || 8080;


// var options = { method: 'POST',
//   url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/oauth/token',
//   headers: { 'content-type': 'application/json' },
//   body: '{"client_id":"T0tO4mQPnnN9xn6TrUYgrnh3adtSDW1n","client_secret":"7-PP2SZVMAMsVvWhnM9OwzkLHUVyBGhoFHfJlCD2znREF2c0KIPjQDvKIwV8sGsq","audience":"http://localhost:8080/api/v2/","grant_type":"client_credentials"}' };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

const jwtCheck = auth({
    audience: 'http://localhost:8080/api/v2/',
    issuerBaseURL: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});
  

app.use(cors({ origin: 'http://localhost:3000' }))
// enforce on all endpoints
app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    res.status(200).json({status:200, msg:'User has access to secured resource'});
});

app.listen(port);

console.log('Running on port ', port);