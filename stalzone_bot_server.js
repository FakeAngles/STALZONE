require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionsBitField, SlashCommandBuilder, Routes, InteractionReplyFlags } = require('discord.js');
const { REST } = require('@discordjs/rest');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const MAIN_GUILD_ID = process.env.MAIN_GUILD_ID;
const MSK_OFFSET = 3 * 60 * 60 * 1000;

const SETTINGS_PATH = path.join(__dirname, 'settings.json');
let serverSettings = new Map();
if (fs.existsSync(SETTINGS_PATH)) serverSettings = new Map(JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')));

function saveSettings() { fs.writeFileSync(SETTINGS_PATH, JSON.stringify([...serverSettings], null, 2), 'utf8'); }

const commands = [
    new SlashCommandBuilder().setName('settime').setDescription('Установить расписание для событий').addStringOption(option => option.setName('тип').setDescription('Тип события (выброс или пробой)').setRequired(true).addChoices({ name: 'выброс', value: 'vibros' }, { name: 'пробой', value: 'proboi' })).addStringOption(option => option.setName('время').setDescription('Время в формате HH:MM').setRequired(true)),
    new SlashCommandBuilder().setName('setchannel').setDescription('Установить канал для уведомлений').addChannelOption(option => option.setName('канал').setDescription('Канал для уведомлений').setRequired(true)),
    new SlashCommandBuilder().setName('setaccess').setDescription('Выдать или забрать доступ к командам').addUserOption(option => option.setName('пользователь').setDescription('Пользователь').setRequired(true)).addBooleanOption(option => option.setName('доступ').setDescription('True - выдать доступ, False - забрать доступ').setRequired(true)),
    new SlashCommandBuilder().setName('setping').setDescription('Установить или убрать пинг роли для уведомлений').addStringOption(option => option.setName('тип').setDescription('Тип события (выброс или пробой)').setRequired(true).addChoices({ name: 'выброс', value: 'vibros' }, { name: 'пробой', value: 'proboi' })).addRoleOption(option => option.setName('роль').setDescription('Роль для пинга').setRequired(true)).addBooleanOption(option => option.setName('действие').setDescription('True - добавить пинг, False - убрать пинг').setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Команды зарегистрированы.');
    } catch (error) {
        console.error('Ошибка регистрации команд:', error);
    }
})();

function getDiscordExactTime(date) { return `<t:${Math.floor(date.getTime() / 1000)}:t>`; }
function timeDifference(time) {
    const diff = time - new Date();
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return diff < 0 ? `${Math.abs(minutes)}m ago` : `${minutes}:${seconds.toString().padStart(2, '0')} left`;
}

function updateTimer(message, eruptionTime, damageBeginsTime, artifactsSpawnTime, safeToLeaveTime) {
    setInterval(() => {
        const updatedMessage = {
            embeds: [{
                title: "В Зоне произошел Выброс!",
                color: 0xff0000,
                fields: [
                    { name: "Время выброса", value: `${getDiscordExactTime(eruptionTime)} (${timeDifference(eruptionTime)})`, inline: true },
                    { name: "Урон начнется через", value: `${getDiscordExactTime(damageBeginsTime)} (${timeDifference(damageBeginsTime)})`, inline: true },
                    { name: "Время спавна артефактов", value: `${getDiscordExactTime(artifactsSpawnTime)} (${timeDifference(artifactsSpawnTime)})`, inline: true },
                    { name: "Выброс кончится через", value: `${getDiscordExactTime(safeToLeaveTime)} (${timeDifference(safeToLeaveTime)})`, inline: true }
                ],
                image: { url: serverSettings.get(message.guild.id)?.imageUrl || 'https://images-ext-1.discordapp.net/external/aUBbBqUlqoswDDWH_2OVH9nW2xTjR6X2BAuWB1roLzY/%3Fformat%3Dwebp%26quality%3Dlossless/https/images-ext-1.discordapp.net/external/2sHr-dHIDH04hw4-J4uc2XbU_ryXX9_SpFnvToTnOvg/%253Fformat%253Dwebp%2526quality%253Dlossless%2526width%253D628%2526height%253D471/https/images-ext-1.discordapp.net/external/4t9fct6DamlqEUAxJZZ6Z4Je0HrLAbKodWERZVFoEWc/https/cdn.stalcrafthq.com/img/emissions/Blowout.png?format=webp&quality=lossless&width=859&height=644' },
                footer: { text: "STALZONE" }
            }]
        };
        message.edit(updatedMessage).catch(console.error);
    }, 5000);
}

