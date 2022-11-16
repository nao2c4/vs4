// constant.hpp 相当
/** @type {number} */
const EPS = 1e-8;

// eq.hpp 相当
const Indices = class extends Array {
  /**
  * 
  * @param {number} index 
  * @returns {boolean}
  */
  isin(index) {
    return this.some(x => x == index);
  }

  /**
  * 
  * @param {Indices} expanded_indices 
  * @returns {Indices}
  */
  compress(expanded_indices) {
    let sorted_indices = [...expanded_indices];
    sorted_indices.sort().reverse();
    for (let j = 0; j < sorted_indices.length; ++j) {
      if (this.isin(expanded_indices[j])) {
        const idx = this.findIndex(x => x == expanded_indices[j]);
        this.splice(idx, 1);
      }
    }
    return this;
  }

  to_str() {
    return 'indices : [' + this.join(', ') + ']';
  }

  copy() {
    return Indices.from(this);
  }
}; // class Indices

// eq.hpp 相当
const Eq = class {
  /**
  * 
  * @param {Fraction[]} expr 
  * @param {Fraction} rhs 
  */
  constructor(expr, rhs) {
    /** @type {Fraction[]} */
    this.expr = [...expr.map(x => x.copy())];
    /** @type {Fraction} */
    this.rhs = rhs.copy();
  }

  /**
  * 
  * @param {number} index 
  * @param {Fraction} val 
  * @returns {this}
  */
  set_val(index, val) {
    this.expr[index] = val.copy();
    return this;
  }

  /**
  * 
  * @param {number} index 
  * @returns {Fraction}
  */
  at(index) {
    return this.expr[index]
  }

  /**
  * 
  * @param {Eq} rhs 
  * @returns {this}
  */
  isub(rhs) {
    for (let j = 0; j < this.expr.length; ++j) {
      this.expr[j].isub(rhs.at(j));
    }
    this.rhs.isub(rhs.rhs);
    return this;
  }

  /**
  * 
  * @param {Frac} rhs
  * @returns {Eq} 
  */
  imul(rhs) {
    for (let j = 0; j < this.expr.length; ++j) {
      this.expr[j].imul(rhs);
    }
    this.rhs.imul(rhs);
    return this;
  }

  /**
  * @param {number} index
  * @returns {Fraction}
  */
  value(index) {
    if (frac.eq(this.at(index), new Fraction(0))) {
      throw 'Value is too small';
    }
    return frac.div(this.rhs, this.at(index));
  }

  /**
  * 
  * @returns {number}
  */
  num_vars() { return this.expr.length; }

  /**
  * 
  * @param {number} size 
  * @returns {Eq}
  */
  expand(size) {
    const num_vars = this.num_vars();
    for (let j = 0; j < size - num_vars; ++j) {
      this.expr.push(new Fraction(0));
    }
    return this;
  }

  /**
  * 
  * @param {Indices} indices 
  * @returns {Eq}
  */
  compress(indices) {
    let sorted_indices = [...indices];
    sorted_indices.sort((a, b) => a < b ? -1 : 1).reverse();
    for (let j = 0; j < sorted_indices.length; ++j) {
      this.expr.splice(sorted_indices[j], 1);
    }
    return this;
  }

  /**
   * 
   * @returns {string}
   */
  to_short_str() {
    return '[' + this.expr.concat(this.rhs).map(x => x.float()).join(',') + ']'
  }

  /**
  * 
  * @returns {string}
  */
  to_str() {
    return (
      '['
      + this.expr.map(x => +x.float().toFixed(3)).join(', ')
      + '] == '
      + +this.rhs.float().toFixed(3));
  }

  /**
  * 
  * @returns {Eq}
  */
  copy() { return new Eq([...this.expr.map(x => x.copy())], this.rhs.copy()); }
}; // class Eq

/**
* 
* @param {Eq} lhs 
* @param {Fraction} rhs 
* @returns {Eq}
*/
const mul_eq = (lhs, rhs) => {
  return lhs.copy().imul(rhs);
};

