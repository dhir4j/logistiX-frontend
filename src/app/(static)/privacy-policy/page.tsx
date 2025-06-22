
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" /> Privacy Policy
          </CardTitle>
          {lastUpdated && <CardDescription>Last updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Welcome to SHEDLOAD OVERSEAS LLP. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
          <p>When you register for an account on SHEDLOAD OVERSEAS LLP, we collect personal information you provide to us, such as your first name, last name, email address, and password. When you use our services to book a shipment, we collect details related to the shipment, including sender and receiver names, addresses, phone numbers, and package information. This information is transmitted to and stored on our secure servers to provide and manage your shipments.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">2. How We Use Your Information</h2>
          <p>We use the information we collect or receive:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>To facilitate account creation and logon process.</li>
            <li>To manage user accounts.</li>
            <li>To provide and manage our shipment booking and tracking services.</li>
            <li>To send administrative information to you, such as information regarding changes to our terms, conditions, and policies.</li>
            <li>To respond to your inquiries and solve any potential issues you might have with the use of our Services.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Will Your Information Be Shared With Anyone?</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.</p>
          <p>We may need to share your personal information in the following situations:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li><strong>Legal Obligations.</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. How Long Do We Keep Your Information?</h2>
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. How Do We Keep Your Information Safe?</h2>
          <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">6. What Are Your Privacy Rights?</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. To make such a request, please use the contact details provided below.</p>
          <p>If you have an account with us, you can review and change your personal information by logging into your account and visiting your account settings page. You may also send us an email at the contact address below to request access to, correct, or delete any personal information that you have provided to us.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. Updates to This Notice</h2>
          <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">8. Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us at SHEDLOADOVERSEAS@GMAIL.COM or by post to Showroom no. 30, B Block, LGF, CHD, Citi Center, Zirakpur, Mohali, SAS Nagar, Punjab, 140603.</p>
        </CardContent>
      </Card>
    </div>
  );
}
