import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: "'EB Garamond', serif",
    body: "Inter, sans-serif"
  },
  colors: {
    brand: {
      gold: "#ffd267",
      silver: "#cfcbb8",
      concept: "#7dc7e3",
      red: "#e36166",
      green: "#59d469"
    },
    surface: {
      900: "#031927",
      800: "#072a3d",
      700: "#0c3a52"
    }
  },
  semanticTokens: {
    colors: {
      textPrimary: { default: "#e0e0e0", _light: "#1a1a1a" },
      textSecondary: { default: "#a0a0a0", _light: "#4d4d4d" },
      borderPrimary: { default: "#1a4d6e", _light: "#cccccc" },
      borderSecondary: { default: "#0c3a52", _light: "#e0e0e0" },
      pageBg: { default: "#031927", _light: "#f5f5f5" },
      panelBg: { default: "#072a3d", _light: "#ffffff" }
    }
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%"
      },
      body: {
        margin: 0,
        bg: "pageBg",
        color: "textPrimary",
        overflow: "hidden"
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "sm"
      },
      variants: {
        outline: {
          borderColor: "borderPrimary",
          color: "textPrimary",
          _hover: {
            borderColor: "brand.gold",
            color: "brand.gold",
            bg: "transparent"
          }
        }
      }
    },
    IconButton: {
      baseStyle: {
        borderRadius: "sm"
      },
      variants: {
        outline: {
          borderColor: "borderPrimary",
          color: "textPrimary",
          _hover: {
            borderColor: "brand.gold",
            color: "brand.gold",
            bg: "transparent"
          }
        }
      }
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "pageBg",
            borderColor: "borderPrimary",
            _focusVisible: {
              borderColor: "brand.gold",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-gold)"
            }
          }
        }
      },
      defaultProps: {
        variant: "outline"
      }
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "pageBg",
            borderColor: "borderPrimary",
            _focusVisible: {
              borderColor: "brand.gold",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-gold)"
            }
          }
        }
      },
      defaultProps: {
        variant: "outline"
      }
    },
    Textarea: {
      variants: {
        outline: {
          bg: "pageBg",
          borderColor: "borderPrimary",
          _focusVisible: {
            borderColor: "brand.gold",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-gold)"
          }
        }
      },
      defaultProps: {
        variant: "outline"
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "panelBg",
          border: "1px solid",
          borderColor: "borderPrimary"
        }
      }
    }
  }
});
