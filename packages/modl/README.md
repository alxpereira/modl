# `modl`

## Installation

See [Installation guide](../../README.md)

## Basic

Modl works as an extend on Javascript Classes 

```js
import { Model } from 'modl'

class User extends Model {
    // ... constructor or other properties
}

const user = new User({ firstname: 'John', lastname: 'Doe' })

// your model is now on steroids 💪
```

## Constructor

Modl extended classes can activate features by populating [options](#options) in the constructor super call with the following arguments `super(data, options)`

- `data` - your object data
- `option` - modl options object

Example 
```js
import { Model } from 'modl'

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

Modl includes the following options by default: 


### `options.exposer`
The exposer feature allows you to display only a part of your object, super useful in API management.

Example
```js
import { Model } from 'modl'

const exposer = {
    public: [
        'id'
    ]
}

class User extends Model {
    constructor(data, { exposer })
}

const user = new User({ id: 1234, firstname: 'John', lastname: 'Doe' })

console.log(user.expose('public')) // { id: 1234 }
```

### `options.schema`
You can add a schema to any modl extended class to activate feature such as validation for example. More documentation in the [schema section](#schema)

Example
```js
import { Model, Schema } from 'modl'

const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data, { schema })
}
```

## Schema

Schemas allows you to use modl for validation.
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
    constructor(data, { schema })
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

You can use object schema validation by calling the getter `{model}.validation`

Example with valid data:
```js
const schema = new Schema({
    firstname: {
        type: String
    }
})

class User extends Model {
    constructor(data, { schema })
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
    constructor(data, { schema })
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