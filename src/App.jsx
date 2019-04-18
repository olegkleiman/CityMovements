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

import Worker from 'worker-loader!./worker.js';
import ControlPanel from './ControlPanel';
import Legend from './Legend';
import Pin from './Pin';
import { TravelMatrix, UNKNOWN_TRAVEL_TIME } from './TravelMatrix';
import Spinner from './Spinner';
import Tutorial from './Tutorial';

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
    sourceRegoinId: 0,
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
    dbName: 'ODSCityMovements',
    travelMatrix: null,
    isLoading: true,
    showETA: false,
    calculatedETA: 0,
    showTutorial: false,
    travelMode: 'transit'
  };

  componentDidMount() {

    const worker = new Worker();
    worker.postMessage({'cmd': 'start', 'msg': this.state.dbName});
    worker.onmessage = (event) => {
      console.log('onMessage: ' + JSON.stringify(event));
      this.setState({
        isLoading: false
      });

      this.processNebulaRegions('./assets/nebula.json');

    };
    worker.onerror = (err) => {
      console.error(err);
    }

  }

  processNebulaRegions = (geoJsonFile) => {

      const self = this;
      requestJson(geoJsonFile, async (error, response) => {

        if (!error) {
          const ids =
            response.features.map( feature => parseInt(feature.properties.Id, 10) );

          const _travelMatrix = new TravelMatrix();
          await _travelMatrix.init(this.state.dbName, ids);

          self.setState(
            {
              geoJsonData: response,
              travelMatrix: _travelMatrix,
              sourceRegoinId: 8  // initial value corresponding to 'sourceMarker'
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
    if( region && region.center ) {

        const _eta = this.state.travelMatrix.getTravelTime(this.state.sourceRegoinId, region.id);

        this.setState({
          targetMarker: {
            longitude: region.center.geometry.coordinates[0],
            latitude: region.center.geometry.coordinates[1]
          },
          targetRegoinId: region.id,
          showETA: true,
          calculatedETA: _eta
        });
    }

  }

  pointInPolygon = (pt) => {

    if( !this.state.geoJsonData ) {
      return null;
    }

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
      const _eta = this.state.travelMatrix.getTravelTime(region.id,
                                                         this.state.targetRegoinId);
      this.setState({
        sourceMarker: {
          longitude: region.center.geometry.coordinates[0],
          latitude: region.center.geometry.coordinates[1]
        },
        sourceRegoinId: region.id,
        showETA: true,
        calculatedETA: this.state.targetRegoinId != 0 ? _eta : 0
      });
    }
  };

  _onTargetMarkerDragEnd = (event) => {
    const pt = point([event.lngLat[0], event.lngLat[1]]);
    const region = this.pointInPolygon(pt);
    if( region.center ) {

      const _eta = this.state.travelMatrix.getTravelTime(this.state.sourceRegoinId, region.id);

      this.setState({
        targetMarker: {
          longitude: region.center.geometry.coordinates[0],
          latitude: region.center.geometry.coordinates[1]
        },
        targetRegoinId: region.id,
        showETA: true,
        calculatedETA: _eta
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

  renderLoadingPopup() {
      return this.state.isLoading && (
        <Popup latitude={this.state.viewport.latitude}
               longitude={this.state.viewport.longitude}
               closeButton={false}
               tipSize={0}>
                <p style={{
                    fontSize: '13px',
                    color: '#6b6b76'
                  }}>Loading Data</p>
                <Spinner />

        </Popup>)
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

  _updateSettings = (parcel) => {

    switch( parcel.cmd ) {

      case 'tutorial': {
        this.setState({
          showTutorial: true
        })
      }
      break;

      case 'travelMode': {
        this.setState({
          travelMode: parcel.data
        })
      }
      break;

    }
  }

  _closeTutorial = () => {
    this.setState({
      showTutorial: false
    });
  }

  _clonETAClose = () => {
    this.setState({
      showETA: false
    })
  }

  renderETA() {
      return this.state.showETA &&
      (this.state.calculatedETA != 0 ) &&
        <Popup latitude={this.state.targetMarker.latitude}
               longitude={this.state.targetMarker.longitude}
               anchor={'bottom-left'}
               offsetLeft={20}
               offsetTop={-20}
               closeButton={true}
               onClose={this._clonETAClose}
               tipSize={0}>
          <div>Average travel time to destination: { this.state.calculatedETA == UNKNOWN_TRAVEL_TIME ? 'Unknown' : `${this.state.calculatedETA} min` }</div>
        </Popup>

  }

  renderTutorial() {
    return this.state.showTutorial &&
          <Tutorial onClose={this._closeTutorial}
                    show={this.state.showTutorial}/>;
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
            { /*this.renderPopup()*/ }
            { this.renderLoadingPopup() }
            { this.renderSourceMarker() }
            { this.renderTargetMarker() }
            { this.renderTutorial() }
            { this.renderETA() }
          </MapGL>

          <ControlPanel containerComponent={this.props.containerComponent}
                        settings={this.state}
                        onChange={this._updateSettings}
                        dbName={this.state.dbName}
                        originId={this.state.sourceRegoinId}
                        destinationId={this.state.targetRegoinId}/>
          <Legend containerComponent={this.props.containerComponent}
                        settings={this.state} />
        </div>
    )
  }

}

export default App;
