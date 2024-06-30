const express = require('express');
const app = express();
app.use(express.json());

app.get('/test', async function (request, response){
    console.log("Test request received.");
    response.send("Test request received.");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
    var ip = require("ip");
    console.log(ip.address());
});