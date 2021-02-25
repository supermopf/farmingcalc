import React from 'react';
import {XYPlot, XAxis ,YAxis, LineSeries, HorizontalGridLines} from 'react-vis';
import {timeFormatDefaultLocale} from 'd3-time-format';
import CircularProgress from '@material-ui/core/CircularProgress';

timeFormatDefaultLocale({
    "dateTime": "%A, der %e. %B %Y, %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "shortMonths": ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
});


class ItemChart extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      isFetching: false,
    };
  }


  generateChart(){
    let temphistory = [];  
    this.props.item_data.forEach(function(entry){
        temphistory.push({x: Date.parse(entry.created_at), y: entry.price})
    })
    return <XYPlot 
            xType="time"
            yDomain={[Math.max(0, this.props.priceatl - 10), this.props.priceath + 10]}
            height={250}
            width={400}>
            <LineSeries data={temphistory} color={"#1769aa"} />
            <HorizontalGridLines />
            <LineSeries data={[{x: Date.now() - 5 * 24 * 60 * 60 * 1000,y: this.props.priceavg},{x: Date.now(),y: this.props.priceavg}]} color="#ab003c" />
            <XAxis tickTotal={5} />
            <YAxis/>
        </XYPlot>
  }

  render(){
    return(
      <div>
        {this.state.isFetching ? <CircularProgress /> : this.generateChart()}
      </div>
    )
  }
} 
export default ItemChart;