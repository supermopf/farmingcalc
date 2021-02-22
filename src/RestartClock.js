import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';

const API = 'https://api.realliferpg.de';
const ServerID = 1;

class RestartClock extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
            nextRestart: new Date,
            untilRestart: new Date,
            RestartHours: [3,7,11,15,19,23],
        };
    }

    setNewRestartTime(){
        let restartTime = this.getNextRestartTime()
        this.setState({
            nextRestart: restartTime,
            untilRestart: this.getTimeRemaining(restartTime)
        })
    }

    getTimeRemaining(endtime){
        const total = Date.parse(endtime) - Date.parse(new Date());
        const seconds = Math.floor( (total/1000) % 60 ).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        const minutes = Math.floor( (total/1000/60) % 60 ).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        const hours = Math.floor( (total/(1000*60*60)) % 24 ).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        const days = Math.floor( total/(1000*60*60*24) );
      
        return {
          total,
          days,
          hours,
          minutes,
          seconds
        };
    }

    tick(){
        this.setState({
            untilRestart: this.getTimeRemaining(this.state.nextRestart)
        })     
        if(this.state.untilRestart.total <= 0){
            this.setNewRestartTime()
        }
    }

    componentDidMount(){
        this.setNewRestartTime()
        
        this.ticker = setInterval(() => this.tick(), 1000)
    }

    componentWillUnmount(){
        clearInterval(this.ticker)
    }

    

    getNextRestartTime(){
        let nextrestart
        let restartTime

        nextrestart = this.getNextRestartHour()
        restartTime = new Date
        restartTime.setHours(nextrestart)
        restartTime.setMinutes(0)
        restartTime.setSeconds(0)

        if(nextrestart == 3){
            restartTime.setDate(restartTime.getDate() + 1)
        }

        return restartTime
    }


    getNextRestartHour(hours = this.state.RestartHours, time = new Date) {
        for (const [i,hour] of hours.entries()) {
            if(hour > time.getHours()){
                return hour;
            }
        }
        return hours[0]
    }


    render(){
        return(
            <TextField disabled={true} id="time" label="Restart in" value={
                this.state.untilRestart.hours + ":" + this.state.untilRestart.minutes + ":" + this.state.untilRestart.seconds
            }/>
        )
    }
} 
export default RestartClock;