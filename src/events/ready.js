const { EmbedBuilder, resolveColor, ActivityType } = require("discord.js");
const config = require("../config");
const moment = require("moment");
require("moment-duration-format");
const colors = require("colors");

const arrayChunker = (array, chunkSize = 5) => {
  let chunks = [];
  for (let i = 0; i < array.length; i += chunkSize)
    chunks.push(array.slice(i, i + chunkSize));
  return chunks;  
};

// Track last values for trends
let lastAvgLoad = null;
let lastMemoryUsed = null;

module.exports = async (client) => {
  const prettyBytes = (await import("pretty-bytes")).default;
  const channel = await client.channels.fetch(config.channelId);
  const embed = new EmbedBuilder()
    .setColor(resolveColor("#2F3136"))
    .setDescription("Fetching Stats From Lavalink Server");

  channel.bulkDelete(1);
  const msg = await channel.send({ embeds: [embed] });

  const nodeStates = new Map();
  const nodeDowntime = new Map();

  const notify = async (nodeId, prevState, newState) => {
    try {
      let color = "#F1C40F";
      let title = "Lavalink Node Alert";
      let extraInfo = "";

      if (newState === "Connected") {
        if (prevState === "Disconnected" || prevState === "Error") {
          color = "#2ECC71";
          title = "✅ Node Recovery";
          if (nodeDowntime.has(nodeId)) {
            const downSince = nodeDowntime.get(nodeId);
            const downtime = Date.now() - downSince;
            extraInfo = `\n**Downtime:** ${moment
              .duration(downtime)
              .format("m [minutes], s [seconds]")}`;
            nodeDowntime.delete(nodeId);
          }
        } else {
          color = "#2ECC71";
          title = "🟢 Node Connected";
        }
      } else if (newState === "Disconnected") {
        color = "#E74C3C";
        title = "🔴 Node Disconnected";
        nodeDowntime.set(nodeId, Date.now());
      } else if (newState === "Error") {
        color = "#F1C40F";
        title = "⚠️ Node Error";
        nodeDowntime.set(nodeId, Date.now());
      }

      const alertEmbed = new EmbedBuilder()
        .setColor(resolveColor(color))
        .setAuthor({
          name: title,
          iconURL: client.user.displayAvatarURL({ forceStatic: false }),
        })
        .setDescription(
          `**Node:** \`${nodeId}\`\n**Status Change:** \`${prevState}\` → \`${newState}\`${extraInfo}`
        )
        .setFooter({ text: "Zenio's Lavalink Monitor" })
        .setTimestamp();

      if (config.logChannelId) {
        const logChannel = await client.channels.fetch(config.logChannelId).catch(() => null);
        if (logChannel) {
          await logChannel.send({ embeds: [alertEmbed] });
          console.log(colors.cyan(`[ALERT] Sent alert for node ${nodeId}`));
          return;
        }
      }

      if (config.ownerId) {
        const owner = await client.users.fetch(config.ownerId).catch(() => null);
        if (owner) {
          await owner.send({ embeds: [alertEmbed] });
          console.log(colors.cyan(`[ALERT] DM’d owner about node ${nodeId}`));
        }
      }
    } catch (err) {
      console.error(colors.yellow(`[WARN] Could not send alert embed: ${err.message}`));
    }
  };

  const updateLavalinkStats = async () => {
    let all = [];
    let expressStatus = [];

    let totalPlayers = 0;
    let activePlayers = 0;
    let totalSystemLoad = 0;
    let nodeCount = 0;
    let totalMemoryUsed = 0;
    let totalMemoryReservable = 0;

    client.manager.nodesMap.forEach((node) => {
      let color = node.connected ? "+" : "-";

      totalPlayers += node.stats.players;
      activePlayers += node.stats.playingPlayers;
      totalSystemLoad += node.stats.cpu.systemLoad || 0;
      totalMemoryUsed += node.stats.memory.used || 0;
      totalMemoryReservable += node.stats.memory.reservable || 0;
      nodeCount++;

      let info = [];
      info.push(`${color} Node          :: ${node.identifier}`);
      info.push(`${color} Status        :: ${node.connected ? "Connected [🟢]" : "Disconnected [🔴]"}`);
      info.push(`${color} Players       :: ${node.stats.playingPlayers}/${node.stats.players}`);
      info.push(`${color} Uptime        :: ${moment.duration(node.stats.uptime).format(" d [days], h [hours], m [minutes]")}`);
      info.push(`${color} Cores         :: ${node.stats.cpu.cores} Core(s)`);
      info.push(`${color} Memory Usage  :: ${prettyBytes(node.stats.memory.used)}/${prettyBytes(node.stats.memory.reservable)}`);
      info.push(`${color} System Load   :: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%`);
      info.push(`${color} Lavalink Load :: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`);

      all.push(info.join("\n"));
      expressStatus.push({
        node: node.identifier,
        online: node.connected ? true : false,
        status: node.connected ? "Connected" : "Disconnected",
        players: node.stats.players,
        activePlayers: node.stats.playingPlayers,
        uptime: moment.duration(node.stats.uptime).format(" d [days], h [hours], m [minutes]"),
        cores: node.stats.cpu.cores,
        memoryUsed: prettyBytes(node.stats.memory.used),
        memoryReservable: prettyBytes(node.stats.memory.reservable),
        systemLoad: (Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2),
        lavalinkLoad: (Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2),
      });

      const prevState = nodeStates.get(node.identifier) || "Unknown";
      const newState = node.connected ? "Connected" : "Disconnected";
      if (prevState !== newState) {
        notify(node.identifier, prevState, newState);
        nodeStates.set(node.identifier, newState);
      }
    });

    // Global summary
    const avgSystemLoad = nodeCount > 0 ? (Math.round((totalSystemLoad / nodeCount) * 100) / 100).toFixed(2) : "0.00";

    // Trends
    let loadTrend = "➡️";
    if (lastAvgLoad !== null) {
      loadTrend = avgSystemLoad > lastAvgLoad ? "📈" : avgSystemLoad < lastAvgLoad ? "📉" : "➡️";
    }
    lastAvgLoad = avgSystemLoad;

    let memTrend = "➡️";
    if (lastMemoryUsed !== null) {
      memTrend = totalMemoryUsed > lastMemoryUsed ? "📈" : totalMemoryUsed < lastMemoryUsed ? "📉" : "➡️";
    }
    lastMemoryUsed = totalMemoryUsed;

    const globalStats = [
      `+ 🌐 Servers       :: ${client.guilds.cache.size}`,
      `+ 🎵 Total Players :: ${activePlayers}/${totalPlayers}`,
      `+ Avg System Load :: ${avgSystemLoad}% ${loadTrend}`,
      `+ Peak Memory     :: ${prettyBytes(totalMemoryUsed)}/${prettyBytes(totalMemoryReservable)} ${memTrend}`,
    ];
    all.unshift(globalStats.join("\n"));

    // Safe fetch to web monitor
    if (config.webMonitor === true) {
      try {
        await fetch(`http://localhost:${config.expressPort}/stats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats: expressStatus }),
        });
      } catch (err) {
        console.log(colors.yellow(`[WebMonitor] Skipped sending stats: ${err.message}`));
      }
    }

    const chunked = arrayChunker(all, 8);
    const statusembeds = [];

    chunked.forEach((data) => {
      const rembed = new EmbedBuilder()
        .setColor(resolveColor("#2F3136"))
        .setAuthor({ name: `Zenio's Lavalink Monitor`, iconURL: client.user.displayAvatarURL({ forceStatic: false }) })
        .setDescription(`\`\`\`diff\n${data.join("\n\n")}\`\`\``)
        .setFooter({ text: "Last Updated" })
        .setTimestamp(Date.now());
      statusembeds.push(rembed);
    });

    msg.edit({ embeds: statusembeds });
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(10000);
  await updateLavalinkStats();

  setInterval(updateLavalinkStats, 60000);

  client.user.setPresence({
    status: "online",
    activities: [{ name: "Lavalink Status", type: ActivityType.Watching }],
  });

  console.log(colors.green(`[CLIENT] ${client.user.username} is now Online!`));
};
