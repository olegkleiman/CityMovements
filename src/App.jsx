import React, {Component} from 'react';
import MapGL, {Marker, NavigationControl} from 'react-map-gl';
import DeckGL, {LineLayer, IconLayer, GeoJsonLayer} from 'deck.gl';
// import d3 from 'd3-fetch';
import {json as requestJson} from 'd3-request';
import {fromJS} from 'immutable';
import empty from 'is-empty';
const { point, polygon } = require('@turf/helpers');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const center = require('@turf/center').default;

import ControlPanel from './ControlPanel';
import Legend from './Legend';
import Pin from './Pin';

const MAPBOX_TOKEN = process.env.MapboxAccessToken;

class App extends Component {

  state = {
    viewport: {
      longitude: 34.787664,
      latitude: 32.091108,
      zoom: 13,
      bearing: 0,
      pitch: 0,
      maxSpaces: 1,
      minSpaces: 9999,
    },
    geoJsonData: null,
    sourceMarker: {
      longitude: 34.788688376385025,
      latitude: 32.08692311125718
    },
    targetMarker: {
      longitude: null,
      latitude: null
    },
    events: {}
  };

  componentDidMount() {
    requestJson('./assets/nebula.json', (error, response) => {
      if (!error) {
        this.setState({geoJsonData: response});
      }
    });
  }

  _onViewportChange = viewport => this.setState({viewport});

  onClick = (evt) => {
    const pt = point([evt.lngLat[0], evt.lngLat[1]]);

    let disctrictInfo = {};

    const center = this.pointInPolygon(pt);
    if( center ) {
        this.setState({
          targetMarker: {
            longitude: center.geometry.coordinates[0],
            latitude: center.geometry.coordinates[1]
          }
        });
    }

  }

  pointInPolygon = (pt) => {

    let _center = null;

    let isFound = this.state.geoJsonData.features.reduce( (accumulator, feature) => {
      const _isFound = booleanPointInPolygon(pt, feature);
      if( _isFound ) {
        _center = center(feature);
      }
      return accumulator || _isFound;
    }, false);

    return _center;
  }

  _logDragEvent(name, destination, event) {
    this.setState({
      events: {
        ...this.state.events,
        destination,
        [name]: event.lngLat,
      }
    })
  }

  _onMarkerDragEnd = (event) => {

    const pt = point([event.lngLat[0], event.lngLat[1]]);
    const center = this.pointInPolygon(pt);
    if( center ) {
      this.setState({
        sourceMarker: {
          longitude: center.geometry.coordinates[0],
          latitude: center.geometry.coordinates[1]
        }
      });
    }
  };

  _onTargetMarkerDragEnd = (event) => {
    const pt = point([event.lngLat[0], event.lngLat[1]]);
    const center = this.pointInPolygon(pt);
    if( center ) {
      this.setState({
        targetMarker: {
          longitude: center.geometry.coordinates[0],
          latitude: center.geometry.coordinates[1]
        }
      });
    }
  };

  renderSourceMarker() {
    if( !this.state.sourceMarker.latitude
      || !this.state.sourceMarker.longitude )
      return null;

    return(<Marker latitude={this.state.sourceMarker.latitude}
              longitude={this.state.sourceMarker.longitude}
              offsetTop={-20}
              offsetLeft={-10}
              draggable
              onDragEnd={this._onMarkerDragEnd}>
        <Pin size={20} fillColor={'#d00'}/>
      </Marker>);
  }

  renderTargetMarker() {
    if( !this.state.targetMarker.latitude
      || !this.state.targetMarker.longitude )
      return null;

    return(<Marker latitude={this.state.targetMarker.latitude}
              longitude={this.state.targetMarker.longitude}
              offsetTop={-20}
              offsetLeft={-10}
              draggable
              onDragEnd={this._onTargetMarkerDragEnd}>
        <Pin size={20} fillColor={'#00f'}/>
      </Marker>);
  }

  renderLineLayer() {

    if( this.state.targetMarker.latitude
        && this.state.targetMarker.longitude
        && this.state.sourceMarker.latitude
        && this.state.sourceMarker.longitude) {

          const lineData = [{
            from: {
              coordinates: [this.state.targetMarker.longitude, this.state.targetMarker.latitude]
            },
            to: {
              coordinates: [this.state.sourceMarker.longitude, this.state.sourceMarker.latitude]
            }
          }];

           return (<LineLayer
                    id={'line-layer'}
                    data={lineData}
                    getStrokeWidth={10}
                    getSourcePosition={ d => d.from.coordinates }
                    getTargetPosition={ d => d.to.coordinates }
                    getColor={ d => [36,115,189] }
                  />)
              }
    else
          return null
  }

  render() {

    const {viewport} = this.state;

    return (<div style={{height: '100%'}}>

          <MapGL
            {...viewport}
            width="100%"
            height="100%"
            onViewportChange={this._onViewportChange}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            onClick={this.onClick} >
              <DeckGL {...viewport}
                controller={true}>
                <GeoJsonLayer id={'geojson-layer'}
                  data={this.state.geoJsonData}
                  filled={true}
                  getFillColor={[160, 160, 180, 200]}
                />
              { this.renderLineLayer() }
            </DeckGL>
            { this.renderSourceMarker() }
            { this.renderTargetMarker() }
          </MapGL>

          <ControlPanel containerComponent={this.props.containerComponent}
                        settings={this.state}
                        onChange={this._updateSettings} />
          <Legend containerComponent={this.props.containerComponent}
                        settings={this.state} />
        </div>
    )
  }

}

export default App;
