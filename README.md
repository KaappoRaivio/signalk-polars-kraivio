# Polar calculator for SignalK
## Usage
1. Install this plugin from the server web admin UI
2. Go to the `plugin config` section of the admin UI and select `signalk-polars-kraivio` from the list.
3. Fill in the path to your polar csv data file. An example of a valid polar csv file is provided below.
4. Make sure that you have the following data keys available: `environment.wind.angleTrueWater`, `environment.wind.speedTrue`, and `navigation.speedOverGround`.

## Example of a valid polar data file
 ```csv
twa/tws;    3;    4;    5;    6;    7;    8;   10
        0; 4.57; 5.56; 6.05; 6.29; 6.45; 6.55; 6.65
       52; 4.57; 5.56; 6.05; 6.29; 6.45; 6.55; 6.65
       60; 4.90; 5.87; 6.30; 6.55; 6.70; 6.80; 6.91
       75; 5.20; 6.10; 6.51; 6.80; 7.00; 7.15; 7.27
       90: 5.36; 6.26; 6.70; 6.97; 7.14; 7.24; 7.50
      110: 5.17; 6.15; 6.64; 7.00; 7.28; 7.51; 7.82
      120: 4.86; 5.96; 6.51; 6.90; 7.22; 7.50; 7.97
      135; 4.29; 5.39; 6.16; 6.62; 6.98; 7.29; 7.85
      150; 3.61; 4.60; 5.54; 6.18; 6.60; 6.95; 7.53
```
The columns are for true wind speeds in meters per second, and the rows for true wind angles in degrees.
The resulting boat speeds should be in knots, relative to ground.