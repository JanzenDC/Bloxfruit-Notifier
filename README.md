
# Devil Fruits Stock Notifier Bot

This Discord bot notifies a specified channel about the current stock of Devil Fruits in the Blox Fruits game. The bot checks the stock status from a specific URL, formats the information, and sends updates to a Discord channel using an embedded message.

## Features

- Fetches current Devil Fruit stock from the Blox Fruits Fandom wiki.
- Sends an update to a Discord channel with the current stock and the time remaining until the next update.
- Capitalizes the first letter of each fruit name in the notification.
- Configurable update intervals based on Pacific Time.

## Installation

Follow these steps to set up and run the bot:

1. **Clone the Repository**

   Clone this repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/devil-fruits-stock-bot.git
   cd devil-fruits-stock-bot
   ```

2. **Install Dependencies**

   Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed. Install the required dependencies using npm:

   ```bash
   npm install
   ```

3. **Create a `.env` File**

   Create a `.env` file in the root directory of the project to store your bot token and channel ID:

   ```env
   BOT_TOKEN=your_discord_bot_token
   CHANNEL_ID=your_discord_channel_id
   ```

   Replace `your_discord_bot_token` with your Discord bot's token and `your_discord_channel_id` with the ID of the channel where you want to send notifications.

4. **Add Prices Data**

   Make sure the `prices.js` file contains the Devil Fruit prices in the following format:

   ```javascript
   module.exports = {
       rocket: "5,000",
       spin: "7,500",
       // Add more fruits here...
   };
   ```

5. **Configure Update Times**

   The bot is configured to check for updates based on predefined hours in Pacific Time. You can modify the `stocktime.js` file if needed.

## Running the Bot

To start the bot, use the following command:

```bash
node bot.js
```

This command will run the bot and it will:

- Fetch and send an initial update to the specified Discord channel.
- Schedule subsequent updates based on the defined intervals.

## Usage

- **Initial Setup**: Run the bot to send an initial stock update and start periodic checks.
- **Price Command**: You can query the price of a specific Devil Fruit using the command `!price <fruit_name>`. The bot will respond with the price of the specified fruit.

## Contributing

Feel free to open issues or submit pull requests if you have improvements or fixes for the bot. 

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Discord.js](https://discord.js.org/) for the Discord API wrapper.
- [Axios](https://axios-http.com/) for making HTTP requests.
- [Moment-Timezone](https://momentjs.com/timezone/) for handling timezones.

### Notes:

1. **Replace placeholders**:
   - Make sure to replace `[https://github.com/yourusername/devil-fruits-stock-bot.git](https://github.com/JanzenDC/Bloxfruit-Notifier/)` with the actual URL of your GitHub repository.
   - Ensure `your_discord_bot_token` and `your_discord_channel_id` in the `.env` file are correctly set.

2. **Dependencies**:
   - The `prices.js` and `stocktime.js` files are assumed to be in the same directory as your `index.js`. Make sure they are set up correctly according to the provided script.

3. **Usage**:
   - Commands and their functionality are described briefly in the Usage section.
