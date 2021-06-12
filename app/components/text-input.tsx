import clsx from 'clsx'

export function TextInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      type="text"
      className={clsx(
        'p-1 border border-blue-600 hover:ring-1 hover:ring-blue-200 disabled:border-gray-600 disabled:hover:ring-0',
        className
      )}
      {...props}
    />
  )
}
