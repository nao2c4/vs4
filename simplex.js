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
     * @param {number[]} expr 
     * @param {number} rhs 
     */
    constructor(expr, rhs) {
        /** @type {number[]} */
        this.expr = [...expr];
        /** @type {number} */
        this.rhs = rhs;
    }

    /**
     * 
     * @param {number} index 
     * @param {number} val 
     * @returns {this}
     */
    set_val(index, val) {
        this.expr[index] = val;
        return this;
    }

    /**
     * 
     * @param {number} index 
     * @returns {number}
     */
    at(index) {
        return this.expr[index]
    }

    /**
     * 
     * @param {number | Eq} rhs 
     * @returns {this}
     */
    isub(rhs) {
        if (typeof (rhs) == 'number') {
            for (let j = 0; j < this.expr.length; ++j) {
                this.expr[j] -= rhs;
            }
            this.rhs -= rhs;
            return this;
        }
        for (let j = 0; j < this.expr.length; ++j) {
            this.expr[j] -= rhs.at(j);
        }
        this.rhs -= rhs.rhs;
        return this;
    }

    /**
     * 
     * @param {number} rhs
     * @returns {Eq} 
     */
    imul(rhs) {
        for (let j = 0; j < this.expr.length; ++j) {
            this.expr[j] *= rhs;
        }
        this.rhs *= rhs;
        return this;
    }

    /**
     * @param {number} index
     * @returns {number}
     */
    value(index) {
        if (this.at(index) * this.at(index) < EPS * EPS) {
            throw 'Value is too small';
        }
        return this.rhs / this.at(index);
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
            this.expr.push(0);
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
        sorted_indices.sort().reverse();
        for (let j = 0; j < sorted_indices.length; ++j) {
            this.expr.splice(sorted_indices[j], 1);
        }
        return this;
    }
    /**
     * 
     * @returns {string}
     */
    to_str() {
        return '[' + this.expr.join(', ') + '] == ' + this.rhs;
    }

    /**
     * 
     * @returns {Eq}
     */
    copy() { return new Eq([...this.expr], this.rhs); }
}; // class Eq

/**
 * 
 * @param {Eq} lhs 
 * @param {number} rhs 
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
            if (this.at(j) < -EPS && !indices.isin(j)) {
                return j;
            }
        }
        return num_vars;
    }

    /**
     * 
     * @returns {number}
     */
    get rhs() { return this.eq.rhs; }

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
 * @param {number[]} arr 
 * @returns 
 */
const create_objective = (arr) => { return new Objective(new Eq(arr, 0)) };

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
        const size = this.eqs.map(x => x.num_vars());
        this.expand(size);
        for (let i = 0; i < this.num_cons; ++i) {
            if (this.eqs[i].rhs < 0) {
                this.eqs[i].imul(-1);
            }
        }
    }

    /**
     * 
     * @param {number} index 
     * @returns {number}
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
                if (val * val > EPS) {
                    ++count;
                }
                if ((val * val < -EPS) || (val < EPS)) {
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
        let mi = 1e100;
        for (let i = 0; i < this.num_cons; ++i) {
            const eq = this.eqs[i];
            if ((eq.at(column) * eq.rhs < -EPS) || (eq.at(column) * eq.at(column) < EPS)) {
                continue;
            }
            const val = eq.value(column);
            if (val < mi) {
                row = i;
                mi = val;
            }
        }
        if (mi == 1e100) {
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
        if (this.eqs[row].at(column) * this.eqs[row].at(column) < EPS * EPS) {
            throw "Zero";
        }
        for (let i = 0; i < this.num_cons; ++i) {
            if (i == row) {
                continue;
            }
            this.eqs[i].isub(mul_eq(
                this.eqs[row],
                this.eqs[i].at(column) / this.eqs[row].at(column),
            ));
        }
        return this;
    }

    /**
     * 
     * @param {number} index 
     * @param {number} rhs 
     * @param {number} ineq
     * @returns {Cons} 
     */
    iadd_con(index, rhs, ineq) {
        const num_vars = this.num_vars()
        let eq = new Eq(Array(num_vars + 1).fill(0), rhs);
        eq.set_val(index, 1);
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
    to_str() {
        return this.eqs.map((x, idx) => (idx == 0 ? '  s.t.  : ' : '          ') + x.to_str()).join('\n')
    }

    /**
     * 
     * @returns {Cons}
     */
    copy() { return new Cons(this.eqs.map(x => x.copy())) };
}; // class Cons

