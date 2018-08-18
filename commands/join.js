const Discord = require("discord.js");

module.exports.run = async (bot, message, args, con) => {
    let joiner = message.author;
    let joinerguild = message.guild.members.get(joiner.id)
    message.delete();
    if (!args[0]) {
        let noInviteCodeEmbed = new Discord.RichEmbed()
            .setAuthor(`You must enter an invite code!`)
            .setColor(`ff0000`)
            .setDescription(`Please copy and paste the **bolded** command that was sent to you via DM`)
        message.channel.send(noInviteCodeEmbed).then((sentMessage) => {
            sentMessage.delete(3000);
        })
    }
    let invitecode = args[0]
    con.query(`SELECT * FROM invite WHERE code = ${invitecode}`, (err, rows) => {
        if (err) throw (err);
        if (!rows[0]) {
            let noSuchInviteCodeEmbed = new Discord.RichEmbed()
                .setAuthor(`Invalid Invite Code!`)
                .setColor(`ff0000`)
                .setDescription(`Please copy and paste the **bolded** command that was sent to you via DM`)
            message.channel.send(noSuchInviteCodeEmbed).then((sentMessage) => {
                sentMessage.delete(3000);
            })
            return;
        }
        if (rows[0].used != 0) {
            let usedInviteCodeEmbed = new Discord.RichEmbed()
                .setAuthor(`Invalid Invite Code!`)
                .setColor(`ff0000`)
                .setDescription(`This invite code has expired, please request a new one`)
            message.channel.send(usedInviteCodeEmbed).then((sentMessage) => {
                sentMessage.delete(3000);
            })
            return;
        }
        let supportChannel = bot.channels.get(rows[0].channelId);
        if (!supportChannel) {
            let inviteExpiredEmbed = new Discord.RichEmbed()
                .setAuthor(`Expired Invite Code!`)
                .setColor(`ff0000`)
                .setDescription(`This support ticket has already been resolved`)
            message.channel.send(inviteExpiredEmbed).then((sentMessage) => {
                sentMessage.delete(3000);
            })
            return;
        }
        if (joiner.id || joinerguild.hoistRole.id == rows[0].userId) {
            supportChannel.overwritePermissions(joiner, { 'VIEW_CHANNEL': true, 'SEND_MESSAGES': true, 'ATTACH_FILES': true, 'EMBED_LINKS': true })
        let joinEmbed = new Discord.RichEmbed()
            .setAuthor(`${joiner.tag}`, joiner.avatarURL)
            .setDescription(`has joined the channel`)
            .setColor(`00ff00`);
        supportChannel.send(joinEmbed);
        con.query(`UPDATE invite SET used = 1 WHERE code = ${invitecode}`);
            } else {
                let notIntendedUserEmbed = new Discord.RichEmbed()
                .setAuthor(`This invite is not for you!`)
                .setColor(`ff0000`)
            message.channel.send(notIntendedUserEmbed).then((sentMessage) => {
                sentMessage.delete(3000);
            });
            return;
        }
    })
}
module.exports.help = {
    name: "join"
}