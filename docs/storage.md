---
layout: docs

title: Storage
---

## {{ page.title }}

_In progress_

#### Reading files from a directory
```ts
const publicFiles = await storage.files('public')
const publicFilesDeep = await storage.files('public', true)
```

#### Read the content of a file
```ts
const content = await storage.read('public/index.html')
```

#### Check if a file exists
```ts
const fileExists = await storage.exists('index.ts')
```

#### Write to a file
```ts
const file = await storage.read('index.html')
await storage.put(file, 'public/html')
await storage.put(file, 'public/html' , 'main.html')
```

#### Create a directory
```ts
await storage.makeDirectory('public/images')
await storage.makeDirectory('public/videos')
```

#### Deleting a file
```ts
await storage.delete('public/index.html')
```
