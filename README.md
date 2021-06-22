# Sanity + Google Translate = 🤩

This plugin lets you connect Sanity document fields to Google Cloud Translate API, giving you instant machine translations for 108 languages and counting!

![google translate demo](https://user-images.githubusercontent.com/38528/123012822-d00cc980-d377-11eb-9641-57eb0c521616.gif)


## Usage

```
nmp install sanity-plugin-google-translate
```

Somewhere in your studio you should define a list of languages you want to support. One of these should be marked as the default language.

```javascript
// languages.js
const languages = [
  {
    id: 'en',
    title: 'English',
    isDefault: true,
  },
  {
    id: 'es',
    title: 'Spanish',
  },
  {
    id: 'fr',
    title: 'French',
  },
];

export default languages

```

With that in place you use the `localizeInput` helper from this module to define localized versions of schema types, such as strings, texts or even rich texts.

```javascript
// localizedString.js
import { localizeInput } from 'sanity-plugin-google-translate';
import languages from "./languages"

const localizedString = localizeInput({
  name: 'localizedString',
  type: {
    // Here is a normal Sanity type definition
    type: 'string',
  },
  languages,
  // This is the Google Cloud Translation API Key
  // Create this at https://console.cloud.google.com/ and see note below on security.
  apiKey: 'AIzaSyAF4ESA6y6uu9LksDenAJk4RagStsM1CTs',
});

export default localizedString;
```

`localizeInput` will take your normal Sanity schema field definition, the languages array and api key and produce a localized object field with custom buttons to translate the base language. You may also create corresponding localized versions of text or rich text fields.

You may then use `localizedString` as any normal schema field in your documents

```javascript
// demo.js
export default {
  type: 'document',
  name: 'demo',
  fields: [
    {
      type: 'localizedString',
      name: 'title',
      description: 'Title in many languages',
    },
  ],
};
```

And tying it all together just like any other schema definition on Sanity

```javascript
import schemaTypes from "all:part:@sanity/base/schema-type";
import createSchema from "part:@sanity/base/schema-creator";
import localizedString from "./localizedString"
import demo from "./demo"

export default createSchema({
  name: "default",
  types: schemaTypes.concat([
    localizedString,
    demo
  ])
});
```

### Portable Text
Here is an example of how you can localize portable text through Google Translate. This module works great for translating the block objects that represent paragraphs in portable text. If you have custom objects in your rich text with texts on those this module cannot reach into it and translate those at this moment.

```javascript
const richText = {
  type: "array",
  name: "bodyText",
  of: [{ type: "block" }, { type: "image" }, { type: "tweetEmbed" }],
};

const localizedBody = localizeInput({
  type: richText,
  name: "localizedBody",
  languages,
  apiKey,
});
```

## API Key security
By including your Google Cloud Translation API key in the schema definition it becomes part of the Studio bundle which is hosted as static files on webservers. This means someone could find your key, just like they can for google maps api keys etc that you include in other websites. To avoid others using your key you should restrict your key to hosts where your studio runs, like localhost:3333, a sanity.studio or custom domain you may be hosting at.

More info at https://cloud.google.com/docs/authentication/api-keys#adding_http_restrictions
