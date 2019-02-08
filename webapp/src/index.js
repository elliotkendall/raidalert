import React from 'react';
import ReactDOM from 'react-dom';
import Map from 'pigeon-maps'
import Marker from 'pigeon-marker'
import './index.css';

class CloseButton extends React.Component {
  render() {
    return (
      <button className="close-button" onClick={this.props.onClick}>X</button>
    );
  }
}

class RaidingPeople extends React.Component {
  render() {
    return (
      <div>
      The following people may be available to raid here now:
      <input readOnly="readOnly" value="foo bar baz"/>
      </div>
    );
  }
}

class DaysOfTheWeekSelector extends React.Component {
  render() {
    return (
      <select multiple="multiple"
       value={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
       onChange={this.props.onChange}>
        <option>Sunday</option>
        <option>Monday</option>
        <option>Tuesday</option>
        <option>Wednesday</option>
        <option>Thursday</option>
        <option>Friday</option>
        <option>Saturday</option>
      </select>
    );
  }
}

class TimeSelector extends React.Component {
  render() {
    return (
      <div>
      <select onChange={this.props.onChangeHours}>
        <option>06</option>
        <option>07</option>
        <option>08</option>
        <option>09</option>
        <option>10</option>
        <option>11</option>
        <option>12</option>
        <option>13</option>
        <option>14</option>
        <option>15</option>
        <option>16</option>
        <option>17</option>
        <option>18</option>
        <option>19</option>
        <option>20</option>
      </select>
      :
      <select onChange={this.props.onChangeMinutes}>
        <option>00</option>
        <option>15</option>
        <option>30</option>
        <option>45</option>
      </select>
      </div>
    );
  }
}

class BeginEndTimeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      begin_hours: "06",
      begin_minutes: "00",
      end_hours: "18",
      end_minutes: "00",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    };
  }

  updateBeginHours(event) {
    this.setState({begin_hours: event.target.value});
  }

  updateBeginMinutes(event) {
    this.setState({begin_minutes: event.target.value});
  }

  updateEndHours(event) {
    this.setState({end_hours: event.target.value});
  }

  updateEndMinutes(event) {
    this.setState({end_minutes: event.target.value});
  }

  updateDays(event) {
    let newDays = [];
    for (var i=0;i<event.target.options.length;i++) {
      if (event.target.options[i].selected) {
        newDays.push(event.target.options[i].value);
      }
    }
    this.setState({days: newDays});
  }

  addRecord() {
    alert("Starting at " + this.state.begin_hours + ":" + this.state.begin_minutes
     + " and ending at " + this.state.end_hours + ":" + this.state.end_minutes
     + " on " + this.state.days.toString());
  }

  render() {
    return (
      <div>
      Begin time: <TimeSelector
        hours={this.state.begin_hours} minutes={this.state.begin_minutes}
        onChangeHours={(event) => this.updateBeginHours(event)}
        onChangeMinutes={(event) => this.updateBeginMinutes(event)}/>
      End time: <TimeSelector
       hours={this.state.end_hours} minutes={this.state.end_minutes}
        onChangeHours={(event) => this.updateEndHours(event)}
        onChangeMinutes={(event) => this.updateEndMinutes(event)} />
      Days of the week: <DaysOfTheWeekSelector days={this.state.days}
       onChange={(event) => this.updateDays(event)}/>
      <button onClick={() => this.addRecord()}>Add</button>
      </div>
    );
  }
}

class AvailableTime extends React.Component {
  render() {
    return (
      <div className="available-time">
      06:00 - 20:00 Sunday, Monday, Tuesday, Thursday, Friday, Saturday
      </div>
    );
  }
}

class Gym extends React.Component {
  render() {
    return (
      <div className="gym">
      <CloseButton onClick={this.props.switchToMap}/>

      <h3>Gym Name ({this.props.id})</h3>
      <RaidingPeople />
      You're available to raid at the following times:
      <AvailableTime />
      <BeginEndTimeSelector />
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: "map",
      gyms: [],
    };
    function make_handler(context) {
      return function (response) {
        context.setState({gyms: response});
      };
    }
    fetch('https://2p4dfem1ol.execute-api.us-east-1.amazonaws.com/test/gym',
     {credentials: 'include'})
      .then(function(response) {
        if (response.ok) {
          return response.json();
        } else {
          document.location = 'https://discordapp.com/api/oauth2/authorize?client_id=521793846577856513&redirect_uri=https%3A%2F%2F2p4dfem1ol.execute-api.us-east-1.amazonaws.com%2Ftest%2Foauth&response_type=code&scope=identify%20guilds'
        }
      })
      .then(make_handler(this));
  }

  provider(x, y, z) {
    const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2 ? '@2x' : '';
    return `https://stamen-tiles.a.ssl.fastly.net/toner-lite/${z}/${x}/${y}${retina}.png`
  };

  switchToGym(id, name) {
    this.setState({screen: "gym", gymid: id, gymName: name});
  }

  switchToMap() {
    this.setState({screen: "map"});
  }

  render() {
    if (this.state.screen === "map") {
      var markers = [];
      // Weird hack to get around defining function in a loop
      function make_handler(gymid, context) {
        return function () {
          context.switchToGym(gymid);
        };
      }
      for (var i=0;i<this.state.gyms.length;i++) {
        markers.push(<Marker key={this.state.gyms[i][0]} anchor={[this.state.gyms[i][3], this.state.gyms[i][2]]} payload={1}
         onClick={make_handler(this.state.gyms[i][0], this)} />);
      }
      return (
        <div className="full-screen">
          <Map center={[37.770284, -122.449123]} zoom={13}
           provider={this.provider}>
            {markers}
          </Map>
        </div>
      );
    } else if (this.state.screen === "gym") {
      return (
        <Gym
          id={this.state.gymid}
          name={this.state.gymName}
          switchToMap={() => this.switchToMap()}
        />
      );
    }
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