// objective.hpp 相当
const Objective = class {
  /**
  * 
  * @param {Eq} eq 
  */
  constructor(eq) {
    /** @type {Eq} */
    this.eq = eq.copy();
  }

  /**
  * 
  * @param {number} index 
  * @param {Eq} val 
  * @returns {this}
  */
  set_val(index, val) {
    this.eq.set_val(index, val);
    return this;
  }

  /**
  * 
  * @param {number} index 
  * @returns {number}
  */
  at(index) {
    return this.eq.at(index)
  }

  /**
  * 
  * @param {Eq} rhs 
  * @returns {Objective}
  */
  isub(rhs) {
    this.eq.isub(rhs);
    return this;
  }

  /**
  * 
  * @param {number} size 
  * @returns {Objective}
  */
  expand(size) {
    this.eq.expand(size);
    return this;
  }

  /**
  * 
  * @returns {number}
  */
  num_vars() { return this.eq.num_vars(); }

  /**
  * 
  * @param {Indices} indices 
  * @param {number} first 
  * @returns 
  */
  first_negative_index(indices, first) {
    const num_vars = this.num_vars();
    for (let j = first; j < num_vars; ++j) {
      if (frac.lt(this.at(j), new Fraction(0)) && !indices.isin(j)) {
        return j;
      }
    }
    return num_vars;
  }

  /**
  * 
  * @returns {Fraction}
  */
  get rhs() { return this.eq.rhs; }

  /**
   * 
   * @returns {string}
   */
  to_short_str() {
    return this.eq.to_short_str();
  }

  /**
  * 
  * @returns {string}
  */
  to_str() {
    return 'minimize: ' + this.eq.to_str();
  }

  /**
  * 
  * @returns {Objective}
  */
  copy() { return new Objective(this.eq.copy()); }
}; // class Objective

/**
* 
* @param {Fraction[]} arr 
* @returns 
*/
const create_objective = (arr) => {
  return new Objective(new Eq(arr, new Fraction(0)));
};

