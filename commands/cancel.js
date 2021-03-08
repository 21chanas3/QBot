const Discord = require("discord.js");

module.exports.run = async (bot,message,args,con) => {
    let targetUser = message.guild.member(message.mentions.users.first);
    let cancelNumber;

    let cancelRoleID;
    con.query(`SELECT * FROM data WHERE id = ${targetUser.id}`, (err,rows) => {
        if(rows == null) {
            cancelNumber = 0
            try {
                guild.roles.create({
                    data:{
                    name:"Cancel Count: 1",
                    color:"grey",
                },
                reason:"Cancelled",
            }).then((role) => targetUser.roles.add(role)).catch(console.error);
            } catch (error) {
                console.log(error);
            }
            con.query(`UPDATE data SET cancel = 1 WHERE id = ${targetUser.id}`)
        } else {
            if(!args[1]) {
            cancelNumber = rows[0].cancel;
            cancelNumber++
            } else {
                cancelNumber = args[1]
            }
            cancelRoleID = rows[0].cancelRole;
            let cancelRole = targetUser.roles.cache.find(role => role.id == cancelRoleID)
            cancelRole.setName(`Cancelled: ${cancelNumber}`)
            con.query(`UPDATE data SET cancel = ${cancelNumber} WHERE id = ${targetUser.id}`)
        }
    });

}   
module.exports.help = {
    name: "cancel"
}   