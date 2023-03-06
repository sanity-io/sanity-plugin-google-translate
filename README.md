> This is a **Sanity Studio v3** plugin.

## Installation

```sh
npm install sanity-plugin-google-translate
```

# sanity-plugin-google-translate

## Installation

```
npm install --save sanity-plugin-google-translate
```

or

```
yarn add sanity-plugin-google-translate
```

## Usage
Add it as a plugin in sanity.config.ts (or .js):

```
 import {createConfig} from 'sanity'
 import {myPlugin} from 'sanity-plugin-google-translate'

 export const createConfig({
     /...
     plugins: [
         myPlugin({})
     ]
 })
```
## License

MIT © Sanity.io
See LICENSE

## License

[MIT](LICENSE) © Sanity.io


## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/sanity-plugin-google-translate/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.