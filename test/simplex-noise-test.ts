import SimplexNoise from '../simplex-noise';
import {buildPermutationTable} from '../simplex-noise';
import alea from 'alea';
import {assert} from 'chai';


import {assertMatchesImage, sampleFunctionToImageData} from './matches-snapshot';

describe('SimplexNoise', function() {
  function getRandom() {
    return alea('seed');
  }

  describe('buildPermutationTable', function() {
    it('contains all indices exactly once', function() {
      const table = buildPermutationTable(getRandom());
      const aTable = Array.prototype.slice.call(table);
      for (let i = 0; i < aTable.length; i++) {
        assert.include(aTable, i);
      }
    });
    it('can contain 0 in the first position', function() {
      function zero() { return 0; }
      const table = buildPermutationTable(zero);
      const aTable = Array.prototype.slice.call(table);
      for (let i = 0; i < aTable.length; i++) {
        assert.equal(aTable[i], i);
      }
    });
    it('matches snapshot', function() {
      const table = buildPermutationTable(getRandom());

      const actual = {width: 16, height: 16, data: new Uint8ClampedArray(table)};
      assertMatchesImage(actual, 'permutationTable.png');
    });
  });

  describe('constructor', function() {
    function checkPermutationTable(simplex: SimplexNoise) {
      assert.equal(simplex['perm'].length, 512);
      assert.equal(simplex['permMod12'].length, 512);
      for (let i = 0; i < 512; i++) {
        assert.isBelow(simplex['perm'][i], 256);
        assert.isAtLeast(simplex['perm'][i], 0);
        assert.equal(simplex['perm'][i], simplex['perm'][i & 255]);
        assert.equal(simplex['permMod12'][i], simplex['perm'][i] % 12);
      }
    }

    it('should initialize with Math.random', function() {
      const simplex = new SimplexNoise();
      checkPermutationTable(simplex);
    });

    it('should initialize with a custom random function', function() {
      const simplex = new SimplexNoise(getRandom());
      checkPermutationTable(simplex);
    });

    it('should initialize with seed', function() {
      const simplex = new SimplexNoise('seed');
      checkPermutationTable(simplex);
    });

    it('should initialize consistently when using the same seed', function() {
      const a = new SimplexNoise('seed');
      const b = new SimplexNoise('seed');
      assert.deepEqual(a, b);
      assert.equal(a.noise2D(1, 1), b.noise2D(1, 1));
    });

    it('should initialize differently when using a different seed', function() {
      const a = new SimplexNoise('seed');
      const b = new SimplexNoise('different seed');
      assert.notDeepEqual(a, b);
      assert.notEqual(a.noise2D(1, 1), b.noise2D(1, 1));
    });
  });

  describe('noise', function() {
    let simplex: SimplexNoise;
    beforeEach(function() {
      simplex = new SimplexNoise(getRandom());
    });
    describe('noise2D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise2D(0.1, 0.2), simplex.noise2D(0.1, 0.2));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise2D(0.1, 0.2), simplex.noise2D(0.101, 0.202));
      });
      it('should return a different output with a different seed', function() {
        const simplex2 = new SimplexNoise(alea('other seed'));
        assert.notEqual(simplex.noise2D(0.1, 0.2), simplex2.noise2D(0.1, 0.2));
      });
      it('should return values between -1 and 1', function() {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            assert(simplex.noise2D(x / 5, y / 5) >= -1);
            assert(simplex.noise2D(x / 5, y / 5) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(simplex.noise2D(0.1, 0.2) - simplex.noise2D(0.101, 0.202)) < 0.1);
      });
      it('should match snapshot', function() {
        const actual = sampleFunctionToImageData((x,y)=>simplex.noise2D(x/10,y/10)*128+128, 64, 64);
        assertMatchesImage(actual, 'noise2D.png');
      });
    });

    describe('noise3D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.1, 0.2, 0.3));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.101, 0.202, 0.303));
        assert.notEqual(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.1, 0.2, 0.303));
      });
      it('should return a different output with a different seed', function() {
        const simplex2 = new SimplexNoise(alea('other seed'));
        assert.notEqual(simplex.noise3D(0.1, 0.2, 0.3), simplex2.noise3D(0.1, 0.2, 0.3));
      });
      it('should return values between -1 and 1', function() {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            assert(simplex.noise3D(x / 5, y / 5, x + y) >= -1);
            assert(simplex.noise3D(x / 5, y / 5, x + y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(simplex.noise3D(0.1, 0.2, 0.3) - simplex.noise3D(0.101, 0.202, 0.303)) < 0.1);
      });
      it('should match snapshot', function() {
        const actual = sampleFunctionToImageData((x,y)=>simplex.noise3D(x/10,y/10,(x+y)/2)*128+128, 64, 64);
        assertMatchesImage(actual, 'noise3D.png');
      });
    });

    describe('noise4D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.1, 0.2, 0.3, 0.4));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.101, 0.202, 0.303, 0.404));
        assert.notEqual(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.1, 0.2, 0.3, 0.404));
      });
      it('should return a different output with a different seed', function() {
        const simplex2 = new SimplexNoise(alea('other seed'));
        assert.notEqual(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex2.noise4D(0.1, 0.2, 0.3, 0.4));
      });
      it('should return values between -1 and 1', function() {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            assert(simplex.noise4D(x / 5, y / 5, x + y, x - y) >= -1);
            assert(simplex.noise4D(x / 5, y / 5, x + y, x - y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(
          Math.abs(
            simplex.noise4D(0.1, 0.2, 0.3, 0.4) -
            simplex.noise4D(0.101, 0.202, 0.303, 0.404)
          ) < 0.1);
      });
      it('should match snapshot', function() {
        const actual = sampleFunctionToImageData((x,y)=>simplex.noise4D(x/10,y/10,x/4,y/3)*128+128, 64, 64);
        assertMatchesImage(actual, 'noise4D.png');
      });
    });
  });
});
