# Global





* * *

## Class: EventService
The EventService implements the observer pattern.Each event registered in the Event Registry has a name, callback, data, priority and channel.It can later be triggered or removed based on these same criteria.- **name** is the way to identify one event from another.- **callBack** is the action to perform.- **data** is the additional information related to the event.- **priority** allows to rank the events in the order you want prior execution or as a criteria for removal.- **channel** allows for clusterization of the events.Events in a separate channel won't be affected by any trigger/removal occurring in a different channel.It extends the class Registry that abstract most of the event storage and management.

### EventService.on(options, context) 

Subscribe to the event identified by "name", to be executed with the given priority or default (1) on the given channel.If the channel is not provided/undefined, the default channel is used.Returns an object Event allowing for (priority change, pause/resume/stop) see Event API.

**Parameters**

**options**: `object`, <br/> - name: {string} name of the event,                                 <br/> - callBack: {function} function to execute when event is triggered, <br/> - channel: (optional) {string},                                     <br/> - context: (optional) {any},                                        <br/> - data:    (optional) {any},                                        <br/> - priority: (optional) {number}

**context**: `object`, Context to execute the callback on.

**Returns**: `Event`, event

**Example**:
```js
var evtService = new EventService();  var evt = evtService.on({    name: 'eventNameFoo',    callBack: function(){  // Do stuff },    channel: 'channelFoo', // Optional    priority: 1            // Optional default is 1  });  // Register event named 'eventNameFoo' on the channel 'channelFoo' with a priority of 1
```

### EventService.off(options.) 

Un-subscribe one / many event(s) from the service within the same channel based on the selector passed in parameters.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options.**: `Event | object`, The event returned or an object describing criteria:<br> - channel: (optional) {string},                                     <br/> - name: {string} name of the event to remove,                       <br/> - selector: {function} It provides the events belonging to the channel, and name if specified; in a one by one basis to allow fine selection.


**Example**:
```js
evtService.off(evt);  // will remove only the event evt  evtService.off({    name: 'nameFoo',    channel: 'channelFoo'  });  // will remove all events named 'nameFoo' in the channel 'channelFoo'  evtService.off({    channel: 'channelFoo',    selector: function(e){ // will provide only events from the channel 'channelFoo'.      return (e.getName() === 'fooA' || e.getName() === 'fooB') && e.getPriority() < 10;    }  });  // will clear all events named 'fooA' or 'fooB' in the channel 'channelFoo' with a priority lower than 10.
```

### EventService.trigger(options, arguments) 

Trigger events based on the event name or an object describing selectors.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options**: `object`, object describing criteria:<br/> - channel: (optional) {string},                   <br/> - name: {string} name of the event to trigger,    <br/> - selector: {function} It provides the events belonging to the channel, and name if specified; in a one by one basis to allow fine selection.

**arguments**: `any`, parameters of the triggered callback


**Example**:
```js
evtService.trigger({    name: 'nameFoo'  }, 'foo', 'bar', 123);  // triggers all events named 'nameFoo' on default channel passing arguments 'foo', 'bar', 123  var options = {    channel: 'channelFoo',    selector: function(e){      return e.getPriority() > 10 && e.getName() === 'nameFoo';    }  };  evtService.trigger(options, 'foo', 'bar', 123);  // triggers all events on channel 'channelFoo' with a priority greater than 10 and named 'nameFoo'  // passing arguments 'foo', 'bar', 123
```



* * *










