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


app.post('/authorized', function (req, res) {
    const permission = req.body

    // if arr is not empty, user has access
    const authorizedUser = permission.filter(item => item.permission_name === 'read:action-report')
    console.log("authorizedUser: ", authorizedUser)
    if (authorizedUser.length > 0){
        res.status(200).json({status:200, msg:'User has access to secured resource'});
    }
    else{
        res.status(401).json({status:401, msg:'Access denied'});
    }
});

app.listen(port);

console.log('Running on port ', port);