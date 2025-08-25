module.exports = {
  token: process.env.token || "", // Ensure this env variable is set
  channelId: process.env.channelId || "",

  webMonitor: true, // Set to false if you don't want a website
  expressPort: process.env.expressPort || 3000,

  nodes: [
    {
      host: "46.202.82.98", // Your lavalink host address 
      password: "cocaine", // Your lavalink password
      port: 1279, // Your lavalink port
      identifier: "Lavalink", // Name for your lavalink
      secure: false, // set to true if your lavalink has SSL
      reconnectTimeout: 300000,
      reconnectTries: 100,
    },
     {
      host: "96.262.88.08", // Your lavalink host address 
      password: "cocaine", // Your lavalink password
      port: 1279, // Your lavalink port
      identifier: "Lavalink 2", // Name for your lavalink
      secure: false, // set to true if your lavalink has SSL
      reconnectTimeout: 300000,
      reconnectTries: 100,
    },
  ],
};
