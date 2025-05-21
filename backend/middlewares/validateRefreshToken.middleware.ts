import { verifyRefreshToken } from "../services/jwt.service";
import { type JwtPayload } from "jsonwebtoken";

interface IAuthResult {
    isSuccess: boolean;
    responseBody: {
        status: number;
        message: string;
        data: null | JwtPayload;
    }
}

/**
 * Check RefreshToken in cookie
 */
function getRefreshTokenFromCookie(req: Request) {
    const cookieHeader = req.headers.get('cookie');
    if(!cookieHeader) return null;

    console.log("cookieHeader ", cookieHeader);

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        if(key) {
            acc[key.trim()] = value?.trim() || "";
        }
        return acc;
    }, {} as Record<string, string>);

    console.log("cookies ", cookies);

    return cookies["refreshToken"] || null;
}


function validateRefreshToken(req: Request) {
    const refreshToken = getRefreshTokenFromCookie(req);

    const resultInit: IAuthResult = {
        isSuccess: false,
        responseBody: {
            status: 0,
            message: "",
            data: null,
        }
    }

    if(!refreshToken) {
        resultInit.responseBody.message = "RefreshToken is required";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    const validationTokenResult = verifyRefreshToken(refreshToken);
    
    if(validationTokenResult.error && validationTokenResult.error.message === "jwt expired") {
        resultInit.responseBody.message = "RefreshToken expired";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    if(!validationTokenResult.isValid) {
        resultInit.responseBody.message = "RefreshToken is invalid";
        resultInit.responseBody.status = 401;
        return resultInit;
    }

    resultInit.isSuccess = true;
    resultInit.responseBody.message = "Authorized";
    resultInit.responseBody.status = 200;
    resultInit.responseBody.data = validationTokenResult.result as JwtPayload;
    return resultInit;
}

export default validateRefreshToken;