<template>
  <div id="app" class="playlistr-app">
    <div class="app-container">
      <header class="app-header">
        <div class="logo-container">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h1>Playlistr</h1>
        </div>
        <div v-if="loggedInToSpotify" class="user-info">
          <div class="user-avatar">{{ userName ? userName.charAt(0).toUpperCase() : '?' }}</div>
          <span class="user-name">{{ userName || 'User' }}</span>
        </div>
      </header>

      <main class="app-content">
        <div v-if="!loggedInToSpotify" class="welcome-card">
          <h2>Create AI-powered playlists</h2>
          <p class="subtext">Connect your Spotify account to get started</p>
          <button
            @click="connectSpotify"
            :disabled="loading"
            class="spotify-connect-button"
          >
            <svg class="spotify-icon" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Spotify
          </button>
        </div>

        <div v-else class="generator-card">
          <h2>What's your vibe today?</h2>
          <p class="subtext">Describe your perfect playlist</p>
          
          <div class="input-group">
            <input
              v-model="userInput"
              type="text"
              placeholder="e.g., upbeat hindi songs for driving"
              @keyup.enter="generatePlaylist"
              class="modern-input"
            />
            <button
              @click="generatePlaylist"
              :disabled="loading"
              class="generate-button"
            >
              <span v-if="loading">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
              </span>
              <span v-else>Generate</span>
            </button>
          </div>

          <div v-if="playlistParams && !playlistUrl" class="generating-state">
            <div class="loading-indicator">
              <div class="loading-bar"></div>
            </div>
            <p class="generating-text">
              Creating <span class="highlight">{{ playlistParams.genre }}</span> playlist
              <span v-if="playlistParams.moods?.length">with <span class="highlight">{{ playlistParams.moods.join(', ') }}</span> vibes</span>
            </p>
          </div>

          <div v-if="playlistUrl" class="result-card">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>{{ successMessage }}</h3>
            <p class="subtext">Your personalized playlist is ready</p>
            <a :href="playlistUrl" target="_blank" class="spotify-button">
              Open in Spotify
            </a>
          </div>
        </div>
      </main>

      <p v-if="userMessage" class="text-center text-red-400 mt-6 font-medium animate-pulse">
        {{ userMessage }}
      </p>

      <transition name="fade">
        <div v-if="error" class="error-message">
          <svg class="error-icon" viewBox="0 0 24 24" fill="#FF6B6B">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {{ error }}
        </div>
      </transition>

      <footer class="developer-info">
        <h4>Made with 💚 by Sufyan</h4>
        <a class="linkedInButton" href="http://linkedin.com/in/sufyanshaik03/" target="_blank" rel="noopener noreferrer">
          Get in touch!
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const userInput = ref('');
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);
const playlistParams = ref(null);
const playlistUrl = ref(null);

const accessToken = ref(null);
const refreshToken = ref(null);
const userId = ref(null);
const userName = ref(null);
const userMessage = ref('');
const loggedInToSpotify = computed(() => !!accessToken.value && !!userId.value);

const connectSpotify = () => {
  error.value = null;
  successMessage.value = null;
  // Make sure this matches your backend route
  window.location.href = '/api/spotify-login'; 
};

const extractTokensFromUrl = () => {
  const hash = window.location.hash;

  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1)); // Remove '#'
    accessToken.value = params.get('access_token');
    refreshToken.value = params.get('refresh_token');
    // Assuming user_id and username are passed back in the hash
    userId.value = params.get('user_id'); 
    userName.value = params.get('username');
    error.value = params.get('error');

    if (accessToken.value) sessionStorage.setItem('spotify_access_token', accessToken.value);
    if (refreshToken.value) sessionStorage.setItem('spotify_refresh_token', refreshToken.value);
    if (userId.value) sessionStorage.setItem('spotify_user_id', userId.value);
    if (userName.value) sessionStorage.setItem('spotify_user_name', userName.value);

    if (accessToken.value && userId.value) {
      successMessage.value = "Successfully connected to Spotify!";
    } else if (error.value) {
      error.value = `Connection failed: ${error.value}`;
    }
    // Clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const loadTokensFromSessionStorage = () => {
  accessToken.value = sessionStorage.getItem('spotify_access_token');
  refreshToken.value = sessionStorage.getItem('spotify_refresh_token');
  userId.value = sessionStorage.getItem('spotify_user_id');
  userName.value = sessionStorage.getItem('spotify_user_name');
};

