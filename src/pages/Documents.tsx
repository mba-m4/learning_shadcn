import { useQueryDocuments } from "@/hooks/useQueryDocuments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router"

export function Documents() {
  const { data: documents, isLoading, error } = useQueryDocuments()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  if (!Array.isArray(documents)) return null

  return (
    <>
      <h1>Documents</h1>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{doc.description}</p>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link to="/">Home</Link>
    </>
  )
}
