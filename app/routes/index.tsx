import type { MetaFunction, LoaderFunction } from 'remix'
import { useRouteData } from 'remix'
import { prisma } from '../lib/prisma'

export let meta: MetaFunction = () => {
  return {
    title: 'Remix Starter',
    description: 'Welcome to remix!',
  }
}

export let loader: LoaderFunction = async () => {
  const users = await prisma.user.findMany()
  return { users }
}

export default function Index() {
  let { users } = useRouteData()

  console.log(users)

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2>Welcome to Remix!</h2>
      <p>
        <a href="https://remix.run/dashboard/docs">Check out the docs</a> to get
        started.
      </p>
    </div>
  )
}
