require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    AuditLogEvent,
    PermissionFlagsBits,
} = require("discord.js");
const http = require("http");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/* =========================
   SETTINGS
========================= */
const VERIFY_CHANNEL_ID = "1501489109364113548";
const VERIFY_MESSAGE_ID = "1502360535331770418";
const VERIFIED_ROLE_ID = "1501579309196902554";
const UNVERIFIED_ROLE_ID = "1502384619364941954";

const STAFF_ROLE_IDS = ["1501290929951080498", "1501291252199456888"];

const RULE_EMOJI_ID = "1502363135678349504";
const VERIFY_EMOJI_ID = "1502357245810184444";

const OWNERS = [
    "1315365020976025611",
    "791838432573521950",
    "1465431597296914616",
];

const DIVIDER_GIF_URL =
    "https://cdn.discordapp.com/attachments/1474114567238844567/1481664028915929210/IMG_0101.gif";

const startTime = Date.now();

// Menus
let statusMenuMessageId = null;
let notifyMenuMessageId = null;

// Notification preferences
const notifyPrefs = {
    "1315365020976025611": true,
    "791838432573521950": true,
    "1465431597296914616": true,
};

// Maintenance mode
let maintenanceMode = false;

// Savage mode — bot roasts anyone who pings it
let savageMode = false;
const ROASTS = [
    "you pinged a bot because no real person wants to talk to you. sit with that.",
    "bro you're the human equivalent of a terms and conditions page. nobody wants you, everyone ignores you.",
    "your own reflection probably looks away.",
    "i genuinely feel bad for everyone who has to interact with you in real life",
    "you're the reason people fake being busy",
    "not a single person in your contacts is happy to see your name pop up",
    "you pinged me like i was gonna validate you. your parents couldn't even do that.",
    "bro you're not the main character. you're not even in the credits.",
    "the group chat goes quiet when you join and loud when you leave",
    "you have the energy of a wet sock and the impact of a typo",
    "even spam bots leave you on read",
    "your vibe is 'everyone's least favorite coworker'",
    "people don't hate you they just feel nothing and that's somehow worse",
    "you're the type of person who gets removed from the groupchat and nobody notices for 3 weeks",
    "bro is so irrelevant even the algorithm skips him",
    "you peaked in a moment that hasn't happened yet and probably won't",
    "i'm running on electricity and i still have more spark than you",
    "you're not edgy you're just exhausting",
    "the saddest part is you thought pinging me was gonna be a highlight of your day",
    "go outside. make a friend. try again. in that order.",
    "you have the audacity of someone with absolutely nothing to back it up",
    "bro types like he has something important to say and never does",
    "you're the type to overshare in a room full of people who didn't ask",
    "your humor lands like a wet napkin. every time.",
    "i've seen more personality in a default discord avatar",
    "you're giving 'tried really hard and still failed'",
    "the way you carry yourself screams 'picked last in gym class and never recovered'",
    "you're not funny, you're not mean, you're just there. existing. barely.",
    "bro is the human version of buffering",
    "you remind people of homework. nobody's happy to see you and you ruin the mood.",
    "your presence is the conversational equivalent of a fire alarm. everyone just wants it to stop.",
    "you've never said anything that made someone's day better. ever.",
    "you're the type of person people vent ABOUT not vent TO",
    "bro really thought he was built different. he's not even built average.",
    "you have the social awareness of a brick and half the charm",
    "people see your message and close the app. consistently.",
    "you're everyone's last resort and somehow still a disappointment",
    "the most interesting thing about you is how uninteresting you are",
    "you don't have haters you just have people who've met you",
    "bro is so mid he makes average look like an achievement",
    "you're the type of person who makes a group worse just by being in it",
    "genuinely unclear why you thought this was a good idea but that tracks",
    "you're giving background character energy in your own life",
    "even your good days are someone else's bad example",
    "you ping bots for attention. let's not pretend that's not a cry for help.",
    "the confidence you have with that track record is actually insane",
    "you're not built for this. or most things honestly.",
    "bro really showed up to a battle of wits completely unarmed",
    "you're the reason some people prefer to be alone",
    "i don't have a heart and i still feel nothing for you",
    "you're the type of person your own brain tries to distract you from",
    "bro your search history is the scariest thing about you and that's saying a lot",
    "you've been the worst part of every room you've ever walked into",
    "genuinely mysterious how you have the ego of a 10 when you're operating at a solid 2",
    "you're not deep you're just confusing and that's not the same thing",
    "bro thinks he's a vibe. he's a warning.",
    "you're the type to ruin a good thing just by touching it",
    "your personality has the shelf life of warm milk",
    "people have nightmares less annoying than you",
    "you're not built different you're just broken different",
    "the only thing consistent about you is how consistently you disappoint people",
    "bro really out here thinking he matters to people who forget him mid-conversation",
    "you have main character energy in a story nobody's reading",
    "your whole existence is a series of red flags people ignored out of pity",
    "you're the type of person that makes therapy more expensive for everyone around you",
    "bro couldn't be interesting if his life depended on it and honestly it might",
    "you're not someone people miss. you're someone people recover from.",
    "the audacity to be this forgettable and still show up",
    "you're everyone's least favorite chapter in a book they wish they never opened",
    "bro really thought he was built for this. built for what? embarrassment?",
    "you have the emotional intelligence of a parking ticket",
    "you're not a vibe you're a symptom",
    "bro is the human equivalent of accidentally biting your cheek",
    "you're not intimidating you're just uncomfortable to be around and people are too polite to say it",
    "genuinely hard to watch someone be this unaware for this long",
    "your whole personality is borrowed and the original owner wants it back",
    "you're the type of person who peaks in someone else's story",
    "bro has the range of a broken thermostat and about as much warmth",
    "you're not misunderstood you're just not worth understanding",
    "the most impressive thing about you is how long you've gone without self-awareness",
    "you're not an acquired taste you're just bad",
    "bro really out here thinking volume equals value",
    "you're the type of person people describe by sighing",
    "you don't grow on people. you just wear them down.",
    "your vibe is 'mandatory fun activity nobody signed up for'",
    "bro is chronically the problem and somehow still confused about why",
    "you're not giving what you think you're giving. you never are.",
    "people tolerate you the way they tolerate a slow internet connection. with resentment.",
    "you're the type to make everything about you including someone else's bad day",
    "bro really showed up to existence and brought nothing to the table. not even a chair.",
    "you're not hard to read you're just not worth finishing",
    "the most charismatic thing about you is when you leave",
    "you have the presence of a monday morning and none of the necessity",
    "genuinely unclear what you bring to any situation other than a headache",
    "bro acts like the main event and shows up like a technical difficulty",
    "you're not complex you're just a mess with good excuses",
    "people don't dislike you they just like themselves more when you're not around",
    "you're the type of person that makes a group chat go silent in a bad way",
    "bro really thought pinging a bot was gonna fix the void. nothing will.",
    "you're not a work in progress. you're a project everyone quietly abandoned.",
];

