import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import _ from 'lodash';
import {XYPlot,
        VerticalGridLines,
        HorizontalGridLines,
        XAxis,
        YAxis,
        Hint,
        LineSeries,
        VerticalBarSeries
        } from 'react-vis';

const defaultContainer =  ({children}) => <div className="control-panel">{children}</div>;

const ControlPanel = (props) => {

  const Container = props.containerComponent || defaultContainer;
  const {settings} = props;

  const callback = props.onChange;

  const dbName = props.dbName;
  const originId = parseInt(props.originId, 10);
  const destinationId = parseInt(props.destinationId, 10);

  const [data, setData] = useState([]);

  useEffect( () => {

    async function fetchData() {
      try {

        if( originId == 0 || destinationId == 0 ) {
            setData([]);
            return;
        }

        if( await !Dexie.exists(dbName) ) {
          console.log(`ControlPanel: ${dbName} db does not exists`);
          setData([]);
          return;
        }

        const db = new Dexie(dbName);
        db.version(1).stores({
          etas: '++id, originId, destinationId, [originId+destinationId], period, day'
        });

        const entries = await db.etas.where('[originId+destinationId]')
                              .equals([originId, destinationId])
                              .toArray();
        const pattern = {
          'Su': [],
          'M': [],
          'Tu': [],
          'W': [],
          'Th': [],
          'F': [],
          'Sa': []
        };
        const data = [];

        const groups = _.groupBy(entries, 'day');
        const _groups = {...pattern, ...groups}; // merge with pattern
        for (var key in _groups) {

            const array = _groups[key];

            let avg = 0;
            // reduce only for iterables
            if( typeof array[Symbol.iterator] === 'function' ) { // see here why this works
                                                                 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
              avg = array.reduce( (accu, item) => {
                  return accu + item.eta
              }, 0) / (array.length || 1);
            }

            data.push({
                x: key,
                y: avg
            });

        }

        setData(data);

      } catch (err) {
        console.error(err);
      }
    }
    fetchData();

  },[originId, destinationId]);


  const axisStyle = {
    ticks: {
      fontSize: '12px',
      color: '#333'
    },
    title: {
      fontSize: '13px',
      color: '#333'
    }
  }

  const _onClick = (event) => {
    if( callback ) {
      callback(event);
    }
  }

  return (
    <Container>
      <h3 style={{
        backgroundColor: '#F7F7F7'
      }}>
        <span>Tel-Aviv Movements</span>
          <svg style={{
              float: 'right',
              marginTop: '4px',
              cursor: 'pointer'
          }}
          viewBox="0 0 24 24" fill="none" width="20px" height="20px"
          onClick={_onClick}>
            <title>Show tutorial</title>
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 19c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="currentColor">
            </path>,<path d="M13 16h-3v2h3v-2z" fill="currentColor"></path>,<path d="M12 6c-1.9 0-3.5 1.3-3.9 3.2l2.9.6c.1-.5.5-.8 1-.8s1 .5 1 1c0 .4-.2.7-.6.9L10 12.1v3h3v-1l.7-.3c1.4-.7 2.3-2.1 2.3-3.6C16 7.8 14.2 6 12 6z" fill="currentColor"></path>
          </svg>
      </h3>
      <p>The map shows the average travel time from the origin zone to all other zones for the selected date-time range.</p>
      <XYPlot height={180} width= {320} xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis
              labelFormat={ v => `${v} min`}
              style={axisStyle}/>

        <VerticalBarSeries data={data} />
      </XYPlot>
    </Container>
  );

};

export default ControlPanel;
