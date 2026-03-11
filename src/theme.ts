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
      textPrimary: { default: "#e0e0e0" },
      textSecondary: { default: "#a0a0a0" },
      borderPrimary: { default: "rgba(26, 77, 110, 0.5)" },
      borderSecondary: { default: "rgba(12, 58, 82, 0.5)" },
      pageBg: { default: "#031927" },
      panelBg: { default: "#051e2f" },
      panelHover: { default: "#072a3d" }
    }
  },
  styles: {
    global: {
      "html, body, #root": {
        height: "100%",
        scrollBehavior: "smooth"
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
        borderRadius: "md",
        fontWeight: "500",
        transition: "all 0.2s cubic-bezier(.08,.52,.52,1)"
      },
      variants: {
        outline: {
          borderColor: "borderPrimary",
          color: "textPrimary",
          _hover: {
            borderColor: "brand.gold",
            color: "brand.gold",
            bg: "whiteAlpha.50",
            transform: "translateY(-1px)",
            boxShadow: "sm"
          },
          _active: {
            bg: "whiteAlpha.100",
            transform: "translateY(0)"
          }
        },
        ghost: {
          _hover: {
            bg: "panelHover"
          }
        }
      }
    },
    IconButton: {
      baseStyle: {
        borderRadius: "md",
        transition: "all 0.2s"
      },
      variants: {
        outline: {
          borderColor: "borderPrimary",
          color: "textPrimary",
          _hover: {
            borderColor: "brand.gold",
            color: "brand.gold",
            bg: "whiteAlpha.50",
            transform: "translateY(-1px)",
            boxShadow: "sm"
          },
          _active: {
            transform: "translateY(0)"
          }
        }
      }
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "panelBg",
            borderColor: "borderPrimary",
            borderRadius: "md",
            _hover: {
              borderColor: "borderSecondary"
            },
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
            bg: "panelBg",
            borderColor: "borderPrimary",
            borderRadius: "md",
            _hover: {
              borderColor: "borderSecondary"
            },
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
          bg: "panelBg",
          borderColor: "borderPrimary",
          borderRadius: "md",
          _hover: {
            borderColor: "borderSecondary"
          },
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
          borderColor: "borderPrimary",
          borderRadius: "xl",
          boxShadow: "xl",
          backdropFilter: "blur(10px)"
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: "panelBg",
          borderRadius: "lg",
          boxShadow: "sm",
          border: "1px solid",
          borderColor: "borderPrimary",
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          _hover: {
            boxShadow: "md"
          }
        }
      }
    }
  }
});
