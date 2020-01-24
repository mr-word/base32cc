const sha256 = require('js-sha256').sha256

const alphabet = '456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function hex2bytes (hex) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    const _byte = parseInt(hex.substr(i, 2), 16)
    bytes.push(_byte)
  }
  return bytes
}

function getBit (_byte, index) {
  return 1 & (_byte >> (7 - (index % 8)))
}

function packBit (_byte, index, bit) {
  return _byte | (0xff & (bit << (7 - index % 8)))
}

function encode (bytes) {
  if (bytes.length > (1024 * 1024) - 1) {
    throw new Error('base32cx encode is not defined for data longer than 2^20-1 bytes.')
  }
  const hash = sha256(bytes)
  const hashbytes = hex2bytes(hash)
  const bitlen = bytes.length * 8
  const outbytes = []
  for (let i = 0; i < bitlen; i++) {
    // the i'th bit is in the i/8th byte at the i%8th position
    //  (left to right, most-significant bit first)
    // it goes into the i/5th char into the (2+(i%5))'th position
    //  (left to right, most-sigificant bit first)
    // ie, 01010101 -> ___01010 ___101**
    const i8 = Math.floor(i / 8)
    const i5 = Math.floor(i / 5)
    const bit = getBit(bytes[i8], i % 8)
    if (outbytes[i5] === undefined) {
      outbytes[i5] = 0
    }
    outbytes[i5] = packBit(outbytes[i5], 3 + i % 5, bit)
  }
  const chars = outbytes.map((x) => alphabet[x])
  for (let i = 0; i < chars.length; i++) {
    const ii = i % 256
    const hashbit = getBit(hashbytes[Math.floor(ii / 8)], ii % 8)
    if (hashbit == 0) {
      chars[i] = chars[i].toLowerCase()
    }
  }
  return chars.join('')
}

function decode (str) {
  if (str.length > ((1024 * 1024 - 1) * (8 / 5))) {
    throw new Error('base32cc decode is not defined for strings longer than 1677720 characters (2^20 decoded bytes).')
  }
  const rem = str.length % 8
  if (rem == 1 || rem == 3 || rem == 6) {
    throw new Error(`Invalid base32cc encoding inferred from length ${str.length}`)
  }
  const bitlen = str.length * 5
  const raw = str.toUpperCase()
  const outbytes = []
  for (let i = 0; i < bitlen; i++) {
    const i8 = Math.floor(i / 8)
    const i5 = Math.floor(i / 5)
    const c = raw[i5]
    const b = alphabet.indexOf(raw[i5])
    const bit = getBit(b, 3 + i % 5)
    if (outbytes[i8] === undefined) {
      outbytes[i8] = 0
    }
    outbytes[i8] = packBit(outbytes[i8], i % 8, bit)
  }
  if (str.length % 8 != 0) {
    outbytes.pop()
  }
  const hashbytes = hex2bytes(sha256(outbytes))
  for (let i = 0; i < str.length; i++) {
    const ii = i % 256
    const hashbit = getBit(hashbytes[Math.floor(ii / 8)], ii % 8)
    const c = str[i]
    if (hashbit == 0) {
      if (isNaN(c) && c == c.toUpperCase()) {
        throw new Error(`Checksum failed, expected character ${str[i]} at position ${i} to be lowercase`)
      }
    } else {
      if (isNaN(c) && c == c.toLowerCase()) {
        throw new Error(`Checksum failed, expected character ${str[i]} at position ${i} to be uppercase`)
      }
    }
  }
  return outbytes
}

module.exports = {
  getBit: getBit,
  packBit: packBit,
  encode: encode,
  decode: decode,
  hex2bytes: hex2bytes
}
