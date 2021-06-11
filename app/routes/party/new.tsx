import React from 'react'
import { Form, redirect } from 'remix'
import clsx from 'clsx'

import type { ActionFunction } from 'remix'
import { prisma } from '../../db'

export let action: ActionFunction = async ({ request }) => {
  let body = new URLSearchParams(await request.text())

  let name = body.get('name')
  if (!name) {
    throw new Error(`Name is required`)
  }

  const party = await prisma.party.create({
    data: { name },
  })

  return redirect(`/party/${party.id}`)
}

export default function NewParty() {
  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <label htmlFor="name">Name: </label>
        <TextInput required id="name" name="name" />

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
