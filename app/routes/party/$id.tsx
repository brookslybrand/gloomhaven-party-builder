import { redirect, useRouteData, json, usePendingFormSubmit } from 'remix'

import { Button, Form, Select, TextInput, getMethod } from '../../components'
import { prisma } from '../../db'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'
import type { Party, Character } from '@prisma/client'

export let meta: MetaFunction = ({ data }) => {
  return {
    title: (data as Data).party?.name ?? 'No party found',
  }
}

type Data = {
  party:
    | (Party & {
        members: Character[]
      })
    | null
  characters: {
    id: string
    name: string
  }[]
}
export let loader: LoaderFunction = async ({ params }) => {
  let partyPromise = prisma.party.findFirst({
    where: {
      id: params.id,
    },
    include: {
      members: true,
    },
  })
  let charactersPromise = prisma.character.findMany().then((characters) => {
    return characters.map(({ id, name }) => ({ id, name }))
  })

  let result = {
    party: await partyPromise,
    characters: await charactersPromise,
  }

  if (result.party === null) {
    return json(result, { status: 404 })
  } else {
    return json(result)
  }
}

export let action: ActionFunction = async ({ request, params }) => {
  let id = params.id

  let body = new URLSearchParams(await request.text())

  // we use hidden method names so this app can run without JS
  let method = getMethod(body, request)

  await new Promise((res) => {
    setTimeout(res, 2000)
  })

  switch (method) {
    case 'delete': {
      let removeName = [...body.keys()].find((key) => key.startsWith('remove-'))

      if (removeName !== undefined) {
        const characterId = body.get(removeName) ?? ''
        await prisma.party.update({
          where: { id },
          data: {
            members: {
              disconnect: { id: characterId },
            },
          },
        })
        return redirect(`/party/${params.id}`)
      }

      let updateCharacters = prisma.character.updateMany({
        where: { partyId: id },
        data: { partyId: null },
      })
      let deleteParty = prisma.party.delete({ where: { id } })
      await prisma.$transaction([updateCharacters, deleteParty])

      return redirect(`/`)
    }
    case 'post': {
      // handle adding new characters
      if (body.has('addCharacter')) {
        await prisma.party.update({
          where: { id },
          data: {
            members: {
              connect: { id: body.get('addCharacter') ?? '' },
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
  let pendingForm = usePendingFormSubmit()
  if (party === null) {
    return <h1>No party found</h1>
  }

  let disabled = !!pendingForm
  let pendingSubmit = !!pendingForm && pendingForm.data.has('name')

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <Form method="post" className="grid grid-cols-2 gap-2 items-center">
        <label htmlFor="name">Name: </label>
        <TextInput
          required
          id="name"
          name="name"
          defaultValue={party.name ?? ''}
          disabled={disabled}
        />

        <label htmlFor="location">Location: </label>
        <TextInput
          id="location"
          name="location"
          defaultValue={party.location ?? ''}
          disabled={disabled}
        />

        <label htmlFor="notes">Notes: </label>
        <TextInput
          id="notes"
          name="notes"
          defaultValue={party.notes ?? ''}
          disabled={disabled}
        />

        <label htmlFor="achievements">Achievements: </label>
        <TextInput
          id="achievements"
          name="achievements"
          defaultValue={party.achievements ?? ''}
          disabled={disabled}
        />

        <label htmlFor="reputation">Reputation: </label>
        <TextInput
          id="reputation"
          name="reputation"
          type="number"
          min={-20}
          max={20}
          defaultValue={party.reputation ?? ''}
          disabled={disabled}
        />

        <Button type="submit" className="col-start-2" disabled={disabled}>
          {pendingSubmit
            ? `Updating ${pendingForm?.data.get('name')}...`
            : 'Submit'}
        </Button>
      </Form>
      <CharacterSelect />
      <DeleteParty name={party.name} />
    </main>
  )
}

function DeleteParty({ name }: { name: Party['name'] }) {
  let pendingForm = usePendingFormSubmit()
  let disabled = !!pendingForm
  let pendingDelete = !!pendingForm && pendingForm.data.has('deleteParty')
  return (
    <Form method="delete" className="mt-4 grid grid-cols-2 gap-2 items-center">
      <input type="hidden" name="deleteParty" value={name} />
      <Button
        type="submit"
        variant="delete"
        className="col-start-2"
        disabled={disabled}
      >
        {pendingDelete ? `Deleting ${name}...` : 'Delete'}
      </Button>
    </Form>
  )
}

function CharacterSelect() {
  let { party, characters } = useRouteData<Data>()
  let pendingForm = usePendingFormSubmit()

  if (party === null) return null

  let partyMembersIds = new Set(party.members.map(({ id }) => id))
  let availableCharacters = characters.filter(
    ({ id }) => !partyMembersIds.has(id)
  )

  let disabled = !!pendingForm
  let pendingAdd = !!pendingForm && pendingForm.data.has('addCharacter')

  return (
    <section className="mt-2 space-y-2">
      {party.members.map(({ id, name }) => {
        let htmlName = `remove-${id}`
        let pendingDelete = !!pendingForm && pendingForm.data.has(htmlName)
        return (
          <Form
            key={htmlName}
            method="delete"
            className="grid grid-cols-2 gap-2 items-center"
          >
            <input type="hidden" name={htmlName} value={id} />
            <p>{name}</p>
            <Button
              className="col-start-2"
              variant="delete"
              type="submit"
              value={id}
              aria-label={`Remove ${name} from the party`}
              disabled={disabled}
            >
              {pendingDelete
                ? `Removing ${findNameById(
                    pendingForm?.data.get(htmlName),
                    characters
                  )}...`
                : 'Remove'}
            </Button>
          </Form>
        )
      })}

      {availableCharacters.length > 0 ? (
        <Form method="post" className="grid grid-cols-2 gap-2 items-center">
          <Select
            aria-label="select character"
            id="addCharacter"
            name="addCharacter"
            disabled={disabled}
          >
            {availableCharacters.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
          <Button className="col-start-2" type="submit" disabled={disabled}>
            {pendingAdd
              ? `Adding ${findNameById(
                  pendingForm?.data.get('addCharacter') ?? '',
                  availableCharacters
                )}...`
              : 'Add character'}
          </Button>
        </Form>
      ) : null}
    </section>
  )
}

function findNameById(id: any, availableCharacters: Data['characters']) {
  return availableCharacters.find((c) => c.id === id)?.name ?? ''
}
