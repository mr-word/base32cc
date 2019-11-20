const want = require('chai').expect;

const b32cc = require('../src/base32cc.js');

function ascii2bytes(a) {
    return a.split('').map((a)=>{ return a.charCodeAt(0) });
}

describe('base32cc', ()=>{
    it('canonical test cases', () => {
        function pass(str) {
            console.log(`ascii    : ${str}`);
            let bytes = ascii2bytes(str);
            let encoded = b32cc.encode(bytes);
            console.log(`base32cc : ${encoded}`);
            let decoded = b32cc.decode(encoded);
            want(b32cc.decode(
                    b32cc.encode(ascii2bytes(str))))
                .to.deep.equal(ascii2bytes(str));
        }

        pass('H');
        pass('He');
        pass('Hel');
        pass('Hell');
        pass('Hello');
        pass('Hello!');

        pass('abcdef');
        pass('\x00abc\x00def');

        pass('000011112222333344445555666677778888');
        pass('000000001111111122222222333333334444444455555555666666667777777788888888');
        pass(Array(513).fill('!').join(''));

        // multibase repo test cases
        pass("Decentralize everything!!");
        pass("yes mani !");
        pass("hello world");
        pass("\x00yes mani !");
        pass("\x00\x00yes mani !");
    });

    it('packBit', () => {
        want(b32cc.packBit(0x00, 0, 1)).to.equal(128);
        want(b32cc.packBit(0x00, 7, 1)).to.equal(1);
    });
    it('getBit', () => {
        want(b32cc.getBit(0x01, 7)).to.equal(1);
        want(b32cc.getBit(0x01, 6)).to.equal(0);
        want(b32cc.getBit(0x02, 6)).to.equal(1);
        want(b32cc.getBit(128, 0)).to.equal(1);
        want(b32cc.getBit(0, 4)).to.equal(0);

        want(b32cc.getBit(['\0'][0], 0)).to.equal(0);
        want(b32cc.getBit([128][0], 0)).to.equal(1);
    })
    it('data too long to encode', () => {
        let oversize = 1024 * 1024;
        let bigBytes = Array(oversize).fill(0);
        want(() => { b32cc.encode(bigBytes) }).to.throw;;
        b32cc.encode(Array(oversize - 1).fill(0));
    });
    it('encode', () => {
        // 00000001 (00..) -> ___00000 ___001(00)
        //                      (0->4)   (4->8)
        want(b32cc.encode([0x01, 0, 0, 0, 0])).to.deep.equal('48444444');
        // 00001001 (00..) -> ___00001 ___001(00)
        //                      (1->5)   (4->8)
        want(b32cc.encode([0x09, 0, 0, 0, 0])).to.deep.equal('58444444');
    });
    it('decode', () => {
        want(b32cc.decode('48444444')).to.deep.equal([1, 0, 0, 0, 0]);
    });
    it('x == encode(decode(x))', () => {
        function pass(str) {
            want(b32cc.encode(b32cc.decode(str))).to.equal(str);
        }
        pass('44');
        pass('48444444');
        pass('58444444');
        pass('5844444');
        pass('58444');
        pass('5844');
        pass('58');
    });
    it('x == decode(encode(x))', () => {
        function pass(bytes) {
            want(b32cc.decode(b32cc.encode(bytes))).to.deep.equal(bytes);
        }
        pass([0, 0, 0, 0, 0]);
        pass([0, 0, 0, 0, 1]);
        pass([1, 0, 0, 0, 1]);
        let trials = 5;
        let max = 10;
        console.log(`running ${trials*max} tests up to length ${max}, this will take some time...`);
        for( let trial = 0; trial < trials; trial++ ) {
            for( let len = 0; len < max; len++ ) {
                let arr = [];
                for( let i = 0; i < 20; i++) {
                    arr.push(Math.floor(256*Math.random()));
                    pass(arr);
                }
            }
        }
    }).timeout(0);
});

