const Discord = require("discord.js");
const fs = module.require("fs");

module.exports.run = async (bot, message, args, con) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error!`)
            .setDescription(`You do not have the permissions to do this!`)
            .setColor(`#ff0000`);
        message.delete();
        message.channel.send(errMsg)

        return;
    }
    if (!message.guild.member(message.mentions.users.first())) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor('Error!')
            .setDescription(`You did not specify anyone to mute!`)
            .addField(`Example`, `!mute @Qubit`)
            .setColor(`#ff0000`);
        message.delete();
        message.channel.send(errMsg)

        return;
    }
    let toMute = message.guild.member(message.mentions.users.first());
    if (toMute.id === message.author.id) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error!`)
            .setDescription(`You cannot mute yourself!`)
            .setColor(`#ff0000`);
        message.delete();
        message.channel.send(errMsg)
        
        return;
    }
    if (toMute.highestRole.position >= message.member.highestRole.position) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error!`)
            .setDescription(`You cannot mute someone with a higher position than you!`)
            .setColor(`#ff0000`)
        message.delete();
        message.channel.send(errMsg)

        return;
    }
    let muteRole = message.guild.roles.find(r => r.name === "Muted");
    if (!muteRole) {
        try {
            muteRole = await message.guild.createRole({
                name: "Muted",
                color: "#000000",
                permissions: []
            });
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muteRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        } catch (e) {
            console.log(e.stack);
        }
    }
    if (toMute.roles.has(role.id)) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error`)
            .setDescription(`This person is already muted!`)
            .addField(`Did you mean?`, `!unmute ${toMute}`)
            .setColor(`#ff0000`);
        message.delete();
        message.channel.send(errMsg);

        return;
    }
    let successMsg = new Discord.RichEmbed()
        .setAuthor(`Success!`)
        .setDescription(`:mute: You have successfully muted ${toMute}`)
        .addField(`Time`, `Forever`)
        .setColor(`#00ff00`);
    await toMute.addRole(role);
    message.channel.send(successMsg);
}
module.exports.help = {
    name: "mute"
}