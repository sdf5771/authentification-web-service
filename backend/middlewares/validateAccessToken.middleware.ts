import { verifyAccessToken } from "../services/jwt.service";
import { type JwtPayload } from "jsonwebtoken";

interface IAuthResult {
    isSuccess: boolean;
    responseBody: {
        status: number;
        message: string;
        data: null | JwtPayload;
    }
}
function validateAccessToken(req: Request) {
    const accessToken = req.headers.get("Authorization")?.split(" ")[1];
    const resultInit: IAuthResult = {
        isSuccess: false,
        responseBody: {
            status: 0,
            message: "",
            data: null,
        }
    }

    if(!accessToken) {
        resultInit.responseBody.message = "AccessToken is required";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    const validationTokenResult = verifyAccessToken(accessToken);
    
    if(validationTokenResult.error && validationTokenResult.error.message === "jwt expired") {
        resultInit.responseBody.message = "AccessToken expired";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    if(!validationTokenResult.isValid) {
        resultInit.responseBody.message = "AccessToken is invalid";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    resultInit.isSuccess = true;
    resultInit.responseBody.message = "Authorized";
    resultInit.responseBody.status = 200;
    resultInit.responseBody.data = validationTokenResult.result as JwtPayload;
    return resultInit;
}

export default validateAccessToken;