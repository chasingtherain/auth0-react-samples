const express = require('express');
const app = express();
const cors = require("cors");
const { auth } = require('express-oauth2-jwt-bearer');

const port = process.env.PORT || 8080;

const jwtCheck = auth({
    audience: 'http://localhost:8080/api/v2/',
    issuerBaseURL: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});
  
var request = require("request");

app.use(cors({ origin: 'http://localhost:3000' }))
// enforce on all endpoints
app.use(jwtCheck);

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

var request = require("request");
let token = null
var options = { method: 'POST',
  url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"T0tO4mQPnnN9xn6TrUYgrnh3adtSDW1n","client_secret":"7-PP2SZVMAMsVvWhnM9OwzkLHUVyBGhoFHfJlCD2znREF2c0KIPjQDvKIwV8sGsq","audience":"http://localhost:8080/api/v2/","grant_type":"client_credentials"}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

//   console.log(body);
});

app.post('/authorized', function (req, res) {
    const permission = req.body.result

    console.log("permission: ", permission)

    // if arr is not empty, user has access
    const authorizedUser = permission?.filter(item => item.permission_name === 'read:action-report')
    if (authorizedUser.length > 0){
        res.status(200).json({status:200, msg:'User has access to secured resource'});
    }
    else{
        res.status(401).json({status:401, msg:'Access denied'});
    }
});

app.listen(port);

console.log('Running on port ', port);