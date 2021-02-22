import React, { Component } from 'react';
import {timeFormatDefaultLocale} from 'd3-time-format';
import CircularProgress from '@material-ui/core/CircularProgress';


const API = 'https://api.realliferpg.de';
const ServerID = 1;

class ItemAvg extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      isFetching: false,
      item_data: [],
    };
  }

  fetchItemData(){
    this.setState({isFetching: true});
    fetch(API + '/v1/market_logs/'+ ServerID +'/'+ this.props.item +'/240')
      .then(response => response.json())
      .then(data => this.setState({ item_data: data.data[0], isFetching: false }))
      //.sort((a, b) => b.price - a.price)
    }

  componentDidMount() {
    this.fetchItemData()
  }


  getAvgPrice(){
    let sum = 0;  
    this.state.item_data.forEach(function(entry){
        sum += entry.price
    })
    return Math.round(sum/this.state.item_data.length)
  }

  render(){
    return(
      <div>
        {this.state.isFetching ? <CircularProgress /> : this.getAvgPrice()}
      </div>
    )
  }
} 
export default ItemAvg;