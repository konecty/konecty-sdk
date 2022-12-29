For generate new classes from MetaObjects fixtures:

```
yarn build && find ./src/__test__/fixtures/MetaObjects -type f -exec node dist/cli/index.js create class {} -o ./src/__test__/fixtures/types \;
```