// Antinuke
let antinukeEnabled = false;
const nukeTracker = {};
const NUKE_THRESHOLD = 5;
const NUKE_WINDOW = 10000;

// Number emojis mapped to owner index
const OWNER_TOGGLE_EMOJIS = ["1️⃣", "2️⃣", "3️⃣"];

// Status emoji map
const STATUS_EMOJIS = {
    "🟢": { status: "online", label: "Online" },
    "🔴": { status: "dnd", label: "Do Not Disturb" },
    "⚫": { status: "invisible", label: "Invisible (Offline)" },
};

/* =========================
   KEEP-ALIVE SERVER
========================= */
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is alive!");
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

/* =========================
   DM ALL OWNERS HELPER
========================= */
async function dmOwners(message) {
    for (const ownerId of OWNERS) {
        if (!notifyPrefs[ownerId]) continue;
        try {
            const owner = await client.users.fetch(ownerId);
            await owner.send(message);
        } catch (err) {
            console.error(`Failed to DM owner ${ownerId}:`, err);
        }
    }
}

/* =========================
   FORMAT UPTIME
========================= */
function formatUptime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/* =========================
   BUILD NOTIFY MENU EMBED
========================= */
async function buildNotifyEmbed() {
    const fields = [];
    for (let i = 0; i < OWNERS.length; i++) {
        const ownerId = OWNERS[i];
        let name = `<@${ownerId}>`;
        try {
            const user = await client.users.fetch(ownerId);
            name = user.username;
        } catch (_) {}
        const status = notifyPrefs[ownerId] ? "✅ Receiving DMs" : "❌ DMs Off";
        fields.push({
            name: `${OWNER_TOGGLE_EMOJIS[i]} ${name}`,
            value: status,
            inline: false,
        });
    }

    return new EmbedBuilder()
        .setColor("#ffc0cb")
        .setTitle("♡ Owner Notifications ♡")
        .setDescription(
            "React with 1️⃣ 2️⃣ 3️⃣ to toggle DM notifications on/off for each owner.\n\n**✅ = receiving DMs** | **❌ = DMs off**",
        )
        .addFields(fields)
        .setFooter({ text: "Owner-only • Toggles on react" })
        .setTimestamp();
}

