EventService
============

[![Build Status](https://travis-ci.org/chi-mai2b/EventService.svg?branch=master)](https://travis-ci.org/chi-mai2b/EventService)

The EventService is a lightweight implementation of the "Observer" pattern. 

It allows for filtering when triggering / *publishing* or removing / *unsubscribing*.  
Events can be triggered or removed based on name, priority, channels.

Implemented without any dependency.

## Features

* Channels
* Priority
* Event selection / filtering
* Individual event control
    * pause / resume
    * increment / decrement priority 
    * stop

## API & Examples

[EventService API and examples](./api/EventService.md)  
[Event API and examples](./api/Event.md)

See [example application](./example/bubblemixer/index.html)

## Utils

### Tests

Run the tests with watch mode (will start Chrome and Firefox):

    ./script/start-test-watch.sh
 
This will compile the tests on the fly and execute on the browsers. 
The debug mode on the page allows for debugging through browser developer tools.    
    
Test report available on `test/index.html`. 
You need to compile the tests before run.
    
    gulp browserify-test

### Build    
    
    gulp    

## Tested browsers

* PhantomJS
* Chrome 39
* Firefox 31

## Revision history

- added property "data" in class Event
- added example bubblemixer
- moved built source to lib

## TODO

Add coverage report