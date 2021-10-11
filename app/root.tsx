import type { LinksFunction } from 'remix'
import { Meta, Links, Scripts, LiveReload } from 'remix'
import { Outlet, NavLink } from 'react-router-dom'
import VisuallyHidden from '@reach/visually-hidden'

import tailwindUrl from './styles/app.css'
import clsx from 'clsx'

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindUrl }]
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <GoHome />
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  )
}

function GoHome() {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx('absolute left-4 top-4', { hidden: isActive })
      }
      to="/"
      end
    >
      <VisuallyHidden>Go Home</VisuallyHidden>
      {/* Home from heroicons: https://heroicons.com/ */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-blue-700 hover:text-blue-900"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    </NavLink>
  )
}
