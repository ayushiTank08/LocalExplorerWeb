# NextForge

**Production-grade Turborepo template for Next.js apps.**

A comprehensive Next.js project boilerplate for modern web applications. It is designed to be a solid, opinionated foundation with minimal configuration.

## 🚀 Getting Started

Clone the repo using:

```bash
npx next-forge@latest init
```

Then read the docs for more information.

## 📁 Project Structure

```
nextforge/
├── apps/
│   ├── web/          # Main Next.js application
│   └── docs/         # Documentation site
├── packages/
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configuration
├── package.json      # Root package.json
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## 🛠️ Features

- **Monorepo Architecture**: Built with Turborepo for efficient development
- **Shared UI Components**: Reusable component library with Radix UI primitives
- **TypeScript**: Full TypeScript support across all packages
- **Tailwind CSS**: Modern styling with Tailwind CSS v4
- **ESLint**: Shared linting configuration
- **Next.js 15**: Latest Next.js with App Router
- **pnpm**: Fast, disk space efficient package manager

## 📦 Packages

### Apps

- **web**: Main Next.js application
- **docs**: Documentation site built with Next.js

### Packages

- **@nextforge/ui**: Shared UI component library
- **@nextforge/config**: Shared configuration for TypeScript, ESLint, and Tailwind

## 🎨 UI Components

The `@nextforge/ui` package includes a comprehensive set of components built on top of Radix UI:

- Button, Card, Input, Label
- Dialog, Dropdown Menu, Navigation Menu
- Toast, Tooltip, Popover
- Form components with React Hook Form
- And many more...

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all applications
pnpm build

# Run linting
pnpm lint
```

## 📚 Documentation

Visit the docs app at `http://localhost:3001` to see the documentation site.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for the amazing Next.js framework
- [Turborepo](https://turborepo.com) for the monorepo tooling
- [Radix UI](https://radix-ui.com) for the accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---

Made with ❤️ by the NextForge community 