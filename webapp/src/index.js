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
      <h4>The following people may be available to raid here now</h4>
      <input readOnly="readOnly" value="foo bar baz"/>
      </div>
    );
  }
}

class DaysOfTheWeekSelector extends React.Component {
  render() {
    return (
      <fieldset>
      <legend>Days of the week</legend>
      <input id="sunday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="sunday">Sunday</label><br/>
      <input id="monday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="monday">Monday</label><br/>
      <input id="tuesday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="tuesday">Tuesday</label><br/>
      <input id="wednesday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="wednesday">Wednesday</label><br/>
      <input id="thursday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="thursday">Thursday</label><br/>
      <input id="friday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="friday">Friday</label><br/>
      <input id="saturday" checked="checked" type="checkbox" onChange={this.props.onChange} /> <label htmlFor="saturday">Saturday</label>
      </fieldset>
    );
  }
}

class TimeSelector extends React.Component {
  render() {
    return (
      <div className="time-selector">
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
      days: {
        "sunday": true,
        "monday": true,
        "tuesday": true,
        "wednesday": true,
        "thursday": true,
        "friday": true,
        "saturday": true
      }
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
    let newDays = Object.assign({}, this.state.days);
    let day = event.target.id;
    if (event.target.checked) {
      newDays[day] = true;
    } else {
      newDays[day] = false;
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
      <p>
      Begin time: <TimeSelector
        hours={this.state.begin_hours} minutes={this.state.begin_minutes}
        onChangeHours={(event) => this.updateBeginHours(event)}
        onChangeMinutes={(event) => this.updateBeginMinutes(event)}/>
      </p>
      <p>
      End time: <TimeSelector
       hours={this.state.end_hours} minutes={this.state.end_minutes}
        onChangeHours={(event) => this.updateEndHours(event)}
        onChangeMinutes={(event) => this.updateEndMinutes(event)} />
      </p>
      <p>
      <DaysOfTheWeekSelector days={this.state.days}
       onChange={(event) => this.updateDays(event)}/><br/>
      </p>
      <button onClick={() => this.addRecord()}>Add</button>
      </div>
    );
  }
}

class AvailableTime extends React.Component {
  render() {
    return (
      <p className="available-time">
      06:00-20:00 Sunday, Monday, Tuesday, Thursday, Friday, Saturday
      <button className="remove-button">X</button>
      </p>
    );
  }
}

class Gym extends React.Component {
  render() {
    return (
      <div className="gym">
      <CloseButton onClick={this.props.switchToMap}/>

      <h3>{this.props.name}</h3>
      <hr/>
      <RaidingPeople />
      <hr/>

      <h4>
      You're available to raid at the following times
      </h4>
      <ul>
      <li><AvailableTime /></li>
      </ul>
      <hr/>

      <h4>
      Add a time you're available to raid:
      </h4>
      <BeginEndTimeSelector />
      </div>
    );
  }
}

class Logo extends React.Component {
  render() {
    return (
      <img className="logo" title="Raid Alert" alt="Raid Alert Logo"
       src="raid.png" onClick={this.props.switchToAbout}/>
    );
  }
}

class About extends React.Component {
  render() {
    return (
      <div className="about">
      <CloseButton onClick={this.props.switchToMap}/>

      <h3>About Raid Alert</h3>
      Lorem ipsum
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
    fetch('https://dx4.org/raidalert/gym.php',
     {credentials: 'include'})
      .then(function(response) {
        if (response.ok) {
          return response.json();
        } else {
          document.location = 'https://discordapp.com/api/oauth2/authorize?client_id=521793846577856513&redirect_uri=https%3A%2F%2Fdx4.org%2Fraidalert%2Foauth.php&response_type=code&scope=identify%20guilds';
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

  switchToAbout() {
    this.setState({screen: "about"});
  }

  render() {
    var markers = [];
    var ret;
    // Weird hack to get around defining function in a loop
    function make_handler(gymid, gymname, context) {
      return function () {
        context.switchToGym(gymid, gymname);
      };
    }
    for (var i=0;i<this.state.gyms.length;i++) {
      markers.push(<Marker key={this.state.gyms[i]['gid']} anchor={[this.state.gyms[i]['lng'], this.state.gyms[i]['lat']]} payload={1}
       onClick={make_handler(this.state.gyms[i]['gid'], this.state.gyms[i]['name'], this)} />);
    }
    ret = (
      <div className="full-screen">
        <Map center={[37.770284, -122.449123]} zoom={13}
         provider={this.provider}>
          {markers}
        </Map>
        <Logo switchToAbout={() => this.switchToAbout()} />
      </div>
    );
    if (this.state.screen === "gym") {
      ret =(
        <div>
        {ret}
        <div className="dim">
        <div className="overlay">
        <Gym
          id={this.state.gymid}
          name={this.state.gymName}
          switchToMap={() => this.switchToMap()}
        />
        </div>
        </div>
        </div>
      );
    } else if (this.state.screen === "about") {
      ret =(
        <div>
        {ret}
        <div className="dim">
        <div className="overlay">
        <About
          switchToMap={() => this.switchToMap()}
        />
        </div>
        </div>
        </div>
      );
    }
    return ret;
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