const generatePlaylist = async () => {
  if (!userInput.value.trim()) {
    error.value = 'Please describe your playlist';
    return;
  }

  loading.value = true;
  error.value = null;
  successMessage.value = null;
  playlistParams.value = null;
  playlistUrl.value = null;

  try {
    const geminiResponse = await axios.post('/api/generate-playlist-params', {
      prompt: userInput.value
    });
    playlistParams.value = geminiResponse.data;

    const spotifyPlaylistResponse = await axios.post('/api/create-spotify-playlist', {
      params: playlistParams.value,
      access_token: accessToken.value,
      user_id: userId.value
    });

    playlistUrl.value = spotifyPlaylistResponse.data.playlist_url;
    successMessage.value = spotifyPlaylistResponse.data.playlist_name || "Your new playlist";
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  extractTokensFromUrl();
  if (!accessToken.value) {
    loadTokensFromSessionStorage();
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --spotify-green: #1DB954;
  --spotify-dark: #191414;
  --spotify-light: #FFFFFF;
  --spotify-gray: #B3B3B3;
  --spotify-dark-gray: #535353;
  --spotify-light-gray: #F5F5F5;
  --error-red: #FF6B6B;
  --success-green: #1DB954;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Inter', sans-serif;
  background-color: #000;
  color: var(--spotify-light);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.app-container {
  width: 100%;
  max-width: 500px;
  background-color: #121212;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--spotify-green);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--spotify-green);
  color: var(--spotify-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

.user-name {
  font-weight: 500;
  color: var(--spotify-light);
}

.app-content {
  margin-bottom: 1.5rem;
}

.welcome-card, .generator-card, .result-card {
  background-color: #181818;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--spotify-light);
}

.subtext {
  color: var(--spotify-gray);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.spotify-connect-button {
  background-color: var(--spotify-green);
  color: var(--spotify-light);
  border: none;
  border-radius: 500px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spotify-connect-button:hover {
  transform: scale(1.05);
  background-color: #1ED760;
}

.spotify-icon {
  width: 20px;
  height: 20px;
}

.input-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.modern-input {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 500px;
  border: 1px solid var(--spotify-dark-gray);
  background-color: #282828;
  color: var(--spotify-light);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.modern-input:focus {
  outline: none;
  border-color: var(--spotify-green);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
}

.generate-button {
  background-color: var(--spotify-green);
  color: var(--spotify-light);
  border: none;
  border-radius: 500px;
  padding: 0 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.generate-button:hover:not(:disabled) {
  background-color: #1ED760;
  transform: scale(1.05);
}

.generate-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: rotate 1s linear infinite;
  margin: 0 auto;
}

.spinner circle {
  stroke: var(--spotify-light);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.generating-state {
  margin-top: 2rem;
}

.loading-indicator {
  height: 4px;
  background-color: #282828;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.loading-bar {
  height: 100%;
  width: 50%;
  background-color: var(--spotify-green);
  border-radius: 2px;
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.generating-text {
  color: var(--spotify-gray);
  font-size: 0.9rem;
}

.highlight {
  color: var(--spotify-green);
  font-weight: 600;
}

.result-card {
  animation: fadeIn 0.5s ease;
}

.success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  background-color: rgba(29, 185, 84, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-icon svg {
  width: 24px;
  height: 24px;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--spotify-light);
}

.spotify-button {
  display: inline-block;
  background-color: var(--spotify-green);
  color: var(--spotify-light);
  border-radius: 500px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.spotify-button:hover {
  background-color: #1ED760;
  transform: scale(1.05);
}

.error-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--error-red);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 500px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideUp 0.3s ease;
  z-index: 100;
}

.error-icon {
  width: 20px;
  height: 20px;
}

/* MODIFIED DEVELOPER INFO STYLES */
.developer-info {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--spotify-dark-gray);
}

.developer-info h4 {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--spotify-gray);
  margin-bottom: 1rem;
}

.linkedInButton {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background-color: transparent;
  color: var(--spotify-light);
  text-decoration: none;
  border-radius: 500px;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  border: 1px solid var(--spotify-dark-gray);
}

.linkedInButton:hover {
  background-color: var(--spotify-green);
  border-color: var(--spotify-green);
  color: var(--spotify-light);
  transform: scale(1.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
