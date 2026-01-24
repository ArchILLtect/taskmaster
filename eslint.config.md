  // Optional: Architecture tightening (OFF by default)
  // If you want pages/components to never call src/api directly (only store/hooks do),
  // add this later.
  {
    files: ["src/pages/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(\\.{1,2}\\/)+api\\/.+$",
              message:
                "Pages/components should not import from src/api directly. Use hooks/store/selectors instead.",
            },
            {
              regex: "^@\\/api\\/.+$",
              message:
                "Pages/components should not import from @/api directly. Use hooks/store/selectors instead.",
            },
          ],
        },
      ],
    },
  },