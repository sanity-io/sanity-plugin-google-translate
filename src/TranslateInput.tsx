import React, { useState } from 'react';
import { FormBuilderInput } from '@sanity/form-builder/lib/FormBuilderInput';
import Fieldset from 'part:@sanity/components/fieldsets/default';
import { PatchEvent, setIfMissing, set } from '@sanity/form-builder/PatchEvent';
import { Flex, Box, Button, useToast } from '@sanity/ui';
import {
  Path,
  Marker,
  ObjectSchemaTypeWithOptions,
  BaseSchemaType,
} from '@sanity/types';
import blockTools from '@sanity/block-tools';

const blocksToHtml = require('@sanity/block-content-to-html');

const serializers = { types: {} };

type Block = {
  _type: string;
};

type StringOrBlocks = string | Block[];

type Format = 'text' | 'html';

const serialize = (value: StringOrBlocks): string => {
  if (typeof value === 'string') {
    return value;
  }

  const blocks: Block[] = value;
  let html = blocks.map(block => {
    if (block._type === 'block') {
      return blocksToHtml({
        blocks: [block],
        serializers,
      });
    } else {
      const el = document.createElement('span');
      el.className = 'notranslate';
      el.innerText = JSON.stringify(block);
      return el.outerHTML;
    }
  });
  return html.join('');
};

const deserialize = (value: string, format: Format, type: BaseSchemaType) => {
  if (format === 'html') {
    return blockTools.htmlToBlocks(value, type, {
      rules: [
        {
          deserialize(el: HTMLElement, _next: any, block: Function) {
            if (el.tagName.toLowerCase() !== 'span') return;
            if (el.className.toLowerCase() !== 'notranslate') return;
            return block(JSON.parse(el.innerText));
          },
        },
      ],
    });
  }
  return value;
};

type TranslateOptions = {
  type: BaseSchemaType;
  key: string;
  source: string;
};

const translateText = (
  text: StringOrBlocks,
  target: string,
  options: TranslateOptions
) => {
  const format: Format = options.type.name === 'array' ? 'html' : 'text';

  const url = 'https://translation.googleapis.com/language/translate/v2';
  const params = new URLSearchParams({ key: options.key });
  const endpoint = `${url}?${params}`;

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: serialize(text),
      target,
      format,
      source: options.source,
    }),
  })
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        const { error } = response;
        throw new Error(error.message);
      }
      const { data } = response;
      const { translations } = data;
      if (Array.isArray(translations) && translations.length > 0) {
        const [translation] = translations;
        return deserialize(translation.translatedText, format, options.type);
      }
    });
};

type Props = {
  apiKey: string;
  type: ObjectSchemaTypeWithOptions;
  value?: Record<string, any>;
  compareValue?: Record<string, unknown>;
  onChange?: (...args: any[]) => any;
  onFocus: (...args: any[]) => any;
  onBlur: (...args: any[]) => any;
  focusPath?: Path;
  markers?: Marker[];
  level?: number;
  readOnly?: boolean;
  isRoot?: boolean;
  filterField?: (...args: any[]) => any;
  presence: any[];
};

export const TranslationInput = React.forwardRef((props: Props, ref) => {
  const { apiKey } = props;

  const {
    compareValue,
    focusPath,
    markers,
    onBlur,
    onChange,
    onFocus,
    presence,
    type,
    value,
  } = props;

  const toast = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleFieldChange = React.useCallback(
    (field, fieldPatchEvent) => {
      if (onChange) {
        onChange(
          fieldPatchEvent
            .prefixAll(field.name)
            .prepend(setIfMissing({ _type: type.name }))
        );
      }
    },
    [onChange]
  );

  const translate = (locales: string[]) => {
    if (isTranslating || !baseValue || !onChange) {
      return;
    }

    setIsTranslating(true);

    const promises = locales.map(l =>
      translateText(baseValue, l, {
        source: base.name,
        type: base.type,
        key: apiKey,
      })
        .then(text => [text, l])
        .catch(error =>
          toast.push({
            status: 'error',
            title: error.message,
          })
        )
    );
    Promise.all(promises)
      .then(result => {
        // result is [["value", "lang"], ["value", "lang"]]
        const patches = PatchEvent.from(result.map(r => set(r[0], [r[1]])));
        onChange(patches);
      })
      .finally(() => setIsTranslating(false));
  };

  // Get an array of field names for use in a few instances in the code
  const fieldNames: string[] = type.fields.map(f => f.name);

  // If Presence exist, get the presence as an array for the children of this field
  const childPresence =
    presence.length === 0
      ? presence
      : presence.filter((item: any) => fieldNames.includes(item.path[0]));

  // If Markers exist, get the markers as an array for the children of this field
  let childMarkers = markers;
  if (markers && markers.length !== 0) {
    childMarkers = markers.filter((item: any) =>
      fieldNames.includes(item.path[0])
    );
  }

  const base = type.fields[0];
  const baseValue: StringOrBlocks | undefined = value && value[base.name];
  const localeFields = type.fields.slice(1, type.fields.length);

  return (
    <Fieldset
      level={props.level}
      legend={type.title || ''}
      description={type.description}
      markers={childMarkers}
      presence={childPresence}
    >
      <Flex align="flex-end">
        <Box flex={2}>
          <FormBuilderInput
            // @ts-ignore
            ref={ref}
            key={base.name}
            type={base.type}
            value={baseValue}
            onChange={patchEvent => handleFieldChange(base, patchEvent)}
            path={[base.name]}
            focusPath={focusPath}
            onFocus={onFocus}
            onBlur={onBlur}
            compareValue={compareValue} // handles "edited" status
          />
        </Box>
        <Box marginLeft={2}>
          <Button
            disabled={isTranslating}
            mode="ghost"
            type="button"
            onClick={async () => translate(localeFields.map(f => f.name))}
            text="Translate all"
          ></Button>
        </Box>
      </Flex>

      <Fieldset
        level={props.level ? props.level + 1 : undefined}
        legend="Translations"
        markers={childMarkers}
        presence={childPresence}
        isCollapsible={true}
        isCollapsed={true}
      >
        {localeFields.map((field, i) => {
          let level = props.level || 0;
          if (level && i !== 0) {
            level = level + 1;
          }
          return (
            <Flex align="flex-end">
              <Box flex={2}>
                <FormBuilderInput
                  readOnly={false}
                  key={field.name}
                  type={field.type}
                  level={level}
                  value={value && value[field.name]}
                  onChange={patchEvent => handleFieldChange(field, patchEvent)}
                  path={[field.name]}
                  focusPath={focusPath}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  compareValue={compareValue}
                />
              </Box>
              <Box marginLeft={2}>
                <Button
                  disabled={isTranslating}
                  mode="ghost"
                  type="button"
                  onClick={() => translate([field.name])}
                  text="Translate"
                />
              </Box>
            </Flex>
          );
        })}
      </Fieldset>
    </Fieldset>
  );
});
