import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class Clock extends React.Component{
  constructor(props){
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount(){
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount(){
    clearInterval(this.ticker);
  }

  tick(){
    this.setState({
      date: new Date()
    })
  }

  render(){
    return(
      <div>
        <h1>Aktuelle Uhrzeit: {this.state.date.toLocaleTimeString()}</h1>
      </div>
    )
  }
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
