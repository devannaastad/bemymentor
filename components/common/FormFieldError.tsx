// components/common/FormFieldError.tsx
export default function FormFieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-rose-400">{error}</p>;
}