# sanity-plugin-google-translate

This plugin lets you connect Sanity fields to Google Cloud Translate API, giving you instant machine translations for 108 languages and counting! Enable it for all of them! ...or just the ones you need.

https://user-images.githubusercontent.com/9684022/158199868-5426b7dd-8439-406f-bf16-661c4bf060a0.mov

## Installation

```
sanity install google-translate
```

## Configuration

The Google Translate plugin is designed to work with [field-level translated objects](https://www.sanity.io/docs/localization#cd568b11a09c) as a Custom Input Component to add a superset of features – automated machine translation.

These objects should be registered in the way recommended by the [@sanity/language-filter plugin](https://www.npmjs.com/package/@sanity/language-filter).

Adding the Translation buttons requires adding an `inputComponent` and API key to the object's schema. See this example of a localized string object below.

Note: This will not translate Portable Text content, as that schema type should not be mapped over multiple times in a single document. If you need multiple languages of Portable Text, you are best to use [document-level translation](https://github.com/sanity-io/document-internationalization).

### Example: Add Google Translate to all localized `string` objects

```js
import GoogleTranslateInput from 'sanity-plugin-google-translate'

const languages = [
  {id: 'en', title: 'English', isDefault: true},
  {id: 'es', title: 'Spanish'},
  {id: 'fr', title: 'French'},
]

export default {
  name: 'localizedString',
  type: 'object',
  // 👇 👇 👇
  // See: https://www.sanity.io/docs/custom-input-widgets
  inputComponent: GoogleTranslateInput,
  options: {
    // This API key will be bundled with your studio
    // and so should be restricted by hostname
    // See: https://www.sanity.io/docs/studio-environment-variables
    apiKey: process.env.SANITY_STUDIO_GOOGLE_TRANSLATE_API_KEY,
    // (Optional) Format of the translation, either 'html' (default) or 'text'. Text will preserve line breaks in text inputs.
    format: 'html'
  },
  // 👆 👆 👆
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: languages.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: 'string', // or `text`, etc
    fieldset: lang.isDefault ? null : 'translations',
  })),
}
```

### Example: Extend some localized `string` objects with Google Translate

Alternatively, you could selectively extend specific uses of `localizedString`, by registering another object to your schema which uses it as a base. This is helpful if you only need Google Translate on specific fields.

```js
import GoogleTranslateInput from 'sanity-plugin-google-translate'

export default {
  name: 'localizedGoogleTranslateString',
  title: 'Localized String',
  type: 'localizedString',
  inputComponent: GoogleTranslateInput,
  options: {
    apiKey: process.env.SANITY_STUDIO_GOOGLE_TRANSLATE_API_KEY,
  },
}
```

## API Key security

By including your Google Cloud Translation API key in the schema definition it becomes part of the Studio bundle which is hosted as static files on webservers.

To avoid others using your key you should restrict it to hosts where your studio runs, like

- `http://localhost:3333/*`
- `http://<your-project>.sanity.studio/*`
- ...or custom domain you may be hosting the Studio

[More info on adding HTTP restrictions](https://cloud.google.com/docs/authentication/api-keys#adding_http_restrictions)
