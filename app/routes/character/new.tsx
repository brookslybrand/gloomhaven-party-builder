import React from 'react'
import { Form, redirect } from 'remix'
import clsx from 'clsx'

import { prisma } from '../../db'

import type { ActionFunction } from 'remix'
import { Class } from '@prisma/client'

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

  const character = await prisma.character.create({
    data: {
      name,
      class: classValue,
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
  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <label htmlFor="class">Class: </label>
        <select
          className="capitalize border border-gray-700 hover:ring hover:ring-gray-200"
          required
          id="class"
          name="class"
        >
          {Object.values(Class).map((classValue) => (
            <option key={classValue} value={classValue}>
              {capitalize(classValue)}
            </option>
          ))}
        </select>

        <label htmlFor="name">Name: </label>
        <TextInput id="name" name="name" />

        <button
          type="submit"
          className="col-start-2 border border-green-700 hover:ring-1 hover:ring-green-200"
        >
          Submit
        </button>
      </form>
    </main>
  )
}

function TextInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      type="text"
      className={clsx(
        'p-1 border border-blue-600 hover:ring-1 hover:ring-blue-200',
        className
      )}
      {...props}
    />
  )
}

// taken from https://www.samanthaming.com/pictorials/how-to-capitalize-a-string/#more-solutions
function capitalize(s: string) {
  const lower = s.toLowerCase()
  return `${s.charAt(0).toUpperCase()}${lower.slice(1)}`
}
