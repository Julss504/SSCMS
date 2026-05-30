# Students Import Template

This is a template Excel (.xlsx) file for importing student data into the SSCMS system.

## File Information
- **File:** `students-import-template.xlsx`
- **Location:** `/frontend/public/students-import-template.xlsx`
- **Generated:** 2026-05-30 05:58 AM

## Format Expected by the System

The import function expects the following columns in the first worksheet:

| Column Name (Alternative Names) | Data Field | Required | Description |
|---------------------------------|------------|----------|-------------|
| Student ID / studentId / id | studentId | Yes | Unique student identifier |
| Name / name | name | Yes | Full name of the student |
| Email / email | email | Yes | Student email address |
| Phone / phone | phone | No | Contact phone number |
| Department / department | department | No | Academic department |
| Year / year | year | No | Academic year (e.g., "1st Year", "2nd Year") |
| Section / section | section | No | Class section (e.g., "A", "B", "C") |

## Sample Data Included

The template includes sample data for 5 students:
1. John Doe - IT Department, 2nd Year, Section B
2. Jane Smith - Business Department, 3rd Year, Section A  
3. Bob Johnson - Hospitality Management, 1st Year, Section C
4. Alice Brown - Education Department, 4th Year, Section D
5. Charlie Wilson - IT Department, 2nd Year, (no phone or section)

## How to Use

1. Download this template file
2. Open it in Microsoft Excel, Google Sheets, or LibreOffice Calc
3. Replace the sample data with your actual student data
4. Save the file (make sure to keep the .xlsx format)
5. Go to the Students page in the SSCMS system
6. Click the "Import XLSX" button
7. Select your completed template file
8. The system will process the import and show results

## Validation Rules

- Student ID, Name, and Email are required fields
- The system will check for duplicate Student IDs or Emails
- Errors in any row will be reported but won't stop the import of valid rows
- Maximum file size: 5MB

## Supported Formats

- .xlsx (Excel 2007+)
- .xls (Excel 97-2003)

## Notes

- Phone, Department, Year, and Section fields are optional
- If optional fields are left blank, they will be stored as empty strings
- The system is case-insensitive for column headers
- Additional columns beyond the specified ones will be ignored