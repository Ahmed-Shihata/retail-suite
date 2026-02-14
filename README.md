### Retail

Retail Suite Backend is a powerful and flexible backend solution built on the Frappe Framework, designed to manage both POS (Point of Sale) systems and eCommerce websites. It provides seamless integration for retail operations, including inventory management, order processing, customer data management, and sales analytics. Ideal for businesses looking to unify in-store and online sales under a single backend system

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app retail
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/retail
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
