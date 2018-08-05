const config = require('./config.json');
const Discord = require('discord.js');
const util = require('util');
const fs = require('fs');
const ping = require('ping');
const clc = require('cli-color');
const request = require('request');
const clear = require('clear');

clear(); // Clears the console so it's easier to read :)

bot_icon = 'https://cdn.discordapp.com/attachments/465542663198736384/465542947434397706/noitfybot.png';
jamies_face = 'https://static-cdn.jtvnw.net/jtv_user_pictures/b707d55e-f379-495a-a6f2-39250a69d11d-profile_image-300x300.jpg';

const bot = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
});

// debugging mode, true or false.
const debug = true;

// Hex Color: #7400FF
const primary_color = [116,0,255];

// Role ID's
const Role_LeadDev = '453718618207944724';
const Role_Developer = '465597942997450753';
const Role_Creatives = '453718962895847433';
const Role_Moderator = '464968058319142912';
const Role_AlphaTester = '465146640806969346';
const Role_TwitchChat = '464967514179371008';

//Guild ID
const GuildID = "453678030850752532";
// Misc letiables
let AlphaCount = 0;
const AlphaCountFileName = "saved_variables/alphacount.txt";
let NewCount = 0;
// ?
const Allowed_AlphaTester = true;

//Generating the help cards
//////////////////////////////////////////////////////////////////////////////////////////
const menu_help_1 = new Discord.RichEmbed()
.setColor(primary_color)
.setAuthor("Notify.gg Help Menu",bot_icon)
.addField("Acquire Alpha Access", "/alpha, /alphame", true)
.addField("Total Server members", "/members, /count", true)
.addField("New Server Emoji", "/newemoji name imageurl", true)
.addBlankField()
.addField("Kick User", "/kick @user Reason", true)
.addField("Ban User", "/ban @user Reason", true)
.addField("Help", "/help Page#", true)
.setFooter("Bot Created by : Noobular | Page 1/2",jamies_face);

const menu_help_2 = new Discord.RichEmbed()
.setColor(primary_color)
.setAuthor("Notify.gg Help Menu",bot_icon)
.addField("Ping the bot :)", "/ping")
.addBlankField(true)
.setFooter("Bot Created by : Noobular | Page 2/2",jamies_face);
//////////////////////////////////////////////////////////////////////////////////////////

//console.log but shorter, if you leave it blank its a blank space in the terminal
function c(type,data,color){
    if(data!==undefined){
        if(color !== undefined){
            // logs the type in color then the text as the default color
            switch(color){
                case "red":
                    console.log(clc.red(type) + " " + data);
                    break;
                case "green":
                    console.log(clc.greenBright(type) + " " + data);
                    break;
                case "blue":
                    console.log(clc.blueBright(type) + " " + data);
                    break;
                case "yellow":
                    console.log(clc.yellowBright(type) + " " + data);
                    break;
                case "cyan":
                    console.log(clc.cyanBright(type) + " " + data);
                    break;                    
                case "white":
                    console.log(clc.cyanBright(type) + " " + data);
                    break;                    
                case "purple":
                    console.log(clc.magentaBright(type) + " " + data);
                    break;                                    
                default:
                    break;                            
            }
        }else{
            console.log("one of the c() logs are missing the color...")
            console.log("The text is : " + data)
        }
    }else{
        console.log("  ");
    }
};

function generateHistory(type,name,time,admin,reason){
    if(admin){ // does something exist in the admin position of the parameters, if not this isn't staff related and is just history
        let embed = new Discord.RichEmbed()
        .setColor(primary_color)
        .setAuthor("["+ type + "] ",bot_icon)
        .addField(name,time)
        .addField("Reason: ",reason)
        .setFooter("Staff: "+admin+"  | Bot Created by : Noobular",jamies_face);
        return embed; // return the embed (use this in the message.send functions)
    }else{ // else just make this a normal history embed 
        let embed = new Discord.RichEmbed()
        .setColor(primary_color)
        .setAuthor("["+ type + "] ",bot_icon)
        .addField(name,time)
        .setFooter("Bot Created by : Noobular",jamies_face);
        return embed; // return the embed (use this in the message.send functions)
    }
}

//load all the saved letiables 
function loadvariables(){ // this would be used if this was connected to a db 
    checkFilesExist(); // make sure the local filesystem files exist, if not create them!
    c(); // spacer
    c("[File System]","Loading previously saved letiables","cyan"); // warn console that you're loading them
    c("[File System]","Loading Alpha Roles Given...","cyan"); // warn that you're going to load the alpha roles given count
    fs.readFile(AlphaCountFileName, 'utf8', function(err, data) {NewCount=parseInt(data);}); // read the file and load the letiable(s)
    c(); // spacer
}
 
