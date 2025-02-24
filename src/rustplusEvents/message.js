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

const CommandHandler = require('../handlers/inGameCommandHandler.js');
const DiscordMessages = require('../discordTools/discordMessages.js');
const SmartSwitchGroupHandler = require('../handlers/smartSwitchGroupHandler.js');
const TeamChatHandler = require("../handlers/teamChatHandler.js");
const TeamHandler = require('../handlers/teamHandler.js');

module.exports = {
    name: "message",
    	async execute(rustplus, client, message) {
    		if (!rustplus.isServerAvailable()) return rustplus.deleteThisServer();

    		if (!rustplus.isOperational) return;

    		if (message.hasOwnProperty("response")) {
    			messageResponse(rustplus, client, message);
    		} else if (message.hasOwnProperty("broadcast")) {
    			messageBroadcast(rustplus, client, message);
    		}
    	},
};

async function messageResponse(rustplus, client, message) {
    /* Not implemented */
}

async function messageBroadcast(rustplus, client, message) {
    if (message.broadcast.hasOwnProperty('teamChanged')) {
        messageBroadcastTeamChanged(rustplus, client, message);
    }
    else if (message.broadcast.hasOwnProperty('teamMessage')) {
        messageBroadcastTeamMessage(rustplus, client, message);
    }
    else if (message.broadcast.hasOwnProperty('entityChanged')) {
        messageBroadcastEntityChanged(rustplus, client, message);
    }
    else if (message.broadcast.hasOwnProperty('cameraRays')) {
        messageBroadcastCameraRays(rustplus, client, message);
    }
}

async function messageBroadcastTeamChanged(rustplus, client, message) {
    TeamHandler.handler(rustplus, client, message.broadcast.teamChanged.teamInfo);
    const changed = rustplus.team.isLeaderSteamIdChanged(message.broadcast.teamChanged.teamInfo);
    rustplus.team.updateTeam(message.broadcast.teamChanged.teamInfo);
    if (changed) rustplus.updateLeaderRustPlusLiteInstance();
}

async function messageBroadcastTeamMessage(rustplus, client, message) {
    const instance = client.getInstance(rustplus.guildId);

    message.broadcast.teamMessage.message.message =
        message.broadcast.teamMessage.message.message.replace(/^<color.+?<\/color>/g, '');

    const startsWithTrademark = message.broadcast.teamMessage.message.message
        .startsWith(instance.generalSettings.trademark);

    const isCommand = await CommandHandler.inGameCommandHandler(rustplus, client, message);

    if (!isCommand && !startsWithTrademark) {
        TeamChatHandler(rustplus, client, message.broadcast.teamMessage.message);
    }
}

async function messageBroadcastEntityChanged(rustplus, client, message) {
const instance = client.getInstance(rustplus.guildId);
	const entityId = message.broadcast.entityChanged.entityId;

	if (
		instance.serverList[rustplus.serverId].switches.hasOwnProperty(entityId)
	) {
		messageBroadcastEntityChangedSmartSwitch(rustplus, client, message);
	} else if (
		instance.serverList[rustplus.serverId].alarms.hasOwnProperty(entityId)
	) {
		messageBroadcastEntityChangedSmartAlarm(rustplus, client, message);
	} else if (
		instance.serverList[rustplus.serverId].storageMonitors.hasOwnProperty(
			entityId
		)
	) {
		messageBroadcastEntityChangedStorageMonitor(rustplus, client, message);
	}
}

