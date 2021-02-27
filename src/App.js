import React from 'react';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
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
import Brightness3Icon from '@material-ui/icons/Brightness3';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';


const API = 'https://api.realliferpg.de';
/**
 * App Component
 */
class App extends React.Component {
  /**
   * Properties der Komponente
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleVehicleChange = this.handleVehicleChange.bind(this);
    this.onRowRefresh = this.onRowRefresh.bind(this);
    this.toggleDarkmode = this.toggleDarkmode.bind(this);

    this.state = {
      value: '',
      playerinv: localStorage.getItem('playerinv') || 135,
      vehicleinv: localStorage.getItem('vehicleinv') || 0,
      allinv: this.calcnewInventory(
          (localStorage.getItem('playerinv') || 135),
          (localStorage.getItem('vehicleinv') || 0),
      ),
      police: 0,
      progress: 0,
      progress_name: '',
      items: [],
      items_history: [],
      isFetching: false,
      isRefreshing: false,
      ServerID: 1,
      timeuntilrestart: 0,
      lastMarketUpdate: ' ',
      DarkModeEnabled: JSON.parse(
          localStorage.getItem('DarkModeEnabled')) || false,
    };
  }
  /**
   * Holt Server Daten von API
   */
  async getServerData() {
    return await fetch(API + '/v1/servers')
        .then((response) => response.json())
        .then((data) => {
          return data.data[0];
        });
  }
  /**
   * Holt Marktpreise von API
   */
  async getMarketPrices() {
    return await fetch(API + '/v1/market/' + this.state.ServerID)
        .then((response) => response.json())
        .then((data) => {
          return data.data;
        });
  }
  /**
   * Holt historisce Martpreise von API
   * @param {string} itemname
   * @param {int} range
   */
  async getMarketPricesHistorical(itemname, range = 720) {
    return await fetch(
        API + '/v1/market_logs/'+
        this.state.ServerID + '/'+
        itemname +'/'+
        range,
    )
        .then((response) => response.json())
        .then((data) => {
          data.data[0].sort(function(a, b) {
            if (a.created_at > b.created_at) {
              return 1;
            } else {
              return -1;
            }
          });
          return data.data[0];
        });
  }
  /**
   * Holt Items und ruft deren histroischen Preise ab
   */
  async fetchItems() {
    this.setState({isFetching: true});

    const serverdata = await this.getServerData();
    const items = await this.getMarketPrices();
    const ItemsHistory = [];

    for (const [i, item] of items.entries()) {
      this.setState({
        progress: i/items.length*100,
        progress_name: item.localized,
      });
      ItemsHistory[item.item] = (
        await this.getMarketPricesHistorical(item.item, 720)
      );
    }
    this.setState({
      police: (
        serverdata.hasOwnProperty('Side')? serverdata.Side.Cops.length : 0
      ),
      items: items,
      items_history: ItemsHistory,
      isFetching: false,
      lastMarketUpdate: (
        new Date(
            ItemsHistory.apple[ItemsHistory.apple.length-1].created_at,
        ).toLocaleTimeString()
      ),
    });
    this.refreshPricesTicker = setInterval(() => this.refreshPrices(), 60000);
  }
  /**
   * Holt aktuelle Marktpreise und fügt sie bei Update hinzu
   */
  async refreshPrices() {
    this.setState({isRefreshing: true});

    const serverdata = await this.getServerData();
    const items = await this.getMarketPrices();
    const ItemsHistory = this.state.items_history;

    for (const [, item] of items.entries()) {
      if (item.created_at !== ItemsHistory[item.item][
          ItemsHistory[item.item].length-1].created_at) {
        ItemsHistory[item.item].push(item);
      }
    }

    this.setState({
      police: (
        serverdata.hasOwnProperty('Side')? serverdata.Side.Cops.length : 0
      ),
      items: items,
      items_history: ItemsHistory,
      isRefreshing: false,
      refreshrows: true,
      lastMarketUpdate: (
        new Date(
            ItemsHistory.apple[ItemsHistory.apple.length-1].created_at,
        ).toLocaleTimeString()
      ),
    });
  }

  /**
   * Komponente wurde geladen
   */
  async componentDidMount() {
    this.fetchItems();
  }

