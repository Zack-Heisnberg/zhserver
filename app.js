const express = require('express')
const app = express()
const ngrok = require('ngrok');
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/s', async (req, res) => {
try {
await ngrok.authtoken(process.env.SECRET);
await ngrok.disconnect(); // stops all
await ngrok.kill(); // kills ngrok process
const url = await ngrok.connect({proto: 'tcp', addr: 5901});
res.send(url)
} catch (e) {
res.send(e.message)
}
})