async function messageBroadcastCameraRays(rustplus, client, message) {
    if (!rustplus.readyForCameraRays) return;
    	rustplus.readyForCameraRays = false;
    	await rustplus.unsubscribeFromCameraAsync();
    	rustplus.scannedCameras += 1;

    	for (const entity of message.broadcast.cameraRays.entities) {
    		if (entity.type === 2) {
    			rustplus.cameraPlayerNames.push(`${entity.name}`); // Include the current camera name with the player name
    			rustplus.cameraNames.push(rustplus.currentCameraName);
    		}
    	}

    	if (rustplus.queuedCameras.length === 0) {
    		rustplus.cameraPlayerNames = [...new Set(rustplus.cameraPlayerNames)];
    		rustplus.cameraNames = [...new Set(rustplus.cameraNames)];

    		let str =
    			`${client.intlGet(rustplus.guildId, "scannedCameras", {
    				num: rustplus.scannedCameras,
    			})}, ` +
    			`${client.intlGet(
    				rustplus.guildId,
    				"players"
    			)}: ${rustplus.cameraPlayerNames.join(", ")} ` +
    			`${client.intlGet(rustplus.guildId, "cams")}: ${rustplus.cameraNames.join(
    				", "
    			)}`;
    		if (!rustplus.isCamCommandInGame) {
    			await DiscordMessages.sendDiscordCommandResponseMessage(
    				rustplus,
    				client,
    				rustplus.camCommandMessage,
    				str
    			);
    			rustplus.camCommandMessage = null;
    		} else {
    			rustplus.sendTeamMessageAsync(str);
    		}
    		rustplus.cameraPlayerNames = [];
    		rustplus.scannedCameras = 0;
    		rustplus.cameraNames = [];
    	} else {
    		rustplus.readyForCameraRays = true;
    		// Before subscribing to the next camera, store its name in rustplus object
    		const camera = rustplus.queuedCameras[0];
    		rustplus.currentCameraName = camera; // Store the camera name
    		rustplus.queuedCameras.shift();

    		const response = await rustplus.subscribeToCameraAsync(camera);
    		if (response.hasOwnProperty("error") && response.error === "no_player") {
    			rustplus.readyForCameraRays = false;
    			rustplus.queuedCameras = [];
    			rustplus.scannedCameras = 0;

    			let str = `${client.intlGet(rustplus.guildId, "commandUnavailable")}`;
    			if (!rustplus.isCamCommandInGame) {
    				await DiscordMessages.sendDiscordCommandResponseMessge(
    					rustplus,
    					client,
    					rustplus.camCommandMessage,
    					str
    				);
    				rustplus.camCommandMessage = null;
    			} else {
    				rustplus.sendTeamMessageAsync(str);
    			}
    		} else if (!(await rustplus.isResponseValid(response))) {
    			rustplus.readyForCameraRays = false;
    			rustplus.queuedCameras = [];
    			rustplus.scannedCameras = 0;

    			let str = `${client.intlGet(rustplus.guildId, "couldNotFindCamera", {
    				camera: camera,
    			})}`;
    			if (!rustplus.isCamCommandInGame) {
    				await DiscordMessages.sendDiscordCommandResponseMessge(
    					rustplus,
    					client,
    					rustplus.camCommandMessage,
    					str
    				);
    				rustplus.camCommandMessage = null;
    			} else {
    				rustplus.sendTeamMessageAsync(str);
    			}
    		}
    	}
}

async function messageBroadcastEntityChangedSmartSwitch(
	rustplus,
	client,
	message
) {
	const instance = client.getInstance(rustplus.guildId);
	const serverId = rustplus.serverId;
	const entityId = message.broadcast.entityChanged.entityId;
	const server = instance.serverList[serverId];

	if (!server || (server && !server.switches[entityId])) return;

	if (rustplus.interactionSwitches.includes(`${entityId}`)) {
		rustplus.interactionSwitches = rustplus.interactionSwitches.filter(
			(e) => e !== `${entityId}`
		);
		return;
	}

	if (rustplus.currentSwitchTimeouts.hasOwnProperty(entityId)) {
		clearTimeout(rustplus.currentSwitchTimeouts[entityId]);
		delete rustplus.currentSwitchTimeouts[entityId];
	}

	const active = message.broadcast.entityChanged.payload.value;
	server.switches[entityId].active = active;
	client.setInstance(rustplus.guildId, instance);

	DiscordMessages.sendSmartSwitchMessage(rustplus.guildId, serverId, entityId);
	SmartSwitchGroupHandler.updateSwitchGroupIfContainSwitch(
		client,
		rustplus.guildId,
		serverId,
		entityId
	);
}

