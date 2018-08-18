const Discord = require("discord.js");

module.exports.run = async (bot, message, args, con) => {
    let executor = message.author;
    let staffRole = message.guild.roles.find("name", "Staff");
    let staffNotificationChannel = bot.channels.find("name", "requests");
    message.delete();
    switch (args[0]) {
        case `create`:
            con.query("SELECT * FROM tickets", (err, rows) => {
                if (err) throw err;
                let ticketId = rows.length + 1;
                let staffRequestNotificationEmbed = new Discord.RichEmbed()
                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                    .setColor(`ffa500`)
                    .setDescription(`is requesting a support ticket!\n**ID**: ${ticketId}`);
                setTimeout(function () {
                    staffNotificationChannel.send(staffRequestNotificationEmbed);
                }, 7000);
                let userNotificationEmbed = new Discord.RichEmbed()
                    .setAuthor(`Request Recieved!`)
                    .setDescription(`Your request has been sent to staff and will be accepted shortly\n**ID**: ${ticketId}`)
                    .setColor("00ff00");
                message.channel.send(userNotificationEmbed).then((sentEmbed) => {
                    sentEmbed.delete(7000);
                });
                con.query(`INSERT INTO tickets VALUES (${ticketId}, ${executor.id}, 1, null, null)`);
            });
            break;
        case `delete`:
            if (args[1]) {
                let id = args[1]
                con.query(`SELECT * FROM tickets WHERE id = ${id}`, (err, rows) => {
                    if (err) throw (err);
                    if (rows[0]) {
                        if (rows[0].state == 1) {
                            if (rows[0].userID == executor.id || message.member.roles.has(staffRole.id)) {
                                con.query(`UPDATE tickets SET state = 4 WHERE id = ${id}`)
                                let deletedEmbed = new Discord.RichEmbed()
                                    .setAuthor(`Request deleted!`)
                                    .setColor(`00ff00`)
                                    .setDescription(`Request (ID: ${id}) has been deleted!`)
                                message.channel.send(deletedEmbed).then((sentEmbed) => {
                                    sentEmbed.delete(2500);
                                });
                                if (rows[0].userID == executor.id) {
                                    let requestDeletedEmbed = new Discord.RichEmbed()
                                        .setAuthor(`${executor.tag}`, executor.avatarURL)
                                        .setColor(`ff0000`)
                                        .setDescription(`has deleted their support ticket\n**ID**: ${id}`);
                                    staffNotificationChannel.send(requestDeletedEmbed);
                                } else if (message.member.roles.has(staffRole.id)) {
                                    let requestDeletedEmbed = new Discord.RichEmbed()
                                        .setAuthor(`${executor.tag}`, executor.avatarURL)
                                        .setColor(`ff0000`)
                                        .setDescription(`has deleted ${(bot.users.get(rows[0].userID).tag)} support ticket\n**ID**: ${id}`);
                                    staffNotificationChannel.send(requestDeletedEmbed);
                                }
                            } else {
                                let invalidIDEmbed = new Discord.RichEmbed()
                                    .setAuthor("Invalid ID")
                                    .setDescription("This ticket does not belong to you.\nTo view all of **your** tickets, use !ticket list")
                                    .setColor("ff0000");
                                message.channel.send(invalidIDEmbed).then((sentmessage) => {
                                    sentmessage.delete(3000);
                                });
                            }
                        } else {
                            let nothingEmbed = new Discord.RichEmbed()
                                .setAuthor("Operation not avalible")
                                .setDescription("This ticket cannot be deleted. Possible reasons include:\n• This ticket has been accepted\n• This ticket has already been solved\n• This ticket is already deleted")
                                .setColor("ff0000");
                            message.channel.send(nothingEmbed).then((sentmessage) => {
                                sentmessage.delete(10000);
                            });
                        }
                    } else {
                        let noIDEmbed = new Discord.RichEmbed()
                            .setAuthor("Ticket does not exist!")
                            .setDescription("This ticket does not exist. To view all of **your** tickets, use !ticket list")
                            .setColor("ff0000");
                        message.channel.send(nothingEmbed).then((sentmessage) => {
                            sentmessage.delete(3000);
                        });
                    }
                });
            } else {
                let noIDToldEmbed = new Discord.RichEmbed()
                    .setAuthor("No ID specified")
                    .setDescription("You did not specify an ID!\n**Usage**: !ticket delete (id)")
                    .setColor("ff0000");
                message.channel.send(nothingEmbed).then((sentmessage) => {
                    sentmessage.delete(3000);
                });
            }
            break;
        case `accept`:
            if (!message.member.roles.has(staffRole.id)) {
                let noPermEmbed = new Discord.RichEmbed()
                    .setAuthor("You cannot do that!")
                    .setDescription("You do not have permission to do that!")
                    .setColor("ff0000");
                message.channel.send(noPermEmbed).then((sentmessage) => {
                    sentmessage.delete(3000);
                });
                break;
            } else {
                if (!args[1]) {
                    let noIdEmbed = new Discord.RichEmbed()
                        .setAuthor("No ID specified!")
                        .setDescription("You need to specify an id!\n**!ticket accept 1**")
                        .setColor("ff0000");
                    message.channel.send(noIdEmbed).then((sentmessage) => {
                        sentmessage.delete(3000);
                    });
                    break;
                } else {
                    let id = args[1]
                    con.query(`SELECT * FROM tickets WHERE id = ${id}`, (err, rows) => {
                        if (err) throw (err);
                        if (rows[0]) {
                            if (rows[0].state == 1) {
                                let ogexecutor = bot.users.get(rows[0].userID);
                                let channel; //create a variable called channel
                                message.guild.createChannel(`support-${id}`, 'text').then(
                                    (chan) => {
                                        chan.setParent("478527445918679040").then(
                                            (chan2) => {
                                                chan2.overwritePermissions(message.guild.roles.find('name', '@everyone'), {
                                                    'VIEW_CHANNEL': false
                                                });
                                                chan2.overwritePermissions(executor, {
                                                    'VIEW_CHANNEL': true,
                                                    'SEND_MESSAGES': true,
                                                    'ATTACH_FILES': true,
                                                    'EMBED_LINKS': true
                                                });
                                                chan2.overwritePermissions(ogexecutor, {
                                                    'VIEW_CHANNEL': true,
                                                    'SEND_MESSAGES': true,
                                                    'ATTACH_FILES': true,
                                                    'EMBED_LINKS': true
                                                });
                                                setTimeout(function () {
                                                    chan2.send(`Your support ticket has been accepted, ${ogexecutor}`);
                                                }, 500);
                                                con.query(`UPDATE tickets SET state = 2, staff = ${message.author.id}, channel = ${chan2.id} WHERE id = ${id}`) //set the ticket to state 2 in the database
                                            });
                                    });
                                let acceptNotificationEmbed = new Discord.RichEmbed()
                                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                                    .setDescription(`has accepted ${ogexecutor.tag}'s support ticket`)
                                    .setColor(`00ff00`);
                                staffNotificationChannel.send(acceptNotificationEmbed);
                            } else {
                                let notAvaliableEmbed = new Discord.RichEmbed()
                                    .setAuthor("Not avaliable")
                                    .setDescription("This ticket is not avaliable, please view open tickets using !ticket list")
                                    .setColor("ff0000");
                                message.channel.send(notAvaliableEmbed).then((sentmessage) => {
                                    sentmessage.delete(3000);
                                });
                            }
                        } else {
                            let noSuchIdEmbed = new Discord.RichEmbed()
                                .setAuthor("Invalid ID!")
                                .setDescription("This ID does not exist, view open tickets using !ticket list")
                                .setColor("ff0000");
                            message.channel.send(noSuchIdEmbed).then((sentmessage) => {
                                sentmessage.delete(3000);
                            });
                        }
                    });
                }
            }
            break;
        case `close`:
            let channelid = message.channel.id;
            if (!message.member.roles.has(staffRole.id)) {
                let noPermEmbed = new Discord.RichEmbed()
                    .setAuthor("You cannot do that!")
                    .setDescription("You cannot close your ticket, please ask the staff member in your channel to close it.")
                    .setColor("ff0000");
                message.channel.send(noPermEmbed).then((sentmessage) => {
                    sentmessage.delete(3000);
                });
                break;
            }
            con.query(`SELECT * FROM tickets WHERE channel = ${channelid}`, (err, rows) => {
                if (!rows[0]) {
                    let cannotCloseEmbed = new Discord.RichEmbed()
                        .setAuthor("This channel cannot be closed")
                        .setColor("ff0000");
                    message.channel.send(cannotCloseEmbed).then((sentmessage) => {
                        sentmessage.delete(1500);
                    });
                } else {
                    message.channel.delete(`Ticket #${rows[0].id} closed`)
                    let ogexecutor = bot.users.get(rows[0].userID);
                    let closedEmbed = new Discord.RichEmbed()
                        .setAuthor(`${executor.tag}`, executor.avatarURL)
                        .setColor(`ff0000`)
                        .setDescription(`Your ticket on the Mutinies Network has been closed by ${executor.tag}.\nIf your problem still persists, please create another ticket.`)
                    ogexecutor.send(closedEmbed);
                    let closeEmbed = new Discord.RichEmbed()
                        .setAuthor(`${executor.tag}`, executor.avatarURL)
                        .setColor(`ffa500`)
                        .setDescription(`has closed the support channel of ${ogexecutor.tag}\n**ID**: ${rows[0].id}`);
                    staffNotificationChannel.send(closeEmbed);
                    con.query(`UPDATE tickets SET state = 3 WHERE id = ${rows[0].id}`)
                }
            });
            break;
        case `mark`:
            let channelid2 = message.channel.id;
            if (!message.member.roles.has(staffRole.id)) {
                let noPermEmbed = new Discord.RichEmbed()
                    .setAuthor("You cannot do that!")
                    .setDescription("You do not have permission to do that!")
                    .setColor("ff0000");
                message.channel.send(noPermEmbed).then((sentmessage) => {
                    sentmessage.delete(3000);
                });
                break;
            }
            con.query(`SELECT * FROM tickets WHERE channel = ${channelid2}`, (err, rows) => {
                let ogexecutor = bot.users.get(rows[0].userID);
                if (!rows[0]) {
                    let cannotMarkEmbed = new Discord.RichEmbed()
                        .setAuthor("You cannot mark this channel")
                        .setColor("ff0000");
                    message.channel.send(cannotMarkEmbed).then((sentmessage) => {
                        sentmessage.delete(1500);
                    });
                } else {
                    message.channel.delete(`Ticket #${rows[0].id} marked as spam`)
                    let closeEmbed = new Discord.RichEmbed()
                        .setAuthor(`${executor.tag}`, executor.avatarURL)
                        .setColor(`ff0000`)
                        .setDescription(`has marked the support channel of ${ogexecutor.tag} as spam\n**ID**: ${rows[0].id}`);
                    staffNotificationChannel.send(closeEmbed);
                    con.query(`UPDATE tickets SET state = 5 WHERE id = ${rows[0].id}`)
                }
            });
            break;
        case `list`:
            if (message.member.roles.has(staffRole.id)) {
                con.query(`SELECT * FROM tickets WHERE state = '1' AND userID = ${executor.id}`, (err, rows) => {
                    if (err) throw (err);
                    if (!rows[0]) {
                        let nothingEmbed = new Discord.RichEmbed()
                            .setAuthor("No Tickets!")
                            .setDescription("You have no open tickets")
                            .setColor("ff0000");
                        message.channel.send(nothingEmbed).then((sentmessage) => {
                            sentmessage.delete(3000);
                        });
                    } else {
                        rowsNum = rows.length;
                        for (i = 0; i < rowsNum; i++) {
                            if (i == 0) {
                                Users = bot.users.get(rows[i].userID).tag + '\n'
                                IDs = rows[i].id + '\n';
                            } else {
                                Users += bot.users.get(rows[i].userID).tag + '\n';
                                IDs += rows[i].id + '\n';
                            }
                        }
                        let listEmbed = new Discord.RichEmbed()
                            .setAuthor("Currently Open Tickets")
                            .addField("User", Users, true)
                            .addField("IDs", IDs, true);
                        message.channel.send(listEmbed).then((sentmessage) => {
                            sentmessage.delete(10000);
                        });
                    }
                });
                break;
            } else {
                let rowsNum;
                let Users;
                let IDs;
                con.query("SELECT * FROM tickets WHERE state = '1'", (err, rows) => {
                    if (err) throw (err);
                    if (!rows[0]) {
                        let nothingEmbed = new Discord.RichEmbed()
                            .setAuthor("No Tickets!")
                            .setDescription("No currently open tickets")
                            .setColor("ff0000");
                        message.channel.send(nothingEmbed).then((sentmessage) => {
                            sentmessage.delete(3000);
                        });
                    } else {
                        rowsNum = rows.length;
                        for (i = 0; i < rowsNum; i++) {
                            if (i == 0) {
                                Users = bot.users.get(rows[i].userID).tag + '\n'
                                IDs = rows[i].id + '\n';
                            } else {
                                Users += bot.users.get(rows[i].userID).tag + '\n';
                                IDs += rows[i].id + '\n';
                            }
                        }
                        let listEmbed = new Discord.RichEmbed()
                            .setAuthor("Currently Open Tickets")
                            .addField("User", Users, true)
                            .addField("IDs", IDs, true);
                        message.channel.send(listEmbed).then((sentmessage) => {
                            sentmessage.delete(10000);
                        });
                    }
                });
                break;
            }
        case `invite`:
            if (!args[1]) {
                let noPersonSpecifiedEmbed = new Discord.RichEmbed()
                    .setAuthor(`You did not specify a person!`)
                    .setColor(`ff0000`)
                    .setDescription(`Specify a person by mentioning them using their @DiscordTag#0000`);
                message.channel.send(noPersonSpecifiedEmbed).then((sentMessage) => {
                    sentMessage.delete(3000);
                })
                break;
            }
            let invited = message.guild.member(message.mentions.users.first());
            if (!invited) {
                let specifiedPersonCannotBeFoundEmbed = new Discord.RichEmbed()
                    .setAuthor(`The specified person could not be found!`)
                    .setColor(`ff0000`)
                    .setDescription(`The specified person must be in the Discord for the invite to work`);
                message.channel.send(noPersonSpecifiedEmbed).then((sentMessage) => {
                    sentMessage.delete(3000);
                })
                break;
            }
            let inviteCode = Math.floor(Math.random() * 1000000)
            let ticketId = message.channel.name.split("-").splice(1, 1);
            let inviteEmbed = new Discord.RichEmbed()
                .setAuthor(`${executor.tag}`, executor.avatarURL)
                .setDescription(`is inviting you to ${message.channel.name}\nTo join type **!join ${inviteCode}** in the server`)
                .setColor(`00ff00`);
            con.query(`INSERT INTO invite VALUES (${invited.id}, ${ticketId}, ${inviteCode}, '0', ${executor.id},${message.channel.id})`);
            let invitedEmbed = new Discord.RichEmbed()
                .setAuthor(`${executor.tag}`, executor.avatarURL)
                .setColor(`ffff00`)
                .setDescription(`has invited ${invited} to the channel`);
            invited.send(inviteEmbed);
            message.channel.send(invitedEmbed);
            break;
        case `escalate`:
            if (!args[1]) {
                let targetNotSpecifiedEmbed = new Discord.RichEmbed()
                    .setAuthor(`Target not Specified!`)
                    .setColor(`ff0000`)
                    .setDescription(`Please mention a person or a role to escalate this ticket to!`)
                message.channel.send(targetNotSpecifiedEmbed).then((sentMessage) => {
                    sentMessage.delete(3000);
                });
                break;
            }
            let escalatedRole = message.guild.roles.get((message.mentions.roles.first().id));
            console.log(escalatedRole.id);
            let escalatedUser = message.guild.member(message.mentions.users.first());
            console.log(escalatedUser);
            if (escalatedRole) {
                let inviteCode = Math.floor(Math.random() * 1000000)
                let ticketId = message.channel.name.split("-").splice(1, 1);
                let inviteEmbed = new Discord.RichEmbed()
                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                    .setDescription(`is escalating Ticket #${ticketId} to a/an ${escalatedRole}\n To join, type **!join ${inviteCode}** in the chat.`)
                    .setColor(`00ff00`);
                con.query(`INSERT INTO invite VALUES (${escalatedRole.id}, ${ticketId}, ${inviteCode}, '0', ${executor.id},${message.channel.id})`);
                let invitedEmbed = new Discord.RichEmbed()
                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                    .setColor(`ffff00`)
                    .setDescription(`has invited a/an ${escalatedRole} to the channel`);
                staffNotificationChannel.send(`${escalatedRole}`)
                staffNotificationChannel.send(inviteEmbed);
                message.channel.send(invitedEmbed);
                break;
            }
            if (escalatedUser) {
                let inviteCode = Math.floor(Math.random() * 1000000)
                let ticketId = message.channel.name.split("-").splice(1, 1);
                let inviteEmbed = new Discord.RichEmbed()
                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                    .setDescription(`is escalating Ticket #${ticketId} to ${escalatedUser}\n To join, type **!join ${inviteCode}** in the chat.`)
                    .setColor(`00ff00`);
                con.query(`INSERT INTO invite VALUES (${escalatedUser.id}, ${ticketId}, ${inviteCode}, '0', ${executor.id},${message.channel.id})`);
                let invitedEmbed = new Discord.RichEmbed()
                    .setAuthor(`${executor.tag}`, executor.avatarURL)
                    .setColor(`ffff00`)
                    .setDescription(`has invited ${escalatedUser} (${escalatedUser.hoistRole}) to the channel`);
                staffNotificationChannel.send(`${escalatedUser}`)
                staffNotificationChannel.send(inviteEmbed);
                message.channel.send(invitedEmbed);
                break;
            }
        default:
            let invalidSubcommandEmbed = new Discord.RichEmbed()
                .setAuthor(`Invalid Sub-Command!`)
                .setColor(`ff0000`)
                .setDescription(`Type !help for a list of avaliable sub-commands!`);
            message.channel.send(invalidSubcommandEmbed).then((sentEmbed) => {
                sentEmbed.delete(3000);
            });
    }
}
module.exports.help = {
    name: "ticket"
}