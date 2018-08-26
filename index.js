(async() => {
  const BancoInter = require('./lib/bancointer')
  const Ynab = require('./lib/ynab')

  const getMonth = (date) => date.getMonth() < 9 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`
  
  const getDateInterval = () => {
    const today = new Date()
    // return yesterday
    return `${today.getDate() - 1}/${getMonth(today)}/${today.getFullYear()}`
  }

  const apiBancoInter = new BancoInter({
    accountNumber: process.env.BANCO_INTER_ACCOUNT_NUMBER,
    password: process.env.BANCO_INTER_PASSWORD,
    initialDate: getDateInterval(),
    finalDate: getDateInterval(),
    headless: false
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
    console.log(err)
  }
})()