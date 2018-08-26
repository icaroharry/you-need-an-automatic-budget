const puppeteer = require('puppeteer');

const wait = ms => new Promise(res => setTimeout(res, ms));

class BancoInter {
  constructor({ accountNumber, password, initialDate, finalDate, headless = true }) {
    this.accountNumber = accountNumber;
    this.password = password;
    this.initialDate = initialDate;
    this.finalDate = finalDate;
    this.headless = headless
  }

  async scrapeExpenseList() {
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: this.headless
      });
      const page = await browser.newPage();
  
      // Go to internet banking login and input account info
      console.log('-> Go to internet banking login and input account info');
      await page.goto('https://internetbanking.bancointer.com.br/login.jsf', { waitUntil: 'networkidle2' });
      await page.waitFor('div#panelPrincipal input[type="text"]');
      await page.type('div#panelPrincipal input[type="text"]', this.accountNumber);
      await page.click('#frmLogin input[type=submit]');
      
      // Click on user initials
      console.log('-> Click on user initials');
      await page.waitFor('div#panelGeralv20170605 h1 a');
      await page.click('div#panelGeralv20170605 h1 a');
      
      // Type and submit password
      console.log('-> Type and submit password');
      await page.waitFor('div#tecladoNormal');
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(0)}"]`);
      await wait(500);
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(1)}"]`);
      await wait(500);
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(2)}"]`);
      await wait(500);
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(3)}"]`);
      await wait(500);
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(4)}"]`);
      await wait(500);
      await page.click(`div#tecladoNormal input[value="${this.password.charAt(5)}"]`);
      await wait(500);
      await page.click('div#panelTeclado input[value="CONFIRMAR"]');
      
      // Go to expenses page
      console.log('-> Go to expenses page');
      await page.waitFor('div#panelMenuMobile');
      await page.click('div#panelMenuMobile h1 a');
      await page.waitFor('div#panelMenuMobile div.menuFixoMobile');
      await page.click('div#panelMenuMobile a[title="CONTA DIGITAL"]');
      await page.waitFor('div#panelMenuMobile a[title="Extrato"]');
      await page.click('div#panelMenuMobile a[title="Extrato"]');
      
      if (this.initialDate && this.finalDate) {
        // Select specific date
        console.log('-> Select from ' + this.initialDate + ' to ' + this.finalDate);
        await page.waitFor('div.selectPadrao');
        await (await page.$x('//label[contains(text(), "Início")]/following-sibling::span//input'))[0].type(this.initialDate)
        await (await page.$x('//label[contains(text(), "Fim")]/following-sibling::span//input'))[0].type(this.finalDate)
      } else {
        // Select last 7 days
        console.log('-> Select last 7 days');
        await page.waitFor('div.selectPadrao');
        await page.select('div.selectPadrao select', 'SETE');
      }
      await wait(1000);
      await page.click('input[type="submit"][value="Consultar"]');
  
      // Extract data from expense table
      console.log('-> Extract data from expense table');
      await page.waitFor('form table tbody tr')
      const expenses = await page.$$('form table tbody tr');
      const expenseList = await Promise.all(expenses.map(expense => expense.$$eval('td', nodes => nodes.map(n => n.innerText))))
      await browser.close();
  
      return expenseList;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = BancoInter;
