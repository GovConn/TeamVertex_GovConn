import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Phone,
  Mail,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react";

// Dummy detailed document data
const documentDetails = {
  DOC001: {
    id: "DOC001",
    type: "Birth Certificate",
    applicantName: "Kamal Perera",
    applicantEmail: "kamal.perera@gmail.com",
    applicantPhone: "+94 71 345 6789",
    submittedDate: "2025-08-10",
    expectedDate: "2025-08-20",
    status: "pending",
    priority: "normal",
    documents: [
      { name: "NIC Copy", type: "PDF", size: "2.1 MB", uploaded: "2025-08-10" },
      {
        name: "Application Form",
        type: "PDF",
        size: "1.0 MB",
        uploaded: "2025-08-10",
      },
    ],
    details: {
      birthDate: "2000-03-12",
      birthPlace: "Lady Ridgeway Hospital, Colombo",
      fatherName: "Sunil Perera",
      motherName: "Anusha Perera",
      purpose: "Passport application",
    },
    comments: [
      {
        date: "2025-08-10",
        author: "System",
        message: "Application received and assigned ID DOC001",
      },
      {
        date: "2025-08-11",
        author: "Officer Fernando",
        message: "Initial review completed. All documents verified.",
      },
    ],
  },
};

export function DocumentDetails() {
  const { documentId } = useParams<{ documentId: string }>();

  if (!documentId) {
    return <div>Invalid document ID</div>;
  }

  const document = documentDetails[documentId as keyof typeof documentDetails];

  if (!document) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Document Not Found
              </h3>
              <p className="text-muted-foreground">
                The requested document could not be found.
              </p>
              <Link to="/services/documents" className="mt-4 inline-block">
                <Button>Back to Documents</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning";
      case "processing":
        return "bg-primary/20 text-primary";
      case "approved":
        return "bg-success/20 text-success";
      case "completed":
        return "bg-success/20 text-success";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/20 text-destructive";
      case "high":
        return "bg-warning/20 text-warning";
      case "normal":
        return "bg-muted/20 text-muted-foreground";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/services/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {document.type}
          </h1>
          <p className="text-muted-foreground">Request ID: {document.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-foreground">{document.applicantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground">{document.applicantEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <p className="text-foreground">{document.applicantPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Purpose
                  </label>
                  <p className="text-foreground">{document.details.purpose}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Details
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
                  <p className="text-foreground">{document.details.birthDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Birth Place</label>
                  <p className="text-foreground">{document.details.birthPlace}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                  <p className="text-foreground">{document.details.fatherName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                  <p className="text-foreground">{document.details.motherName}</p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Submitted Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • Uploaded {doc.uploaded}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {document.comments.map((comment, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Add Comment
                </label>
                <Textarea placeholder="Add a comment or update..." />
                <Button size="sm">Add Comment</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Priority
                  </span>
                  <Badge className={getPriorityColor(document.priority)}>
                    {document.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full">Approve</Button>
                <Button variant="outline" className="w-full">
                  Request Changes
                </Button>
                <Button variant="destructive" className="w-full">
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-foreground">
                    {document.submittedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expected</span>
                  <span className="text-foreground">
                    {document.expectedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing Time</span>
                  <span className="text-foreground">10 business days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
