import express, { Express, Request, Response } from "express";

const app: Express = express();
const cors = require('cors');
const port = 3001;
const satellite = require('satellite.js');

// Allow requests from your React app's origin (http://localhost:3000)
const corsOptions = {
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));

// NEUDOSE TLE
var tleLine1 = '1 99172U          23114.51041667 -.00000031  00000-0 -52816-6 0 00003',
    tleLine2 = '2 99172 051.6609 234.5214 0004321 232.3001 269.5133 15.50456434000013';  

// GS info
var observerGd = {
    longitude: satellite.degreesToRadians(79.9201),
    latitude: satellite.degreesToRadians(43.2585),
    height: 0.370
};
      
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
});

// For more satellite info, check out: https://github.com/shashwatak/satellite-js
app.get('/getSatelliteInfo', (req, res) => {
  var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  
  var positionAndVelocity = satellite.propagate(satrec, new Date());
  var gmst = satellite.gstime(new Date());
  
  var positionEci = positionAndVelocity.position,
      velocityEci = positionAndVelocity.velocity;

  var positionEcf   = satellite.eciToEcf(positionEci, gmst),
      positionGd    = satellite.eciToGeodetic(positionEci, gmst),
      lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf)

  var longitude = positionGd.longitude,
      latitude  = positionGd.latitude,
      height    = positionGd.height;

  var azimuth   = lookAngles.azimuth,
      elevation = lookAngles.elevation,
      rangeSat  = lookAngles.rangeSat;


  res.json({positionEci, velocityEci, longitude, latitude, height, azimuth, elevation, rangeSat});
  
});

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});