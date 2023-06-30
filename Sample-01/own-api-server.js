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

require('dotenv').config();

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

const reportApiClientId = process.env.REACT_APP_REPORT_API_CLIENT_ID;
const reportApiClientSecret = process.env.REACT_APP_REPORT_API_CLIENT_SECRET;

// Get access token for report API via M2M app
var options = { method: 'POST',
  url: 'https://dev-zwmgj06ga0j7dtc5.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: `{"client_id":"${reportApiClientId}","client_secret":"${reportApiClientSecret}","audience":"http://localhost:8080/api/v2/","grant_type":"client_credentials"}` };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

//   console.log(body);
});
// GET /authorized - Checks whether user has permission to access resource
app.post('/authorized', function (req, res) {
    const permission = req.body.result

    // if permission arr is not empty after filtering, user has access
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