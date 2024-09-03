                    // Required Dependencies
                    const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
                    const axios = require('axios');
                    const dotenv = require('dotenv');
                    const moment = require('moment-timezone');

                    // Custom Modules
                    const prices = require('./prices'); // Ensure this module exports an object with fruit prices
                    const stocktime = require('./stocktime'); // Ensure this module exports a function nextTimestamp()

                    dotenv.config();

                    // Environment Variables
                    const TOKEN = process.env.BOT_TOKEN;
                    const CHANNEL_ID = process.env.CHANNEL_ID;

                    // URL to fetch stock data from
                    const STOCK_URL = 'https://fruityblox.com/stock';

                    // Initialize Discord Client
                    const client = new Client({
                        intents: [
                            GatewayIntentBits.Guilds,
                            GatewayIntentBits.GuildMessages,
                            GatewayIntentBits.MessageContent
                        ]
                    });

                    // Function to fetch and parse stock data
                    async function checkStock() {
                        try {
                            const { data } = await axios.get(STOCK_URL);

                            // Use regex to extract all image alt attributes which contain fruit names
                            const altRegex = /<img[^>]*alt="([^"]+)"[^>]*>/gi;
                            const matches = [...data.matchAll(altRegex)].map(match => match[1]);

                            if (matches.length === 0) {
                                console.warn('No fruits found in stock data.');
                                return {
                                    normalStock: ['No fruits in normal stock'],
                                    mirageStock: ['No fruits in mirage stock']
                                };
                            }

                            // Divide the fruits into normal and mirage stock based on their order
                            const midIndex = Math.floor(matches.length / 2);
                            const normalStock = matches.slice(0, midIndex);
                            const mirageStock = matches.slice(midIndex);

                            return {
                                normalStock: normalStock.length > 0 ? normalStock : ['No fruits in normal stock'],
                                mirageStock: mirageStock.length > 0 ? mirageStock : ['No fruits in mirage stock']
                            };

                        } catch (error) {
                            console.error('[checkStock Error]:', error);
                            return {
                                normalStock: ['Error fetching normal stock data'],
                                mirageStock: ['Error fetching mirage stock data']
                            };
                        }
                    }

                    // Function to get current time in a specific timezone
                    function getFormattedTime() {
                        const now = moment().tz('Asia/Singapore');
                        return now.format('h:mm:ss A');
                    }

                    // Function to calculate time until next update
                    function getTimeUntilNextUpdate() {
                        const now = moment();
                        const nextUpdate = moment.unix(stocktime.nextTimestamp());
                        const duration = moment.duration(nextUpdate.diff(now));

                        const hours = Math.floor(duration.asHours());
                        const minutes = duration.minutes();
                        const seconds = duration.seconds();

                        return `${hours}h ${minutes}m ${seconds}s`;
                    }

                    // Function to send stock update to Discord
                    async function sendStockUpdate() {
                        try {
                            const currentStock = await checkStock();
                            const channel = await client.channels.fetch(CHANNEL_ID);

                            if (!channel) {
                                console.error('Channel not found!');
                                return;
                            }

                            // Format normal stock
                            const normalStockList = currentStock.normalStock
                            .filter(fruit => prices[fruit.toLowerCase()]) // Filter out fruits without prices
                            .map(fruit => {
                                const price = prices[fruit.toLowerCase()];
                                return `• **${capitalizeFirstLetter(fruit)}** - ${price}`;
                            }).join('\n');


                            // Format mirage stock
                            const mirageStockList = currentStock.mirageStock
                            .filter(fruit => prices[fruit.toLowerCase()]) // Filter out fruits without prices
                            .map(fruit => {
                                const price = prices[fruit.toLowerCase()];
                                return `• **${capitalizeFirstLetter(fruit)}** - ${price}`;
                            }).join('\n');

                            // Create embed message
                            const embed = new EmbedBuilder()
                                .setColor('#FFA500')
                                .setTitle('🍇 Devil Fruits Stock Update 🍇')
                                .addFields(
                                    { name: '🌟 Normal Stock', value: normalStockList || 'No fruits available', inline: false },
                                    { name: '✨ Mirage Stock', value: mirageStockList || 'No fruits available', inline: false },
                                )
                                .setFooter({
                                    text: `${getFormattedTime()} | Next update in: ${getTimeUntilNextUpdate()}`,
                                    iconURL: 'https://media.tenor.com/Qo0KoxEZZBUAAAAC/gol-d-roger-one-piece.gif' // Replace with a valid URL or remove this line
                                })
                                .setTimestamp();

                            // Send embed to channel
                            await channel.send({ embeds: [embed] });
                            console.log('Stock update sent successfully.');

                        } catch (error) {
                            console.error('[sendStockUpdate Error]:', error);
                        }
                    }

                    // Helper function to schedule the next stock update
                    function scheduleNextUpdate() {
                        const nextTimestamp = stocktime.nextTimestamp();
                        const now = moment().unix();
                        const timeUntilNextUpdate = (nextTimestamp - now) * 1000; // Convert to milliseconds

                        console.log(`Next update scheduled in ${moment.duration(timeUntilNextUpdate).humanize()}.`);

                        setTimeout(async () => {
                            await sendStockUpdate();
                            scheduleNextUpdate(); // Schedule subsequent updates
                        }, timeUntilNextUpdate);
                    }

                    // Helper function to capitalize the first letter of a string
                    function capitalizeFirstLetter(string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }

                    // Event listener when the bot is ready
                    client.once(Events.ClientReady, () => {
                        console.log(`Logged in as ${client.user.tag}!`);
                        sendStockUpdate(); // Send initial update
                        scheduleNextUpdate(); // Schedule future updates
                    });

                    // Command handling (example for price lookup)
                    client.on(Events.MessageCreate, message => {
                        if (!message.content.startsWith('!') || message.author.bot) return;

                        const args = message.content.slice(1).trim().split(/ +/);
                        const command = args.shift().toLowerCase();

                        if (command === 'price') {
                            const fruit = args.join(' ').toLowerCase();
                            if (!fruit) {
                                return message.channel.send('Please specify a fruit name. Example: `!price dragon`');
                            }
                            const price = prices[fruit];
                            if (price) {
                                message.channel.send(`The price of **${capitalizeFirstLetter(fruit)}** is **${price}**.`);
                            }
                        }
                        if (command === 'stock') {
                            sendStockUpdate();
                        }
                    });

                    // Login to Discord
                    client.login(TOKEN);
