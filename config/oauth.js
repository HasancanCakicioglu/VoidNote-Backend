import {OAuth2Client} from 'google-auth-library';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const oAuth2Client = new OAuth2Client(clientId, clientSecret);


export default oAuth2Client;