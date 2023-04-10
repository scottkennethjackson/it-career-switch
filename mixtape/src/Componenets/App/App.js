import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Mixtape</h1>
        <div className="App">
          {/* Add a SearchBar component */}
          <div className="App-playlist">
            {/* Add a SearchResults component */}
            {/* Add a Playlist component */}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