  /**
  * Komponente wird entladen
  */
  componentWillUnmount() {
    clearInterval(this.refreshPricesTicker);
  }

  /**
   * Berechnet die Inventargröße
   * @param {*} value1
   * @param {*} value2
   * @return {int}
   */
  calcnewInventory(value1, value2) {
    let result = 0;
    result = (
      (value1 ? parseInt(value1) : 0) +
        (value2 ? parseInt(value2) : 0)
    );
    return result;
  }

  /**
   * Event wenn Zeilen geupdated wurden
   */
  onRowRefresh() {
    this.setState({refreshrows: false});
  }

  /**
   * Spielerinventar wird verändert
   * @param {*} event
   */
  handlePlayerChange(event) {
    let value = 0;
    if (event.target.value < 0) {
      value = 0;
    } else {
      value = event.target.value;
    }
    this.setState(
        {playerinv: value,
          allinv: this.calcnewInventory(value, this.state.vehicleinv),
        });
    localStorage.setItem('playerinv', value);
  }

  /**
   * Fahrzeuginventar wird verändert
   * @param {*} event
   */
  handleVehicleChange(event) {
    let value = 0;
    if (event.target.value < 0) {
      value = 0;
    } else {
      value = event.target.value;
    }
    this.setState(
        {vehicleinv: value,
          allinv: this.calcnewInventory(value, this.state.playerinv),
        });
    localStorage.setItem('vehicleinv', value);
  }

  /**
   * Wechselt den Darkmode
   */
  toggleDarkmode() {
    localStorage.setItem('DarkModeEnabled', !this.state.DarkModeEnabled);
    this.setState({DarkModeEnabled: !this.state.DarkModeEnabled});
  }

  /**
   * Rendert die Komponente
   * @return {object}
   */
  render() {
    const darkModeButton = (
      this.state.DarkModeEnabled ? <Brightness7Icon /> : <Brightness3Icon />
    );

    let themeSelected = createMuiTheme({
      palette: {
        type: 'light',
      },
    });

    if (this.state.DarkModeEnabled) {
      themeSelected = createMuiTheme({
        palette: {
          type: 'dark',
        },
      });
    }

    let table = null;
    if (this.state.isFetching === true) {
      table = (
        <div>
          <LinearProgress variant="determinate" value={this.state.progress}/>
          <Box display="flex">
            <Typography variant="overline">
              Lade Preise für {this.state.progress_name}
            </Typography>
          </Box>
        </div>
      );
    } else {
      table = (
        <TableMarketItems
          items = {this.state.items}
          items_history = {this.state.items_history}
          inventory={this.state.allinv}
          police={this.state.police}
          refreshrows={this.state.refreshrows}
          onRowRefesh={this.onRowRefresh}
        />
      );
    }


    return (

      <ThemeProvider theme={themeSelected}>
        <CssBaseline/>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" style={{flex: 1}}>
                    Familie Fugges fleißiger Feldrechner für Fachmärkte
            </Typography>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="darkmode"
              onClick={this.toggleDarkmode}
            >
              {darkModeButton}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box m={2} />
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={1}>
              <TextField
                id="playerinv"
                label="Z-Inventar"
                type="number"
                onChange={this.handlePlayerChange}
                value={this.state.playerinv}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                id="vehicleinv"
                label="Fahrzeug-Inventar"
                type="number"
                onChange={this.handleVehicleChange}
                value={this.state.vehicleinv}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                disabled={true}
                id="allinv"
                label="Gesamt"
                value={this.state.allinv}
              />
            </Grid>
            <Grid item position="right" xs={1}>
              <TextField
                disabled={true}
                id="police"
                label="Polizisten"
                value={this.state.police}
              />
            </Grid>
            <Grid item position="right" xs={1} >
              <RestartClock/>
            </Grid>
            <Grid item position="right" xs={2} >
              <TextField
                disabled={true}
                id="lastMarketUpdate"
                label="Letztes Marktupdate"
                value={this.state.lastMarketUpdate}
              />
            </Grid>
            <Grid item position="right" xs={1} >
              {this.state.isRefreshing? <CircularProgress /> : null }
            </Grid>
            <Grid item xs={12}>
              {table}
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    );
  }
}
export default App;