/**
 * 
 * @param {number[][]} arr 
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
 * @param {number[][]} cons
 * @param {number} index
 * @param {number} rhs
 * @param {number} ineq
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
        this.next_idx = 0;
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
        if (this.cons.at(row).at(column) * this.cons.at(row).at(column) < EPS * EPS) {
            throw 'Zero';
        }
        this.objective.isub(mul_eq(
            this.cons.at(row),
            this.objective.at(column) / this.cons.at(row).at(column),
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
     * @returns {numbers}
     */
    step() {
        const column = this.objective.first_negative_index(
            this.indices, this.next_idx
        );
        this.next_idx = column + 1;
        if (column == this.num_vars) {
            return 0;
        }
        const row = this.cons.min_index(column);
        if (row == this.num_cons) {
            return 1;
        }
        this.reduct(row, column);
        this.indices[row] = column;
        return -1;
    }

    /**
     * 
     * @returns {number}
     */
    value_objective() {
        return -this.objective.rhs;
    }

    /**
     * 
     * @returns {number[]}
     */
    value_variables() {
        /** @type {number[]} */
        let values = Array(this.num_vars).fill(0);
        for (let i = 0; i < this.num_cons; ++i) {
            const column = this.indices[i];
            if (column >= this.num_vars) {
                continue;
            }
            values[column] = this.cons.at(i).value(column);
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
    let objective = new Objective(new Eq(Array(size + num_vars).fill(0), 0));
    expanded_indices = new Indices();
    const num_cons = cons.num_cons;
    let k = num_vars;
    for (let i = 0; i < num_cons; ++i) {
        if (!mask[i]) {
            continue;
        }
        cons.at(i).set_val(k, 1);
        indices[i] = k;
        objective.set_val(k, 1);
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
    cons.compress(problem.expanded_indices);
    cons.compress_cons(problem.indices, problem.expanded_indices);
    indices.compress(problem.expanded_indices);
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
            // console.log(problem_first.objective.to_str());
            // console.log(problem_first.cons.to_str());
            // console.log(problem_first.indices.to_str());
            const status = problem_first.solve();
            // console.log(' status : ' + status);
            // console.log(problem_first.objective.to_str());
            // console.log(problem_first.cons.to_str());
            // console.log(problem_first.indices.to_str());
            // console.log('↓')
            if (status == 1) {
                this.status = 1;
                return this.status;
            }
            if (problem_first.value_objective() > EPS) {
                this.status = -1;
                return this.status;
            }
            problem_second = create_second_problem(problem_first, this.objective);
        } else {
            problem_second = create_only_problem(this.objective, this.cons, this.indices);
        }
        // console.log(problem_second.objective.to_str());
        // console.log(problem_second.cons.to_str());
        // console.log(problem_second.indices.to_str());
        const status = problem_second.solve();
        // console.log(' status : ' + status);
        // console.log(problem_second.objective.to_str());
        // console.log(problem_second.cons.to_str());
        // console.log(problem_second.indices.to_str());
        // console.log('--------')
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
     * @param {number[]} objective 
     * @param {number[][]} cons 
     * @param {number} num_vars
     * @param {number} num_players
     */
    constructor(objective, cons, num_vars, num_players) {
        /** @type {Objective} */
        this.objective = create_objective(objective);
        /** @type {Cons} */
        this.cons = create_cons(cons);
        /** @type {number} */
        this.num_vars = num_vars
        /** @type {number} */
        this.num_players = num_players;
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
        /** @type {number} */
        this.cont_value_objective = cont_simplex.value_objective;
        /** @type {number[]} */
        this.cont_value_variables = cont_simplex.value_variables;
        if (cont_status != 0) {
            this.status = cont_status;
            return this.status;
        }

        const result = this.search(cont_simplex, 1e100);
        const int_simplex = result.simplex;
        /** @type {number} */
        this.int_value_objective = int_simplex.value_objective;
        /** @type {number[]} */
        this.int_value_variables = int_simplex.value_variables;
        this.status = 0;
        return this.status;
    }

    /**
     * 
     * @param {Simplex} simplex 
     * @param {number} max 
     * @returns {Result}
     */
    search(simplex, max) {
        const cons = simplex.cons;
        const values = simplex.value_variables;
        /** @type {number[][]} */
        let int_values = Array(this.num_vars).fill([]);

        let idx = this.num_vars;
        for (let j = 0; j < this.num_vars; ++j) {
            int_values[j] = check_integer(values[j]);
            if (int_values[j][0] != int_values[j][1]) {
                idx = j;
                continue;
            }
        }
        if (idx == this.num_vars) {
            console.log(simplex.value_objective, max);
            return new Result(simplex, simplex.value_objective <= max);
        }

        const pair = int_values[idx];
        const idx_diagnal = this.diagnal_index(idx);
        let cons_lower = add_cons(cons, idx, pair[0], 1);
        let cons_upper = add_cons(cons, idx, pair[1], -1);
        // cons_upper = add_cons(cons_upper, idx, 9, 1);
        // cons_upper = add_cons(cons_upper, idx_diagnal, 0, 1);
        const simplex_lower = new Simplex(this.cont_objective, cons_lower);
        const simplex_upper = new Simplex(this.cont_objective, cons_upper);
        const status_lower = simplex_lower.solve();
        const status_upper = simplex_upper.solve();
        const value_o_lower = simplex_lower.value_objective;
        const value_o_upper = simplex_upper.value_objective;

        if ((status_lower != 0) && (status_upper != 0)) {
            return new Result(simplex, false);
        }

        /** @type {Result} */
        let result;
        let count = 0;
        if (status_lower == 0) {
            if (value_o_lower <= max) {
                const tmp = this.search(simplex_lower, max);
                if (tmp.check) {
                    result = tmp;
                    if (result.simplex.value_objective > max) {
                        throw 'Max Error';
                    }
                    max = result.simplex.value_objective;
                    ++count;
                }
            }
        }
        if (status_upper == 0) {
            if (value_o_upper <= max) {
                const tmp = this.search(simplex_upper, max);
                if (tmp.check) {
                    result = tmp;
                    if (result.simplex.value_objective > max) {
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

    /**
     * 
     * @param {number} idx 
     * @returns {number}
     */
    diagnal_index(idx) {
        const j = idx % this.num_players;
        let total = idx - j;
        const i = (total / this.num_players) % this.num_players;
        total = total - i * this.num_players;
        return total + j * this.num_players + i;
    }
}; // class Solver

/**
 * 
 * @param {number} x 
 * @returns {number[]}
 */
const check_integer = x => {
    let lower = Math.floor(x);
    let upper = lower + 1;
    if (x - lower < EPS) {
        return [lower, lower];
    }
    if (upper - x < EPS) {
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
 * @param {number[]} pts 
 * @param {number[]} coins 
 */
const create_problem = (pts, coins) => {
    coins.sort();
    const shape = [coins.length, pts.length, pts.length];
    const size = coins.length * pts.length * pts.length;
    let objective = Array(size).fill(1);
    let cons = Array(pts.length).fill(0).map(() => Array(size + 1).fill(0));
    for (let i = 0; i < pts.length; ++i) {
        for (let c = 0; c < coins.length; ++c) {
            for (let j = 0; j < pts.length; ++j) {
                cons[i][sub2ind(shape, c, i, j)] -= coins[c];
                cons[i][sub2ind(shape, c, j, i)] += coins[c];
            }
        }
        cons[i][size] = pts[i];
    }
    for (let i = 0; i < cons.length - 2; ++i) {
        for (let j = 0; j < cons[0].length; ++j) {
            cons[i + 1][j] += cons[i][j];
        }
    }
    cons.splice(-1, 1);

    return [objective, cons];
};

/**
 * 
 * @param {number[]} variables 
 * @param {number[]} pts
 * @param {number[]} coins 
 * @returns {number[][]}
 */
const format_result = (variables, pts, coins) => {
    const shape = [coins.length, pts.length, pts.length];
    const size = coins.length * pts.length * pts.length;
    let results = Array(pts.length).fill(0).map(() => Array(pts.length).fill(0));
    for (let idx = 0; idx < size; ++idx) {
        let c, i, j;
        [c, i, j] = ind2sub(shape, idx);
        results[i][j] += coins[c] * variables[idx];
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
 * @param {number[]} pts 
 * @param {number[]} coins 
 */
const solve_delivery = (names, pts, coins) => {
    let objective;
    let cons;
    [objective, cons] = create_problem(pts, coins);
    console.log(to_str_results(cons));
    solver = new Solver(objective, cons, objective.length, pts.length);
    solver.solve();
    const values = solver.int_value_variables;
    results = format_result(values, pts, coins);
    console.log(values.join(', '))
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
