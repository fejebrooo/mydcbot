require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    AuditLogEvent,
    PermissionFlagsBits,
    AttachmentBuilder,
} = require("discord.js");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

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

// Savage mode
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

const OWNER_TOGGLE_EMOJIS = ["1️⃣", "2️⃣", "3️⃣"];

const STATUS_EMOJIS = {
    "🟢": { status: "online",    label: "Online"            },
    "🔴": { status: "dnd",       label: "Do Not Disturb"    },
    "⚫": { status: "invisible", label: "Invisible (Offline)" },
};

/* =========================
   REACTION ROLES CONFIG
========================= */
const REACTION_ROLES_CHANNEL_ID = "1502771453022699630";

// Message IDs set after b!reactionroles posts them
let rrGenderMessageId = null;
let rrAgeMessageId    = null;
let rrRegionMessageId = null;

//
// Emoji ID  →  { roleId, name }
//
// ORDER matches what you gave me:
//   20+          :00DNSbow:     1502778001769631745  →  role 1502771231223582731
//   15-18        :emoji_5:      1502778012213710949  →  role 1502771190526119936
//   10-14        :DNSheartbow:  1502778033537417407  →  role 1502771141079732244
//   south america :emoji_1:    1502778046304878744  →  role 1502770523179057292
//   north america :emoji_2:    1502778059785502751  →  role 1502770341808701450
//   australia    :ggbunnyfgg:   1502778101526958261  →  role 1502770017970946089
//   africa       :ggbunnyfg~1:  1502778167423668484  →  role 1502769963545526523
//   asia         :ggbunnyfg~2:  1502778184171520111  →  role 1502769868116725840
//   europe       :ggbunnyfg:    1502778200974168244  →  role 1502769820418969761
//   female       :emoji_6:      1502778219869507635  →  role 1502769746867781642
//   male         :emoji_4:      1502778264693899334  →  role 1502769692190707882
//

const GENDER_ROLES = {
    "1501488390925844540": { roleId: "1502769692190707882", name: "male",   emojiName: "emoji_6"  },
    "1501488340875214908": { roleId: "1502769746867781642", name: "female", emojiName: "emoji_4"  },
};

const AGE_ROLES = {
    "1502342189676498954": { roleId: "1502771231223582731", name: "20+",   emojiName: "00DNSbow"    },
    "1501488372068388875": { roleId: "1502771190526119936", name: "15-18", emojiName: "emoji_5"     },
    "1502341755561971762": { roleId: "1502771141079732244", name: "10-14", emojiName: "DNSheartbow" },
};

const REGION_ROLES = {
    "1501488286735007814": { roleId: "1502770523179057292", name: "south america", emojiName: "emoji_1"    },
    "1501488303256375338": { roleId: "1502770341808701450", name: "north america", emojiName: "emoji_2"    },
    "1501488322046857286": { roleId: "1502770017970946089", name: "australia",     emojiName: "emoji_3"    },
    "1502341368767582259": { roleId: "1502769963545526523", name: "africa",        emojiName: "ggbunnyfg"  },
    "1502341151078744214": { roleId: "1502769868116725840", name: "asia",          emojiName: "ggbunnyfg"  },
    "1502341755561971762": { roleId: "1502769820418969761", name: "europe",        emojiName: "DNSheartbow" },
};

/* Helper: returns the correct Discord emoji string, fetching from API if not cached */
async function emojiStr(guild, emojiId) {
    let e = guild.emojis.cache.get(emojiId);
    if (!e) {
        try { e = await guild.emojis.fetch(emojiId); } catch (_) {}
    }
    if (!e) return `❓`;
    return e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
}

