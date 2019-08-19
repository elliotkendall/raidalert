import React from 'react';
import ReactDOM from 'react-dom';
import Map from 'pigeon-maps'
import './index.css';
import * as config from './config.js';

class CloseButton extends React.Component {
  render() {
    return (
      <button className="close-button" onClick={this.props.onClick}>X</button>
    );
  }
}

class RaidingPeople extends React.Component {
  constructor(props) {
    super(props);
    if (props.now !== undefined && props.next !== undefined)
    this.state = {
      now: props.now.join("><"),
      next: props.next.join("><"),
    };
  }
  
  render() {
    let now = "";
    let next = "";
    if (this.props.now !== undefined && this.props.now.length > 0) {
      now = "<@" + this.props.now.join("> <@") + ">";
    }
    if (this.props.next !== undefined && this.props.next.length > 0) {
      next = "<@" + this.props.next.join("> <@") + ">";
    }
    let d = new Date();
    d.setHours(d.getHours()+1);
    let thisHour = d.getHours() + ":00";
    d.setHours(d.getHours()+1);
    let nextHour = d.getHours() + ":00";
    return (
      <div>
      <h4>The following people may be available to raid here until {thisHour}</h4>
      <input className="copyusers" readOnly="readOnly" value={now}/>
      <h4>The following people may be available to raid here between {thisHour} and {nextHour}</h4>
      <input className="copyusers" readOnly="readOnly" value={next}/>
      </div>
    );
  }
}

class DaysOfTheWeekSelector extends React.Component {
  render() {
    return (
      <fieldset>
      <legend>Days of the week</legend>
      <input id="sunday" checked={this.props.days.sunday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="sunday">Sunday</label><br/>
      <input id="monday" checked={this.props.days.monday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="monday">Monday</label><br/>
      <input id="tuesday" checked={this.props.days.tuesday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="tuesday">Tuesday</label><br/>
      <input id="wednesday" checked={this.props.days.wednesday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="wednesday">Wednesday</label><br/>
      <input id="thursday" checked={this.props.days.thursday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="thursday">Thursday</label><br/>
      <input id="friday" checked={this.props.days.friday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="friday">Friday</label><br/>
      <input id="saturday" checked={this.props.days.saturday} type="checkbox" onChange={this.props.onChange} /> <label htmlFor="saturday">Saturday</label>
      </fieldset>
    );
  }
}

class TimeSelector extends React.Component {
  render() {
    return (
      <div className="time-selector">
      <select value={this.props.time} onChange={this.props.onChange}>
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
      </div>
    );
  }
}

class StartStopTimeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gid: props.gid,
      start: "06",
      stop: "20",
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

  updateStart(event) {
    this.setState({start: event.target.value});
  }

  updateStop(event) {
    this.setState({stop: event.target.value});
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

  render() {
    return (
      <div>
      <div>
      Start time: <TimeSelector
        time={this.state.start}
        onChange={(event) => this.updateStart(event)}/>
      </div>
      <div>
      Stop time: <TimeSelector
       time={this.state.stop}
        onChange={(event) => this.updateStop(event)} />
      </div>
      <div>
      <DaysOfTheWeekSelector days={this.state.days}
       onChange={(event) => this.updateDays(event)}/><br/>
      </div>
      <button onClick={(state) => this.props.addRecord(this.state)}>Add</button>
      </div>
    );
  }
}

class AvailableTime extends React.Component {
  render() {
    function capitalizeArray(a) {
      let ret = [];
      for(let i=0;i<a.length;i++) {
        ret[i] = a[i].charAt(0).toUpperCase() + a[i].slice(1);
      }
      return ret;
    }

    if (this.props.times === undefined || this.props.times.length === 0) {
      return (<div>None</div>);
    }
    let times = [];
    let time;
    // Weird hack to get around defining function in a loop
    function make_handler(start, stop, days, context) {
      return function () {
        context.props.removeRecord(start, stop, days);
      };
    }
    for(let i=0;i<this.props.times.length;i++) {
      time = this.props.times[i];
      times.push(
      <li className="available-time" key={time.start.toString() + time.stop.toString() + time.days.toString()}>
      {time.start}:00-{time.stop}:00 {capitalizeArray(time.days).join(", ")}
      <button className="remove-button"
       onClick={make_handler(time.start, time.stop, time.days, this)}>X</button>
      </li>
      );
    }
    return (<ul>{times}</ul>);
  }
}

class Gym extends React.Component {
  constructor(props) {
    super(props);
    this.addRecord = this.addRecord.bind(this);
    this.removeRecord = this.removeRecord.bind(this);
    this.state = {
      info: {},
    };
    function make_handler(context) {
      return function (response) {
        context.setState({next: response.next, now: response.now, user: response.user});
      };
    }
    fetch(config.APIBASEURL + 'gym.php?id=' + props.id.toString(),
     {credentials: 'include'})
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 403) {
         document.location = config.DISCORDAUTHURL;
      }
      throw new Error(response.code);
    })
    .then(make_handler(this))
    .catch(function(error) {
      console.log('Fetch failed: ', error.message);
    });
  }

  addRecord(state) {
    function make_handler(context) {
      return function (response) {
        context.setState({next: response.next, now: response.now, user: response.user});
        if (response.user.length > 0) {
          context.props.setUserFlag();
        }
      };
    }
    fetch(config.APIBASEURL + 'gym.php',
     {
      credentials: 'include',
      mode: 'cors',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(state),
     })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 403) {
         document.location = config.DISCORDAUTHURL;
      }
      throw new Error(response.code);
    })
    .then(make_handler(this))
    .catch(function(error) {
      console.log('Fetch failed: ', error.message);
    });
  }

