const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = '!';

// Event: Bot siap
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} sudah online dan siap mengumumkan!`);
});

// Event: Pesan diterima
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // !help
    if (command === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📢 Bot Announcer Help')
            .setDescription('Daftar perintah yang tersedia:')
            .addFields(
                { name: '`!help`', value: 'Menampilkan daftar perintah ini', inline: true },
                { name: '`!announce <pesan>`', value: 'Kirim pengumuman biasa', inline: true },
                { name: '`!announceembed <pesan>`', value: 'Kirim pengumuman dengan embed cantik', inline: true },
                { name: '`!setup`', value: 'Setup channel pengumuman (Admin Only)', inline: true }
            )
            .setFooter({ text: `Prefix: ${PREFIX}` })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // !setup (Hanya Admin)
    if (command === 'setup') {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ **Hanya Admin yang bisa menggunakan perintah ini!**');
        }

        const channelMention = args[0];
        if (!channelMention || !channelMention.startsWith('<#') || !channelMention.endsWith('>')) {
            return message.reply('❌ **Format salah! Gunakan: `!setup #channel`**');
        }

        const channelId = channelMention.replace(/[<>#]/g, '');
        const channel = client.channels.cache.get(channelId);

        if (!channel) {
            return message.reply('❌ **Channel tidak ditemukan!**');
        }

        // Simpan channel ID ke file (persistent storage)
        const fs = require('fs');
        fs.writeFileSync('./announce-channel.json', JSON.stringify({ channelId: channelId }));

        const setupEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Setup Berhasil!')
            .setDescription(`Pengumuman akan dikirim ke ${channel}`)
            .setTimestamp();

        return message.reply({ embeds: [setupEmbed] });
    }

    // !announce
    if (command === 'announce') {
        const announcement = args.join(' ');
        if (!announcement) {
            return message.reply('❌ **Tulis pesan yang ingin diumumkan!**\n`!announce <pesan>`');
        }

        // Cek apakah sudah di-setup
        const fs = require('fs');
        let announceChannelId;
        try {
            const data = fs.readFileSync('./announce-channel.json', 'utf8');
            announceChannelId = JSON.parse(data).channelId;
        } catch (error) {
            return message.reply('❌ **Channel pengumuman belum di-setup!**\nGunakan `!setup #channel` terlebih dahulu.');
        }

        const announceChannel = client.channels.cache.get(announceChannelId);
        if (!announceChannel) {
            return message.reply('❌ **Channel pengumuman tidak ditemukan! Setup ulang dengan `!setup #channel`');
        }

        // Kirim pengumuman biasa
        await announceChannel.send(`📢 **PENGUMUMAN**\n${announcement}`);
        
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Pengumuman Terkirim!')
            .setDescription(`Ke ${announceChannel}`)
            .setTimestamp();

        return message.reply({ embeds: [successEmbed] });
    }

    // !announceembed
    if (command === 'announceembed') {
        const announcement = args.join(' ');
        if (!announcement) {
            return message.reply('❌ **Tulis pesan yang ingin diumumkan!**\n`!announceembed <pesan>`');
        }

        // Cek apakah sudah di-setup
        const fs = require('fs');
        let announceChannelId;
        try {
            const data = fs.readFileSync('./announce-channel.json', 'utf8');
            announceChannelId = JSON.parse(data).channelId;
        } catch (error) {
            return message.reply('❌ **Channel pengumuman belum di-setup!**\nGunakan `!setup #channel` terlebih dahulu.');
        }

        const announceChannel = client.channels.cache.get(announceChannelId);
        if (!announceChannel) {
            return message.reply('❌ **Channel pengumuman tidak ditemukan! Setup ulang dengan `!setup #channel`');
        }

        // Kirim pengumuman dengan embed cantik
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('📢 PENGUMUMAN PENTING')
            .setDescription(announcement)
            .setFooter({ text: `Diumumkan oleh ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await announceChannel.send({ embeds: [embed] });
        
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Pengumuman Embed Terkirim!')
            .setDescription(`Ke ${announceChannel}`)
            .setTimestamp();

        return message.reply({ embeds: [successEmbed] });
    }
});

// Login bot
client.login(process.env.TOKEN);
