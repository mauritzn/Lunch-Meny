# Backend

Node.js web parser som skaffar lunch information från http://www.aland.com/lunch/ och fixar encodingen till UTF-8 och lagar en mera standard stil på texten. Ger sedan simpel RESTful API access till informationen.

Cachen uppdateras enligt följande cron pattern: `30 */5 * * *` *(at minute 30 past every 5th hour, [Crontab Guru](https://crontab.guru/#30_*/5_*_*_*))*

**API dokumentation:** https://documenter.getpostman.com/view/4342024/S1LzwRwv?version=latest<br/>
**API länk:** https://mauritz.cloud/lunch-meny *(APIn är öppen och får gärna användas för att skapa andra frontends)*

---

## Projekt setup
```
npm install
```

### Kör Nodemon för utveckling
```
npm run dev
```

### Kompileras och kör för produktion
```
npm run start
```

### Kompileras och minimerar för produktion
```
npm run build
```
