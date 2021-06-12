import { useRouteData } from 'remix'
import { Link } from 'react-router-dom'
import { prisma } from '../db'

import type { Character, Party } from '@prisma/client'
import type { MetaFunction, LoaderFunction } from 'remix'
import type { LinkProps } from 'react-router-dom'

export let meta: MetaFunction = () => {
  return {
    title: 'Gloomhaven Party Builder',
    description: 'Build parties and create characters for Gloomhaven',
  }
}

type Data = {
  parties: Pick<Party, 'id' | 'name'>[]
  characters: Pick<Character, 'id' | 'name'>[]
}

export let loader: LoaderFunction = async (): Promise<Data> => {
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
    <div className="mx-auto max-w-max py-8 px-4">
      <header>
        <h1 className="text-4xl text-gray-900">Gloomhaven Party Builder</h1>
      </header>
      <main className="mt-8 space-y-4">
        <section>
          <CreateLink to="party/new">Create a new party</CreateLink>
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
        </section>

        <hr className="w-full border-t-1 border-gray-800" />

        <section>
          <CreateLink to="character/new">Create a new character</CreateLink>
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
        </section>
      </main>
    </div>
  )
}

function CreateLink({ children, ...props }: LinkProps) {
  return (
    <Link
      className="max-w-max flex items-center text-2xl text-gray-800 hover:text-green-600"
      {...props}
    >
      {/* Plus from heroicons: https://heroicons.com/ */}
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      {children}
    </Link>
  )
}
