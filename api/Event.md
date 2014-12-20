# Global





* * *

## Class: Event
The class Event holds all information (name, callback, priority and channel) about the event registered.Extends the class RegistryItem abstracting basic concepts.

### Event.getId() 

Returns the event id

**Returns**: `integer`

### Event.getChannel() 

Returns the event channel

**Returns**: `string`

### Event.getCallback() 

Returns the event callBack

**Returns**: `function`

### Event.getContext() 

Returns the event context

**Returns**: `any`

### Event.getName() 

Returns the event name

**Returns**: `string`

### Event.getPriority() 

Returns the event priority

**Returns**: `integer`

### Event.incrementPriority(step) 

Increments the original priority by 1 (default) or number provided.<br>Throws Error if the event has been stopped before.                 <br>Throws TypeError if type mismatch.

**Parameters**

**step**: `number`, (optional) Specific value to increment the priority by.


### Event.decrementPriority(step) 

Decrements the original priority by 1 (default) or number provided.<br>Throws Error if the event has been stopped before.                 <br>Throws TypeError if type mismatch.

**Parameters**

**step**: `number`, (optional) Specific value to decrement the priority by.


### Event.trigger(arguments) 

Calls the event callback providing the arguments which executes under the registered context.<br>Throws Error if the event has been stopped before.

**Parameters**

**arguments**: `any`, applied to the callback


### Event.isPaused() 

Gives the 'paused' status of the event.

**Returns**: `boolean`

### Event.pause() 

Prevents the event callback to be called.         <br>Throws Error if the event has been stopped before.


### Event.resume() 

Allows the event callback to be called again.<br>Throws Error if the event has been stopped before.


### Event.stop() 

Prevents the event callback to be called or altered.Removes it from the Event Service.


### Event.isStopped() 

Returns the 'stopped' status of the event.

**Returns**: `boolean`



* * *