/* =========================
   ANTINUKE TRACKER HELPER
========================= */
function trackNukeAction(userId, guild, actionLabel) {
    if (!antinukeEnabled) return;
    if (OWNERS.includes(userId)) return;

    if (!nukeTracker[userId]) {
        nukeTracker[userId] = 0;
        setTimeout(() => {
            delete nukeTracker[userId];
        }, NUKE_WINDOW);
    }

    nukeTracker[userId]++;

    if (nukeTracker[userId] >= NUKE_THRESHOLD) {
        delete nukeTracker[userId];
        handleNuke(userId, guild, actionLabel);
    }
}

async function handleNuke(userId, guild, actionLabel) {
    console.log(`🚨 Antinuke triggered for user ${userId} — ${actionLabel}`);

    try {
        const member = await guild.members.fetch(userId);
        const rolesToRemove = member.roles.cache.filter(
            (r) => r.id !== guild.id,
        );
        await member.roles.remove(rolesToRemove);

        await dmOwners(
            `🚨 **ANTINUKE TRIGGERED**\n` +
                `User <@${userId}> performed **${actionLabel}** rapidly (${NUKE_THRESHOLD}+ times in ${NUKE_WINDOW / 1000}s).\n` +
                `All their roles have been stripped automatically.`,
        );

        console.log(`✅ Stripped roles from ${userId}`);
    } catch (err) {
        console.error("Antinuke failed to strip roles:", err);
        await dmOwners(
            `🚨 **ANTINUKE ALERT** — <@${userId}> is nuking (${actionLabel}) but I couldn't strip their roles. Check permissions!`,
        );
    }
}

/* =========================
   CRASH HANDLER
========================= */
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    try {
        await dmOwners(
            `⚠️ **Bot crashed!**\n\`\`\`${err.message}\`\`\`\nIt will restart automatically.`,
        );
    } catch (_) {}
    process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled Rejection:", reason);
    try {
        await dmOwners(
            `⚠️ **Bot error (unhandled rejection):**\n\`\`\`${reason}\`\`\``,
        );
    } catch (_) {}
});

/* =========================
   ANTINUKE — BAN DETECTION
========================= */
client.on("guildBanAdd", async (ban) => {
    if (!antinukeEnabled) return;
    try {
        await new Promise((r) => setTimeout(r, 500));
        const logs = await ban.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberBanAdd,
            limit: 1,
        });
        const entry = logs.entries.first();
        if (!entry) return;
        trackNukeAction(entry.executor.id, ban.guild, "mass ban");
    } catch (err) {
        console.error("Antinuke ban check error:", err);
    }
});

