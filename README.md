# Voucher Code Validation

Voucher validation is application builded from Typescript for celebration campaign to give away 1000
pieces of cash vouchers to its loyal customers.

## Features

- Show customers.
- Show Available vouchers.
- Check eligiblity customer.
- Validation a customer through endpoint.
- Redeem a voucher with some validation.

## Tech

voucher validation uses a number of open source projects to work properly:

- [ExpressJS] - web application framework
- [Prisma] - Next Generation ORM
- [Multer] - File upload middleware.

## Installation

Voucher Validation requires [Node.js](https://nodejs.org/) v16+ to run.

Install the dependencies and devDependencies and start the server.

```sh
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

To serve in development.
```sh
npm run dev
```

## API Documentation

Here it's API documentation for voucher validation.

| Platform | URL |
| ------ | ------ |
| Postman | https://documenter.getpostman.com/view/14628291/2s847MsBD1 |
