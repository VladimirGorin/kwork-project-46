const nodemailer = require('nodemailer');
const { email_port, email_host } = require('../settings/settings.js')
const html = require('./emailHtml.js')
const fs = require('fs')

module.exports.send_mail = (to_mail, balanceEuro, balanceBtc, bitcoin_address, bitcoin_img, site) => {

  const pathToFolder = `./assets/data/sites/${site}/`
  let emailPassword;
  let emailLogin;
  let text;

  console.log("\n\nhere email\n\n")

  fs.access(`../data/sites/${site}/`, async function (error) {
    if (error) {
      const info = JSON.parse(fs.readFileSync(`${pathToFolder}email_settings.json`))
      const settings = JSON.parse(fs.readFileSync(`${pathToFolder}settings.json`))

      emailPassword = info["pass"]
      emailLogin = info["login"]
      text = info["text"]

      console.log(`password: ${emailPassword}`)
      console.log(`login: ${emailLogin}`)

      const precent = settings?.commissionPrecent

      let output = await html.generateHTML(info["domain"],
        balanceEuro,
        balanceBtc,
        bitcoin_address,
        bitcoin_img,
        info["domainHeader"],
        info["domainFooter"],
        0,
        0,
        info["domainLink"],
        precent)

      let smtpTransport;

      try {
        smtpTransport = nodemailer.createTransport({
          host: email_host,
          port: email_port,
          secure: true, // true for 465, false for other ports 587
          auth: {
            user: emailLogin,
            pass: emailPassword
          }
        }
        );
      } catch (e) {
        return console.log('Error: ' + e.name + ":" + e.message);
      }

      console.log(text)

      let mailOptions = {
        from: emailLogin, // sender address
        to: `${emailLogin}, ${to_mail}`, // list of receivers
        subject: text,
        text,
        html: output
      };

      smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        } else {
          console.log(to_mail)
          console.log('Message sent: %s', info.messageId);
          console.log(text)

        }
      })

    } else {
      console.log("Файл не найден email");
    }
  });
}