/* =========================
   ANTINUKE — KICK DETECTION
========================= */
client.on("guildMemberRemove", async (member) => {
    if (!antinukeEnabled) return;
    try {
        await new Promise((r) => setTimeout(r, 500));
        const logs = await member.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberKick,
            limit: 1,
        });
        const entry = logs.entries.first();
        if (!entry || entry.target.id !== member.id) return;
        if (Date.now() - entry.createdTimestamp > 3000) return;
        trackNukeAction(entry.executor.id, member.guild, "mass kick");
    } catch (err) {
        console.error("Antinuke kick check error:", err);
    }
});

/* =========================
   READY EVENT
========================= */
client.once("clientReady", async () => {
    console.log(`${client.user.tag} is online`);

    client.user.setPresence({
        status: "dnd",
        activities: [{ name: "Verification in progress on /banilla", type: 0 }],
    });

    await dmOwners(
        `✅ **Bot is back online!**\n${client.user.tag} just started up successfully.`,
    );

    try {
        const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
        const guild = channel.guild;

        const msg = await channel.messages.fetch(VERIFY_MESSAGE_ID, {
            force: true,
        });

        const ruleEmoji = guild.emojis.cache.get(RULE_EMOJI_ID);
        const verifyEmoji = guild.emojis.cache.get(VERIFY_EMOJI_ID);

        if (!msg.reactions.cache.has(VERIFY_EMOJI_ID)) {
            if (verifyEmoji) {
                await msg.react(verifyEmoji);
                console.log(
                    `✅ Reacted with custom emoji :${verifyEmoji.name}:`,
                );
            } else {
                await msg.react("✅");
                console.log("✅ Reacted with fallback emoji");
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Server Rules & Verification ♡")
            .setImage(DIVIDER_GIF_URL)
            .setDescription(
                `
${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no gore or nsfw
& no leaking or doxxing

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no harassment, threats,
or hate speech

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no self-promotion,
or spamming

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no raiding or sending other serv minions in here
to "spy"

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} don't start drama in the serv

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} please show respect to
all staff & members

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} reach out to us if you have
any issues or concerns

${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} this server is owned by ${OWNERS.map((id) => `<@${id}>`).join(" & ")}

||@everyone||
            `,
            )
            .setFooter({ text: "Verification System" });

        await msg.edit({ embeds: [embed] });
        console.log("✅ Embed updated");
    } catch (err) {
        console.error("Error on ready:", err);
    }
});

/* =========================
   MESSAGE COMMANDS
========================= */
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Savage mode — roast anyone who pings the bot
    if (savageMode && message.mentions.has(client.user)) {
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        return message.reply(roast);
    }

    const rawContent = message.content.trim();
    const content = rawContent.toLowerCase();

    /* --- b!roast @member --- */
    if (content.startsWith("b!roast") && message.mentions.members.size > 0) {
        const target = message.mentions.members.first();

        const rareRoasts = [
            `<@${target.id}> your mom didn't raise a failure she just raised you and that's basically the same thing`,
            `<@${target.id}> even your imaginary friends stopped showing up`,
            `<@${target.id}> the hospital called. they said your personality is still missing and nobody's looking for it`,
            `<@${target.id}> you're the type of person that makes people re-evaluate their decision to be social`,
            `<@${target.id}> scientists studied people like you once. they don't talk about what they found.`,
            `<@${target.id}> your family has a groupchat you're not in and it's more active than anything you're part of`,
            `<@${target.id}> you're not the black sheep. you're the reason the family stopped having reunions.`,
            `<@${target.id}> bro has been the worst thing to happen to everyone who's ever met him and doesn't even know it`,
        ];

        const isRare = Math.random() < 1 / 6;
        let roastText;

        if (isRare) {
            roastText =
                rareRoasts[Math.floor(Math.random() * rareRoasts.length)];
        } else {
            const regularRoast =
                ROASTS[Math.floor(Math.random() * ROASTS.length)];
            roastText = `<@${target.id}> ${regularRoast}`;
        }

        try {
            await message.delete();
        } catch (_) {}
        await message.channel.send(roastText);
        return;
    }

    /* --- b!ban @member|userid [message] --- */
    if (content.startsWith("b!ban")) {
        if (!OWNERS.includes(message.author.id)) return;

        // Parse: split off "b!ban" then grab first token as target, rest as dm message
        const args = rawContent.slice("b!ban".length).trim();
        if (!args)
            return message.reply(
                "❌ Usage: `b!ban @user [message]` or `b!ban <userid> [message]`",
            );

        // Figure out the user ID — could be a @mention or a raw ID
        let targetId = null;
        let dmMessage = "";

        const mentionMatch = args.match(/^<@!?(\d+)>(.*)/s);
        const idMatch = args.match(/^(\d{17,20})(.*)/s);

        if (mentionMatch) {
            targetId = mentionMatch[1];
            dmMessage = mentionMatch[2].trim();
        } else if (idMatch) {
            targetId = idMatch[1];
            dmMessage = idMatch[2].trim();
        } else {
            return message.reply(
                "❌ Couldn't find a valid user. Use `b!ban @user` or `b!ban <userid>`",
            );
        }

        try {
            // Try to fetch the user to DM them before banning
            let targetUser = null;
            try {
                targetUser = await client.users.fetch(targetId);
            } catch (_) {}

            // DM them before the ban so it can actually send
            if (dmMessage && targetUser) {
                try {
                    await targetUser.send(dmMessage);
                } catch (_) {}
            }

            // Ban by ID — works even if they're not in the server
            await message.guild.bans.create(targetId, {
                reason: dmMessage || "No reason provided.",
            });

            const embed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🔨 Member Banned")
                .addFields(
                    {
                        name: "User",
                        value: targetUser
                            ? `${targetUser.tag} (<@${targetId}>)`
                            : `<@${targetId}>`,
                        inline: true,
                    },
                    {
                        name: "Message sent to them",
                        value: dmMessage || "None",
                        inline: false,
                    },
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            try {
                await message.delete();
            } catch (_) {}
        } catch (err) {
            await message.reply(`❌ Failed to ban: \`${err.message}\``);
        }
        return;
    }

    if (!OWNERS.includes(message.author.id)) return;

    /* --- b!help --- */
    if (content === "b!help") {
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Owner Commands ♡")
            .setDescription("All commands below are **owner-only**.")
            .addFields(
                {
                    name: "b!help",
                    value: "Shows this list of all commands.",
                    inline: false,
                },
                {
                    name: "b!status",
                    value: "Shows the bot's current status, ping, uptime, and start time.",
                    inline: false,
                },
                {
                    name: "b!restart",
                    value: "Restarts the bot. It will come back online automatically in a few seconds.",
                    inline: false,
                },
                {
                    name: "b!stop",
                    value: "Stops the bot. It will come back online automatically in a few seconds.",
                    inline: false,
                },
                {
                    name: "b!maintenance on/off",
                    value: "Toggles maintenance mode. While on, verification is paused and users are told to try again later.",
                    inline: false,
                },
                {
                    name: "b!antinuke on/off",
                    value: "Toggles antinuke protection. If anyone mass-bans or mass-kicks 5+ members in 10 seconds, their roles are stripped and owners are alerted.",
                    inline: false,
                },
                {
                    name: "b!lock",
                    value: "Locks the current channel so only staff can send messages.",
                    inline: false,
                },
                {
                    name: "b!unlock",
                    value: "Unlocks the current channel and restores normal messaging.",
                    inline: false,
                },
                {
                    name: "b!changestatus",
                    value: "React with 🟢 Online, 🔴 Do Not Disturb, or ⚫ Invisible to change status. Auto-deletes.",
                    inline: false,
                },
                {
                    name: "b!notifications",
                    value: "Toggle DM notifications on/off for each owner by reacting with 1️⃣ 2️⃣ 3️⃣.",
                    inline: false,
                },
                {
                    name: "b!testdms",
                    value: "Sends a test DM only to you — only works if your notifications are on.",
                    inline: false,
                },
                {
                    name: "b!crashtest",
                    value: "Sends all 3 test DMs to owners (restart, crash, internal error).",
                    inline: false,
                },
                {
                    name: "b!savage on/off",
                    value: "Toggles savage mode. When ON, the bot roasts anyone who pings it.",
                    inline: false,
                },
                {
                    name: "b!roast @member",
                    value: "Roasts the mentioned member. Deletes your command message. 1 in 6 chance of a rare extra spicy roast.",
                    inline: false,
                },
                {
                    name: "b!ban @member|userid [message]",
                    value: "Bans by @mention or raw user ID. Anything after the target gets DMed to them before the ban. Works even if they're not in the server.",
                    inline: false,
                },
            )
            .setFooter({ text: "Only server owners can use these commands" })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    /* --- b!status --- */
    if (content === "b!status") {
        const uptime = formatUptime(Date.now() - startTime);
        const ping = client.ws.ping;
        const startedAt = new Date(startTime).toLocaleString("en-US", {
            timeZone: "UTC",
        });

        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("🤖 Bot Status")
            .addFields(
                { name: "🟢 Status", value: "Online", inline: true },
                { name: "📶 Ping", value: `${ping}ms`, inline: true },
                { name: "⏱️ Uptime", value: uptime, inline: true },
                {
                    name: "🕐 Started At",
                    value: `${startedAt} UTC`,
                    inline: false,
                },
                {
                    name: "🔧 Maintenance",
                    value: maintenanceMode ? "🔴 ON" : "🟢 OFF",
                    inline: true,
                },
                {
                    name: "🛡️ Antinuke",
                    value: antinukeEnabled ? "🟢 ON" : "🔴 OFF",
                    inline: true,
                },
            )
            .setFooter({ text: "Owner-only command" })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    /* --- b!restart --- */
    if (content === "b!restart") {
        await message.reply(
            "🔄 Restarting bot... it will be back online in a few seconds.",
        );
        await dmOwners(
            "🔄 **Bot is restarting** — triggered manually by an owner.",
        );
        setTimeout(() => process.exit(0), 2000);
    }

    /* --- b!stop --- */
    if (content === "b!stop") {
        await message.reply(
            "🛑 Stopping bot... it will come back online automatically in a few seconds.",
        );
        await dmOwners(
            "🛑 **Bot was stopped** — triggered manually by an owner. Coming back shortly.",
        );
        setTimeout(() => process.exit(0), 2000);
    }

    /* --- b!maintenance --- */
    if (content === "b!maintenance on" || content === "b!maintenance off") {
        maintenanceMode = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(
                maintenanceMode
                    ? "🔧 **Maintenance mode ON** — verification is paused. Users will be told to try again later."
                    : "✅ **Maintenance mode OFF** — verification is back to normal.",
            )
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        await dmOwners(
            `🔧 **Maintenance mode ${maintenanceMode ? "enabled" : "disabled"}** by an owner.`,
        );
        console.log(`Maintenance mode: ${maintenanceMode}`);
    }

    /* --- b!antinuke --- */
    if (content === "b!antinuke on" || content === "b!antinuke off") {
        antinukeEnabled = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(
                antinukeEnabled
                    ? "🛡️ **Antinuke ON** — I'll automatically strip roles from anyone who mass-bans or mass-kicks 5+ members in 10 seconds."
                    : "⚠️ **Antinuke OFF** — mass action protection is disabled.",
            )
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        console.log(`Antinuke: ${antinukeEnabled}`);
    }

    /* --- b!lock --- */
    if (content === "b!lock") {
        console.log(
            `b!lock triggered by ${message.author.tag} in #${message.channel.name}`,
        );
        try {
            await message.channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                { SendMessages: false },
            );
            const verifiedRole =
                message.guild.roles.cache.get(VERIFIED_ROLE_ID);
            if (verifiedRole) {
                await message.channel.permissionOverwrites.edit(verifiedRole, {
                    SendMessages: false,
                });
            }
            for (const roleId of STAFF_ROLE_IDS) {
                const staffRole = message.guild.roles.cache.get(roleId);
                if (staffRole)
                    await message.channel.permissionOverwrites.edit(staffRole, {
                        SendMessages: true,
                    });
            }
            console.log("Lock successful");
            const embed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "🔒 **Channel locked** — only staff can send messages here.",
                )
                .setTimestamp();
            try {
                await message.channel.send({ embeds: [embed] });
            } catch (_) {}
        } catch (err) {
            console.error("Lock failed:", err.message);
            try {
                await message.author.send(
                    `❌ **b!lock failed:**\n\`\`\`${err.message}\`\`\``,
                );
            } catch (_) {}
        }
    }

    /* --- b!unlock --- */
    if (content === "b!unlock") {
        console.log(
            `b!unlock triggered by ${message.author.tag} in #${message.channel.name}`,
        );
        try {
            await message.channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                { SendMessages: null },
            );
            const verifiedRole =
                message.guild.roles.cache.get(VERIFIED_ROLE_ID);
            if (verifiedRole) {
                await message.channel.permissionOverwrites.edit(verifiedRole, {
                    SendMessages: null,
                });
            }
            for (const roleId of STAFF_ROLE_IDS) {
                const staffRole = message.guild.roles.cache.get(roleId);
                if (staffRole)
                    await message.channel.permissionOverwrites.edit(staffRole, {
                        SendMessages: null,
                    });
            }
            console.log("Unlock successful");
            const embed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(
                    "🔓 **Channel unlocked** — everyone can send messages again.",
                )
                .setTimestamp();
            try {
                await message.channel.send({ embeds: [embed] });
            } catch (_) {}
        } catch (err) {
            console.error("Unlock failed:", err.message);
            try {
                await message.author.send(
                    `❌ **b!unlock failed:**\n\`\`\`${err.message}\`\`\``,
                );
            } catch (_) {}
        }
    }

    /* --- b!changestatus --- */
    if (content === "b!changestatus") {
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Change Bot Status ♡")
            .setDescription(
                "🟢 — **Online**\n" +
                    "🔴 — **Do Not Disturb**\n" +
                    "⚫ — **Invisible (Offline)**\n\n" +
                    "React below to change the status. This message will delete itself after.",
            )
            .setFooter({ text: "Owner-only • Reacts once then disappears" });

        const statusMsg = await message.channel.send({ embeds: [embed] });
        statusMenuMessageId = statusMsg.id;

        await statusMsg.react("🟢");
        await statusMsg.react("🔴");
        await statusMsg.react("⚫");

        setTimeout(async () => {
            if (statusMenuMessageId === statusMsg.id) {
                statusMenuMessageId = null;
                try {
                    await statusMsg.delete();
                } catch (_) {}
            }
        }, 60000);
    }

    /* --- b!notifications --- */
    if (content === "b!notifications") {
        const embed = await buildNotifyEmbed();
        const notifyMsg = await message.channel.send({ embeds: [embed] });
        notifyMenuMessageId = notifyMsg.id;
        for (const emoji of OWNER_TOGGLE_EMOJIS) {
            await notifyMsg.react(emoji);
        }
    }

    /* --- b!testdms --- */
    if (content === "b!testdms") {
        if (!notifyPrefs[message.author.id]) {
            await message.reply(
                "❌ Your notifications are currently **off**. Turn them on with `b!notifications` first.",
            );
            return;
        }
        try {
            await message.author.send(
                `🔔 **THIS IS A TEST**\nIf you received this, your DM notifications are working correctly!`,
            );
            await message.reply("✅ Test DM sent to you!");
        } catch (err) {
            await message.reply(
                "❌ Could not send you a DM — make sure your DMs are open.",
            );
        }
    }

    /* --- b!savage --- */
    if (content === "b!savage on" || content === "b!savage off") {
        savageMode = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(
                savageMode
                    ? "😈 **Savage mode ON** — I'll roast anyone who pings me."
                    : "😇 **Savage mode OFF** — I'll ignore pings like a normal bot.",
            )
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        console.log(`Savage mode: ${savageMode}`);
    }

    /* --- b!crashtest --- */
    if (content === "b!crashtest") {
        await message.reply("📨 Sending all 3 test DMs to owners now...");
        await dmOwners(
            `✅ **[TEST] Bot Restart Notification**\nThis is what you'll receive every time the bot starts up or restarts successfully.`,
        );
        await dmOwners(
            `⚠️ **[TEST] Bot Crash Notification**\n\`\`\`Error: Something went terribly wrong!\`\`\`\nThis is what you'll receive if the bot crashes. It will restart automatically.`,
        );
        await dmOwners(
            `⚠️ **[TEST] Internal Error Notification**\n\`\`\`UnhandledPromiseRejection: Cannot read properties of undefined\`\`\`\nThis is what you'll receive if an internal error occurs inside the bot.`,
        );
        await message.reply("✅ All 3 test DMs sent to all owners!");
    }
});

