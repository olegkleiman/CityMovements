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

        const data = [{
          x: 'Su',
          y: _.last( _.intersectionBy(entries, [{ day:'Su' }], 'day')).eta
        }, {
          x: 'M',
          y: 12
        }, {
          x: 'Tu',
          y: 32
        }, {
          x: 'W',
          y: 39
        }, {
          x: 'Th',
          y: 43
        }, {
          x: 'F',
          y: 31
        }, {
          x: 'Sa',
          y: 24
        }];

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

  return (
    <Container>
      <h3>Tel-Aviv Movements</h3>
      <p>The map shows the average travel time from the origin zone to all other zones for the selected date-time range.</p>
      <XYPlot height={180} width= {320} xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis
              labelFormat={ v => `${v} min`}
              style={axisStyle}/>

        <VerticalBarSeries data={data} />
      </XYPlot>)
    </Container>
  );

};

export default ControlPanel;
