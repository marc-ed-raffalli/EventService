Global
===





---

Event
===


Event.incrementPriority(step) 
-----------------------------
Increment the original priority by 1 (default) or number provided.Throw Error if the event has been stopped before.

**Parameters**

**step**: number, (optional) Value to increment the priority by

Event.decrementPriority(step) 
-----------------------------
Decrement the original priority by 1 (default) or number provided.Throw Error if the event has been stopped before.

**Parameters**

**step**: number, (optional) Value to decrement the priority by

Event.trigger(args) 
-----------------------------
Call the event callback providing the arguments.Throw Error if the event has been stopped before.

**Parameters**

**args**: Array, arguments applied to the callback

Event.isPaused() 
-----------------------------
Give the 'paused' status of the event.

**Returns**: boolean, 
Event.pause() 
-----------------------------
Prevent the event callback to be called.Throw Error if the event has been stopped before.

Event.resume() 
-----------------------------
Allow the event callback to be called again by the Event Service.Throw Error if the event has been stopped before.

Event.stop() 
-----------------------------
Prevent the event callback to be called by removing it from the Event Service.

Event.isStopped() 
-----------------------------
Give the 'stopped' status of the event.

**Returns**: boolean, 

EventService
===


EventService.on(options, context) 
-----------------------------
Subscribe to the event identified by "evtName" on the specified channel,If the channel is not provided, the default channel is used.<br>The priority allows the events to be executed in a certain order. It also allows to select by priority event to execute.<br>Returns the event object.

**Parameters**

**options**: object, evtName: string,<br> callBack: function,<br> channel: (optional) string,<br> priority: (optional) number,

**context**: object, Subscribe to the event identified by "evtName" on the specified channel,If the channel is not provided, the default channel is used.<br>The priority allows the events to be executed in a certain order. It also allows to select by priority event to execute.<br>Returns the event object.

**Returns**: Event, event
EventService.off(options) 
-----------------------------
Un-subscribe one / many event(s) from the service.The off functions allows for filtering and can un-subscribe many events based on the filters passed in parameters.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options**: string, Event or object. The event returned by on or an object describing selectors:<br> evtName:  (optional),<br> channel: {string} (optional),<br> prioritySelector: {function} (optional)

EventService.trigger(options, [args]*) 
-----------------------------
Trigger events based on the event name or an object describing selectors.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options**: string, object / string The event name or an object describing selectors<br> evtName:  (optional),<br> channel: {string} (optional),<br> prioritySelector: {function} (optional), // filters event by priority

**[args]***: any, parameters of the triggered callback



---