// cons.hpp 相当
const Cons = class {
  /**
  * 
  * @param {Eq[]} eqs 
  */
  constructor(eqs) {
    /** @type {Eq[]} */
    this.eqs = eqs.map(x => x.copy());
    this.num_cons = eqs.length;
    const size = Math.max(...this.eqs.map(x => x.num_vars()));
    this.expand(size);
    for (let i = 0; i < this.num_cons; ++i) {
      if (frac.lt(this.eqs[i].rhs, new Fraction(0))) {
        this.eqs[i].imul(new Fraction(-1));
      }
    }
  }

  /**
  * 
  * @param {number} index 
  * @returns {Eq}
  */
  at(index) {
    return this.eqs.at(index)
  }

  /**
  * 
  * @returns {number}
  */
  num_vars() { return this.num_cons == 0 ? 0 : this.eqs[0].num_vars(); }

  /**
  * 
  * @param {number} size 
  * @returns {Cons}
  */
  expand(size) {
    this.eqs.forEach(eq => eq.expand(size));
    return this;
  }

  /**
  * 
  * @param {Indices} expanded_indices 
  * @returns {Cons}
  */
  compress(expanded_indices) {
    this.eqs.forEach(eq => eq.compress(expanded_indices));
    return this;
  }

  /**
  * 
  * @param {Indices} indices 
  * @param {Indices} expanded_indices 
  * @returns {Cons}
  */
  compress_cons(indices, expanded_indices) {
    for (let i = this.num_cons - 1; i >= 0; --i) {
      if (expanded_indices.isin(indices[i])) {
        this.eqs.splice(i, 1);
      }
    }
    this.num_cons = this.eqs.length;
    return this;
  }

  /**
  * 
  * @returns {Indices}
  */
  first_indices() {
    const num_vars = this.num_vars();
    let indices_arr = Array(this.num_cons)
      .fill().map(() => new Indices());
    for (let j = 0; j < num_vars; ++j) {
      let tmp = [];
      let count = 0;
      for (let i = 0; i < this.num_cons; ++i) {
        const val = this.eqs[i].at(j);
        const rhs = this.eqs[i].rhs;
        if (frac.neq(val, new Fraction(0))) {
          ++count;
        }
        if (
          frac.lt(frac.mul(val, rhs), new Fraction(0))
          || frac.le(val, new Fraction(0))
        ) {
          continue;
        }
        tmp.push(i);
      }
      if ((tmp.length == 1) && (count == 1)) {
        indices_arr[tmp[0]].push(j);
      }
    }

    let indices = new Indices();
    for (let i = 0; i < this.num_cons; ++i) {
      if (indices_arr[i].length == 0) {
        indices.push(num_vars);
        continue;
      }
      indices.push(indices_arr[i].at(-1));
    }
    return indices;
  }

  /**
  * 
  * @param {Indices} indices 
  * @returns {boolean}
  */
  need_first_step(indices) {
    const num_vars = this.num_vars();
    return indices.some(x => x == num_vars);
  }

  /**
  * 
  * @param {number} column 
  * @returns {number}
  */
  min_index(column) {
    let row = 0;
    let mi = new Fraction(1e6);
    for (let i = 0; i < this.num_cons; ++i) {
      const eq = this.eqs[i];
      if (frac.le(eq.at(column), new Fraction(0))) {
        continue;
      }
      const val = eq.value(column);
      if (frac.lt(val, mi)) {
        row = i;
        mi = val;
      }
    }
    if (frac.eq(mi, new Fraction(1e6))) {
      return this.num_cons;
    }
    return row;
  }

  /**
  * 
  * @param {number} row 
  * @param {number} column
  * @returns {Cons} 
  */
  reduct(row, column) {
    const denominator = this.eqs[row].at(column);
    if (frac.eq(denominator, new Fraction(0))) {
      throw "Zero";
    }
    for (let i = 0; i < this.num_cons; ++i) {
      if (i == row) {
        continue;
      }
      this.eqs[i].isub(mul_eq(
        this.eqs[row],
        frac.div(this.eqs[i].at(column), denominator),
      ));
    }
    return this;
  }

  /**
  * 
  * @param {number} index 
  * @param {Fraction} rhs 
  * @param {Fraction} ineq
  * @returns {Cons} 
  */
  iadd_con(index, rhs, ineq) {
    const num_vars = this.num_vars()
    let eq = new Eq(Array(num_vars + 1).fill(new Fraction(0)), rhs);
    eq.set_val(index, new Fraction(1));
    eq.set_val(num_vars, ineq);
    this.eqs.push(eq);
    ++this.num_cons;
    this.expand(num_vars + 1);
    return this;
  }

  /**
   * 
   * @returns {string}
   */
  to_short_str() {
    // return '[' + this.eqs.map(x => x.expr.concat(x.rhs).map(y => y.float()).join(',')).join('],[') + ']';
    return '[' + this.eqs.map(x => x.to_short_str()).join(',') + ']';
  }

  /**
  * 
  * @returns {string}
  */
  to_str() {
    return this.eqs.map(
      (x, idx) => (idx == 0 ? '  s.t.  : ' : '          ') + x.to_str()
    ).join('\n')
  }

  /**
   * 
   * @param {Indices} indices 
   * @param {Indices} expanded_indices
   * @returns {Cons} 
   */
  remove_artifact = (indices, expanded_indices) => {
    for (let row = 0; row < this.num_cons; ++row) {
      const expanded_column = indices[row];
      if (expanded_indices.every(x => x != expanded_column)) {
        continue;
      }
      const column = this.eqs.at(row).expr.findIndex(x => frac.neq(x, new Fraction(0)));
      if (column == -1) {
        continue;
      }
      this.reduct(row, column);
      indices[row] = column;
    }
  };

  /**
  * 
  * @returns {Cons}
  */
  copy() { return new Cons(this.eqs.map(x => x.copy())) };
}; // class Cons

/**
* 
* @param {Fraction[][]} arr 
* @returns 
*/
const create_cons = arr => {
  /** @type {Eq[]} */
  let eqs = [];
  const num_cons = arr.length;
  for (let i = 0; i < num_cons; ++i) {
    const eq = new Eq(arr[i].slice(0, -1), arr[i].at(-1));
    eqs.push(eq);
  }
  return new Cons(eqs);
}

/**
* 
* @param {Cons[][]} cons
* @param {number} index
* @param {Fraction} rhs
* @param {Fraction} ineq
* @returns {Cons}
*/
const add_cons = (cons, index, rhs, ineq) => {
  return cons.copy().iadd_con(index, rhs, ineq);
};

