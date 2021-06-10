import type { Party } from '@prisma/client'
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

type Parties = { id: number; name: string }[]

export let loader: LoaderFunction = async () => {
  let parties: Parties = []
  let untitledPartyCount = 0

  for (const { id, name } of await prisma.party.findMany()) {
    parties.push({
      id,
      name: name ?? `Untitled party (${++untitledPartyCount})`,
    })
  }

  return { parties }
}

export default function Index() {
  let { parties } = useRouteData<{ parties: Parties }>()

  return (
    <div className="mx-auto max-w-max p-4">
      <header>
        <h1 className="text-4xl">Parties</h1>
      </header>
      <main className="space-y-4 mt-4">
        <Link
          className="block text-blue-700 hover:text-blue-200"
          to="party/new"
        >
          Create a new party
        </Link>
        <hr className="w-full border-t-1 border-gray-800" />
        {parties.map(({ id, name }) => {
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
        })}
      </main>
    </div>
  )
}
