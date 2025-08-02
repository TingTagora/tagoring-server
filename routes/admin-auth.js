const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const https = require('https');
const crypto = require('crypto');

// In-memory token storage (in production, use Redis or DB)
const activeTokens = new Map();

// Utility function to identify token type
function getTokenType(token) {
  if (token.endsWith('fb')) {
    return 'FALLBACK';
  } else if (token.startsWith('eyJ')) {
    return 'FIREBASE';
  } else {
    return 'UNKNOWN';
  }
}

// Generate cryptographically secure random string
function generateSecureToken() {
  const timestamp = Date.now().toString(36);
  const secureBytes1 = crypto.randomBytes(24).toString('base64url');
  const secureBytes2 = crypto.randomBytes(16).toString('hex');
  const processEntropy = process.hrtime.bigint().toString(36);
  
  return `${timestamp}.${secureBytes1}.${secureBytes2}.${processEntropy}fb`;
}

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('WARNING: Telegram bot credentials not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
}

// Generate and send admin token via Telegram
router.post('/request-admin-token', async (req, res) => {
  try {
    // Generate custom token for admin UID
    const adminUID = 'secure-admin-uid-2024';
    const customClaims = {
      role: 'admin',
      isAdmin: true,
      tokenType: 'telegram-admin'
    };

    // Try to create custom token, fallback if Firebase not properly configured
    let customToken;
    try {
      customToken = await admin.auth().createCustomToken(adminUID, customClaims);
    } catch (firebaseError) {
      console.warn('Firebase Admin SDK not properly configured, using fallback token');
      // Generate a cryptographically secure fallback token
      customToken = generateSecureToken();
    }
    
    // Store token with expiration and security metadata (2 minutes)
    const tokenData = {
      token: customToken,
      created: Date.now(),
      used: false,
      expiresAt: Date.now() + (2 * 60 * 1000), // 2 minutes
      generatedBy: 'server-secure',
      entropy: crypto.randomBytes(8).toString('hex'), // Additional server-side verification
      ipHash: crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').substring(0, 8)
    };
    
    activeTokens.set(customToken, tokenData);
    
    // Auto-cleanup expired token with notification
    setTimeout(() => {
      const currentTokenData = activeTokens.get(customToken);
      if (currentTokenData && !currentTokenData.used) {
        // Token expired without being used
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
          const tokenType = getTokenType(customToken);
          const expiryMessage = `TOKEN EXPIRED

Token: ${customToken.substring(0, 20)}...
Type: ${tokenType}
Status: EXPIRED (unused after 2 minutes)
Generated at: ${new Date(currentTokenData.created).toLocaleString()}
Expired at: ${new Date().toLocaleString()}

This token expired without being used. Request a new one if needed.`;
          
          sendTelegramMessage(expiryMessage).catch(err => 
            console.error('Failed to send auto-expiry notification:', err)
          );
        }
      }
      activeTokens.delete(customToken);
    }, 2 * 60 * 1000);

    // Send token via Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await sendTokenToTelegram(customToken);
      console.log('SUCCESS: Admin token sent to Telegram');
    } else {
      console.log('ADMIN TOKEN (Telegram not configured):', customToken);
    }

    res.json({ 
      success: true, 
      message: 'Admin token generated and sent to Telegram. Check your messages.' 
    });

  } catch (error) {
    console.error('Error generating admin token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate admin token' 
    });
  }
});

// Send token to Telegram
async function sendTokenToTelegram(token) {
  return new Promise((resolve, reject) => {
    // First message: Just the token for easy copying
    const tokenMessage = token;
    
    sendTelegramMessage(tokenMessage).then(() => {
      // Second message: Instructions pointing to above token
      const tokenType = getTokenType(token);
      const instructionMessage = `^^ TAGORA ADMIN LOGIN TOKEN ^^

TOKEN TYPE: ${tokenType}
INSTRUCTIONS:
- Copy the token from the message above
- Paste it in the admin login form at localhost:3001
- Token expires in 2 minutes
- Single use only
- Do not share this token

STATUS: Active and ready for use`;
      
      return sendTelegramMessage(instructionMessage);
    }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

// Helper function to send individual Telegram messages
function sendTelegramMessage(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          console.error('Telegram API error:', res.statusCode, responseData);
          reject(new Error(`Telegram API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Failed to send message to Telegram:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Validate and mark token as used (internal use)
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Token required' });
    }

    const tokenData = activeTokens.get(token);
    
    if (!tokenData) {
      // Send expiry notification
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tokenType = getTokenType(token);
        const expiryMessage = `TOKEN EXPIRED

Token: ${token.substring(0, 20)}...
Type: ${tokenType}
Status: EXPIRED or NOT FOUND
Time: ${new Date().toLocaleString()}

This token is no longer valid. Please request a new one.`;
        
        sendTelegramMessage(expiryMessage).catch(err => 
          console.error('Failed to send expiry notification:', err)
        );
      }
      return res.status(400).json({ valid: false, message: 'Token not found or expired' });
    }

    if (tokenData.used) {
      return res.status(400).json({ valid: false, message: 'Token already used' });
    }

    if (Date.now() > tokenData.expiresAt) {
      activeTokens.delete(token);
      
      // Send expiry notification
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tokenType = getTokenType(token);
        const expiryMessage = `TOKEN EXPIRED

Token: ${token.substring(0, 20)}...
Type: ${tokenType}
Status: EXPIRED (2 minute limit exceeded)
Expired at: ${new Date(tokenData.expiresAt).toLocaleString()}
Attempted use: ${new Date().toLocaleString()}

This token has expired. Please request a new one.`;
        
        sendTelegramMessage(expiryMessage).catch(err => 
          console.error('Failed to send expiry notification:', err)
        );
      }
      return res.status(400).json({ valid: false, message: 'Token expired' });
    }

    // Mark token as used
    tokenData.used = true;
    tokenData.usedAt = Date.now();
    
    // Send usage notification
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tokenType = getTokenType(token);
      const usageMessage = `TOKEN USED SUCCESSFULLY

Token: ${token.substring(0, 20)}...
Type: ${tokenType}
Status: AUTHENTICATED
Used at: ${new Date().toLocaleString()}
Used from: Admin Panel (localhost:3001)
Session: Active

Admin access granted successfully.`;
      
      sendTelegramMessage(usageMessage).catch(err => 
        console.error('Failed to send usage notification:', err)
      );
    }
    
    // Remove token after use
    setTimeout(() => {
      activeTokens.delete(token);
    }, 1000);

    res.json({ valid: true, message: 'Token is valid' });

  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ valid: false, message: 'Token validation failed' });
  }
});

// Get active tokens count (for monitoring)
router.get('/token-stats', (req, res) => {
  const now = Date.now();
  const activeCount = Array.from(activeTokens.values()).filter(
    token => !token.used && now < token.expiresAt
  ).length;
  
  res.json({
    activeTokens: activeCount,
    totalGenerated: activeTokens.size
  });
});

module.exports = router;
