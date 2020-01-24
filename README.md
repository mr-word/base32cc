[b32x](https://word.site/2019/11/13/base32x/)
---

[base32cx](https://word.site/2019/11/13/base32cx/) is a base32 encoding with letter-case checksum.

It uses the alphabet `456789ABCDEFGHIJKLMNOPQRSTUVWXYZ` to maximize the expected number of checksum bits.

It's pronounced "base 32 **checks**" or shortened to "b32x". (Don't say "base32x", because that's a homophone for "base32hex".)

This is the first implementation. It is not efficient and the canonical tests need to be verified. Please consider making your own implementation.

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

Some Example
---

```
ASCII

ascii    : H
base32cx : d4
ascii    : He
base32cx : d5MK
ascii    : Hel
base32cx : D5MQs
ascii    : Hell
base32cx : D5mqSV4
ascii    : Hello
base32cx : d5mQSv7j
ascii    : Hello!
base32cx : d5MQsv7J88


HEX

256-bit hash
hex:  bbb464a9804ce0caa2c344ec7c98c70c69722113cda2393779fbc7f0cc116673
b32x: riUADEg4dnKgpcq7CNqbtaab5LoR8cCntQl7mhvTZJ7z5N4LGTtk

160-bit bitcoin address (base58)
base58  1MrWordHHqEDFQUjQ59xFNSA94759VJC35  (version byte + 160bit + 4 checksum bytes)
hex:    E4BFC7B7C4D354282F1DEA549B6776A740853B2D
b32x:   WMzwJHy8Uhe6kFSXXDedQTVQoX4ceitH
```


