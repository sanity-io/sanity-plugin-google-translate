/* eslint-disable react/display-name */

// @ts-ignore
import sanityClient from 'part:@sanity/base/client'
// @ts-ignore
import {withDocument} from 'part:@sanity/form-builder'

import React, {useState, useCallback} from 'react'
import {useToast} from '@sanity/ui'
import {useUnsetInputComponent, NestedFormBuilder} from '@nrk/sanity-plugin-nrkno-odd-utils'

import {PatchEvent, set, unset} from '@sanity/form-builder/PatchEvent'

import Feedback from './Feedback'
import FieldInput from './FieldInput'
import {htmlDecode} from './helpers/htmlDecode'
import {extractLanguageFromCode} from './helpers/extractLanguageFromCode'

type FieldNameLangPair = {
  fieldName: string
  fieldLang: string
}

type TranslationConfig = {
  language: string
  baseLanguage: string
  content: string
}

const GoogleTranslateInput = React.forwardRef((props, ref) => {
  const {onChange} = props

  const toast = useToast()
  const [isTranslating, setIsTranslating] = useState(false)

  // Prevention of infinite loop in <FormBuilderInput />
  const type = useUnsetInputComponent(props.type)

  const handleTranslation = useCallback(
    async (config: TranslationConfig) => {
      // Get all unique language field names and codes
      // TODO: Remove hidden/filtered-out fields as this currently will write to all fields
      let allLanguageFields: FieldNameLangPair[] = Array.from(
        new Set(
          type.fields
            .map((field) => ({
              fieldName: field.name,
              fieldLang: extractLanguageFromCode(field.name),
            }))
            .filter((field) => field.fieldName !== baseLanguage)
        )
      )

      // If this isn't a "translate all" operation, just target the passed-in language
      if (config.language !== config.baseLanguage) {
        allLanguageFields = allLanguageFields.filter((code) => code.fieldName === config.language)
      }

      if (!config?.content) {
        return toast.push({
          title: `No content to translate`,
          status: `warning`,
        })
      }

      setIsTranslating(true)

      const url = new URL(`https://translation.googleapis.com/language/translate/v2`)
      const {format} = type?.options ?? {}
      if (format) url.searchParams.set(`format`, format)
      url.searchParams.set(`key`, apiKey)
      url.searchParams.set(`q`, config.content)

      // Language code might be a country/language pair like en_US
      const target = extractLanguageFromCode(config.language)
      const source = extractLanguageFromCode(config.baseLanguage)
      url.searchParams.set(`source`, source)

      if (allLanguageFields.length === 1 && target === source) {
        return toast.push({
          title: `Bad language pair`,
          status: `warning`,
          description: `Cannot translate from "${source}" to "${target}"`,
        })
      }

      const translations = allLanguageFields.map((item) => {
        url.searchParams.set(`target`, item.fieldLang)

        if (item.fieldLang === source) {
          return null
        }

        return fetch(url.toString())
          .then((res) => res.json())
          .then((res) => {
            if (res.error) {
              toast.push({
                title: `Error`,
                status: `error`,
                description: res.error.message,
              })
            } else {
              toast.push({
                title: `Translation Complete`,
                status: `success`,
                description: `Translated from "${source}" to "${item.fieldLang}"`,
              })

              const {data} = res

              if (data?.translations?.length) {
                data.translations.forEach(({translatedText}) => {
                  // Convert html entities returned in translation to a string
                  const decoded = htmlDecode(translatedText)

                  // Write translation into the correct language field
                  // TODO: Move this into the Promise.all as a batch operation?
                  onChange(
                    PatchEvent.from(
                      translatedText ? set(decoded, [item.fieldName]) : unset([item.fieldName])
                    )
                  )
                })
              }
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })

      Promise.all(translations).then(() => setIsTranslating(false))
    },
    [props.type]
  )

  if (type.jsonType !== 'object' || type.name === 'object') {
    return (
      <Feedback>
        <code>GoogleTranslateInput</code> can only be used as an Input for{' '}
        <a
          href="https://www.sanity.io/help/schema-lift-anonymous-object-type"
          target="_blank"
          rel="noopener"
        >
          schema registered object fields
        </a>
        .
      </Feedback>
    )
  }

  const {apiKey} = type?.options ?? {}

  if (!apiKey) {
    return (
      <Feedback>
        No API Key passed into the input. Set <code>options.apiKey</code> of this field in the
        schema.
      </Feedback>
    )
  }

  const baseLanguage = type.fieldsets.find((fieldset) => fieldset.single)?.field?.name ?? ``

  const inputProps = {
    handleTranslation,
    baseLanguage,
    isTranslating,
  }

  // Decorate individual fields with another input component
  const fieldsetsWithInputs = type.fieldsets.map((fieldset) => {
    if (fieldset.single) {
      return {
        ...fieldset,
        field: {
          ...fieldset.field,
          type: {
            ...fieldset.field.type,
            inputComponent: React.forwardRef((props, ref) => (
              <FieldInput ref={ref} {...props} {...inputProps} language={fieldset.field.name} />
            )),
          },
        },
      }
    }

    const fieldsetWithInputs = {
      ...fieldset,
      fields: fieldset.fields.map((field) => ({
        ...field,
        type: {
          ...field.type,
          inputComponent: React.forwardRef((props, ref) => (
            <FieldInput ref={ref} {...props} {...inputProps} language={field.name} />
          )),
        },
      })),
    }

    return fieldsetWithInputs
  })

  const typeCombined = React.useMemo(
    () => ({...type, fieldsets: fieldsetsWithInputs}),
    [props.type]
  )

  return <NestedFormBuilder {...props} type={typeCombined} ref={ref} />
})

export default withDocument(GoogleTranslateInput)
