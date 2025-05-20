// backend/tests/password-test.ts
import { hashPassword, comparePassword } from "../utils/password.util";

async function testPassword() {
  // 1. 테스트 비밀번호
  const testPassword = "password123";
  
  // 2. 새로운 해시 생성
  const newHash = await hashPassword(testPassword);
  console.log("New hash:", newHash);
  
  // 3. 새로 생성한 해시와 비교
  const result1 = await comparePassword(testPassword, newHash);
  console.log("Should be true:", result1);
  
  // 4. 데이터베이스에서 가져온 해시와 비교
  const dbHash = "$2b$10$NTmKVu03Ag2hej4y5WZQWuVhpk2IgFK1Bi8BsfRgJufh8cTHuH7Wy";
  const result2 = await comparePassword(testPassword, dbHash);
  console.log("DB hash comparison:", result2);
}

testPassword().catch(console.error);