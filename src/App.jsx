import React, {Component} from 'react';
import MapGL, {Popup, Marker, NavigationControl} from 'react-map-gl';
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
import TravelMatrix from './TravelMatrix';

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
    sourceMarker: { // initial value
      longitude: 34.788688376385025,
      latitude: 32.08692311125718
    },
    sourceRegoinId: 8, // initial value corresponding to 'sourceMarker'
    targetMarker: {
      longitude: null,
      latitude: null
    },
    targetRegoinId: 0,
    popup: {
      longitude: null,
      latitude: null,
      regionId: null
    },
    events: {},
    travelMatrix: null
  };

  componentDidMount() {
    requestJson('./assets/nebula.json', async (error, response) => {
      if (!error) {

        const ids =
          response.features.map( feature => parseInt(feature.properties.Id, 10) );

        const _travelMatrix = new TravelMatrix();
        _travelMatrix.init('ODSCityMovements', ids);

        this.setState(
          {
            geoJsonData: response,
            travelMatrix: _travelMatrix
          });
      }
    });
  }

  _onViewportChange = viewport => this.setState({viewport});

  onHover = (evt) => {

    const pt = point([evt.lngLat[0], evt.lngLat[1]]);
    const region = this.pointInPolygon(pt);
    let _popup = (region) ? {
       longitude: evt.lngLat[0],
       latitude: evt.lngLat[1],
       regionId: region.id
     } : null;
    this.setState({
      popup: _popup
    });

  }

  onClick = (evt) => {
    const pt = point([evt.lngLat[0], evt.lngLat[1]]);

    let disctrictInfo = {};

    const region = this.pointInPolygon(pt);
    if( region.center ) {
        this.setState({
          targetMarker: {
            longitude: region.center.geometry.coordinates[0],
            latitude: region.center.geometry.coordinates[1]
          },
          targetRegoinId: region.id
        });
    }

  }

  pointInPolygon = (pt) => {

    let region = null;

    let isFound = this.state.geoJsonData.features.reduce( (accumulator, feature) => {
      const _isFound = booleanPointInPolygon(pt, feature);
      if( _isFound ) {
        region = {
          center: center(feature),
          id: feature.properties.Id
        }
      }
      return accumulator || _isFound;
    }, false);

    return region;
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
    const region = this.pointInPolygon(pt);
    if( !region )
      return;
      
    if( region.center ) {
      this.setState({
        sourceMarker: {
          longitude: region.center.geometry.coordinates[0],
          latitude: region.center.geometry.coordinates[1]
        },
        sourceRegoinId: region.id
      });
    }
  };

  _onTargetMarkerDragEnd = (event) => {
    const pt = point([event.lngLat[0], event.lngLat[1]]);
    const region = this.pointInPolygon(pt);
    if( region.center ) {
      this.setState({
        targetMarker: {
          longitude: region.center.geometry.coordinates[0],
          latitude: region.center.geometry.coordinates[1]
        },
        targetRegoinId: region.id
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

  renderPopup() {

    if( this.state.popup
        && this.state.popup.latitude
        && this.state.popup.longitude) {

      return (
        <Popup latitude={this.state.popup.latitude}
               longitude={this.state.popup.longitude}>
          <div>{this.state.popup.regionId}</div>
        </Popup>
      )
    } else {
      return null;
    }
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
            onHover={this.onHover}
            onClick={this.onClick} >
              <DeckGL {...viewport} layers = {[
                 new GeoJsonLayer({
                   id:'geojson-layer',
                   data: this.state.geoJsonData,
                   filled:true,
                   // See http://deck.gl/#/documentation/deckgl-api-reference/layers/layer?section=numinstances-number-optional-
                   // for rational on 'updateTriggers'
                   updateTriggers: {
                    getFillColor: this.state.sourceRegoinId
                   },
                   getFillColor: d => {
                    if( d.properties.Id == this.state.sourceRegoinId ) {
                      return [255, 255, 217, 200]
                    } else {
                      const travelTime = this.state.travelMatrix.getTravelTime(this.state.sourceRegoinId, d.properties.Id);
                      // console.log(`Travel time between ${this.state.sourceRegoinId} and ${d.properties.Id}: ${travelTime}`);
                      return this.state.travelMatrix.timeToColor(travelTime);
                    }
                  }
                })
              ]}>
              { this.renderLineLayer() }
            </DeckGL>
            { this.renderPopup() }
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
