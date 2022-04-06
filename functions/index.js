const functions = require("firebase-functions");
const ynab = require("ynab");

const creditExpense = `Compra no crédito
Olá, Icaro. Você acaba de comprar R$ 31,50 em VILLA VEG. A compra foi no crédito nacional, com o cartão final 1509.`;
const receivedPix = `Pix recebido
Você recebeu um Pix no valor de R$ 100,00 de. Acesse o app e confira`;
const debitExpense = `Olá Icaro, você acaba de comprar no débito no DROG ARAUJO 182 BELO HORIZONT BRA o valor de R$ 3,09.`;

const BUDGET_ID = "df5877ca-c2be-401d-91ba-a72d5c06ea46";
const CREDIT_CARD_ACCOUNT_ID = "a98cf701-0476-4d94-9df4-664ce7e1ce2a";
const CHECKING_ACCOUNT_ID = "ddcc5016-d597-4dc2-95e6-f2773dd92884";

const accessToken = process.env.YNAB_KEY;
const ynabAPI = new ynab.API(accessToken);

const getAccountIdFromNotificationString = (notificationString) => {
  const notification = notificationString.toLowerCase();
  if (notification.includes("crédito")) {
    return CREDIT_CARD_ACCOUNT_ID;
  } else if (notification.includes("débito") || notification.includes("pix")) {
    return CHECKING_ACCOUNT_ID;
  }
};

const isInflowOrOutflow = (notificationString) => {
  const notification = notificationString.toLowerCase();
  if (notification.includes("comprar")) {
    return -1;
  } else if (notification.includes("recebeu")) {
    return 1;
  }
};

const convertExpensePriceToFloat = (priceString) => {
  const amount = priceString.replace(",", ".");

  return parseFloat(amount) * 1000;
};

const extractDataFromNotificationString = (notificationString) => {
  const regex =
    /(?<name>[A-z]+),[a-zà-ú ]+(?<memo>[A-Z0-9 ]+) [a-zà-ú ]+R\$ (?<price>[0-9,]+)\.$/;
  const { name, memo, price } = regex.exec(notificationString).groups;

  const convertedPrice =
    convertExpensePriceToFloat(price) * isInflowOrOutflow(notificationString);

  return { name, amount: convertedPrice, memo };
};

async function addYnabExpense(expense) {
  const accountId = getAccountIdFromNotificationString(expense);
  const { name, amount, memo } = extractDataFromNotificationString(expense);

  const transaction = {
    account_id: accountId,
    date: ynab.utils.getCurrentDateInISOFormat(),
    amount,
    memo,
  };

  try {
    await ynabAPI.transactions.createTransaction(BUDGET_ID, { transaction });
  } catch (err) {
    const error = err.error;
    console.log(
      `ERROR: id=${error.id}; name=${error.name}; detail: ${error.detail}`
    );
  }
}

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addExpenseFromNotification = functions.https.onRequest(
  async (req, res) => {
    // Grab the text parameter.
    if ((req.query.password = process.env.PASSWORD)) {
      try {
        await addYnabExpense(req.query.notification);
        res.json({ ok: true });
      } catch (error) {
        res.json({ error });
      }
    } else {
      // Push the new message into Firestore using the Firebase Admin SDK.
      // Send back a message that we've successfully written the message
      res.json({ error: `Access denied` });
    }
  }
);
