import React, {PureComponent} from 'react';
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

export default class ControlPanel extends PureComponent {
  render() {
    const Container = this.props.containerComponent || defaultContainer;
    const {settings} = this.props;

    const data = [{
      x: 'Su',
      y: 30
    }, {
      x: 'M',
      y: 35
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
        </XYPlot>
      </Container>
    );
  }
}
