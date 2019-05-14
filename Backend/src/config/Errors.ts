import { ErrorResponse } from "./Interfaces";

interface Errors {
  ROUTE_NOT_FOUND: ErrorResponse,
  [index: string]: ErrorResponse
}


let errors: Errors = {
  ROUTE_NOT_FOUND: {
    status: 404,
    message: `That action seems to be invalid!`,
  }
};


for(const key in errors) {
  errors[key].error = key;
}

export default errors;