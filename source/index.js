const fs = require('fs');
const { __, compose, curry, map, replace, split, applyTo, forEach, apply, equals, when, isNil, identity, applySpec, memoizeWith, prop, always } = require('ramda');
const path = require('path');

const log = (...vals) => console.log.apply(console, vals);
const probe = val => (log(val),val);

// String -> (String -> *) -> ()
const loadFile = (path, cb) => fs.readFile(path, 'utf8', (err, contents) => {
    if (err) { console.log(err); } else { cb(contents); }
});

// String -> String
const trimEnd = replace(/(\r\n|\r|\n)$/, '');

// String -> (String -> *) -> ()
const loadInput = (folder, cb) => loadFile(path.resolve(folder, 'input.txt'), cb);

// (* -> *) -> ... -> ()
const timestamp = f => (...args) => {
    const startTime = new Date();
    log('Start', startTime);
    apply(f, args);
    const endTime = new Date();
    log('End', endTime);
    log('Elapsed', (endTime - startTime), 'ms');
    log();
};

// String -> (* -> *) -> ()
const runExercise = curry((input, exercise) =>
    timestamp(compose(log, exercise))(input)
);

// [(* -> *)] -> String ()
const runExercises = (exercises) => compose(
    forEach(__, exercises), 
    runExercise
);

// String -> [String]
const splitLines = split(/\r\n|\r|\n/);
    
// DaySpec => [(* -> *)]
const prepare = ({ solution: { type, pre, ps } }) => {
    const parser = memoizeWith(identity, pre || identity);
    
    return type === 'lines'
        ? map(p => compose(p, map(parser), splitLines, trimEnd), ps)
        : map(p => compose(p, parser, trimEnd), ps);
};

// String -> String -> ()
const prepareAndRun = compose(runExercises, prepare, require);
    
// String -> ()
const runSolution = (relPath) => {
    const fullPath = path.resolve(process.cwd(), relPath);
    
    loadInput(
        fullPath, 
        prepareAndRun(fullPath)
    );
};
    
    
module.exports = {
    loadFile
    , loadInput
    , trimEnd
    , splitLines
    , runSolution
    , prepare
};