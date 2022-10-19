import 'module-alias/register';
import dotenv from 'dotenv';
import App from './app';
import VoucherController from './handlers/voucher/voucher.controller';
import CustomerController from './handlers/customer/customer.controller';
import Handler from './handlers/handler';

dotenv.config({ path: './.env' });
const port = parseInt(process.env.PORT, 10);

const app = new App(
  [
    new Handler(),
    new VoucherController(),
    new CustomerController(),
  ],
  port,
);

app.listen();