//checks to see if the files exist, only used for alpha tester count currently
function checkFilesExist(){
    fs.exists(AlphaCountFileName,function(exists){ // see if the file under the letiable "AlphaCountFileName" exist
        if(exists === false){ // if false
            fs.writeFile(AlphaCountFileName, 0, function (err) { // attempt to create the file
                c("[File System]","Alpha Count File Created...","cyan") // tell console that its been created (even though it doesnt half the time)
                if (err)  // display the error in console if there is one 
                    return c(err);
            });
        }
    });
}

function sendgif(message,search){
    let url;
    if(search !== undefined){
         url = "https://api.giphy.com/v1/gifs/search?api_key="+config.giphykey+"&q="+search+"&limit=250&offset=0&rating=G&lang=en"
    }else{
         url = "https://api.giphy.com/v1/gifs/random?api_key="+config.giphykey+"&tag=&rating=G"
    }
    
    let randomimg = Math.ceil(Math.random() * 249); // This is a random image from 1-250 for an image within the search

    request.get(url,  // use the request function to send a get request 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let data = JSON.parse(body)
                if(search !== undefined){
                    message.channel.send(data.data[randomimg].images.original.url)
                }else{
                    message.channel.send(data.data.images.original.url)
                }
            }
        }
    );
}

// Adds 1 to the amount of people given alpha tester status too
function addAlphaCount(){
    // Read the file, then add 1 to the count of people given alpha tester status
    fs.readFile(AlphaCountFileName, 'utf8', function(err, data) {
        AlphaCount = parseInt(data) // grab the count in the file => to int
        NewCount = AlphaCount+=1  // add 1
        NewCount = NewCount.toString() // make it a string
        fs.writeFile(AlphaCountFileName,NewCount,function(err){ // write it to the file again with the newly added count
            //console.log(NewCount);
            if(err){console.log(err);}
        });
        if (err) throw err; // throw an error if it needs to
    });
};

// On a successful emoji add (suppodily) this will be run, is a response saying that it was successful
function emojiSuccessful(name,message){
    c('[New Emoji]','New Emoji Created:  ' + name,'green'); // log that its been created
    let emoji_id = message.guild.emojis.find('name', name).id // get the emoji id to print it out
    message.channel.send("**Added Emoji**") 
    message.channel.send("` "+ name + " ` : <:"+name+":"+emoji_id+">" ); // create the tag the bot is allowed to use for emojis <:name:id>
}

// Return the current time
function currTime(){
    let timeout = new Date();
    return timeout.toString();
}

//initialization of the bot
bot.on("ready", () => {
    bot.user.setGame('[Notify.Me] Utility Bot'); //you can set a default game
    c(); // spacer
    c('[Server]',`Notify.GG Utility Bot`,'red'); // log the bot has loaded
    c('[Server]',`${bot.users.size} users`,'red'); // tell the user count
    loadvariables(); //This should load the letiables before the bot can use the functions that are trying to use these letiables, so it doesnt return 0 or an error

    // Inital Network Check (also included in /ping)
    config.host.forEach(function(host){ // check the hosts to see if the website is alive
        ping.sys.probe(host, function(isAlive){
            let msg = isAlive ? 'Notify.Me is online!' : 'Notify.Me is dead!';
            //message.channel.send(msg);
        });
    });
});

// Event handler; On Ban
bot.on("guildBanAdd", (guild,user)=>{
});

// Event handler; on channel update call this event
bot.on("channelUpdate", (oldChannel, newChannel)=>{
    if(oldChannel.name != newChannel.name){ // check for the name change
        c('[Channel Updated]',oldChannel.name + " => " + newChannel.name,'purple') // log the name change
        newChannel.guild.channels.find("name","history").send(generateHistory('Updated Channel',oldChannel.name + " => " + newChannel.name,currTime())); // send change to history
        //c(`"${role.name}" @ ${role.createdAt}`,2);
    }
});

// Event handler; On channel deletion this function is called
bot.on("channelDelete", (channel)=>{
    channel.guild.channels.find("name","history").send(generateHistory('Channel Deletion',channel.name,currTime()));
    c('[Channel Deleted]',channel.name + " @ " + currTime(),'red');
});

// Event handler; On channel deletion this function is called
bot.on("roleDelete", (role)=>{
    role.guild.channels.find("name","history").send(generateHistory('Role Deletion',role.name,currTime()));
    c('[Role Deleted]',role.name + " @ " + currTime(),'red');
});

// Joining the discord channel
bot.on("guildCreate", guild => {
    c('[Guild Join]',`${guild.name} (${guild.id}), owned by ${guild.owner.user.username} (${guild.owner.user.id}).`,'red');
});

