const Discord = require("discord.js");
const fs = module.require("fs");

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error!`)
            .setDescription(`You do not have the permissions to do this!`)
            .setColor(`#ff0000`);
        message.channel.send(errMsg);
        return;
    }
    let toMute = message.guild.member(message.mentions.users.first());
    if (!toMute) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor('Error!')
            .setDescription(`You did not specify anyone to unmute!`)
            .addField(`Example`, `!unmute @Qubit`)
            .setColor(`#ff0000`);
        message.channel.send(errMsg);
        return;
    }
    let role = message.guild.roles.find(r => r.name === "Muted");
    if (!toMute.roles.has(role.id)) {
        let errMsg = new Discord.RichEmbed()
            .setAuthor(`Error`)
            .setDescription(`This person is already unmuted!`)
            .addField(`Did you mean?`, `!mute ${toMute}`)
            .setColor(`#ff0000`);
        message.channel.send(errMsg);
        return;
    }

    let successMsg = new Discord.RichEmbed()
        .setAuthor(`Success!`)
        .setDescription(`:speaker: You have successfully unmuted ${toMute.user.tag}!`)
        .setColor(`#00ff00`);
    await toMute.removeRole(role);
    message.channel.send(successMsg);

}

module.exports.help = {
    name: "unmute"
}