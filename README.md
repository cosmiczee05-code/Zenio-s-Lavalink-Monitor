# Zenio-s-Lavalink-Monitor
A Discord bot too keep check of your lavalink status and availability.
<h1 align="center"><img src="Images/logo.png"   alt="logo.png" width="40"  >Lavalink Status Monitor</h1>

<p align="center"><strong>Note:</strong> This monitor only supports Lavalink v4.</p>

<div align="center">
  <a href="https://discord.gg/32sW7XPMpJ" target="_blank">
    <img src="https://img.shields.io/static/v1?message=Discord&logo=discord&label=&color=7289DA&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="discord logo"  />
  </a>
</div>

## Installation / Hosting Guide

1. **Ensure NodeJS v18 or Later**:
    - Make sure your NodeJS version is 18 or later.

2. **Configure the Bot**:
    - Fill in the [config.js](https://github.com/cosmiczee05-code/Zenio-s-Lavalink-Monitor/blob/main/src/config.js) file with your Lavalink Setting, Bot Token, and Channel ID where you want to send the status updates.

3. **Install Required Packages**:
    - Run the following command in your console:
    ```sh
    npm install
    ```

4. **Start the Bot from vs code**:
    - Run the following commands to start the bot:
    ```sh
    npm run start
    ```
5. **Start the Bot from panel**:
    - Run the following commands to start the bot:
    ```sh
    src/index.js
    ```
6. **Report Issue**:
    - If you encounter any issues or the code doesn’t work, please [create an issue](https://github.com/cosmiczee05-code/Zenio-s-Lavalink-Monitor/issues).
    
    OR

    Join our discord server [Discord](https://discord.gg/32sW7XPMpJ).

## Web Monitor

1. **Enable Web Monitor**:
    - Set `webMonitor` to `true` in the [config.js](https://github.com/cosmiczee05-code/Zenio-s-Lavalink-Monitor/blob/main/src/config.js) file.

2. **Custom Domain**:
    - You can setup your custom domain by using services like Cloudflare Tunnel or any other preferable services which assigns custom domain.

### Hosting 
    Register in [Render](https://render.com) 
    • Create a new Web service monitor.
    • Build Command = npm install
    • Start Command = npm run start

    Add Environment details 
    • token "",
    • channelId "",
    • expressPort ""

    Deploy your service
    • After the Deploy is completed you will see the live server add that website into some 
    website monitor such as [BetterStack](https://uptime.betterstack.com) , [UptimeeRobot]
    (https://uptimerobot.com) or any other service you like. And you are good to go

    Now your server will be online 24/7 


<div align="center">
  Made with ❤️ by the Cocaine - Zenio Dev Team
</div>
