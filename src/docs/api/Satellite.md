#Satellite API

Location: `leo-server-app/src/routes/satellite.ts`

Base URL: `/satellite/{endpoint}`

The purpose of these endpoint groupings is to access data regarding the satellite, including orbital data, next overpasses, as well as database mangement regarding satellites.

---

# Satellite Endpoints

##`/getSatelliteInfo`
Type: `GET`
Request: `none`
Response: `{
    positionEci,
    velocityEci,
    longitude,
    latitude,
    height,
    azimuth,
    elevation,
    rangeSat
  }`

Returns a dictionary of floats. The units are as follows:

longitude : degrees
latitude : degrees
height : km
azimuth : degrees
elevation : degrees
rangeSat: km

This endpoint is for retrieving satellite information. Calculations are done through the `satellite.js` library based off TLE data, found [here](https://github.com/shashwatak/satellite-js). TLE data of a satellite can be found online, like on [n2yo](https://www.n2yo.com/database/?name=NEUDOSE#results).

##`/getSatelliteName`
Type: `GET`
Request: `{noradId: String}`
Response: `{ satelliteName: string}`

Returns the satellite name for a given NORAD id.

##`/getPolarPlotData`
Type: `GET`
Request: `{START_DATE: String, END_DATE: String}`
Response: `{ [{ azimuth: number, elevation: number }] }`

Returns an array of `[azimuth, elevation]`, points for a polar plot, in degrees, with points every 10 seconds. START_DATE and END_DATE should be strings which can be put into the `Date()` constructor, i.e "2024-01-06T10:15:00Z". Note the Z is very important for calculations. Uses getSatelliteInfo() function.

This endpoint is used for retrieving the polar plot points for a given date range.

##`/getMaxElevation`
Type: `GET`
Request: `{START_DATE: String, END_DATE: String}`
Response: `{ [{ azimuth: number, elevation: number }] }`

Returns an maximum elevation for a satellite between two dates in degrees.START_DATE and END_DATE should be strings which can be put into the `Date()` constructor, i.e "2024-01-06T10:15:00Z". Note the Z is very important for calculations.

This endpoint is used for retrieving the maximum elevation for a given date range.

##`/getNextPasses`
Type: `GET`
Request: `none`
Response: `{ nextPasses }`

Returns an array of `[enterInfo, exitInfo]`, with both being a dictionary of the form:
`{
    type: string,
    time: string,
    azimuth: float,
    elevation: float,
}`. `type` can be "Enter" or "Exit", and time is a formatted human-readable time (i.e 9:00 AM)

This endpoint is for retrieving the next passes for the given week.

##`/getSolarIlluminationCycle`
Type: `GET`
Request: `none`
Response: `{ nextIlluminations }`

Returns an array of `[enterInfo, exitInfo]`, with both being a dictionary of the form:
`{
    type: string,
    time: string,
    longitude: float,
    latitude: float,
}`. `type` can be "Enter" or "Exit", and time is a formatted human-readable time (i.e 9:00 AM)

This endpoint is for retrieving the solar illumination cycles of a satellite for the given week. Only cycles of > 10 minutes are recorded to eliminate noise.

##`/changeTLE`
Type: `POST`
Request: `{"noradID": string}`
Response: `none`

Changes the TLE of the currently viewed satellite on screen.

##`/ping`
Type: `GET`
Request: `none`
Response `{ pingRespone: String }`

This endpoint pings the mock ground station server to establish a response.
Make this addition to the server .env.local: `MOCK_GS_IP="YOUR_IP"`

---

# Database Endpoints
