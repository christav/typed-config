# typed-config - a strongly typed configuration object for TypeScript

## Introduction

With any complicated project, there's configuration. And a ton of configuration code to read it,
check if there is a setting or not, validate, type conversion, etc. Modules like [node-config](https://www.npmjs.com/package/config)
provide lots of flexibility on where to read configuration _from_, but you still need to write
a bunch of code to actually read these settings, validate them, and convert them to something useful.

In my projects, I find myself writing code like this a lot:

```typescript
import * as NodeConfig from 'config';
import { decryptPassword } from './my/code/somewhere';

export class MySettings {
  public serviceUrl: string;
  public port: number;
  public databasePassword: string;
  public databaseName: string;
}

export async function readSettings(): Promise<MySettings> {
  const settings = new MySettings();
  settings.serviceUrl = NodeConfig.get('service.url');
  if (!NodeConfig.contains('service.port')) {
      settings.port = 8080;
  } else {
    settings.port = parseInt(NodeConfig.get('service.port'), 10);
  }
  settings.databasePassword = await decryptPassword(NodeConfig.get('database.password'));
  settings.databaseName = NodeConfig.get('database.name');
}
```

As the number of settings grows, it gets harder and harder to manage them. The biggest issue
is that the information about what the settings are, what keys to read them from, and what
transformations and validations to perform on them are scattered around the codebase.
`typed-config` is a way to DRY this up, centralizing all the various configuration code into
the class definition so you only need to look in one place to see everything about a setting.

## Using `typed-config`

### Overview

This library depends on decorators, so make sure your tsconfig.json includes this setting:

```json
"compilerOptions": {
        "experimentalDecorators": true
    }
```

So let's look at what the above code looks like instead:
```typescript
import { key, optional, asNumber, loadConfiguration } from 'typed-config';
import { decryptPassword } from './my/code/somewhere';

export class MySettings {
  @key('service.url')
  public serviceUrl: string;

  @key('service.port', asNumber)
  @optional(8080)
  public port: number;

  @key('database.password', decryptPassword)
  public databasePassword: string;

  @key('database.name')
  public databaseName: string;
}

const settings = new MySettings();
await loadConfiguration(settings);
```

By decorating the fields of the configuration type, all the information needed
to load configuration is available where you need it - on the field itself. No
more wading through dozens of lines of code to figure out exactly where this
value is coming from!

### The `key` decorator

The most important part of the library is the `key` decorator. The signature
is:

```typescript
  function key(keyName: string, ...transforms: ValueTransform[])
```

Typical uses are show in the example above.

The keyname parameter is the string passed down to the config
provider (by default it uses the [node-config](https://www.npmjs.com/package/config)
library, but see below for more details) to look up the raw string value of
the config item.

The transforms are completely optional, but very useful.

### ValueTransforms

`ValueTransform` items are simply functions with this signature:

```typescript
  type ValueTransform = (value: any, target?: any, propName?: string): any;
```

In other words, a function that takes a value, and returns a value. In addition, the
function is also passed two additional parameters at load time: the target, which is
the object who's values are being set (in the example, the target is the mySettings object),
and the propName, which is the name of the property being set on that object. This lets
you use transforms to do things like type conversions, encryption/decryption,
or even setting a value based on another value on the object. See below for suggestions
of things you can do with transforms.

If the transform function returns a promise, the loadConfiguration function will automatically
wait for that promise to complete before executing the next transform and will not load
the next configuration setting until the promises have all completed for the previous one.

### Included transforms

There are a small set of very commonly used transforms provided by `typed-config`.
They are:

 * asNumber - converts a string to a number
 * asBoolean - converts a string with the value "true" (case insensitive) to boolean true, all other values convert to false.
 * trim - strips leading and trailing whitespace from a string.
 * split(splitChar) - takes a string value and splits it on the given character, turning it into an array of strings
 * map - run a value transform over an array

With split and map you have a very powerful way to compose transformations. For a simple
example, suppose you had configuration in an environment variable that looked like:

```
export PORTS='37,60, 80, 443'
```
And you wanted to load that as an array of numbers. Here's how you'd mark that up:

```typescript
export class MySettings {
    @key('ports', split(','), map(trim), map(asNumber))
    public ports: number[];
}
```

Transforms execute from left to right. So you'd start with the original string and split it on commas,
resulting in an array of strings. The map(trim) call will then go through that array, removing any
extra whitespace at the start or end of each element. And finally, the last map converts everything
in the array to a number.

### Optional settings

By default, all settings are required - if something is not present in the config it will
fail to load (throwing an exception). This is generally a good thing; if there's an error in your
configuration you want to know about it. However, not all setting are the same, and sometimes
you want optional settings - turning on various modes, or extra logging, for example. The
`optional` decorator lets you express this.

There are three variants of optional. The first is simple:

```typescript
class MySettings {
  @key('aValue')
  @optional
  public mightBeThere: string;
}
```

If the key `aValue` exists in the configuration, it'll be loaded and the mightBeThere field is
populated. If not, the field is null.

However, as in the port number above, you may want a default value is the setting is missing.
This is easy - pass your default value as an argument:

```typescript
class MySettings {
  @key('port', asNumber)
  @optional(3700)
  public portWithOptional: number;
}
```

There's also cases where you might have sets of configuration that work together. For example,
you may have a special monitoring configuration where, if it's turned on, you need some additional
configuration, but if it's turned off then you don't need that config at all. You can pass
an `OptionalPredicate` in this case so that the loader can decide if it needs to load the extra
settings. This is easier to understand with an example:

```typescript
class MySettings {
  // Do we need these settings at all?
  @key('extraLogging', asBoolean)
  public extraLoggingEnabled: boolean;

  // Need to know where to send the logging if it's turned on
  @key('loggingServer')
  @optional((target) => target.extraLoggingEnabled)
  public loggingServerUrl;
}
```

An `OptionalPredicate` is a function that returns true or false. It's passed these parameters:

 1. target - the object being loaded
 2. propertyName - the name of the property the `optional` decorator is applied to
 3. keyName - the keyName from the `key` decorator on this property
 4. config - the `ConfigProvider` being used to get values from

As with any javascript function, you only need to care about the parameters you need and can
ignore the rest.

The final variant of `optional` combines the previous two, letting you pass both a predicate
and a default value if the predicate does not pass.

```typescript
class MySettings {
  // Do we need these settings at all?
  @key('extraLogging', asBoolean)
  public extraLoggingEnabled: boolean;

  // Need to know where to send the logging if it's turned on
  @key('loggingServer')
  @optional((target) => target.extraLoggingEnabled, 'no-such-server.example')
  public loggingServerUrl;
}
```

### Nested settings objects

It's very common to want to nest chunks of related configuration into subobjects.
This is easy to do as well, but you need to give the library a little extra help to
tell it to recurse down the object tree. This is what the `nested` decorator is for.

For example, you might want to keep you database settings grouped together in a
subobject. Define that subobject as a separate class, annotate it as before, then create
a member of that type in the outer config class, and it'll all just work.

This makes a lot more sense with an example:

```typescript
import { key, loadConfiguration } from 'typed-config';

// This is our nested config - keeping the database settings together in one place
class DatabaseSettings {
  @key('db.server')
  public server: string;

  @key('db.name')
  public name: string;

  @key('db.password')
  public password: string;

  @key('db.user')
  public user: string;
}

// And the complete settings that have other settings too
class MyAppSettings {
  @key('port', asNumber)
  public port: number;

  @nested(DatabaseSettings)
  public database: DatabaseSettings;
}

let settings = new MyAppSettings();
await loadConfiguration(settings);

// Subobject is now populated
await connectToDatabase(settings.database.server, settings.database.port, settings.database.user, settings.database.password);
```

All you need to do is declare the type and pass that type name to the `nested` decorator so that
the config system knows where to look for it. The class for nested settings *must* have a
zero-argument constructor, as the loader will automatically new up instances of the class
as part of the loading process.

### Config providers

A config provider is a source of raw configuration values. In general use you don't need to
care. `typed-config` uses the [node-config](https://www.npmjs.com/package/config) package
as it's config provider by default.

You do have the ability to override this choice, however. This is most useful during testing
where you may want to hard-code the config values from an object. Or you may be using a different
configuration system.

Hooking up a different one is each. First, implement the `ConfigProvider` interface:

```typescript
export interface ConfigProvider {
  get(key: string): string;
  has(key: string): boolean;
}
```

to call into whatever you want, and then pass it as a second parameter to the `loadConfiguration`
function:

```typescript
loadConfiguration(mySettings, new MyCustonConfigProvider));
```

## Examples

... Coming soon ...
