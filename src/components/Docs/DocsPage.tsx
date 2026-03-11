import ReactMarkdown from "react-markdown";
import { Box, Heading } from "@chakra-ui/react";

interface DocsPageProps {
  title: string;
  markdown: string;
}

export function DocsPage({ title, markdown }: DocsPageProps) {
  return (
    <Box as="article" maxW="880px" bg="panelBg" border="1px solid" borderColor="borderPrimary" borderRadius="md" p={8}>
      <Heading size="lg" color="brand.gold" mb={4}>{title}</Heading>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </Box>
  );
}
