import "react-phone-number-input/style.css";
import PhoneInput, { Country } from "react-phone-number-input";

interface PhoneNumberInputProps {
  value: string;
  name?: string;
  countryCode?: Country;
  onChange: (value: string) => void;
}

export function PhoneNumberInput({
  value,
  name,
  countryCode = "US",
  onChange,
}: PhoneNumberInputProps) {
  const handleChange = (value: any) => {
    onChange(value as string);
  };
  return (
    <PhoneInput
      international
      limitMaxLength
      name={name}
      defaultCountry={countryCode}
      value={value}
      onChange={handleChange}
    />
  );
}
