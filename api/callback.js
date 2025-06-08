import axios from 'axios/dist/node/axios.cjs';

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookies = req.headers.cookie || '';
  const storedState = cookies
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('spotify_auth_state='))
    ?.split('=')[1];

  if (!state || state !== storedState) {
    return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
  }

  // Clear the state cookie
  res.setHeader('Set-Cookie', 'spotify_auth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;');

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const baseUrl = process.env.APP_URL;
  const redirect_uri = `${baseUrl}/api/callback`;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token } = response.data;
    const userProfile = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + access_token }
    });

    const userId = userProfile.data.id;
    const username = userProfile.data.display_name;

    // IMPORTANT: add vercel domain
    res.redirect(`https://playlistr-chi.vercel.app/#/authorized?access_token=${access_token}&refresh_token=${refresh_token}&user_id=${userId}&username=${username}`);
  } catch (error) {
    res.redirect('/#' + new URLSearchParams({ error: 'token_exchange_failed' }).toString());
  }
}
