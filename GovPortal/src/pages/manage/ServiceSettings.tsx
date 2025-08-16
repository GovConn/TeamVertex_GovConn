import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings, Eye, EyeOff, X } from "lucide-react";
import { getServices, createService, updateService, deleteService, getAllDocumentTypes } from "@/api/manage";
import type { Service, CreateServiceRequest, UpdateServiceRequest, DocumentType } from "@/api/interfaces";

interface ServiceFormData {
  service_name_en: string;
  service_name_si: string;
  service_name_ta: string;
  description_en: string;
  description_si: string;
  description_ta: string;
  service_type: string;
  is_active: boolean;
  required_document_types: number[];
}

const initialFormData: ServiceFormData = {
  service_name_en: "",
  service_name_si: "",
  service_name_ta: "",
  description_en: "",
  description_si: "",
  description_ta: "",
  service_type: "public",
  is_active: true,
  required_document_types: [],
};

export function ServiceSettings() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentType[]>([]);
  const [documentTypesLoading, setDocumentTypesLoading] = useState(false);

  // Get gov_node_id from localStorage
  const getGovNodeId = (): number => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.category_id || 0;
    }
    return 0;
  };

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const govNodeId = getGovNodeId();
      if (govNodeId === 0) {
        toast.error("Unable to determine your category ID");
        return;
      }
      
      const response = await getServices(govNodeId);
      setServices(response.data);
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDocumentTypes = useCallback(async () => {
    try {
      setDocumentTypesLoading(true);
      const response = await getAllDocumentTypes();
      setAvailableDocumentTypes(response.data);
    } catch (error) {
      console.error("Failed to load document types:", error);
      toast.error("Failed to load document types");
    } finally {
      setDocumentTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadDocumentTypes();
  }, [loadServices, loadDocumentTypes]);

  const handleInputChange = (field: keyof ServiceFormData, value: string | boolean | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleDocumentType = (docId: number) => {
    setFormData(prev => ({
      ...prev,
      required_document_types: prev.required_document_types.includes(docId)
        ? prev.required_document_types.filter(id => id !== docId)
        : [...prev.required_document_types, docId]
    }));
  };

  const removeDocumentType = (id: number) => {
    setFormData(prev => ({
      ...prev,
      required_document_types: prev.required_document_types.filter(docId => docId !== id)
    }));
  };

  const handleSubmit = async () => {
    try {
      const govNodeId = getGovNodeId();
      if (govNodeId === 0) {
        toast.error("Unable to determine your category ID");
        return;
      }

      if (editingService) {
        // Update service
        if (!editingService.service_id) {
          toast.error("Service ID is missing");
          return;
        }

        const updatePayload: UpdateServiceRequest = {
          description_en: formData.description_en,
          description_si: formData.description_si,
          description_ta: formData.description_ta,
          is_active: formData.is_active,
          required_document_types: formData.required_document_types,
          service_name_en: formData.service_name_en,
          service_name_si: formData.service_name_si,
          service_name_ta: formData.service_name_ta,
          service_type: formData.service_type,
        };

        await updateService(editingService.service_id, updatePayload);
        toast.success("Service updated successfully");
      } else {
        // Create new service
        const payload: CreateServiceRequest = {
          ...formData,
          gov_node_id: govNodeId,
        };

        await createService(payload);
        toast.success("Service created successfully");
      }

      setDialogOpen(false);
      setEditingService(null);
      setFormData(initialFormData);
      loadServices();
    } catch (error) {
      console.error("Failed to save service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete || !serviceToDelete.service_id) {
      toast.error("Service ID is missing");
      return;
    }

    try {
      await deleteService(serviceToDelete.service_id);
      toast.success("Service deleted successfully");
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      loadServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      service_name_en: service.service_name_en,
      service_name_si: service.service_name_si,
      service_name_ta: service.service_name_ta,
      description_en: service.description_en,
      description_si: service.description_si,
      description_ta: service.description_ta,
      service_type: service.service_type,
      is_active: service.is_active,
      required_document_types: service.required_document_types,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Settings</h1>
          <p className="text-muted-foreground">Manage available services and their configurations</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Services ({services.length})
          </CardTitle>
          <CardDescription>
            View and manage all available services in your category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first service</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name (EN)</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document Types</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.service_name_en}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.service_name_si && `සි: ${service.service_name_si}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.service_name_ta && `த: ${service.service_name_ta}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.service_type === "public" ? "default" : "secondary"}>
                        {service.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {service.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={service.is_active ? "default" : "destructive"}>
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {service.required_document_types.slice(0, 3).map((docTypeId, idx) => {
                          const docType = availableDocumentTypes.find(dt => dt.id === docTypeId);
                          return (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {docType?.name_en || `Doc ${docTypeId}`}
                            </Badge>
                          );
                        })}
                        {service.required_document_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.required_document_types.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.created_at && (
                        <div className="text-sm">
                          {new Date(service.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? "Update the service details below" 
                : "Fill in the details to create a new service"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6">
            {/* Service Names */}
            <div className="grid gap-4">
              <h3 className="font-medium">Service Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name_en">English Name *</Label>
                  <Input
                    id="name_en"
                    value={formData.service_name_en}
                    onChange={(e) => handleInputChange("service_name_en", e.target.value)}
                    placeholder="Service name in English"
                  />
                </div>
                <div>
                  <Label htmlFor="name_si">Sinhala Name</Label>
                  <Input
                    id="name_si"
                    value={formData.service_name_si}
                    onChange={(e) => handleInputChange("service_name_si", e.target.value)}
                    placeholder="සේවා නාමය සිංහලෙන්"
                  />
                </div>
                <div>
                  <Label htmlFor="name_ta">Tamil Name</Label>
                  <Input
                    id="name_ta"
                    value={formData.service_name_ta}
                    onChange={(e) => handleInputChange("service_name_ta", e.target.value)}
                    placeholder="சேவை பெயர் தமிழில்"
                  />
                </div>
              </div>
            </div>

            {/* Service Descriptions */}
            <div className="grid gap-4">
              <h3 className="font-medium">Service Descriptions</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="desc_en">English Description *</Label>
                  <Textarea
                    id="desc_en"
                    value={formData.description_en}
                    onChange={(e) => handleInputChange("description_en", e.target.value)}
                    placeholder="Detailed description in English"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="desc_si">Sinhala Description</Label>
                  <Textarea
                    id="desc_si"
                    value={formData.description_si}
                    onChange={(e) => handleInputChange("description_si", e.target.value)}
                    placeholder="සිංහල විස්තරය"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="desc_ta">Tamil Description</Label>
                  <Textarea
                    id="desc_ta"
                    value={formData.description_ta}
                    onChange={(e) => handleInputChange("description_ta", e.target.value)}
                    placeholder="தமிழ் விளக்கம்"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Service Configuration */}
            <div className="grid gap-4">
              <h3 className="font-medium">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => handleInputChange("service_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Active Service</Label>
                </div>
              </div>
            </div>

            {/* Required Document Types */}
            <div className="grid gap-4">
              <h3 className="font-medium">Required Document Types</h3>
              
              {documentTypesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-muted-foreground">Loading document types...</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableDocumentTypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableDocumentTypes.map((docType) => (
                        <div key={docType.id} className="flex items-start space-x-3 rounded-md border p-3">
                          <Checkbox
                            id={`doc-${docType.id}`}
                            checked={formData.required_document_types.includes(docType.id)}
                            onCheckedChange={() => toggleDocumentType(docType.id)}
                          />
                          <div className="grid gap-1 leading-none">
                            <Label 
                              htmlFor={`doc-${docType.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {docType.name_en}
                            </Label>
                            {docType.name_si && (
                              <div className="text-sm text-muted-foreground">සි: {docType.name_si}</div>
                            )}
                            {docType.name_ta && (
                              <div className="text-sm text-muted-foreground">த: {docType.name_ta}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {docType.description_en}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No document types available
                    </div>
                  )}
                </div>
              )}
              
              {formData.required_document_types.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selected Document Types:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.required_document_types.map((docId) => {
                      const docType = availableDocumentTypes.find(dt => dt.id === docId);
                      return (
                        <Badge key={docId} variant="secondary" className="flex items-center gap-1">
                          {docType?.name_en || `Doc ${docId}`}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-0 w-4 h-4"
                            onClick={() => removeDocumentType(docId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingService ? "Update Service" : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.service_name_en}"? 
              This action cannot be undone and will permanently remove the service and all its configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setServiceToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}