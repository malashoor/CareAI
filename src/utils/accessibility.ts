interface AccessibilityProps {
  label?: string;
  hint?: string;
  role?: string;
  state?: Record<string, boolean>;
}

export const accessibility = {
  minTouchTargetSize: 44,
  labels: {
    back: 'Back',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
  },
  hints: {
    back: 'Go back to previous screen',
    cancel: 'Cancel the current action',
    submit: 'Submit the form',
    edit: 'Edit this item',
    delete: 'Delete this item',
  },
  getAccessibilityProps: ({
    label,
    hint,
    role,
    state,
  }: AccessibilityProps) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state,
  }),
}; 