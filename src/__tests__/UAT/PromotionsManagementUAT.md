# Promotions Management UAT Checklist

## 1. Create New Promotion

### Basic Functionality
- [ ] Can navigate to Create Promotion screen
- [ ] All form fields are accessible and properly labeled
- [ ] Form fields have appropriate keyboard types (numeric for discount value)
- [ ] Date pickers work correctly on both iOS and Android
- [ ] Discount type toggle works correctly (% vs $)

### Validation
- [ ] Required fields are marked appropriately
- [ ] Title field validation works
- [ ] Description field validation works
- [ ] Discount value validation works
- [ ] Date validation works (end date after start date)
- [ ] Error messages are clear and accessible

### Success Flow
- [ ] Form submission works correctly
- [ ] Success message is displayed
- [ ] User is redirected back to promotions list
- [ ] New promotion appears in the list
- [ ] All promotion details are displayed correctly

### Error Handling
- [ ] Network errors are handled gracefully
- [ ] Error messages are clear and accessible
- [ ] Form state is preserved on error
- [ ] User can retry submission
- [ ] User can cancel and return to list

## 2. Edit Existing Promotion

### Basic Functionality
- [ ] Can navigate to Edit Promotion screen
- [ ] All form fields are pre-populated correctly
- [ ] Form fields are editable
- [ ] Date pickers work correctly
- [ ] Discount type toggle works correctly

### Validation
- [ ] Required fields are marked appropriately
- [ ] Title field validation works
- [ ] Description field validation works
- [ ] Discount value validation works
- [ ] Date validation works
- [ ] Error messages are clear and accessible

### Success Flow
- [ ] Form submission works correctly
- [ ] Success message is displayed
- [ ] User is redirected back to promotions list
- [ ] Updated promotion details are displayed correctly
- [ ] Changes are reflected in the list

### Error Handling
- [ ] Network errors are handled gracefully
- [ ] Error messages are clear and accessible
- [ ] Form state is preserved on error
- [ ] User can retry submission
- [ ] User can cancel and return to list

## 3. Accessibility

### Screen Reader
- [ ] All form fields are properly labeled
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Date pickers are accessible
- [ ] Buttons have appropriate labels and hints

### Keyboard Navigation
- [ ] All form fields are focusable
- [ ] Tab order is logical
- [ ] Date pickers are keyboard accessible
- [ ] Buttons are keyboard accessible
- [ ] Error messages are keyboard accessible

### Visual Accessibility
- [ ] Color contrast meets WCAG standards
- [ ] Error states are visually clear
- [ ] Success states are visually clear
- [ ] Form fields have clear visual hierarchy
- [ ] Buttons have clear visual states

## 4. Performance

### Loading States
- [ ] Loading indicators are shown during API calls
- [ ] Form is disabled during submission
- [ ] Loading states are accessible
- [ ] Loading states are visually clear
- [ ] Loading states don't block UI

### Response Time
- [ ] Form submission is responsive
- [ ] Date pickers open quickly
- [ ] Error messages appear quickly
- [ ] Success messages appear quickly
- [ ] Navigation is smooth

## 5. Edge Cases

### Date Handling
- [ ] Past dates are handled correctly
- [ ] Future dates are handled correctly
- [ ] Date format is consistent
- [ ] Timezone issues are handled
- [ ] Date validation is robust

### Discount Values
- [ ] Percentage values are handled correctly
- [ ] Fixed values are handled correctly
- [ ] Decimal values are handled correctly
- [ ] Large values are handled correctly
- [ ] Zero values are handled correctly

### Network Conditions
- [ ] Works offline
- [ ] Handles slow connections
- [ ] Handles connection loss
- [ ] Handles connection recovery
- [ ] Data is preserved during network issues

## 6. Internationalization

### Text Display
- [ ] All text is properly translated
- [ ] Date formats are localized
- [ ] Number formats are localized
- [ ] Currency symbols are localized
- [ ] Error messages are translated

### RTL Support
- [ ] Layout works in RTL mode
- [ ] Text alignment is correct
- [ ] Date pickers work in RTL
- [ ] Form fields are properly aligned
- [ ] Buttons are properly aligned

## 7. Security

### Input Validation
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are blocked
- [ ] Special characters are handled
- [ ] Large inputs are handled
- [ ] Malformed data is rejected

### Authorization
- [ ] Only authorized users can access
- [ ] Role-based access works
- [ ] Permissions are enforced
- [ ] Unauthorized access is blocked
- [ ] Session handling works 