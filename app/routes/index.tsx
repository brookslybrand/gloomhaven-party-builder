import type { Character, Party } from '@prisma/client'
import type { MetaFunction, LoaderFunction } from 'remix'
import { useRouteData } from 'remix'
import { Link } from 'react-router-dom'
import { prisma } from '../lib/prisma'

export let meta: MetaFunction = () => {
  return {
    title: 'Remix Starter',
    description: 'Welcome to remix!',
  }
}

type Data = {
  parties: Pick<Party, 'id' | 'name'>[]
  characters: Pick<Character, 'id' | 'name'>[]
}

export let loader: LoaderFunction = async (): Promise<Data> => {
  console.log(Object.keys(prisma))

  let partiesPromise = prisma.party.findMany().then((parties) => {
    return parties.map(({ id, name }) => ({ id, name }))
  })
  let charactersPromise = prisma.character.findMany().then((characters) => {
    return characters.map(({ id, name }) => ({ id, name }))
  })

  return {
    parties: await partiesPromise,
    characters: await charactersPromise,
  }
}

export default function Index() {
  let { parties, characters } = useRouteData<Data>()

  return (
    <div className="mx-auto max-w-max p-4">
      <header>
        <h1 className="text-4xl">Parties</h1>
      </header>
      <main className="space-y-4 mt-4">
        <Link
          className="block text-xl text-blue-700 hover:text-blue-200"
          to="party/new"
        >
          Create a new party
        </Link>
        <hr className="w-full border-t-1 border-gray-800" />
        {parties.length ? (
          parties.map(({ id, name }) => {
            return (
              <li key={id} className="flex mt-4">
                <ul>
                  <Link
                    className="text-blue-700 hover:text-blue-200"
                    to={`party/${id}`}
                  >
                    {name}
                  </Link>
                </ul>
              </li>
            )
          })
        ) : (
          <p>There are currently no parties</p>
        )}

        <Link
          className="block text-xl text-blue-700 hover:text-blue-200"
          to="character/new"
        >
          Create a new character
        </Link>
        <hr className="w-full border-t-1 border-gray-800" />
        {characters.length > 0 ? (
          characters.map(({ id, name }) => {
            return (
              <li key={id} className="flex mt-4">
                <ul>
                  <Link
                    className="text-blue-700 hover:text-blue-200"
                    to={`character/${id}`}
                  >
                    {name}
                  </Link>
                </ul>
              </li>
            )
          })
        ) : (
          <p>There are currently no characters</p>
        )}
      </main>
    </div>
  )
}
