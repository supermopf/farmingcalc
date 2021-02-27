import React from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * Zeigt einen Timer bis zum nächsten Restart
 */
class RestartClock extends React.Component {
  /**
   * Properties der Komponente
   * @param {*} props
   */
  constructor(props) {
    super(props);

    this.state = {
      nextRestart: new Date,
      untilRestart: new Date,
      RestartHours: [3, 7, 11, 15, 19, 23],
    };
  }
  /**
   * Setzt die Zeit des nächsten Restarts
   */
  setNewRestartTime() {
    const restartTime = this.getNextRestartTime();
    this.setState({
      nextRestart: restartTime,
      untilRestart: this.getTimeRemaining(restartTime),
    });
  }

  /**
   * Gibt die verbleibende Zeit aus
   * @param {time} endtime
   * @return {object}
   */
  getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = (
      Math.floor((total/1000)%60).toLocaleString(
          'en-US',
          {minimumIntegerDigits: 2, useGrouping: false},
      )
    );
    const minutes = (
      Math.floor( (total/1000/60) % 60 ).toLocaleString(
          'en-US',
          {minimumIntegerDigits: 2, useGrouping: false},
      )
    );
    const hours = (
      Math.floor( (total/(1000*60*60)) % 24 ).toLocaleString(
          'en-US',
          {minimumIntegerDigits: 2, useGrouping: false},
      )
    );
    const days = Math.floor( total/(1000*60*60*24) );

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  /**
   * Aktualisiert die Uhr
   */
  tick() {
    this.setState({
      untilRestart: this.getTimeRemaining(this.state.nextRestart),
    });
    if (this.state.untilRestart.total <= 0) {
      this.setNewRestartTime();
    }
  }

  /**
   * Komponente wurde geladen
   */
  componentDidMount() {
    this.setNewRestartTime();

    this.ticker = setInterval(() => this.tick(), 1000);
  }

  /**
   * Komponente wird entlanden
   */
  componentWillUnmount() {
    clearInterval(this.ticker);
  }

  /**
   * Berechnet den nächsten Neustart
   * @return {time}
   */
  getNextRestartTime() {
    const nextrestart = this.getNextRestartHour();
    const restartTime = new Date;

    restartTime.setHours(nextrestart);
    restartTime.setMinutes(0);
    restartTime.setSeconds(0);

    if (nextrestart == 3) {
      restartTime.setDate(restartTime.getDate() + 1);
    }

    return restartTime;
  }

  /**
   * Gibt den nächsten Wert des Restart-Arrays aus
   * @param {array} hours
   * @param {time} time
   * @return {int}
   */
  getNextRestartHour(hours = this.state.RestartHours, time = new Date) {
    for (const [, hour] of hours.entries()) {
      if (hour > time.getHours()) {
        return hour;
      }
    }
    return hours[0];
  }

  /**
   * Rendert die Komponente
   * @return {object}
   */
  render() {
    return (
      <TextField
        disabled={true}
        id="time"
        label="Restart in"
        value={
          this.state.untilRestart.hours + ':' +
          this.state.untilRestart.minutes + ':' +
          this.state.untilRestart.seconds
        }/>
    );
  }
}
export default RestartClock;
