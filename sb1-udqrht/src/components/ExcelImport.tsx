import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Equipment } from '../types/equipment';

interface ExcelImportProps {
  onImport: (data: Equipment[]) => void;
}

export function ExcelImport({ onImport }: ExcelImportProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryString = event.target?.result;
        const workbook = XLSX.read(binaryString, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const formattedData = jsonData.map((item: any, index) => {
          // Parse contract cost - handle both number and string formats
          let contractCost = 0;
          if (typeof item['Contract Cost'] === 'number') {
            contractCost = item['Contract Cost'];
          } else if (typeof item['Contract Cost'] === 'string') {
            // Remove currency symbols and commas, then parse
            const cleanedValue = item['Contract Cost'].replace(/[^0-9.-]+/g, '');
            contractCost = parseFloat(cleanedValue);
          }

          // Parse dates
          const parseDate = (dateValue: any) => {
            if (!dateValue) return '';
            // Try parsing Excel date number
            const excelDate = XLSX.SSF.parse_date_code(dateValue);
            if (excelDate) {
              return new Date(excelDate.y, excelDate.m - 1, excelDate.d).toISOString();
            }
            // Try parsing string date
            const date = new Date(dateValue);
            return !isNaN(date.getTime()) ? date.toISOString() : '';
          };

          return {
            id: Date.now() + index,
            asset: item['Asset'] || '',
            parentAsset: item['Parent Asset'] || '',
            description: item['Description'] || '',
            model: item['Model'] || '',
            serialNumber: item['Serial Number'] || '',
            manufacturer: item['Manufacturer'] || '',
            location: item['Location'] || '',
            currentCoverage: item['Current Coverage'] || '',
            endUser: item['End User'] || '',
            serviceProvider: item['Service Provider'] || '',
            status: item['Status'] || '',
            researchUnit: item['Research Unit'] || '',
            contractStartDate: parseDate(item['Contract Start Date']),
            contractEndDate: parseDate(item['Contract End Date']),
            contractCost: contractCost || 0,
            planner: item['Planner'] || '',
            site: item['Site'] || ''
          };
        });

        onImport(formattedData);
        toast.success(`Successfully imported ${formattedData.length} items`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Error importing data. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Equipment Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="flex-1"
          />
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}