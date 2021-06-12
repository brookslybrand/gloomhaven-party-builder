export { capitalize }

// taken from https://www.samanthaming.com/pictorials/how-to-capitalize-a-string/#more-solutions
function capitalize(s: string) {
  let lower = s.toLowerCase()
  return `${s.charAt(0).toUpperCase()}${lower.slice(1)}`
}
