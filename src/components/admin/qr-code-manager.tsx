
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UploadCloud, CheckCircle, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export function QrCodeManager() {
  const qrCodeEndpointPath = "/api/admin/qr_code";
  const [currentQrUrl, setCurrentQrUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUploadedQr, setHasUploadedQr] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCurrentQrStatus = async () => {
    try {
      const fullQrUrl = `${API_BASE_URL}${qrCodeEndpointPath}`;
      const response = await fetch(`${fullQrUrl}?t=${new Date().getTime()}`);
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        setCurrentQrUrl(`${fullQrUrl}?t=${new Date().getTime()}`);
        setHasUploadedQr(true);
      } else {
        setHasUploadedQr(false);
        setCurrentQrUrl(null);
      }
    } catch (error) {
      console.error("Error checking for existing QR code:", error);
      setHasUploadedQr(false);
      setCurrentQrUrl(null);
    }
  };

  useEffect(() => {
    fetchCurrentQrStatus();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp") {
        if (file.size < 2 * 1024 * 1024) { // 2MB limit
          setSelectedFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewSrc(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          toast({ title: "File too large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
          setSelectedFile(null);
          setPreviewSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } else {
        toast({ title: "Invalid file type", description: "Please select a PNG, JPG, or WEBP image.", variant: "destructive" });
        setSelectedFile(null);
        setPreviewSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a QR code image to upload.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('qr_code', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}${qrCodeEndpointPath}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Upload failed. Server responded with ${response.status}.` }));
        throw new Error(errorData.message || `Failed to upload QR code. Status: ${response.status}`);
      }
      
      toast({
        title: "Upload Successful",
        description: "QR code has been uploaded.",
        variant: "default",
      });
      
      // Refresh the displayed QR code by updating its URL with a cache buster, using the full path
      setCurrentQrUrl(`${API_BASE_URL}${qrCodeEndpointPath}?t=${new Date().getTime()}`);
      setHasUploadedQr(true);
      setSelectedFile(null);
      setPreviewSrc(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
          <UploadCloud className="h-7 w-7 text-primary" /> Manage Payment QR Code
        </CardTitle>
        <CardDescription>Upload or replace the QR code used for payments. Accepts PNG, JPG, WEBP (Max 2MB).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Current Payment QR Code</h3>
          <div className="border rounded-md p-4 flex justify-center items-center min-h-[200px] bg-muted/30">
            {hasUploadedQr && currentQrUrl ? (
              <Image
                key={currentQrUrl} 
                src={currentQrUrl}
                alt="Current Payment QR Code"
                width={180}
                height={180}
                className="object-contain rounded-md border"
                unoptimized 
                onError={() => {
                  setHasUploadedQr(false); 
                  setCurrentQrUrl(null);
                }}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No payment QR code uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="qrCodeUpload" className="text-base font-medium block mb-1">Upload/Replace QR Code Image</label>
          <Input
            id="qrCodeUpload"
            type="file"
            ref={fileInputRef}
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {previewSrc && selectedFile && (
          <div className="space-y-2">
            <h3 className="text-md font-medium">New QR Preview:</h3>
            <div className="border rounded-md p-2 inline-block">
              <Image
                src={previewSrc}
                alt="New QR Code Preview"
                width={120}
                height={120}
                className="object-contain rounded-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!selectedFile || isLoading} className="w-full sm:w-auto text-base py-2.5">
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
          {isLoading ? "Uploading..." : "Upload New QR Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
