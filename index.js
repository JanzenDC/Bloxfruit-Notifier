const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
const prices = require('./prices'); // Import the prices module
const moment = require('moment-timezone'); // Import moment-timezone for time manipulation
const stocktime = require('./stocktime'); // Import the stocktime module

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const URL = 'https://blox-fruits.fandom.com/wiki/Blox_Fruits_"Stock"';

// Function to check the stock
async function checkStock() {
    try {
        const { data } = await axios.get(URL);
        const page = data.toLowerCase();

        // Extracting relevant section of the page
        const currentSection = page.split('id="mw-customcollapsible-current"').pop().split('id="mw-customcollapsible-last"')[0];

        // Determine which fruits are in the current stock
        const currentStock = [];
        for (const fruit of Object.keys(prices)) {
            const fruitIsInStock = currentSection.includes(`>${fruit.toLowerCase()}<`);
            if (fruitIsInStock) currentStock.push(fruit);
        }

        // If only one fruit is found, add "rocket" and "spin"
        if (currentStock.length === 1) currentStock.unshift("rocket", "spin");

        return currentStock;
    } catch (error) {
        console.error('[Utils getCurrentStock]:', error);
        return ['Error fetching stock data'];
    }
}

// Function to get the formatted time in Pacific Time minus 4 hours
function getFormattedTime() {
    const now = moment.tz('Asia/Singapore');


    return now.format('h:mm:ss A'); 
}


function getTimeUntilNextUpdate() {
    const now = new Date().getTime() / 1000; // Current time in seconds
    const nextTimestamp = stocktime.nextTimestamp(); // Get next update timestamp
    const timeUntilNextUpdate = nextTimestamp - now; // Time until next update
    const duration = moment.duration(timeUntilNextUpdate, 'seconds'); // Create a duration object

    // Format the duration as "X hours, Y minutes, Z seconds"
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return `${hours}h ${minutes}m ${seconds}s`;
}


// Function to send stock update to Discord
async function sendStockUpdate() {
    try {
        const currentStock = await checkStock(); // Fetch the current stock
        const channel = await client.channels.fetch(CHANNEL_ID);

        if (channel) {
            // Create a formatted string for the current stock
            const stockList = currentStock.map(fruit => `- ${fruit}`).join('\n');

            // Get time until next update
            const timeUntilNextUpdate = getTimeUntilNextUpdate();

            // Create an embed message with a footer
            const embed = new EmbedBuilder()
                .setTitle('Devil Fruits Stock Update')
                .setDescription(`Current Stock:\n${stockList}`)
                .setFooter({
                    text: `${getFormattedTime()} | Next update in: ${timeUntilNextUpdate}`,
                    iconURL: 'https://th.bing.com/th/id/R.6830a20aa5f313af4ef2998b0d649313?rik=MEacFFrivckYtw&riu=http%3a%2f%2forig12.deviantart.net%2ff873%2ff%2f2011%2f043%2f4%2ff%2fkyubi_png_ii_by_hidan_sama1408-d39dr89.png&ehk=XWx0%2fditCSkz1dQ4kB4qwgpCj9pGOuqkGK5f9QGffTo%3d&risl=&pid=ImgRaw&r=0' // Optional footer icon
                });

            channel.send({ embeds: [embed] });
        } else {
            console.error('Channel not found!');
        }
    } catch (error) {
        console.error('Error sending stock update:', error);
    }
}

// Function to schedule the next update
function scheduleNextUpdate() {
    const nextTimestamp = stocktime.nextTimestamp();
    const now = new Date().getTime() / 1000;
    const timeUntilNextUpdate = nextTimestamp - now;

    console.log(`Next update scheduled in ${timeUntilNextUpdate} seconds`);

    // Schedule the next update
    setTimeout(() => {
        sendStockUpdate(); // Send the update
        scheduleNextUpdate(); // Schedule the next updates
    }, timeUntilNextUpdate * 1000);
}

client.once(Events.ClientReady, () => {
    console.log('Bot is online!');
    sendStockUpdate(); // Send an initial update
    scheduleNextUpdate(); // Schedule the next updates
});

// Handle commands (if needed)
client.on(Events.MessageCreate, message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'price') {
        const fruit = args[0].toLowerCase();
        if (prices[fruit]) {
            message.channel.send(`The price of ${fruit} is ${prices[fruit]}`);
        } else {
            message.channel.send('That fruit is not available or the name is incorrect. Please check the fruit name.');
        }
    }
});

client.login(TOKEN);
