import type { DefineEntry } from "../../types/defines";
import { Box, Button, HStack, Input, Select, Text, Tooltip } from "@chakra-ui/react";

interface DefineRowProps {
  entry: DefineEntry;
  value: string;
  isModified: boolean;
  error?: string;
  onUpdate: (entry: DefineEntry, raw: string) => void;
  onReset: (entry: DefineEntry) => void;
}

export function DefineRow({ entry, value, isModified, error, onUpdate, onReset }: DefineRowProps) {
  const infoText = [
    `Type: ${entry.type}`,
    `Default: ${Array.isArray(entry.defaultValue) ? entry.defaultValue.join(", ") : String(entry.defaultValue)}`,
    entry.comment ? `Comment: ${entry.comment}` : null
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return (
    <Box id={`define-${entry.id}`} borderTop="1px solid" borderColor={isModified ? "brand.green" : "borderSecondary"} px={4} py={1.5} bg="panelBg">
      <HStack align="center" spacing={2}>
        <Text minW="220px" flex="1" fontSize="sm" fontWeight={500}>{entry.key}</Text>

        <HStack spacing={2} justify="flex-end" flex="0 0 auto">
          {entry.type === "boolean" ? (
            <Select id={`input-${entry.id}`} value={value} onChange={(event) => onUpdate(entry, event.target.value)} w="260px" size="sm">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          ) : (
            <Input
              id={`input-${entry.id}`}
              type={entry.type === "integer" || entry.type === "float" ? "number" : "text"}
              step={entry.type === "float" ? "any" : "1"}
              value={value}
              onChange={(event) => onUpdate(entry, event.target.value)}
              disabled={entry.type === "variable" || entry.type === "expression"}
              aria-readonly={entry.type === "variable" || entry.type === "expression"}
              w="260px"
              size="sm"
            />
          )}

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
