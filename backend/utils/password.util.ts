import bcrypt from "bcrypt";

/**
 * 비밀번호 해시화
 * @param password 
 * @returns 
 */
export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

/**
 * 비밀번호 해시화된 비밀번호와 입력받은 비밀번호 비교
 * @param password 
 * @param hashedPassword 
 * @returns 
 */
export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};