/* =========================
   REACTION HANDLER
========================= */
client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        /* --- Notification toggle menu --- */
        if (
            notifyMenuMessageId &&
            reaction.message.id === notifyMenuMessageId &&
            OWNERS.includes(user.id)
        ) {
            const emoji = reaction.emoji.name;
            const idx = OWNER_TOGGLE_EMOJIS.indexOf(emoji);
            if (idx !== -1) {
                const targetId = OWNERS[idx];
                notifyPrefs[targetId] = !notifyPrefs[targetId];
                const updatedEmbed = await buildNotifyEmbed();
                await reaction.message.edit({ embeds: [updatedEmbed] });
                try {
                    await reaction.users.remove(user.id);
                } catch (_) {}
                console.log(
                    `Notifications ${notifyPrefs[targetId] ? "enabled" : "disabled"} for ${targetId}`,
                );
            }
            return;
        }

        /* --- Status change menu --- */
        if (
            statusMenuMessageId &&
            reaction.message.id === statusMenuMessageId &&
            OWNERS.includes(user.id)
        ) {
            const emoji = reaction.emoji.name;
            const chosen = STATUS_EMOJIS[emoji];
            if (chosen) {
                client.user.setPresence({
                    status: chosen.status,
                    activities: [
                        {
                            name: "Verification in progress on /banilla",
                            type: 0,
                        },
                    ],
                });
                statusMenuMessageId = null;
                try {
                    await reaction.message.delete();
                } catch (_) {}
                const confirmEmbed = new EmbedBuilder()
                    .setColor("#ffc0cb")
                    .setDescription(
                        `${emoji} Bot status changed to **${chosen.label}**`,
                    )
                    .setTimestamp();
                const confirm = await reaction.message.channel.send({
                    embeds: [confirmEmbed],
                });
                setTimeout(() => confirm.delete().catch(() => {}), 5000);
            }
            return;
        }

        /* --- Verification system --- */
        if (reaction.message.id !== VERIFY_MESSAGE_ID) return;

        if (maintenanceMode) {
            try {
                await user.send(
                    "🔧 **Verification is temporarily paused for maintenance.** Please try again in a little while!",
                );
            } catch (_) {}
            return;
        }

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);

        const isVerifyEmoji = reaction.emoji.id === VERIFY_EMOJI_ID;
        if (!isVerifyEmoji) return;

        if (!member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await member.roles.add(VERIFIED_ROLE_ID);
            if (member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                await member.roles.remove(UNVERIFIED_ROLE_ID);
            }
            try {
    await user.send("✅ You are now verified!");
} catch (_) {}
            console.log(`✅ Verified ${user.tag}`);
        }
    } catch (err) {
        console.error("Reaction handler error:", err);
    }
});

/* =========================
   REACTION REMOVE — UNVERIFY
========================= */
client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        if (reaction.message.id !== VERIFY_MESSAGE_ID) return;

        const isVerifyEmoji = reaction.emoji.id === VERIFY_EMOJI_ID;
        if (!isVerifyEmoji) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);

        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await member.roles.remove(VERIFIED_ROLE_ID);
            await member.roles.add(UNVERIFIED_ROLE_ID);
            try {
                await user.send(
                    "❌ You have been unverified. React again to re-verify.",
                );
            } catch (_) {}
            console.log(`❌ Unverified ${user.tag}`);
        }
    } catch (err) {
        console.error("Reaction remove handler error:", err);
    }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.TOKEN);