// Event Handler: When an emoji is removed off the server's emoji list
bot.on("emojiDelete", (emoji) => {
    emoji.guild.channels.find("name","history").send(generateHistory('Emoji Deletion',emoji.name,currTime()));
    c('[Emoji Deleted]',emoji.name + " @ " + currTime(),'red');
});

// New member joined the discord channel, what should we do when the event is triggered?
bot.on("guildMemberAdd", (member) => {
    //member.guild.channels.find("name","history").send(`[New Member] "${member}"\n ${member.joinedAt}`);
    member.guild.channels.find("name","history").send(generateHistory('New Member',member.user.username,member.joinedAt));
    c('[New User]',`"${member.user.username}" @ ${member.joinedAt}`,'green');
});

// Event Handler: creation of a new role!
bot.on("roleCreate", (role) => {
    role.guild.channels.find("name","history").send(generateHistory('New Role',role.name,role.createddAt)); // send history of role creation to history channel
    c('[New Role]',`"${role.name}" @ ${role.createdAt}`,'cyan'); // log it
});

// Event Handler: when a role is updated.
bot.on("roleUpdate", (oldRole,newRole) => {
    if(oldRole.name != newRole.name){ // check for the name change
        c('[Role Updated]',oldRole.name + " => " + newRole.name,'purple') // log the name change
        newRole.guild.channels.find("name","history").send(generateHistory('Updated Role',oldRole.name + " => " + newRole.name,currTime())); // send change to history
        //c(`"${role.name}" @ ${role.createdAt}`,2);
    }
});

// Event Handler: New Channel Created
bot.on("channelCreate", channel => {
    let name_channel = channel.name; // make it a letiable so I can change the first letter to uppercase
    name_channel = name_channel.charAt(0).toUpperCase() + name_channel.slice(1); // do that ^
    channel.guild.channels.find("name","history").send(generateHistory('Channel Creation',name_channel,channel.createdAt)); 
    c('[New Channel]',name_channel + ' @ ' + channel.createdAt,'cyan')
});

