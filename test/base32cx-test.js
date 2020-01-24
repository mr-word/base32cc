const want = require('chai').expect

const b32x = require('../src/base32cx.js')

function ascii2bytes (a) {
  return a.split('').map((a) => { return a.charCodeAt(0) })
}

describe('base32cx', () => {
  it('canonical test cases', () => {
    function pass (str) {
      console.log(`ascii    : ${str}`)
      const bytes = ascii2bytes(str)
      const encoded = b32x.encode(bytes)
      console.log(`base32cx : ${encoded}`)
      const decoded = b32x.decode(encoded)
      want(b32x.decode(
        b32x.encode(ascii2bytes(str))))
        .to.deep.equal(ascii2bytes(str))
    }

    pass('H')
    pass('He')
    pass('Hel')
    pass('Hell')
    pass('Hello')
    pass('Hello!')

    pass('abcdef')
    pass('\x00abc\x00def')

    pass('000011112222333344445555666677778888')
    pass('000000001111111122222222333333334444444455555555666666667777777788888888')
    pass(Array(513).fill('!').join(''))

    // multibase repo test cases
    pass('Decentralize everything!!')
    pass('yes mani !')
    pass('hello world')
    pass('\x00yes mani !')
    pass('\x00\x00yes mani !')
  })

  it('values from the wild', () => {
    console.log('160-bit address')
    console.log('1MrWordHHqEDFQUjQ59xFNSA94759VJC35 (version byte + 160bit + 4 checksum bytes)')
    const mrWordHex = 'E4BFC7B7C4D354282F1DEA549B6776A740853B2D'
    console.log(mrWordHex, '(hex)')
    const mrWordBytes = b32x.hex2bytes(mrWordHex)
    let encoded = b32x.encode(mrWordBytes)
    console.log(encoded, '(base32x)')
    let decoded = b32x.decode(encoded)
    want(decoded).to.deep.equal(mrWordBytes)

    console.log('256-bit hash')
    const someHashHex = 'bbb464a9804ce0caa2c344ec7c98c70c69722113cda2393779fbc7f0cc116673'
    console.log(someHashHex, '(hex)')
    const bytes = b32x.hex2bytes(someHashHex)
    encoded = b32x.encode(bytes)
    console.log(encoded, '(base32x)')
    decoded = b32x.decode(encoded)
    want(decoded).to.deep.equal(bytes)
  })

  it('packBit', () => {
    want(b32x.packBit(0x00, 0, 1)).to.equal(128)
    want(b32x.packBit(0x00, 7, 1)).to.equal(1)
  })
  it('getBit', () => {
    want(b32x.getBit(0x01, 7)).to.equal(1)
    want(b32x.getBit(0x01, 6)).to.equal(0)
    want(b32x.getBit(0x02, 6)).to.equal(1)
    want(b32x.getBit(128, 0)).to.equal(1)
    want(b32x.getBit(0, 4)).to.equal(0)

    want(b32x.getBit(['\0'][0], 0)).to.equal(0)
    want(b32x.getBit([128][0], 0)).to.equal(1)
  })
  it('data too long to encode', () => {
    const oversize = 1024 * 1024
    const bigBytes = Array(oversize).fill(0)
    want(() => { b32x.encode(bigBytes) }).to.throw
    b32x.encode(Array(oversize - 1).fill(0))
  })
  it('encode', () => {
    // 00000001 (00..) -> ___00000 ___001(00)
    //                      (0->4)   (4->8)
    want(b32x.encode([0x01, 0, 0, 0, 0])).to.deep.equal('48444444')
    // 00001001 (00..) -> ___00001 ___001(00)
    //                      (1->5)   (4->8)
    want(b32x.encode([0x09, 0, 0, 0, 0])).to.deep.equal('58444444')
  })
  it('decode', () => {
    want(b32x.decode('48444444')).to.deep.equal([1, 0, 0, 0, 0])
  })
  it('x == encode(decode(x))', () => {
    function pass (str) {
      want(b32x.encode(b32x.decode(str))).to.equal(str)
    }
    pass('44')
    pass('48444444')
    pass('58444444')
    pass('5844444')
    pass('58444')
    pass('5844')
    pass('58')
  })
  it('x == decode(encode(x))', () => {
    function pass (bytes) {
      want(b32x.decode(b32x.encode(bytes))).to.deep.equal(bytes)
    }
    pass([0, 0, 0, 0, 0])
    pass([0, 0, 0, 0, 1])
    pass([1, 0, 0, 0, 1])
    const trials = 10
    const max = 20
    console.log(`running ${trials * max} tests up to length ${max}, this will take some time...`)
    for (let trial = 0; trial < trials; trial++) {
      for (let len = 0; len < max; len++) {
        const arr = []
        for (let i = 0; i < 20; i++) {
          arr.push(Math.floor(256 * Math.random()))
          pass(arr)
        }
      }
    }
  }).timeout(0)

  it('usage from readme', ()=>{
      let hex = 'ff00f0f0'
      let encoded = b32x.fromHex(hex)
      console.log(encoded)
      let decoded = b32x.toHex(encoded)
      want(decoded).to.deep.equal(hex)

      let bytes = [255, 0, 240, 240]
      encoded = b32x.fromBytes(bytes)
      console.log(encoded)
      decoded = b32x.toBytes(encoded)
      want(decoded).to.deep.equal(bytes)

  })
})