// problem.hpp 相当
const Problem = class {
  /**
  * 
  * @param {Objective} objective 
  * @param {Cons} cons 
  * @param {Indices} indices 
  * @param {Indices} expanded_indices 
  */
  constructor(objective, cons, indices, expanded_indices) {
    /** @type {Objective} */
    this.objective = objective.copy();
    /** @type {Cons} */
    this.cons = cons.copy();
    /** @type {Indices} */
    this.indices = indices.copy();
    /** @type {Indices} */
    this.expanded_indices = expanded_indices.copy();
    this.num_vars = Math.max(
      this.objective.num_vars(), this.cons.num_vars()
    );
    this.objective.expand(this.num_vars);
    this.cons.expand(this.num_vars);
    this.num_cons = this.cons.num_cons;
    this.initialize();
  }

  /**
  * 
  */
  initialize() {
    for (let i = 0; i < this.num_cons; ++i) {
      const row = i;
      const column = this.indices[row];
      if (column >= this.num_vars) {
        continue;
      }
      this.reduct_objective(row, column);
    }
  }

  /**
  * 
  * @returns {number}
  */
  solve() {
    let status = this.step();
    while (status < 0) {
      status = this.step();
    }
    return status;
  }

  /**
  * 
  * @param {number} row
  * @param {number} column
  * @returns {Problem}
  */
  reduct_objective(row, column) {
    const denominator = this.cons.at(row).at(column).copy();
    if (frac.eq(this.cons.at(row).at(column), new Fraction(0))) {
      throw 'Zero';
    }
    this.objective.isub(mul_eq(
      this.cons.at(row),
      frac.div(this.objective.at(column), this.cons.at(row).at(column)),
    ));
    return this;
  }

  /**
  * 
  * @param {number} row
  * @param {number} column
  * @returns {Problem}
  */
  reduct(row, column) {
    this.reduct_objective(row, column);
    this.cons.reduct(row, column);
    return this;
  }

  /**
  * 
  * @returns {number}
  */
  step() {
    const column = this.objective.first_negative_index(
      this.indices, 0
    );
    if (column == this.num_vars) {
      return 0;
    }
    const row = this.cons.min_index(column);
    if (row == this.num_cons) {
      return 1;
    }
    // console.log(row, column);
    this.reduct(row, column);
    this.indices[row] = column;
    return -1;
  }

  /**
  * 
  * @returns {Fraction}
  */
  value_objective() {
    return frac.neg(this.objective.rhs);
  }

  /**
  * 
  * @returns {Fraction[]}
  */
  value_variables() {
    /** @type {Fraction[]} */
    let values = Array(this.num_vars).fill(new Fraction(0));
    for (let i = 0; i < this.num_cons; ++i) {
      const column = this.indices[i];
      if (column >= this.num_vars) {
        continue;
      }
      values[column] = this.cons.at(i).value(column).copy();
    }
    return values;
  }
}; // class Problem

/**
* 
* @param {Cons} cons_ 
* @param {Indices} indices_
* @returns {Problem} 
*/
const create_first_problem = (cons_, indices_) => {
  let cons = cons_.copy();
  let indices = indices_.copy();
  const num_vars = cons.num_vars();
  const mask = indices.map(x => x == num_vars);
  const size = mask.reduce((x, y) => x + y);
  cons.expand(size + num_vars);
  let objective = new Objective(
    new Eq(Array(size + num_vars).fill(new Fraction(0)), new Fraction(0))
  );
  expanded_indices = new Indices();
  const num_cons = cons.num_cons;
  let k = num_vars;
  for (let i = 0; i < num_cons; ++i) {
    if (!mask[i]) {
      continue;
    }
    cons.at(i).set_val(k, new Fraction(1));
    indices[i] = k;
    objective.set_val(k, new Fraction(1));
    expanded_indices.push(k);
    ++k;
  }
  return new Problem(objective, cons, indices, expanded_indices);
}; // class Problem

/**
* 
* @param {Problem} problem
* @param {Objective} objective
* @returns {Problem}
*/
const create_second_problem = (problem, objective) => {
  let cons = problem.cons;
  let indices = problem.indices;
  cons.remove_artifact(indices, problem.expanded_indices);
  cons.compress(problem.expanded_indices);
  // cons.compress_cons(problem.indices, problem.expanded_indices);
  // indices.compress(problem.expanded_indices);
  return new Problem(objective, cons, indices, new Indices());
};

/**
* 
* @param {Objective} objective 
* @param {Cons} cons 
* @param {Indices} indices 
* @returns {Problem}
*/
const create_only_problem = (objective, cons, indices) => {
  return new Problem(objective, cons, indices, new Indices());
};

