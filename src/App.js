import React, { Component } from 'react';
import TableMarketItems from './TableMarketItems';
import '../node_modules/react-vis/dist/style.css';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import RestartClock from './RestartClock';

const API = 'https://api.realliferpg.de';
 
class App extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleVehicleChange = this.handleVehicleChange.bind(this);
    this.onRowRefresh = this.onRowRefresh.bind(this);

    this.state = {
        value : "",
        playerinv: localStorage.getItem('playerinv') || 135,
        vehicleinv: localStorage.getItem('vehicleinv') || 0,
        allinv: this.calcnewInventory((localStorage.getItem('playerinv') || 135),(localStorage.getItem('vehicleinv') || 0)),
        police: 0,
        progress: 0,
        progress_name: "",
        items: [],
        items_history: [],
        isFetching: false,
        isRefreshing: false,
        ServerID: 1,
        timeuntilrestart: 0,
        lastMarketUpdate: " ",
    };
  }

  async getServerData(){
    return await fetch(API + '/v1/servers')
    .then(response => response.json())
    .then(data => {
      return data.data[0];
    })
  }

  async getMarketPrices(){
    return await fetch(API + '/v1/market/' + this.state.ServerID)
      .then(response => response.json())
      .then(data => {
        return data.data;
      })
  }

  async getMarketPricesHistorical(itemname, range = 720){
    return await fetch(API + '/v1/market_logs/'+ this.state.ServerID +'/'+ itemname +'/'+ range)
    .then(response => response.json())
    .then(data => {
      data.data[0].sort(function (a,b) {
        if(a.created_at > b.created_at){
          return 1
        }else{
          return -1
        }
      })
      return data.data[0];
    })
  }

  async fetchItems(){
    this.setState({isFetching: true});

    let serverdata = await this.getServerData();
    let items = await this.getMarketPrices();
    let obj_items_history = [];

    for (const [i,item] of items.entries()) {
      this.setState({
        progress: i/items.length*100,
        progress_name: item.localized
      });
      obj_items_history[item.item] = await this.getMarketPricesHistorical(item.item, 720); 
    }
    console.log(obj_items_history)
    this.setState({
      police: (serverdata.hasOwnProperty("Side")? serverdata.Side.Cops.length : 0),
      items: items,
      items_history: obj_items_history,
      isFetching: false,
      lastMarketUpdate: new Date(obj_items_history.apple[obj_items_history.apple.length-1].created_at).toLocaleTimeString()
    });
    this.refreshPricesTicker = setInterval(() => this.refreshPrices(), 60000)
  }

  async refreshPrices(){
    this.setState({isRefreshing: true});

    let serverdata = await this.getServerData()
    let items = await this.getMarketPrices();
    let obj_items_history = this.state.items_history;

    for (const [i,item] of items.entries()) {
      if(item.created_at != obj_items_history[item.item][obj_items_history[item.item].length-1].created_at){
        obj_items_history[item.item].push(item)
      }
    }

    this.setState({
      police: (serverdata.hasOwnProperty("Side")? serverdata.Side.Cops.length : 0),
      items: items,
      items_history: obj_items_history,
      isRefreshing: false,    
      refreshrows: true,
      lastMarketUpdate: new Date(obj_items_history.apple[obj_items_history.apple.length-1].created_at).toLocaleTimeString()
    })
  }

  async componentDidMount(){
    this.fetchItems()
  }

  componentWillUnmount(){
    clearInterval(this.refreshPricesTicker)
  }

  calcnewInventory(value1, value2){
    let result = 0
    result = (
        (value1 ? parseInt(value1) : 0) + 
        (value2 ? parseInt(value2) : 0)
    )
    return result
  }

  onRowRefresh(){
    this.setState({refreshrows: false})
  }

  handlePlayerChange(event) {
    let value = 0
    if(event.target.value < 0){
        value = 0
    }else{
        value = event.target.value
    }
    this.setState(
        {playerinv: value,
            allinv: this.calcnewInventory(value, this.state.vehicleinv)
        });
  }
  handleVehicleChange(event) {
    let value = 0
    if(event.target.value < 0){
        value = 0
    }else{
        value = event.target.value
    }
    this.setState(
        {vehicleinv: value,
            allinv: this.calcnewInventory(value, this.state.playerinv)
        });
    localStorage.setItem("vehicleinv",value)
  }

  render(){
    let table = null
    if(this.state.isFetching === true){
        table = (
            <div>
            <LinearProgress variant="determinate" value={this.state.progress}/>
            <Box display="flex">
              <Typography variant="overline">
              Lade Preise für {this.state.progress_name}
              </Typography>
            </Box>
          </div>
        )
    }else{
        table = (
            <TableMarketItems 
            items = {this.state.items}
            items_history = {this.state.items_history}
            inventory={this.state.allinv}
            police={this.state.police}
            refreshrows={this.state.refreshrows}
            onRowRefesh={this.onRowRefresh}
         />
        )
    }
    
    return(
        <div>
            <CssBaseline/>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">
                    Familie Fugges fleißiger Feldrechner für Fachmärkte
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box m={2} />
            <Container maxWidth="xl">
                <Grid container spacing={3}>
                    <Grid item xs={1}>
                        <TextField id="playerinv" label="Z-Inventar" type="number" onChange={this.handlePlayerChange} value={this.state.playerinv}/>
                    </Grid>
                    <Grid item xs={1}>
                        <TextField id="vehicleinv" label="Fahrzeug-Inventar" type="number" onChange={this.handleVehicleChange} value={this.state.vehicleinv}/>
                    </Grid>
                    <Grid item xs={1}>
                        <TextField disabled={true} id="allinv" label="Gesamt" value={this.state.allinv}/>
                    </Grid>
                    <Grid item position="right" xs={1}>
                        <TextField disabled={true} id="police" label="Polizisten" value={this.state.police}/>
                    </Grid>
                    <Grid item position="right" xs={1} >
                        <RestartClock/>
                    </Grid>
                    <Grid item position="right" xs={2} >
                      <TextField disabled={true} id="lastMarketUpdate" label="Letztes Marktupdate" value={this.state.lastMarketUpdate}/>
                    </Grid>
                    <Grid item position="right" xs={1} >
                      {this.state.isRefreshing? <CircularProgress /> : null }
                    </Grid>
                    
                    <Grid item xs={12}>
                        {table}
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
  }
} 
export default App;