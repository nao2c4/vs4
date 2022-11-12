/**
 * 
 * @param {Number[]} pts 
 * @param {Number} init 
 * @param {Number} kaeshi 
 * @param {Number[]} uma 
 * @returns {Number[]}
 */
const calcUmaoka = (pts, init, kaeshi, uma) => {
    const round_ = x => BigInt(Math.round(10 * x));
    const pts_ = pts.map(round_);
    const init_ = round_(init);
    const kaeshi_ = round_(kaeshi);
    const uma_ = uma.map(round_);
    const diff_ = kaeshi_ - init_;
    const umaoka_ = [
        uma_[1] + 3n * diff_,
        uma_[0] - diff_,
        -uma_[0] - diff_,
        -uma_[1] - diff_,
    ];
    const ptsSorted = [...pts_].sort().reverse();
    const umaoka = pts_.map(
        x => (ptsSorted.map(
            (y, index) => x == y ? umaoka_[index] : null
        ).filter(y => y != null))
    );
    const result = umaoka.map(u => Number(u.reduce((x, y) => x + y)) / u.length);
    return result.map(x => Math.round(x) / 10);
};

/**
 * 名前
 * @type {HTMLInputElement[]}
 */
let namesArr = [];

/**
 * 素点
 * @type {HTMLInputElement[]}
 */
let ptsRawArr = [];

/**
 * 現スコア
 * @type {HTMLInputElement[]}
 */
let ptsTotalArr = [];

/**
 * スコア
 * @type {HTMLTableCellElement[]}
 */
let ptsWithUmaArr = [];

/**
 * 新スコア
 * @type {HTMLTableCellElement[]}
 */
let ptsTotalAfterArr = [];

/**
 * G
 * @type {HTMLTableCellElement[]}
 */
let goldsArr = [];

/**
 * 素点
 * @type {HTMLTableCellElement}
 */
let ptsRawSum;

/**
 * 素点
 * @type {HTMLTableCellElement}
 */
let ptsTotalSum;

/**
 * 素点
 * @type {HTMLTableCellElement}
 */
let ptsWithUmaSum;

/**
 * 素点
 * @type {HTMLTableCellElement}
 */
let ptsTotalAfterSum;

/**
 * 素点
 * @type {HTMLTableCellElement}
 */
let goldsSum;

/**
 * 配給原点
 * @type {HTMLInputElement}
 */
let init;

/**
 * 原点
 * @type {HTMLInputElement}
 */
let kaeshi;

/**
 * ウマ
 * @type {HTMLInputElement[]}
 */
let uma;


/**
 * 係数
 * @type {HTMLInputElement}
 */
let factor;

/**
 * 初期化
 */
const initialize = () => {
    init = document.getElementById('config-init');
    kaeshi = document.getElementById('config-kaeshi');
    uma = [
        document.getElementById('config-uma32'),
        document.getElementById('config-uma41'),
    ];
    factor = document.getElementById('config-factor');

    [init, kaeshi, uma[0], uma[1], factor].forEach(
        x => {
            x.addEventListener('input', calc);
            x.addEventListener('change', format);
        }
    );

    document.getElementById('button-next')
        .addEventListener('click', next);
    document.getElementById('button-reset')
        .addEventListener('click', reset);
    document.getElementById('button-estimate')
        .addEventListener('click', estimate);
}


/**
 * 
 * @param {BigInt} nPlayers 
 */
