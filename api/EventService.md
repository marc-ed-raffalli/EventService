Global
===





---

Event
===


Event.incrementPriority(step) 
-----------------------------
Increment the original priority by 1 (default) or number provided.

**Parameters**

**step**: number, (optional) Value to increment the priority by

Event.decrementPriority(step) 
-----------------------------
Decrement the original priority by 1 (default) or number provided.

**Parameters**

**step**: number, (optional) Value to decrement the priority by

Event.trigger(args) 
-----------------------------
Call the event callback providing the arguments.

**Parameters**

**args**: Array, arguments applied to the callback

Event.isPaused() 
-----------------------------
Give the 'paused' status of the event.

**Returns**: boolean, 
Event.pause() 
-----------------------------
Prevent the event callback to be called.

Event.resume() 
-----------------------------
Allow the event callback to be called again by the Event Service.

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
Subscribe to the event identified by "evtName" on the specified channel,

**Parameters**

**options**: object, evtName: string,<br>

**context**: object, Subscribe to the event identified by "evtName" on the specified channel,

**Returns**: Event, event
EventService.off(options) 
-----------------------------
Un-subscribe one / many event(s) from the service.

**Parameters**

**options**: string, Event or object. The event returned by on or an object describing selectors:<br>

EventService.trigger(options, [args]*) 
-----------------------------
Trigger events based on the event name or an object describing selectors.<br>

**Parameters**

**options**: string, object / string The event name or an object describing selectors<br>

**[args]***: any, parameters of the triggered callback



---







