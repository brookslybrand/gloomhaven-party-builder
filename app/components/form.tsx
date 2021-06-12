import { Form as RemixForm } from 'remix'
import type { FormProps, Request } from 'remix'

export function Form({ children, method, ...props }: FormProps) {
  let notAllowedMethod = method !== 'get' && method !== 'post'
  return (
    <RemixForm
      {...props}
      // only 'get' and 'post' are allowed for html form
      method={notAllowedMethod ? 'post' : method}
    >
      {
        // need this hidden input because regular forms don't all for the delete method https://docs.remix.run/v0.17/api/remix/#form-method
        notAllowedMethod ? (
          <input type="hidden" name="_method" value={method} />
        ) : null
      }
      {children}
    </RemixForm>
  )
}

export function getMethod(body: URLSearchParams, request: Request) {
  return (body.get('_method') ?? request.method).toLowerCase()
}
