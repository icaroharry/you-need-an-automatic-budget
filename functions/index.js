const functions = require('firebase-functions');
const Ynab = require('./lib/ynab');

const ynab = new Ynab({
  key: functions.config().ynab.key,
  budgetId: functions.config().ynab['budget-id'],
  debitAccountId: functions.config().ynab['debit-account-id'],
  creditAccountId: functions.config().ynab['credit-account-id']
});

exports.registerExpense = functions.https.onRequest((request, response) => {
  const token = request.query.token

  if (token === functions.config().admin.token) {
    ynab.registerExpense(request.body.bankString).then(() => {
      response.status(200).end();
    }).catch((err) => {
      console.log(err)
      response.status(500).send(err);
    })
  } else {
    response.status(500).json({ message: 'This is a private app, dude :P'});
  }
});
