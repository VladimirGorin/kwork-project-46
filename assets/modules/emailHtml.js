function generateHTML(
  domain,
  balanceEuro,
  balance,
  bitcoin_address,
  bitcoin_img,
  domainHeader,
  domainFooter,
  domainLink,
  precent
) {

  const output = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Paper Wallet</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <div style="padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
            <div style="text-align: center;">
                <a href="${domainLink}" style="text-decoration: none; color: #000;" target="_blank"
                    rel="noopener noreferrer">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        <img src="${domainLink}/img/ethereum.gif" alt="Royal crypto union"
                            style="width: 70px; height: auto;">
                        <div style="text-align: left;    margin-top: 3%;">
                        <span style="font-weight: bold; font-size: 14px; color: #000; display: block;">${domainHeader}<span style="color: gray;">.com</span></span>
                        <span style="font-size: 12px; color: #ccc;">Decentralized offline paper wallet</span>
                        </div>
                    </div>
                </a>
            </div>

            <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <p><strong>Bitcoin paper wallet detected!</strong></p>
                <p><strong>Transaction date:</strong> 2024-03-07</p>
                <p><strong>Wallet no.:</strong> SS22JF3RM3SJ-SPX</p>
                <p><strong>Transaction ID:</strong> SD1V3BV9S35FJ5D9NL</p>
                <p><strong>Current balance [BTC]:</strong> ${balance} BTC</p>
                <p><strong>Current balance [EUR]:</strong> ${balanceEuro} EUR</p>
                <p><strong>Commission fee ${precent}%:</strong> ${bitcoin_to_euro_commission}</p>
            </div>
            <p>To withdraw funds from a paper wallet, you have to pay a commission of ${precent}% of the current Bitcoin wallet
                amount.</p>
            <p>First enter the private key from your printed BTC paper wallet and enter your <strong>email</strong> to
                pay the commission, use a digital Bitcoin wallet, scan the QR code, send the correct amount of Bitcoin
                indicated on the website form, double-check the Bitcoin address to which the commission needs to be
                paid. After paying the ${precent}% commission, the activation code will be sent to the <strong>email</strong>.
            </p>
            <p><strong>IMPORTANT:</strong> The secret private key can only be used once, after which it is no longer
                valid.</p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="${bitcoin_img}" alt="QR Code" style="width: 200px; height: 200px;">
            </div>
            <p style="text-align: center;">Bitcoin address to pay a commission fee</p>
            <p style="text-align: center;"><strong>${bitcoin_address}</strong></p>

            <footer style="margin: 0; padding: 0; box-sizing: border-box; text-align: center;">
                <div style="margin: 20px; padding: 20px; box-sizing: border-box; text-align: center;">
                    <a href="${domainLink}"
                        style="text-decoration: none; color: #000; display: grid; vertical-align: middle;"
                        target="_blank" rel="noopener noreferrer">
                        <figure style="display: inline-block; vertical-align: top; ">
                            <img src="${domainLink}/img/ethereum.gif" alt="Royal crypto union"
                                style="width: 70px; height: auto;">
                        </figure>
                        <div style="display: inline-block; vertical-align: top; text-align: center;">
                            <span
                                style="font-weight: bold; font-size: 14px; color: #000; display: block;">${domainFooter}<span
                                    style="color: gray;">.com</span></span>
                            <span style="font-size: 12px; color: #ccc; display: block;">Print your coins secure
                                offline</span>
                        </div>
                    </a>
                    <br/>
                    <p style="margin: 4px 0; padding: 0; box-sizing: border-box; font-size: 12px; text-align: center;">
                        We're proud to be part of the <b>2% for impact</b> family.</p>
                    <p style="margin: 4px 0; padding: 0; box-sizing: border-box; font-size: 12px; text-align: center;">©
                        ${domainFooter} CAC. All rights reserved.</p>
                </div>
            </footer>

        </div>
    </div>
</body>

</html>
`;
  return output;
}

module.exports = {
  generateHTML,
};
