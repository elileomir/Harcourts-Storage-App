"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import { WaitlistRequest, WaitlistRequestInput } from "@/hooks/use-waitlist";
import { useUnits } from "@/hooks/use-units";
import { Checkbox } from "@/components/ui/checkbox";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WaitlistRequest | null;
  onSubmit: (data: WaitlistRequestInput) => void;
}

export function WaitlistDialog({
  open,
  onOpenChange,
  request,
  onSubmit,
}: WaitlistDialogProps) {
  const { units } = useUnits();

  // Extract unique facilities from units
  const facilities = Array.from(
    new Set(units?.map((u) => u.facility).filter(Boolean) || [])
  ).sort();

  const [formData, setFormData] = useState<WaitlistRequestInput>({
    full_name: request?.full_name || "",
    email_address: request?.email_address || "",
    phone_number: request?.phone_number || "",
    facility: (() => {
      if (!request?.facility) return [];
      if (Array.isArray(request.facility)) return request.facility;
      try {
        const parsed = JSON.parse(request.facility);
        return Array.isArray(parsed) ? parsed : [request.facility];
      } catch {
        return [request.facility];
      }
    })(),
    preferred_date:
      request?.preferred_date || new Date().toISOString().split("T")[0],
    storage_purpose: request?.storage_purpose || "",
  });

  const handleFacilityChange = (facility: string, checked: boolean) => {
    const currentFacilities = Array.isArray(formData.facility)
      ? formData.facility
      : [];

    if (checked) {
      setFormData({
        ...formData,
        facility: [...currentFacilities, facility],
      });
    } else {
      setFormData({
        ...formData,
        facility: currentFacilities.filter((f) => f !== facility),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {request ? "Edit Waitlist Request" : "New Waitlist Request"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Name
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email_address" className="text-right">
              Email
            </Label>
            <Input
              id="email_address"
              type="email"
              value={formData.email_address}
              onChange={(e) =>
                setFormData({ ...formData, email_address: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone_number" className="text-right">
              Phone
            </Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Facility</Label>
            <div className="col-span-3 border rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto">
              {facilities.map((facility) => (
                <div
                  key={facility as string}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={(Array.isArray(formData.facility)
                      ? formData.facility
                      : []
                    ).includes(facility as string)}
                    onCheckedChange={(checked) =>
                      handleFacilityChange(
                        facility as string,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`facility-${facility}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {facility as string}
                  </Label>
                </div>
              ))}
              {facilities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No facilities found.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preferred_date" className="text-right">
              Date Needed
            </Label>
            <Input
              id="preferred_date"
              type="date"
              value={formData.preferred_date}
              onChange={(e) =>
                setFormData({ ...formData, preferred_date: e.target.value })
              }
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="storage_purpose" className="text-right">
              Purpose
            </Label>
            <Textarea
              id="storage_purpose"
              value={formData.storage_purpose || ""}
              onChange={(e) =>
                setFormData({ ...formData, storage_purpose: e.target.value })
              }
              className="col-span-3"
              placeholder="e.g. Moving house, business storage..."
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