// simplex.hpp 相当
const Simplex = class {
  /**
  * 
  * @param {Objective} objective 
  * @param {Cons} cons 
  */
  constructor(objective, cons) {
    /** @type {Objective} */
    this.objective = objective;
    /** @type {Cons} */
    this.cons = cons;
    /** @type {Indices} */
    this.indices = cons.first_indices();
    /** @type {number} */
    this.status = -2;
  }

  /**
  * 
  * @returns {number}
  */
  solve() {
    /** @type {Problem} */
    let problem_second;
    if (this.cons.need_first_step(this.indices)) {
      const problem_first = create_first_problem(this.cons, this.indices);
      const status = problem_first.solve();
      if (status == 1) {
        this.status = 1;
        return this.status;
      }
      if (status != 0) {
        throw 'Error ' + status;
      }
      if (frac.gt(problem_first.value_objective(), new Fraction(0))) {
        this.status = -1;
        return this.status;
      }
      problem_second = create_second_problem(problem_first, this.objective);
    } else {
      problem_second = create_only_problem(this.objective, this.cons, this.indices);
    }
    const status = problem_second.solve();

    if (status == 1) {
      this.status = 1;
      return this.status;
    }
    this.value_objective = problem_second.value_objective();
    this.value_variables = problem_second.value_variables();
    this.status = 0;
    return this.status;
  }
}; //class Simplex

/**
 * 
 * @param {Cons} cons 
 * @param {Fraction[]} variables 
 * @returns {boolean}
 */
const check_cons = (cons, variables) => {
  /** @type {boolean[]} */
  let checks = Array(cons.num_cons)
  for (let i = 0; i < cons.num_cons; ++i) {
    const con = cons.at(i);
    const indices = con.expr.map(
      (x, idx) => frac.neq(x, new Fraction(0)) ? idx : -1
    ).filter(x => x >= 0);
    if (indices.length != 2) {
      continue;
    }
    const ineq = con.at(indices[1]);
    if (
      frac.neq(con.at(indices[1]), new Fraction(-1))
      && frac.neq(con.at(indices[1]), new Fraction(1))
    ) {
      continue;
    }
    if (frac.eq(ineq, new Fraction(1))) {
      checks[i] = frac.le(variables[indices[0]], con.rhs);
      {
        console.log(variables[indices[0]].float(), '<=', con.rhs.float())
      }
    } else {
      checks[i] = frac.ge(variables[indices[0]], con.rhs);
      {
        console.log(variables[indices[0]].float(), '>=', con.rhs.float())
      }
    }
  }
  return checks;
};

// result.hpp 相当
const Result = class {
  /**
  * 
  * @param {Simplex} simplex 
  * @param {boolean} check 
  */
  constructor(simplex, check) {
    this.simplex = simplex;
    this.check = check;
  }
}

