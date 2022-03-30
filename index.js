const ynab = require("ynab");
require("dotenv").config();

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

const extractAmountFromNotificationString = (notificationString) => {
  const stringSplit = notificationString.split(" R$ ");
  const stringAmount = stringSplit[1].split(" ")[0];
  const amount = stringAmount.replace(",", ".");

  return parseFloat(amount) * 1000 * isInflowOrOutflow(notificationString);
};

(async function () {
  const expense = debitExpense;
  const amount = extractAmountFromNotificationString(expense);
  const accountId = getAccountIdFromNotificationString(expense);
  const transaction = {
    account_id: accountId,
    payee_id: null,
    date: ynab.utils.getCurrentDateInISOFormat(),
    amount,
    memo: "Teste",
  };
  try {
    await ynabAPI.transactions.createTransaction(BUDGET_ID, { transaction });
  } catch (err) {
    const error = err.error;
    console.log(
      `ERROR: id=${error.id}; name=${error.name}; detail: ${error.detail}`
    );
  }
})();