/* Posts the 3 kawaii reaction role embeds */
async function postReactionRoleEmbeds(channel, guild) {
    // Force-fetch ALL guild emojis into cache first
    await guild.emojis.fetch();

    // ── EMBED 1 — Gender ──────────────────────────────────────────────
    const genderEmbed = new EmbedBuilder()
        .setColor("#ffc0cb")
        .setTitle("♡ gender ♡")
        .setDescription(
            `*ₓ˚. ୭ pick ur gender below ˚₊‧꩜ .*\n\n` +
            `${await emojiStr(guild, "1501488340875214908")}  ·  <@&1502769746867781642>\n` +
            `${await emojiStr(guild, "1501488390925844540")}  ·  <@&1502769692190707882>`
        )
        .setFooter({ text: "♡ react to get ur role · unreact to remove it ♡" });

    const genderMsg = await channel.send({ embeds: [genderEmbed] });
    rrGenderMessageId = genderMsg.id;

    for (const [emojiId] of Object.entries(GENDER_ROLES)) {
        const e = guild.emojis.cache.get(emojiId);
        if (e) await genderMsg.react(e);
    }

    // ── EMBED 2 — Age ─────────────────────────────────────────────────
    const ageEmbed = new EmbedBuilder()
        .setColor("#ffc0cb")
        .setTitle("♡ age ♡")
        .setDescription(
            `*ₓ˚. ୭ pick ur age range below ˚₊‧꩜ .*\n\n` +
            `${await emojiStr(guild, "1502342189676498954")}  ·  <@&1502771231223582731>\n` +
            `${await emojiStr(guild, "1501488372068388875")}  ·  <@&1502771190526119936>\n` +
            `${await emojiStr(guild, "1502341755561971762")}  ·  <@&1502771141079732244>`
        )
        .setFooter({ text: "♡ react to get ur role · unreact to remove it ♡" });

    const ageMsg = await channel.send({ embeds: [ageEmbed] });
    rrAgeMessageId = ageMsg.id;

    for (const [emojiId] of Object.entries(AGE_ROLES)) {
        const e = guild.emojis.cache.get(emojiId);
        if (e) await ageMsg.react(e);
    }

    // ── EMBED 3 — Region ──────────────────────────────────────────────
    const regionEmbed = new EmbedBuilder()
        .setColor("#ffc0cb")
        .setTitle("♡ region ♡")
        .setDescription(
            `*ₓ˚. ୭ pick ur region below ˚₊‧꩜ .*\n\n` +
            `${await emojiStr(guild, "1501488286735007814")}  ·  <@&1502770523179057292>\n` +
            `${await emojiStr(guild, "1501488303256375338")}  ·  <@&1502770341808701450>\n` +
            `${await emojiStr(guild, "1501488322046857286")}  ·  <@&1502770017970946089>\n` +
            `${await emojiStr(guild, "1502341368767582259")}  ·  <@&1502769963545526523>\n` +
            `${await emojiStr(guild, "1502341151078744214")}  ·  <@&1502769868116725840>\n` +
            `${await emojiStr(guild, "1502341755561971762")}  ·  <@&1502769820418969761>`
        )
        .setFooter({ text: "♡ react to get ur role · unreact to remove it ♡" });

    const regionMsg = await channel.send({ embeds: [regionEmbed] });
    rrRegionMessageId = regionMsg.id;

    for (const [emojiId] of Object.entries(REGION_ROLES)) {
        const e = guild.emojis.cache.get(emojiId);
        if (e) await regionMsg.react(e);
    }

    console.log("✅ Reaction role embeds posted.");
}

/* =========================
   KEEP-ALIVE SERVER
========================= */
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is alive!");
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Keep-alive server running on port ${PORT}`));

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
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
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
        fields.push({
            name: `${OWNER_TOGGLE_EMOJIS[i]} ${name}`,
            value: notifyPrefs[ownerId] ? "✅ Receiving DMs" : "❌ DMs Off",
            inline: false,
        });
    }
    return new EmbedBuilder()
        .setColor("#ffc0cb")
        .setTitle("♡ Owner Notifications ♡")
        .setDescription("React with 1️⃣ 2️⃣ 3️⃣ to toggle DM notifications on/off.\n\n**✅ = receiving DMs** | **❌ = DMs off**")
        .addFields(fields)
        .setFooter({ text: "Owner-only • Toggles on react" })
        .setTimestamp();
}

/* =========================
   ANTINUKE HELPERS
========================= */
function trackNukeAction(userId, guild, actionLabel) {
    if (!antinukeEnabled) return;
    if (OWNERS.includes(userId)) return;

    if (!nukeTracker[userId]) {
        nukeTracker[userId] = 0;
        setTimeout(() => { delete nukeTracker[userId]; }, NUKE_WINDOW);
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
        const rolesToRemove = member.roles.cache.filter((r) => r.id !== guild.id);
        await member.roles.remove(rolesToRemove);
        await dmOwners(
            `🚨 **ANTINUKE TRIGGERED**\nUser <@${userId}> performed **${actionLabel}** rapidly (${NUKE_THRESHOLD}+ times in ${NUKE_WINDOW / 1000}s).\nAll their roles have been stripped automatically.`
        );
    } catch (err) {
        console.error("Antinuke failed to strip roles:", err);
        await dmOwners(`🚨 **ANTINUKE ALERT** — <@${userId}> is nuking (${actionLabel}) but I couldn't strip their roles. Check permissions!`);
    }
}