// mip.hpp 相当
const Solver = class {
  /**
  * 
  * @param {Fraction[]} objective 
  * @param {Fraction[][]} cons 
  * @param {number} num_vars
  * @param {Fraction[]} pts
  * @param {Fraction[]} coins
  */
  constructor(objective, cons, num_vars, pts, coins) {
    /** @type {Objective} */
    this.objective = create_objective(objective);
    /** @type {Cons} */
    this.cons = create_cons(cons);
    /** @type {number} */
    this.num_vars = num_vars
    /** @type {number[]} */
    this.pts = pts;
    /** @type {number[]} */
    this.coins = coins;
    /** @type {Objective} */
    this.cont_objective = this.objective.copy();
    /** @type {Cons} */
    this.cont_cons = this.cons.copy();
  }

  /**
  * 
  * @returns {number}
  */
  solve() {
    const cont_simplex = new Simplex(this.cont_objective, this.cont_cons);
    const cont_status = cont_simplex.solve();
    /** @type {Fraction} */
    this.cont_value_objective = cont_simplex.value_objective;
    /** @type {Fraction[]} */
    this.cont_value_variables = cont_simplex.value_variables;
    if (cont_status != 0) {
      this.status = cont_status;
      return this.status;
    }

    this.count = 0;
    const result = this.search(cont_simplex, new Fraction(1e6));
    const int_simplex = result.simplex;
    /** @type {Fraction} */
    this.int_value_objective = int_simplex.value_objective;
    /** @type {Fraction[]} */
    this.int_value_variables = int_simplex.value_variables;
    this.status = 0;
    return this.status;
  }

  /**
  * 
  * @param {Simplex} simplex 
  * @param {Fraction} max 
  * @returns {Result}
  */
  search(simplex, max) {
    const cons = simplex.cons;
    const values = simplex.value_variables;
    /** @type {Fraction[][]} */
    let int_values = Array(this.num_vars).fill([]);

    let idx = this.num_vars;
    for (let j = 0; j < this.num_vars; ++j) {
      int_values[j] = check_integer(values[j]);
      if (frac.neq(int_values[j][0], int_values[j][1])) {
        idx = j;
        continue;
      }
    }
    if (idx == this.num_vars) {
      console.log(simplex.value_objective.float(), max.float());
      return new Result(simplex, frac.le(simplex.value_objective, max));
    }

    const pair = int_values[idx];
    const cons_lower = add_cons(cons, idx, pair[0], new Fraction(1));
    const cons_upper = add_cons(cons, idx, pair[1], new Fraction(-1));
    const simplex_lower = new Simplex(this.cont_objective, cons_lower);
    const simplex_upper = new Simplex(this.cont_objective, cons_upper);
    const status_lower = simplex_lower.solve();
    const status_upper = simplex_upper.solve();
    const value_o_lower = simplex_lower.value_objective;
    const value_o_upper = simplex_upper.value_objective;
    ++this.count;
    console.log(
      this.count, idx, pair[0].float(), pair[1].float(),
      value_o_lower instanceof Fraction ? value_o_lower.float() : undefined,
      value_o_upper instanceof Fraction ? value_o_upper.float() : undefined,
      max.float(),
    );
    {
      const vl = simplex_lower.value_variables;
      const vu = simplex_upper.value_variables;
      console.log(
        vl instanceof Array ? vl.map(x => x.float()) : undefined,
        '\n',
        vu instanceof Array ? vu.map(x => x.float()) : undefined,
      )
      console.log(vl instanceof Array ? check_cons(cons_lower, vl) : undefined);
      console.log(vu instanceof Array ? check_cons(cons_upper, vu) : undefined);
    }

    if ((status_lower != 0) && (status_upper != 0)) {
      return new Result(simplex, false);
    }

    /** @type {Result} */
    let result;
    let count = 0;
    if (status_lower == 0) {
      if (frac.le(value_o_lower, max)) {
        const tmp = this.search(simplex_lower, max);
        if (tmp.check) {
          result = tmp;
          if (frac.gt(result.simplex.value_objective, max)) {
            throw 'Max Error';
          }
          max = result.simplex.value_objective;
          ++count;
        }
      }
    }
    if (status_upper == 0) {
      if (frac.le(value_o_upper, max)) {
        const tmp = this.search(simplex_upper, max);
        if (tmp.check) {
          result = tmp;
          if (frac.gt(result.simplex.value_objective, max)) {
            throw 'Max Error';
          }
          max = result.simplex.value_objective;
          ++count;
        }
      }
    }
    if (count == 0) {
      return new Result(simplex, false);
    }
    return result;
  }
}; // class Solver

/**
* 
* @param {Fraction} x 
* @returns {Fraction[]}
*/
const check_integer = x => {
  let lower = frac.floor(x);
  let upper = frac.add(lower, new Fraction(1));
  if (frac.eq(x, lower)) {
    return [lower, lower];
  }
  if (frac.eq(x, upper)) {
    return [upper, upper];
  }
  return [lower, upper];
};

// 最終部分
/**
* 
* @param {number[]} shape 
* @param  {...number} indices 
*/
const sub2ind = (shape, ...indices) => {
  if (shape.length != indices.length) {
    throw 'Shape Error';
  }
  let index = 0;
  for (let i = 0; i < shape.length - 1; ++i) {
    index += indices[i];
    index *= shape[i + 1];
  }
  index += indices.at(-1);
  return index;
};

/**
* 
* @param {number[]} shape 
* @param {number} index 
*/
const ind2sub = (shape, index) => {
  /** @type {number[]} */
  const sha = [...shape];
  sha.reverse();
  let indices = [];
  for (let i = 0; i < sha.length; ++i) {
    indices.push(index % sha[i]);
    index = Math.floor(index / sha[i]);
  }
  return indices.reverse();
};

