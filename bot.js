const Settings = require("./botSettings.json");
const Discord = require("discord.js");
const fs = require("fs");
const mysql = require("mysql");

const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();
let depstat = 0;

fs.readdir("./commands/", (err, files) => {
    if (err) console.error(err);
    let jsFiles = files.filter(f => f.split(".").pop() === "js");
    if (jsFiles.length <= 0) {
        console.log("No commands loaded!")
        return;
    }

    console.log(`Loading ${jsFiles.length} command(s)!`)
    jsFiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${i + 1} ${f} loaded!`)
        bot.commands.set(props.help.name, props);
    });
});

var initcon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "10202003",
});
initcon.connect(err => {
    if (err) throw err;
});
initcon.query("CREATE DATABASE IF NOT EXISTS bot;")

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "10202003",
    database: "bot"
});
con.connect(err => {
    if (err) throw err;
    console.log("Database connection established")
});
initializeTables();
bot.on("ready", async () => {
    console.log(`Bot is ready! ${bot.user.username}`);
    bot.user.setActivity('mutinies.net', { type: 'PLAYING' })
});
bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return message.channel.send("Commands are only avaliable in servers!");
    if (!message.content.startsWith(Settings.prefix)) return;   
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    let cmd = bot.commands.get(command.slice(Settings.prefix.length))

    if (cmd) cmd.run(bot, message, args, con);
});
bot.login(Settings.token);

function initializeTables(){
    con.query("CREATE TABLE IF NOT EXISTS tickets (id INT, userID VARCHAR(40), state INT, staff VARCHAR(40), channel VARCHAR(40))")
    con.query("CREATE TABLE IF NOT EXISTS invite (userId VARCHAR(40), ticketId INT, code INT, used INT, issuerId VARCHAR(40), channelId VARCHAR(40))")
}