(async() => {
  const BancoInter = require('./lib/bancointer')
  const Ynab = require('./lib/ynab')

  const apiBancoInter = new BancoInter({
    accountNumber: process.env.BANCO_INTER_ACCOUNT_NUMBER,
    password: process.env.BANCO_INTER_PASSWORD
  })

  const apiYnab = new Ynab({
    budgetId: process.env.YNAB_BUDGET_ID,
    debitAccountId: process.env.YNAB_DEBIT_ACCOUNT_ID,
    creditAccountId: process.env.YNAB_CREDIT_ACCOUNT_ID,
    key: process.env.YNAB_KEY,
  })
  
  try {
    apiYnab.exportExpenses(await apiBancoInter.scrapeExpenseList())
  } catch(err) {
    console.err(err)
  }
})()