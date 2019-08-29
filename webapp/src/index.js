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

class NewGym extends React.Component {
  focusInput(event) {
    event.target.select();
  }
  render() {
    return (
    <div style={{
      left: this.props.left - 50,
      top: this.props.top - 94,
    }} className="newgym">
    <CloseButton onClick={this.props.closeNewGym}/>
    <input id="newgymname" placeholder="Gym name" onClick={this.focusInput}/>
    <br/>
    <button type="button" onClick={this.props.addGym}>Save</button>
    <button type="button" onClick={this.props.closeNewGym}>Cancel</button>
    </div>
    );
  }
}

class Gym extends React.Component {
  constructor(props) {
    super(props);
    this.updateAvailability = this.updateAvailability.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.state = {
      info: {},
      availability: {},
      user: {weekend: 0, weekdaydaytime: 0, weekdayevening: 0}
    };
    function make_handler(context) {
      return function (response) {
        if (response.error) {
          context.setState({error: response.error});
        } else {
          context.setState({availability: response.availability, user: response.self});
        }
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

  handleTextClick(event) {
    event.target.select();
  }

  handleSelectAll(event) {
    let siblings = document.getElementsByClassName("selectalltarget");
    for(let i=0;i<siblings.length;i++) {
      siblings[i].checked = event.target.checked;
    }
    this.updateAvailability(event);
  }

  updateAvailability(event) {
    let weekend = document.getElementById('availweekend').checked;
    let weekdaydaytime = document.getElementById('availweekdaydaytime').checked;
    let weekdayevening = document.getElementById('availweekdayevening').checked;

    function make_handler(context) {
      return function (response) {
        if (response.error) {
          context.setState({error: response.error});
        } else {
          context.setState({user: response.self});
          if (response.self.weekend || response.self.weekdaydaytime
           || response.self.weekdayevening) {
            context.props.setUserFlag();
          } else {
            context.props.clearUserFlag();
          }
        }
      };
    }
    fetch(config.APIBASEURL + 'gym.php',
     {
      credentials: 'include',
      mode: 'cors',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
       'weekend': weekend,
       'weekdaydaytime': weekdaydaytime,
       'weekdayevening': weekdayevening,
       'gid': this.props.id
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
    let paste = "";
    let field;
    if (this.state.availability !== undefined && this.state.availability.length > 0) {
      paste = "<@" + this.state.availability.join("> <@") + ">";
      field = (<input className="copyusers"
       onClick={this.handleTextClick} readOnly="readOnly" value={paste}/>);
    } else {
      field = (<input className="nousers"
       readOnly="readOnly" value="no one available now"/>);
    }
    return (
    <div style={{
      left: this.props.left - 50,
      top: this.props.top - 174,
    }} className="gym">
    <CloseButton onClick={this.props.switchToMap}/>
      <div id="gymtitle">{this.props.name} ({this.props.id})</div>
      <fieldset>
      <label htmlFor="selectall">Select All</label>
      <input id="selectall" onChange={this.handleSelectAll}
       className="alignright" type="checkbox"
       checked={this.state.user.weekend && this.state.user.weekdaydaytime && this.state.user.weekdayevening}
       /><br/>
      <label htmlFor="availweekend">Weekends</label>
      <input id="availweekend" className="alignright selectalltarget"
       onChange={this.updateAvailability} type="checkbox"
       checked={this.state.user.weekend}/><br/>
      <label htmlFor="availweekdaydaytime">Weekdays daytime</label>
      <input id="availweekdaydaytime" className="alignright selectalltarget"
       onChange={this.updateAvailability} type="checkbox"
       checked={this.state.user.weekdaydaytime}/><br/>
      <label htmlFor="availweekdayevening">Weekday evenings</label>
      <input id="availweekdayevening" className="alignright selectalltarget"
       onChange={this.updateAvailability} type="checkbox"
       checked={this.state.user.weekdayevening}/><br/>
      </fieldset>
      {field}
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

class UserSwitcher extends React.Component {
  render() {
    return (
     <div id="userswitcher">
       <input id="newuid" />
       <br/>
       <button id="assumeuid" type="button" onClick={this.props.assumeUid}>
         Assume UID
       </button>
     </div>
    );
  }
}

class PlaceGymButton extends React.Component {
  render() {
    return (
     <div id="placegym">
     <button id="placegym" type="button" onClick={this.props.switchToPlaceGym}>
       Place Gym
     </button>
     </div>
    );
  }
}

class ErrorMessage extends React.Component {
  render() {
    return (
     <div id="errormessage">
      <CloseButton onClick={this.props.closeErrorMessage}/>
       {this.props.message}
     </div>
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
      to raid at.  Open each one and define when you are available.  Gyms
      you have defined availability at are shown in red.</li>

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
      placeGym: false,
      newGymLatLng: null,
      lat: 34,
      lng: -40,
      zoom: 19,
      isAdmin: false,
      gyms: [],
    };
    this.onBoundsChanged = this.onBoundsChanged.bind(this);
    this.assumeUid = this.assumeUid.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.switchToPlaceGym = this.switchToPlaceGym.bind(this);
    this.closeNewGym = this.closeNewGym.bind(this);
    this.addGym = this.addGym.bind(this);
    this.closeErrorMessage = this.closeErrorMessage.bind(this);
    function make_handler(context) {
      return function (response) {
        if (response.error) {
          context.setState({error: response.error});
        } else {
          context.setState({
           gyms: response.gyms,
           lat: response.lat,
           lng: response.lng,
           zoom: response.zoom,
           isAdmin: response.isadmin,
          });
        }
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
    this.setState({screen: "map", gymid: 0, gymName: ""});
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

  assumeUid(event) {
    let uid = document.getElementById('newuid').value;

    function make_handler(context) {
      return function (response) {
        if (response.error) {
          context.setState({error: response.error});
        } else {
          context.setState({
           gyms: response.gyms,
           lat: response.lat,
           lng: response.lng,
           zoom: response.zoom,
           isAdmin: response.isadmin,
          });
        }
      };
    }
    fetch(config.APIBASEURL + 'assumeuid.php',
     {
      credentials: 'include',
      mode: 'cors',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
       'uid': uid
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

  switchToPlaceGym() {
    this.setState({placeGym: true});
    document.getElementById("full-screen").style.cursor = "crosshair";
  }

  handleMapClick(event) {
    if (this.state.placeGym) {
      this.setState({placeGym: false, newGymLatLng: event.latLng});
      document.getElementById("full-screen").style.cursor = "initial";
    }
  }

  closeNewGym() {
    this.setState({newGymLatLng: null});
  }

  addGym() {
    let name = document.getElementById('newgymname').value;
    if (name === "") {
      return;
    }

    function make_handler(context) {
      return function (response) {
        if (response.error) {
          context.setState({error: response.error});
        } else {
          context.setState({
           gyms: response.gyms,
           lat: response.lat,
           lng: response.lng,
           zoom: response.zoom,
           isAdmin: response.isadmin,
          });
        }
      };
    }
    fetch(config.APIBASEURL + 'gym.php',
     {
      credentials: 'include',
      mode: 'cors',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
       'name': name,
       'latlng': this.state.newGymLatLng
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

    this.setState({newGymLatLng: null});
  }

  closeErrorMessage() {
    this.setState({error: null});
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
    let extraElement = null;
    for (var key in this.state.gyms) {
      markers.push(<CustomMarker
       key={key}
       name={this.state.gyms[key]['name']}
       anchor={[this.state.gyms[key]['lat'], this.state.gyms[key]['lng']]}
       color={this.state.gyms[key]['user'] > 0 ? "red" : "blue" }
       onClick={make_handler(key, this.state.gyms[key]['name'], this)}
      />);
      if (this.state.error) {
        extraElement = (
          <ErrorMessage
            message={this.state.error}
            closeErrorMessage={this.closeErrorMessage}
          />
        );
      } else if (this.state.newGymLatLng) {
        extraElement = (
          <NewGym
           anchor={this.state.newGymLatLng}
           addGym={this.addGym}
           closeNewGym={this.closeNewGym}
          />
        );
      } else if (this.state.gymid === key) {
        extraElement = (
          <Gym
           key="gym-popup"
           anchor={[this.state.gyms[key]['lat'], this.state.gyms[key]['lng']]}
           id={this.state.gymid}
           name={this.state.gymName}
           times={this.state.lastTimes}
           setUserFlag={() => this.setUserFlag(this.state.gymid)}
           clearUserFlag={() => this.clearUserFlag(this.state.gymid)}
           switchToMap={() => this.switchToMap()}
          />
        );
      }
    }
    let adminControls = "";
    if (this.state.isAdmin) {
      adminControls = (
        <div>
        <PlaceGymButton switchToPlaceGym={this.switchToPlaceGym} />
        <UserSwitcher assumeUid={this.assumeUid} />
        </div>
      );
    }
    ret = (
      <div id="full-screen">
        <Map center={[this.state.lat, this.state.lng]} zoom={this.state.zoom}
         provider={this.provider} onClick={this.handleMapClick}
         onBoundsChanged={this.onBoundsChanged}>
          {markers}
          {extraElement}
        </Map>
        {adminControls}
        <Logo switchToAbout={() => this.switchToAbout()} />
      </div>
    );
    if (this.state.screen === "about") {
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
