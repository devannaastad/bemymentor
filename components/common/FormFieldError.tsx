// components/common/FormFieldError.tsx
export default function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-rose-300">{message}</p>;
}
