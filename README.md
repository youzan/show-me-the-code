# Show Me The Code
> Talk is cheap. Show me the code. —— Linus Torvalds

## Development
This project uses `webpack` to build both server side and client side.
```
npm i
npm run dev-build
```
The server's output is `build/server.js`. Some configuration files is needed in `../config` relative to `server.js`.
```
build
 - server.js
config
 - resource.js
 - config.js
 - db_config.js
```

Don't forget to set the environment variable `PUBLIC_PATH`, which is used for webpack's `output.publicPath`

Example `resource.js`:
```js
module.exports = {
  base: '//www.icode.live', // or www.yourcdn.com
  js: {
    "index" : "/static/index_67e521d45893e3e45bfd.js",
    "room" : "/static/room_4dc9f53f44cc8a031416.js",
    "run" : "/static/run_0ed17895bb59fe7d0772.js",
    "vendor" : "/static/vendor_025cc97224dafb633a32.js"
  },
  css: {
    "index" : "/static/index_4d2e74ce2d931d3f182a5b111b9731e3.css",
    "room" : "/static/room_9fc715636eaef415cbb26ab989638f5d.css"
  }
}
```
Example config.js
```js
module.exports = {
  URL: {
    base: 'http://www.icode.live', // change to www.yourwebsite.com
    prefix: '/', // actual url will be ${base}${prefix}
    websocket: 'ws://www.icode.live', // socket.io address
    monaco: 'http://monaco.icode.live', // monaco editor's file address, will be changed in future since monaco editor has released an es module build
    loader: 'http://monaco.icode.live/vs/loader.js', // monaco editor's AMD loader, will be changed in future since monaco editor has released an es module build
    babel: 'http://www.icode.live/static/babel.min.js' // standalone version babel file, will be changed in future
  }
}
```
`db_config.js`:
This is <a href="http://docs.sequelizejs.com">Sequelize</a> config, please read <a href="http://docs.sequelizejs.com">Sequelize</a> documentation.
Following `define` is required:
```js
// ...
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
// ...
```

## Production Build
```
npm run dist
```

## Example Database Table Creation
The `coding_id` field is UUID, this is for `mysql`. For other databases with native UUID support, eg. `Postgresql`, you can use `uuid` instead of `CHAR(36)`.
```sql
CREATE TABLE `coding_room` (
  `coding_id` CHAR(36) NOT NULL COMMENT 'id',
  `coding_key` CHAR(4) NOT NULL COMMENT 'key',
  `coding_content` TEXT NOT NULL COMMENT 'content',
  `coding_language` CHAR(20) NOT NULL DEFAULT 'javascript' COMMENT 'language',
  `coding_last_time` DATE NOT NULL COMMENT 'last time',
  `created_at` DATE NOT NULL COMMENT 'created at',
  `updated_at` DATE NOT NULL COMMENT 'updated at',
  `creator_key` CHAR(36) NOT NULL COMMENT 'creator key',
  PRIMARY KEY (`coding_id`)
)
```
