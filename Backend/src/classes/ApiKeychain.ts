import { Functions as Funcs } from "./Functions";

class ApiKeychain {
  private apiKeys: string[] = [];

  constructor() {
    this.loadApiKeys();
  }

  public loadApiKeys() {
    const foundApiKeys = Funcs.cleanString((process.env.API_KEYS ? process.env.API_KEYS : ""));

    if(foundApiKeys.length > 0) {
      this.apiKeys = foundApiKeys.split("|");
    }
  }

  public verify(key: string): boolean {
    if(this.apiKeys.indexOf(key) >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

export default new ApiKeychain();