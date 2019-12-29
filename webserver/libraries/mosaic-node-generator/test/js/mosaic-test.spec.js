'use strict';
var expect = require('chai').expect;
var index = require('../../dist/index.d.ts');
describe('test function mosaic', () => {
    it('should work', () => {
        var result = index.mosaic( 'profile.jpg', 'tiles' );
        expect(result).to.equal(null);
    });
});