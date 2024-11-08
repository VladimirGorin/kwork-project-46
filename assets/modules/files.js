const fs = require("fs");

async function createFiles() {
  const names = JSON.parse(fs.readFileSync("./assets/data/sites.json"));
  const files = [
    "settings",
    "transactions_wallet",
    "api_key",
    "qr_settings",
    "users-keys",
    "price_settings",
    "address_settings",
    "email_settings",
    "phone_numbers",
    "qr_deposit_settings",
    "tickets_photos",
    "custom_transactions_settings",
    "phone_settings",
    "full_wallet_address_settings",
    "bitcoin_address"
  ];

  for (let name in names) {
    const pathToFolder = `./assets/data/sites/${names[name]["site"]}/`;
    fs.access(pathToFolder, function (error) {
      if (error) {
        fs.mkdir(pathToFolder, (err) => {
          "";
        });

        for (let file in files) {
          let fileName = files[file];

          if (
            fileName == "api_key" ||
            fileName == "settings" ||
            fileName == "transactions_wallet" ||
            fileName == "tickets_photos" ||
            fileName == "email_settings" ||
            fileName == "address_settings" ||
            fileName == "phone_settings" ||
            fileName == "price_settings" ||
            fileName == "bitcoin_address" ||
            fileName == "qr_deposit_settings" ||
            fileName == "custom_transactions_settings" ||
            fileName == "full_wallet_address_settings" ||
            fileName == "qr_settings"
          ) {
            if (fileName == "phone_settings") {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                JSON.stringify({ from: "" }, null, "\t"),
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            } else if (fileName == "settings.json") {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                JSON.stringify(
                  {
                    replainId: "",
                  },
                  null,
                  "\t"
                ),
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            } else if (fileName == "transactions_wallet.json") {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                JSON.stringify(
                  {
                    transaction_0: "",
                    transaction_1: "",
                    transaction_2: "",
                  },
                  null,
                  "\t"
                ),
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            } else if (fileName == "email_settings") {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                JSON.stringify(
                  {
                    domainFooter: "",
                    domainLink: "",
                    domainHeader: "",
                    text: "",
                    login: "",
                    loginTwo: "",
                    domain: "",
                    pass: "",
                  },
                  null,
                  "\t"
                ),
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            } else if (fileName == "api_key") {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                JSON.stringify({ api_key: "" }, null, "\t"),
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            } else {
              fs.writeFile(
                `${pathToFolder}${fileName}.json`,
                "{}",
                function (err) {
                  if (err) {
                    ("");
                  }
                }
              );
            }
          } else {
            fs.writeFile(
              `${pathToFolder}/${fileName}.json`,
              "[]",
              function (err) {
                if (err) {
                  ("");
                }
              }
            );
          }
        }
      } else {
        console.log("Файл найден files");
      }
    });
  }
}

module.exports = {
  createFiles,
};