/* =========================
   CRASH HANDLERS
========================= */
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    try { await dmOwners(`⚠️ **Bot crashed!**\n\`\`\`${err.message}\`\`\`\nIt will restart automatically.`); } catch (_) {}
    process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled Rejection:", reason);
    try { await dmOwners(`⚠️ **Bot error (unhandled rejection):**\n\`\`\`${reason}\`\`\``); } catch (_) {}
});

/* =========================
   ANTINUKE — BAN DETECTION
========================= */
client.on("guildBanAdd", async (ban) => {
    if (!antinukeEnabled) return;
    try {
        await new Promise((r) => setTimeout(r, 500));
        const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const entry = logs.entries.first();
        if (!entry) return;
        trackNukeAction(entry.executor.id, ban.guild, "mass ban");
    } catch (err) { console.error("Antinuke ban check error:", err); }
});

/* =========================
   ANTINUKE — KICK DETECTION
========================= */
client.on("guildMemberRemove", async (member) => {
    if (!antinukeEnabled) return;
    try {
        await new Promise((r) => setTimeout(r, 500));
        const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
        const entry = logs.entries.first();
        if (!entry || entry.target.id !== member.id) return;
        if (Date.now() - entry.createdTimestamp > 3000) return;
        trackNukeAction(entry.executor.id, member.guild, "mass kick");
    } catch (err) { console.error("Antinuke kick check error:", err); }
});

/* =========================
   MAKEGIF HELPERS
========================= */
function downloadToTemp(url, ext) {
    return new Promise((resolve, reject) => {
        const tmpPath = path.join(os.tmpdir(), `makegif_in_${Date.now()}${ext}`);
        const file = fs.createWriteStream(tmpPath);
        const proto = url.startsWith("https") ? https : http;
        proto.get(url, (res) => {
            res.pipe(file);
            file.on("finish", () => file.close(() => resolve(tmpPath)));
        }).on("error", (err) => { fs.unlink(tmpPath, () => {}); reject(err); });
    });
}

function runMakegif(inputPath, caption) {
    return new Promise((resolve, reject) => {
        const outPath = path.join(os.tmpdir(), `makegif_out_${Date.now()}.gif`);
        const scriptPath = path.join(__dirname, "makegif.py");
        const args = [scriptPath, inputPath, outPath];
        if (caption) args.push(caption);
        execFile("python3", args, { timeout: 30000 }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            stdout.startsWith("OK:") ? resolve(outPath) : reject(new Error(stdout || "Unknown error from makegif.py"));
        });
    });
}

