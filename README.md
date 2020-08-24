# Tabot
A very basic chat demoing Tableau static view integration as well as live view embedding 

Quick Intro :

[![ScreenShot](https://raw.githubusercontent.com/aalteirac/tableau-bot/master/thumb.png)](https://youtu.be/ZwLbbvJ1x1o)


HOW TO RUN WITH YOUR OWN TABLEAU SERVER

- Install nodejs
- Clone the repo
- Run "npm install" in the root folder
- Open the store.js file

```javascript
module.exports = {
    ip:"<YOUR_TABLEAU_IP_HERE>",
    name:"<YOUR_TOKEN_NAME>",
    tk:"<YOUR_TOKEN_VALUE>"
}
```

Change "ip" to Tableau server IP (Do not forget port if not 80/443, like http://1.1.1.1:8090)

Change "name" and "tk" with your personal token name and value (available in your personal profile in Tableau, more info here: https://help.tableau.com/current/pro/desktop/en-us/useracct.htm)

Thanks to Tutorialzine for the Chat:
https://tutorialzine.com/2014/03/nodejs-private-webchat 