async function sendEruptionMessage(channel) {
    if (!channel) {
        console.error('Канал для уведомлений не найден.');
        return;
    }

    const now = new Date();
    const eruptionTime = new Date(now);
    const damageBeginsTime = new Date(eruptionTime.getTime() + 1 * 60 * 1000);
    const safeToLeaveTime = new Date(eruptionTime.getTime() + 5 * 60 * 1000);
    const artifactsSpawnTime = new Date(safeToLeaveTime.getTime() + 10 * 60 * 1000);

    const roleId = serverSettings.get(channel.guild.id)?.pingRoles?.vibros;
    const role = roleId ? channel.guild.roles.cache.get(roleId) : null;
    const roleMention = role ? `<@&${role.id}>` : '';

    const MESSAGE = {
        content: roleMention,
        embeds: [{
            title: "В Зоне произошел Выброс!",
            color: 0xff0000,
            fields: [
                { name: "Время выброса", value: `${getDiscordExactTime(eruptionTime)} (${timeDifference(eruptionTime)})`, inline: true },
                { name: "Урон начнется через", value: `${getDiscordExactTime(damageBeginsTime)} (${timeDifference(damageBeginsTime)})`, inline: true },
                { name: "Время спавна артефактов", value: `${getDiscordExactTime(artifactsSpawnTime)} (${timeDifference(artifactsSpawnTime)})`, inline: true },
                { name: "Выброс кончится через", value: `${getDiscordExactTime(safeToLeaveTime)} (${timeDifference(safeToLeaveTime)})`, inline: true }
            ],
            image: { url: serverSettings.get(channel.guild.id)?.imageUrl || 'https://images-ext-1.discordapp.net/external/aUBbBqUlqoswDDWH_2OVH9nW2xTjR6X2BAuWB1roLzY/%3Fformat%3Dwebp%26quality%3Dlossless/https/images-ext-1.discordapp.net/external/2sHr-dHIDH04hw4-J4uc2XbU_ryXX9_SpFnvToTnOvg/%253Fformat%253Dwebp%2526quality%253Dlossless%2526width%253D628%2526height%253D471/https/images-ext-1.discordapp.net/external/4t9fct6DamlqEUAxJZZ6Z4Je0HrLAbKodWERZVFoEWc/https/cdn.stalcrafthq.com/img/emissions/Blowout.png?format=webp&quality=lossless&width=859&height=644' },
            footer: { text: "STALZONE" }
        }]
    };

    const sentMessage = await channel.send(MESSAGE).catch(console.error);
    if (sentMessage) updateTimer(sentMessage, eruptionTime, damageBeginsTime, artifactsSpawnTime, safeToLeaveTime);
}

async function sendProboiMessage(channel) {
    if (!channel) {
        console.error('Канал для уведомлений не найден.');
        return;
    }

    const now = new Date();
    const proboiTime = new Date(now.getTime() + 15 * 60 * 1000);

    const roleId = serverSettings.get(channel.guild.id)?.pingRoles?.proboi;
    const role = roleId ? channel.guild.roles.cache.get(roleId) : null;
    const roleMention = role ? `<@&${role.id}>` : '';

    const MESSAGE = {
        content: roleMention,
        embeds: [{
            title: "В Зоне появился Пробой!",
            color: 0x3498db,
            fields: [{ name: "Пробой исчезнет через", value: `${getDiscordExactTime(proboiTime)} (${timeDifference(proboiTime)})`, inline: true }],
            image: { url: serverSettings.get(channel.guild.id)?.imageUrl || 'https://media.discordapp.net/attachments/1123749113238917273/1330823482652495892/proboi.png?ex=6790b2f3&is=678f6173&hm=8002ab1112ab25b035451b2d45af997c94bbff72956b59e88e36c96c4bf167f2&=&format=webp&quality=lossless&width=565&height=317' },
            footer: { text: "STALZONE" }
        }]
    };

    const sentMessage = await channel.send(MESSAGE).catch(console.error);
    if (sentMessage) updateProboiTimer(sentMessage, proboiTime);
}

function updateProboiTimer(message, proboiTime) {
    setInterval(() => {
        const updatedMessage = {
            embeds: [{
                title: "В Зоне появился Пробой!",
                color: 0x3498db,
                fields: [{ name: "Пробой исчезнет через", value: `${getDiscordExactTime(proboiTime)} (${timeDifference(proboiTime)})`, inline: true }],
                image: { url: serverSettings.get(message.guild.id)?.imageUrl || 'https://media.discordapp.net/attachments/1123749113238917273/1330823482652495892/proboi.png?ex=6790b2f3&is=678f6173&hm=8002ab1112ab25b035451b2d45af997c94bbff72956b59e88e36c96c4bf167f2&=&format=webp&quality=lossless&width=565&height=317' },
                footer: { text: "STALZONE" }
            }]
        };
        message.edit(updatedMessage).catch(console.error);
    }, 5000);
}