/* =========================
   READY EVENT
========================= */
client.once("clientReady", async () => {
    console.log(`${client.user.tag} is online`);

    client.user.setPresence({
        status: "dnd",
        activities: [{ name: "Verification in progress on /banilla", type: 0 }],
    });

    await dmOwners(`✅ **Bot is back online!**\n${client.user.tag} just started up successfully.`);

    try {
        const channel = await client.channels.fetch(VERIFY_CHANNEL_ID);
        const guild = channel.guild;
        const msg = await channel.messages.fetch(VERIFY_MESSAGE_ID, { force: true });

        const ruleEmoji   = guild.emojis.cache.get(RULE_EMOJI_ID);
        const verifyEmoji = guild.emojis.cache.get(VERIFY_EMOJI_ID);

        if (!msg.reactions.cache.has(VERIFY_EMOJI_ID)) {
            if (verifyEmoji) { await msg.react(verifyEmoji); console.log(`✅ Reacted with :${verifyEmoji.name}:`); }
            else             { await msg.react("✅");        console.log("✅ Reacted with fallback emoji"); }
        }

        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Server Rules & Verification ♡")
            .setImage(DIVIDER_GIF_URL)
            .setDescription(
                `\n${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no gore or nsfw\n& no leaking or doxxing\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no harassment, threats,\nor hate speech\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no self-promotion,\nor spamming\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} no raiding or sending other serv minions in here to "spy"\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} don't start drama in the serv\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} please show respect to\nall staff & members\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} reach out to us if you have\nany issues or concerns\n\n` +
                `${ruleEmoji ? `<a:${ruleEmoji.name}:${ruleEmoji.id}>` : "📌"} this server is owned by ${OWNERS.map((id) => `<@${id}>`).join(" & ")}\n\n||@everyone||`
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

    // Savage mode
    if (savageMode && message.mentions.has(client.user)) {
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        return message.reply(roast);
    }

    const rawContent = message.content.trim();
    const content    = rawContent.toLowerCase();

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
        const isRare    = Math.random() < 1 / 6;
        const roastText = isRare
            ? rareRoasts[Math.floor(Math.random() * rareRoasts.length)]
            : `<@${target.id}> ${ROASTS[Math.floor(Math.random() * ROASTS.length)]}`;

        try { await message.delete(); } catch (_) {}
        await message.channel.send(roastText);
        return;
    }

    /* --- b!ban @member|userid [message] --- */
    if (content.startsWith("b!ban")) {
        if (!OWNERS.includes(message.author.id)) return;

        const args = rawContent.slice("b!ban".length).trim();
        if (!args) return message.reply("❌ Usage: `b!ban @user [message]` or `b!ban <userid> [message]`");

        let targetId = null, dmMessage = "";
        const mentionMatch = args.match(/^<@!?(\d+)>(.*)/s);
        const idMatch      = args.match(/^(\d{17,20})(.*)/s);

        if      (mentionMatch) { targetId = mentionMatch[1]; dmMessage = mentionMatch[2].trim(); }
        else if (idMatch)      { targetId = idMatch[1];      dmMessage = idMatch[2].trim(); }
        else return message.reply("❌ Couldn't find a valid user. Use `b!ban @user` or `b!ban <userid>`");

        try {
            let targetUser = null;
            try { targetUser = await client.users.fetch(targetId); } catch (_) {}
            if (dmMessage && targetUser) { try { await targetUser.send(dmMessage); } catch (_) {} }

            await message.guild.bans.create(targetId, { reason: dmMessage || "No reason provided." });

            const embed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("🔨 Member Banned")
                .addFields(
                    { name: "User",               value: targetUser ? `${targetUser.tag} (<@${targetId}>)` : `<@${targetId}>`, inline: true },
                    { name: "Message sent to them", value: dmMessage || "None", inline: false },
                )
                .setTimestamp();
            await message.channel.send({ embeds: [embed] });
            try { await message.delete(); } catch (_) {}
        } catch (err) {
            await message.reply(`❌ Failed to ban: \`${err.message}\``);
        }
        return;
    }

    /* --- b!makegif --- */
    if (content.startsWith("b!makegif")) {
        const afterCmd   = rawContent.slice("b!makegif".length).trim();
        const bracketMatch = afterCmd.match(/^\[(.+)\]$/);
        const caption    = bracketMatch ? bracketMatch[1].trim() : afterCmd;

        if (!message.reference) return message.reply("❌ Reply to a message, image, or GIF with `b!makegif`.");

        const targetMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
        if (!targetMsg) return message.reply("❌ Couldn't find the replied message.");

        await message.channel.sendTyping();

        let mediaUrl = null, mediaExt = ".png";
        const attachment = targetMsg.attachments.find((a) => /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(a.url));
        if (attachment) {
            mediaUrl = attachment.url;
            const extMatch = attachment.url.match(/\.(png|jpg|jpeg|webp|gif)/i);
            mediaExt = extMatch ? `.${extMatch[1].toLowerCase()}` : ".png";
        }
        if (!mediaUrl) {
            const embed = targetMsg.embeds.find((e) => e.image || e.thumbnail);
            if (embed) {
                const imgData = embed.image || embed.thumbnail;
                mediaUrl = imgData.url;
                const extMatch = mediaUrl.match(/\.(png|jpg|jpeg|webp|gif)/i);
                mediaExt = extMatch ? `.${extMatch[1].toLowerCase()}` : ".png";
            }
        }

        let inputPath = null, avatarPath = null, outputPath = null;
        try {
            outputPath = path.join(os.tmpdir(), `makegif_out_${Date.now()}.gif`);
            const scriptPath = path.join(__dirname, "makegif.py");

            if (mediaUrl) {
                inputPath = await downloadToTemp(mediaUrl, mediaExt);
                await new Promise((resolve, reject) => {
                    const args = ["image", inputPath, outputPath];
                    if (caption) args.push(caption);
                    require("child_process").execFile("python3", [scriptPath, ...args], { timeout: 30000 }, (err, stdout, stderr) => {
                        if (err) return reject(new Error(stderr || err.message));
                        stdout.startsWith("OK:") ? resolve() : reject(new Error(stdout));
                    });
                });
            } else {
                const msgText  = targetMsg.content || "[no text]";
                const author   = targetMsg.author;
                const username = targetMsg.member?.displayName || author.username;
                const avatarUrl = author.displayAvatarURL({ extension: "png", size: 128 });
                avatarPath = await downloadToTemp(avatarUrl, ".png");
                await new Promise((resolve, reject) => {
                    const args = [scriptPath, "text", outputPath, username, avatarPath, msgText];
                    require("child_process").execFile("python3", args, { timeout: 30000 }, (err, stdout, stderr) => {
                        if (err) return reject(new Error(stderr || err.message));
                        stdout.startsWith("OK:") ? resolve() : reject(new Error(stdout));
                    });
                });
            }

            const att = new AttachmentBuilder(outputPath, { name: "output.gif" });
            await message.reply({ files: [att] });
        } catch (err) {
            console.error("b!makegif error:", err);
            await message.reply(`❌ Failed to make GIF: \`${err.message}\``);
        } finally {
            if (inputPath)  fs.unlink(inputPath,  () => {});
            if (avatarPath) fs.unlink(avatarPath, () => {});
            if (outputPath) fs.unlink(outputPath, () => {});
        }
        return;
    }

    // ── Owner-only commands below ──────────────────────────────────────
    if (!OWNERS.includes(message.author.id)) return;

    /* --- b!help --- */
    if (content === "b!help") {
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Owner Commands ♡")
            .setDescription("All commands below are **owner-only**.")
            .addFields(
                { name: "b!help",                          value: "Shows this list.", inline: false },
                { name: "b!status",                        value: "Bot status, ping, uptime.", inline: false },
                { name: "b!restart",                       value: "Restarts the bot.", inline: false },
                { name: "b!stop",                          value: "Stops the bot.", inline: false },
                { name: "b!maintenance on/off",            value: "Toggles maintenance mode.", inline: false },
                { name: "b!antinuke on/off",               value: "Toggles antinuke protection.", inline: false },
                { name: "b!lock",                          value: "Locks the current channel.", inline: false },
                { name: "b!unlock",                        value: "Unlocks the current channel.", inline: false },
                { name: "b!changestatus",                  value: "Change bot status via react.", inline: false },
                { name: "b!notifications",                 value: "Toggle DM notifications per owner.", inline: false },
                { name: "b!testdms",                       value: "Sends a test DM to you.", inline: false },
                { name: "b!crashtest",                     value: "Sends all 3 test DMs to owners.", inline: false },
                { name: "b!savage on/off",                 value: "Toggles savage mode.", inline: false },
                { name: "b!roast @member",                 value: "Roasts the mentioned member.", inline: false },
                { name: "b!ban @member|userid [message]",  value: "Bans by mention or user ID.", inline: false },
                { name: "b!makegif [caption]",             value: "Reply to image/GIF to convert it to a GIF.", inline: false },
                { name: "b!reactionroles",                 value: "Posts the 3 reaction role embeds (gender, age, region) in the roles channel.", inline: false },
            )
            .setFooter({ text: "Only server owners can use these commands" })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }

    /* --- b!status --- */
    if (content === "b!status") {
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("🤖 Bot Status")
            .addFields(
                { name: "🟢 Status",      value: "Online",                                     inline: true  },
                { name: "📶 Ping",        value: `${client.ws.ping}ms`,                        inline: true  },
                { name: "⏱️ Uptime",      value: formatUptime(Date.now() - startTime),          inline: true  },
                { name: "🕐 Started At",  value: `${new Date(startTime).toLocaleString("en-US", { timeZone: "UTC" })} UTC`, inline: false },
                { name: "🔧 Maintenance", value: maintenanceMode ? "🔴 ON" : "🟢 OFF",          inline: true  },
                { name: "🛡️ Antinuke",   value: antinukeEnabled ? "🟢 ON" : "🔴 OFF",          inline: true  },
            )
            .setFooter({ text: "Owner-only command" })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }

    /* --- b!restart --- */
    if (content === "b!restart") {
        await message.reply("🔄 Restarting bot... it will be back online in a few seconds.");
        await dmOwners("🔄 **Bot is restarting** — triggered manually by an owner.");
        setTimeout(() => process.exit(0), 2000);
    }

    /* --- b!stop --- */
    if (content === "b!stop") {
        await message.reply("🛑 Stopping bot... it will come back online automatically in a few seconds.");
        await dmOwners("🛑 **Bot was stopped** — triggered manually by an owner. Coming back shortly.");
        setTimeout(() => process.exit(0), 2000);
    }

    /* --- b!maintenance --- */
    if (content === "b!maintenance on" || content === "b!maintenance off") {
        maintenanceMode = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(maintenanceMode
                ? "🔧 **Maintenance mode ON** — verification is paused."
                : "✅ **Maintenance mode OFF** — verification is back to normal.")
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        await dmOwners(`🔧 **Maintenance mode ${maintenanceMode ? "enabled" : "disabled"}** by an owner.`);
    }

    /* --- b!antinuke --- */
    if (content === "b!antinuke on" || content === "b!antinuke off") {
        antinukeEnabled = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(antinukeEnabled
                ? "🛡️ **Antinuke ON** — roles stripped on mass ban/kick."
                : "⚠️ **Antinuke OFF** — mass action protection is disabled.")
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }

    /* --- b!lock --- */
    if (content === "b!lock") {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            const vr = message.guild.roles.cache.get(VERIFIED_ROLE_ID);
            if (vr) await message.channel.permissionOverwrites.edit(vr, { SendMessages: false });
            for (const id of STAFF_ROLE_IDS) {
                const sr = message.guild.roles.cache.get(id);
                if (sr) await message.channel.permissionOverwrites.edit(sr, { SendMessages: true });
            }
            const embed = new EmbedBuilder().setColor("#ff0000").setDescription("🔒 **Channel locked** — only staff can send messages here.").setTimestamp();
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            await message.author.send(`❌ **b!lock failed:**\n\`\`\`${err.message}\`\`\``).catch(() => {});
        }
    }

    /* --- b!unlock --- */
    if (content === "b!unlock") {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
            const vr = message.guild.roles.cache.get(VERIFIED_ROLE_ID);
            if (vr) await message.channel.permissionOverwrites.edit(vr, { SendMessages: null });
            for (const id of STAFF_ROLE_IDS) {
                const sr = message.guild.roles.cache.get(id);
                if (sr) await message.channel.permissionOverwrites.edit(sr, { SendMessages: null });
            }
            const embed = new EmbedBuilder().setColor("#00ff00").setDescription("🔓 **Channel unlocked** — everyone can send messages again.").setTimestamp();
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            await message.author.send(`❌ **b!unlock failed:**\n\`\`\`${err.message}\`\`\``).catch(() => {});
        }
    }

    /* --- b!changestatus --- */
    if (content === "b!changestatus") {
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setTitle("♡ Change Bot Status ♡")
            .setDescription("🟢 — **Online**\n🔴 — **Do Not Disturb**\n⚫ — **Invisible (Offline)**\n\nReact below to change.")
            .setFooter({ text: "Owner-only • Auto-deletes after 60s" });
        const statusMsg = await message.channel.send({ embeds: [embed] });
        statusMenuMessageId = statusMsg.id;
        await statusMsg.react("🟢");
        await statusMsg.react("🔴");
        await statusMsg.react("⚫");
        setTimeout(async () => {
            if (statusMenuMessageId === statusMsg.id) {
                statusMenuMessageId = null;
                try { await statusMsg.delete(); } catch (_) {}
            }
        }, 60000);
    }

    /* --- b!notifications --- */
    if (content === "b!notifications") {
        const embed = await buildNotifyEmbed();
        const notifyMsg = await message.channel.send({ embeds: [embed] });
        notifyMenuMessageId = notifyMsg.id;
        for (const emoji of OWNER_TOGGLE_EMOJIS) await notifyMsg.react(emoji);
    }

    /* --- b!testdms --- */
    if (content === "b!testdms") {
        if (!notifyPrefs[message.author.id]) {
            await message.reply("❌ Your notifications are currently **off**. Turn them on with `b!notifications` first.");
            return;
        }
        try {
            await message.author.send("🔔 **THIS IS A TEST**\nIf you received this, your DM notifications are working correctly!");
            await message.reply("✅ Test DM sent to you!");
        } catch {
            await message.reply("❌ Could not send you a DM — make sure your DMs are open.");
        }
    }

    /* --- b!savage --- */
    if (content === "b!savage on" || content === "b!savage off") {
        savageMode = content.endsWith("on");
        const embed = new EmbedBuilder()
            .setColor("#ffc0cb")
            .setDescription(savageMode
                ? "😈 **Savage mode ON** — I'll roast anyone who pings me."
                : "😇 **Savage mode OFF** — I'll ignore pings like a normal bot.")
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }

    /* --- b!crashtest --- */
    if (content === "b!crashtest") {
        await message.reply("📨 Sending all 3 test DMs to owners now...");
        await dmOwners("✅ **[TEST] Bot Restart Notification**\nThis is what you'll receive every time the bot starts up or restarts successfully.");
        await dmOwners("⚠️ **[TEST] Bot Crash Notification**\n\`\`\`Error: Something went terribly wrong!\`\`\`\nThis is what you'll receive if the bot crashes. It will restart automatically.");
        await dmOwners("⚠️ **[TEST] Internal Error Notification**\n\`\`\`UnhandledPromiseRejection: Cannot read properties of undefined\`\`\`");
        await message.reply("✅ All 3 test DMs sent to all owners!");
    }

    /* =========================
       b!reactionroles
       Posts all 3 kawaii reaction role embeds in the roles channel.
    ========================= */
    if (content === "b!reactionroles") {
        try {
            const rrChannel = await client.channels.fetch(REACTION_ROLES_CHANNEL_ID);
            await postReactionRoleEmbeds(rrChannel, rrChannel.guild);
            await message.reply("✅ Reaction role embeds posted in <#" + REACTION_ROLES_CHANNEL_ID + ">!");
        } catch (err) {
            console.error("b!reactionroles error:", err);
            await message.reply(`❌ Failed to post reaction roles: \`${err.message}\``);
        }
    }
});

