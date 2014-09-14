EventService
============

The EventService is a lightweight implementation of the "Observer" pattern.

It allows for filtering when triggering /publishing or removing /unsubscribing. 
Events can be triggered or removed based on name, priority, channels.


## Features

* Channels
* Priority
* Event selection / filtering

No dependency.

## API

### EventService.prototype.on()

Subscribe a new event to the service. 

Register the event identified by "evtName" on the specified "channel", default one if none specified.
Returns the event id.

The function takes:
 
* evtName: {string} The event name to subscribe to
* callback: {function} The function to execute
* channel: {string} \[optional\] The communication channel where the event will be registered.
* priority: {number} \[optional\] The callbacks are called by priority, default is 0 (zero). 
* context: {object} Context to call the function

It returns a unique event Id.

    var evtService = new EventService(),
        options = {
            evtName: 'eventNameFoo',
            callBack: function(){ /* Do stuff */ },
            channel: 'channelFoo',      // Optional
            priority: 1      // Optional default is 0
        };
        
    var evtIt = evtService.on(options, this);
    

### EventService.prototype.off()

Un-subscribe one / many event(s) from the service. 

The off functions allows for filtering and can un-subscribe one or many events based on the filters passed in parameters.
Only one channel is affected by the filters, if the channel is not provided, the default channel is used. 

The function accepts as first argument:

*   evtId: {string}

**Or filters**

*  evtName: {string} \[optional\],
*  channel: {string} \[optional\],
*  prioritySelector: {function} \[optional\]


    var evtService = new EventService();
        // add events...
        // remove:        
        
    evtService.off(evtId); // will remove the event having this id
    
    evtService.off({
      evtName: 'evtNameFoo',
      channel: 'channelFoo',
      prioritySelector: function(priority){ return priority===3; }        
    }); // will clear all events name 'evtNameFoo' in the channel 'channelFoo' with a priority of 3

### EventService.prototype.trigger()

Trigger events based on the event name or an object describing filters.
If the channel is not provided, the default channel is used.

The function accepts as first argument:

*   evtName: {string}

**Or filters**

*  evtName: {string} \[optional\],
*  channel: {string} \[optional\],
*  prioritySelector: {function} \[optional\]

Then the rest of arguments are applied on the callback the 


    var evtService = new EventService();
    // add events...
    // trigger events
    
    evtService.trigger('evtNameFoo', 'foo'); 
    // triggers all events named 'evtNameFoo' on default channel passing argument 'foo'
    
    evtService.trigger('evtNameFoo', 'foo', 'bar', 123);
    // triggers all events named 'evtNameFoo' on default channel passing arguments 'foo', 'bar', 123
    
    var options = {
      evtName: 'evtNameFoo',
      channel: 'channelFoo',
      prioritySelector: function(priority){
        return priority > 10;
      }
    };
    evtService.trigger(options, 'foo', 'bar', 123);
    // triggers all events event named 'evtNameFoo' on channel 'channelFoo' with a priority greater than 10
    // passing arguments 'foo', 'bar', 123


## Testing

Using Coffee script, available on browser loading the index.html.

## Tested browsers

* Chrome 37
* Firefox 31

Uses some features of the future Harmony (ECMAScript 6). Does not suit old browser

## TODO

Add testing phase in Gulp