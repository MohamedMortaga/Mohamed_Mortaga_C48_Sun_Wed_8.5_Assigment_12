import { ForbiddenException } from "../common/exceptions/app.exceptions.js";

// function authorization(role) {
//   return async function (req, res, next) {
//     if (req.user.role < role) {
//       throw ForbiddenException({ errMsg: "You don't have access" });
//     }

//     next();
//   };
// }

function authorization(roles = []) {
  return async function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      throw ForbiddenException({ errMsg: "You don't have access" });
    }

    next();
  };
}

export default authorization;
