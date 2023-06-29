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
  

app.use(cors({ origin: 'http://localhost:3000' }))
// enforce on all endpoints
app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    res.status(200).json({status:200, msg:'User has access to secured resource'});
});

app.listen(port);

console.log('Running on port ', port);