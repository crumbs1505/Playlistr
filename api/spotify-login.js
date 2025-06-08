import crypto from 'crypto';

export default async function handler(req, res) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const baseUrl = process.env.APP_URL;
  const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';


  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `spotify_auth_state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax;${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}`);

  const redirect_uri = `${baseUrl}/api/callback`;

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state,
      show_dialog: 'true'
    }).toString()
  );
}