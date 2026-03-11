import { useEffect, useState } from "react";
import type { DefineEntry } from "../../types/defines";
import { Box, Button, HStack, Input, InputGroup, InputRightElement, Select, Text, Tooltip } from "@chakra-ui/react";

interface DefineRowProps {
  entry: DefineEntry;
  value: string;
  isModified: boolean;
  error?: string;
  onUpdate: (entry: DefineEntry, raw: string) => void;
  onReset: (entry: DefineEntry) => void;
}

export function DefineRow({ entry, value, isModified, error, onUpdate, onReset }: DefineRowProps) {
  const [liveValue, setLiveValue] = useState(value);

  useEffect(() => {
    setLiveValue(value);
  }, [entry.id, value]);

  const isValidModified = isModified && !error;
  const isNumericInput = entry.type === "integer" || entry.type === "float";
  const defaultNumericValue = typeof entry.defaultValue === "number" ? entry.defaultValue : Number.NaN;
  const currentNumericValue = Number(liveValue);
  const hasNumericDelta =
    isNumericInput &&
    isValidModified &&
    Number.isFinite(defaultNumericValue) &&
    Number.isFinite(currentNumericValue) &&
    currentNumericValue !== defaultNumericValue;
  const isNumericIncrease = hasNumericDelta && currentNumericValue > defaultNumericValue;
  const hasPercentDelta = hasNumericDelta && defaultNumericValue !== 0;
  const percentDelta = hasPercentDelta
    ? ((currentNumericValue - defaultNumericValue) / Math.abs(defaultNumericValue)) * 100
    : 0;
  const formattedPercentDelta = hasPercentDelta
    ? `${percentDelta > 0 ? "+" : ""}${percentDelta.toFixed(1).replace(/\.0$/, "")}%`
    : null;

  const infoText = [
    `Type: ${entry.type}`,
    `Default: ${Array.isArray(entry.defaultValue) ? entry.defaultValue.join(", ") : String(entry.defaultValue)}`,
    entry.aiComment ? `AI: ${entry.aiComment}` : null,
    entry.comment ? `Comment: ${entry.comment}` : null
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  const handleSubmit = (formData: FormData) => {
    const raw = String(formData.get("value") ?? "");
    onUpdate(entry, raw);
  };

  return (
    <Box id={`define-${entry.id}`} borderTop="1px solid" borderColor="borderSecondary" px={4} py={1.5} bg="panelBg">
      <HStack align="center" spacing={2}>
        <Text minW="220px" flex="1" fontSize="sm" fontWeight={500}>{entry.key}</Text>

        <HStack spacing={2} justify="flex-end" flex="0 0 auto">
          <Box as="form" action={handleSubmit}>
            {entry.type === "boolean" ? (
              <Select
                key={`${entry.id}-${value}`}
                id={`input-${entry.id}`}
                name="value"
                defaultValue={value}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                borderWidth={isValidModified ? "2px" : "1px"}
                borderColor={isValidModified ? "brand.gold" : undefined}
                _hover={isValidModified ? { borderColor: "brand.gold" } : undefined}
                _focusVisible={isValidModified ? { borderColor: "brand.gold", boxShadow: "none" } : undefined}
                w="260px"
                size="sm"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            ) : (
              <InputGroup w="260px" size="sm">
                <Input
                  key={`${entry.id}-${value}`}
                  id={`input-${entry.id}`}
                  name="value"
                  type={entry.type === "integer" || entry.type === "float" ? "number" : "text"}
                  step={entry.type === "float" ? "any" : "1"}
                  defaultValue={value}
                  onChange={(event) => {
                    if (isNumericInput) {
                      setLiveValue(event.target.value);
                    }
                  }}
                  onBlur={(event) => event.currentTarget.form?.requestSubmit()}
                  disabled={entry.type === "variable" || entry.type === "expression"}
                  aria-readonly={entry.type === "variable" || entry.type === "expression"}
                  borderWidth={isValidModified ? "2px" : "1px"}
                  borderColor={isValidModified ? "brand.gold" : undefined}
                  _hover={isValidModified ? { borderColor: "brand.gold" } : undefined}
                  _focusVisible={isValidModified ? { borderColor: "brand.gold", boxShadow: "none" } : undefined}
                  pr={hasNumericDelta ? "5.5rem" : undefined}
                />
                {hasNumericDelta ? (
                  <InputRightElement pointerEvents="none" w="auto" pr={2}>
                    <HStack spacing={1}>
                      {formattedPercentDelta ? (
                        <Text color="textSecondary" opacity={0.5} fontSize="xs" lineHeight="1">
                          {formattedPercentDelta}
                        </Text>
                      ) : null}
                      <Text color={isNumericIncrease ? "brand.green" : "brand.red"} opacity={0.5} lineHeight="1">
                        {isNumericIncrease ? "↑" : "↓"}
                      </Text>
                    </HStack>
                  </InputRightElement>
                ) : null}
              </InputGroup>
            )}
          </Box>

          <Tooltip label={<Text whiteSpace="pre-wrap">{infoText}</Text>} hasArrow>
            <Button variant="outline" size="sm" minW="2rem" px={0} aria-label={`Info for ${entry.key}`}>
              i
            </Button>
          </Tooltip>

          <Button variant="outline" size="sm" minW="2rem" px={0} onClick={() => onReset(entry)} isDisabled={!isModified} aria-label={`Reset ${entry.key}`}>
            ↺
          </Button>
        </HStack>
      </HStack>

      {error ? (
        <Text color="brand.red" mt={1} role="alert">
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
