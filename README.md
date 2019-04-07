[![Build Status](https://travis-ci.org/olegkleiman/CityPopulation.svg?branch=master)](https://travis-ci.org/olegkleiman/CityPopulation)

Population data is taken from publicly accessible [Google Sheets](https://docs.google.com/spreadsheets/d/1GJWgz04VTdJIPT5y4N8qkY-fkNc3lvbxATv8TeC-deA/edit#gid=849134337). This is a stand-alone site but targeted to be an application for TLV ODS portal.

## How to build
1. Clone the repo
2. <code>yarn install</code>
3. Install [geojson-merge](https://github.com/mapbox/geojson-merge#cli) globally <code>yarn global add @mapbox/geojson-merge</code>
3. Then <code>yarn prepare</code> to merge geoJsons for city districts into one file (server as .json)
## How to launch
1. Install <code>serve</code> globally
2. Then just run <code>serve</code> from the root folder
Or
1. Run <code>yarn start-local</code> to serve from <code>webpack-dev-server</code>
## How to launch for Heroku
1.  Just deploy to Heroku by pushing to GitHub. It's synchronized! After deployent, script <code>heroku-postbuild</code> will be executed and <code>bundle.js</code> will be created there. The launch target is [here](https://tlvpopulation.herokuapp.com/dist/)

