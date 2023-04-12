import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import './App.css';

const spotifyLogo = <FontAwesomeIcon icon={faSpotify}/>

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [
        {name: 'Track1', artist: 'Artist1', album: 'Album1', id: 1},
        {name: 'Track2', artist: 'Artist2', album: 'Album2', id: 2},
        {name: 'Track3', artist: 'Artist3', album: 'Album3', id: 3}
      ],
      playlistName: 'My Mixtape',
      playlistTracks: [
        {name: 'Playlist1', artist: 'PlaylistArtist1', album: 'PlaylistAlbum1', id: 4},
        {name: 'Playlist2', artist: 'PlaylistArtist2', album: 'PlaylistAlbum2', id: 5},
        {name: 'Playlist3', artist: 'PlaylistArtist3', album: 'PlaylistAlbum3', id: 6}
      ]
    };

    this.addTrack = this.addTrack.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }

    tracks.push(track);
    this.setState({playlistTracks: tracks});
  }

  render() {
    return (
      <div>
        <h1>{spotifyLogo} Mixtape</h1>
        <div className="App">
          <SearchBar />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
