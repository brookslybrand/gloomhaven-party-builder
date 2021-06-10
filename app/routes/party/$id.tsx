import React from 'react'
import { Form, redirect, useRouteData } from 'remix'
import clsx from 'clsx'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'
import { prisma } from '../../lib/prisma'
import { Party } from '@prisma/client'

export let meta: MetaFunction = ({ data }) => {
  return {
    title: data.name ?? 'Untitled party',
  }
}

export let loader: LoaderFunction = async ({ params }) => {
  let party = await prisma.party.findFirst({
    where: {
      id: Number(params.id),
    },
  })

  return party
}

export let action: ActionFunction = async ({ request, params }) => {
  let id = Number(params.id)
  let body = new URLSearchParams(await request.text())
  // we use hidden method names so this app can run without JS
  let method = (body.get('_method') ?? request.method).toLowerCase()

  switch (method) {
    case 'delete': {
      console.log('deleting')
      await prisma.party.delete({ where: { id } })
      return redirect(`/`)
    }
    case 'post': {
      let reputation
      if (!body.get('reputation')) {
        reputation = undefined
      } else {
        reputation = Number(body.get('reputation'))
      }
      await prisma.party.update({
        where: { id },
        data: {
          name: body.get('name'),
          location: body.get('location'),
          notes: body.get('notes'),
          achievements: body.get('achievements'),
          reputation: reputation,
        },
      })
      return redirect(`/party/${params.id}`)
    }
    default: {
      throw new Error(`Method ${method} not available`)
    }
  }
}

export default function PartyComponent() {
  const party = useRouteData<Party>()

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <form method="post" className="grid grid-cols-2 gap-y-2 items-center">
        <label htmlFor="name">Name: </label>
        <TextInput id="name" name="name" defaultValue={party.name ?? ''} />

        <label htmlFor="location">Location: </label>
        <TextInput
          id="location"
          name="location"
          defaultValue={party.location ?? ''}
        />

        <label htmlFor="notes">Notes: </label>
        <TextInput id="notes" name="notes" defaultValue={party.notes ?? ''} />

        <label htmlFor="achievements">Achievements: </label>
        <TextInput
          id="achievements"
          name="achievements"
          defaultValue={party.achievements ?? ''}
        />

        <label htmlFor="reputation">Reputation: </label>
        <TextInput
          id="reputation"
          name="reputation"
          type="number"
          min={-20}
          max={20}
          defaultValue={party.reputation ?? ''}
        />

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
