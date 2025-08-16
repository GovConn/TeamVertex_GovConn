import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import ConfigTimeSlots from "@/components/ConfigTimeSlots";
import ConfigSlotList from "@/components/ConfigSlotList";
import { TimeSlot } from "@/api/interfaces";

export function AppointmentSettings() {
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Get user data from localStorage and set category ID
    const userDataStr = localStorage.getItem("user");
    if (!userDataStr) {
      setError("User not logged in");
      return;
    }

    const userData = JSON.parse(userDataStr);
    const userCategoryId = userData.category_id;
    
    if (!userCategoryId) {
      setError("Category ID not found in user data");
      return;
    }

    setCategoryId(userCategoryId);
  }, []);

  const handleCreateSlot = () => {
    setEditingSlot(null);
    setShowCreateForm(true);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingSlot(null);
    // Trigger refresh of the slot list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appointment Settings</h1>
        <p className="text-muted-foreground">Configure appointment time slots and availability</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {categoryId && (
          <ConfigSlotList 
            key={refreshTrigger} // Force re-render when refresh is triggered
            categoryId={categoryId} 
            onCreateSlot={handleCreateSlot}
            onEditSlot={handleEditSlot}
            onRefresh={handleRefresh}
          />
        )}
        {categoryId && showCreateForm && (
          <ConfigTimeSlots 
            categoryId={categoryId} 
            editSlot={editingSlot}
            onClose={handleFormClose}
          />
        )}
      </div>

    </div>
  );
}