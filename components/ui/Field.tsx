const inputClassName =
  "mt-1 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose/40 disabled:opacity-60";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
  minLength,
  maxLength,
}: FieldProps) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className={inputClassName}
      />
    </label>
  );
}
