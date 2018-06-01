const fs = require('fs');

fs.readFile(__dirname+'/../public/geojson/NUTS/NUTS_RG_01M_2013_4326_LEVL_0.geojson', 'utf8', (err, json) => {
  var data = JSON.parse(json),
    geojsonObject = {
      'type': 'FeatureCollection',
      'features': []
    };

  data.features[34].geometry.coordinates.forEach((data, index) => {
    if (index !== 1) {
      geojsonObject.features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: data
        }
      });
    }
  });

  fs.writeFile(__dirname+'/GB-parts.geojson', JSON.stringify(geojsonObject), (err) => {
    if (err)
      return console.log('error');

    console.log('file wirtten');
  });
});
