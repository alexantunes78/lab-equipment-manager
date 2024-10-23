import React, { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { FileSpreadsheet, Settings, Trash2, AlertTriangle, Download, Copy, Plus } from 'lucide-react';
import { Equipment, initialEquipmentState } from '../types/equipment';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";

interface EquipmentListProps {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  userPermissions: {
    canEditEquipment: boolean;
    canDeleteEquipment: boolean;
    canFilterSort: boolean;
  };
}

const FILTER_FIELD_LABELS: Record<keyof Equipment, string> = {
  id: 'ID',
  asset: 'Asset',
  parentAsset: 'Parent Asset',
  description: 'Description',
  model: 'Model',
  serialNumber: 'Serial Number',
  manufacturer: 'Manufacturer',
  location: 'Location',
  currentCoverage: 'Current Coverage',
  endUser: 'End User',
  serviceProvider: 'Service Provider',
  status: 'Status',
  researchUnit: 'Research Unit',
  contractStartDate: 'Contract Start Date',
  contractEndDate: 'Contract End Date',
  contractCost: 'Contract Cost',
  planner: 'Planner',
  site: 'Site'
};

export function EquipmentList({ equipment, setEquipment, userPermissions }: EquipmentListProps) {
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<number>>(new Set());
  const [filterField, setFilterField] = useState<keyof Equipment>("asset");
  const [filterValue, setFilterValue] = useState("");
  const [plannerFilter, setPlannerFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [showNearExpiration, setShowNearExpiration] = useState(false);
  const [sortField, setSortField] = useState<keyof Equipment>("asset");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const uniquePlanners = useMemo(() => 
    Array.from(new Set(equipment.map(item => item.planner))).filter(Boolean).sort(),
    [equipment]
  );

  const uniqueSites = useMemo(() => 
    Array.from(new Set(equipment.map(item => item.site))).filter(Boolean).sort(),
    [equipment]
  );

  const handleAddNew = () => {
    setEditingEquipment({ ...initialEquipmentState, id: Date.now() });
    setIsAddingNew(true);
  };

  const handleExport = () => {
    try {
      const exportData = filteredAndSortedEquipment.map(item => ({
        'Asset': item.asset,
        'Parent Asset': item.parentAsset,
        'Description': item.description,
        'Model': item.model,
        'Serial Number': item.serialNumber,
        'Manufacturer': item.manufacturer,
        'Location': item.location,
        'Current Coverage': item.currentCoverage,
        'End User': item.endUser,
        'Service Provider': item.serviceProvider,
        'Status': item.status,
        'Research Unit': item.researchUnit,
        'Contract Start Date': formatDate(item.contractStartDate),
        'Contract End Date': formatDate(item.contractEndDate),
        'Contract Cost': item.contractCost,
        'Planner': item.planner,
        'Site': item.site
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Equipment List');
      
      const fileName = `equipment_list_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Equipment list exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export equipment list');
    }
  };

  const duplicateAssets = useMemo(() => {
    const assetCounts = equipment.reduce((acc, item) => {
      acc[item.asset] = (acc[item.asset] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.fromEntries(
      Object.entries(assetCounts).filter(([_, count]) => count > 1)
    );
  }, [equipment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingEquipment) return;
    
    const { name, value } = e.target;
    setEditingEquipment(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: name === "contractCost" ? parseFloat(value) || 0 : value
      };
    });
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment({ ...item });
    setIsAddingNew(false);
  };

  const handleSave = () => {
    if (!editingEquipment) return;

    if (isAddingNew) {
      setEquipment(prev => [...prev, editingEquipment]);
      toast.success('New equipment added successfully');
    } else {
      setEquipment(prev => 
        prev.map(item => item.id === editingEquipment.id ? editingEquipment : item)
      );
      toast.success('Equipment updated successfully');
    }
    
    setEditingEquipment(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setEquipment(prev => prev.filter(item => item.id !== id));
      toast.success('Equipment deleted successfully');
    }
  };

  const toggleSelectAll = () => {
    if (selectedEquipment.size === equipment.length) {
      setSelectedEquipment(new Set());
    } else {
      setSelectedEquipment(new Set(equipment.map(item => item.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedEquipment);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEquipment(newSelected);
  };

  const deleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEquipment.size} items?`)) {
      setEquipment(prev => prev.filter(item => !selectedEquipment.has(item.id)));
      setSelectedEquipment(new Set());
      toast.success(`${selectedEquipment.size} items deleted successfully`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isNearExpiration = (dateString: string) => {
    if (!dateString) return false;
    const endDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 60 && daysUntilExpiration > 0;
  };

  const filteredAndSortedEquipment = equipment
    .filter(item => {
      const mainFilterMatch = String(item[filterField]).toLowerCase().includes(filterValue.toLowerCase());
      const plannerMatch = !plannerFilter || item.planner.toLowerCase().includes(plannerFilter.toLowerCase());
      const siteMatch = !siteFilter || item.site.toLowerCase().includes(siteFilter.toLowerCase());
      const expirationMatch = !showNearExpiration || isNearExpiration(item.contractEndDate);
      return mainFilterMatch && plannerMatch && siteMatch && (!showNearExpiration || expirationMatch);
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const comparison = sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * comparison;
      }
      
      if (aValue < bValue) return -1 * comparison;
      if (aValue > bValue) return 1 * comparison;
      return 0;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Equipment List
            </CardTitle>
            {Object.keys(duplicateAssets).length > 0 && (
              <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                <Copy className="h-4 w-4" />
                {Object.keys(duplicateAssets).length} duplicate asset number{Object.keys(duplicateAssets).length > 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {userPermissions.canEditEquipment && (
              <Button
                variant="outline"
                onClick={handleAddNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {userPermissions.canFilterSort && (
          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Filter Field</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value as keyof Equipment)}
                >
                  {Object.entries(FILTER_FIELD_LABELS)
                    .filter(([key]) => key !== 'id' && key !== 'planner' && key !== 'site')
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label>Filter Value</Label>
                <Input
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="Enter filter value"
                />
              </div>
              <div>
                <Label>Sort Direction</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Planner Filter</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={plannerFilter}
                  onChange={(e) => setPlannerFilter(e.target.value)}
                >
                  <option value="">All Planners</option>
                  {uniquePlanners.map(planner => (
                    <option key={planner} value={planner}>{planner}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Site Filter</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                >
                  <option value="">All Sites</option>
                  {uniqueSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nearExpiration"
                  checked={showNearExpiration}
                  onCheckedChange={(checked) => setShowNearExpiration(checked as boolean)}
                />
                <Label
                  htmlFor="nearExpiration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Show only contracts near expiration
                </Label>
              </div>
            </div>
          </div>
        )}

        {userPermissions.canDeleteEquipment && selectedEquipment.size > 0 && (
          <div className="mb-4">
            <Button variant="destructive" onClick={deleteSelected}>
              Delete Selected ({selectedEquipment.size})
            </Button>
          </div>
        )}

        <Dialog 
          open={editingEquipment !== null} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingEquipment(null);
              setIsAddingNew(false);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isAddingNew ? 'Add New Asset' : 'Edit Asset'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editingEquipment && Object.entries(editingEquipment)
                .filter(([key]) => key !== 'id')
                .map(([key, value]) => (
                  <div key={key} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right capitalize">
                      {FILTER_FIELD_LABELS[key as keyof Equipment]}
                    </Label>
                    <Input
                      name={key}
                      value={value.toString()}
                      onChange={handleInputChange}
                      type={key.includes('Date') ? 'date' : key === 'contractCost' ? 'number' : 'text'}
                      className="col-span-3"
                    />
                  </div>
                ))}
              <Button onClick={handleSave}>{isAddingNew ? 'Add Asset' : 'Save Changes'}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {userPermissions.canDeleteEquipment && (
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedEquipment.size === equipment.length}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Asset</TableHead>
                <TableHead>Parent Asset</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>End User</TableHead>
                <TableHead>Service Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Research Unit</TableHead>
                <TableHead>Contract Start</TableHead>
                <TableHead>Contract End</TableHead>
                <TableHead>Contract Cost</TableHead>
                <TableHead>Planner</TableHead>
                <TableHead>Site</TableHead>
                {userPermissions.canEditEquipment && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEquipment.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    duplicateAssets[item.asset] ? 'bg-yellow-50' : '',
                    isNearExpiration(item.contractEndDate) ? 'bg-orange-50' : '',
                    duplicateAssets[item.asset] && isNearExpiration(item.contractEndDate) ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                  )}
                >
                  {userPermissions.canDeleteEquipment && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEquipment.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="relative">
                    {item.asset}
                    {duplicateAssets[item.asset] && (
                      <Copy className="h-4 w-4 text-yellow-500 absolute top-2 right-2" />
                    )}
                  </TableCell>
                  <TableCell>{item.parentAsset}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>{item.serialNumber}</TableCell>
                  <TableCell>{item.manufacturer}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.currentCoverage}</TableCell>
                  <TableCell>{item.endUser}</TableCell>
                  <TableCell>{item.serviceProvider}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.researchUnit}</TableCell>
                  <TableCell>{formatDate(item.contractStartDate)}</TableCell>
                  <TableCell className="relative">
                    {formatDate(item.contractEndDate)}
                    {isNearExpiration(item.contractEndDate) && (
                      <AlertTriangle className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(item.contractCost)}</TableCell>
                  <TableCell>{item.planner}</TableCell>
                  <TableCell>{item.site}</TableCell>
                  {userPermissions.canEditEquipment && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}