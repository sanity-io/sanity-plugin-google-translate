/* eslint-disable react/display-name */

import React from 'react'
import {Tooltip, Text, Box, Flex, Stack, Button} from '@sanity/ui'
import {useUnsetInputComponent, NestedFormBuilder} from '@nrk/sanity-plugin-nrkno-odd-utils'
import get from 'lodash/get'

import {extractLanguageFromCode} from './helpers/extractLanguageFromCode'

const FieldInput = React.forwardRef((props, ref) => {
  const {parent, readOnly, language, baseLanguage, isTranslating, handleTranslation} = props

  const tooltipMessage = React.useMemo(() => {
    if (language === baseLanguage) {
      // Language IS the base language
      return `Translate All from "${extractLanguageFromCode(baseLanguage)}"`
    } else if (extractLanguageFromCode(language) === extractLanguageFromCode(baseLanguage)) {
      // Language is essentially the same (example: "en_US" and "en_GB")
      return `Cannot translate matching language pairs`
    }

    return `Translate from "${extractLanguageFromCode(baseLanguage)}" to "${extractLanguageFromCode(language)}"`
  }, [language, baseLanguage])

  // Prevention of infinite loop in <FormBuilderInput />
  const type = useUnsetInputComponent(props.type)
  const content = baseLanguage ? get(parent, baseLanguage) : ``
  
  return (
    <Stack space={[2, 2, 3]}>
      <Flex gap={2} align="flex-end">
        <Box flex={1}>
          <NestedFormBuilder {...props} type={type} ref={ref} />
        </Box>
        <Tooltip
          content={
            <Box padding={2}>
              <Text size={1}>
                {tooltipMessage}
              </Text>
            </Box>
          }
          placement="top"
          portal
        >
          <Box>
            <Button
              text={language === baseLanguage ? `Translate All` : `Translate`}
              mode="ghost"
              disabled={readOnly || isTranslating || !language || !baseLanguage || !content || tooltipMessage.startsWith('Cannot')}
              onClick={() =>
                handleTranslation({
                  language,
                  baseLanguage,
                  content,
                })
              }
            />
          </Box>
        </Tooltip>
      </Flex>
    </Stack>
  )
})

export default FieldInput
