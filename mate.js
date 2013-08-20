/*
{
    _fx: '(a+b)*c',
    _op: 'multiply',
    _args: [
        {
            _fx: 'a+b',
            _op: 'sum',
            _args: [
                'a',
                'b'
            ]
        },
        'c'
    ]
}
*/

function breadownFormula (strFormula) {
    var i = 0,
        s = 0,
        terms = terms || {},
        blockRegexp = /\(([^(]*?)\)/g,
        exprRegexp = /(\w+\W\w+)/g;
        fullExprRegexp = /^(\w+\W\w+)$/;

    // convert main formula into a block
    strFormula = '(' + strFormula + ')';

    // split the formula into nested blocks on a plane list
    do {
        //console.log(strFormula)
    } while (
        strFormula.match(blockRegexp) &&
        (strFormula = strFormula.replace(blockRegexp, function (block, formula) {
            // break leaf blocks into pairs of simple terms
            do {
                //console.log('---->' + formula)
            } while (
                formula.match(exprRegexp) &&
                !formula.match(fullExprRegexp) &&
                (formula = formula.replace(exprRegexp, function (block, formula) {
                    var key =  '__F' + (i++) + '__';
                    terms[key] = formula;
                    return key;
                }))
            );

            var key =  '__F' + (i++) + '__';
            terms[key] = formula;
            return key;
        }))
    );

    // prepare the tree based on the plain list of blocks
    var tree = {}, j;
    for (j = 0; j < i; j++) {
        var key = '__F' + j + '__';
        var deps = {};
        (terms[key].match(/__F\d+__/g)||[]).forEach(function (key) {
            deps[key] = tree[key];
            delete tree[key];
        });
        var op, args, matches;
        if (matches = terms[key].match(/^(\w+)?(\W+)(\w+)$/)) {
            op = matches[2];
            args = [ matches[1]||0, matches[3]||0 ];
        }
        tree[key] = {
            _fx: terms[key],
            _deps: deps,
            _op: op,
            _args: args,
        }
    }

    // return the tree root
    return tree['__F' + (i-1) + '__'];
}

var mapOp = {
    '+': function (a, b) { return a+b; },
    '-': function (a, b) { return a-b; },
    '*': function (a, b) { return a*b; },
    '/': function (a, b) { return a/b; },
    '^': function (a, b) { return Math.pow(a,b); },
    '%': function (a, b) { return a%b; },
};
var mapVar = {
    a: 2,
    b: 1,
    c: 1,
    d: 1,
    e: 1,
    f: 1,
    g: 1,
    h: 1,
    i: 1,
    j: 1,
};

function resolveFormulaTree (tree) {
    function resolveNode(node) {
        // leaf case - cut condition
        if ('string' === typeof node) {
            return mapVar[node] || parseInt(node, 10);
        } else if ('number' === typeof node) {
            return node;
        }
        // branch case - backtrackig
        var i, l = node._args.length;
        for (i = 0; i < l; i++) {
            node._args[i] = resolveNode(node._deps[ node._args[i] ] || node._args[i]);
        }
        console.log('op: ', node._op, node._args);
        return mapOp[node._op].apply(null, node._args);
    }
    return resolveNode(tree);
}

//var tree = breadownFormula('(a+(b*(d+a)))*(c+e+g+h+j)*f');
var tree = breadownFormula('-a^(-1/2)');
//tree = JSON.stringify(tree);
console.log(tree);
var res = resolveFormulaTree(tree);
console.log('result: ', res);




