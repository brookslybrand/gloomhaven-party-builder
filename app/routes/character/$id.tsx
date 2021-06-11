import React from 'react'
import { Form, redirect, useRouteData } from 'remix'
import clsx from 'clsx'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'
import { prisma } from '../../lib/prisma'
import { Character } from '@prisma/client'

export let meta: MetaFunction = ({ data }) => {
  return {
    title: data.name,
  }
}

export let loader: LoaderFunction = async ({ params }) => {
  let character = await prisma.character.findFirst({
    where: {
      id: Number(params.id),
    },
  })

  return character
}

export let action: ActionFunction = async ({ request, params }) => {
  let id = Number(params.id)
  let body = new URLSearchParams(await request.text())
  // we use hidden method names so this app can run without JS
  let method = (body.get('_method') ?? request.method).toLowerCase()

  switch (method) {
    case 'delete': {
      await prisma.character.delete({ where: { id } })
      return redirect(`/`)
    }
    case 'post': {
      let name = body.get('name')
      if (!name) {
        throw new Error(`Name is required`)
      }
      await prisma.character.update({
        where: { id },
        data: {
          name,
          experience: handleNumericValue(body.get('experience')),
          gold: handleNumericValue(body.get('gold')),
          items: body.get('items'),
          checks: handleNumericValue(body.get('checks')),
          notes: body.get('notes'),
        },
      })
      return redirect(`/character/${params.id}`)
    }
    default: {
      throw new Error(`Method ${method} not available`)
    }
  }
}

function handleNumericValue(n: unknown) {
  if (!n || typeof n !== 'string') return undefined
  let number = Number(n)
  if (Number.isNaN(number) || number < 0) {
    return undefined
  } else {
    return number
  }
}

export default function CharacterComponent() {
  const character = useRouteData<Character>()

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <p>Class:</p>
        <p className="capitalize">{capitalize(character.class)}</p>

        <label htmlFor="name">Name: </label>
        <TextInput
          required
          id="name"
          name="name"
          defaultValue={character.name ?? ''}
        />

        <label htmlFor="experience">Experience: </label>
        <TextInput
          id="experience"
          name="experience"
          type="number"
          min={0}
          defaultValue={character.experience}
        />

        <label htmlFor="gold">Gold: </label>
        <TextInput
          required
          id="gold"
          name="gold"
          type="number"
          min={0}
          defaultValue={character.gold}
        />

        <label htmlFor="items">Items: </label>
        <TextInput
          id="items"
          name="items"
          defaultValue={character.items ?? ''}
        />

        <label htmlFor="checks">Checks: </label>
        <TextInput
          required
          id="checks"
          name="checks"
          type="number"
          min={0}
          defaultValue={character.checks}
        />

        <label htmlFor="notes">Notes: </label>
        <TextInput
          id="notes"
          name="notes"
          defaultValue={character.notes ?? ''}
        />

        {/* TODO: add perks */}

        <button
          type="submit"
          className="col-start-2 border border-green-700 hover:ring-1 hover:ring-green-200"
        >
          Submit
        </button>
      </form>

      <form method="post" className="mt-4 grid grid-cols-2 items-center">
        <input
          // need this hidden input because regular forms don't all for the delete method https://docs.remix.run/v0.17/api/remix/#form-method
          type="hidden"
          name="_method"
          value="delete"
        />
        <button
          type="submit"
          className="col-start-2 border-2 border-red-700 hover:ring-1 hover:ring-red-200"
        >
          Delete
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
