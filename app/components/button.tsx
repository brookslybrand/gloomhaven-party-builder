import clsx from 'clsx'

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'base' | 'delete'
}
export function Button({ className, variant = 'base', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        variant === 'base'
          ? 'border border-green-700 hover:ring-1 hover:ring-green-200'
          : variant === 'delete'
          ? 'border-2 border-red-700 hover:ring-1 hover:ring-red-200'
          : null,
        'disabled:text-gray-600 disabled:border-gray-700 disabled:hover:ring-0 disabled:cursor-wait',
        className
      )}
      {...props}
    />
  )
}
