import './main.less';
import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';

import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import proj from 'ol/proj'


const style = new Style({
    fill: new Fill({
      color: '#fff'
    }),
    stroke: new Stroke({
      color: '#333',
      width: 1
    })
  }),

  highlightStyle = new Style({
    fill: new Fill({
      color: '#27262a'
    }),
    stroke: new Stroke({
      color: '#d92868',
      width: 2
    })
  });

new Map({
  target: 'map',
  layers: [
    new VectorLayer({
      source: new VectorSource({
        url: '/geojson/NUTS/NUTS_RG_01M_2013_4326_LEVL_0.geojson',
        format: new GeoJSON()
      }),
      style: (feature) => {
        if (feature.values_.NUTS_ID === 'UK')
          return highlightStyle;

        return style;
      }
    })
  ],
  view: new View({
    center: proj.fromLonLat([-4.5155615, 50.4004579]),
    zoom: 9
  })
});