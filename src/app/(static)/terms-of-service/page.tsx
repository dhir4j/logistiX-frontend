
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" /> Terms of Service
          </CardTitle>
          {lastUpdated && <CardDescription>Last updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Welcome to Shed Load Overseas! These terms and conditions outline the rules and regulations for the use of Shed Load Overseas's Website, located at this application's domain.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Shed Load Overseas if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">1. Prototype Nature</h2>
          <p>This application is a prototype for demonstration purposes. Features, data storage, and functionalities are subject to change and may not represent a final product. The primary login (demo@rswift.com / 123456) is for evaluation only. All shipment data entered is stored locally in your browser and is not processed or stored on a server.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. License</h2>
          <p>Unless otherwise stated, Shed Load Overseas and/or its licensors own the intellectual property rights for all material on Shed Load Overseas. All intellectual property rights are reserved. You may access this from Shed Load Overseas for your own personal use subjected to restrictions set in these terms and conditions.</p>
          <p>You must not:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Republish material from Shed Load Overseas</li>
            <li>Sell, rent or sub-license material from Shed Load Overseas</li>
            <li>Reproduce, duplicate or copy material from Shed Load Overseas</li>
            <li>Redistribute content from Shed Load Overseas</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. User Account</h2>
          <p>The provided login credentials are for demonstration and testing of the application's features. You are responsible for any activity that occurs under these credentials during your session.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">4. Limitation of Liability</h2>
          <p>In no event shall Shed Load Overseas, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this prototype application whether such liability is under contract. Shed Load Overseas, including its officers, directors,and employees shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Service Availability</h2>
          <p>This prototype application is provided "as is" and "as available" without any warranties, express or implied. We do not guarantee that the service will always be available, uninterrupted, or error-free.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">6. Governing Law</h2>
          <p>Any claim relating to Shed Load Overseas's website shall be governed by the laws of India without regard to its conflict of law provisions.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">7. Changes to Terms</h2>
          <p>Shed Load Overseas reserves the right to revise these terms at any time as it sees fit, and by using this Website you are expected to review these terms on a regular basis.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">8. Contact Information</h2>
          <p>If you have any queries regarding any of our terms, please contact us at RSSWIFTCOURIERS@GMAIL.COM.</p>
        </CardContent>
      </Card>
    </div>
  );
}