async function messageBroadcastEntityChangedSmartAlarm(
	rustplus,
	client,
	message
) {
	const instance = client.getInstance(rustplus.guildId);
	const serverId = rustplus.serverId;
	const entityId = message.broadcast.entityChanged.entityId;
	const server = instance.serverList[serverId];

	if (!server || (server && !server.alarms[entityId])) return;

	const active = message.broadcast.entityChanged.payload.value;
	server.alarms[entityId].active = active;
	server.alarms[entityId].reachable = true;
	client.setInstance(rustplus.guildId, instance);

	if (active) {
		await DiscordMessages.sendSmartAlarmTriggerMessage(
			rustplus.guildId,
			serverId,
			entityId
		);

		if (instance.generalSettings.smartAlarmNotifyInGame) {
			rustplus.sendTeamMessageAsync(
				`${server.alarms[entityId].name}: ${server.alarms[entityId].message}`
			);
		}
	}

	DiscordMessages.sendSmartAlarmMessage(
		rustplus.guildId,
		rustplus.serverId,
		entityId
	);
}

async function messageBroadcastEntityChangedStorageMonitor(
	rustplus,
	client,
	message
) {
	const instance = client.getInstance(rustplus.guildId);
	const serverId = rustplus.serverId;
	const entityId = message.broadcast.entityChanged.entityId;
	const server = instance.serverList[serverId];

	if (!server || (server && !server.storageMonitors[entityId])) return;

	if (message.broadcast.entityChanged.payload.value === true) return;

	if (
		server.storageMonitors[entityId].type === "toolCupboard" ||
		message.broadcast.entityChanged.payload.capacity === 28
	) {
		setTimeout(updateToolCupboard.bind(null, rustplus, client, message), 2000);
	} else {
		rustplus.storageMonitors[entityId] = {
			items: message.broadcast.entityChanged.payload.items,
			expiry: message.broadcast.entityChanged.payload.protectionExpiry,
			capacity: message.broadcast.entityChanged.payload.capacity,
			hasProtection: message.broadcast.entityChanged.payload.hasProtection,
		};

		const info = await rustplus.getEntityInfoAsync(entityId);
		server.storageMonitors[entityId].reachable =
			(await rustplus.isResponseValid(info)) ? true : false;

		if (server.storageMonitors[entityId].reachable) {
			if (info.entityInfo.payload.capacity === 30) {
				server.storageMonitors[entityId].type = "vendingMachine";
			} else if (info.entityInfo.payload.capacity === 48) {
				server.storageMonitors[entityId].type = "container";
			}
		}
		client.setInstance(rustplus.guildId, instance);

		await DiscordMessages.sendStorageMonitorMessage(
			rustplus.guildId,
			serverId,
			entityId
		);
	}
}

async function updateToolCupboard(rustplus, client, message) {
	const instance = client.getInstance(rustplus.guildId);
	const server = instance.serverList[rustplus.serverId];
	const entityId = message.broadcast.entityChanged.entityId;

	const info = await rustplus.getEntityInfoAsync(entityId);
	server.storageMonitors[entityId].reachable = (await rustplus.isResponseValid(
		info
	))
		? true
		: false;
	client.setInstance(rustplus.guildId, instance);

	if (server.storageMonitors[entityId].reachable) {
		rustplus.storageMonitors[entityId] = {
			items: info.entityInfo.payload.items,
			expiry: info.entityInfo.payload.protectionExpiry,
			capacity: info.entityInfo.payload.capacity,
			hasProtection: info.entityInfo.payload.hasProtection,
		};

		server.storageMonitors[entityId].type = "toolCupboard";

		if (
			info.entityInfo.payload.protectionExpiry === 0 &&
			server.storageMonitors[entityId].decaying === false
		) {
			server.storageMonitors[entityId].decaying = true;

			await DiscordMessages.sendDecayingNotificationMessage(
				rustplus.guildId,
				rustplus.serverId,
				entityId
			);

			if (server.storageMonitors[entityId].inGame) {
				rustplus.sendTeamMessageAsync(
					client.intlGet(rustplus.guildId, "isDecaying", {
						device: server.storageMonitors[entityId].name,
					})
				);
			}
		} else if (info.entityInfo.payload.protectionExpiry !== 0) {
			server.storageMonitors[entityId].decaying = false;
		}
		client.setInstance(rustplus.guildId, instance);
	}

	await DiscordMessages.sendStorageMonitorMessage(
		rustplus.guildId,
		rustplus.serverId,
		entityId
	);
}