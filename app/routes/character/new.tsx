import { Form, redirect, usePendingFormSubmit } from 'remix'

import { Button, Select, TextInput } from '../../components'
import { prisma } from '../../db'
import { classPerks } from '../../class-perks'
import { capitalize } from '../../utils'
import { Class } from '@prisma/client' // this is used as a value as well as a type

import type { ActionFunction } from 'remix'

export let action: ActionFunction = async ({ request }) => {
  let body = new URLSearchParams(await request.text())

  let name = body.get('name')
  if (!name) {
    throw new Error(`Name is required`)
  }

  let classValue = body.get('class')
  if (!isAllowedClass(classValue)) {
    // TODO: Return the correct error code
    throw new Error(`Class ${classValue} is not allowed`)
  }

  let perks = classPerks.get(classValue)
  if (perks === undefined) {
    throw new Error(`Perks net setup for class ${classValue}`)
  }

  let character = await prisma.character.create({
    data: {
      name,
      class: classValue,
      perks: {
        createMany: {
          data: perks,
        },
      },
    },
  })

  return redirect(`/character/${character.id}`)
}

function isAllowedClass(classValue: unknown): classValue is Class {
  if (typeof classValue !== 'string') return false
  let allowedClasses = Object.values(Class)

  // the `as any` is taken from this issue: https://github.com/microsoft/TypeScript/issues/31018#issuecomment-551040914
  return allowedClasses.includes(classValue as any)
}

export default function NewCharacter() {
  let pendingForm = usePendingFormSubmit()
  let disabled = !!pendingForm

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <Form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <label htmlFor="class">Class: </label>
        <Select required id="class" name="class" disabled={disabled}>
          {Object.values(Class).map((classValue) => (
            <option key={classValue} value={classValue}>
              {capitalize(classValue)}
            </option>
          ))}
        </Select>

        <label htmlFor="name">Name: </label>
        <TextInput id="name" name="name" disabled={disabled} />

        <Button className="col-start-2" type="submit" disabled={disabled}>
          {pendingForm ? `Creating ${pendingForm.data.get('name')}` : 'Submit'}
        </Button>
      </Form>
    </main>
  )
}
