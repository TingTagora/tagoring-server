const https = require('https');

// Telegram Bot API Key
const TELEGRAM_BOT_TOKEN = '8328066726:AAGplo_m5nUMDA9z6G-0U1lfqW6vqjFZb-A';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function getTelegramUpdates() {
    try {
        console.log('🤖 Fetching Telegram updates to find your Chat ID...\n');
        
        const data = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
        
        if (data.ok && data.result.length > 0) {
            console.log('📱 Recent Telegram messages:');
            console.log('=====================================');
            
            data.result.forEach((update, index) => {
                if (update.message) {
                    const msg = update.message;
                    console.log(`Message ${index + 1}:`);
                    console.log(`  Chat ID: ${msg.chat.id}`);
                    console.log(`  From: ${msg.from.first_name} ${msg.from.last_name || ''}`);
                    console.log(`  Username: @${msg.from.username || 'none'}`);
                    console.log(`  Text: "${msg.text}"`);
                    console.log(`  Date: ${new Date(msg.date * 1000).toLocaleString()}`);
                    console.log('-------------------------------------');
                }
            });
            
            // Get the most recent chat ID
            const latestMessage = data.result[data.result.length - 1];
            if (latestMessage.message) {
                const chatId = latestMessage.message.chat.id;
                console.log(`\n✅ Your Chat ID is: ${chatId}`);
                console.log(`\n📝 Add this to your server/.env file:`);
                console.log(`TELEGRAM_CHAT_ID=${chatId}`);
                return chatId;
            }
        } else {
            console.log('❌ No messages found.');
            console.log('\n📱 To get your Chat ID:');
            console.log('1. Open Telegram and search for your bot');
            console.log('2. Send any message to your bot (like "hello")');
            console.log('3. Run this script again');
            return null;
        }
        
    } catch (error) {
        console.error('Error fetching updates:', error.message);
        return null;
    }
}

// Test bot connection
async function testBot() {
    try {
        console.log('🔗 Testing bot connection...');
        const data = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        
        if (data.ok) {
            console.log(`✅ Bot connected successfully!`);
            console.log(`Bot Name: ${data.result.first_name}`);
            console.log(`Username: @${data.result.username}`);
            console.log('=====================================\n');
            
            // Now get updates
            const chatId = await getTelegramUpdates();
            return chatId;
        } else {
            console.log('❌ Bot connection failed:', data.description);
            return null;
        }
    } catch (error) {
        console.error('Error testing bot:', error.message);
        return null;
    }
}

testBot();
