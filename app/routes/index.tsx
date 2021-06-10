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

export let loader: LoaderFunction = async () => {
  const parties = await prisma.party.findMany()
  return { parties }
}

export default function Index() {
  let { parties } = useRouteData<{ parties: Party[] }>()

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>Parties</h1>
      <Link to="party/new">Create a new party</Link>
      {parties.map(({ id, name }) => {
        return (
          <Link key={id} to={`party/${id}`}>
            {name ?? 'Unnamed party'}
          </Link>
        )
      })}
    </div>
  )
}
