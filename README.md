
Middleware for storing redux actions in localstorage and replaying them later. Usefull for QA reproducing bugs etc.

## Howto

### Use
```js
...
import { createStore, applyMiddleware } from 'redux';
import createRecNReplayMiddleware from 'redux-action-replay-middleware';

const recNReplayMiddleware = createRecNReplayMiddleware();
const createStoreWithMiddleware = applyMiddleware(recNReplayMiddleware)(createStore);
...

```

### Record
Use ```record=<id>``` as a query parameter when loading your app to record all the actions.
```
http://myapp?record=Foo
```

### Replay
Use ```replay=<id>``` as a qwuery parameter when loading your app to replay the actions recorded on that id
```
http://myapp?replay=Foo
```
