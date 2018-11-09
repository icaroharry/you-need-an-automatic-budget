# You Need an Automatic Budget
I simply hate manually exporting expenses from my internet banking to my finance manager, that's why I figured out a way to do this *automagically* :tophat:

## How it works
Whenever I do a monetary transaction using whether my card or the app, a notification from the banking app is triggered on my phone. So I set up a IFTTT recipe that listens to these notifications and sends them as POST requests.

Then I created a cloud function that is running on Firebase. It receives the HTTP request and creates a YNAB expense from it using the YNAB API.
