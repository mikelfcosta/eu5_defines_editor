import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

interface AppErrorBoundaryState {
  error: Error | null;
  componentStack: string;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  public constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      error: null,
      componentStack: ""
    };
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      error,
      componentStack: ""
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ componentStack: errorInfo.componentStack ?? "" });
    console.error("Unhandled app error:", error, errorInfo);
  }

  private readonly resetBoundary = () => {
    this.setState({ error: null, componentStack: "" });
  };

  public render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Box minH="100vh" bg="pageBg" color="textPrimary" display="grid" placeItems="center" p={6}>
        <Box
          as="section"
          maxW="960px"
          w="100%"
          bg="panelBg"
          border="1px solid"
          borderColor="borderPrimary"
          borderRadius="md"
          p={6}
          display="grid"
          gap={4}
        >
          <Text fontSize="2xl" fontWeight={700} color="brand.gold">Something went wrong</Text>
          <Text color="textSecondary">
            The app hit an unexpected error while rendering. You can try to continue or reload the page.
          </Text>

          <HStack spacing={3}>
            <Button colorScheme="yellow" onClick={this.resetBoundary}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Reload page</Button>
          </HStack>

          <Box>
            <Text fontWeight={700} mb={2}>Error</Text>
            <Box
              as="pre"
              bg="surface.800"
              border="1px solid"
              borderColor="borderSecondary"
              borderRadius="md"
              p={4}
              whiteSpace="pre-wrap"
              wordBreak="break-word"
              overflowX="auto"
            >
              {`${this.state.error.name}: ${this.state.error.message}`}
            </Box>
          </Box>

          {this.state.error.stack ? (
            <Box>
              <Text fontWeight={700} mb={2}>Stack Trace</Text>
              <Box
                as="pre"
                bg="surface.800"
                border="1px solid"
                borderColor="borderSecondary"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                overflowX="auto"
              >
                {this.state.error.stack}
              </Box>
            </Box>
          ) : null}

          {this.state.componentStack ? (
            <Box>
              <Text fontWeight={700} mb={2}>Component Stack</Text>
              <Box
                as="pre"
                bg="surface.800"
                border="1px solid"
                borderColor="borderSecondary"
                borderRadius="md"
                p={4}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                overflowX="auto"
              >
                {this.state.componentStack.trim()}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  }
}