/* =========================
   REACTION ADD HANDLER
========================= */
client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial)         await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const msgId   = reaction.message.id;
        const emojiId = reaction.emoji.id; // null for standard unicode emojis

        /* --- Notification toggle menu --- */
        if (notifyMenuMessageId && msgId === notifyMenuMessageId && OWNERS.includes(user.id)) {
            const idx = OWNER_TOGGLE_EMOJIS.indexOf(reaction.emoji.name);
            if (idx !== -1) {
                const targetId = OWNERS[idx];
                notifyPrefs[targetId] = !notifyPrefs[targetId];
                const updatedEmbed = await buildNotifyEmbed();
                await reaction.message.edit({ embeds: [updatedEmbed] });
                try { await reaction.users.remove(user.id); } catch (_) {}
            }
            return;
        }

        /* --- Status change menu --- */
        if (statusMenuMessageId && msgId === statusMenuMessageId && OWNERS.includes(user.id)) {
            const chosen = STATUS_EMOJIS[reaction.emoji.name];
            if (chosen) {
                client.user.setPresence({ status: chosen.status, activities: [{ name: "Verification in progress on /banilla", type: 0 }] });
                statusMenuMessageId = null;
                try { await reaction.message.delete(); } catch (_) {}
                const confirmEmbed = new EmbedBuilder().setColor("#ffc0cb").setDescription(`${reaction.emoji.name} Bot status changed to **${chosen.label}**`).setTimestamp();
                const confirm = await reaction.message.channel.send({ embeds: [confirmEmbed] });
                setTimeout(() => confirm.delete().catch(() => {}), 5000);
            }
            return;
        }

        /* =========================
           REACTION ROLES — ADD ROLE
        ========================= */
        if (emojiId) {
            const guild  = reaction.message.guild;
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

            // Gender (exclusive)
            if (msgId === rrGenderMessageId && GENDER_ROLES[emojiId]) {
                const { roleId } = GENDER_ROLES[emojiId];
                for (const [, d] of Object.entries(GENDER_ROLES)) {
                    if (d.roleId !== roleId && member.roles.cache.has(d.roleId))
                        await member.roles.remove(d.roleId).catch(() => {});
                }
                await member.roles.add(roleId).catch(() => {});
                return;
            }

            // Age (exclusive)
            if (msgId === rrAgeMessageId && AGE_ROLES[emojiId]) {
                const { roleId } = AGE_ROLES[emojiId];
                for (const [, d] of Object.entries(AGE_ROLES)) {
                    if (d.roleId !== roleId && member.roles.cache.has(d.roleId))
                        await member.roles.remove(d.roleId).catch(() => {});
                }
                await member.roles.add(roleId).catch(() => {});
                return;
            }

            // Region (exclusive)
            if (msgId === rrRegionMessageId && REGION_ROLES[emojiId]) {
                const { roleId } = REGION_ROLES[emojiId];
                for (const [, d] of Object.entries(REGION_ROLES)) {
                    if (d.roleId !== roleId && member.roles.cache.has(d.roleId))
                        await member.roles.remove(d.roleId).catch(() => {});
                }
                await member.roles.add(roleId).catch(() => {});
                return;
            }
        }

        /* --- Verification system --- */
        if (msgId !== VERIFY_MESSAGE_ID) return;

        if (maintenanceMode) {
            try { await user.send("🔧 **Verification is temporarily paused for maintenance.** Please try again in a little while!"); } catch (_) {}
            return;
        }

        if (reaction.emoji.id !== VERIFY_EMOJI_ID) return;

        const guild  = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        if (!member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await member.roles.add(VERIFIED_ROLE_ID);
            if (member.roles.cache.has(UNVERIFIED_ROLE_ID)) await member.roles.remove(UNVERIFIED_ROLE_ID);
            try { await user.send("✅ You are now verified!"); } catch (_) {}
            console.log(`✅ Verified ${user.tag}`);
        }
    } catch (err) {
        console.error("Reaction add handler error:", err);
    }
});