function checkAndSendMessages() {
    const now = new Date(Date.now() + MSK_OFFSET);
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const mainGuildSettings = serverSettings.get(MAIN_GUILD_ID);
    if (!mainGuildSettings) return;

    const schedule = mainGuildSettings.schedule || [];
    const proboiSchedule = mainGuildSettings.proboiSchedule || [];

    serverSettings.forEach((settings, guildId) => {
        const channel = client.channels.cache.get(settings.channelId);
        if (!channel) {
            console.error(`Канал для уведомлений на сервере ${guildId} не найден.`);
            return;
        }

        if (schedule.includes(currentTime)) {
            console.log(`Sending eruption message to guild: ${guildId}`);
            sendEruptionMessage(channel);
        }

        if (proboiSchedule.includes(currentTime)) {
            console.log(`Sending proboi message to guild: ${guildId}`);
            sendProboiMessage(channel);
        }

        if (currentTime === "02:00") {
            console.log(`Sending restart notification to guild: ${guildId}`);
            channel.send({
                embeds: [{
                    title: "Уведомление о перезапуске сервера",
                    color: 0xff0000,
                    description: "Сервер будет перезагружен. Пожалуйста, переподключитесь через несколько минут.",
                    footer: { text: "Запланированный перезапуск" }
                }]
            }).catch(console.error);
        }
    });
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const startChecking = () => {
        const now = new Date();
        const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
        setTimeout(() => { checkAndSendMessages(); setInterval(checkAndSendMessages, 60 * 1000); }, delayUntilNextMinute);
    };
    startChecking();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member, guild } = interaction;
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isMainGuild = guild.id === MAIN_GUILD_ID;

    if (commandName === 'setping') {
        if (!isAdmin) return interaction.reply({ content: 'У вас нет прав на использование этой команды.', flags: 64 });

        const type = options.getString('тип');
        const role = options.getRole('роль');
        const action = options.getBoolean('действие');

        if (!serverSettings.has(guild.id)) serverSettings.set(guild.id, { pingRoles: {} });
        if (!serverSettings.get(guild.id).pingRoles) serverSettings.get(guild.id).pingRoles = {};

        if (action) {
            serverSettings.get(guild.id).pingRoles[type] = role.id;
            await interaction.reply({ content: `Пинг роли ${role.name} установлен для ${type}.`, flags: 64 });
        } else {
            delete serverSettings.get(guild.id).pingRoles[type];
            await interaction.reply({ content: `Пинг роли для ${type} убран.`, flags: 64 });
        }

        saveSettings();
        return;
    }

    if (commandName === 'setchannel') {
        if (!isAdmin) return interaction.reply({ content: 'У вас нет прав на использование этой команды.', flags: 64 });

        const channel = options.getChannel('канал');
        if (!serverSettings.has(guild.id)) serverSettings.set(guild.id, {});
        serverSettings.get(guild.id).channelId = channel.id;
        await interaction.reply({ content: `Канал для уведомлений установлен: ${channel.name}`, flags: 64 });
        saveSettings();
        return;
    }

    if (!isMainGuild) return interaction.reply({ content: 'Эта команда доступна только на главном сервере.', flags: 64 });

    if (commandName === 'settime') {
        const type = options.getString('тип');
        const time = options.getString('время');
        const [hours, minutes] = time.split(':').map(Number);

        const schedule = [];
        let nextTime = new Date();
        nextTime.setHours(hours, minutes, 0, 0);

        if (type === 'vibros') {
            if (nextTime < new Date()) nextTime.setDate(nextTime.getDate() + 1);
            for (let i = 0; i < 8; i++) {
                schedule.push(`${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`);
                nextTime.setHours(nextTime.getHours() + 3);
            }
            serverSettings.get(guild.id).schedule = schedule;
        } else if (type === 'proboi') {
            if (nextTime < new Date()) nextTime.setHours(nextTime.getHours() + 1);
            for (let i = 0; i < 24; i++) {
                schedule.push(`${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`);
                nextTime.setHours(nextTime.getHours() + 1);
            }
            serverSettings.get(guild.id).proboiSchedule = schedule;
        }

        await interaction.reply({ content: `Расписание для ${type} установлено: ${schedule.join(', ')}`, flags: 64 });
        saveSettings();
    }

    if (commandName === 'setaccess') {
        const user = options.getUser('пользователь');
        const access = options.getBoolean('доступ');

        if (!serverSettings.has(guild.id)) serverSettings.set(guild.id, { access: [] });
        if (!serverSettings.get(guild.id).access) serverSettings.get(guild.id).access = [];

        const userAccess = serverSettings.get(guild.id).access;
        if (access && !userAccess.includes(user.id)) userAccess.push(user.id);
        if (!access && userAccess.includes(user.id)) userAccess.splice(userAccess.indexOf(user.id), 1);

        serverSettings.get(guild.id).access = userAccess;
        saveSettings();
        await interaction.reply({ content: `Доступ для пользователя ${user.username} ${access ? 'выдан' : 'забран'}.`, flags: 64 });
    }
});

client.login(TOKEN);