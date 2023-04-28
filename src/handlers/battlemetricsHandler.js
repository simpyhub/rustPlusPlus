/*
    Copyright (C) 2022 Alexander Emanuelsson (alexemanuelol)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    https://github.com/alexemanuelol/rustplusplus

*/

const BattlemetricsAPI = require('../util/battlemetricsAPI.js');
const Constants = require('../util/constants.js');
const DiscordMessages = require('../discordTools/discordMessages.js');
const Scrape = require('../util/scrape.js');

module.exports = {
    handler: async function (client) {
        const forceSearch = (client.battlemetricsIntervalCounter === 0) ? true : false;

        const calledPages = new Object();
        const calledSteamIdNames = new Object();

        for (const guildItem of client.guilds.cache) {
            const guild = guildItem[1];
            let instance = client.getInstance(guild.id);
            const activeServer = getActiveServerId(instance.serverList);

            if (activeServer !== null && instance.serverList[activeServer].battlemetricsId !== null) {
                let battlemetricsId = instance.serverList[activeServer].battlemetricsId;
                if (!Object.keys(calledPages).includes(battlemetricsId)) {
                    const page = await BattlemetricsAPI.getBattlemetricsServerPage(client, battlemetricsId);
                    if (page !== null) {
                        calledPages[battlemetricsId] = page;
                    }
                }
            }

            for (const [trackerId, content] of Object.entries(instance.trackers)) {
                if (!content.active) continue;
                instance = client.getInstance(guild.id);

                let changed = false;

                let page = null;
                if (!Object.keys(calledPages).includes(content.battlemetricsId)) {
                    page = await BattlemetricsAPI.getBattlemetricsServerPage(client, content.battlemetricsId);
                    if (page === null) continue;
                    calledPages[content.battlemetricsId] = page;
                }
                else {
                    page = calledPages[content.battlemetricsId];
                }

                const info = await BattlemetricsAPI.getBattlemetricsServerInfo(
                    client, content.battlemetricsId, page);
                if (info === null) continue;

                if (instance.trackers[trackerId].status !== info.status) changed = true;
                instance.trackers[trackerId].status = info.status;

                const onlinePlayers = await BattlemetricsAPI.getBattlemetricsServerOnlinePlayers(
                    client, content.battlemetricsId, page);
                if (onlinePlayers === null) continue;

                const rustplus = client.rustplusInstances[guild.id];

                for (let player of content.players) {
                    player = instance.trackers[trackerId].players.find(e => e.steamId === player.steamId);
                    let onlinePlayer = onlinePlayers.find(e => e.name === player.name);
                    if (onlinePlayer) {
                        changed = true;
                        if (player.status === false) {
                            const str = client.intlGet(guild.id, 'playerJustConnectedTracker', {
                                name: player.name,
                                tracker: content.name
                            });
                            await DiscordMessages.sendActivityNotificationMessage(
                                guild.id, content.serverId, Constants.COLOR_ACTIVE, str, null);
                            if (instance.generalSettings.trackerNotifyInGameConnections && rustplus &&
                                (rustplus.serverId === content.serverId) && content.inGame) {
                                rustplus.sendTeamMessageAsync(str);
                            }
                        }

                        player.status = true;
                        player.time = onlinePlayer.time;
                        player.playerId = onlinePlayer.id;
                    }
                    else {
                        if (player.status === true) {
                            changed = true;
                            const str = client.intlGet(guild.id, 'playerJustDisconnectedTracker', {
                                name: player.name,
                                tracker: content.name
                            });
                            await DiscordMessages.sendActivityNotificationMessage(
                                guild.id, content.serverId, Constants.COLOR_INACTIVE, str, null);
                            if (instance.generalSettings.trackerNotifyInGameConnections && rustplus &&
                                (rustplus.serverId === content.serverId) && content.inGame) {
                                rustplus.sendTeamMessageAsync(str);
                            }
                        }
                        if (!forceSearch) {
                            player.status = false;
                            continue
                        }

                        let playerName = null;
                        if (!Object.keys(calledSteamIdNames).includes(player.steamId)) {
                            playerName = await Scrape.scrapeSteamProfileName(client, player.steamId);
                            if (!playerName) continue;
                            calledSteamIdNames[player.steamId] = playerName;
                        }
                        else {
                            playerName = calledSteamIdNames[player.steamId];
                        }

                        if (player.name !== playerName && player.name !== '-') {
                            changed = true;
                            if (content.nameChangeHistory.length === 10) {
                                content.nameChangeHistory.pop();
                            }
                            content.nameChangeHistory.unshift(`${player.name} → ${playerName} (${player.steamId}).`);
                        }

                        onlinePlayer = onlinePlayers.find(e => e.name === playerName);
                        if (onlinePlayer) {
                            player.status = true;
                            player.time = onlinePlayer.time;
                            player.playerId = onlinePlayer.id;
                            player.name = onlinePlayer.name;
                        }
                        else {
                            player.status = false;
                            player.name = playerName;
                        }
                    }
                }
                client.setInstance(guild.id, instance);
                instance = client.getInstance(guild.id);

                let allOffline = true;
                for (const player of instance.trackers[trackerId].players) {
                    if (player.status) {
                        allOffline = false;
                    }
                }

                if (!instance.trackers[trackerId].allOffline && allOffline) {
                    if (instance.generalSettings.trackerNotifyAllOffline) {
                        await DiscordMessages.sendTrackerAllOfflineMessage(guild.id, trackerId);

                        if (rustplus && (rustplus.serverId === instance.trackers[trackerId].serverId) &&
                            instance.trackers[trackerId].inGame) {
                            const text = client.intlGet(guild.id, 'allJustOfflineTracker', {
                                tracker: instance.trackers[trackerId].name
                            });
                            rustplus.sendTeamMessageAsync(text);
                        }
                    }
                }
                else if (instance.trackers[trackerId].allOffline && !allOffline) {
                    if (instance.generalSettings.trackerNotifyAnyOnline) {
                        await DiscordMessages.sendTrackerAnyOnlineMessage(guild.id, trackerId);

                        if (rustplus && (rustplus.serverId === instance.trackers[trackerId].serverId) &&
                            instance.trackers[trackerId].inGame) {
                            const text = client.intlGet(guild.id, 'anyJustOnlineTracker', {
                                tracker: instance.trackers[trackerId].name
                            });
                            rustplus.sendTeamMessageAsync(text);
                        }
                    }
                }

                instance.trackers[trackerId].allOffline = allOffline;
                client.setInstance(guild.id, instance);
                if (changed) await DiscordMessages.sendTrackerMessage(guild.id, trackerId);
            }
        }

        /* Update onlinePlayers Object */
        let battlemetricsOnlinePlayers = new Object();
        for (const [key, value] of Object.entries(calledPages)) {
            let onlinePlayers = await BattlemetricsAPI.getBattlemetricsServerOnlinePlayers(client, key, value);
            if (onlinePlayers === null) continue;
            battlemetricsOnlinePlayers[key] = onlinePlayers;
        }
        client.battlemetricsOnlinePlayers = JSON.parse(JSON.stringify(battlemetricsOnlinePlayers));

        if (client.battlemetricsIntervalCounter === 29) {
            client.battlemetricsIntervalCounter = 0;
        }
        else {
            client.battlemetricsIntervalCounter += 1;
        }
    }
}

function getActiveServerId(serverList) {
    for (const [key, value] of Object.entries(serverList)) {
        if (value.active) {
            return key;
        }
    }
    return null;
}