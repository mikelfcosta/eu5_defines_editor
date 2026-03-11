import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  Code,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";

interface DocsPageProps {
  title: string;
  markdown: string;
}

const markdownComponents = {
  table: (props: any) => <Table variant="simple" size="sm" {...props} />,
  thead: (props: any) => <Thead {...props} />,
  tbody: (props: any) => <Tbody {...props} />,
  tr: (props: any) => <Tr {...props} />,
  th: (props: any) => <Th borderBottom="1px solid" borderColor="borderSecondary" {...props} />,
  td: (props: any) => <Td borderBottom="1px solid" borderColor="borderSecondary" {...props} />,
  p: (props: any) => <Text as="p" mb={4} {...props} />,
  code: (props: any) => (
    <Code
      fontSize="0.9em"
      fontFamily="mono"
      px={1}
      py="2px"
      borderRadius="sm"
      bg="whiteAlpha.200"
      color="textPrimary"
      {...props}
    />
  ),
  pre: (props: any) => (
    <Box
      as="pre"
      bg="surface.800"
      p={4}
      borderRadius="md"
      mb={4}
      overflowX="auto"
      border="1px solid"
      borderColor="borderSecondary"
      sx={{
        "& code": {
          background: "transparent",
          padding: 0,
          borderRadius: 0,
          color: "inherit",
          fontSize: "0.95em",
          whiteSpace: "pre"
        }
      }}
      {...props}
    />
  )
};

export function DocsPage({ title, markdown }: DocsPageProps) {
  return (
    <Box as="article" maxW="880px" bg="panelBg" border="1px solid" borderColor="borderPrimary" borderRadius="md" p={8}>
      <Heading size="lg" color="brand.gold" mb={4}>{title}</Heading>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </Box>
  );
}