/* =========================
   REACTION REMOVE HANDLER
========================= */
client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial)         await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const msgId   = reaction.message.id;
        const emojiId = reaction.emoji.id;

        /* =========================
           REACTION ROLES — REMOVE ROLE
        ========================= */
        if (emojiId) {
            const guild  = reaction.message.guild;
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

            if (msgId === rrGenderMessageId && GENDER_ROLES[emojiId]) {
                await member.roles.remove(GENDER_ROLES[emojiId].roleId).catch(() => {});
                return;
            }
            if (msgId === rrAgeMessageId && AGE_ROLES[emojiId]) {
                await member.roles.remove(AGE_ROLES[emojiId].roleId).catch(() => {});
                return;
            }
            if (msgId === rrRegionMessageId && REGION_ROLES[emojiId]) {
                await member.roles.remove(REGION_ROLES[emojiId].roleId).catch(() => {});
                return;
            }
        }

        /* --- Unverify --- */
        if (msgId !== VERIFY_MESSAGE_ID) return;
        if (reaction.emoji.id !== VERIFY_EMOJI_ID) return;

        const guild  = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await member.roles.remove(VERIFIED_ROLE_ID);
            await member.roles.add(UNVERIFIED_ROLE_ID);
            try { await user.send("❌ You have been unverified. React again to re-verify."); } catch (_) {}
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