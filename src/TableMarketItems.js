import React, { Component } from 'react';
import ItemChart from './ItemChart';
import '../node_modules/react-vis/dist/style.css';
import { DataGrid, numberComparer } from '@material-ui/data-grid';

class TableMarketItems extends React.Component {
  constructor(props) {
    super(props);

    this.calcInventoryProfit = this.calcInventoryProfit.bind(this)
 
    this.state = {
      columns: [
        { 
          field: 'chart',
          headerName: 'Kursverlauf (5 Tage)',
          flex: 1,
          renderCell: (params) => (
            <div>
              {params.value}
            </div>
          )
        },
        { field: 'itemname', headerName: 'Name', flex: 0.5},
        { field: 'id', headerName: 'Technischer Name', flex: 0.5, hide: true},
        { field: 'price', headerName: 'Aktueller Preis', type: "number", flex: 0.5 },
        { field: 'priceavg', headerName: 'Durchschnittspreis', type: "number", flex: 0.5 },
        { field: 'illegal', headerName: 'Illegal', flex: 0.5 , hide: true},
        { field: 'priceath', headerName: 'All-Time-High Preis', type: "number", flex: 0.5},
        { field: 'priceatl', headerName: 'All-Time-Low Preis', type: "number", flex: 0.5, hide: true},
        { 
          field: 'pricecompare',
          headerName: 'Preisverhältnis zum ATH in %',
          flex: 0.5,
          valueGetter: this.compareATHPrice,
          type: "number",
        },
        { field: 'size', headerName: 'Größe (Unverarbeitet)', type: "number", flex: 0.5},
        { 
          field: 'profit',
          headerName: 'Gewinn pro Fuhre',
          type: "number",
          flex: 0.5,
          valueGetter: this.calcInventoryProfit,      
        },
      ],
      sortModel: [
        {
          field: 'pricecompare',
          sort: 'desc',
        },
      ],
      rows: [],
    };
  }

  componentDidMount(){
    this.setState({rows: this.updateRows(this.props.items_history)})
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.refreshrows){
      this.setState({rows: this.updateRows(this.props.items_history)})
    }    
  }

  createData(item, itemhistory) {
    let id = item.item;
    let itemname = item.localized;
    let price = item.price;

    const bonus = [
      { "amount": 0, "multiplier": 0.3 },
      { "amount": 1, "multiplier": 0.3 },
      { "amount": 2, "multiplier": 0.3 },
      { "amount": 3, "multiplier": 0.3 },
      { "amount": 4, "multiplier": 1.15 },
      { "amount": 5, "multiplier": 1.2 },
      { "amount": 6, "multiplier": 1.2 },
      { "amount": 7, "multiplier": 1.2 },
      { "amount": 8, "multiplier": 1.3 },
      { "amount": 9, "multiplier": 1.4 },
      { "amount": 10, "multiplier": 1.4 },
      { "amount": 11, "multiplier": 1.43 },
      { "amount": 12, "multiplier": 1.47 },
      { "amount": 13, "multiplier": 1.5 },
      { "amount": 14, "multiplier": 1.55 },
      { "amount": 15, "multiplier": 1.55 },
      { "amount": 16, "multiplier": 1.55 },
      { "amount": 17, "multiplier": 1.55 },
      { "amount": 18, "multiplier": 1.55 },
      { "amount": 19, "multiplier": 1.55 },
      { "amount": 20, "multiplier": 1.55 },
      { "amount": 21, "multiplier": 1.55 },
      { "amount": 22, "multiplier": 1.55 },
      { "amount": 23, "multiplier": 1.55 },
      { "amount": 24, "multiplier": 1.55 },
      { "amount": 25, "multiplier": 1.55 },
      { "amount": 26, "multiplier": 1.55 }

    ]

    const IllegalItems = [
      "cocaine_r",
      "heroin_r",
      "fentanyl_r",
      "purple_haze",
      "white_widow",
      "white_russian",
      "lsd",
      "rum",
      "vodka"
    ]
    const ItemsSizes = {
        "copper_r": 4,
        "clay_r": 6,
        "iron_r": 5,
        "meat_r": 4,
        "barley_u": 4,
        "barley_r": 4,
        "wheat_u": 4,
        "wheat_r": 4,
        "bread" : 8, // ?????
        "chocolate_u" : 5,
        "chocolate_r" : 5,
        "coal_r" : 6,
        "cocaine_r" : 5,
        "diamond_r" : 6,
        "fish_feed" : 1,
        "fish_r" : 4,
        "lsd" : 50, // 8*4 + 18?
        "shell_r" : 5,
        "heroin_r": 5,
        "oil_r": 5,
        "pearl": 5,
        "plastic": 10,
        "rock_r": 4,
        "wood_r": 5,
        "wine_u": 4,
        "wine_r": 4,
        "weaponparts_r": 4,
        "tobacco_r": 5,
        "sugar_r": 3,
        "sand_r": 4,
        "salt_r": 4,
        "vodka": 6, //Kartoffel + Weizen
        "rum": 6, //2 * Zucker
        "apple": 2,
        "apple_juice": 2,
        "crab": 4,
        "honey_r": 3,
        "potato": 2,
        "roll": 4,
        "steel": 17,
        "fentanyl_r": 1000, //?
        "white_russian": 2,
        "white_widow": 2,
        "purple_haze": 2,
    }

    let illegal   = IllegalItems.includes(item.item);
    let priceavg  = 0;
    let priceath  = 0;
    let priceatl  = 100000;
    let size  = ItemsSizes[id];

    if(illegal){
      price = Math.floor(price * bonus[this.props.police].multiplier)
    }

    for (const [i,entry] of itemhistory.entries()) {
      priceavg += entry.price
    }
    priceavg = Math.round(priceavg/itemhistory.length)

    for (const [i,entry] of itemhistory.entries()) {
      if (entry.price > priceath){
        priceath = entry.price
      }
    }

    for (const [i,entry] of itemhistory.entries()) {
      if (entry.price < priceatl){
        priceatl = entry.price
      }
    }

    let chart     = <ItemChart item_data={itemhistory} priceavg={priceavg} priceath={priceath} priceatl={priceatl} />;
    return {id, chart, itemname, price, priceavg, priceath, priceatl,size,illegal};
  }

  updateRows(itemhistory){
    let rows = [];
    for (const item of this.props.items) {
      rows.push(this.createData(item, itemhistory[item.item]))
    }
    this.props.onRowRefesh();
    return rows;
  }

  compareATHPrice(params) {
    return (params.getValue('price') / params.getValue('priceath')*100).toFixed(2);
  }
  calcInventoryProfit(params) {
    return (Math.floor(this.props.inventory/params.getValue('size'))*params.getValue('price'));
  }

  render(){
    return(
      <div>
        <DataGrid
          sortModel={this.state.sortModel}
          rowHeight={300}
          autoHeight
          rows={this.state.rows}
          columns={this.state.columns}
          filterModel={{
            items: [
              { columnField: 'price', operatorValue: '>=', value: 160 },
            ],
          }}
        /> 
      </div>      
    )
  }
} 

export default TableMarketItems;
