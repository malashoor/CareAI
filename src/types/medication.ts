export interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
}

export interface MedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  initialData?: Partial<MedicationFormData>;
} 