import clsx from 'clsx'

export function Select({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'select'>) {
  return (
    <select
      className={clsx(
        'capitalize border border-gray-900 hover:ring hover:ring-gray-200 disabled:border-gray-700 disabled:hover:ring-0',
        className
      )}
      {...props}
    />
  )
}
