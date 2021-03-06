# `@topmodel/core`
Modern ORM for minimalist coders

- 0 dependency ! 
- Test driven

## Installation

With `npm`
```sh
npm install @topmodel/core
```

or `yarn`
```sh
yarn add @topmodel/core
```

## Index
* [Basics](#basics)
* [Constructor](#constructor)
* [Options](#options)
    * [Database](#optionsdb)
    * [Exposer](#optionsexposer)
    * [Schema](#optionsschema)
* [Schema & Validation](#schema)

## Basic

TopModel works as an extend on Javascript Classes 

```js
import { Model } from '@topmodel/core'

class User extends Model {
    // ... constructor or other properties
}

const user = new User({ firstname: 'John', lastname: 'Doe' })

// your model is now on steroids 💪
```

## Constructor

TopModel extended classes can activate features by populating [options](#options) in the constructor super call with the following arguments `super(data, options)`

- `data` - your object data
- `options` - TopModel options object

Example 
```js
import { Model } from '@topmodel/core'

const options = { /* ... your options */ }

class User extends Model {
    constructor(data){
        super(data, options)
    }
}

const user = new User({ firstname: 'John', lastname: 'Doe' })
// user will now inherit from more powerful features
```

## Options

Options can power your classes with features, plugins etc...

TopModel includes the following options by default: 

### Database relation
#### Note: by default topmodel core will attribute a table name related to your model name, for example model `User` will become  `user` table in SQL or collection in Mongo.

### `options.db`
You can connect a Plugin to allow your model to interact with a distant database. 
Our first plugin is [Mongo](/packages/mongo/README.md)

Example
```js
import { Model } from '@topmodel/core'
import { MongoPlugin } from '@topmodel/mongo'

const { MONGO_URL, MONGO_DATABASE } = process.env

const db = new MongoPlugin({
    url: MONGO_URL,
    database: MONGO_DATABASE
})

class User extends Model {
    constructor(data){
        super(data, { db })
    }
}

const user = new User({ /*... data */ })
await user.save() // save to mongo
```

### `options.table`
This option is forcing your model to work with a specific db table (for example a collection in Mongo or depending then on the db plugin)

For example is you want to force your [mongo plugin](../mongo/README.md) to work with the collection `parents` 
```js
const db = new MongoPlugin({
    url: MONGO_URL,
    database: MONGO_DATABASE
})

const table = 'parents'

class User extends Model {
    constructor(data){
        super(data, { db, table })
    }
}

// now User will interact with the 'parents' collection
```

### `options.exposer`
The exposer feature allows you to display only a part of your object, super useful in API management.

```
User(id, firstname, lastname, city)
User.expose('public') => User(id)
```

Example
```js
import { Model } from '@topmodel/core'

const exposer = {
    public: [
        'id'
    ]
}

class User extends Model {
    constructor(data){
        super(data, { exposer })
    }
}

const user = new User({ id: 1234, firstname: 'John', lastname: 'Doe' })

console.log(user.expose('public')) // { id: 1234 }
```

### `options.schema`
You can add a schema to any TopModel extended class to activate feature such as validation for example. More documentation in the [schema section](#schema)

Example
```js
import { Model, Schema } from '@topmodel/core'

const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema })
    }
}
```

## Schema

Schemas allows you to use TopModel for validation.
Properties options are the following : 

- `type` - data type to be validated (see JS Types)
- `required` - boolean, to specify if an object is required or not
- `default` - default value when unspecified

```js
const schema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema })
    }
}
```

### Nested Schemas

You can also nest schemes, validation will work recursively based on the `sub` property of each schema element.

```js
const schema = new Schema({
    job: {
        type: Object,
        sub: {
            title: {
                type: String,
                required: true
            }
        }
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})
```

## Validation

Topmodel includes a no-dependency fully integrated validation system

### `{model}.validation`

You can use object schema validation by calling the getter `{model}.validation`

Example with valid data:
```js
const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema })
    }
}

const user = new User({ firstname: 'John' })

console.log(user.validation)
/*
{
    values: { firstname: 'John' }
}
*/
```

Invalid data will populate an errors object with the detail of each error

Example with invalid data:
```js
const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema })
    }
}

const user = new User({ hack: 847846 })

console.log(user.validation)
/*
{
    errors: [{
        key: 'hack',
        message: 'not in schema'
    }]
}
*/
```

### `{model}.validate()`

You can also use the validation method `{model}.validate()` which has two main differences : 

- `validate()` will throw if an error occur
- `validate()` doesn't return any value if valid, because it's chainable ❤️

Usage : 

With valid data & chained :

```js
// model setup
const exposer = {
    public: [
        'id'
    ]
}

const schema = new Schema({
    id : {
        type: Number
    }
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema, exposer })
    }
}

// [...]

const user = new User({ id: 847846, firstname: 'John-Michel' })

const exposed = user.validate().expose('public')
console.log(exposed) // { id: 847846 }
```

With invalid data :
```js
// model setup
const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data){
        super(data, { schema })
    }
}

// [...]

const user = new User({ hack: 847846 })

try {
    user.validate()
} catch (errors){
    console.log(errors) // display validation errors
}
```
