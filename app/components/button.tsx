export function Button(props: React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className="
        col-start-2 border border-green-700 hover:ring-1 hover:ring-green-200
        disabled:text-gray-600 disabled:border-gray-700 disabled:hover:ring-0 disabled:cursor-wait"
      {...props}
    />
  )
}
