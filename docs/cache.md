---
layout: docs

title: Cache
---

## {{ page.title }}


Caching is a crucial aspect of optimizing web applications. By storing a copy of the previously fetched result, you can reduce the time taken to serve the same content to the user. Typetron provides a simple and effective caching system that supports multiple caching drivers, allowing you to choose the best storage mechanism for your application's needs.

## Configuration

To configure the cache system in Typetron, you'll use the `CacheConfig` class. Here's a brief overview:

```typescript
import { BaseConfig } from './BaseConfig'

type Store = keyof CacheConfig['stores']

export class CacheConfig extends BaseConfig<CacheConfig> {
    defaultStore: Store = process.env?.CACHE_DRIVER as Store ?? 'file'

    stores = {
        file: {
            path: 'cache/data',
        },

        memory: {},

        database: {
            table: 'cache',
            connection: null,
        },
    }
}
```

- **defaultStore**: This is the default cache driver that your application will use. It can be set using the CACHE_DRIVER environment variable or will default to the file driver.

- **stores**: This is where you define the settings for each cache driver.


## Cache Stores
### FileStore
The FileStore driver caches the data in files. This is useful for applications that don't require a distributed cache system.

Configuration:
```typescript
file: {
    path: 'cache/data'
}
```
- **path**: The directory where the cache files will be stored.


### DatabaseStore
The DatabaseStore driver caches the data in a database table. This is useful for applications that might benefit from a centralized cache.

Configuration:

```typescript
database: {
    table: 'cache',
    connection: null
}
```

- **table**: The name of the database table.
- **connection**: The name of the database connection to use. If set to null, it will use the default database connection.


### MemoryStore
The MemoryStore driver caches the data in memory using a JavaScript array. This driver is useful for unit testing or for applications with a short lifecycle (like serverless).

Configuration:

```typescript
memory: {}
```

## How to use the Cache feature

To use the cache system in your Typetron application, you can inject the cache service into any class, like a controller:

```typescript
import { Controller, Get } from '@Typetron/Router'
import { cache } from '@Typetron/Cache'

@Controller('articles')
class ArticleController {

    @Inject()
    cache: Cache
    
}
```

### Cache Methods
- **get(key: string)**: Retrieve an item from the cache by key.

- **set(key: string, value: any, durationInSeconds?: number)**: Store an item in the cache for a certain number of seconds.

- **delete(key: string)**: Remove an item from the cache.

- **flush()**: Remove all items from the cache.

For example, to set a cache value:
```typescript
await this.cache.set('key', 'value', 3600); // Cache for 1 hour
```
To retrieve a cache value:
```typescript
const value = await this.cache.get('key');
```

To remove a cache from the store:
```typescript
await this.cache.delete('key');
```

To clear all the cached values from the store:
```typescript
await this.cache.flush();
```


Remember, caching is a powerful feature, but it's essential to use it wisely to ensure that your application serves fresh content when needed and cached content when it's efficient to do so.
