const ynab = require('ynab');

const convertDateFormat = (dateString) => {
  const splittedDate = dateString.split('/');
  return new Date([splittedDate[1], splittedDate[0], splittedDate[2]].join('/')).toISOString();
}

const convertAmountValue = (amountString) =>
  amountString.split('R$').map(n => n.trim()).join('').split('.').join('').replace(',', '').concat('0');

const factoryExpenseList = (expenseList, accountId) =>
  expenseList.map(expense => ({
    account_id: accountId,
    date: convertDateFormat(expense[0]),
    amount: convertAmountValue(expense[2]),
    memo: expense[1]
  }));

class Ynab {
  constructor({ key, budgetId, debitAccountId, creditAccountId }) {
    this.key = key;
    this.budgetId = budgetId;
    this.debitAccountId = debitAccountId;
    this.creditAccountId = creditAccountId;
    this.api = new ynab.API(this.key);
  }

  async exportExpenses(expenseList) {
    const bulkTransactions = { transactions: factoryExpenseList(expenseList, this.debitAccountId) };
    return this.api
      .transactions
      .bulkCreateTransactions(this.budgetId, bulkTransactions)
      .then(res => res)
      .catch(e => {
        const error = e.error;
        console.log(`ERROR: id=${error.id}; name=${error.name}; detail: ${error.detail}`);
        return e;
      });
  }
}

module.exports = Ynab;
