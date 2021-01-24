import Discord from 'discord.js';
import config from './config.js';

const client = new Discord.Client();
client.login(config.botToken);
