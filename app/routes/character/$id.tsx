import { json, redirect, useRouteData } from 'remix'

import { TextInput } from '../../components'
import { prisma } from '../../db'
import { sortPerks } from '../../class-perks'
import { capitalize } from '../../utils'

import type { MetaFunction, LoaderFunction, ActionFunction } from 'remix'
import type { Character, Perk } from '@prisma/client'

export let meta: MetaFunction = ({ data }) => {
  return {
    title: (data as Data)?.name ?? 'No character found',
  }
}

type Data =
  | (Character & {
      perks: Omit<Perk, 'characterId'>[]
    })
  | null
export let loader: LoaderFunction = async ({ params }) => {
  let character = await prisma.character.findFirst({
    where: {
      id: params.id,
    },
    include: {
      perks: {
        select: {
          name: true,
          available: true,
          acquired: true,
        },
      },
    },
  })

  if (!character) {
    return json(character, { status: 404 })
  }
  let perks = sortPerks(character.class, character.perks)
  return json({ ...character, perks })
}

export let action: ActionFunction = async ({ request, params, context }) => {
  let id = params.id
  let body = new URLSearchParams(await request.text())
  // we use hidden method names so this app can run without JS
  let method = (body.get('_method') ?? request.method).toLowerCase()

  switch (method) {
    case 'delete': {
      let deletePerks = prisma.perk.deleteMany({ where: { characterId: id } })
      let deleteCharacter = prisma.character.delete({
        where: { id },
        include: { perks: true },
      })
      await prisma.$transaction([deletePerks, deleteCharacter])
      return redirect(`/`)
    }
    case 'post': {
      let name = body.get('name')
      if (!name) {
        throw new Error(`Name is required`)
      }

      let characterUpdatePromise = prisma.character.update({
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
      let perksUpdatePromise = updatePerks(id, body)
      await Promise.all([characterUpdatePromise, perksUpdatePromise])

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

async function updatePerks(characterId: string, body: URLSearchParams) {
  let character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { perks: true },
  })

  if (character === null) {
    throw new Error(`No character found for this user, something is wrong`)
  }
  let { perks } = character
  let perkMap = new Map<string, Perk>() // keep track of the perks more easily
  for (let perk of perks) {
    // reset all perks to zero so we remove the perks that don't have checks
    // TODO: clean this up so that we don't have to do all n writes the database
    perk.acquired = 0
    perkMap.set(perk.name, perk)
  }

  for (let key of body.keys()) {
    if (!key.startsWith(`perk-`)) continue

    // get the perk name out of the pattern perk-name of perk-idx
    let perkName = key.replace(/^perk-/g, '').replace(/-\d+$/g, '')
    let perk = perkMap.get(perkName)
    if (perk === undefined) {
      throw new Error(`No perk found with the name ${perkName}`)
    }
    // user can't have more perks than are available
    if (perk.acquired < perk.available) {
      perk.acquired++
    }
  }

  const updatesPerks = Promise.all(
    perks.map((perk) => {
      return prisma.perk.update({
        where: { characterId_name: { characterId, name: perk.name } },
        data: perk,
      })
    })
  )

  return updatesPerks
}

export default function CharacterComponent() {
  const character = useRouteData<Data>()

  if (!character) {
    return <h1>Character not found</h1>
  }

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

        <Perks perks={character.perks} />

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

// TODO: look into whether this is correct accessability-wise
function Perks({ perks }: { perks: Omit<Perk, 'characterId'>[] }) {
  return (
    <>
      {perks.map(({ name, available, acquired }) => (
        <fieldset key={name} className="col-span-2 flex flex-row space-x-1">
          {Array.from({ length: available }).map((_, idx) => (
            <input
              key={idx}
              className="mt-1 mr-1"
              type="checkbox"
              name={`perk-${name}-${idx}`}
              defaultChecked={idx < acquired}
            />
          ))}

          {/* legend has to be inside of a div for it to display properly—dumb */}
          <div>
            <legend>{name}</legend>
          </div>
        </fieldset>
      ))}
    </>
  )
}
