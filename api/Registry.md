# Global





* * *

## Class: Registry
The Registry is used for storage and management of items.

### Registry.constructor() 

Initializes the Registry properties.


### Registry.register(options) 

Registers a new item to the Registry on the given channel and name.If the channel is not provided/undefined, the default channel is used.

**Parameters**

**options**: `object`, <br/> - name: {string} name of the item,<br/> - channel: (optional) {string}

**Returns**: `RegistryItem`

### Registry.remove(options.) 

Removes item(s) from the specified channel based on the criteria and selector passed in parameters.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options.**: `RegistryItem | object`, The item returned by register or an object describing criteria:<br> - channel: (optional) {string},                                     <br/> - name: {string} name of the item(s) to remove,                       <br/> - selector: {function} It provides the items belonging to the channel, and name if specified; in a one by one basis to allow fine selection.

**Returns**: `array`, Items removed from the Registry

### Registry.filter(options.) 

Selects and returns item(s) from the specified channel based on the criteria and selector passed in parameters.<br>If the channel is not provided, the default channel is used.

**Parameters**

**options.**: `object`, <br> - channel: (optional) {string},                 <br/> - name: {string} name of the item(s) to remove, <br/> - selector: {function} It provides the items belonging to the channel, and name if specified; in a one by one basis to allow fine selection.




* * *










