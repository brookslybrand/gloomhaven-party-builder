import { Form, redirect, usePendingFormSubmit, useRouteData } from 'remix'

import { prisma } from '../../db'
import { Button, TextInput } from '../../components'

import type { ActionFunction } from 'remix'

export let action: ActionFunction = async ({ request }) => {
  let body = new URLSearchParams(await request.text())

  let name = body.get('name')
  if (!name) {
    throw new Error(`Name is required`)
  }

  let party = await prisma.party.create({
    data: { name },
  })

  return redirect(`/party/${party.id}`)
}

export default function NewParty() {
  console.log(useRouteData())
  let pendingForm = usePendingFormSubmit()

  let disabled = !!pendingForm

  return (
    <main className="max-w-max border border-gray-700 mx-auto mt-12 p-4">
      <Form
        method="post"
        className="grid grid-cols-2 gap-y-2 gap-x-1 items-center"
      >
        <label htmlFor="name">Name: </label>
        <TextInput required id="name" name="name" disabled={disabled} />

        <Button className="col-start-2" disabled={disabled}>
          {pendingForm
            ? `Creating ${pendingForm.data.get('name')}...`
            : 'Submit'}
        </Button>
      </Form>
    </main>
  )
}
