
import React, { useState } from 'react';
import { useEmailSender } from '@/hooks/useEmailSender';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export const EmailSender = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [emailType, setEmailType] = useState('plain');
  const { sendEmail, isSending } = useEmailSender();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailData = {
      to: recipient,
      subject,
      body: emailType === 'plain' ? plainTextContent : undefined,
      html: emailType === 'html' ? htmlContent : undefined,
    };
    
    await sendEmail(emailData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Send Email</CardTitle>
        <CardDescription>
          Send emails using Gmail SMTP server
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="recipient@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <Tabs value={emailType} onValueChange={setEmailType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plain">Plain Text</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="plain" className="space-y-2">
              <Label htmlFor="plainContent">Email Content</Label>
              <Textarea
                id="plainContent"
                placeholder="Type your email content here..."
                value={plainTextContent}
                onChange={(e) => setPlainTextContent(e.target.value)}
                rows={8}
                required={emailType === 'plain'}
              />
            </TabsContent>
            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="htmlContent">HTML Content</Label>
              <Textarea
                id="htmlContent"
                placeholder="<h1>Hello World!</h1><p>Type your HTML email content here...</p>"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={8}
                required={emailType === 'html'}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
