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
   * @param {Fraction} other 
   * @returns {Fraction}
   */
  iadd(other) {
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
    if (this.numerator == 0) {
      throw 'Zero Div';
    }
    this.numerator *= other.denominator;
    this.denominator *= other.numerator;
    return this;
  }
};

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
    return new Fraction(-lhs.numerator, lhs.denominator);
  };

  /**
   * 
   * @param {Fraction} lhs 
   * @param {Fraction} rhs 
   * @returns {Fraction}
   */
  this.eq = (lhs, rhs) => {
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
