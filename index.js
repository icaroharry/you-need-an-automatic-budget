(async() => {
  const Ynab = require('./lib/ynab')

  const apiYnab = new Ynab({
    budgetId: process.env.YNAB_BUDGET_ID,
    debitAccountId: process.env.YNAB_DEBIT_ACCOUNT_ID,
    creditAccountId: process.env.YNAB_CREDIT_ACCOUNT_ID,
    key: process.env.YNAB_KEY,
  })

  const bankSimulation = [
    'ICARO PINTO COELHO HARRY, seu pagamento no valor de R$ 475,15 foi realizado com sucesso!',
    'Olá ICARO, você acaba de comprar no débito no RESTAURANTE SABOR E MA Belo Horizont BRA o valor de 24,94 pelo cartão final 0654.',
    'Você recebeu uma transferência. Entre no App e confira!',
    'Lembrete: a fatura do seu cartão vence em 2 dias e está em débito automático. Para garantir o pagamento, mantenha o saldo necessário em sua conta.',
    'Olá ICARO, você acaba de comprar no crédito no EBANX-SPOTIFY CURITIBA BRA o valor de 26,90',
    'Banco Inter: Saque no valor de 150,00, em 05/11, realizado com sucesso.',
    'ICARO PINTO COELHO HARRY, sua transferencia no valor de R$ 160,00 foi realizada com sucesso!'
  ]

  try {
    bankSimulation.forEach((expense) => {
      console.log(
        apiYnab.registerExpense(expense)
      )
    })
  } catch(err) {
    console.log(err)
  }
})()