const createTable = nPlayers => {
    const table = document.getElementById('table');
    // const header = document.createElement('tr')
    const names = document.createElement('tr');
    const ptsRaw = document.createElement('tr');
    const ptsTotal = document.createElement('tr');
    const ptsWithUma = document.createElement('tr');
    const ptsTotalAfter = document.createElement('tr');
    const golds = document.createElement('tr');
    const rows = [
        names, ptsRaw, ptsTotal,
        ptsWithUma, ptsTotalAfter, golds,
    ]
    names.setAttribute('id', 'names');
    ptsRaw.setAttribute('id', 'pts-raw');
    ptsTotal.setAttribute('id', 'pts-total');
    ptsWithUma.setAttribute('id', 'pts-with-uma');
    ptsTotalAfter.setAttribute('id', 'pts-total-after');
    golds.setAttribute('id', 'golds');
    rows.forEach(e => table.append(e));

    const globalArr = [
        namesArr, ptsRawArr, ptsTotalArr,
        ptsWithUmaArr, ptsTotalAfterArr, goldsArr,
    ];

    const labels = ['名', '素', '現', '今', '新', 'G'];
    for (let i = 0; i < rows.length; ++i) {
        const e = rows[i];
        const s = labels[i];
        const ee = document.createElement('th');
        ee.append(s);
        e.append(ee);
    }

    const ids = [
        'name', 'pt-raw', 'pt-total',
        'pt-with-uma', 'pt-total-after', 'gold',
    ];
    for (let i = 0; i < nPlayers; ++i) {
        let columns = ids.forEach((id, index) => {
            const e = document.createElement('td');
            e.setAttribute('id', id + '-' + i);
            let ee;
            if (index == 0) {
                ee = document.createElement('input');
                ee.setAttribute('id', 'input-' + id + '-' + i);
                ee.setAttribute('type', 'text');
                // ee.setAttribute('size', '6');
                globalArr[index].push(ee)

            }
            else if (index < 3) {
                ee = document.createElement('input');
                ee.setAttribute('id', 'input-' + id + '-' + i);
                ee.setAttribute('type', 'number');
                // ee.setAttribute('size', '6');
                ee.setAttribute('min', '-9999.9');
                ee.setAttribute('size', '9999.9');
                ee.addEventListener('input', calc);
                ee.addEventListener('change', format);
                globalArr[index].push(ee)
            } else {
                ee = '0.0';
                globalArr[index].push(e)
            }
            e.append(ee);
            rows[index].append(e)
        })
    }

    for (let i = 0; i < rows.length; ++i) {
        const e = rows[i];
        const ee = document.createElement(i == 0 ? 'th' : 'td');
        ee.append(i == 0 ? '計' : '0.0');
        e.append(ee);
    }
    let namesSum;
    [namesSum, ptsRawSum, ptsTotalSum, ptsWithUmaSum, ptsTotalAfterSum, goldsSum] = rows.map(
        r => Array.from(r.childNodes).slice(-1)[0]
    );
};

const calc = () => {
    /**
     * 総和
     * @param {number[]} x 
     * @returns {number}
     */
    const sum_ = x => x.reduce((a, b) => a + b);

    /**
     * 代入
     * @param {HTMLTableCellElement[]} eleArr 
     * @param {number[]} valArr 
     */
    const set_ = (eleArr, valArr, digit) => {
        eleArr.map((x, index) => {
            x.innerText = valArr[index].toFixed(digit);
        });
    };

    const ptsRaw = ptsRawArr.map(x => +x.value);
    const ptsTotal = ptsTotalArr.map(x => +x.value);
    const umaoka = calcUmaoka(
        ptsRaw, +init.value, +kaeshi.value, uma.map(x => +x.value)
    );
    console.log(umaoka);
    const ptsWithUma = ptsRaw.map(
        (x, index) => x + umaoka[index] - init.value
    );
    const ptsTotalAfter = ptsTotal.map(
        (x, index) => x + ptsWithUma[index]
    );
    const golds = ptsTotalAfter.map(
        x => x * (+factor.value)
    );

    set_(ptsWithUmaArr, ptsWithUma, 1);
    set_(ptsTotalAfterArr, ptsTotalAfter, 1);
    set_(goldsArr, golds, 0);

    const totals = [
        ptsRaw, ptsTotal, ptsWithUma, ptsTotalAfter, golds
    ].map(sum_);
    const globalSum = [
        ptsRawSum, ptsTotalSum,
        ptsWithUmaSum, ptsTotalAfterSum, goldsSum,
    ];
    set_(globalSum, totals, 1);
};

const reset = () => {
    ptsRawArr.map(x => { x.value = +init.value; })
    ptsTotalArr.map(x => { x.value = 0.0; })
    calc();
    format();
};

const next = () => {
    ptsTotalArr.map((x, index) => { x.value = +ptsTotalAfterArr[index].innerText; })
    ptsRawArr.map(x => { x.value = +init.value; })
    calc();
    format();
};

const format = () => {
    /**
     * 置換
     * @param {HTMLInputElement[]} eleArr 
     */
    const replace_ = (eleArr) => {
        eleArr.map(x => {
            x.value = (+x.value).toFixed(1);
        });
    };
    replace_(ptsRawArr);
    replace_(ptsTotalArr);
    replace_([init, kaeshi, uma[0], uma[1], factor]);
};

const estimate = () => {
    const names = namesArr.map(x => x.value);
    const pts = goldsArr.map(x => +x.innerText);
    const coins = [1, 10, 100];
    solve_delivery(names, pts, coins);
};


window.addEventListener('load', event => {
    initialize();
    createTable(4);
    reset();
});