// hook for a message in chat thats been recieved
bot.on("message", async message => { 

    if(message.author.bot || message.system) return; // Ignore bots
    
    if(message.channel.type === 'dm') { // Direct Message
        return; //Optionally handle direct messages
    } 
   
    if (message.content.indexOf(config.prefix) === 0) { // Message starts with your prefix
        
        let msg = message.content.slice(config.prefix.length); // slice of the prefix on the message

        let args = msg.split(" "); // break the message into part by spaces

        let cmd = args[0].toLowerCase(); // set the first word as the command in lowercase just in case

        args.shift(); // delete the first word from the args

        // This log sends out all the data of the message
        //console.log(message);

        // Command list, return functions
        ////////////////////////////////////////////////////////////////////////////////////////

        // Help function, sends out the list of commands across multiple pages.
        if (cmd === 'help' || cmd === 'commands' || cmd === 'command') {
            //console.log(args[0])
            // args[0] is the page number, based on that select a page to send back
            switch(args[0]){
                case '1': 
                    //send help menu 1
                    message.channel.send(menu_help_1);
                    break;
                case '2': 
                    // send help menu 2
                    message.channel.send(menu_help_2);
                    break;
                default:
                    // they only said help so just send the first page
                    message.channel.send(menu_help_1)
                    break;
            }
        }

        // ping > pong just in case..
        else if (cmd === 'ping') { 
            // for every host in the host array, check to see if the bot can connect
            config.host.forEach(function(host){
                ping.sys.probe(host, function(isAlive){ // pings
                    let msg = isAlive ? 'Notify.Me is online!' : 'Notify.Me is dead!'; // dead/alive
                    message.channel.send(msg); // send the response to chat
                    c('[Ping]',msg,'yellow'); // log the response
                });
            });
            return;
        }

        else if(cmd === "kick") {
            let timeout = new Date();
            // This command must be limited to mods and admins. In this example we just hardcode the role names.
            // Please read on Array.some() to understand this bit: 
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
            if(!message.member.roles.some(r=>["Lead Dev", "Developers","Moderator"].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
            
            // Let's first check if we have a member and if we can kick them!
            // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
            // We can also support getting the member by ID, which would be args[0]
            let member = message.mentions.members.first() || message.guild.members.get(args[0]);
            if(!member)
            return message.reply("Please mention a valid member of this server");
            if(!member.kickable) 
            return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
            
            // slice(1) removes the first part, which here should be the user mention or ID
            // join(' ') takes all the letious parts to make it a single string.
            let reason = args.slice(1).join(' ');
            if(!reason) reason = "No reason provided";
            
            // Now, time for a swift kick in the nuts!
            await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
            c('[Kicked]',`${member.user.tag} by ${message.author.tag} | ${reason}`,'red');
            message.guild.channels.find("name","ban-list").send(generateHistory('Kicked',`${member.user.tag}`,currTime(),message.author.username,reason));
        }
        
        else if(cmd === "ban") {
            let timeout = new Date();
            // Most of this command is identical to kick, except that here we'll only let admins do it.
            // In the real world mods could ban too, but this is just an example, right? ;)
            if(!message.member.roles.some(r=>["Lead Dev","Developers"].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
            
            let member = message.mentions.members.first();
            if(!member) // making sure the selected person is a member of the server, if not don't allow for the code to run
            return message.reply("Please mention a valid member of this server");
            if(!member.bannable)  // are they bannable?
            return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

            let reason = args.slice(1).join(' '); // put all the arguments together to for a reason
            if(!reason) reason = "No reason provided";
            
            await member.ban(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
            c('[Banned]',`${member.user.tag} by ${message.author.tag} | ${reason}`,'red')
            message.guild.channels.find("name","ban-list").send(generateHistory('Banned',message.author.username,currTime(),message.author.username,reason));
        }
        // Gives the Alpha Role to the user that submits the message asking for it.
        else if (cmd === "alpha" || cmd ==="alp" || cmd === "aplha" || cmd === "alphame"){
            if(Allowed_AlphaTester){ // Are people allowed to use this command all together?
                if(message.member.roles.find('name', 'Alpha-Tester') === null){ // do they not already have the role?
                    message.member.addRole(Role_AlphaTester); // add the role
                    c('[Role Given]',message.member.displayName+" Gained Alpha-Tester.",'purple'); // console log they've gained it
                    addAlphaCount(); // add to the total alpha roles given file
                    return message.channel.send("You're an Alpha-Tester now!) // reply in chat that they've gotten the role
                }else{
                    return message.channel.send("You're already an Alpha-Tester.") // they've already got the role
                }
            }
        }
        else if(cmd==="members" || cmd ==="count"){
            // Fetch guild members
            return message.channel.send("Server Count: " + message.guild.members.size);
        } 
        else if(cmd==="gif"){
            // send random gif
            let search = args.slice().join(' ');
            if(!search){
                return sendgif(message)
            }else{
                return sendgif(message,search)
            }
            
        }
        else if (cmd==="newemoji"){
            if(message.member.roles.get(Role_LeadDev) != undefined || message.member.roles.get(Role_Developer) != undefined || message.member.roles.get(Role_Moderator) != undefined || message.member.roles.get(Role_Creatives) != undefined){
                if(args[0] && args[1]){
                    if(args[1].substr(args[1].length - 3)==='jpg' || args[1].substr(args[1].length - 3)==='png' || args[1].substr(args[1].length - 3)==='gif'){
                        let name = args[0].replace(/[^\w\s]/gi, '');   // Remove any special characters from the emoji's name so there's no errors with naming
                        let img = args[1]   // emoji URL location
                        try{ // try to create it, if there's a problem it wont entirely crash the bot
                            message.guild.createEmoji(img,name)
                            .then(emoji => emojiSuccessful(name,message))// emoji successful simply is what happends after (it assumes) its successful
                            .catch(console.error); // catch the problems
                        }
                        catch(error){
                            c(error);
                        }
                    }
                }
            }else{
                message.channel.send("You don't have high enough permissions..."); // person doesn't match any of the allowed ranks
            }
        }
        // Make sure this command always checks for you. YOU NEVER WANT ANYONE ELSE TO USE THIS COMMAND
        else if (cmd === "eval" && message.author.id === config.owner){ // < checks the message author's id to yours in config.json.
            const code = args.join(" ");
            return evalCmd(message, code);
        }
        else { 
            // if there are no commands under the sent message, just send this message that's below in response.
            message.channel.send(`Unknown Command...`);
            return;
        }
    } else if (message.content.indexOf("<@"+bot.user.id) === 0 || message.content.indexOf("<@!"+bot.user.id) === 0) { // Catch @Mentions

        return message.channel.send(`Use \`${config.prefix}\` to interact with me.`); //help people learn your prefix
    }
    return;
});

// Evaluates the code thats sent in from the chat, only usable by the bot owner (check config.json)
function evalCmd(message, code) {
     if(message.author.id !== config.owner) return;
     try {
         let evaled = eval(code);
         if (typeof evaled !== "string")
             evaled = util.inspect(evaled);
             message.channel.send(clean(evaled), {code:"xl"});
     } catch (err) {
         message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
     }
 }

bot.on('disconnect', function(msg, code) {   // if the bot disconnects for some reason, rejoin the server(guild).
    if (code === 0) return console.error(msg);
    c('[Server]','Attempting to reconnect to the server...','red')
    bot.connect();
});
// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

bot.login(config.token);
