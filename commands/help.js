const Discord = require("discord.js");

module.exports.run = async (bot,message,args) => {
    let staffRole = message.guild.roles.find("name", "Staff")
    let discover = message.author
    if(message.member.roles.has(staffRole.id)) {
        let helpMsg = new Discord.RichEmbed()
        .setAuthor("Command for Support Bot")
        .setDescription(`**!ticket create**: Creates a ticket\n**!ticket delete [id]**: Deletes any ticket\n**!ticket list**: Lists all tickets currently open\n**!ticket close**: Closes the ticket and marks it as complete\n**!ticket mark**: Closes the ticket and marks it as spam\n**!ticket invite ${bot.user}**: Invites ${bot.user} to the support channel\n**!ticket escalate @User/Role**: Escalates the ticket to the target user or a person with the target role`)
    discover.send(helpMsg);
    message.delete();
    } else {
    let helpMsg = new Discord.RichEmbed()
        .setAuthor("Command for Support Bot")
        .setDescription(`**!ticket create**: Creates a ticket\n**!ticket delete [id]**: Deletes a ticket you own\n**!ticket list**: Lists all your tickets`)
    discover.send(helpMsg);
    message.delete();
    }
}   
module.exports.help = {
    name: "help"
}