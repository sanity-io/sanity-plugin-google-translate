import {Box, Button, Card, Flex, Stack} from '@sanity/ui'
import React from 'react'
import {
  MemberField,
  MemberFieldSet,
  MemberFieldError,
  ObjectInputProps,
  FieldSetMember,
  ObjectMember,
} from 'sanity'

export default function GoogleTranslateInput(props: ObjectInputProps) {
  const {renderDefault} = props

  const renderInputAll = React.useCallback(
    (member: ObjectMember) => {
      // @ts-expect-error
      const language = member.id.split(`.`).pop()

      if (!language) {
        // @ts-expect-error
        return renderDefault(member)
      }

      return (
        <Flex gap={2}>
          {/* @ts-expect-error */}
          <Box flex={1}>{renderDefault(member)}</Box>
          <Button text={`Translate all from ${language.toUpperCase()}`} />
        </Flex>
      )
    },
    [renderDefault]
  )

  const renderInputOne = React.useCallback(
    (member: FieldSetMember) => {
      // @ts-expect-error
      const language = member.id.split(`.`).pop()

      if (!language) {
        // @ts-expect-error
        return renderDefault(member)
      }

      return (
        <Flex gap={2}>
          {/* @ts-expect-error */}
          <Box flex={1}>{renderDefault(member)}</Box>
          <Button text={`Translate ${language.toUpperCase()}`} />
        </Flex>
      )
    },
    [renderDefault]
  )

  return (
    <Card tone="primary" padding={4} border radius={2}>
      <Stack space={4}>
        {props.members.map((member) => {
          switch (member.kind) {
            case 'field':
              return (
                <MemberField
                  key={member.key}
                  member={member}
                  // @ts-expect-error
                  renderInput={renderInputAll}
                  renderPreview={props.renderPreview}
                  renderField={props.renderField}
                  renderItem={props.renderItem}
                />
              )
            case 'fieldSet':
              return (
                <MemberFieldSet
                  key={member.key}
                  member={member}
                  // @ts-expect-error
                  renderInput={renderInputOne}
                  renderPreview={props.renderPreview}
                  renderField={props.renderField}
                  renderItem={props.renderItem}
                />
              )
            case 'error':
              return <MemberFieldError key={member.key} member={member} />
            default:
              return null
          }
        })}
      </Stack>
    </Card>
  )
}
