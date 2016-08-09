import { parse } from 'query-string';

const RecordMode = 'rec';
const ReplayMode = 'replay';

// gets all actions stored in localStorage under the given id
const getActions = id => {
    const item = window.localStorage.getItem(id);
    return item ? JSON.parse(item) : null;
};

// returns a function that adds the given action to an array
// stored in localStorage under the given id
const storeAction = id => action => {
    const items = getActions(id) || [];
    items.push(action);
    window.localStorage.setItem(id, JSON.stringify(items));
};

// takes a function that accepts an action, and returns a
// function that wrapps said action in an object that
// also includes the time difference from the last time called
const addTiming = recordAction => {
    let lastTime = new Date();
    return (action) => {
        const time = new Date();
        const diff = time - lastTime;
        lastTime = time;
        recordAction({ diff, action });
    };
};

// takes an array of actions, and returns a function that accepts
// a callback function. This callback will be called with the action as
// param in the same intervall that the actions were stored.
const replayer = actions => {
    const iterator = actions[Symbol.iterator]();
    const eachAction = (callback) => {
        const { done, value } = iterator.next();
        if (done) {
            return;
        }
        
        const { action, diff } = value;
        setTimeout(() => {
            callback(action);
            eachAction(callback);
        }, diff);
    };

    return eachAction;
};

// eslint-disable-next-line
const recordMddleware = storeAction => store => {
    return next => action => {
        storeAction(action);
        return next(action);
    };
};

const replaydMddleware = onActionReplay => store => {
    onActionReplay((action) => {
        store.dispatch(action);
    });
    
    return next => action => next(action);
};

// eslint-disable-next-line
const noActionMiddleware = store => next => action => next(action);

const getQueryStringOptions = () => {
    const { record, replay } = parse(window.location.search);
    if (!!record || record === null) {
        return { mode: RecordMode, id: record || '' };
    }
    if (!!replay || replay === null) {
        return { mode: ReplayMode, id: replay || '' };
    }
    return { mode: '', id: '' };
};

export default function reactRecNReplay(options = getQueryStringOptions()) {
    const { mode, id } = options;

    const storageId = `http://reactRecNReplay/v1/${id}`;
    if (mode === RecordMode) {
        return recordMddleware(addTiming(storeAction(storageId)));
    }
        
    if (mode === ReplayMode) {
        const actions = getActions(storageId);
        if (actions) {
            return replaydMddleware(replayer(actions));
        }
        // eslint-disable-next-line
        console.warn(`No actions with id=${id} found to replay!`);
    }
        
    return noActionMiddleware;
}
