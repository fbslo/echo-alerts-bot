const imaps = require('imap-simple');
const TelegramBot = require('node-telegram-bot-api');

// --- UPDATE THIS ---
const TG_BOT_KEY=""
const tgChannel = -100123456778

const config = {
    imap: {
        user: '',
        password: '', 
        host: '127.0.0.1',
        port: 1143, 
        authTimeout: 3000
    }
};

// --- END OF CONFIG

const bot = new TelegramBot(TG_BOT_KEY, {polling: true});

imaps.connect(config).then((connection) => {
    connection.on('mail', (numNewMail) => {
        console.log(`Received ${numNewMail} new messages!`);
        connection.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT'], markSeen: false }).then((messages) => {
            messages.forEach((item) => {
                try {
                    const all = item.parts.filter((part) => part.which === 'TEXT').map((part) => part.body);
                    const headers = item.parts.filter((part) => part.which === 'HEADER').map((part) => part.body);

                    if (headers[0] && headers[0].sender && headers[0].sender[0] == "echo@echo.xyz"){
                        if (headers[0]["x-mailgun-variables"]){
                            let json = JSON.parse(headers[0]["x-mailgun-variables"])
                            let newDeal = {
                                group_name: json.group_name,
                                company_name: json.company_name,
                                deal_memo: json.deal_memo,
                                coinvestors: json.coinvestors,
                                group_url: json.group_url,
                                deal_url: json.button_url
                            }
                            console.log(newDeal)
                            if (newDeal.deal_url){
                                sendMessage(`New Echo deal detected in ${newDeal.group_name}`)
                            }
                            
                        }
                    }
                } catch (e){
                    console.log(`Error`)
                    console.log(e)
                }
            });
        });
    });

    return connection.openBox('INBOX');
}).catch((err) => {
  console.error('An error occurred:', err);
});

function sendMessage(message, channel = tgChannel){
    let options = { parse_mode : "HTML", disable_web_page_preview: true }
    bot.sendMessage(channel, message, options);
}