/**
* 
* @param {Fraction[]} pts 
* @param {Fraction[]} coins 
*/
const create_problem = (pts, coins) => {
  coins.sort((a, b) => { frac.lt(a, b) ? -1 : 1 });
  const shape = [coins.length, pts.length, pts.length];
  const size = coins.length * pts.length * pts.length;
  let objective = Array(size).fill(1).map(x => new Fraction(x));
  let cons = Array(pts.length).fill(0).map(
    () => Array(size + 1).fill(0).map(x => new Fraction(x))
  );
  for (let i = 0; i < pts.length; ++i) {
    for (let c = 0; c < coins.length; ++c) {
      for (let j = 0; j < pts.length; ++j) {
        cons[i][sub2ind(shape, c, i, j)].isub(coins[c]);
        cons[i][sub2ind(shape, c, j, i)].iadd(coins[c]);
      }
    }
    cons[i][size] = pts[i];
  }
  for (let i = 0; i < cons.length - 2; ++i) {
    for (let j = 0; j < cons[0].length; ++j) {
      cons[i + 1][j].iadd(cons[i][j]);
    }
  }
  cons.splice(-1, 1);

  const num_cons = cons.length;
  for (let c = 0; c < coins.length; ++c) {
    if (frac.eq(coins[c], new Fraction(1))) {
      continue;
    }
    for (let k = 0; k < num_cons; ++k) {
      const prev_idx = cons.at(-1).length;
      let con1 = Array(prev_idx + 1).fill(0).map(x => new Fraction(x));
      let con2 = Array(prev_idx + 2).fill(0).map(x => new Fraction(x));
      for (let i = 0; i < size; ++i) {
        con1[i] = frac.floor(frac.div(cons[k][i], coins[c]));
        con2[i] = frac.floor(frac.div(frac.neg(cons[k][i]), coins[c]));
      }
      con1[prev_idx - 1] = new Fraction(1);
      con2[prev_idx] = new Fraction(1);
      con1[prev_idx] = frac.floor(frac.div(cons[k][size], coins[c]));
      con2[prev_idx + 1] = frac.floor(
        frac.div(frac.neg(cons[k][size]), coins[c])
      );
      cons.push(con1);
      cons.push(con2);
    }
  }

  return [objective, cons];
};

/**
* 
* @param {Fraction[]} variables 
* @param {Fraction[]} pts
* @param {Fraction[]} coins 
* @returns {number[][]}
*/
const format_result = (variables, pts, coins) => {
  const shape = [coins.length, pts.length, pts.length];
  const size = coins.length * pts.length * pts.length;
  let results = Array(pts.length).fill(0).map(() => Array(pts.length).fill(0));
  for (let idx = 0; idx < size; ++idx) {
    let c, i, j;
    [c, i, j] = ind2sub(shape, idx);
    results[i][j] += frac.mul(coins[c], variables[idx]).float();
  }
  return results;
};

/** @type {Solver} */
let solver;
/** @type {number[][]} */
let results;

/**
* 
* @param {number[][]} results
* @returns {string} 
*/
const to_str_results = results => {
  return '[' + results.map(x => x.join(', ')).join(']\n[') + ']';
};

/**
* 
* @param {string[]}
* @param {Fraction[]} pts 
* @param {Fraction[]} coins 
*/
const solve_delivery = (names, pts, coins) => {
  let objective;
  let cons;
  [objective, cons] = create_problem(pts, coins);
  solver = new Solver(objective, cons, objective.length, pts, coins);
  const status = solver.solve();
  if (status != 0) {
    throw 'Error ' + status
  }
  const values = solver.int_value_variables;
  results = format_result(values, pts, coins);
  console.log(values.map(x => x.float()).join(', '))
  let lines = [];
  for (let i = 0; i < pts.length; ++i) {
    let s = '[' + names[i] + ']';
    let list = [];
    for (let j = 0; j < pts.length; ++j) {
      const val = Math.round(results[i][j]);
      if (val != 0) {
        list.push(names[i] + '→' + names[j] + ' ' + val + 'G');
      }
    }
    lines.push(s + ' ' + list.join('; '));
  }
  alert(lines.join('\n'))
  return results;
};
