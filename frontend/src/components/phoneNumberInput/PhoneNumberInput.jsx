import React, { useEffect, useMemo, useState } from "react";
import { ConfigProvider, Input, Select } from "antd";
import { useTheme } from "../../context/ThemeContext";


const { Option } = Select;

const defaultCountryOptions = [
  { label: "🇺🇸 +1", value: "+1" }, // USA
  { label: "🇬🇧 +44", value: "+44" }, // UK
  { label: "🇮🇳 +91", value: "+91" }, // India
  { label: "🇱🇰 +94", value: "+94" }, // Sri Lanka
  { label: "🇦🇺 +61", value: "+61" }, // Australia
  { label: "🇯🇵 +81", value: "+81" }, // Japan
  { label: "🇩🇪 +49", value: "+49" }, // Germany
  { label: "🇫🇷 +33", value: "+33" }, // France
  { label: "🇮🇹 +39", value: "+39" }, // Italy
  { label: "🇨🇳 +86", value: "+86" }, // China
  { label: "🇦🇪 +971", value: "+971" }, // UAE
  { label: "🇸🇦 +966", value: "+966" }, // Saudi Arabia
  { label: "🇧🇩 +880", value: "+880" }, // Bangladesh
  { label: "🇵🇰 +92", value: "+92" }, // Pakistan
  { label: "🇪🇸 +34", value: "+34" }, // Spain
  { label: "🇷🇺 +7", value: "+7" }, // Russia
  { label: "🇵🇹 +351", value: "+351" }, // Portugal
  { label: "🇧🇪 +32", value: "+32" }, // Belgium
  { label: "🇳🇱 +31", value: "+31" }, // Netherlands
  { label: "🇰🇷 +82", value: "+82" }, // South Korea
  { label: "🇸🇬 +65", value: "+65" }, // Singapore
  { label: "🇲🇾 +60", value: "+60" }, // Malaysia
  { label: "🇮🇩 +62", value: "+62" }, // Indonesia
  { label: "🇻🇳 +84", value: "+84" }, // Vietnam
  { label: "🇵🇭 +63", value: "+63" }, // Philippines
  { label: "🇹🇭 +66", value: "+66" }, // Thailand
  { label: "🇵🇱 +48", value: "+48" }, // Poland
  { label: "🇨🇿 +420", value: "+420" }, // Czech Republic
  { label: "🇸🇰 +421", value: "+421" }, // Slovakia
  { label: "🇭🇺 +36", value: "+36" }, // Hungary
  { label: "🇸🇪 +46", value: "+46" }, // Sweden
  { label: "🇳🇴 +47", value: "+47" }, // Norway
  { label: "🇩🇰 +45", value: "+45" }, // Denmark
  { label: "🇦🇹 +43", value: "+43" }, // Austria
  { label: "🇫🇮 +358", value: "+358" }, // Finland
  { label: "🇺🇦 +380", value: "+380" }, // Ukraine
  { label: "🇮🇷 +98", value: "+98" }, // Iran
  { label: "🇮🇶 +964", value: "+964" }, // Iraq
  { label: "🇲🇦 +212", value: "+212" }, // Morocco
  { label: "🇪🇬 +20", value: "+20" }, // Egypt
  { label: "🇿🇦 +27", value: "+27" }, // South Africa
  { label: "🇰🇪 +254", value: "+254" }, // Kenya
  { label: "🇹🇿 +255", value: "+255" }, // Tanzania
  { label: "🇺🇬 +256", value: "+256" }, // Uganda
  { label: "🇸🇸 +211", value: "+211" }, // South Sudan
];


const PhoneNumberInput = ({
  value = "",
  countryCode = "+94",
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  countryOptions = defaultCountryOptions,
}) => {
  const { theme } = useTheme();
  const [selectedCode, setSelectedCode] = useState(countryCode);
  const [number, setNumber] = useState("");

  const availableCodes = useMemo(
    () => new Set(countryOptions.map((option) => option.value)),
    [countryOptions]
  );
  const fallbackCode = useMemo(() => {
    if (availableCodes.has(countryCode)) {
      return countryCode;
    }
    const firstOption = countryOptions[0]?.value;
    if (firstOption) {
      return firstOption;
    }
    return "+1";
  }, [availableCodes, countryCode, countryOptions]);

  useEffect(() => {
    if (!value) {
      setNumber("");
      setSelectedCode((prevCode) =>
        availableCodes.has(prevCode) ? prevCode : fallbackCode
      );
      return;
    }

    let matchingCode = null;
    for (const code of availableCodes) {
      if (value.startsWith(code)) {
        if (!matchingCode || code.length > matchingCode.length) {
          matchingCode = code;
        }
      }
    }

    if (matchingCode) {
      setSelectedCode(matchingCode);
      setNumber(value.slice(matchingCode.length));
      return;
    }

    setSelectedCode((prevCode) =>
      availableCodes.has(prevCode) ? prevCode : fallbackCode
    );
    setNumber(value.startsWith("+") ? value.slice(1) : value);
  }, [value, availableCodes, countryCode, fallbackCode]);

  const handlePhoneChange = (e) => {
    const updatedNumber = e.target.value;
    setNumber(updatedNumber);
    if (onChange) {
      if (!updatedNumber.trim()) {
        onChange("");
        return;
      }
      onChange(`${selectedCode}${updatedNumber}`);
    }
  };

  const handleCodeChange = (code) => {
    setSelectedCode(code);
    if (onChange) {
      if (!number.trim()) {
        onChange("");
        return;
      }
      onChange(`${code}${number}`);
    }
  };

  return (
    <Input
      addonBefore={
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
            },
          }}
        >
          <Select
            value={selectedCode}
            onChange={handleCodeChange}
            style={{ width: 90 }}
            disabled={disabled}
          >
            {countryOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </ConfigProvider>
      }
      value={number}
      onChange={handlePhoneChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default PhoneNumberInput;
