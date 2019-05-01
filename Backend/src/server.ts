// created based on: https://blog.risingstack.com/building-a-node-js-app-with-typescript-tutorial/
// important: https://docs.npmjs.com/misc/scripts [https://gyazo.com/6e843ae22f1119850a205bca7efbf90a]
import app from "./App";

(app.express).listen(app.port, (err: any) => {
  if(err) throw err;
  console.log(`Server is listening on ${app.port}`)

  return app.initCacheChecking();
});