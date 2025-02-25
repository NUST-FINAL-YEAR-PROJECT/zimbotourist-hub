
import React from 'react';
import { Card, CardContent } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

interface ApiEndpoint {
  id: string;
  endpoint_path: string;
  method: string;
  description: string | null;
  request_schema: any;
  response_schema: any;
  tags: string[] | null;
}

interface Method {
  method: string;
  color: string;
}

const methodColors: { [key: string]: string } = {
  GET: "bg-blue-500",
  POST: "bg-green-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
  PATCH: "bg-purple-500"
};

export function SwaggerUI({ endpoints }: { endpoints: ApiEndpoint[] }) {
  const renderSchema = (schema: any) => {
    if (!schema) return null;
    
    return (
      <div className="space-y-2">
        {schema.type === 'object' && schema.properties && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>{value.type}</TableCell>
                  <TableCell>
                    {schema.required?.includes(key) ? (
                      <Badge variant="default">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>{value.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {endpoints.map((endpoint) => (
        <Card key={endpoint.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <Badge 
                className={`${methodColors[endpoint.method]} text-white`}
              >
                {endpoint.method}
              </Badge>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{endpoint.endpoint_path}</h3>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                {endpoint.tags && (
                  <div className="flex gap-2 mt-2">
                    {endpoint.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="request">
                <AccordionTrigger>Request Schema</AccordionTrigger>
                <AccordionContent>
                  {renderSchema(endpoint.request_schema)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="response">
                <AccordionTrigger>Response Schema</AccordionTrigger>
                <AccordionContent>
                  {renderSchema(endpoint.response_schema)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
