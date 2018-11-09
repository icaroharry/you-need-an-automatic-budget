const ynab = require('ynab');

class Ynab {
  constructor({ key, budgetId, debitAccountId, creditAccountId }) {
    this.key = key;
    this.budgetId = budgetId;
    this.debitAccountId = debitAccountId;
    this.creditAccountId = creditAccountId;
    this.api = new ynab.API(this.key);
  }

  findTransactionType (bankString) {
    if (bankString.match('comprar no débito')) 
      return 'debit'
    else if (bankString.match('comprar no crédito'))
      return 'credit'
    else if (bankString.match('seu pagamento no valor '))
      return 'payment'
    else if (bankString.match('Saque no valor de'))
      return 'withdrawal'
    else if (bankString.match('sua transferencia no valor'))
      return 'transfer'

    return 'none'
  }

  factoryExpense (bankString, accountId) {
    return {
      account_id: accountId,
      date: new Date().toISOString(),
      memo: bankString.split('ito no ')[1].split(' o valor')[0],
      amount: bankString.split('o valor de ')[1].split(' ')[0].split(',').join('').concat('0')
    }
  }

  factoryOperation (bankString, operation) {
    return {
      account_id: this.debitAccountId,
      date: new Date().toISOString(),
      memo: operation,
      amount: bankString.split('no valor de R$ ')[1].split(' ')[0].split(',').join('').concat('0')
    }
  }

  factoryWithdrawal (bankString) {
    return {
      account_id: this.debitAccountId,
      date: new Date().toISOString(),
      memo: 'Saque',
      amount: bankString.split('no valor de ')[1].split(' ')[0].split(',').join('').concat('0')
    }
  }

  extractExpenseFromBankString(bankString) {
    let expense = {}

    try {
      switch (this.findTransactionType(bankString)) {
        case 'debit': 
          expense = this.factoryExpense(bankString, this.debitAccountId)
          break
        case 'credit': 
          expense = this.factoryExpense(bankString, this.creditAccountId)
          break
        case 'payment': 
          expense = this.factoryOperation(bankString, 'Pagamento')
          break
        case 'withdrawal': 
          expense = this.factoryWithdrawal(bankString)
          break
        case 'transfer': 
          expense = this.factoryOperation(bankString, 'Transferência')
          break
        default:
          throw new Error('Not an expense!')
      }

      return expense  
    } catch (err) {
      console.error(err)
    }
  }
  
  async registerExpense(bankString) {
    const transaction = this.extractExpenseFromBankString(bankString)
    return this.api
      .transactions
      .createTransaction(this.budgetId, { transaction })
      .then(res => res)
      .catch(e => {
        const error = e.error;
        console.log(`ERROR: id=${error.id}; name=${error.name}; detail: ${error.detail}`);
        return e;
      });
  }
}

module.exports = Ynab;
