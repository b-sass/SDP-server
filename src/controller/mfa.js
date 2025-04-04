import * as crypto from "node:crypto";

/**
 * 
 * @param {string} str 
 * @param {number} len 
 * @param {string} ch 
 * @returns {string}
 */
function leftPad(str, len, ch) {
    len = len - str.length + 1;
    return Array(len).join(ch) + str;
}

/**
 * 
 * @param {string} base32 
 * @returns {string} 
 */
function base32ToHex (base32) {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";
  
    for (let i = 0; i < base32.length; i++) {
      const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      bits += leftPad(val.toString(2), 5, "0");
    }
  
    for (let i = 0; i + 4 <= bits.length; i += 4) {
      const chunk = bits.substring(i, i + 4);
      hex += parseInt(chunk, 2).toString(16);
    }
  
    return hex;
}

/**
 * Converts a hexadecimal string to a Base32 string.
 * @param {string} hex - The hexadecimal string to encode.
 * @returns {string} - The Base32 encoded string.
 */
function hexToBase32(hex) {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let base32 = "";

    // Convert each hex character to its binary representation
    for (let i = 0; i < hex.length; i++) {
        const binary = hex.charCodeAt(i).toString(2).padStart(8, "0");
        bits += binary;
    }

    // Group bits into chunks of 5 and map to Base32 characters
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substring(i, i + 5);
        const index = parseInt(chunk, 2);
        base32 += base32chars[index] || "";
    }

    // Add padding if necessary
    while (base32.length % 8 !== 0) {
        base32 += "=";
    }

    return base32;
}

/**
 * 
 * @param {string} userToken 
 * @param {string} secret
 * @param {number} tolerance
 * @param {string} algorithm
 * @param {number} digits
 * @param {number} period
 * @returns {boolean}
 */
function confirm(
    userToken,
    secret,
    tolerance = 1,
    algorithm = "sha1",
    digits = 6,
    period = 30
) {
    const currentToken = generateTOTP(secret, algorithm, digits, period);
  
    // If userToken matches the currentToken, return true
    if (userToken === currentToken) return true;
  
    // If a tolerance is set (for clock drift or slight time mismatches),
    // generate tokens for the previous and next intervals.
    for (let i = 1; i <= tolerance; i++) {
      if (
        userToken ===
        generateTOTPForTimeOffset(secret, i, algorithm, digits, period) ||
        userToken ===
        generateTOTPForTimeOffset(secret, -i, algorithm, digits, period)
      ) {
        return true;
      }
    }
  
    return false;
}
 
/**
 * 
 * @param {string} secret 
 * @param {string} offset
 * @param {string} algorithm
 * @param {number} digits
 * @param {number} period
 * @returns {string}
 */
function generateTOTPForTimeOffset (  
    secret,
    offset,
    algorithm = "sha1",
    digits = 6,
    period = 30
) {
    const timeCounter = Math.floor(Date.now() / 1000 / period) + offset;
    const hexCounter = leftPad(timeCounter.toString(16), 16, "0");
  
    const decodedSecret = Buffer.from(base32ToHex(secret), "hex");
    const hmac = createHmac(algorithm, decodedSecret)
      .update(Buffer.from(hexCounter, "hex"))
      .digest();
  
    const offsetByte = hmac[hmac.length - 1] & 0xf;
    const binaryCode =
      ((hmac[offsetByte] & 0x7f) << 24) |
      ((hmac[offsetByte + 1] & 0xff) << 16) |
      ((hmac[offsetByte + 2] & 0xff) << 8) |
      (hmac[offsetByte + 3] & 0xff);
  
    const otp = binaryCode % Math.pow(10, digits);
  
    return leftPad(otp.toString(), digits, "0");
}

/**
 * @param {string} secret
 * @param {string} algorithm
 * @param {Number} digits
 * @param {Number} period
 * @returns {string}
 */
let generateTOTP = (
    secret,
    algorithm = "sha1",
    digits = 6,
    period = 30
) => {
    const timeCounter = Math.floor(Date.now() / 1000 / period);
    const hexCounter = leftPad(timeCounter.toString(16), 16, "0");
  
    const decodedSecret = Buffer.from(base32ToHex(secret), "hex");
    const hmac = crypto.createHmac(algorithm, decodedSecret)
      .update(Buffer.from(hexCounter, "hex"))
      .digest();
  
    const offset = hmac[hmac.length - 1] & 0xf;
    const binaryCode =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
  
    const otp = binaryCode % Math.pow(10, digits);
  
    return leftPad(otp.toString(), digits, "0");
}

/**
 * 
 * @returns {string}
 */
let generateKey = () => {
    return crypto.randomBytes(20).toString("hex")
}

// const key = generateKey()
// console.log(`Key: ${key}`)
// const key32 = hexToBase32(key)
// console.log(`Key32: ${key32}`)
// console.log(generateTOTP("GIYWEZRVHE2TINJVMVSWGMTEGU2WENLDME2DMMDBGEYGMNBQGQZWCODDGRSDOMLF"))

export { confirm, generateTOTP, generateKey, hexToBase32 };