import { Link } from "react-router"

export function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>This is the home page.</p>
      <Link to="/documents">Documents</Link>
    </>
  )
}
