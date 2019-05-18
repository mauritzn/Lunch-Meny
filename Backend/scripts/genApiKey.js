const cryptoRandomString = require("crypto-random-string");
console.log(`API Key: ${cryptoRandomString({ length: 64 })}`);