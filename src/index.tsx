import React from 'react';
import { TranslationInput } from './TranslateInput';

export type Locale = {
  id: string;
  title: string;
};

export type InputOptions = {
  name: string;
  type: any;
  languages: Locale[];
  apiKey: string;
};

export const localizeInput = (options: InputOptions) => {
  const { name, type, languages } = options;
  return {
    type: 'object',
    name,
    fields: languages.map(l =>
      Object.assign({}, type, {
        name: l.id,
        title: l.title,
      })
    ),
    inputComponent: (props: any) => (
      <TranslationInput {...props} apiKey={options.apiKey} />
    ),
  };
};
