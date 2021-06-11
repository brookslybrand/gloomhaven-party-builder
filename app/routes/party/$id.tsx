import { Form, redirect, useRouteData, useMatches } from 'remix'
import clsx from 'clsx'
import { prisma } from '../../db'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'
import type { Party, Character } from '@prisma/client'

export let meta: MetaFunction = ({ data, parentsData }) => {
  return {
    title: data.name,
  }
}

type Data = {
  party:
    | (Party & {
        members: Character[]
      })
    | null
  characters: {
    id: number
    name: string
  }[]
}
export let loader: LoaderFunction = async ({ params }) => {
  let partyPromise = prisma.party.findFirst({
    where: {
      id: Number(params.id),
    },
    include: {
      members: true,
    },
  })
  let charactersPromise = prisma.character.findMany().then((characters) => {
    return characters.map(({ id, name }) => ({ id, name }))
  })

  return {
    party: await partyPromise,
    characters: await charactersPromise,
  }
}

export let action: ActionFunction = async ({ request, params }) => {
  let id = Number(params.id)

  let body = new URLSearchParams(await request.text())

  // we use hidden method names so this app can run without JS
  let method = (body.get('_method') ?? request.method).toLowerCase()

  switch (method) {
    case 'delete': {
      if (body.has('deleteCharacter')) {
        await prisma.party.update({
          where: { id },
          data: {
            members: {
              disconnect: { id: Number(body.get('deleteCharacter')) },
            },
          },
        })
        return redirect(`/party/${params.id}`)
      }

      await prisma.party.delete({ where: { id } })
      return redirect(`/`)
    }
    case 'post': {
      // handle adding new characters
      if (body.has('addCharacter')) {
        await prisma.party.update({
          where: { id },
          data: {
            members: {
              connect: { id: Number(body.get('addCharacter')) },
            },
          },
        })
        return redirect(`/party/${params.id}`)
      }

      let reputation
      if (!body.get('reputation')) {
        reputation = undefined
      } else {
        reputation = Number(body.get('reputation'))
      }
      let name = body.get('name')
      if (!name) {
        throw new Error(`Name is required`)
      }
      await prisma.party.update({
        where: { id },
        data: {
          name,
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
  let { party } = useRouteData<Data>()
  if (party === null) {
    return <h1>No party found</h1>
  }

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <label htmlFor="name">Name: </label>
        <TextInput
          required
          id="name"
          name="name"
          defaultValue={party.name ?? ''}
        />

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
      <CharacterSelect />
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

function CharacterSelect() {
  let { party, characters } = useRouteData<Data>()

  if (party === null) return null

  let partyMembersIds = new Set(party.members.map(({ id }) => id))
  let availableCharacters = characters.filter(
    ({ id }) => !partyMembersIds.has(id)
  )

  return (
    <section className="mt-2 space-y-2">
      {party.members.map(({ id, name }) => {
        let htmlId = `delete-${id}`
        return (
          <form
            key={htmlId}
            method="post"
            className="grid grid-cols-2 gap-y-2 items-center"
          >
            <input
              // need this hidden input because regular forms don't all for the delete method https://docs.remix.run/v0.17/api/remix/#form-method
              type="hidden"
              name="_method"
              value="delete"
              className="hidden"
            />
            <p>{name}</p>
            <button
              type="submit"
              name="deleteCharacter"
              value={id}
              className="col-start-2 border-2 border-red-700 hover:ring-1 hover:ring-red-200"
              aria-label={`Remove ${name} from party`}
            >
              Remove
            </button>
          </form>
        )
      })}
      {availableCharacters.length > 0 ? (
        <form
          name="testing"
          method="post"
          className="grid grid-cols-2 gap-y-2 items-center"
        >
          <select
            aria-label="select character"
            id="addCharacter"
            name="addCharacter"
          >
            {availableCharacters.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-start-2 border border-green-700 hover:ring-1 hover:ring-green-200"
          >
            Add character
          </button>
        </form>
      ) : null}
    </section>
  )
}
