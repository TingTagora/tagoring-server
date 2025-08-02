const https = require('https');

const TELEGRAM_BOT_TOKEN = '8328066726:AAGplo_m5nUMDA9z6G-0U1lfqW6vqjFZb-A';
const TEST_CHAT_ID = process.argv[2]; // Pass chat ID as argument

function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
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
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function sendTestMessage(chatId) {
    try {
        const message = `🔐 **Admin Authentication Test**

✅ Bot is working!
✅ Your Chat ID: ${chatId}
✅ Ready for admin tokens!

This message confirms your Telegram bot is properly configured for admin authentication.`;

        const response = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, 'POST', {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });

        if (response.ok) {
            console.log('✅ Test message sent successfully!');
            console.log(`📱 Check your Telegram (@Tagorabot) for the test message.`);
            return true;
        } else {
            console.log('❌ Failed to send message:', response.description);
            return false;
        }
    } catch (error) {
        console.error('Error sending test message:', error.message);
        return false;
    }
}

async function testBotSetup() {
    console.log('🔧 Testing Telegram Bot Setup...\n');

    if (!TEST_CHAT_ID) {
        console.log('❌ Chat ID not provided.');
        console.log('📝 Usage: node test-telegram.js YOUR_CHAT_ID');
        console.log('\n💡 To get your Chat ID:');
        console.log('1. Send a message to @Tagorabot');
        console.log('2. Run: node get-chat-id.js');
        return;
    }

    // Test bot connection
    try {
        const botInfo = await makeRequest(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        
        if (botInfo.ok) {
            console.log('✅ Bot connection successful!');
            console.log(`📱 Bot: ${botInfo.result.first_name} (@${botInfo.result.username})`);
            console.log(`🆔 Chat ID: ${TEST_CHAT_ID}\n`);

            // Send test message
            const success = await sendTestMessage(TEST_CHAT_ID);
            
            if (success) {
                console.log('\n🎉 Setup Complete!');
                console.log('📝 Update your server/.env with:');
                console.log(`TELEGRAM_CHAT_ID=${TEST_CHAT_ID}`);
                console.log('\n🚀 You can now use admin authentication!');
            }
        } else {
            console.log('❌ Bot connection failed:', botInfo.description);
        }
    } catch (error) {
        console.error('❌ Error testing bot:', error.message);
    }
}

testBotSetup();
