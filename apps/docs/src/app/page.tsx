import { Button } from "@nextforge/ui";;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nextforge/ui";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">NextForge Documentation</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn how to set up and use NextForge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Read Guides</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Explore the UI component library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">View Components</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configure your NextForge workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary">Configure</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 