  removeRecord(start, stop, days) {
    function make_handler(context) {
      return function (response) {
        context.setState({next: response.next, now: response.now, user: response.user});
        if (response.user.length < 1) {
          context.props.clearUserFlag();
        }
      };
    }
    fetch(config.APIBASEURL + 'gym.php',
     {
      credentials: 'include',
      mode: 'cors',
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
       'start': start, 'stop': stop, 'days': days, 'gid': this.props.id
      }),
     })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 403) {
         document.location = config.DISCORDAUTHURL;
      }
      throw new Error(response.code);
    })
    .then(make_handler(this))
    .catch(function(error) {
      console.log('Fetch failed: ', error.message);
    });
  }

  render() {
    return (
      <div className="gym">
      <CloseButton onClick={this.props.switchToMap}/>

      <h3>{this.props.name} ({this.props.id})</h3>
      <hr/>
      <RaidingPeople now={this.state.now} next={this.state.next}/>
      <hr/>

      <h4>
      You're available to raid here at the following times
      </h4>
      <AvailableTime times={this.state.user} removeRecord={this.removeRecord}/>
      <hr/>

      <h4>
      Add a time you're available to raid:
      </h4>
      <StartStopTimeSelector gid={this.props.id} addRecord={this.addRecord}/>
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
      Raid Alert is a website that helps you coordinate raiding in Pokemon
      Go with your friends on Discord.

      <h3>How to use it</h3>
      <ol>

      <li>To log in, you need a Discord account and you need to be a
      member of one or more of the servers we support.</li>

      <li>Navigate around the map to find gyms that you are regularly able
      to raid at. Open each one and define what days of the week and
      times you are available. Gyms you have defined availability at are
      shown in red.</li>

      <li>When you are playing Pokemon Go and see a nearby raid you are
      interested in, return to Raid Alert and open the matching gym.</li>

      <li>You will see a list of Discord IDs of people who indicated that
      they may be available to raid at this gym at this time.</li>

      <li>Copy and paste the list into your Discord client to mention all of
      the people who may be available to raid.  With luck, some of them will
      respond to you and you can settle on a time to meet for the raid.</li>
      </ol>

      <h3>Supported Servers</h3>
      Raid Alert current supports the following Pokemon Go Discord servers:
      <ul>
      <li><strong>SF Pogo Raids Meetup</strong>, San Francisco, California, USA</li>
      </ul>
      If you run a Pokemon Go server and would like Raid Alert to support
      your area, please let me know - see below.

      <h3>Contacting Me</h3>
      You can find me, ToadstoolSpots, on my <a
      href="https://discord.gg/QG9watn">Pokemon Go development Discord
      Server</a>.

      </div>
    );
  }

}

class CustomMarker extends React.Component {
  render() {
    return (
    <img onClick={this.props.onClick} style={{
      position: 'absolute',
      left: this.props.left - 15,
      top: this.props.top - 30,
    }}
    alt={this.props.name}
    title={this.props.name}
    src={"pin" + this.props.color + ".png"}/>);
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: "map",
      lat: 37.770284,
      lng: -122.449123,
      zoom: 13,
      gyms: [],
    };
    this.onBoundsChanged = this.onBoundsChanged.bind(this);
    function make_handler(context) {
      return function (response) {
        context.setState({gyms: response});
      };
    }
    fetch(config.APIBASEURL + 'gym.php',
     {credentials: 'include'})
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 403) {
         document.location = config.DISCORDAUTHURL;
      }
      throw new Error(response.code);
    })
    .then(make_handler(this))
    .catch(function(error) {
      console.log('Fetch failed: ', error.message);
    });
  }

  provider(x, y, z) {
    const retina = typeof window !== 'undefined' && window.devicePixelRatio >= 2 ? '@2x' : '';
    return config.MAPPROVIDER + `${z}/${x}/${y}${retina}.png`
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

  onBoundsChanged(bounds) {
    this.setState({zoom: bounds.zoom, lat: bounds.center[0], lng: bounds.center[1]});
  }

  setUserFlag(gid) {
    let gyms = this.state.gyms;
    gyms[gid]['user'] = 1;
    this.setState({gyms: gyms});
  }

  clearUserFlag(gid) {
    let gyms = this.state.gyms;
    gyms[gid]['user'] = 0;
    this.setState({gyms: gyms});
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
    for (var key in this.state.gyms) {
      markers.push(<CustomMarker
       key={key}
       name={this.state.gyms[key]['name']}
       anchor={[this.state.gyms[key]['lng'], this.state.gyms[key]['lat']]}
       color={this.state.gyms[key]['user'] > 0 ? "red" : "blue" }
       onClick={make_handler(key, this.state.gyms[key]['name'], this)}
      />);
    }
    ret = (
      <div className="full-screen">
        <Map center={[this.state.lat, this.state.lng]} zoom={this.state.zoom}
         provider={this.provider} onBoundsChanged={this.onBoundsChanged}>
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
          setUserFlag={() => this.setUserFlag(this.state.gymid)}
          clearUserFlag={() => this.clearUserFlag(this.state.gymid)}
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
