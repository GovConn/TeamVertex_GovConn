import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Download, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { getCitizenByRefId, activateUser } from "@/api/manage";
import type { Citizen, DocumentLink } from "@/api/interfaces";

export function AddUser() {
  const [searchRefId, setSearchRefId] = useState("");
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validated, setValidated] = useState(false);

  const handleSearch = async () => {
    if (!searchRefId.trim()) {
      setError("Please enter a reference ID");
      return;
    }

    setLoading(true);
    setError("");
    setCitizen(null);
    setValidated(false);
    setSuccess("");

    try {
      const response = await getCitizenByRefId(searchRefId.trim());
      setCitizen(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data
        ? String((err.response.data as { message: unknown }).message)
        : "User not found or error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!citizen || !validated) {
      setError("Please validate user authenticity first");
      return;
    }

    setActivating(true);
    setError("");

    try {
      const response = await activateUser(searchRefId);
      setSuccess(response.data.message);
      console.log(`User activated: ${JSON.stringify(response.data)}`);

      // Update citizen state to reflect activation
      setCitizen(prev => prev ? { ...prev, active: true } : null);
    } catch (err) {
      console.error("Activation error:", err);
      const errorMessage = err instanceof Error && 'response' in err && 
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data
        ? String((err.response.data as { message: unknown }).message)
        : "Failed to activate user";
      setError(errorMessage);
    } finally {
      setActivating(false);
    }
  };

  const renderDocumentPreview = (doc: DocumentLink) => {
    const isPDF = doc.url.toLowerCase().includes('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.url);
    
    const handleDownload = async () => {
      try {
        const response = await fetch(doc.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.title || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to direct link
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.title || 'document';
        link.target = '_blank';
        link.click();
      }
    };
    
    return (
      <Card key={doc.title} className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium capitalize">{doc.title}</h4>
          <div className="flex gap-2">
            {(isPDF || isImage) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(doc.url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
        </p>
        <div className="mt-3 border rounded p-2 bg-gray-50">
          {isPDF ? (
            <div className="w-full">
              <iframe
                src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-96 rounded"
                title={`Preview of ${doc.title}`}
                onError={(e) => {
                  // Fallback to embed if iframe fails
                  const target = e.target as HTMLIFrameElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <embed src="${doc.url}" type="application/pdf" width="100%" height="384" class="rounded">
                        <div class="text-center py-8 text-gray-500">
                          <div class="text-sm">PDF Preview Not Available</div>
                          <div class="text-xs mt-1">Use download button to view this document</div>
                        </div>
                      </embed>
                    `;
                  }
                }}
              />
            </div>
          ) : isImage ? (
            <div className="w-full">
              <img
                src={doc.url}
                alt={doc.title}
                className="w-full max-h-96 object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-center py-8 text-gray-500">
                        <div class="text-sm">Image Preview Not Available</div>
                        <div class="text-xs mt-1">Use download button to view this document</div>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">Document Preview</div>
              <div className="text-xs mt-1">Use download button to view this document</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New User</h1>
        <p className="text-muted-foreground">Search and verify user accounts</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search User
          </CardTitle>
          <CardDescription>
            Enter the Reference number to search for user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Reference Number"
                value={searchRefId}
                onChange={(e) => setSearchRefId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Details Section */}
      {citizen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ID Documents Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium">ID Front</h3>
                <div className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                  {citizen.document_links.length > 0 ? (
                    (() => {
                      const doc = citizen.document_links[0];
                      const isPDF = doc.url.toLowerCase().includes('.pdf');
                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.url);
                      
                      if (isPDF) {
                        return (
                          <iframe
                            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="ID Front Preview"
                          />
                        );
                      } else if (isImage) {
                        return (
                          <img
                            src={doc.url}
                            alt="ID Front"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-gray-500">
                                    <div class="text-center">
                                      <div class="text-sm">Document Available</div>
                                      <div class="text-xs mt-1">Use download button below</div>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <div className="text-sm">Document Available</div>
                              <div className="text-xs mt-1">Use download button below</div>
                            </div>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">ID Front</div>
                  )}
                </div>
                {citizen.document_links.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={async () => {
                      const doc = citizen.document_links[0];
                      try {
                        // Try to download using fetch with proper headers
                        const response = await fetch(doc.url, {
                          method: 'GET',
                          mode: 'cors',
                          headers: {
                            'Content-Type': 'application/octet-stream',
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error(`HTTP ${response.status}`);
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = doc.title || 'id-front';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed, using fallback:', error);
                        // Fallback: Open in new tab which usually triggers browser's download
                        window.open(doc.url, '_blank');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ID Front
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">ID Back</h3>
                <div className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                  {citizen.document_links.length > 1 ? (
                    (() => {
                      const doc = citizen.document_links[1];
                      const isPDF = doc.url.toLowerCase().includes('.pdf');
                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.url);
                      
                      if (isPDF) {
                        return (
                          <iframe
                            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="ID Back Preview"
                          />
                        );
                      } else if (isImage) {
                        return (
                          <img
                            src={doc.url}
                            alt="ID Back"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-gray-500">
                                    <div class="text-center">
                                      <div class="text-sm">Document Available</div>
                                      <div class="text-xs mt-1">Use download button below</div>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <div className="text-sm">Document Available</div>
                              <div className="text-xs mt-1">Use download button below</div>
                            </div>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">ID Back</div>
                  )}
                </div>
                {citizen.document_links.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={async () => {
                      const doc = citizen.document_links[1];
                      try {
                        // Try to download using fetch with proper headers
                        const response = await fetch(doc.url, {
                          method: 'GET',
                          mode: 'cors',
                          headers: {
                            'Content-Type': 'application/octet-stream',
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error(`HTTP ${response.status}`);
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = doc.title || 'id-back';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed, using fallback:', error);
                        // Fallback: Open in new tab which usually triggers browser's download
                        window.open(doc.url, '_blank');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ID Back
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Contact Details:</h3>
                <div className="flex gap-2">
                  <Badge variant={citizen.active ? "default" : "secondary"}>
                    {citizen.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{citizen.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {citizen.first_name} {citizen.last_name}
                </div>
                <div>
                  <span className="font-medium">NIC:</span> {citizen.nic}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {citizen.phone}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {citizen.email}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(citizen.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Validation and Activation */}
            {!citizen.active && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="validate" 
                    checked={validated}
                    onCheckedChange={(checked) => setValidated(checked as boolean)}
                  />
                  <label 
                    htmlFor="validate" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have validated user authenticity and ready to unlock user
                  </label>
                </div>

                <Button
                  onClick={handleActivate}
                  disabled={!validated || activating}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {activating ? "Unlocking..." : "Unlock User"}
                </Button>

                {validated && (
                  <p className="text-sm text-muted-foreground">
                    The password has been sent to the user via their registered phone number and email.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}