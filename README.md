[b32x](https://word.site/2019/11/13/base32x/)
---

[base32cx](https://word.site/2019/11/13/base32cx/) (pronounced "base 32 checks" shortened to `b32x`) is a base32 encoding with letter-case checksum.

Don't say "base32x", because that's a homophone for "base32hex".

This is the first implementation. It is not efficient and the canonical tests need to be verified. Please consider making your own implementation.

Example
---

```
256-bit hash
hex:  bbb464a9804ce0caa2c344ec7c98c70c69722113cda2393779fbc7f0cc116673
b32x: riUADEg4dnKgpcq7CNqbtaab5LoR8cCntQl7mhvTZJ7z5N4LGTtk

160-bit bitcoin address (base58)
(version byte + 160bit + 4 checksum bytes)
1MrWordHHqEDFQUjQ59xFNSA94759VJC35

hex:  E4BFC7B7C4D354282F1DEA549B6776A740853B2D
b32x: WMzwJHy8Uhe6kFSXXDedQTVQoX4ceitH
```

Usage
---

`npm install b32x`

```
const b32x = require('b32x')

const hex = 'ff00f0f0'
let encoded = b32x.fromHex(hex)
console.log(encoded) // 'zw4J5W4'
let decoded = b32x.toHex(encoded)
expect(encoded).to.deep.equal(decoded)

const bytes = [255, 0, 240, 240]
encoded = b32x.fromBytes(bytes)
console.log(encoded) // 'zw4J5W4'
decoded = b32x.toBytes(encoded)
expect(encoded).to.deep.equal(decoded)
```
