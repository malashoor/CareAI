# Pharmacy and Insurance Modules

## Overview
The pharmacy and insurance modules provide functionality for managing prescription refills and insurance claims in the CareAI application. These modules are designed to be user-friendly, secure, and compliant with healthcare regulations.

## Features

### Pharmacy Refills
- View list of prescription refills
- Request new prescription refills
- Track refill status (pending, approved, rejected, filled)
- View detailed refill information
- Edit and delete refill requests
- Filter refills by status
- Status timeline visualization

### Insurance Claims
- View list of insurance claims
- Submit new insurance claims
- Track claim status (pending, approved, rejected)
- View detailed claim information
- Edit and delete claims
- Filter claims by status
- Status timeline visualization

## Components

### StatusTimeline
A reusable component that displays a timeline of status changes for refills and claims.

```typescript
interface TimelineEvent {
  status: string;
  date: Date;
  notes?: string;
}
```

### FilterBar
A horizontal scrollable list of filter options with counts.

```typescript
interface FilterOption {
  label: string;
  value: string;
  count?: number;
}
```

## Database Schema

### pharmacy_refills
```sql
CREATE TABLE pharmacy_refills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### insurance_claims
```sql
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES insurance_providers(id),
  claim_number TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  amount DECIMAL,
  submission_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### insurance_providers
```sql
CREATE TABLE insurance_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  provider_code TEXT NOT NULL,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security

### Row Level Security (RLS)
- Users can only view and modify their own refills and claims
- Insurance providers can only view claims assigned to them
- Admin users have full access to all records

### Data Protection
- Sensitive information is encrypted at rest
- Audit logging for all changes to refills and claims
- Secure API endpoints with proper authentication

## API Endpoints

### Pharmacy Refills
- `GET /api/pharmacy/refills` - List user's refills
- `POST /api/pharmacy/refills` - Create new refill
- `GET /api/pharmacy/refills/:id` - Get refill details
- `PUT /api/pharmacy/refills/:id` - Update refill
- `DELETE /api/pharmacy/refills/:id` - Delete refill
- `PUT /api/pharmacy/refills/:id/status` - Update refill status

### Insurance Claims
- `GET /api/insurance/claims` - List user's claims
- `POST /api/insurance/claims` - Submit new claim
- `GET /api/insurance/claims/:id` - Get claim details
- `PUT /api/insurance/claims/:id` - Update claim
- `DELETE /api/insurance/claims/:id` - Delete claim
- `PUT /api/insurance/claims/:id/status` - Update claim status

## Usage Examples

### Request a New Refill
```typescript
const newRefill = {
  medication_name: "Amoxicillin",
  dosage: "500mg",
  frequency: "Twice daily",
  start_date: new Date(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  notes: "Please refill as soon as possible"
};

await createPharmacyRefill(userId, newRefill);
```

### Submit a New Claim
```typescript
const newClaim = {
  provider_id: "provider-uuid",
  claim_number: "CLM-2024-001",
  claim_type: "medical",
  amount: 150.00,
  submission_date: new Date(),
  notes: "Emergency room visit"
};

await createInsuranceClaim(userId, newClaim);
```

## Best Practices

1. **Data Validation**
   - Validate all input data before submission
   - Use appropriate data types for dates and amounts
   - Implement proper error handling

2. **User Experience**
   - Provide clear status indicators
   - Show loading states during operations
   - Implement proper error messages
   - Support offline functionality where possible

3. **Security**
   - Never expose sensitive data in logs
   - Implement proper access controls
   - Use encryption for sensitive data
   - Regular security audits

4. **Performance**
   - Implement pagination for lists
   - Cache frequently accessed data
   - Optimize database queries
   - Use appropriate indexes

## Future Enhancements

1. **Pharmacy Module**
   - Integration with pharmacy systems
   - Medication reminders
   - Prescription history
   - Drug interaction warnings

2. **Insurance Module**
   - Integration with insurance providers
   - Automated claim submission
   - Coverage verification
   - Claim tracking notifications

3. **General Improvements**
   - Enhanced filtering and search
   - Bulk operations
   - Export functionality
   - Analytics dashboard 