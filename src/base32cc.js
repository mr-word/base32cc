const sha256 = require('js-sha256').sha256;

function hex2bytes(hex) {
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        let _byte = parseInt(hex.substr(i, 2), 16);
        bytes.push(_byte);
    }
    return bytes;
}

module.exports = class B32CC {

    constructor() {
        this.alphabet = '456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }

    _getBit(_byte, index) {
        return 1 & (_byte >> (7-(index%8)));
    }

    _packBit(_byte, index, bit) {
        return _byte | (0xff & (bit << (7 - index%8)))
    }

    encode (bytes, verbose) {
        if( verbose )
            console.log(`encode ${bytes}`);
        if( bytes.length > (1024 * 1024) - 1 ) {
            throw new Error("base32cc encode is not defined for data longer than ((10^20)-1) bytes.");
        }
        const hash = sha256(bytes);
        const hashbytes = hex2bytes(hash);
        const bitlen = bytes.length * 8;
        let outbytes = [];
        for (let i = 0; i < bitlen; i++) {
            // the i'th bit is in the i/8th byte at the i%8th position
            //  (left to right, most-significant bit first)
            // it goes into the i/5th char into the (2+(i%5))'th position
            //  (left to right, most-sigificant bit first)
            // ie, 01010101 -> ___01010 ___101**
            let i8 = Math.floor(i/8);
            let i5 = Math.floor(i/5);
            let bit = this._getBit(bytes[i8], i%8)
            if( outbytes[i5] === undefined ) {
                outbytes[i5] = 0;
            }
            outbytes[i5] = this._packBit(outbytes[i5], 3 + i%5, bit);
        }
        let chars = outbytes.map((x) => this.alphabet[x]);
        for( let i = 0; i < chars.length; i++) {
            let ii = i % 256;
            let hashbit = this._getBit(hashbytes[Math.floor(ii/8)], ii%8);
            if( hashbit == 0 ) {
                chars[i] = chars[i].toLowerCase();
            }
        }
        return chars.join('');
    }

    decode (str, verbose) {
        if (verbose) {
            console.log(`decode ${str}`);
        }
        if( str.length > ((1024*1024 - 1) * (8/5)) ) {
            throw new Error("base32cc decode is not defined for strings longer than 1677720 characters.");
        }
        let rem = str.length % 8;
        if (rem == 1 || rem == 3 || rem == 6) {
            throw new Error(`Invalid base32cc encoding inferred from length ${str.length}`)
        }
        const bitlen = str.length * 5;
        const raw = str.toUpperCase();
        let outbytes = [];
        for( let i = 0; i < bitlen; i++ ) {
            let i8 = Math.floor(i/8);
            let i5 = Math.floor(i/5);
            let c = raw[i5];
            let b = this.alphabet.indexOf(raw[i5]);
            let bit = this._getBit(b, 3 + i%5);
            if (outbytes[i8] === undefined) {
                outbytes[i8] = 0;
            }
            outbytes[i8] = this._packBit(outbytes[i8], i%8, bit);
        }
        if (str.length % 8 != 0) { // && (str.length % 2 == 0 || str.length == 7)) {
            outbytes.pop();
        }
        let hashbytes = hex2bytes(sha256(outbytes));
        for( let i = 0; i < str.length; i++) {
            let ii = i % 256;
            let hashbit = this._getBit(hashbytes[Math.floor(ii/8)], ii%8);
            let c = str[i];
            if( hashbit == 0 ) {
                if( isNaN(c) && c == c.toUpperCase() ) {
                    throw new Error(`Checksum failed, expected character ${str[i]} at position ${i} to be lowercase`);
                }
            } else {
                if( isNaN(c) && c == c.toLowerCase() ) {
                    throw new Error(`Checksum failed, expected character ${str[i]} at position ${i} to be uppercase`);
                }
            }
        }
        return outbytes;
    }
}
