const Fraction = class {
  /**
   * 
   * @param {BigInt} numerator 
   * @param {BigInt} denominator 
   */
  constructor(numerator, denominator = 1n) {
    if (denominator == 0) {
      throw 'Zero Div';
    }
    /** @type {BigInt} */
    this.numerator = BigInt(numerator)
    /** @type {BigInt} */
    this.denominator = BigInt(denominator);
    this.common();
  }

  /**
   * 
   * @returns {Fraction}
   */
  common() {
    if (this.denominator < 0) {
      this.numerator *= -1n;
      this.denominator *= -1n;
    }
    const gcd = frac.gcd(
      frac.abs(this.numerator), this.denominator
    );
    this.numerator /= gcd;
    this.denominator /= gcd;
    return this;
  };

  /**
   * 
   * @returns {BigInt[]}
   */
  get args() {
    return [this.numerator, this.denominator];
  }

  /**
   * 
   * @returns {Number}
   */
  float() {
    return Number(this.numerator) / Number(this.denominator);
  }

  /**
   * 
   * @param {Fraction} other 
   * @returns {Fraction}
   */
  iadd(other) {
    if (!(other instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    this.numerator *= other.denominator;
    this.numerator += other.numerator * this.denominator;
    this.denominator *= other.denominator;
    this.common();
    return this;
  }

  /**
   * 
   * @param {Fraction} other 
   * @returns {Fraction}
   */
  isub(other) {
    return this.iadd(frac.neg(other));
  }

  /**
   * 
   * @param {Fraction} other 
   * @returns {Fraction}
   */
  imul(other) {
    if (!(other instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    this.numerator *= other.numerator;
    this.denominator *= other.denominator;
    this.common();
    return this;
  }

  /**
   * 
   * @param {Fraction} other 
   * @returns {Fraction}
   */
  idiv(other) {
    if (!(other instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    if (other.numerator == 0) {
      throw 'Zero Div';
    }
    this.numerator *= other.denominator;
    this.denominator *= other.numerator;
    this.common();
    return this;
  }

  /**
   * 
   * @returns {string}
   */
  to_str() {
    return '' + this.numerator + '/' + this.denominator;
  }

  /**
   * 
   * @returns {Fraction}
   */
  copy() {
    return new Fraction(this.numerator, this.denominator);
  }
}; // class Fraction

const frac = new (function () {
  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.add = (lhs, rhs) => {
    return (new Fraction(...lhs.args)).iadd(rhs);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.sub = (lhs, rhs) => {
    return (new Fraction(...lhs.args)).isub(rhs);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.mul = (lhs, rhs) => {
    return (new Fraction(...lhs.args)).imul(rhs);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.div = (lhs, rhs) => {
    return (new Fraction(...lhs.args)).idiv(rhs);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @returns {Fraction}
   */
  this.neg = (lhs) => {
    if (!(lhs instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    return new Fraction(-lhs.numerator, lhs.denominator);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.eq = (lhs, rhs) => {
    if (!(lhs instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    if (!(rhs instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    return (
      lhs.numerator == rhs.numerator
      && lhs.denominator == rhs.denominator
    );
  };

  /**
     * 
     * @param {Fraction} lhs 
     * @param {Fraction} rhs 
     * @returns {Fraction}
     */
  this.neq = (lhs, rhs) => {
    return !this.eq(lhs, rhs);
  };

  /**
     * 
     * @param {Fraction} lhs 
     * @param {Fraction} rhs 
     * @returns {Fraction}
     */
  this.lt = (lhs, rhs) => {
    if (!(lhs instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    if (!(rhs instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    return this.sub(lhs, rhs).numerator < 0;
  };

  /**
     * 
     * @param {Fraction} lhs 
     * @param {Fraction} rhs 
     * @returns {Fraction}
     */
  this.gt = (lhs, rhs) => {
    return this.lt(rhs, lhs);
  };

  /**
     * 
     * @param {Fraction} lhs 
     * @param {Fraction} rhs 
     * @returns {Fraction}
     */
  this.le = (lhs, rhs) => {
    return !this.lt(rhs, lhs);
  };

  /**
     * 
     * @param {Fraction} lhs 
     * @param {Fraction} rhs 
     * @returns {Fraction}
     */
  this.ge = (lhs, rhs) => {
    return !this.lt(lhs, rhs);
  };

  /**
   * 
   * @param {Fraction} x 
   * @returns {Fraction}
   */
  this.floor = (x) => {
    if (!(x instanceof Fraction)) {
      throw 'The arguments need Fraction';
    }
    const f = x.numerator / x.denominator;
    if (this.lt(x, new Fraction(0)) && x.denominator != 1) {
      return new Fraction(f - 1n);
    }
    return new Fraction(f);
  }

  /**
   * 
   * @param {Fraction} x 
   * @returns {Fraction}
   */
  this.ceil = (x) => {
    return this.neg(this.floor(this.neg(x)));
  }

  /**
   * 
   * @param {BigInt} x 
   * @param {BigInt} y 
   * @returns {BigInt}
   */
  this.gcd = (x, y) => {
    if (y == 0) {
      return x;
    }
    return this.gcd(y, x % y);
  };

  /**
  * 
  * @param {BigInt} x 
  * @returns {BigInt}
  */
  this.abs = (x) => {
    if (x < 0) {
      return -x;
    }
    return x;
  };
});
