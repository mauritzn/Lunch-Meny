import "./env";
import app from "./App";
import MAIN_CONFIG from "./config/Main";
import CacheManger from "./classes/CacheManager";

(app.express).listen(app.port, (err: any) => {
  if(err) throw err;
  console.log(`Server is listening on ${app.port}`);

  if(process.env && process.env.pm_id) {
    if(process.env.NODE_APP_INSTANCE === "0") {
      new CacheManger(MAIN_CONFIG.cacheCheckInterval); // start cache checking and updating (if main PM2 instance)
    }
  } else {
    new CacheManger(MAIN_CONFIG.cacheCheckInterval); // start cache checking and updating
  }
});