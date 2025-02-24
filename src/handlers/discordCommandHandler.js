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

const DiscordMessages = require('../discordTools/discordMessages.js');

module.exports = {
    discordCommandHandler: async function (rustplus, client, message) {
        const command = message.cleanContent;
        const callerName = message.author.username;
        const commandLowerCase = command.toLowerCase();
        const prefix = rustplus.generalSettings.prefix;
        const guildId = rustplus.guildId;

        let response = null;
        if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxAfk')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxAfk')}`) {
            response = rustplus.getCommandAfk();
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxAlive')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxAlive')}`)) {
            response = rustplus.getCommandAlive(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxBradley')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxBradley')}`) {
            response = rustplus.getCommandBradley();
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxCam')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxCam')} `)) {
            rustplus.isCamCommandInGame = false;
            rustplus.camCommandMessage = message;
            response = await rustplus.getCommandCam(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxCargo')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxCargo')}`) {
            response = rustplus.getCommandCargo();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxChinook')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxChinook')}`) {
            response = rustplus.getCommandChinook();
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxConnection')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxConnections')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxConnection')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxConnections')}`))) {
            response = rustplus.getCommandConnection(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxCrate')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxCrate')}`) {
            response = rustplus.getCommandCrate();
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDeath')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxDeaths')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDeath')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxDeaths')}`))) {
            response = client.intlGet(rustplus.guildId, 'commandNotPossibleDiscord');
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxHeli')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxHeli')}`) {
            response = rustplus.getCommandHeli();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxLarge')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxLarge')}`) {
            response = rustplus.getCommandLarge();
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxLeader')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxLeader')}`)) {
            response = await rustplus.getCommandLeader(command, null);
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxMarker')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxMarkers')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxMarker')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxMarkers')}`)) {
            response = client.intlGet(rustplus.guildId, 'commandNotPossibleDiscord');
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxMarket')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxMarket')} `)) {
            response = rustplus.getCommandMarket(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxMute')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxMute')}`) {
            response = rustplus.getCommandMute();
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxNote')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxNotes')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxNote')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxNotes')}`)) {
            response = rustplus.getCommandNote(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxOffline')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxOffline')}`) {
            response = rustplus.getCommandOffline();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxOnline')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxOnline')}`) {
            response = rustplus.getCommandOnline();
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxPlayer')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxPlayers')}`)) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxPlayer')} `) ||
                commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxPlayers')}`))) {
            response = rustplus.getCommandPlayer(command);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxPop')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxPop')}`) {
            response = rustplus.getCommandPop();
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxProx')}`) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxProx')}`)) {
            response = client.intlGet(rustplus.guildId, 'commandNotPossibleDiscord');
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxSend')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxSend')} `)) {
            response = client.intlGet(rustplus.guildId, 'commandNotPossibleDiscord');
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxSmall')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxSmall')}`) {
            response = rustplus.getCommandSmall();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTime')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTime')}`) {
            response = rustplus.getCommandTime();
        }
        else if ((commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTimer')} `) ||
            commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxTimers')}`) ||
            (commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTimer')} `) ||
                commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxTimers')}`)) {
            response = rustplus.getCommandTimer(command);
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTranslateTo')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTranslateTo')} `)) {
            response = await rustplus.getCommandTranslateTo(command);
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTranslateFromTo')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTranslateFromTo')} `)) {
            response = await rustplus.getCommandTranslateFromTo(command);
        }
        else if (commandLowerCase.startsWith(`${prefix}${client.intlGet('en', 'commandSyntaxTTS')} `) ||
            commandLowerCase.startsWith(`${prefix}${client.intlGet(guildId, 'commandSyntaxTTS')} `)) {
            response = await rustplus.getCommandTTS(command, callerName);
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxUnmute')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxUnmute')}`) {
            response = rustplus.getCommandUnmute();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxUpkeep')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxUpkeep')}`) {
            response = rustplus.getCommandUpkeep();
        }
        else if (commandLowerCase === `${prefix}${client.intlGet('en', 'commandSyntaxWipe')}` ||
            commandLowerCase === `${prefix}${client.intlGet(guildId, 'commandSyntaxWipe')}`) {
            response = rustplus.getCommandWipe();
        }
        else {
            /* Smart Switches/ Group Switches are not currently supported through discord. */
            return false;
        }

        if (response !== null) {
            await DiscordMessages.sendDiscordCommandResponseMessage(rustplus, client, message, response);
        }

        return true;
    },
};