const Discord = require("discord.js");

module.exports.run = async (bot,message,args) => {
    let discover = message.author.tag
    let easterMsg = new Discord.RichEmbed()
        .setAuthor("Easter Egg!")
        .setDescription(`You found an Easter Egg, ${discover}!`)
        .addField(`Title Get`, `Dora the Explorer`)
        .setColor(`#00ff00`);
    message.channel.send(easterMsg);
    message.delete();

}   
module.exports.help = {
    name: "template"
}