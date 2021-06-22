import React from 'react';
import { TranslationInput } from './TranslateInput';

export type Locale = {
  id: string;
  title: string;
  isDefault?: boolean
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
    fields: languages
      .sort((a, b) => {
        if (a.isDefault === true) return -1
        if (b.isDefault === true) return 1
        return 0;
      })
      .map(l =>
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
