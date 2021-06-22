# Sanity + Google Translate = 🤩

This plugin lets you easily connect field inputs to Google Cloud Translate API.

## Usage

```
nmp install sanity-plugin-google-translate
```

You'll want to define the localized version of your schema field(s). Here is an example for a string field.

```javascript
import { localizeInput } from 'sanity-plugin-google-translate';
// list of languages should be defined in its own file for easy sharing. Inlined here for simplicity.
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

const localizedString = localizeInput({
  name: 'localizedString',
  type: {
    type: 'string',
  },
  languages,
  apiKey: 'AIzaSyAF4ESA6y6uu9LksDenAJk4RagStsM1CTs',
});

export default localizedString;
```

`localizeInput` will take your normal Sanity schema field definition, the languages array and api key and produce a localized object field with custom buttons to translate the base language. You may also create corresponding localized versions of text or rich text fields.

You may then use `localizedString` as any normal schema field in your documents

```javascript
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
