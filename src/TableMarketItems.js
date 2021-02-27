import React from 'react';
import ItemChart from './ItemChart';
import '../node_modules/react-vis/dist/style.css';
import {DataGrid} from '@material-ui/data-grid';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import {green, red} from '@material-ui/core/colors';
import PropTypes from 'prop-types';

/**
 * Generiert deine Tabelle mit den Marktpreisen
 */
class TableMarketItems extends React.Component {
  /**
   * Properties der Komponente
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.calcInventoryProfit = this.calcInventoryProfit.bind(this);
    this.calcProfitPerMinute = this.calcProfitPerMinute.bind(this);

    this.state = {
      columns: [
        {
          field: 'chart',
          headerName: 'Kursverlauf (5 Tage)',
          flex: 1.2,
          renderCell: (params) => (
            <div>
              {params.value}
            </div>
          ),
        },
        {
          field: 'itemname',
          headerName: 'Name',
          flex: 0.3,
        },
        {
          field: 'id',
          headerName: 'Technischer Name',
          flex: 0.5,
          hide: true,
        },
        {
          field: 'price',
          headerName: 'Preis',
          type: 'number',
          flex: 0.25},
        {
          field: 'rawprice',
          headerName: 'Preis ohne Bonus',
          type: 'number',
          flex: 0.5, hide: true,
        },
        {
          field: 'multiplier',
          headerName: 'Bonus durch Polizei',
          type: 'number',
          flex: 0.5,
          hide: true,
        },
        {
          field: 'priceavg',
          headerName: 'Ø Preis',
          type: 'number',
          flex: 0.25,
          hide: true,
        },
        {
          field: 'illegal',
          headerName: 'Illegal', flex: 0.5, hide: true},
        {
          field: 'priceath',
          headerName: 'All-Time-High Preis',
          type: 'number',
          flex: 0.25,
        },
        {
          field: 'priceatl',
          headerName: 'All-Time-Low Preis',
          type: 'number',
          flex: 0.25,
          hide: true,
        },
        {
          field: 'sellprice',
          headerName: 'Preis nach Verkauf',
          type: 'number',
          flex: 0.5,
          hide: true,
          valueGetter: this.getSellPrice,
        },
        {
          field: 'pricechange',
          headerName: 'Trend',
          flex: 0.3,
          type: 'number',
          renderCell: (params) => {
            let icon;
            if (params.value > 0) {
              // STOINK
              icon = <TrendingUpIcon style={{color: green[500]}}/>;
            } else if (params.value < 0) {
              // DROP
              icon = <TrendingDownIcon style={{color: red[500]}}/>;
            } else {
              // No Change
              icon = <TrendingFlatIcon/>;
            }
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                {icon}
                <span style={{padding: 5}}>{params.value}</span>
              </div>
            );
          },
        },
        {
          field: 'pricecompare',
          headerName: 'Preisverhältnis zum ATH in %',
          flex: 0.5,
          valueGetter: this.compareATHPrice,
          type: 'number',
        },
        {
          field: 'size',
          headerName: 'Größe',
          type: 'number',
          flex: 0.25},
        {
          field: 'timeneeded',
          headerName: 'Dauer in Minuten (LKW)',
          type: 'number', flex: 0.25},
        {
          field: 'profitperminute',
          headerName: 'Gewinn pro Minute',
          type: 'number',
          flex: 0.5,
          valueGetter: this.calcProfitPerMinute,
        },
        {
          field: 'profit',
          headerName: 'Gewinn pro Fuhre',
          type: 'number',
          flex: 0.5,
          valueGetter: this.calcInventoryProfit,
        },
      ],
      sortModel: [
        {
          field: 'profit',
          sort: 'desc',
        },
      ],
      rows: [],
      filterModel: {
        items: [
          {columnField: 'illegal', operatorValue: 'equals', value: 'false'},
        ],
      },
    };
  }
  /**
   * Komponente wurde geladen
   */
  componentDidMount() {
    this.setState({rows: this.updateRows(this.props.items_history)});
  }
  /**
   * Komponente wurde geupdated
   * @param {*} prevProps
   * @param {*} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.props.refreshrows) {
      this.setState({rows: this.updateRows(this.props.items_history)});
    }
  }
  /**
   * Erstellt die Daten der Tabelle
   * @param {*} item
   * @param {array} itemhistory
   * @return {array}
   */
  createData(item, itemhistory) {
    const id = item.item;
    const itemname = item.localized;
    let price = item.price;

    const bonus = [
      {'amount': 0, 'multiplier': 0.3},
      {'amount': 1, 'multiplier': 0.3},
      {'amount': 2, 'multiplier': 0.3},
      {'amount': 3, 'multiplier': 0.3},
      {'amount': 4, 'multiplier': 1.15},
      {'amount': 5, 'multiplier': 1.2},
      {'amount': 6, 'multiplier': 1.2},
      {'amount': 7, 'multiplier': 1.2},
      {'amount': 8, 'multiplier': 1.3},
      {'amount': 9, 'multiplier': 1.4},
      {'amount': 10, 'multiplier': 1.4},
      {'amount': 11, 'multiplier': 1.43},
      {'amount': 12, 'multiplier': 1.47},
      {'amount': 13, 'multiplier': 1.5},
      {'amount': 14, 'multiplier': 1.55},
      {'amount': 15, 'multiplier': 1.55},
      {'amount': 16, 'multiplier': 1.55},
      {'amount': 17, 'multiplier': 1.55},
      {'amount': 18, 'multiplier': 1.55},
      {'amount': 19, 'multiplier': 1.55},
      {'amount': 20, 'multiplier': 1.55},
      {'amount': 21, 'multiplier': 1.55},
      {'amount': 22, 'multiplier': 1.55},
      {'amount': 23, 'multiplier': 1.55},
      {'amount': 24, 'multiplier': 1.55},
      {'amount': 25, 'multiplier': 1.55},
      {'amount': 26, 'multiplier': 1.55},

    ];

    const IllegalItems = [
      'cocaine_r',
      'heroin_r',
      'fentanyl_r',
      'purple_haze',
      'white_widow',
      'white_russian',
      'lsd',
      'rum',
      'vodka',
      'weaponparts_r',
    ];
    const ItemsSizes = {
      'copper_r': 4,
      'clay_r': 6,
      'iron_r': 5,
      'meat_r': 4,
      'barley_u': 4,
      'barley_r': 4,
      'wheat_u': 4,
      'wheat_r': 4,
      'bread': 8, // ?????
      'chocolate_u': 5,
      'chocolate_r': 5,
      'coal_r': 6,
      'cocaine_r': 5,
      'diamond_r': 6,
      'fish_feed': 1,
      'fish_r': 4,
      'lsd': 50, // 8*4 + 18?
      'shell_r': 5,
      'heroin_r': 5,
      'oil_r': 5,
      'pearl': 5,
      'plastic': 10,
      'rock_r': 4,
      'wood_r': 5,
      'wine_u': 4,
      'wine_r': 4,
      'weaponparts_r': 4,
      'tobacco_r': 5,
      'sugar_u': 3,
      'sugar_r': 3,
      'sand_r': 4,
      'salt_r': 4,
      'vodka': 6, // Kartoffel + Weizen
      'rum': 6, // 2 * Zucker
      'apple': 2,
      'apple_juice': 2,
      'crab': 4,
      'honey_r': 3,
      'potato': 2,
      'roll': 4,
      'steel': 17,
      'fentanyl_r': 1000, // ?
      'white_russian': 2,
      'white_widow': 2,
      'purple_haze': 2,
    };
    // Zeit pro LKW (800) Fuhre in Minuten
    const TimeNeeded = {
      'fish_feed': 220,
      'crab': 19,
      'sand_r': 34,
      'diamond_r': 25,
      'wood_r': 27,
      'clay_r': 25,
      'iron_r': 26,
      'salt_r': 26,
    };

    const illegal = IllegalItems.includes(item.item);
    const multiplier = illegal ? bonus[this.props.police].multiplier : 1;
    let priceavg = 0;
    let priceath = 0;
    const rawprice = item.price;
    let priceatl = 100000;
    let pricechange = 0;
    let prevprice = 0;
    const size = ItemsSizes[id];
    const timeneeded = TimeNeeded[id] || 0;

    if (illegal) {
      price = Math.floor(price * multiplier);
    }

    for (const [, entry] of itemhistory.entries()) {
      // AVG
      priceavg += entry.price;
      // ATH
      if (entry.price > priceath) {
        priceath = entry.price;
      }
      // ATL
      if (entry.price < priceatl) {
        priceatl = entry.price;
      }
    }
    priceavg = Math.round(priceavg/itemhistory.length);
    prevprice = itemhistory[itemhistory.length-2].price;
    pricechange = rawprice - prevprice;

    const chart = <ItemChart
      item_data={itemhistory}
      priceavg={priceavg}
      priceath={priceath}
      priceatl={priceatl}
    />;
    return {
      id,
      chart,
      itemname,
      price,
      priceavg,
      priceath,
      priceatl,
      size,
      illegal,
      pricechange,
      rawprice,
      multiplier,
      timeneeded,
    };
  }
  /**
   * Ruft Rekursiv createData() auf um Zeilen zu erzeugen.
   * @param {array} itemhistory
   * @return {array}
   */
  updateRows(itemhistory) {
    const rows = [];
    for (const item of this.props.items) {
      rows.push(this.createData(item, itemhistory[item.item]));
    }
    this.props.onRowRefesh();
    return rows;
  }
  /**
   * Errechnet den Verkaufspreis anhand der Tabelle
   * @param {object} params
   * @return {int}
   */
  getSellPrice(params) {
    return Math.round(params.getValue('price')*0.85);
  }
  /**
   * Errechnet den All-Time-High Preis anhand der Tabelle
   * @param {object} params
   * @return {int}
   */
  compareATHPrice(params) {
    return (
      (params.getValue('rawprice') / params.getValue('priceath')*100).toFixed(2)
    );
  }
  /**
   * Errechnet den Preis pro Fuhre anhand der Tabelle
   * @param {object} params
   * @return {int}
   */
  calcInventoryProfit(params) {
    return (
      Math.floor(
          this.props.inventory/params.getValue('size'),
      )*(
        params.getValue('price')
      )
    );
  }
  /**
   * Errechnet den Profit pro Minute anhand der Tabelle
   * @param {object} params
   * @return {int}
   */
  calcProfitPerMinute(params) {
    if (params.getValue('timeneeded') === 0) {
      return 0;
    }
    return (
      Math.floor(params.getValue('profit')/params.getValue('timeneeded'))
    );
  }
  /**
   * Rendert die Komponente
   * @return {object}
   */
  render() {
    return (
      <div>
        <DataGrid
          sortModel={this.state.sortModel}
          rowHeight={300}
          autoHeight
          rows={this.state.rows}
          columns={this.state.columns}
          filterModel={this.state.filterModel}
        />
      </div>
    );
  }
}
TableMarketItems.propTypes = {
  items_history: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  inventory: PropTypes.number.isRequired,
  onRowRefesh: PropTypes.func.isRequired,
  police: PropTypes.number.isRequired,
  refreshrows: PropTypes.bool.isRequired,
};
export default TableMarketItems;
