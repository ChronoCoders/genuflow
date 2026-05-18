interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-ink-300">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
