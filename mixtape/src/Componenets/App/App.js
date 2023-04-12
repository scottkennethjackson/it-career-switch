import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';
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
        {name: 'PlaylistTrack1', artist: 'PlaylistArtist1', album: 'PlaylistAlbum1', id: 4},
        {name: 'PlaylistTrack2', artist: 'PlaylistArtist2', album: 'PlaylistAlbum2', id: 5},
        {name: 'PlaylistTrack3', artist: 'PlaylistArtist3', album: 'PlaylistAlbum3', id: 6}
      ]
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }

    tracks.push(track);
    this.setState({playlistTracks: tracks});
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);

    this.setState({playlistTracks: tracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => track.uri);
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      this.setState({searchResults: searchResults})
    });
  }

  render() {
    return (
      <div>
        <h1>{spotifyLogo} Mixtape</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
