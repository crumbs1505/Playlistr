import axios from 'axios/dist/node/axios.cjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { params, access_token, user_id } = req.body;

  if (!access_token || !user_id || !params) {
    return res.status(400).json({ error: 'Missing access token, user ID, or playlist parameters.' });
  }

  try {
    let playlistName = "Playlistr Generated Playlist";
    let playlistDescription = "A playlist created by Playlistr based on your prompt.";

    // Build search query
    let searchQuery = '';
    if (params.artists?.length) {
      searchQuery += ` ${params.artists.join(' ')} `;
      playlistName += `${params.artists.join(', ')} Mix`;
      playlistDescription+=` Featuring artists like ${params.artists.join(', ')}.`;
    }
    if (params.search_terms && params.search_terms.length > 0) {
    
    
    searchQuery += ` ${params.search_terms.join(' ')}`;
    
    if (playlistName === "Playlistr Generated Playlist") {
        
        playlistName = params.search_terms[0].split(' ')
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ') + " Playlist";
    }
    playlistDescription += ` Vibes: ${params.search_terms.join(', ')}.`;
}
    searchQuery = searchQuery.trim();

    const headers = { 'Authorization': 'Bearer ' + access_token };

    let trackUris = [];
    let trackIds = new Set();

    if (searchQuery) {
      const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
        headers,
        params: {
          q: searchQuery,
          type: 'track,album,playlist,artist',
          limit: 20,
          market: 'AE,IN,US',
          offset: 5
        }
      });

      if (searchResponse.data.tracks && searchResponse.data.tracks.items.length > 0) {
        searchResponse.data.tracks.items.forEach(track => {
          if (!trackIds.has(track.id)) {
            trackUris.push(track.uri);
            trackIds.add(track.id);
          }
        });
      }
    } else {
      const fallbackSearchResponse = await axios.get('https://api.spotify.com/v1/search', {
        headers,
        params: {
          q: 'top hits',
          type: 'track,playlist',
          limit: 10
        }
      });
      if (fallbackSearchResponse.data.tracks && fallbackSearchResponse.data.tracks.items.length > 0) {
        fallbackSearchResponse.data.tracks.items.forEach(track => {
          if (!trackIds.has(track.id)) {
            trackUris.push(track.uri);
            trackIds.add(track.id);
          }
        });
      }
    }

    if (trackUris.length === 0) {
      playlistDescription += " (Note: No matching tracks found based on your prompt.)";
    }

    const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
      name: playlistName,
      description: playlistDescription,
      public: false
    }, { headers });

    const playlistId = createPlaylistResponse.data.id;
    const playlistUrl = createPlaylistResponse.data.external_urls.spotify;

    if (trackUris.length > 0) {
      await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: trackUris
      }, { headers });
    }

    res.json({
      playlist_id: playlistId,
      playlist_url: playlistUrl,
      playlist_name: playlistName,
      message: 'Playlist created and tracks added successfully!'
    });

  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: 'Spotify access token expired or invalid. Please re-connect to Spotify.' });
    }
    res.status(500).json({ error: 'Failed to create Spotify playlist.', details: error.response?.data || error.message });
  }
}
