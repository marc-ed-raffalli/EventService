EventService
============

[![Build Status](https://travis-ci.org/chi-mai2b/EventService.svg?branch=master)](https://travis-ci.org/chi-mai2b/EventService)

The EventService is a lightweight implementation of the "Observer" pattern. 
Implemented without any dependency.

It allows for filtering when triggering / *publishing* or removing / *unsubscribing*.  
Events can be triggered or removed based on name, priority, channels.


## Features

* Channels
* Priority
* Event selection / filtering
* Individual event control
    * pause / resume
    * increment / decrement priority 
    * stop


## API & Examples

[see API and examples](./api/EventService.md)

## Testing

Using Coffee script, available on browser loading the index.html.

## Tested browsers

* Chrome 37
* Firefox 31

Uses some features of the future Harmony (ECMAScript 6). Does not suit old browser

## TODO

Add testing phase in Gulp  
Add support for older browsers