const functions = require('firebase-functions');
const BancoInter = require('./lib/bancointer');
const Ynab = require('./lib/ynab');

const bancointer = new BancoInter({
  accountNumber: functions.config().bancointer.account,
  password: functions.config().bancointer.password
});

const ynab = new Ynab({
  key: functions.config().ynab.key,
  budgetId: functions.config().ynab['budget-id'],
  debitAccountId: functions.config().ynab['debit-account-id'],
  creditAccountId: functions.config().ynab['credit-account-id']
});

exports.exportDebitExpenses = functions.runWith({
  memory: '1GB'
}).https.onRequest((request, response) => {
  const token = request.query.token

  if (token === functions.config().admin.token) {
    bancointer.scrapeExpenseList().then((expenseList) => {
      ynab.exportExpenses(expenseList).then(() => {
        response.status(200).end();
      }).catch((err) => {
        console.log(err)
        response.status(500).send(err);
      })
    }).catch((err) => {
      console.log(err)
      response.status(500).send(err);
    });
  } else {
    response.status(500).json({ message: 'This is a private app, dude :P'});
  }
});
