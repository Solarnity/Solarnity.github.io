export const VigenereCipher = (str, key, decrypt = false) => {
  if (!str || !key) return str;
  const keyStr = key.toLowerCase().replace(/[^a-z]/g, "");
  if (keyStr.length === 0) return str;

  let keyIndex = 0;
  return str.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const isUpperCase = char === char.toUpperCase();
      const code = char.toLowerCase().charCodeAt(0) - 97;
      const keyCode = keyStr[keyIndex % keyStr.length].charCodeAt(0) - 97;
      
      let newCode = decrypt 
        ? (code - keyCode + 26) % 26 
        : (code + keyCode) % 26;

      keyIndex++;
      const resultChar = String.fromCharCode(newCode + 97);
      return isUpperCase ? resultChar.toUpperCase() : resultChar;
    }
    return char;
  }).join('');
};