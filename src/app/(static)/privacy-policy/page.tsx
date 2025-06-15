
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" /> Privacy Policy
          </CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Welcome to Shed Load Overseas. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
          <p>As a prototype application, Shed Load Overseas currently uses hardcoded credentials for login ("demo@rswift.com" / "123456") and primarily relies on browser localStorage to store shipment data you enter. We do not collect personal information beyond what is necessary for the app's demonstration features, such as the email used for login (which is not transmitted to a server) and shipment details you input.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">2. How We Use Your Information</h2>
          <p>The information stored in localStorage (shipment details) is used solely within your browser to demonstrate the application's features, such as booking history and tracking. This data is not sent to or stored on any external servers.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Will Your Information Be Shared With Anyone?</h2>
          <p>No. Since all data is stored locally in your browser's localStorage for this prototype, it is not shared with any third parties.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. How Long Do We Keep Your Information?</h2>
          <p>Information stored in localStorage persists until you clear your browser's cache and site data or until the data is overwritten or removed by application logic (which is not currently implemented for automatic deletion in this prototype).</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. How Do We Keep Your Information Safe?</h2>
          <p>While we strive to use commercially acceptable means to protect your information within the browser, remember that no method of transmission over the Internet or method of electronic storage is 100% secure. Data stored in localStorage is specific to your browser and device.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">6. What Are Your Privacy Rights?</h2>
          <p>You can manage data stored by this application by clearing your browser's localStorage for this site. For any persistent data concerns (not applicable to this prototype's current design), please contact us.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. Updates to This Notice</h2>
          <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">8. Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us at RSSWIFTCOURIERS@GMAIL.COM or by post to RS SWIFT COURIERS LLP, 18AX MODEL TOWN EXTENSION, LUDHIANA, NEAR PUNJAB & SIND BANK.</p>
        </CardContent>
      </Card>
    </div>
  );
}
